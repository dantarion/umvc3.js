const fs = require('fs')
const path = require('path')
const assert = require('assert')

const common = require('./common')
const _ = require('struct-fu')
const mkdirp = require('mkdirp')
const printf = require('printf')
const CliEntryHeader = _.struct([
  _.int32le('id'),
  _.int32le('count')
])
const CliEntryBlock = _.struct([
  _.int32le('unknown1'),
  _.int32le('unknown2'),
  _.int32le('unknown3'),
  _.float32le('x'),
  _.float32le('y'),
  _.float32le('z'),
  _.float32le('radius'),
  _.int32le('unknown8')
])

function unpack (buffer, folder) {
  // Read Header
  const entryHeader = common.CommonHeaderStruct.unpack(buffer, 0)
  const entries = {}
  assert(entryHeader.Type === 'CLI', `This isn't a proper .ccm file, missing header CAC != ${entryHeader.Type}`)
  assert(entryHeader.unknown === 537920034, `Is this really constant? ${entryHeader.unknown}`)
  assert(entryHeader.unknown2 === 0, 'Is this really constant? unknown2')
  // console.log(entryHeader)
  // entryHeader.tableCount = 10;
  for (let i = 0; i < entryHeader.tableCount; i++) {
    const tableEntry = common.CommonTableEntry.unpack(buffer.slice(0x10 + i * 8))
    const cliHeader = CliEntryHeader.unpack(buffer.slice(tableEntry.offset))
    cliHeader._offset = printf('0x%0x', tableEntry.offset)
    cliHeader._end = printf('0x%0x', tableEntry.offset + CliEntryHeader.size + cliHeader.count * CliEntryBlock.size)
    entries[printf('0x%0x', tableEntry.id)] = cliHeader
    cliHeader.blocks = []
    for (let i = 0; i < cliHeader.count; i++) {
      var tmp = CliEntryBlock.unpack(buffer.slice(tableEntry.offset + 0x8 + i * CliEntryBlock.size))
      cliHeader.blocks.push(tmp)
    }
  }

  // Prepare output folder
  mkdirp.sync(path.join(process.cwd(), 'working', folder))
  const outJS = fs.openSync(path.join(process.cwd(), 'working', folder, 'atkcollision.json'), 'w')
  fs.appendFileSync(outJS, JSON.stringify(entries, null, 2))
  fs.closeSync(outJS)
  return entries
}
function unpackFile (filename, folder) {
  let buffer
  try {
    buffer = fs.readFileSync(filename)
  } catch (e) {
    console.error('Error Opening', filename)
    throw e
  }
  return unpack(buffer, folder)
}
function pack (filename, folder) {}
module.exports = {
  pack: pack,
  unpackFile: unpackFile,
  unpack: unpack
}

unpackFile('out/chr/Ryu/atkcollision.cli', 'Ryu')
