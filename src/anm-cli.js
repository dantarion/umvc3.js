const fs = require('fs')
const path = require('path')

const anm = require('./filetypes/anm')

const program = require('commander')
const version = '0.1.0'

program.command('extract <inFile> <outFile>').description('Extract JS source from .anm file').action((inFile, outFile) => {
  console.log(`Extracting ${inFile} into ${outFile}`)
  anm.unpackFile(inFile, outFile)
})

program.command('compile <inFile> <outFile>').description('Compile JS file into .anm file').action((inFile, outFile) => {
  console.log(`Compiling ${inFile} into ${outFile}`)
  anm.pack(inFile, outFile)
})

program.command('test').description('Test Suite. Extracts all .anm to .js files').action(() => {
  console.log('Running test suite')
  fs.readdirSync(path.join(__dirname, '..', 'out', 'chr')).forEach((filename) => {
    if (filename.startsWith('.')) {
      return
    }
    console.log(filename)
    var filePath = path.join(__dirname, '..', 'out', 'chr', filename, 'anmchr.anm')
    try {
      anm.unpackAnmFile(filePath, filename)
    } catch (e) {
      console.log('error', e)
    }
  })
})
program.command('testRebuild').description('Test Rebuild Suite. Extracts and compiles Ryu\'s file to test rebuilding .anm').action(() => {
  anm.unpackAnmFile('out/chr/Zombie/anmchr.anm', 'ZombieTestRebuild')
  anm.packAnm('testRebuild.anm', 'working/ZombieTestRebuild')
  anm.unpackAnmFile('testRebuild.anm', 'ZombieTestRebuild2')
})

program.version(version).parse(process.argv)
