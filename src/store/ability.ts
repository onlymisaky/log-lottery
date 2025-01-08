import { IWsStatus } from '@/types/storeType'
import { defineStore } from 'pinia'

export const useAbility = defineStore('ability', {
  state() {
    return {
      wsStatus: IWsStatus.CLOSE, // 0 未连接 1 已连接 2 连接中
    }
  },
  getters: {
    getWsStatus(state) {
      return state.wsStatus
    },
  },
  actions: {
    setWsStatus(wsStatus: IWsStatus) {
      this.wsStatus = wsStatus
    },

  },
})
