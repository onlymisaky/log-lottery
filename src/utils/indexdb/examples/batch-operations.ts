import { IndexDB } from '../'

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock: number
}

export async function batchOperationsExample() {
  const db = new IndexDB({
    name: 'batchExample',
    version: 1,
    stores: {
      products: {
        keyPath: 'id',
        indexes: [
          { name: 'category', keyPath: 'category' },
          { name: 'price', keyPath: 'price' },
        ],
      },
    },
  })

  try {
    const productStore = await db.getStore<Product>('products')

    // 1. 批量保存
    console.log('\n1. 批量保存商品:')
    const savedProducts = await productStore.saveMany([
      { id: 1, name: '商品1', price: 100, category: '电子', stock: 10 },
      { id: 2, name: '商品2', price: 200, category: '电子', stock: 20 },
      { id: 3, name: '商品3', price: 300, category: '服装', stock: 30 },
      { id: 4, name: '商品4', price: 400, category: '服装', stock: 40 },
    ])
    console.log('保存成功:', savedProducts)

    // 2. 批量查询
    console.log('\n2. 批量查询指定ID的商品:')
    const products = await productStore.findMany([1, 2])
    console.log('查询结果:', products)

    // 3. 批量更新
    console.log('\n3. 批量更新商品价格:')
    const updatedProducts = await productStore.updateMany([
      { id: 1, price: 150 },
      { id: 2, price: 250 },
    ])
    console.log('更新后的商品:', updatedProducts)

    // 4. 使用索引批量操作
    console.log('\n4. 清除所有价格在100-300之间的商品:')
    await productStore.clearByIndex('price', IDBKeyRange.bound(100, 300))
    
    // 验证清除结果
    const remainingProducts = await productStore.find()
    console.log('剩余商品:', remainingProducts)

    // 5. 批量删除
    console.log('\n5. 批量删除指定ID的商品:')
    await productStore.removeMany([3, 4])
    
    // 验证最终结果
    const finalProducts = await productStore.find()
    console.log('最终商品列表:', finalProducts)

  } catch (error) {
    console.error('批量操作失败:', error)
  } finally {
    await db.close()
  }
} 