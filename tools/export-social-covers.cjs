// Raster export only: preserves the existing article artwork, without redesign.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {chromium}=require('../frontend-recovered/node_modules/@playwright/test');
const root=path.resolve(__dirname,'..');
const posts=JSON.parse(fs.readFileSync(path.join(root,'tmp/content-audit-snapshot.json'),'utf8'));
const out=path.join(root,'dist/social-covers');fs.mkdirSync(out,{recursive:true});
const manifest={};
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':chromium.executablePath())});
try {
const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
for(const post of posts){
 if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,254}$/.test(post.slug))throw Error('Unsafe slug');
 const source=post.featuredImage || ''; let svg;
 if(source.startsWith('data:image/svg+xml;base64,'))svg=Buffer.from(source.split(',')[1],'base64').toString('utf8');
 else { const url=new URL(source,'https://findtheweb.zus3cu.tech');
   if(url.origin!=='https://findtheweb.zus3cu.tech'||!/^\/editorial-covers\/[a-zA-Z0-9_-]+\.svg$/.test(url.pathname))continue;
   svg=fs.readFileSync(path.join(root,'dist',url.pathname),'utf8');
 }
 if(svg.length>500000||!/^\s*<svg\b/.test(svg)||/<(?:script|foreignObject)|<!DOCTYPE|<!ENTITY|\bon\w+\s*=|javascript:|(?:href\s*=\s*["']|url\(\s*["']?)https?:/i.test(svg))throw Error('Unsupported SVG: '+post.slug);
 await page.setContent(`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:"><style>html,body{margin:0;padding:0;width:1200px;height:630px;overflow:hidden}svg{display:block}</style>${svg}`);
 await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:path.join(out,post.slug+'.png'),type:'png',animations:'disabled'});
 manifest[post.slug]={sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),url:'https://findtheweb.zus3cu.tech/social-covers/'+post.slug+'.png'};
 if(Object.keys(manifest).length%50===0)console.log('Exported '+Object.keys(manifest).length+' covers');
}
const target=path.join(root,'backend/src/data/social-covers.json');fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({rasterizedExistingCovers:Object.keys(manifest).length}));
} finally {await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
