// Deterministic preparation only. Publishing remains the guarded backend CLI's job.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {auditLibrary}=require('./audit-editorial-library.cjs');
const {prepare}=require('./prepare-editorial-release.cjs');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'content/library-20261028');
const baseline=JSON.parse(fs.readFileSync(path.join(root,'tmp/editorial-full-baseline-20261028.json')));
const progress=JSON.parse(fs.readFileSync(path.join(folder,'progress.json')));
const ledgerFile=path.join(folder,'publication-ledger.json');
const ledger=fs.existsSync(ledgerFile)?JSON.parse(fs.readFileSync(ledgerFile)).releases:[];
const pending=progress.teams.flatMap(t=>t.slugs).sort();
assert.equal(new Set(pending).size,192,'The 192-article assignment must remain unique');
assert.equal(progress.preserved.length,6,'Preserve the six previous upgrades');
assert(pending.every(s=>baseline.some(r=>r.slug===s))&&!pending.some(s=>progress.preserved.includes(s)),'Assignments differ from live inventory');
const review=auditLibrary(folder,baseline),bySlug=new Map(review.results.map(r=>[r.slug,r])),batches=[];
for(let start=0;start<pending.length;start+=10){
 const slugs=pending.slice(start,start+10),number=String(start/10+1).padStart(2,'0'),releaseId='library-'+number+'-20261028';
 const blocked=slugs.filter(s=>!bySlug.has(s)||bySlug.get(s).errors.length);
 const record={releaseId,slugs,state:blocked.length?'pending':'review-ready',blocked};
 const published=ledger.find(r=>r.releaseId===releaseId);
 if(published){
  const file='content/library-20261028/release-'+number+'.json',bytes=fs.readFileSync(path.join(root,file));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),published.releaseSha256,'Published release changed on disk');
  assert.deepEqual([...published.slugs].sort(),slugs,'Published ledger differs from assignment');
  assert(published.liveVerifiedAt&&published.ciRun&&published.commit,'Publication evidence is incomplete');
  batches.push({...record,state:'published-verified',file,liveVerifiedAt:published.liveVerifiedAt});continue;
 }
 if(process.argv.includes('--prepare')&&!blocked.length){
  const config={releaseId,baseline:'tmp/editorial-full-baseline-20261028.json',output:'content/library-20261028/release-'+number+'.json',articles:slugs.map(s=>{const entry=bySlug.get(s),draft=JSON.parse(fs.readFileSync(path.join(root,entry.file)));return {draft:entry.file,cover:draft.coverFile};})};
  const records=prepare(config);fs.writeFileSync(path.join(folder,'config-'+number+'.json'),JSON.stringify(config,null,2)+'\n');
  record.state='prepared';record.file=config.output;record.sha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,config.output))).digest('hex');
  if(process.argv.includes('--update-map')){
   const file=path.join(root,'backend/src/data/social-covers.json'),map=JSON.parse(fs.readFileSync(file));
   for(const r of records)map[r.slug]={sourceSha256:crypto.createHash('sha256').update(r.featuredImage).digest('hex'),url:r.expectedSocialImage};
   fs.writeFileSync(file,JSON.stringify(map,null,2)+'\n');
  }
 }
 batches.push(record);
}
const result={checkedAt:new Date().toISOString(),total:baseline.length,preserved:6,assigned:192,drafts:review.drafts,gatePassed:review.ready,batches};
fs.writeFileSync(path.join(folder,'batch-plan.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({total:result.total,preserved:6,assigned:192,drafts:review.drafts,gatePassed:review.ready,publishedArticles:batches.filter(b=>b.state==='published-verified').reduce((n,b)=>n+b.slugs.length,0),prepared:batches.filter(b=>b.state==='prepared').length,reviewReady:batches.filter(b=>b.state==='review-ready').length,pending:batches.filter(b=>b.state==='pending').length}));
