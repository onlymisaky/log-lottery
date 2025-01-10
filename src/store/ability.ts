import { IWsStatus } from '@/types/storeType'
import { defineStore } from 'pinia'

export const useAbility = defineStore('ability', {
  state() {
    return {
      wsStatus: IWsStatus.CLOSE, // 0 未连接 1 已连接 2 连接中
      wsIp: '',
    }
  },
  getters: {
    getWsStatus(state) {
      return state.wsStatus
    },
    getWsIp(state) {
      return state.wsIp
    },
  },
  actions: {
    setWsStatus(wsStatus: IWsStatus) {
      this.wsStatus = wsStatus
    },
    setWsIp(wsIp: string) {
      this.wsIp = wsIp
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        // 如果要存储在localStorage中
        storage: localStorage,
        key: 'abilityConfig',
      },
    ],
  },
})
