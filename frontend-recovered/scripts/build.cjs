const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const repo = path.resolve(root, '..');
const output = path.join(repo, 'dist/assets/frontend');
// Keep old hashed files for clients with an older HTML document open.
// New entry points never import the legacy vendor tree.
(async () => {
  await esbuild.build({absWorkingDir:root,entryPoints:['src/main.jsx'],outdir:output,bundle:true,splitting:true,format:'esm',platform:'browser',target:'es2020',jsx:'automatic',minify:true,entryNames:'app-[hash]',chunkNames:'chunk-[hash]',assetNames:'asset-[hash]',sourcemap:false,metafile:true,define:{'process.env.NODE_ENV':'"production"'}}).then(result => {
    for(const file of ['seo.php','seo-render.css']) fs.writeFileSync(path.join(repo,'dist',file),fs.readFileSync(path.join(root,'server',file),'utf8').replace(/\r\n/g,'\n'));
    const enabled=fs.existsSync(path.join(root,'server/seo-ready.flag'));
    let rules=fs.readFileSync(path.join(root,'server/htaccess'),'utf8').replace(/\r\n/g,'\n');
    if(!enabled)rules=rules.replace(/# BEGIN_SEO\n[\s\S]*?# END_SEO\n/,'');
    fs.writeFileSync(path.join(repo,'dist/.htaccess'),rules);
    let rootRules=fs.readFileSync(path.join(root,'server/root-htaccess'),'utf8').replace(/\r\n/g,'\n');
    if(!enabled)rootRules=rootRules.replace(/# BEGIN_SEO\n[\s\S]*?# END_SEO\n/,'');
    fs.writeFileSync(path.join(repo,'.htaccess'),rootRules);
    if(enabled) fs.writeFileSync(path.join(repo,'dist/seo-ready.flag'),fs.readFileSync(path.join(root,'server/seo-ready.flag'),'utf8').replace(/\r\n/g,'\n'));
    else if(fs.existsSync(path.join(repo,'dist/seo-ready.flag'))) fs.unlinkSync(path.join(repo,'dist/seo-ready.flag'));
    const entry = Object.entries(result.metafile.outputs).find(([,v]) => v.entryPoint === 'src/main.jsx');
    if(!entry) throw Error('Frontend entry missing');
    const entryFile = '/' + path.relative(path.join(repo,'dist'),path.resolve(root,entry[0])).replaceAll('\\','/');
    const css = entry[1].cssBundle && '/' + path.relative(path.join(repo,'dist'),path.resolve(root,entry[1].cssBundle)).replaceAll('\\','/');
    let html = fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/\r\n/g,'\n').replace('<!-- FRONTEND_ENTRY -->',`<script type="module" src="${entryFile}"></script>${css ? `<link rel="stylesheet" href="${css}">` : ''}`);
    fs.writeFileSync(path.join(repo,'dist/index.html'),html);
    const assets = Object.keys(result.metafile.outputs).map(file => '/'+path.relative(path.join(repo,'dist'),path.resolve(root,file)).replaceAll('\\','/')).sort();
    fs.writeFileSync(path.join(repo,'dist/frontend-build.json'),JSON.stringify({entry:entryFile,css,assets,dependencies:require('../package.json').dependencies},null,2)+'\n');
    const files = {};
    // Git can check text out as CRLF on Windows. Publish canonical LF bytes so
    // production manifests match clean Linux CI builds exactly.
    for(const file of ['findtheweb-release.js','findtheweb-release.css','contact-inbox.js','robots.txt','sitemap.xml','.htaccess']) {
      const target=path.join(repo,'dist',file);
      fs.writeFileSync(target,fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n'));
    }
    const social=fs.readdirSync(path.join(repo,'dist/social-covers')).filter(f=>f.endsWith('.png')).sort().map(f=>'social-covers/'+f);
    for(const file of ['index.html','frontend-build.json','findtheweb-release.js','findtheweb-release.css','contact-inbox.js','robots.txt','seo-render.css',...assets.map(a=>a.slice(1)),...social]) {
      const bytes = fs.readFileSync(path.join(repo,'dist',file));
      files[file] = {sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};
    }
    const serverFiles={};for(const file of ['seo.php','.htaccess',...(enabled?['seo-ready.flag']:[])]){const bytes=fs.readFileSync(path.join(repo,'dist',file));serverFiles[file]={sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};}
    const rootBytes=fs.readFileSync(path.join(repo,'.htaccess'));serverFiles['repository-root/.htaccess']={sha256:crypto.createHash('sha256').update(rootBytes).digest('hex'),bytes:rootBytes.length};
    fs.writeFileSync(path.join(repo,'dist/release-manifest.json'),JSON.stringify({release:'seo-content-20261027',files,serverFiles,rollback:'Restore dist from Git commit 24c148e to disable server rendering; retain code/dependency/content rollback receipts separately. Do not restore the entire database over concurrent user data.'},null,2)+'\n');
  });
  console.log('Frontend rebuilt from source.');
})().catch(error => {console.error(error.message);process.exitCode=1;});
