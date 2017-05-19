const fs = require('fs')
const path = require('path')
const assert = require('assert')

const common = require('./common')
const _ = require('struct-fu')
const mkdirp = require('mkdirp')
const printf = require('printf')
const CBAEntryHeader = _.struct([
  _.int32le('id'),
  _.int32le('actionIndex'),
  _.int32le('leniency'),
  _.int32le('direction'),
  _.int32le('button'),
  _.int32le('state'),
  _.int32le('unknown'),
  _.uint32le('unknown2')
])
const Enum = require('enum')
const Input = new Enum({'NONE': 0, 'DOWN': 8, 'L': 16, 'M': 32, 'H': 64, 'S': 128, 'SELECT': 0x100000})
const State = new Enum({'NONE': 0, 'AIR': 32})
function unpack (buffer, outFile) {
  // Read Header
  const entryHeader = common.CommonHeaderStruct.unpack(buffer, 0)
  const entries = {}
  assert(entryHeader.Type === 'CBA', `This isn't a proper .ccm file, missing header CBA != ${entryHeader.Type}`)
  assert(entryHeader.unknown === 537921552, `Is this really constant? ${entryHeader.unknown}`)
  assert(entryHeader.unknown2 === 0, 'Is this really constant? unknown2')
  // console.log(entryHeader)
  // entryHeader.tableCount = 10;
  for (let i = 0; i < entryHeader.tableCount; i++) {
    const tableEntry = common.CommonTableEntry.unpack(buffer.slice(0x10 + i * 8))
    const cbaHeader = CBAEntryHeader.unpack(buffer.slice(tableEntry.offset))
    cbaHeader._offset = printf('0x%0x', tableEntry.offset)
    cbaHeader._end = printf('0x%0x', tableEntry.offset + CBAEntryHeader.size)
    cbaHeader._state = printf('0x%x', cbaHeader.state)
    cbaHeader._button = printf('0x%x', cbaHeader.button)
    cbaHeader._leniency = printf('0x%x', cbaHeader.leniency)
    cbaHeader._direction = printf('0x%x', cbaHeader.direction)
    cbaHeader.button = Input.get(cbaHeader.button)
    cbaHeader.leniency = Input.get(cbaHeader.leniency)
    cbaHeader.state = State.get(cbaHeader.state)
    cbaHeader.direction = Input.get(cbaHeader.direction)
    cbaHeader._unknown2 = printf('0x%x', cbaHeader.unknown2)
    entries[printf('0x%0x', tableEntry.id)] = cbaHeader
  }

  // Prepare output folder
  mkdirp.sync(path.dirname(outFile))
  const outJS = fs.openSync(outFile, 'w')
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
