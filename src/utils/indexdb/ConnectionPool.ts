import type { IndexDBOptions, PoolConfig } from './types'

// 连接包装器
class Connection {
  db: IDBDatabase
  lastUsed: number
  isIdle: boolean

  constructor(db: IDBDatabase) {
    this.db = db
    this.lastUsed = Date.now()
    this.isIdle = true
  }

  markUsed() {
    this.lastUsed = Date.now()
    this.isIdle = false
  }

  markIdle() {
    this.isIdle = true
  }
}

// 连接池管理器
export class ConnectionPool {
  private connections: Connection[] = []
  private waitingQueue: ((connection: Connection) => void)[] = []
  private config: PoolConfig
  private options: IndexDBOptions
  private maintenanceInterval: number

  constructor(options: IndexDBOptions, config: Partial<PoolConfig> = {}) {
    this.options = options
    this.config = {
      maxConnections: config.maxConnections || 5,
      minConnections: config.minConnections || 2,
      acquireTimeout: config.acquireTimeout || 5000,
      idleTimeout: config.idleTimeout || 30000,
    }

    // 初始化最小连接数
    this.initializeMinConnections()

    // 启动维护任务
    this.maintenanceInterval = window.setInterval(() => {
      this.maintenance()
    }, 5000)
  }

  private async initializeMinConnections() {
    const initialConnections = Array.from({ length: this.config.minConnections })
      .map(() => this.createConnection())
    await Promise.all(initialConnections)
  }

  private async createConnection(): Promise<Connection> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.options.name, this.options.version)

      request.onerror = () => reject(new Error('数据库连接失败'))

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const connection = new Connection(db)
        this.connections.push(connection)
        resolve(connection)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        Object.entries(this.options.stores).forEach(([storeName, config]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: config.keyPath })
            config.indexes?.forEach((index) => {
              store.createIndex(index.name, index.keyPath, index.options)
            })
          }
        })
      }
    })
  }

  // 获取连接
  async acquire(): Promise<Connection> {
    // 查找空闲连接
    const idleConnection = this.connections.find(conn => conn.isIdle)
    if (idleConnection) {
      idleConnection.markUsed()
      return idleConnection
    }

    // 如果没有空闲连接且未达到最大连接数，创建新连接
    if (this.connections.length < this.config.maxConnections) {
      const connection = await this.createConnection()
      connection.markUsed()
      return connection
    }

    // 如果达到最大连接数，进入等待队列
    return new Promise((resolve, reject) => {
      let timeoutId: number

      const callback = (connection: Connection) => {
        window.clearTimeout(timeoutId)
        connection.markUsed()
        resolve(connection)
      }

      timeoutId = window.setTimeout(() => {
        const index = this.waitingQueue.findIndex(cb => cb === callback)
        if (index !== -1) {
          this.waitingQueue.splice(index, 1)
          reject(new Error('获取连接超时'))
        }
      }, this.config.acquireTimeout)

      this.waitingQueue.push(callback)
    })
  }

  // 释放连接
  release(connection: Connection) {
    connection.markIdle()

    // 如果有等待的请求，立即分配给它们
    const callback = this.waitingQueue.shift()
    if (callback) {
      callback(connection)
    }
  }

  // 维护连接池
  private maintenance() {
    const now = Date.now()

    // 清理空闲超时的连接
    this.connections = this.connections.filter((connection) => {
      if (connection.isIdle
        && now - connection.lastUsed > this.config.idleTimeout
        && this.connections.length > this.config.minConnections) {
        connection.db.close()
        return false
      }
      return true
    })
  }

  // 关闭连接池
  async close() {
    window.clearInterval(this.maintenanceInterval)
    this.connections.forEach((connection) => {
      connection.db.close()
    })
    this.connections = []
    this.waitingQueue = []
  }
}
