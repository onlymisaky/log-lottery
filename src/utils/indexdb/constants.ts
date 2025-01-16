export const DEFAULT_POOL_CONFIG = {
  maxConnections: 5,
  minConnections: 2,
  acquireTimeout: 5000,
  idleTimeout: 30000,
} as const

export const DB_ERROR_MESSAGES = {
  CONNECTION_FAILED: '数据库连接失败',
  STORE_NOT_FOUND: '存储对象未找到',
  TRANSACTION_FAILED: '事务执行失败',
  SAVE_FAILED: '保存失败',
  QUERY_FAILED: '查询失败',
  DELETE_FAILED: '删除失败',
  UPDATE_FAILED: '更新失败',
  BATCH_SAVE_FAILED: '批量保存失败',
  BATCH_DELETE_FAILED: '批量删除失败',
  BATCH_UPDATE_FAILED: '批量更新失败',
  BATCH_QUERY_FAILED: '批量查询失败',
  CONNECTION_TIMEOUT: '获取连接超时',
  INDEX_NOT_FOUND: '索引未找到',
} as const

export const DB_TRANSACTION_MODES = {
  READ_ONLY: 'readonly' as const,
  READ_WRITE: 'readwrite' as const,
} as const

export const CURSOR_DIRECTION = {
  NEXT: 'next' as const,
  PREV: 'prev' as const,
} as const 