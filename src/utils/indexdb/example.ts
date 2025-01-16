import { IndexDB } from './index'

export async function example() {
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
    },
  }, {
    maxConnections: 5, // 最大连接数
    minConnections: 2, // 最小连接数
    acquireTimeout: 5000, // 获取连接超时时间（毫秒）
    idleTimeout: 30000, // 空闲连接超时时间（毫秒）
  })

  // 获取 Store 并使用
  const userStore = await db.getStore<User>('users')

  // 批量保存
  await userStore.saveMany([
    { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
    { id: 2, name: '李四', email: 'lisi@example.com', age: 30 },
  ])

  // 批量查询
  const users = await userStore.findMany([1, 2])

  // 批量更新
  await userStore.updateMany([
    { id: 1, name: '张三改' },
    { id: 2, name: '李四改' },
  ])

  // 批量删除
  await userStore.removeMany([1, 2])

  // 按索引批量删除
  await userStore.clearByIndex('age', IDBKeyRange.bound(20, 30))

  // 使用完后关闭数据库连接
  await db.close()

  return users
}
