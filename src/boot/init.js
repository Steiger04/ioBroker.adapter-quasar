import { boot } from 'quasar/wrappers'
import { provideInit } from '../js/initApp'

export default boot((/* { app, router, ... } */) => {
  provideInit({
    adapterName: 'adapter-quasar',
    doNotLoadAllObjects: true,
    doNotLoadAllStates: false,
    // eslint-disable-next-line no-undef
    port: parseInt(globalThis.location.port, 10),
    encryptedFields: []
    // autoSubscribes: ['system.config', 'milight-smart-light.0.Test_Lichter_Gr_1']
    // autoSubscribes: ['*']
  })
})
