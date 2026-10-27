function imageMetadata(bytes){
 if(bytes.length>=24&&bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a')return {format:'png',width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
 if(bytes.length>=30&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'){
  const kind=bytes.toString('ascii',12,16);
  if(kind==='VP8X')return {format:'webp',width:bytes.readUIntLE(24,3)+1,height:bytes.readUIntLE(27,3)+1};
  if(kind==='VP8 '&&bytes.subarray(23,26).toString('hex')==='9d012a')return {format:'webp',width:bytes.readUInt16LE(26)&16383,height:bytes.readUInt16LE(28)&16383};
  if(kind==='VP8L'&&bytes[20]===47){const bits=bytes.readUInt32LE(21);return {format:'webp',width:(bits&16383)+1,height:((bits>>>14)&16383)+1};}
 }
 throw Error('Unsupported or incomplete image header');
}
module.exports={imageMetadata};
