<template>
  <q-card style="background-color: transparent;" class="my-card">
    <q-card-section
      horizontal
      class="q-pa-md row justify-around"
    >
      <q-img
        src="~assets/adapter-quasar.png"
      />
      <q-table
        style="background-color: transparent;"
        rows-per-page-label="Adressen je Seite"
        :rows="native.adressen"
        :columns="columns"
        :filter="filter"
        row-key="name"
      >
        <template v-slot:top-right>
          <q-input
            borderless
            dense
            debounce="300"
            v-model="filter"
            placeholder="Suchen"
          >
            <template v-slot:append>
              <q-icon name="search"/>
            </template>
          </q-input>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              key="plz"
              :props="props"
            >
              {{ props.row.plz }}
              <q-popup-edit
                v-model.number="props.row.plz"
                title="Postleitzahl"
              >
                <q-input
                  type="number"
                  v-model.number="props.row.plz"
                  dense
                  autofocus
                />
              </q-popup-edit>
            </q-td>
            <q-td
              key="stadt"
              :props="props"
            >
              <div class="text-pre-wrap">{{ props.row.stadt }}</div>
              <q-popup-edit
                v-model="props.row.stadt"
                title="Stadt"
              >
                <q-input
                  type="text"
                  v-model="props.row.stadt"
                  dense
                  autofocus
                />
              </q-popup-edit>
            </q-td>
            <q-td
              key="strasse"
              :props="props"
            >
              <div class="text-pre-wrap">{{ props.row.strasse }}</div>
              <q-popup-edit
                v-model="props.row.strasse"
                title="Straße"
              >
                <q-input
                  type="text"
                  v-model="props.row.strasse"
                  dense
                  autofocus
                />
              </q-popup-edit>
            </q-td>
            <q-td
              key="hausnummer"
              :props="props"
            >
              {{ props.row.hausnummer }}
              <q-popup-edit
                v-model.number="props.row.hausnummer"
                title="Hausnummer"
              >
                <q-input
                  type="number"
                  v-model.number="props.row.hausnummer"
                  dense
                  autofocus
                />
              </q-popup-edit>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useInit } from 'src/js/initApp'

const columns = [
  {
    name: 'plz',
    align: 'left',
    label: 'Postleitzahl',
    field: 'plz',
    sortable: true
  },
  {
    name: 'stadt',
    align: 'left',
    label: 'Stadt',
    field: 'stadt',
    sortable: true
  },
  {
    name: 'strasse',
    align: 'left',
    label: 'Straße',
    field: 'strasse',
    sortable: true
  },
  {
    name: 'hausnummer',
    align: 'left',
    label: 'Hausnummer',
    field: 'hausnummer',
    sortable: true
  }
]

export default defineComponent({
  name: 'Adressen',
  setup () {
    const { native } = useInit()
    const filter = ref('')

    return { columns, filter, native }
  }
})
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 950px
</style>
