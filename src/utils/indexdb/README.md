# IndexDB 工具库

一个类型安全的 IndexDB 封装库，提供连接池管理和类 TypeORM 风格的 API。

## 特性

- 🚀 完整的 TypeScript 支持
- 🔄 连接池管理
- 🔍 类 TypeORM 风格的查询构建器
- 📦 批量操作支持
- 🔒 事务安全
- 🎯 索引支持

## 安装

```bash
# 项目内部使用，无需安装
```

## 基本使用

```typescript
import { IndexDB } from './index'

// 定义数据类型
interface User {
  id: number
  name: string
  email: string
  age: number
}

// 创建数据库实例
const db = new IndexDB({
  name: 'myApp',
  version: 1,
  stores: {
    users: {
      keyPath: 'id',
      indexes: [
        { name: 'email', keyPath: 'email' },
        { name: 'age', keyPath: 'age' },
      ],
    },
  }
})

// 获取 Store
const userStore = await db.getStore<User>('users')

// 保存数据
await userStore.save({ id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 })

// 查询数据
const user = await userStore.findOne(1)

// 使用查询构建器
const users = await userStore
  .createQueryBuilder()
  .index('age')
  .where(IDBKeyRange.bound(20, 30))
  .orderBy('desc')
  .limit(10)
  .getMany()
```

## API 文档

### IndexDB 类

主要的数据库管理类。

```typescript
class IndexDB {
  constructor(options: IndexDBOptions, poolConfig?: Partial<PoolConfig>)
  getStore<T>(storeName: string): Promise<Store<T>>
  close(): Promise<void>
}
```

### Store 类

数据存储操作类。

```typescript
class Store<T> {
  save(entity: T): Promise<T>
  saveMany(entities: T[]): Promise<T[]>
  findOne(key: IDBValidKey): Promise<T | undefined>
  find(): Promise<T[]>
  remove(key: IDBValidKey): Promise<void>
  // ... 更多方法
}
```

### QueryBuilder 类

查询构建器。

```typescript
class QueryBuilder<T> {
  where(key: IDBValidKey | IDBKeyRange): QueryBuilder<T>
  index(indexName: string): QueryBuilder<T>
  limit(limit: number): QueryBuilder<T>
  offset(offset: number): QueryBuilder<T>
  orderBy(direction: 'asc' | 'desc'): QueryBuilder<T>
  getMany(): Promise<T[]>
  getOne(): Promise<T | undefined>
}
```

## 高级用法

### 连接池配置

```typescript
const db = new IndexDB({
  // ... 数据库配置
}, {
  maxConnections: 5, // 最大连接数
  minConnections: 2, // 最小连接数
  acquireTimeout: 5000, // 获取连接超时时间（毫秒）
  idleTimeout: 30000 // 空闲连接超时时间（毫秒）
})
```

### 批量操作

```typescript
// 批量保存
await userStore.saveMany([
  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
  { id: 2, name: '李四', email: 'lisi@example.com', age: 30 }
])

// 批量查询
const users = await userStore.findMany([1, 2])

// 批量删除
await userStore.removeMany([1, 2])
```

### 索引查询

```typescript
// 使用索引进行范围查询
const users = await userStore
  .createQueryBuilder()
  .index('age')
  .where(IDBKeyRange.bound(20, 30))
  .getMany()
```

## 错误处理

库提供了一系列自定义错误类：

- `IndexDBError`: 基础错误类
- `ConnectionError`: 连接相关错误
- `QueryError`: 查询相关错误
- `StoreError`: 存储相关错误
- `TransactionError`: 事务相关错误

```typescript
try {
  await userStore.save(user)
}
catch (error) {
  if (error instanceof StoreError) {
    // 处理存储错误
  }
}
```

## 注意事项

1. 使用完数据库后记得调用 `close()` 方法关闭连接
2. 批量操作时注意数据量，避免一次性处理过多数据
3. 合理使用索引提高查询性能
4. 注意处理异步操作的错误

## 贡献指南

1. Fork 本仓库
2. 创建特性分支
3. 提交变更
4. 发起 Pull Request

## 许可证

MIT
