import os,glob,zlib
def extract(filename):
    from struct import unpack,pack
    f = open(filename,"rb")
    print f.read(4)[0:-1]
    version, fileCount = unpack("hh",f.read(4))
    print version,fileCount
    for i in range(0,fileCount):
        f.seek(0x8+i*80)
        name = f.read(64).split("\x00")[0]
        data = unpack("4i",f.read(16))
        print hex(data[0]),name,

        f.seek(data[3])
        realdata = zlib.decompress(f.read(data[1]))
        ext = realdata[0:4].split("\x00")[0].lower()
        print ext
        if ext == "cac":
            ext = "anm"

        name = name+"." +ext
        outdir = "out/"+os.path.dirname(name)
        if not os.path.exists(outdir): os.makedirs(outdir)
        outfile = open("out/"+name,"wb")
        outfile.write(realdata)
        outfile.close()
#extract("archive\\0000_00.arc")
for filename in os.listdir("archive"):
    #if "0001" not in filename: continue
    if ".arc" not in filename: continue
    if "param" not in filename: continue
    print filename
    extract("archive\\"+filename)
    #dummy = open("dummyarc/"+filename,"wb")
    #dummy.write("ARC\x00\x07\x00\x00\x00")
    #dummy.close()

    #break
