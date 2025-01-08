<script setup lang='ts'>
import useStore from '@/store'
import { IWsStatus } from '@/types/storeType'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const abilityConfig = useStore().ability
const { getWsStatus: wsStatus } = storeToRefs(abilityConfig)

function toggleWebserver(status: IWsStatus) {
  if (status !== IWsStatus.CLOSE) {
    return false
  }
  abilityConfig.setWsStatus(IWsStatus.OPENING)
}
</script>

<template>
  <div>
    <h2>{{ t('viewTitle.AbilityConfig') }}</h2>
    <label class="flex flex-row items-center w-full gap-24 mb-10 form-control">
      <div class="">
        <div class="label">
          <span class="label-text">{{ t('table.barrage') }}</span>
        </div>
        <button class="btn btn-sm btn-accent" @click="toggleWebserver(wsStatus)">
          <div v-if="wsStatus === IWsStatus.OPEN" class="h-4 w-4 relative flex justify-center items-center">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span class="absolute inline-flex rounded-full h-3 w-3 bg-green-500" />
          </div>
          <div v-if="wsStatus === IWsStatus.OPENING" class="h-4 w-4 relative flex justify-center items-center">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75" />
            <span class="absolute inline-flex rounded-full h-3 w-3 bg-gray-500" />
          </div>
          <div v-if="wsStatus === IWsStatus.CLOSE" class="h-4 w-4 relative flex justify-center items-center">
            <span class="absolute inline-flex rounded-full h-3 w-3 bg-red-500" />
          </div>
          {{ t('table.barrage') }}
        </button>
      </div>
    </label>
  </div>
</template>

<style lang='scss' scoped>

</style>
