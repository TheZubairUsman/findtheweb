const fs=require('fs'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const lines=fs.readFileSync(path.join(root,'tmp/editorial-inspect-safety1.json'),'utf8').split(/\r?\n/);
const baseline=JSON.parse(lines.find(line=>line.startsWith('[{'))||'null');assert(Array.isArray(baseline),'Fresh projected live metadata is required');
const output=[];
for(const [name,cover]of [['extensions','browser-extension-permissions-20261027.png'],['backups','personal-backup-recovery-20261027.png']]){
 const draft=JSON.parse(fs.readFileSync(path.join(root,'content/editorial-'+name+'-20261027.json'),'utf8'));
 const current=baseline.find(row=>row.slug===draft.slug);assert(current,'Live article missing');assert.equal(draft.expectedContentSha256,current.expectedContentSha256,'Article changed since the source draft was researched');assert.equal(draft.title,current.expectedTitle,'Article title changed');
 const words=draft.content.replace(/<[^>]*>/g,' ').trim().split(/\s+/).length;assert(words>=900&&words<=1600,'Review article length');assert(!/<h1\b|<(?:script|iframe|form|object|embed)\b/i.test(draft.content));
 assert(draft.content.includes('<figure>')&&draft.content.includes('<figcaption>'),'A meaningful process figure is required');
 assert(fs.existsSync(path.join(root,'dist/editorial-images',cover)),'Reviewed cover missing');
 const sources=new Set(draft.sources);for(const match of draft.content.matchAll(/href="([^"]+)"/g))assert(sources.has(match[1]),'Undocumented source link: '+match[1]);
 output.push({...draft,...current,featuredImage:'https://findtheweb.zus3cu.tech/editorial-images/'+cover});
}
fs.writeFileSync(path.join(root,'content/editorial-safety1-20261027.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output.map(r=>({slug:r.slug,words:r.content.replace(/<[^>]*>/g,' ').trim().split(/\s+/).length,sources:r.sources.length,cover:r.featuredImage}))));
