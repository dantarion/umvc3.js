const fs = require('fs')
const path = require('path')

const anm = require('./anm')

fs.readdirSync(path.join(process.cwd(), 'out', 'chr')).forEach((filename) => {
  if (filename.startsWith('.')) {
    return
  }
  console.log(filename)
  var filePath = path.join(process.cwd(), 'out', 'chr', filename, 'anmchr.anm')
  try {
    anm.unpackAnmFile(filePath, filename)
  } catch (e) {
    console.log('error', e)
  }
})
