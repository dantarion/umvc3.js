const fs = require('fs')
const path = require('path')
const assert = require('assert')

const common = require('./common')
const _ = require('struct-fu')
const mkdirp = require('mkdirp')
const printf = require('printf')
const CcmEntryHeader = _.struct([
  _.uint32le('id'),
  _.uint32le('blockCount'),
  _.uint32le('unknown'),
  _.float32le('meterRequired'),
  _.byte('enabled'),
  _.char('atiString', 3),
  _.int32le('unknown2'),
  _.int32le('unknown3'),
  _.uint32le('delay'),
  _.uint32le('actionIndex'),
  _.int32le('unknown4'),
  _.int32le('unknown5'),
  _.int32le('unknown6'),
  _.int32le('unknown7'),
  _.int32le('unknown8'),
  _.int32le('unknown9'),
  _.int32le('unknown10'),
  _.int32le('unknown10')
])

function unpack (buffer, outFile) {
  // Read Header
  const entryHeader = common.CommonHeaderStruct.unpack(buffer, 0)
  const entries = {}
  assert(entryHeader.Type === 'CCM', `This isn't a proper .ccm file, missing header CCM != ${entryHeader.Type}`)
  assert(entryHeader.unknown === 537986600, `Is this really constant? ${entryHeader.unknown}`)
  assert(entryHeader.unknown2 === 0, 'Is this really constant? unknown2')
  // console.log(entryHeader)
  // entryHeader.tableCount = 10;
  for (let i = 0; i < entryHeader.tableCount; i++) {
    const tableEntry = common.CommonTableEntry.unpack(buffer.slice(0x10 + i * 8))
    // astRoot.body.push(astFunction)

    const ccmHeader = CcmEntryHeader.unpack(buffer.slice(tableEntry.offset))
    ccmHeader.enabled = !!ccmHeader.enabled[0]
    ccmHeader.blocks = []
    // console.log();
    entries[printf('0x%0x', tableEntry.id)] = ccmHeader
    for (let i = 0; i < ccmHeader.blockCount; i++) {
      var block = common.ReqBlock.unpack(buffer.slice(tableEntry.offset + 0x44 + i * 0x20))
      block._type = common.ReqBlockTypes[block.id]
      ccmHeader.blocks.push(block)
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
