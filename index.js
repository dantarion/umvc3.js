const frida = require('frida');
const fs = require('fs');
const watch = require('node-watch');
const co = require('co');
var api;
var contents = fs.readFileSync(__dirname + '/inject.js', 'utf8');
var timeouts = {};
watch('P:\\FGRE\\umvc3-tools\\out\\', {
  recursive: true,
  followSymLinks: true
}, function(event,filename) {
  if(fs.lstatSync(filename).isDirectory()){
    return;
  }

  if(timeouts[filename]){
    clearTimeout(timeouts[filename]);
  }
  timeouts[filename] = setTimeout(function(){
    console.log(filename,event, 'changed..sending.');
    try{
      var data = fs.readFileSync(filename);
      filename = filename.replace('P:\\FGRE\\umvc3-tools\\out\\','');
      console.log("<<<<<<<<<<<<<<<<< sending replacement file",filename);
      api.sendFile(filename.slice(0,-4), data);
    } catch(e){
      console.error(e);
    }
  },100)

});

co(function*() {
    var session = yield frida.attach('umvc3.exe');
    console.log('attached to UMVC3...:', session);
    var script = yield session.createScript(contents);
    console.log('script injected:', script);
    yield script.load();
    api = yield script.getExports();
    script.events.listen('message', function(message, data) {
      if (!message.payload) {
        console.log(message);
        return;
      }
      try{
        var data = fs.readFileSync("P:\\FGRE\\umvc3-tools\\out\\"+message.payload[1]);
        console.log("<<<<<<<<<<<<<<<<< sending replacement file",message.payload[1]);
        api.sendFile(message.payload[1].slice(0,-4), data);
      } catch(e){
        console.error(e);
      }

    });
    console.log('script loaded! WE IN THERE');
  })
  .catch(function(error) {
    console.log('frida.re error:', error.message);
  });
