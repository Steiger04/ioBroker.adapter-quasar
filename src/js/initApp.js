/* eslint-disable no-underscore-dangle,no-restricted-syntax,no-param-reassign,no-plusplus,no-undef */
import { ref, reactive, watch } from 'vue'
import Connection, { PROGRESS } from './Connection'

// import i18n from '../main';

class InitApp {
  static created = false
  static initObj

  constructor (settings) {
    InitApp.created = true
    this.settings = settings
    this.connected = ref(false)
    this.loaded = ref(false)
    this.changed = ref(false)
    this.native = reactive({})
    this.startedNative = ref('')
    this.rooms = ref([])
    this.funcs = ref([])
    this.errorText = ref('')
    this.isConfigurationError = ref('')

    watch([this.native, this.startedNative], ([newNative]) => {
      if (JSON.stringify(newNative) !== this.startedNative.value) {
        this.changed.value = true
        globalThis.changed = true
      } else {
        this.changed.value = false
        globalThis.changed = false
      }
    })

    // extract instance from URL
    this.instance = parseInt(globalThis.location.search.slice(1), 10) || 0
    // extract adapter name from URL
    const tmp = globalThis.location.pathname.split('/')
    this.adapterName = (settings && settings.adapterName) || globalThis.adapterName || tmp[tmp.length - 2] || 'iot'
    this.instanceId = 'system.adapter.' + this.adapterName + '.' + this.instance

    try {
      this.isIFrame = globalThis.self !== globalThis.top
    } catch (e) {
      this.isIFrame = true
    }

    this.encryptedFields = (settings && settings.encryptedFields) || []

    this.socket = new Connection({
      name: this.adapterName,
      port: settings && settings.port,
      doNotLoadAllObjects: settings && settings.doNotLoadAllObjects,
      autoSubscribes: settings && settings.autoSubscribes,

      onProgress: (progress) => {
        if (progress === PROGRESS.CONNECTING) {
          this.connected.value = false
        } else if (progress === PROGRESS.READY) {
          this.connected.value = true
        } else {
          this.connected.value = true
        }
      }, // eslint-disable-next-line no-unused-vars
      onReady: (objects, scripts) => {
        // i18n.locale = this.socket.systemLang;
        this.getSystemConfig()
          .then((obj) => {
            this._secret = (typeof obj !== 'undefined' && obj.native && obj.native.secret
            ) || 'Zgfr56gFe87jJOM'
            return this.socket.getObject(this.instanceId)
          })
          .then((obj) => {
            if (obj) {
              this.common = obj && obj.common
              this.onPrepareLoad(obj.native) // decode all secrets

              this.startedNative.value = JSON.stringify(obj.native)
              Object.assign(this.native, obj.native)
              this.loaded.value = true

              // eslint-disable-next-line no-unused-expressions
              this.onConnectionReady && this.onConnectionReady()
            } else {
              console.warn('Cannot load instance settings')
              // eslint-disable-next-line no-unused-expressions
              this.onConnectionReady && this.onConnectionReady()
            }
          })

        this.socket.getEnums('rooms')
          .then((roomEnums) => {
            const list = this.getMslRoomsOrFuncs(roomEnums)

            for (const [key, value] of Object.entries(list)) {
              this.rooms.value.push({
                label: value,
                value: key
              })
            }
          })

        this.socket.getEnums('functions')
          .then((funcEnums) => {
            const list = this.getMslRoomsOrFuncs(funcEnums)

            for (const [key, value] of Object.entries(list)) {
              this.funcs.value.push({
                label: value,
                value: key
              })
            }
          })
      },
      onError: (err) => {
        this.showError(err)
      }
    })
  }

  getSystemConfig () {
    if (this.socket.objects && this.socket.objects['system.config']) {
      return Promise.resolve(this.socket.objects['system.config'])
    }
    return this.socket.getObject('system.config')
  }

  onConnectionReady () {
    // you can overload this function to execute own commands
  }

  onPrepareLoad (settings) {
    // here you can encode values
    // eslint-disable-next-line no-unused-expressions
    this.encryptedFields && this.encryptedFields.forEach((attr) => {
      if (settings[attr]) {
        settings[attr] = this.decrypt(settings[attr])
      }
    })
  }

  onPrepareSave (settings) {
    // here you can encode values
    // eslint-disable-next-line no-unused-expressions
    this.encryptedFields && this.encryptedFields.forEach((attr) => {
      if (settings[attr]) {
        settings[attr] = this.encrypt(settings[attr])
      }
    })
  }

  getExtendableInstances () {
    return new Promise((resolve) => {
      this.socket.socket.emit('getObjectView', 'system', 'instance', null, (err, doc) => {
        if (err) {
          resolve([])
        } else {
          resolve(doc.rows.filter((item) => item.value.common.webExtendable)
            .map((item) => item.value))
        }
      })
    })
  }

  getIpAddresses (host) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      this.socket.socket.emit('getHostByIp', host || this.common.host, (ip, _host) => {
        const IPs4 = [{
          // name: `[IPv4] 0.0.0.0 - ${i18n.t('Listen on all IPs')}`,
          name: '[IPv4] 0.0.0.0 - Listen on all IPs',
          address: '0.0.0.0',
          family: 'ipv4'
        }]
        const IPs6 = [{
          name: '[IPv6] ::',
          address: '::',
          family: 'ipv6'
        }]
        if (_host) {
          host = _host
          if (host.native.hardware && host.native.hardware.networkInterfaces) {
            Object.keys(host.native.hardware.networkInterfaces)
              .forEach((eth) => host.native.hardware.networkInterfaces[eth].forEach((inter) => {
                if (inter.family !== 'IPv6') {
                  IPs4.push({
                    name: `[${inter.family}] ${inter.address} - ${eth}`,
                    address: inter.address,
                    family: 'ipv4'
                  })
                } else {
                  IPs6.push({
                    name: `[${inter.family}] ${inter.address} - ${eth}`,
                    address: inter.address,
                    family: 'ipv6'
                  })
                }
              }))
          }
          // eslint-disable-next-line no-shadow
          IPs6.forEach((ip) => IPs4.push(ip))
        }
        resolve(IPs4)
      })
    })
  }

  getIsChanged (nativeObj) {
    nativeObj = nativeObj || this.native
    const isChanged = JSON.stringify(nativeObj) !== JSON.stringify(this.startedNative)

    if (isChanged) {
      globalThis.changed = true
    } else {
      globalThis.changed = false
    }

    return isChanged
  }

  decrypt (value) {
    let result = ''
    for (let i = 0; i < value.length; i++) {
      // eslint-disable-next-line no-bitwise
      result += String.fromCharCode(this._secret[i % this._secret.length].charCodeAt(0) ^ value.charCodeAt(i))
    }
    return result
  }

  encrypt (value) {
    let result = ''
    for (let i = 0; i < value.length; i++) {
      // eslint-disable-next-line no-bitwise
      result += String.fromCharCode(this._secret[i % this._secret.length].charCodeAt(0) ^ value.charCodeAt(i))
    }
    return result
  }

  onLoadConfig (newNative) {
    if (JSON.stringify(newNative) !== JSON.stringify(this.native)) {
      Object.assign(this.native, newNative)
    }
  }

  onSave (isClose) {
    let oldObj
    if (this.isConfigurationError.value) {
      this.errorText.value = this.isConfigurationError.value
      return
    }

    this.socket.getObject(this.instanceId)
      .then((_oldObj) => {
        oldObj = _oldObj || {}

        for (const a in this.native) {
          // eslint-disable-next-line no-prototype-builtins
          if (this.native.hasOwnProperty(a)) {
            oldObj.native[a] = this.native[a]
          }
        }

        if (this.common) {
          for (const b in this.common) {
            // eslint-disable-next-line no-prototype-builtins
            if (this.common.hasOwnProperty(b)) {
              oldObj.common[b] = this.common[b]
            }
          }
        }

        this.onPrepareSave(oldObj.native)

        return this.socket.setObject(this.instanceId, oldObj)
      })
      .then(() => {
        this.startedNative.value = JSON.stringify(oldObj.native)
        isClose && this.onClose()
      })
  }

  onClose () {
    if (typeof globalThis.parent !== 'undefined' && globalThis.parent) {
      try {
        if (globalThis.parent.$iframeDialog && typeof globalThis.parent.$iframeDialog.close === 'function') {
          globalThis.parent.$iframeDialog.close()
        } else {
          globalThis.parent.postMessage('close', '*')
        }
      } catch (e) {
        globalThis.parent.postMessage('close', '*')
      }
    }
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  showError (text) {
    this.errorText.value = text
  }

  setConfigurationError (errorText) {
    if (this.isConfigurationError.value !== errorText) {
      this.isConfigurationError.value = errorText
    }
  }

  static generateFile (filename, obj) {
    const el = globalThis.document.createElement('a')
    el.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(obj, null, 2))}`)
    el.setAttribute('download', filename)

    el.style.display = 'none'
    globalThis.document.body.appendChild(el)

    el.click()

    globalThis.document.body.removeChild(el)
  }

  handleFileSelect (evt) {
    const f = evt.target.files[0]
    if (f) {
      const r = new globalThis.FileReader()
      r.onload = (e) => {
        const contents = e.target.result
        try {
          const json = JSON.parse(contents)
          if (json.native && json.common) {
            if (json.common.name !== this.common.name) {
              // this.showError(i18n.t('otherConfig', { msg: json.common.name }));
            } else {
              this.onLoadConfig(json.native)
            }
          } else {
            // this.showError(i18n.t('invalidConfig'));
          }
          // eslint-disable-next-line no-shadow
        } catch (e) {
          this.showError(e.toString())
        }
      }
      r.readAsText(f)
    } else {
      this.showError('Failed to open JSON File')
    }
  }

  download () {
    const result = {
      _id: `system.adapter.${this.common.name}.${this.instance}`,
      common: JSON.parse(JSON.stringify(this.common)),
      native: this.native
    }
    // remove unimportant information
    if (result.common.news) {
      delete result.common.news
    }
    if (result.common.titleLang) {
      delete result.common.titleLang
    }
    if (result.common.desc) {
      delete result.common.desc
    }

    // globalThis.open('data:application/iobroker; content-disposition=attachment; filename=' +
    // result._id + '.json,' + JSON.stringify(result, null, 2));
    InitApp.generateFile(`${result._id}.json`, result)
  }

  upload () {
    const input = globalThis.document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('id', 'files')
    input.setAttribute('opacity', 0)
    input.addEventListener('change', (e) => this.handleFileSelect(e, () => {
    }, false))
    input.click()
  }

  getMslRoomsOrFuncs (list) {
    const result = {}
    const nnames = []

    // eslint-disable-next-line no-restricted-syntax
    for (const n in list) {
      // eslint-disable-next-line no-prototype-builtins
      if (list.hasOwnProperty(n)) {
        nnames.push(n)
      }
    }
    nnames.sort((a, b) => {
      a = a.toLowerCase()
      b = b.toLowerCase()
      if (a > b) {
        return 1
      }
      if (a < b) {
        return -1
      }
      return 0
    })

    // eslint-disable-next-line no-plusplus
    for (let l = 0; l < nnames.length; l++) {
      result[nnames[l]] = list[nnames[l]].common.name || l
      if (typeof result[nnames[l]] === 'object') {
        result[nnames[l]] = result[nnames[l]][this.socket.systemLang] || result[nnames[l]].en
      }
    }

    return result
  }

  static useInit () {
    if (!InitApp.initObj) {
      throw Error('initObj must be created. use provideInit(settings) first!')
    }

    return {
      settings: InitApp.initObj.settings,
      connected: InitApp.initObj.connected,
      loaded: InitApp.initObj.loaded,
      changed: InitApp.initObj.changed,
      native: InitApp.initObj.native,
      rooms: InitApp.initObj.rooms,
      funcs: InitApp.initObj.funcs,
      errorText: InitApp.initObj.errorText,
      showError: InitApp.initObj.showError.bind(InitApp.initObj),
      isConfigurationError: InitApp.initObj.isConfigurationError,
      connection: InitApp.initObj,
      instanceId: InitApp.initObj.instanceId,
      socket: InitApp.initObj.socket,
      states: InitApp.initObj.socket.adapterStates,
      objects: InitApp.initObj.socket.adapterObjects
    }
  }

  static provideInit (settings) {
    if (!InitApp.created) {
      InitApp.initObj = new InitApp(settings)
    }
  }
}

export const provideInit = InitApp.provideInit
export const useInit = InitApp.useInit
