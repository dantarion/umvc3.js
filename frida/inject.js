console.log("running")
var loadedFiles = {};
var allocations = {};
//140295380
// Resource Load
Interceptor.attach(ptr("0x140295380"), {
  onEnter: function(args) {
    var resource = {};
    resource.ptr = args[0];
    var path = Memory.readCString(args[0].add(0xC));
    var getExt = Memory.readPointer(Memory.readPointer(args[0]).add(0x30));
    var ext = Memory.readCString((new NativeFunction(getExt, 'pointer', []))());
    resource.file = path + "." + ext;
    this.file = resource.file;
    if (!!loadedFiles[path]) {
      console.error(">>>> Loading duplicate file?", JSON.stringify(resource));
      return;
    }
    console.log(">>>> Resource Loading : ", JSON.stringify(resource));
    loadedFiles[path] = resource;
  },
  onLeave: function(retval){
    if(this.file){
      send(["reqFile",this.file]);
    }
    replaced = [];
  }
});
var replaced = {};
rpc.exports = {
  sendFile: function(filename,data){

    if(!loadedFiles[filename]){
      //console.log("this file isn't loaded.",filename);
      return;
    }

    var resource = loadedFiles[filename];
    var allocation = Memory.alloc(data.data.length);
    if(resource.unloadFrom){
      replaced[filename] = allocations[filename];
      delete allocations[filename];
      Memory.writePointer(resource.ptr.add(0x70),resource.unloadFrom);
    }
    allocations[filename] = allocation;
    Memory.writeByteArray(allocation,data.data);
    resource.unloadFrom = Memory.readPointer(resource.ptr.add(0x70));
    console.error(resource.ptr, resource.unloadFrom,allocation);
    Memory.writePointer(resource.ptr.add(0x70),allocation);
    console.warn(">>>>>>>> Recieving...",filename,data.data.length);
  }
};
// ResourceInit
Interceptor.attach(ptr("0x1402951D0"), {
  onEnter: function(args) {
    var path = Memory.readCString(args[0].add(0xC));
    if (!loadedFiles[path]) {
      console.error(">>>> Unknown file being unloaded", JSON.stringify(resource));
      return;
    }
    var resource = loadedFiles[path];
    if(resource.unloadFrom){
      //delete allocations[path];
      Memory.writePointer(args[0].add(0x70),resource.unloadFrom);
    }
    console.warn(">>>> Resource Unloading :", JSON.stringify(resource));
    delete loadedFiles[path];
  },
});
/*
Interceptor.attach(ptr("0x1402952E0"), {
  onEnter: function(args) {
    var path = Memory.readCString(args[0].add(0xc));
    if (path.indexOf("chr\\") !== -1 && args[1].toInt32() != 0) {
      console.log(args[0], Memory.readCString(args[0].add(0xc)), args[1], args[2], args[3])
    }
  },
  onLeave: function(retval) {
    console.log(retval);
  }


});
*/
