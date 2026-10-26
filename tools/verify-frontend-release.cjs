const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const repo = path.resolve(__dirname,'..');
const expected = JSON.parse(fs.readFileSync(path.join(repo,'dist/release-manifest.json'),'utf8'));
const base = (process.env.FINDTHEWEB_PUBLIC_URL || 'https://findtheweb.zus3cu.tech').replace(/\/$/,'');
(async()=>{
 const results=[];
 const entries=Object.entries(expected.files);
 for(let offset=0;offset<entries.length;offset+=4) {
  const batch=await Promise.all(entries.slice(offset,offset+4).map(async([file,record])=>{
   const response=await fetch(`${base}/${file}?verify=frontend-source-20261027`,{signal:AbortSignal.timeout(30000)});
   if(!response.ok) throw Error(`${file}: HTTP ${response.status}`);
   const bytes=Buffer.from(await response.arrayBuffer());
   const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
   if(sha256!==record.sha256) throw Error(`${file}: deployed bytes differ from verified build`);
   return {file,status:response.status,hashVerified:true};
  }));results.push(...batch);
 }
 const receipt={release:expected.release,base,verifiedAt:new Date().toISOString(),files:results};
 const out=path.join(repo,'docs/qa/frontend-20261027');fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'live-release.json'),JSON.stringify(receipt,null,2));
 console.log(JSON.stringify({release:expected.release,verifiedFiles:results.length,allHashesMatch:true}));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
