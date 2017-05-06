const frida = require('frida')
const load = require('frida-load')
const fs = require('fs')
const watch = require('node-watch')
const co = require('co')
const path = require('path')
var api
var timeouts = {}
// Change this to point to where your mods are.
const MOD_PATH = path.join(__dirname, '..', 'out')
watch(MOD_PATH, {
  recursive: true,
  followSymLinks: true
}, function (event, filename) {
  if (fs.lstatSync(filename).isDirectory()) {
    return
  }

  if (timeouts[filename]) {
    clearTimeout(timeouts[filename])
  }
  timeouts[filename] = setTimeout(function () {
    console.log(filename, event, 'changed..sending.')
    try {
      var data = fs.readFileSync(filename)
      filename = filename.replace(MOD_PATH, '')
      console.log('<<<<<<<<<<<<<<<<< sending replacement file', filename)
      api.sendFile(filename.slice(0, -4), data)
    } catch (e) {
      console.error(e)
    }
  }, 100)
})

co(function * () {
  var contents = yield load(require.resolve('../frida/inject.js'))
  var session = yield frida.attach('umvc3.exe')
  console.log('attached to UMVC3...:', session)
  var script = yield session.createScript(contents)
  console.log('script injected:', script)
  yield script.load()
  api = yield script.getExports()
  script.events.listen('message', function (message, data) {
    if (!message.payload) {
      console.log(message)
      return
    }
    try {
      var fdata = fs.readFileSync(path.join(MOD_PATH, message.payload[1]))
      console.log('<<<<<<<<<<<<<<<<< sending replacement file', message.payload[1])
      api.sendFile(message.payload[1].slice(0, -4), fdata)
    } catch (e) {
      console.error(e)
    }
  })
  console.log('script loaded! WE IN THERE')
}).catch(function (error) {
  console.log('frida.re error:', error.message)
})
