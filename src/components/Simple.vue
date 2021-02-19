<template>
  <q-card style="background-color: transparent;" class="my-card">
    <q-img src="~assets/adapter-quasar.png">
      <div class="absolute-bottom text-h6">
        Ein paar einfache Eingaben
      </div>
    </q-img>

    <q-card-section>
      <q-toggle
        v-model="native.option1"
        checked-icon="check"
        color="primary"
        label="Option 1"
        unchecked-icon="clear"
      />

      <q-input
        v-model="native.option2"
        type="number"
        filled
        label="Zahleneingabe (Option 2)"
        stack-label
        style="max-width: 200px"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue'
import { useInit } from 'src/js/initApp'

export default defineComponent({
  name: 'Simple',
  setup () {
    const { native } = useInit()

    return { native }
  }
})
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 450px
</style>
