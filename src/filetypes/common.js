const _ = require('struct-fu')
module.exports.CommonHeaderStruct = _.struct([
  _.char('Type', 4),
  _.uint32le('unknown'),
  _.uint32le('tableCount'),
  _.uint32le('unknown2')
])

module.exports.CommonTableEntry = _.struct('CommonTableEntry', [
  _.int32le('id'), _.uint32le('offset')
], function () {
  console.log('test', arguments)
})
module.exports.ReqBlock = _.struct([
  _.uint32le('id'),
  _.int32le('unknown'),
  _.int32le('unknown2'),
  _.int32le('unknown3'),
  _.int32le('unknown4'),
  _.int32le('unknown5'),
  _.int32le('unknown6'),
  _.int32le('unknown7')
])
module.exports.ReqBlockTypes = {
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
