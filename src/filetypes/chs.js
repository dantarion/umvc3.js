const fs = require('fs')
const path = require('path')
const assert = require('assert')

const common = require('./common')
const _ = require('struct-fu')
const mkdirp = require('mkdirp')
const printf = require('printf')

const EntryHeader = _.struct([
  _.int32le('id'),
  _.int32le('flags'),
  _.int32le('vitality'),
  _.float32le('meterGainMultiplier'),
  _.float32le('damageDealtMultipler'),
  _.float32le('damageTakenMultiplier'),
  _.float32le('movementMultiplier'),
  _.float32le('movementResistanceMultiplier'),
  _.float32le('minimumLaunchHeight'),
  _.float32le('launchResistance'),
  _.int32le('unknown24'),
  _.float32le('unknown28'),
  _.float32le('xSize'),
  _.float32le('zSize1'),
  _.float32le('zSize2'),
  _.int32le('unknown3C'),
  _.int32le('unknown40'),
  _.int32le('airActions'),
  _.float32le('unknown50'),
  _.float32le('postDashVelocityMultiplier'),
  _.float32le('unknown58'),
  _.float32le('postDashTraction'),
  _.int32le('unknown8f'),
  _.float32le('flightAcceleration'),
  _.float32le('flightMaxSpeed'),
  _.float32le('flightClearance'),
  _.float32le('unknown68'),
  _.int32le('unknown6C'),
  _.int32le('unknown70'),
  _.int32le('unknown74'),
  _.int32le('unknown78'),
  _.int32le('unknown7C'),
  _.int32le('unknown80'),
  _.int32le('unknown84'),
  _.int32le('unknown88'),
  _.int32le('unknown8C'),
  _.int32le('unknown90'),
  _.int32le('unknown94'),
  _.float32le('minScalingNormals'),
  _.float32le('minScalingSpecials'),
  _.float32le('minScalingHypers'),
  _.int32le('unknownA4'),
  _.int32le('unknownA8'),
  _.int32le('unknownAC'),
  _.int32le('unknownB0'),
  _.int32le('unknownB4'),
  _.int32le('unknownB8'),
  _.int32le('unknownBC'),
  _.int32le('unknownC0'),
  _.int32le('unknownC4'),
  _.int32le('unknownC8'),
  _.int32le('unknownCC'),
  _.int32le('unknownD0'),
  _.int32le('unknownD4'),
  _.struct('xfactor', [
    _.float32le('damageMultipler'),
    _.float32le('speedMultipler'),
    _.float32le('duration'),
    _.int32le('unknown0C'),
    _.int32le('unknown10'),
    _.int32le('unknown14'),
    _.int32le('unknown18'),
    _.float32le('unknown1C'),
    _.float32le('unknown20'),
    _.int32le('unknown24'),
    _.int32le('unknown28'),
    _.int32le('unknown2C')
  ], 3)
])
function unpack (buffer, folder) {
  // Read Header
  const entryHeader = common.CommonHeaderStruct.unpack(buffer, 0)
  const entries = {}
  assert(entryHeader.Type === 'CHS', `This isn't a proper .ccm file, missing header CBA != ${entryHeader.Type}`)
  assert(entryHeader.unknown === 537986820, `Is this really constant? ${entryHeader.unknown}`)
  assert(entryHeader.unknown2 === 0, 'Is this really constant? unknown2')
  // console.log(entryHeader)
  // entryHeader.tableCount = 10;
  for (let i = 0; i < entryHeader.tableCount; i++) {
    const tableEntry = common.CommonTableEntry.unpack(buffer.slice(0x10 + i * 8))
    const cbaHeader = EntryHeader.unpack(buffer.slice(tableEntry.offset))
    entries[printf('0x%0x', tableEntry.id)] = cbaHeader
  }

  // Prepare output folder
  mkdirp.sync(path.join(process.cwd(), 'working', folder))
  const outJS = fs.openSync(path.join(process.cwd(), 'working', folder, 'status.json'), 'w')
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

unpackFile('out/chr/Ryu/status.chs', 'Ryu')
