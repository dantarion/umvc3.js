const fs = require('fs')
const path = require('path')

const anm = require('./filetypes/anm')

const program = require('commander')
const version = require(path.join(__dirname, '../package.json')).version

program.command('extract <inFile> <outFile>').description('Extract JS source from .anm file').action((inFile, outFile) => {
  console.log(`Extracting ${inFile} into ${outFile}`)
  anm.unpackFile(inFile, outFile)
})

program.command('compile <inFile> <outFile>').description('Compile JS file into .anm file').action((inFile, outFile) => {
  console.log(`Compiling ${inFile} into ${outFile}`)
  anm.pack(inFile, outFile)
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
