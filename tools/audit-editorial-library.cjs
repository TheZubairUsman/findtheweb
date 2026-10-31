// Read-only review gates for the individually researched library rewrite.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {imageMetadata}=require('./image-metadata.cjs');
const root=path.resolve(__dirname,'..');
const plain=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
function auditDraft(draft,baseline,{assets=true}={}){
 const errors=[],warnings=[],check=(ok,message)=>{if(!ok)errors.push(message);};
 const before=baseline.find(r=>r.slug===draft.slug);
 check(Boolean(before),'Article absent from live baseline');
 if(before){check(draft.title===before.expectedTitle,'Title changed');check(draft.expectedContentSha256===before.expectedContentSha256,'Content baseline changed');}
 const content=String(draft.content||''),words=plain(content).split(/\s+/).filter(Boolean).length;
 check(words>=900&&words<=1600,'Needs 900-1600 useful words');
 check(!/<h1\b|<(?:script|iframe|form|object|embed|style|link|meta|base)\b|\son\w+\s*=/i.test(content),'Unsafe markup');
 check(/<figure\b[\s\S]*?<figcaption\b[\s\S]*?<\/figcaption>[\s\S]*?<ol\b[\s\S]*?<\/figure>/i.test(content),'Readable ordered process figure required');
 check((content.match(/<h2\b/gi)||[]).length>=4,'Article needs distinct substantive sections');
 check(/hypothetical|illustrative example/i.test(content),'Example must be labelled honestly');
 check(/checklist/i.test(content),'Actionable finishing checklist required');
 check(typeof draft.excerpt==='string'&&draft.excerpt.length>=70&&draft.excerpt.length<=500,'Excerpt length');
 check(typeof draft.seoTitle==='string'&&draft.seoTitle.length>=15&&draft.seoTitle.length<=255,'SEO title length');
 check(typeof draft.seoDescription==='string'&&draft.seoDescription.length>=90&&draft.seoDescription.length<=320,'SEO description length');
 const sources=Array.isArray(draft.sources)?draft.sources:[],linked=new Set();
 check(new Set(sources).size===sources.length&&sources.length>=2,'At least two distinct primary sources required');
 for(const source of sources){try{const u=new URL(source);check(u.protocol==='https:'&&!u.username&&!u.password,'Only public HTTPS sources');}catch{errors.push('Invalid source URL');}}
 for(const match of content.matchAll(/href="([^"]+)"/g)){const url=match[1].replaceAll('&amp;','&');check(sources.includes(url),'Undocumented inline link: '+url);linked.add(url);}
 check(sources.every(s=>linked.has(s)),'Each source must support an inline claim');
 check(Array.isArray(draft.sourceNotes)&&sources.every(url=>draft.sourceNotes.some(n=>n.url===url&&n.claims&&Number.isFinite(Date.parse(n.checkedAt)))),'Claim and verification notes required for each source');
 check(typeof draft.coverPrompt==='string'&&draft.coverPrompt.length>=70,'Topic-specific cover art direction required');
 if(assets){
  check(/^lib-t[1-6]-[a-z0-9-]+-20261028\.png$/.test(draft.coverFile||''),'Versioned team cover required');
  if(/^lib-t[1-6]-[a-z0-9-]+-20261028\.png$/.test(draft.coverFile||'')){
   try{const png=fs.readFileSync(path.join(root,'dist/editorial-images',draft.coverFile)),webp=fs.readFileSync(path.join(root,'dist/editorial-images',draft.coverFile.replace(/\.png$/,'.webp'))),a=imageMetadata(png),b=imageMetadata(webp);
    check(a.format==='png'&&b.format==='webp'&&a.width===b.width&&a.height===b.height,'Image formats and dimensions differ');
    check(a.width>=1200&&a.height>=630&&a.width/a.height>1.8&&a.width/a.height<2.1,'Landscape cover dimensions');
    check(webp.length<500000,'WebP delivery budget exceeded');
   }catch(error){errors.push('Cover assets unavailable: '+error.message);}
  }
 }
 if(/in today.s.*landscape|game.changer|cutting.edge|revolutionary|guarantee.{0,30}(?:rank|traffic|secure)/i.test(plain(content)))warnings.push('Review generic copy or unsupported guarantee');
 const tags=content.match(/<\/?(?:p|h[2-6]|ul|ol|li|figure|figcaption|pre|code|table|thead|tbody|tr|th|td|blockquote|a|strong|em|caption|div|span)\b[^>]*>/gi)||[],stack=[];
 for(const tag of tags){const name=tag.match(/^<\/?([a-z0-9]+)/i)[1].toLowerCase();if(tag.startsWith('</')){if(stack.pop()!==name){errors.push('Unbalanced HTML at '+tag);break;}}else stack.push(name);}
 check(stack.length===0,'Unclosed HTML tags');
 return {slug:draft.slug,words,sources:sources.length,errors:[...new Set(errors)],warnings,contentSha256:crypto.createHash('sha256').update(content).digest('hex')};
}
function auditLibrary(folder,baseline,options){
 const results=[],paragraphs=new Map(),bodies=new Map();
 for(const team of fs.readdirSync(folder).filter(n=>/^team-[1-6]$/.test(n)).sort())for(const file of fs.readdirSync(path.join(folder,team)).filter(n=>n.endsWith('.json')&&n!=='status.json').sort()){
  const relative=path.relative(root,path.join(folder,team,file)).replaceAll('\\','/');let draft;
  try{draft=JSON.parse(fs.readFileSync(path.join(folder,team,file),'utf8'));}catch(error){results.push({file:relative,errors:['Invalid JSON: '+error.message]});continue;}
  const result={file:relative,...auditDraft(draft,baseline,options)};results.push(result);
  if(bodies.has(result.contentSha256))result.errors.push('Duplicate whole body: '+bodies.get(result.contentSha256));else bodies.set(result.contentSha256,draft.slug);
  for(const p of String(draft.content).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)){
   const value=plain(p[1]).toLowerCase();if(value.length<180)continue;
   const prior=paragraphs.get(value);if(prior&&prior!==draft.slug)result.errors.push('Repeated substantive paragraph from '+prior);else paragraphs.set(value,draft.slug);
  }
 }
 const duplicates=results.filter((r,i)=>results.findIndex(x=>x.slug===r.slug)!==i);for(const r of duplicates)r.errors.push('Duplicate article assignment/output');
 return {checkedAt:new Date().toISOString(),drafts:results.length,ready:results.filter(r=>!r.errors.length).length,results};
}
if(require.main===module){
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'tmp/editorial-full-baseline-20261028.json'))),report=auditLibrary(path.join(root,'content/library-20261028'),baseline,{assets:!process.argv.includes('--text-only')});
 const target=path.join(root,'tmp/editorial-library-audit'+(process.argv.includes('--text-only')?'-text':'')+'.json');fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({drafts:report.drafts,ready:report.ready,failures:report.results.filter(r=>r.errors.length).map(r=>({slug:r.slug,errors:r.errors})),report:path.relative(root,target)}));
 if(report.results.some(r=>r.errors.length))process.exitCode=1;
}
module.exports={auditDraft,auditLibrary};
