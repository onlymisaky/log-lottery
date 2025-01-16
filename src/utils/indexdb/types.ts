export interface IndexDBOptions {
  name: string
  version: number
  stores: {
    [key: string]: {
      keyPath: string
      indexes?: { name: string, keyPath: string, options?: IDBIndexParameters }[]
    }
  }
}

// 连接池配置接口
export interface PoolConfig {
  maxConnections: number // 最大连接数
  minConnections: number // 最小连接数
  acquireTimeout: number // 获取连接超时时间（毫秒）
  idleTimeout: number // 空闲连接超时时间（毫秒）
}

export interface IStore<T extends { [key: string]: any }> {
  save: (entity: T) => Promise<T>
  saveMany: (entities: T[]) => Promise<T[]>
  findOne: (key: IDBValidKey) => Promise<T | undefined>
  find: () => Promise<T[]>
  findMany: (keys: IDBValidKey[]) => Promise<T[]>
  update: (entity: T) => Promise<T>
  updateMany: (entities: T[]) => Promise<T[]>
  count: () => Promise<number>
  remove: (key: IDBValidKey) => Promise<void>
  removeMany: (keys: IDBValidKey[]) => Promise<void>
  clearByIndex: (indexName: string, range: IDBKeyRange) => Promise<void>
  createQueryBuilder: () => IQueryBuilder<T>

}

export interface IQueryBuilder<T extends { [key: string]: any }> {
  where: (key: IDBValidKey | IDBKeyRange) => IQueryBuilder<T>
  index: (indexName: string) => IQueryBuilder<T>
  limit: (limit: number) => IQueryBuilder<T>
  offset: (offset: number) => IQueryBuilder<T>
  orderBy: (direction: 'asc' | 'desc') => IQueryBuilder<T>
  getMany: () => Promise<T[]>
  getOne: () => Promise<T | undefined>
}
