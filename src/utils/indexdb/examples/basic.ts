/* eslint-disable no-console */
import { IndexDB } from '../'

// 定义用户类型
interface User {
  id: number
  name: string
  email: string
  age: number
}

export async function basicExample() {
  // 创建数据库实例
  const db = new IndexDB({
    name: 'basicExample',
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
  })

  try {
    // 获取 Store
    const userStore = await db.getStore<User>('users')

    // 基本 CRUD 操作
    // 1. 创建
    await userStore.save({
      id: 1,
      name: '张三',
      email: 'zhangsan@example.com',
      age: 25,
    })

    // 2. 查询
    const user = await userStore.findOne(1)
    console.log('查询结果:', user)

    // 3. 更新
    if (user) {
      user.age = 26
      await userStore.save(user)
    }

    // 4. 删除
    await userStore.remove(1)

    // 5. 查询所有
    const allUsers = await userStore.find()
    console.log('所有用户:', allUsers)
  }
  catch (error) {
    console.error('操作失败:', error)
  }
  finally {
    // 关闭数据库连接
    await db.close()
  }
}
