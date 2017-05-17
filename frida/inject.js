console.log("running")

/*
var mem = Memory.alloc(0x1000);
var vTables = ["0x140B0F8B8","0x140A6B2A8","0x140A70408","0x140A70328","0x140A70280","0x140A701B8","0x140A700E8","0x140A6FFB8","0x140A6FED8","0x140A6FE20","0x140B11800"]
vTables.forEach((vtableOffset) =>{
  var constructor = Memory.readPointer(ptr(vtableOffset).add(0x8));
  var destructor = Memory.readPointer(ptr(vtableOffset).add(0x18));
  var toStringOff = Memory.readPointer(ptr(vtableOffset).add(0x28));
  var tostr = new NativeFunction(toStringOff, 'pointer', ['pointer','pointer'])
  var extOffset = 0x48;

if(vtableOffset === "0x140B11800"){
  extOffset = 0x40;
}
  if(vtableOffset === "0x140A70280"){
    extOffset = 0x40;
  }
  if(vtableOffset === "0x140A6FE20"){
    extOffset = 0x40;
  }
  var getExt = Memory.readPointer(ptr(vtableOffset).add(extOffset));
  var ext = Memory.readCString((new NativeFunction(getExt, 'pointer', []))());

  console.log(vtableOffset, ext)

  Interceptor.attach(constructor, {
    onLeave: function(retval){
        console.log(getExt,retval,ext)
        //console.log(tostr(retval,mem),mem)

    }
  });
})
*/
var loadedFiles = {};
var allocations = {};
var f = new NativeFunction(ptr("0x1400511D0"), 'void', ['pointer','pointer']);
var mem = Memory.alloc(0x1000)
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
      console.log("this file isn't loaded.",filename);
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
      //console.error(">>>> Unknown file being unloaded", JSON.stringify(resource));
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
