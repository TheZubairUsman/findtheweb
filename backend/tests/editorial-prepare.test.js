const fs=require('fs'),path=require('path');
const {prepare}=require('../../tools/prepare-editorial-release.cjs');
const root=path.resolve(__dirname,'../..');let folder,config;
const relative=file=>path.relative(root,path.join(folder,file)).replaceAll('\\','/');
beforeEach(()=>{
 fs.mkdirSync(path.join(root,'tmp'),{recursive:true});folder=fs.mkdtempSync(path.join(root,'tmp/editorial-prepare-'));
 const slug='fixture-editorial';
 fs.writeFileSync(path.join(folder,'baseline.json'),JSON.stringify([{slug,expectedTitle:'Fixture title',expectedContentSha256:'a'.repeat(64),expectedFeaturedImageSha256:'b'.repeat(64),expectedFields:{excerpt:null,seoTitle:null,seoDescription:null},publishedAt:'2025-01-01T00:00:00.000Z'}]));
 fs.writeFileSync(path.join(folder,'draft.json'),JSON.stringify({slug,title:'Fixture title',expectedContentSha256:'a'.repeat(64),content:'<p>'+'Specific useful workflow detail. '.repeat(260)+'</p><figure><figcaption>Review process</figcaption><ol><li>Check the evidence.</li></ol></figure><p><a href="https://example.com/help">Source</a></p>',excerpt:'Fixture excerpt',seoTitle:'Fixture title',seoDescription:'Fixture description',sources:['https://example.com/help']}));
 config={releaseId:'fixture-release',baseline:relative('baseline.json'),output:relative('output.json'),articles:[{draft:relative('draft.json'),cover:'browser-extension-permissions-20261027.png'}]};
});
afterEach(()=>{const resolved=path.resolve(folder);if(!resolved.startsWith(path.join(root,'tmp')+path.sep))throw Error('Cleanup escaped test workspace');fs.rmSync(resolved,{recursive:true,force:true});});
it('assembles a reviewed release idempotently without changing its input',()=>{
 const source=fs.readFileSync(path.join(folder,'draft.json'),'utf8'),first=prepare(config);
 expect(first[0].featuredImage).toMatch(/\.webp$/);expect(first[0].expectedSocialImage).toMatch(/\.png$/);expect(prepare(config)).toEqual(first);expect(fs.readFileSync(path.join(folder,'draft.json'),'utf8')).toBe(source);
});
it('rejects stale research and duplicate articles before writing output',()=>{
 const baseline=JSON.parse(fs.readFileSync(path.join(folder,'baseline.json')));baseline[0].expectedContentSha256='c'.repeat(64);fs.writeFileSync(path.join(folder,'baseline.json'),JSON.stringify(baseline));
 expect(()=>prepare(config)).toThrow('Content changed');expect(fs.existsSync(path.join(folder,'output.json'))).toBe(false);
 baseline[0].expectedContentSha256='a'.repeat(64);fs.writeFileSync(path.join(folder,'baseline.json'),JSON.stringify(baseline));config.articles.push(config.articles[0]);expect(()=>prepare(config)).toThrow('duplicate article');expect(fs.existsSync(path.join(folder,'output.json'))).toBe(false);
});
it('rejects paths outside the content workspace and refuses to replace an input',()=>{
 config.baseline='../../outside.json';expect(()=>prepare(config)).toThrow('Path must stay');
 config.baseline=relative('baseline.json');config.output='backend/package.json';expect(()=>prepare(config)).toThrow('inside content or tmp');
 config.output=config.articles[0].draft;expect(()=>prepare(config)).toThrow('cannot replace an input');
});
it('does not silently overwrite a different prepared release',()=>{
 fs.writeFileSync(path.join(folder,'output.json'),'[]\n');expect(()=>prepare(config)).toThrow('Existing release differs');expect(fs.readFileSync(path.join(folder,'output.json'),'utf8')).toBe('[]\n');
});
