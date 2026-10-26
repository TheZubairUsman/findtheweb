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
    const entry = Object.entries(result.metafile.outputs).find(([,v]) => v.entryPoint === 'src/main.jsx');
    if(!entry) throw Error('Frontend entry missing');
    const entryFile = '/' + path.relative(path.join(repo,'dist'),path.resolve(root,entry[0])).replaceAll('\\','/');
    const css = entry[1].cssBundle && '/' + path.relative(path.join(repo,'dist'),path.resolve(root,entry[1].cssBundle)).replaceAll('\\','/');
    let html = fs.readFileSync(path.join(root,'index.html'),'utf8').replace('<!-- FRONTEND_ENTRY -->',`<script type="module" src="${entryFile}"></script>${css ? `<link rel="stylesheet" href="${css}">` : ''}`);
    fs.writeFileSync(path.join(repo,'dist/index.html'),html);
    const assets = Object.keys(result.metafile.outputs).map(file => '/'+path.relative(path.join(repo,'dist'),path.resolve(root,file)).replaceAll('\\','/')).sort();
    fs.writeFileSync(path.join(repo,'dist/frontend-build.json'),JSON.stringify({entry:entryFile,css,assets,dependencies:require('../package.json').dependencies},null,2)+'\n');
    const files = {};
    for(const file of ['index.html','frontend-build.json','findtheweb-release.js','findtheweb-release.css','contact-inbox.js','robots.txt','sitemap.xml',...assets.map(a=>a.slice(1))]) {
      const bytes = fs.readFileSync(path.join(repo,'dist',file));
      files[file] = {sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};
    }
    fs.writeFileSync(path.join(repo,'dist/release-manifest.json'),JSON.stringify({release:'frontend-source-20261027',files,rollback:'Restore dist from Git commit 0abcdba; new hashed assets can remain. Re-run public and browser smoke checks. No database rollback is required.'},null,2)+'\n');
  });
  console.log('Frontend rebuilt from source.');
})().catch(error => {console.error(error.message);process.exitCode=1;});
