const fs = require('fs')
const path = require('path')
const assert = require('assert')

const common = require('./common')
const _ = require('struct-fu')
const mkdirp = require('mkdirp')
const printf = require('printf')
const CspEntryHeader = _.struct([
  _.uint32le('id'),
  _.uint32le('blockCount'),
  _.uint32le('unknown'),
  _.float32le('meterRequired'),
  _.int32le('disabled'),
  _.int32le('threshold'),
  _.int32le('positionRequired'),
  _.int32le('stateRequired'),
  _.int32le('flags')
])

function unpack (buffer, outFile) {
  // Read Header
  const entryHeader = common.CommonHeaderStruct.unpack(buffer, 0)
  const entries = {}
  assert(entryHeader.Type === 'CSP', `This isn't a proper .csp file, missing header CSP != ${entryHeader.Type}`)
  assert(entryHeader.unknown === 537986600, `Is this really constant? ${entryHeader.unknown}`)
  assert(entryHeader.unknown2 === 0, 'Is this really constant? unknown2')
  // console.log(entryHeader)
  // entryHeader.tableCount = 10;
  for (let i = 0; i < entryHeader.tableCount; i++) {
    const tableEntry = common.CommonTableEntry.unpack(buffer.slice(0x10 + i * 8))
    // astRoot.body.push(astFunction)

    const header = CspEntryHeader.unpack(buffer.slice(tableEntry.offset))
    header.enabled = !!header.disabled
    header._flags = `0x${header.flags.toString(16)}`
    header.blocks = []
    // console.log();
    entries[printf('0x%0x', tableEntry.id)] = header
    for (let i = 0; i < header.blockCount; i++) {
      var block = common.ReqBlock.unpack(buffer.slice(tableEntry.offset + 0x24 + i * 0x20))
      block._type = common.ReqBlockTypes[block.id]

      header.blocks.push(block)
    }
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
