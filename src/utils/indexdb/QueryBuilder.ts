import type { IStore } from './types'

export class QueryBuilder<T extends { [key: string]: any }> {
  private store: IStore<T>
  private range: IDBKeyRange | null = null
  private indexName: string | null = null
  private limitValue: number | null = null
  private offsetValue: number | null = null
  private direction: IDBCursorDirection = 'next'

  constructor(store: IStore<T>) {
    this.store = store
  }

  where(key: IDBValidKey | IDBKeyRange) {
    if (key instanceof IDBKeyRange) {
      this.range = key
    }
    else {
      this.range = IDBKeyRange.only(key)
    }
    return this
  }

  index(indexName: string) {
    this.indexName = indexName
    return this
  }

  limit(limit: number) {
    this.limitValue = limit
    return this
  }

  offset(offset: number) {
    this.offsetValue = offset
    return this
  }

  orderBy(direction: 'asc' | 'desc' = 'asc') {
    this.direction = direction === 'asc' ? 'next' : 'prev'
    return this
  }

  async getMany(): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      const results: T[] = []
      let count = 0
      let skipped = 0

      const store = (this.store as any).getStore()
      const source = this.indexName ? store.index(this.indexName) : store
      const request = source.openCursor(this.range, this.direction)

      request.onsuccess = () => {
        const cursor = request.result
        if (!cursor) {
          resolve(results)
          return
        }

        if (this.offsetValue && skipped < this.offsetValue) {
          skipped++
          cursor.continue()
          return
        }

        if (this.limitValue && count >= this.limitValue) {
          resolve(results)
          return
        }

        results.push(cursor.value)
        count++
        cursor.continue()
      }

      request.onerror = () => reject(new Error('查询失败'))
    })
  }

  async getOne(): Promise<T | undefined> {
    const results = await this.limit(1).getMany()
    return results[0]
  }
}
