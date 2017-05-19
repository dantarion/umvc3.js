const fs = require('fs')
const path = require('path')
const assert = require('assert')

const common = require('./common')
const _ = require('struct-fu')
const mkdirp = require('mkdirp')
const printf = require('printf')

const EntryHeader = _.struct([
  _.int32le('id'),
  _.int32le('startup'),
  _.int32le('active'),
  _.int32le('unknownC'),
  _.int32le('unknown10'),
  _.int32le('hitboxMaxHits'),
  _.int32le('unknown18'),
  _.int32le('hitboxRefreshTimer'),
  _.int32le('unknown20'),
  _.int32le('hitsparkRefreshTimer'),
  _.int32le('unknown24'),
  _.int32le('unknown28'),
  _.float32le('unknown30'),
  _.float32le('unknown34'),
  _.float32le('unknown38'),
  _.int32le('flags1'),
  _.int32le('flags2'),
  _.int32le('flags3'),
  _.int32le('attackLevel'),
  _.int32le('unknown50'),
  _.int32le('guardLevel'),
  _.int32le('hitAnimation'),
  _.int32le('hitAnimationCounterHit'),
  _.int32le('hitAnimationAirborne'),
  _.int32le('damage'),
  _.float32le('damageScaling'),
  _.float32le('damageMultiplier'),
  _.float32le('chipDamage'),
  _.int32le('unknown70'),
  _.float32le('meterGainMultiplier'),
  _.float32le('unknown78'),
  _.int32le('unknown7C'),
  _.int32le('unknown80'),
  _.int32le('unknown84'),
  _.int32le('unknown88'),
  _.int32le('extraHitstun'),
  _.int32le('unknown90'),
  _.int32le('extraBlockstun'),
  _.int32le('unknown98'),
  _.float32le('enemyPushback'),
  _.float32le('corneredNegativePushback'),
  _.float32le('playerPushbackCorner'),
  _.float32le('playerPushbackMidscreen'),
  _.float32le('unknownAC'),
  _.float32le('unknownB0'),
  _.float32le('unknownB4'),
  _.float32le('unknownB8'),
  _.float32le('bounceHeight'),
  _.float32le('unknownC0'),
  _.int32le('hitstop'),
  _.int32le('unknownC8'),
  _.int32le('unknownCC'),
  _.int32le('unknownD0'),
  _.struct('juggleData', [
    _.int32le('height'),
    _.int32le('unknown8'),
    _.float32le('carry'),
    _.float32le('speed'),
    _.int32le('fixedHitstun')
  ], 2),
  _.struct('onHit', [
    _.int32le('class'),
    _.int32le('actionIndex')
  ], 2),
  _.float32le('throwRelated'),
  _.int32le('unknown110'),
  _.int32le('throwRelated2'),
  _.int32le('hitspark'),
  _.int32le('throwRelated2'),
  _.int32le('victimHitEffect'),
  _.int32le('victimBlockEffect'),
  _.int32le('tacCounter?'),
  _.int32le('unknown12C'),
  _.int32le('unknown130'),
  _.int32le('collideSpark')
])
function unpack (buffer, outFile) {
  // Read Header
  const entryHeader = common.CommonHeaderStruct.unpack(buffer, 0)
  const entries = {}
  assert(entryHeader.Type === 'ATI', `This isn't a proper .ati file, missing header ATI != ${entryHeader.Type}`)
  assert(entryHeader.unknown === 537986053, `Is this really constant? ${entryHeader.unknown}`)
  assert(entryHeader.unknown2 === 0, 'Is this really constant? unknown2')
  // console.log(entryHeader)
  // entryHeader.tableCount = 10;
  for (let i = 0; i < entryHeader.tableCount; i++) {
    const tableEntry = common.CommonTableEntry.unpack(buffer.slice(0x10 + i * 8))
    const cbaHeader = EntryHeader.unpack(buffer.slice(tableEntry.offset))
    cbaHeader.size = EntryHeader.size.toString(16)
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
