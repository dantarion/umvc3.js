const path = require('path')
const fs = require('fs')
const anm = require('./filetypes/anm')

const program = require('commander')
const glob = require('glob')
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
  var base = path.join(__dirname, '..', 'out', 'chr')
  glob(path.join(base, '**/*.anm'), (err, filenames) => {
    if (err) {
      throw err
    }
    filenames.forEach((filename) => {
      // console.log(filename)
      var outFilename = path.relative(base, filename).replace('.anm', '.js').split(path.sep).join('.')
      try {
        console.log(outFilename)
        anm.unpackFile(filename, 'working/' + outFilename)
      } catch (e) {
        console.log('error', e)
      }
    })
    console.log('Usage')
    fs.writeFileSync('_commandDB.json', JSON.stringify(anm.usage, Object.keys(anm.usage).sort(), 2))
  })
})
program.command('testRebuild').description('Test Rebuild Suite. Extracts and compiles Ryu\'s file to test rebuilding .anm').action(() => {
  anm.unpackFile('out/chr/Ryu/anmchr.anm', 'working/RyuTestRebuild.js')
  anm.pack('working/RyuTestRebuild.js', 'Ryu.anm')
  anm.unpackFile('Ryu.anm', 'working/RyuTestRebuild2.js')
})

program.version(version).parse(process.argv)
