<script setup lang='ts'>
import useStore from '@/store'
import { IWsStatus } from '@/types/storeType'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import vueDanmaku from 'vue3-danmaku'
import { useI18n } from 'vue-i18n'

interface Bullet {
  text: string
  time: string
}
const bullets = ref<Bullet[]>([])
const bulletChannel = ref(6)
const bulletTop = ref(10)
const wsClient = ref<WebSocket | null>(null)
const abilityConfig = useStore().ability
const { getWsStatus: wsStatus } = storeToRefs(abilityConfig)
function init() {
  if (wsStatus.value !== IWsStatus.OPENING) {
    return false
  }
  wsClient.value = new WebSocket('ws://172.20.212.191:3012/client')
  wsClient.value.onopen = () => {
    abilityConfig.setWsStatus(1)
  }
  wsClient.value.onmessage = (msg: MessageEvent) => {
    bullets.value.push(msg.data)
  }
  wsClient.value.onclose = () => {
    wsClient.value = null
    abilityConfig.setWsStatus(0)
  }
  wsClient.value.onerror = () => {
    wsClient.value = null
    abilityConfig.setWsStatus(0)
  }
}
watch(wsStatus, (val: IWsStatus) => {
  if (val === IWsStatus.OPENING) {
    init()
  }
})
onMounted(() => {
  wsClient.value = null
  abilityConfig.setWsStatus(0)
})
</script>

<template>
  <div class="absolute">
    <vue-danmaku v-model:danmus="bullets" v-model:channels="bulletChannel" v-model:top="bulletTop" class="w-screen h-96">
      <template #dm="{ item }">
        <span>{{ item }}ppppppppppppppp</span>
      </template>
    </vue-danmaku>
  </div>
</template>

<style lang='scss' scoped>

</style>
