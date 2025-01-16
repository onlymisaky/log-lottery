export class IndexDBError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IndexDBError'
  }
}

export class ConnectionError extends IndexDBError {
  constructor(message: string) {
    super(message)
    this.name = 'ConnectionError'
  }
}

export class QueryError extends IndexDBError {
  constructor(message: string) {
    super(message)
    this.name = 'QueryError'
  }
}

export class StoreError extends IndexDBError {
  constructor(message: string) {
    super(message)
    this.name = 'StoreError'
  }
}

export class TransactionError extends IndexDBError {
  constructor(message: string) {
    super(message)
    this.name = 'TransactionError'
  }
} 