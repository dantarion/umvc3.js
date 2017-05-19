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
  _.uint32le('unknown2'),
  _.uint32le('unknown3'),
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
const CcmBlock = _.struct([
  _.uint32le('id'),
  _.int32le('unknown'),
  _.int32le('unknown2'),
  _.int32le('unknown3'),
  _.int32le('unknown4'),
  _.int32le('unknown5'),
  _.int32le('unknown6'),
  _.int32le('unknown7')
])
const CcmBlockTypes = {
  0x02: 'STANDARD_INPUT',
  0x03: 'DASH_DIRECTIONAL_INPUT',
  0x04: 'TWO_BUTTON_INPUT',
  0x05: 'DIRECTION_PLUS_BUTTON_INPUT',
  0x07: 'TWO_BUTTON_AIRDASH_INPUT',
  0x09: 'ACTION',
  0x0B: 'STATE_RESTRICTION',
  0x0D: 'unknown (related to Simple Mode air combos)',
  0x1E: 'CHARACTER_STATE_REQUIREMENT',
  0x21: 'unknown (related to TAC)',
  0x22: 'unknown (related to flight & other state changes; prevents stacking?)',
  0x23: 'TAC/DHC actions',
  0x25: 'super jump actions',
  0x26: 'allows snap back to bring in the assist specified by the button used',
  0x2F: 'state change? (present at end of Flight, Astral Vision)',
  0x30: 'unknown (related to s.S)',
  0x31: 'prohibited chain combo follow-ups (references actions by class + index like 09 blocks do)',
  0x32: 'height restriction',
  0x34: 'airdash state? (present after 09 block on airdashes)',
  0x35: 'air special action limiter',
  0x38: 'unknown (related to advancing guard, wall-cling, and TAC)',
  0x3A: 'unknown (related to hypers)',
  0x3C: 'unknown (exists on Felicias Rolling Buckler hit follow-ups)',
  0x3D: 'unknown (related to s.S and ground dashes)',
  0x3F: 'CHAIN_STATE',
  0x49: 'unknown (related to advancing guard)'
}
function unpack (buffer, outFile) {
  var graphViz = fs.openSync('out.dot', 'w')
  fs.writeSync(graphViz, 'digraph { \n')
  fs.writeSync(graphViz, '  graph [pad=".5", nodesep="1", ranksep="1", overlap="scalex", splines="false"];\n')
  fs.writeSync(graphViz, '  node[shape = square];\n')
  fs.writeSync(graphViz, '\n')

  // Read Header
  const entryHeader = common.CommonHeaderStruct.unpack(buffer, 0)
  const entries = {}
  assert(entryHeader.Type === 'CCM', `This isn't a proper .ccm file, missing header CAC != ${entryHeader.Type}`)
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
    var s = ''
    for (let i = 0; i < ccmHeader.blockCount; i++) {
      var block = CcmBlock.unpack(buffer.slice(tableEntry.offset + 0x44 + i * 0x20))
      block._type = CcmBlockTypes[block.id]
      s += block._type + ', '
      if (block.id === 9) {
        fs.writeSync(graphViz, printf('  "0x%X" -> "0x%X";\n', ccmHeader.actionIndex, block.unknown2, s))
      }
      ccmHeader.blocks.push(block)
    }
  }
  fs.writeSync(graphViz, '}\n')
  fs.closeSync(graphViz)
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
