import { IndexDB } from '../'

interface User {
  id: number
  name: string
  email: string
  age: number
  department: string
}

export async function queryBuilderExample() {
  const db = new IndexDB({
    name: 'queryBuilderExample',
    version: 1,
    stores: {
      users: {
        keyPath: 'id',
        indexes: [
          { name: 'email', keyPath: 'email' },
          { name: 'age', keyPath: 'age' },
          { name: 'department', keyPath: 'department' },
        ],
      },
    },
  })

  try {
    const userStore = await db.getStore<User>('users')

    // 准备测试数据
    await userStore.saveMany([
      { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25, department: '技术部' },
      { id: 2, name: '李四', email: 'lisi@example.com', age: 30, department: '技术部' },
      { id: 3, name: '王五', email: 'wangwu@example.com', age: 35, department: '市场部' },
      { id: 4, name: '赵六', email: 'zhaoliu@example.com', age: 28, department: '市场部' },
    ])

    // 1. 使用索引进行范围查询
    console.log('\n1. 年龄在25-30岁之间的用户:')
    const usersByAge = await userStore
      .createQueryBuilder()
      .index('age')
      .where(IDBKeyRange.bound(25, 30))
      .getMany()
    console.log(usersByAge)

    // 2. 使用排序和限制
    console.log('\n2. 按年龄降序排列，获取前2名:')
    const topUsers = await userStore
      .createQueryBuilder()
      .index('age')
      .orderBy('desc')
      .limit(2)
      .getMany()
    console.log(topUsers)

    // 3. 使用偏移和分页
    console.log('\n3. 分页查询，每页2条，第2页:')
    const pagedUsers = await userStore
      .createQueryBuilder()
      .index('age')
      .orderBy('asc')
      .offset(2)
      .limit(2)
      .getMany()
    console.log(pagedUsers)

    // 4. 精确匹配查询
    console.log('\n4. 查询技术部的所有用户:')
    const techUsers = await userStore
      .createQueryBuilder()
      .index('department')
      .where('技术部')
      .getMany()
    console.log(techUsers)

    // 5. 获取单个结果
    console.log('\n5. 通过邮箱查找单个用户:')
    const singleUser = await userStore
      .createQueryBuilder()
      .index('email')
      .where('zhangsan@example.com')
      .getOne()
    console.log(singleUser)

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await db.close()
  }
} 