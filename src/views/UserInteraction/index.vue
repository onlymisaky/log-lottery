<script setup lang='ts'>
import { onMounted, ref } from 'vue'

const wsUser = ref<WebSocket | null>(null)
const text = ref('')
function init() {
  wsUser.value = new WebSocket('ws://172.20.212.191:3012/user')
  wsUser.value.onopen = () => {
    console.log('wsUser.value.onopen')
  }
  wsUser.value.onmessage = (msg: MessageEvent) => {
    console.log('code line-18 \n\r😁 msg:\n\r', msg)
  }
  wsUser.value.onclose = () => {
    console.log('wsUser.value.onclose')
  }
  wsUser.value.onerror = () => {
  }
}
function submit() {
  if (wsUser.value) {
    wsUser.value.send(text.value)
  }
}
onMounted(() => {
  init()
})
</script>

<template>
  <div>
    <label class="form-control">
      <textarea v-model="text" class="textarea textarea-bordered h-24" placeholder="Bio" />
      <div class="label">
        <span class="label-text-alt">最多输入100字</span>
      </div>
    </label>
    <button class="btn btn-primary" @click="submit">
      提交
    </button>
  </div>
</template>

<style lang='scss' scoped>

</style>
