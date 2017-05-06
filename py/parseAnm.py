import os,struct,json,sys
from collections import OrderedDict,defaultdict

import commandDB
commandUsage = defaultdict(list)
commandFormats = commandDB.commandDB
commandFormats = {}
def hexif(e):
    if isinstance(e,str):
        return e
    elif isinstance(e,float):
        return "%2.5f"%e
    else:
        return hex(e)
def parseFile(filename, charname):
    if not os.path.isfile(filename):
        print filename,"doesn't exist"
        return
    f = open(filename,"rb")
    jsonData = OrderedDict()
    TYPE = f.read(4)[0:3]
    print TYPE
    f.seek(0x4)
    count,count2 = struct.unpack("<II",f.read(8))
    f.seek(0x10)

    print "<table style='width:100%' class='table table-bordered table-sm'>"
    #if TYPE == "ATI":
        #print "<tr><th>"
        #print "</th><th>".join(x for x in ['Index','TOffset','MoveOffset','Startup','Active'])
        #print "</th></tr>"
    for index in range(0,count2):
    #for index in range(0,4):
        entry = OrderedDict()

        f.seek(0x10+index*8)
        ID, PTR, NEXTID, NEXTPTR = struct.unpack("<IIII",f.read(16))
        jsonData[ID] = entry
        if index == count-1:
            f.seek(0,2)
            NEXTPTR = f.tell()
        f.seek(PTR)
        if TYPE == "CBA":
            # size = 0x20
            entry = OrderedDict()
            entry["Index"], entry["AnimChrIndex"] = struct.unpack("<2I",f.read(8))
            entry["Stick"], entry["Stick2"] = struct.unpack("<2I",f.read(8))
            entry["Button"], entry["Button2"] = struct.unpack("<2I",f.read(8))
            entry["Unknown"], entry["Buffer?"] = struct.unpack("<2I",f.read(8))
            if entry["Stick"] == 8 : entry["Stick"] = "DOWN"
            if entry["Stick2"] == 8 : entry["Stick2"] = "DOWN"

            if entry["Button"] == 16 : entry["Button"] = "L"
            if entry["Button"] == 32 : entry["Button"] = "M"
            if entry["Button"] == 64 : entry["Button"] = "H"
            print entry
        elif TYPE == "ATI":
            entry = []

            entry = list(struct.unpack("<4i4i4i3f6i4i3fi2fiiiiiiiiffffffffffiiiiiffiiffiiiiifiiiiiiiiiiiiiiiiiiiiiiiiffffiiiiii",f.read(400)))
            keys = ["unk0", "startup", "unk8", "unkC", "unk10", "unk14", "unk18", "multihit", "unk20", "unk24", "unk28", "unk2C", "unk30", "unk34", "unk38", "flags1", "flags2", "unk44", "hitstunEffect", "attackLevel", "unk50", "unk54", "unk58", "unk5C", "damage", "damageScaling", "damageMultiplier", "unk6C", "unk70", "meterGain", "unk78", "unk7C", "unk80", "unk84", "unk88", "unk8C", "unk90", "unk94", "unk98", "enemyPushback", "corneredPushback", "unkA4", "unkA8", "unkAC", "unkB0", "unkB4", "unkB8", "unkBC", "unkC0", "hitstop", "unkC8", "unkCC", "unkD0", "juggleLength", "unkD8", "unkDC", "juggleSpeed", "unkE4", "unkE8", "unkEC", "unkF0", "unkF4", "unkF8", "unkFC", "unk100", "unk104", "unk108", "unk10C", "unk110", "unk114", "unk118", "unk11C", "unk120", "unk124", "unk128", "unk12C", "unk130", "unk134", "unk138", "unk13C", "unk140", "unk144", "unk148", "unk14C", "hitSfxCategory", "hitSfx", "unk158", "unk15C", "unk160", "unk164", "unk168", "unk16C", "unk170", "unk174", "unk178", "unk17C", "unk180", "unk184", "unk188"]
            jsonData[ID] = dict(zip(keys,entry))
            struct.unpack("<3f",f.read(12))
        else:
            data = struct.unpack("<4i",f.read(4*4))
            for x in range(0,data[0]+1):
                f.seek(PTR+16+x*8)
                t = struct.unpack("<2i",f.read(8))
                subentry = []
                entry[t[0]] = subentry


                f.seek(PTR+t[1])
                data = struct.unpack("<4i",f.read(4*4))
                dataSegment = 0
                for x in range(0,data[1]):
                    f.seek(PTR+t[1]+16+x*8)
                    data2 = struct.unpack("<2i",f.read(8))

                    f.seek(PTR+t[1]+data2[0])
                    data3 = struct.unpack("<4i",f.read(16))
                    #sys.stderr.write(str(data3)+"\n")
                    dataSize = data3[2]
                    #dataSize = 0
                    if dataSize > 0:
                        structfmt = "I"*dataSize*2
                        if (data3[0],data3[1]) in commandFormats:
                            structfmt = commandFormats[(data3[0],data3[1])]
                        params = list(struct.unpack("<"+structfmt,f.read(dataSize*8)))

                        if (data3[0],data3[1]) not in commandFormats:
                            commandFormats[(data3[0],data3[1])] = structfmt
                        f.seek(-dataSize*8,1)
                        fparams = list(struct.unpack("<"+"f"*dataSize*2,f.read(dataSize*8)))
                        for i in range(0,len(params)):

                            if abs(fparams[i]) > 0.001 and abs(fparams[i]) < 1000000000:
                                params[i] = fparams[i]
                                old = commandFormats[(data3[0],data3[1])]
                                commandFormats[(data3[0],data3[1])] = old[0:i] + "f" + old[i+1:]
                        for i in range(0,len(params)):
                            if isinstance(params[i],str):
                                params[i] = params[i].split("\x00")[0]
                            if isinstance(params[i],float):
                                params[i] = str(round(params[i],8))+"f"
                    else:
                        params = []
                    s = "cmd_%02X_%02X(%s)" % (data3[0],data3[1],", ".join(map(hexif,params)))
                    subentry.append({"group":data3[0],"id":data3[1],"params":params})
                    commandUsage[(data3[0],data3[1])].append("%30s 0x%03X %s\n" %(filename,ID,s))
                    dataSegment = data2[0]
    f.close()
    import json
    outpath = "unk"
    if TYPE == "ATI":
        outpath = 'atkinfo'
    else:
        outpath = "anmcmd"
    with open('../boxdox-marvel/public/json/%s/%s.json' % (outpath,charname), 'w') as outfile:
        json.dump(jsonData, outfile)



#parseFile("out\\chr\\cmn\\anmcmn.anm","cmn")
characters = []
for charname in os.listdir("out/chr/"):
    characters.append(charname)
    #if charname not in ["Ryu","cmn"] : continue
    print charname
    parseFile(os.path.join("out","chr",charname,"atkinfo.ati"),charname)
    if charname == "cmn":
        parseFile(os.path.join("out","chr",charname,"anmcmn.anm")",charname)
    else:
        parseFile(os.path.join("out","chr",charname,"anmchr.anm"),charname)
    #parseFile("archive/0001_param/chr/Ryu/baseact.3C6EA504")
    #parseFile("archive/0001_param/chr/Ryu/atkinfo.227A8048")
print characters
print commandFormats
'''
for command, uses in commandUsage.items():
    log = open(("usage/cmd_%02X_%02X.txt" % command),"w")
    for use in uses:
        log.write(use)
    log.close()
    print command, len(uses)
'''
