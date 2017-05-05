const _ = require('struct-fu')
module.exports.CommonHeaderStruct = _.struct([
  _.char('Type', 4),
  _.uint32le('unknown'),
  _.uint32le('tableCount'),
  _.uint32le('unknown2')
])

module.exports.CommonTableEntry = _.struct('CommonTableEntry', [
  _.uint32le('id'),
  _.uint32le('offset')], function () { console.log('test', arguments) })
