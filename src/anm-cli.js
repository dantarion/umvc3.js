const fs = require('fs')
const path = require('path')
const anm = require('./anm')

const program = require('commander')
const version = require(path.join(__dirname, '../package.json')).version

program.command('extract <file> <foldername>').description('Extract JS source from .anm file').action((file, foldername) => {
  console.log(`Extracting ${file} into working/${foldername}`)
  anm.unpackAnmFile(file, foldername)
})

program.command('compile <foldername> <file>').description('Compile folder into .anm file').action((file, foldername) => {
  console.log(`Compiling working/${foldername} into ${file}`)
  anm.packAnm(file, foldername)
})

program.command('test').description('Test Suite. Extracts and compiles Ryu\'s file to test rebuilding .anm').action(() => {
  console.log('Running test suite')
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
})
program.version(version).parse(process.argv)
