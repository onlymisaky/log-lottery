import type { IQueryBuilder, IStore } from './types'
import { QueryBuilder } from './QueryBuilder'

export class Store<T extends { [key: string]: any }> implements IStore<T> {
  private db: IDBDatabase
  private storeName: string
  private transaction: IDBTransaction | null = null
  private releaseConnection: () => void

  constructor(db: IDBDatabase, storeName: string, releaseConnection: () => void) {
    this.db = db
    this.storeName = storeName
    this.releaseConnection = releaseConnection
  }

  private getStore(mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    this.transaction = this.db.transaction(this.storeName, mode)
    return this.transaction.objectStore(this.storeName)
  }

  private async withConnection<R>(operation: () => Promise<R>): Promise<R> {
    try {
      const result = await operation()
      this.releaseConnection()
      return result
    }
    catch (error) {
      this.releaseConnection()
      throw error
    }
  }

  async save(entity: T): Promise<T> {
    return this.withConnection(async () => {
      return new Promise<T>((resolve, reject) => {
        const store = this.getStore('readwrite')
        const request = store.put(entity)
        request.onsuccess = () => resolve(entity)
        request.onerror = () => reject(new Error('保存失败'))
      })
    })
  }

  async saveMany(entities: T[]): Promise<T[]> {
    return this.withConnection(async () => {
      return new Promise<T[]>((resolve, reject) => {
        const store = this.getStore('readwrite')
        const savedEntities: T[] = []
        let completed = 0

        entities.forEach((entity) => {
          const request = store.put(entity)

          request.onsuccess = () => {
            savedEntities.push(entity)
            completed++

            if (completed === entities.length) {
              resolve(savedEntities)
            }
          }

          request.onerror = (error) => {
            reject(new Error(`批量保存失败: ${error}`))
          }
        })

        if (entities.length === 0) {
          resolve([])
        }
      })
    })
  }

  async findOne(key: IDBValidKey): Promise<T | undefined> {
    return this.withConnection(async () => {
      return new Promise<T | undefined>((resolve, reject) => {
        const store = this.getStore()
        const request = store.get(key)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(new Error('查询失败'))
      })
    })
  }

  async find(): Promise<T[]> {
    return this.withConnection(async () => {
      return new Promise<T[]>((resolve, reject) => {
        const store = this.getStore()
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(new Error('查询失败'))
      })
    })
  }

  async findMany(keys: IDBValidKey[]): Promise<T[]> {
    return this.withConnection(async () => {
      return new Promise<T[]>((resolve, reject) => {
        const store = this.getStore()
        const results: T[] = []
        let completed = 0
        let hasError = false

        keys.forEach((key) => {
          const request = store.get(key)

          request.onsuccess = () => {
            if (request.result) {
              results.push(request.result)
            }
            completed++
            if (completed === keys.length && !hasError) {
              resolve(results)
            }
          }

          request.onerror = (error) => {
            hasError = true
            reject(new Error(`批量查询失败: ${error}`))
          }
        })

        if (keys.length === 0) {
          resolve([])
        }
      })
    })
  }

  async count(): Promise<number> {
    return this.withConnection(async () => {
      return new Promise<number>((resolve, reject) => {
        const store = this.getStore()
        const request = store.count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(new Error('计数失败'))
      })
    })
  }

  async update(entity: Partial<T>): Promise<T> {
    return this.withConnection(async () => {
      return new Promise<T>((resolve, reject) => {
        const store = this.getStore('readwrite')
        const request = store.put(entity)
        request.onsuccess = () => resolve(entity as T)
        request.onerror = () => reject(new Error('更新失败'))
      })
    })
  }

  async updateMany(entities: Partial<T>[]): Promise<T[]> {
    return this.withConnection(async () => {
      return new Promise<T[]>((resolve, reject) => {
        const store = this.getStore('readwrite')
        const updatedEntities: T[] = []
        let completed = 0
        let hasError = false

        entities.forEach((entity) => {
          const request = store.put(entity)

          request.onsuccess = () => {
            if (request.result) {
              updatedEntities.push(request.result as unknown as T)
            }
            completed++
            if (completed === entities.length && !hasError) {
              resolve(updatedEntities)
            }
          }

          request.onerror = (error) => {
            hasError = true
            reject(new Error(`批量更新失败: ${error}`))
          }
        })

        if (entities.length === 0) {
          resolve([])
        }
      })
    })
  }

  async remove(key: IDBValidKey): Promise<void> {
    return this.withConnection(async () => {
      return new Promise<void>((resolve, reject) => {
        const store = this.getStore('readwrite')
        const request = store.delete(key)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('删除失败'))
      })
    })
  }

  async removeMany(keys: IDBValidKey[]): Promise<void> {
    return this.withConnection(async () => {
      return new Promise<void>((resolve, reject) => {
        const store = this.getStore('readwrite')
        let completed = 0
        let hasError = false

        keys.forEach((key) => {
          const request = store.delete(key)

          request.onsuccess = () => {
            completed++
            if (completed === keys.length && !hasError) {
              resolve()
            }
          }

          request.onerror = (error) => {
            hasError = true
            reject(new Error(`批量删除失败: ${error}`))
          }
        })

        if (keys.length === 0) {
          resolve()
        }
      })
    })
  }

  async clearByIndex(indexName: string, range: IDBKeyRange): Promise<void> {
    return this.withConnection(async () => {
      return new Promise<void>((resolve, reject) => {
        const store = this.getStore('readwrite')
        const index = store.index(indexName)
        const request = index.openCursor(range)

        request.onsuccess = () => {
          const cursor = request.result
          if (cursor) {
            cursor.delete()
            cursor.continue()
          }
          else {
            resolve()
          }
        }

        request.onerror = () => {
          reject(new Error('批量清除失败'))
        }
      })
    })
  }

  createQueryBuilder(): IQueryBuilder<T> {
    return new QueryBuilder<T>(this)
  }
}
