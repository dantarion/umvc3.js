const frida = require('frida')
const compile = require('frida-compile')
const fs = require('fs')
const watch = require('node-watch')
const co = require('co')
const path = require('path')
const mkdirp = require('mkdirp')
const anm = require('./filetypes/anm')
var api
var timeouts = {}

const MOD_PATH = path.join(process.cwd(), 'working')
mkdirp(MOD_PATH, function () {})
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
    if (!filename.endsWith('.anm.js')) { return }

    console.log(filename, event, 'changed..compiling.')

    try {
      anm.pack(filename, filename.replace('.js', ''))
      var data = fs.readFileSync(filename.replace('.js', ''))
      filename = filename.replace(MOD_PATH + '\\', '').replace('.anm.js', '')
      filename = 'chr\\' + filename
      console.log('<<<<<<<<<<<<<<<<< sending replacement file', filename)
      api.sendFile(filename, data)
    } catch (e) {
      console.error("Couldn't load", filename)
    }
  }, 100)
})

co(function * () {
  var contents = yield compile.compile(path.join(__dirname, '../frida/inject.js'), {}, {babelify: true})
  var session = yield frida.attach('umvc3.exe')
  console.log('attached to UMVC3...:', session)
  session.enableJit()
  var script = yield session.createScript(contents.bundle)
  console.log('script injected:', script)
  yield script.load()
  api = yield script.getExports()
  script.events.listen('message', function (message, data) {
    if (!message.payload) {
      console.log(message)
      return
    }
    try {
      var filename = message.payload[1].replace('chr\\', '').replace('\\', '/')
      var lfilename = path.join(MOD_PATH, filename)
      anm.pack(lfilename + '.js', lfilename)
      var fdata = fs.readFileSync(lfilename)
      console.log('<<<<<<<<<<<<<<<<< sending replacement file', filename)
      api.sendFile(message.payload[1].slice(0, -4), fdata)
    } catch (e) {
      console.error("Couldn't load", path.join(MOD_PATH, filename))
    }
  })
  console.log('script loaded! WE IN THERE')
}).catch(function (error) {
  console.log('frida.re error:', error.message)
})
