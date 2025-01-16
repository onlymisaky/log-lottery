/* eslint-disable no-console */
import { basicExample } from './basic'
import { batchOperationsExample } from './batch-operations'
import { queryBuilderExample } from './query-builder'

// 运行所有示例
export async function runAllExamples() {
  console.log('=== 运行基础示例 ===')
  await basicExample()

  console.log('\n=== 运行查询构建器示例 ===')
  await queryBuilderExample()

  console.log('\n=== 运行批量操作示例 ===')
  await batchOperationsExample()
}
