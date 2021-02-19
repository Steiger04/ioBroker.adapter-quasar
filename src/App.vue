<template>
  <div
    v-if="loaded"
    id="q-app"
  >
    <router-view/>
  </div>
  <div
    v-else
    class="fixed-center"
  >
    <q-circular-progress
      indeterminate
      show-value
      font-size="10px"
      class="q-ma-md"
      size="300px"
      :thickness="0.15"
      color="light-blue-7"
      track-color="grey-3"
    >
      <q-avatar size="200px">
        <img src="~assets/iobroker-progress.png"/>
      </q-avatar>
    </q-circular-progress>
  </div>
</template>

<script>
import { defineComponent, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useInit } from './js/initApp'

export default defineComponent({
  name: 'App',
  setup () {
    const { settings, connected, loaded, socket, instanceId } = useInit()

    if (!settings.doNotLoadAllStates) {
      // subscribe all Instance States
      watch(connected, () => connected.value && socket.subscribeState(instanceId + '*'))
      onUnmounted(() => connected.value && socket.unsubscribeState(instanceId + '*'))
    }

    const $q = useQuasar()
    $q.notify.setDefaults({ type: 'negative', timeout: 3000, position: 'top', classes: 'glossy' })
    const { errorText } = useInit()
    watch(errorText, (errorMsg) => {
      if (errorMsg) {
        $q.notify(errorMsg)
        errorText.value = ''
      }
    })

    return { loaded }
  }
})
</script>
