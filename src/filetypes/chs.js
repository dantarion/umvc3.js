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
  _.float32le('meterGainMultiplier'),
  _.float32le('damageDealtMultipler'),
  _.float32le('damageTakenMultiplier'),
  _.float32le('movementMultiplier'),
  _.float32le('movementResistanceMultiplier'),
  _.float32le('minimumLaunchHeight'),
  _.float32le('launchResistance'),
  _.int32le('unknown'),
  _.float32le('unknown2f'),
  _.float32le('unknown3f'),
  _.float32le('xSize'),
  _.float32le('zSize1'),
  _.float32le('zSize2'),
  _.int32le('unknown4'),
  _.int32le('unknown5'),
  _.int32le('airActions'),
  _.float32le('unknown6f'),
  _.float32le('postDashVelocityMultiplier'),
  _.float32le('unknown7f'),
  _.float32le('postDashTraction'),
  _.int32le('unknown8f'),
  _.float32le('flightAcceleration'),
  _.float32le('flightMaxSpeed'),
  _.float32le('flightClearance'),
  _.float32le('unknown9f')

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
