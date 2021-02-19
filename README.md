![Logo](./public/adapter-quasar.png)
# ioBroker.adapter-quasar
[![NPM version](http://img.shields.io/npm/v/iobroker.adapter-quasar)](https://www.npmjs.com/package/adapter-quasar)
[![Downloads](https://img.shields.io/npm/dm/iobroker.adapter-quasar.svg)](https://www.npmjs.com/package/iobroker.adapter-quasar)
[![stable](http://iobroker.live/badges/adapter-quasar-stable.svg)](http://iobroker.live/badges/adapter-quasar-stable.svg)
[![installed](http://iobroker.live/badges/adapter-quasar-installed.svg)](http://iobroker.live/badges/adapter-quasar-installed.svg)
[![Dependency Status](https://img.shields.io/david/steiger04/iobroker.adapter-quasar.svg)](https://david-dm.org/steiger04/iobroker.adapter-quasar)
[![Known Vulnerabilities](https://snyk.io/test/github/steiger04/ioBroker.adapter-quasar/badge.svg)](https://snyk.io/test/github/steiger04/ioBroker.adapter-quasar)

![Test and Release](https://github.com/steiger04/ioBroker.adapter-quasar/workflows/Test%20and%20Release/badge.svg)

[![NPM](https://nodei.co/npm/iobroker.adapter-quasar.png?downloads=true)](https://nodei.co/npm/iobroker.adapter-quasar/)

## adapter-quasar adapter for ioBroker
The template integrates [Quasar](https://next.quasar.dev/), a Vue.js-based framework and enables the simple and
efficient development of adapter administration.

## Developer manual
### Perform the following steps in sequence:
1. Install Quasar globally
   ``` sh
   npm install -g @quasar/cli
   ```

2. Clone github repo into your **_Development Folder_**, which should be inside the iobroker folder
   (e.g. iobroker/coding)
   ``` sh
   cd path/to/your/development-folder
   git clone https://github.com/Steiger04/ioBroker.adapter-quasar.git
   ```
3. npm install and eslint
   ``` sh
   cd path/to/your/development-folder/ioBroker.adapter-quasar
   npm install
   ./node_modules/.bin/eslint --fix --ext .js,.vue .
   ```
4. Change gulp task ibrUpload in gulpfile.js from:
   ``` sh
   gulp.task('ibrUpload', (cb) => {
    process.chdir('E:\node_workspace\iobroker')
    exec('iobroker.bat upload adapter-quasar')
    cb()
   })
   ```
   to:
    ``` sh
   gulp.task('ibrUpload', (cb) => {
    process.chdir('path/to/your/iobroker')
    exec('iobroker.bat upload adapter-quasar')
    cb()
   })
   ```
5. Change the adapter name in all relevant files
   ``` sh
   cd path/to/your/development-folder/ioBroker.adapter-quasar
   gulp changeNames --name [your-adapter-name] // e.g. gulp changeNames --name my-new-bulbs
   ```
6. Rename folder io**B**roker.adapter-quasar to io**b**roker.[your-adapter-name]
   ``` sh
   cd path/to/your/development-folder
   mv ioBroker.adapter-quasar iobroker.[your-adapter-name]
   ```
7. Go to your iobroker folder and install your new adapter
   ``` sh
   cd path/to/your/iobroker
   npm i path/to/your/development-folder/iobroker.[your-adapter-name]
   ```

## Getting started
#### Start development server
 ``` sh
 cd path/to/your/development-folder/iobroker.[your-adapter-name]
 npm run dev:quasar
 ```
#### Build admin
 ```
 cd path/to/your/development-folder/iobroker.[your-adapter-name]
 npm run build:quasar
 ```
The admin folder with all relevant files was created in the iobroker.[your-adapter-name] folder and
copied to the path/to/your/iobroker/iobroker-data/files folder.
 A separate upload via iobroker upload [your-adapter-name] is no longer necessary.

## Best Practices
All native properties are provided reactively. The following native sample object is defined in the io-package.json
file:
``` json
"native" : {
    "option1": false,
    "option2": "50",
    "adressen": [
      {
        "plz": 50259,
        "stadt": "Köln",
        "strasse": "Melchiorstraße",
        "hausnummer": 3
      },
      {
        "plz": 60327,
        "stadt": "Frankfurt am Main",
        "strasse": "Ludwig-Erhard-Anlage",
        "hausnummer": 1
      },
      {
        "plz": 80336,
        "stadt": "München",
        "strasse": "Schillerstraße",
        "hausnummer": 9
      }
    ]
  }
```
In the Simple.vue component, Option1 and Option2 are made available via the reactive native object in the setup
function and can then be used in the template section.
``` javascript
setup () {
    const { native } = useInit()

    return { native }
  }
```

``` javascript
<template>
  ...
    <q-toggle
      v-model="native.option1"
      ...
      />

    <q-input
      v-model="native.option2"
      ...
    />
  ...
</template>
```

If the native object in io-package.json is extended by e.g. an option3,
you can directly use option3 in the template section:
``` javascript
<template>
  ...
    <q-input
      v-model="native.option3"
      ...
    />
  ...
</template>
```

## Behind the scenes
Quasar is a framework based on Vue. Here we use Vue3, which means that we use the new composition api with Quasar and
for the adapter.

## useInit()
useInit() can be executed in the setup function of a component or page. useInit returns a large number of reactive
objects and values, which can then be used further in the component or page.

``` javascript
setup () {
  ...
  const {
          settings, // adapter settings
          connected, // true, if socket is connected
          loaded, // true, if native object is ready
          changed, // true, if native object has changed
          native, // the native object
          rooms, // All rooms, if available
          funcs, // All functions, if available
          errorText, // actual errorText
          showError, // function, which set errorText as a notifier
          isConfigurationError, // true, if configuration error
          connection, // actual connection object
          instanceId, // actual instanceId from adapter
          socket, // actual socket object
          states, // all instance states, if defined
          objects, // all defined objects
        } = useInit()
  ...

    return { loaded, connected, native, ... }
}
```

## settings for states and objects
The settings are transferred to the provideInit function in the src/boot/init.js file.

### states
All states of the instance are given by:
``` javascript
doNotLoadAllStates: false
```
Over
``` javascript
const { states } = useInit()
```
then all states of the instance are available and reactive.

### objects
Objects in the object tree can be made available.
``` javascript
doNotLoadAllObjects: true
```
means that all system configurations are available by default under system.config.

And
``` javascript
doNotLoadAllObjects: false

autoSubscribes: ['milight-smart-light.0.Test_Lichter_Gr_1', 'milight-smart-light.0.Test_Lichter_Gr_2' ]
or
autoSubscribes: ['*']
```
means that all objects listed under autoSubscribes are available by default.

Over
``` javascript
const { objects } = useInit()
```
then all defined objects are available and reactive.

### Scripts in `package.json`
Several npm scripts are predefined for your convenience. You can run them using `npm run <scriptname>`

| Script name | Description |
|-------------|-------------|
| `build:quasar` | Creates the admin folder and uploads the directory. |
| `dev:quasar` | Compile the sources and watch for changes. |
| `lint:quasar` | Runs `ESLint` to check your code for formatting errors and potential bugs. |
| `lint:quasar-fix` | Runs `ESLint` to fix your code for formatting errors and potential bugs. |
| `ibrUpload` | Executes the tests you defined in `*.test.js` files. |
| `test` | Perform test.js and test:package. |
| `test.js` | Performs a minimal test run on package files and your tests. |
| `test:package` | Ensures your `package.json` and `io-package.json` are valid. |
| `test:unit` | Tests the adapter startup with unit tests (fast, but might require module mocks to work). |
| `test:integration` | Tests the adapter startup with an actual instance of ioBroker. |
| `check` | Performs a type-check on your code (without compiling anything). |

### Writing tests
When done right, testing code is invaluable, because it gives you the
confidence to change your code while knowing exactly if and when
something breaks. A good read on the topic of test-driven development
is https://hackernoon.com/introduction-to-test-driven-development-tdd-61a13bc92d92.
Although writing tests before the code might seem strange at first, but it has very
clear upsides.

The template provides you with basic tests for the adapter startup and package files.
It is recommended that you add your own tests into the mix.

### Publishing the adapter
Since you have chosen GitHub Actions as your CI service, you can
enable automatic releases on npm whenever you push a new git tag that matches the form
`v<major>.<minor>.<patch>`. The necessary steps are described in `.github/workflows/test-and-release.yml`.

To get your adapter released in ioBroker, please refer to the documentation
of [ioBroker.repositories](https://github.com/ioBroker/ioBroker.repositories#requirements-for-adapter-to-get-added-to-the-latest-repository).

### Test the adapter manually on a local ioBroker installation
In order to install the adapter locally without publishing, the following steps are recommended:
1. Create a tarball from your dev directory:
   ```bash
   npm pack
   ```
1. Upload the resulting file to your ioBroker host
1. Install it locally (The paths are different on Windows):
   ```bash
   cd /opt/iobroker
   npm i /path/to/tarball.tgz
   ```

For later updates, the above procedure is not necessary. Just do the following:
1. Overwrite the changed files in the adapter directory (`/opt/iobroker/node_modules/iobroker.[your-adapter-name]`)
1. Execute `iobroker upload [your-adapter-name]` on the ioBroker host

## Changelog

### 0.0.1
* (Steiger04) initial release

## License
MIT License

Copyright (c) 2021 Steiger04 <steiger04@posteo.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
