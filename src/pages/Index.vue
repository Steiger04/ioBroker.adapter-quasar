<template>
  <q-page>
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="simple" label="Simpel"/>
      <q-tab name="addresses" label="Adressen"/>
    </q-tabs>

    <q-separator/>

    <q-tab-panels
      style="background-color: transparent;"
      v-model="tab"
      keep-alive
      animated
    >
      <q-tab-panel class="flex flex-center" name="simple">
        <simple/>
      </q-tab-panel>

      <q-tab-panel class="flex flex-center" name="addresses">
        <adressen/>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useInit } from '../js/initApp'
import Simple from 'components/Simple'
import Adressen from 'components/Adressen'

export default defineComponent({
  name: 'Index',
  components: {
    Simple,
    Adressen
  },
  setup () {
    const { native } = useInit()
    const tab = ref('simple')

    return { native, tab }
  }
})
</script>
