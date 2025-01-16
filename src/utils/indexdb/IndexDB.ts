import type { IndexDBOptions, PoolConfig } from './types'
import { ConnectionPool } from './ConnectionPool'
import { Store } from './Store'
import { ConnectionError } from './errors'
import { DB_ERROR_MESSAGES } from './constants'

export class IndexDB {
  private pool: ConnectionPool

  constructor(options: IndexDBOptions, poolConfig?: Partial<PoolConfig>) {
    this.pool = new ConnectionPool(options, poolConfig)
  }

  async getStore<T extends { [key: string]: any }>(storeName: string): Promise<Store<T>> {
    try {
      const connection = await this.pool.acquire()
      return new Store<T>(connection.db, storeName, () => {
        this.pool.release(connection)
      })
    } catch (error) {
      throw new ConnectionError(
        error instanceof Error
          ? error.message
          : DB_ERROR_MESSAGES.CONNECTION_FAILED
      )
    }
  }

  async close() {
    await this.pool.close()
  }
} 