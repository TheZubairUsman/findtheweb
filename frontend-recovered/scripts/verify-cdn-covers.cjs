const fs=require('fs'),path=require('path'),{chromium}=require('@playwright/test');
const root=path.resolve(__dirname,'../..'),dist=path.join(root,'dist');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':chromium.executablePath())});
 try{
  const page=await browser.newPage();await page.goto('https://findtheweb.zus3cu.tech/robots.txt');
  const results=[];
  for(const file of fs.readdirSync(path.join(dist,'social-covers')).filter(f=>f.endsWith('.png')).sort()){
   const original='data:image/png;base64,'+fs.readFileSync(path.join(dist,'social-covers',file)).toString('base64');
   const result=await page.evaluate(async({original,file})=>{
    async function pixels(src){const img=new Image();img.crossOrigin='anonymous';img.src=src;await img.decode();const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);return ctx.getImageData(0,0,canvas.width,canvas.height).data;}
    const a=await pixels(original),b=await pixels('/social-covers/'+file+'?verify=pixels-20261027');let different=0;
    if(a.length!==b.length)throw Error('Cover dimensions differ: '+file);
    for(let i=0;i<a.length;i++)if(a[i]!==b[i])different++;
    return {file,differentChannels:different,pixelIdentical:different===0};
   },{original,file});results.push(result);
  }
  const out=path.join(root,'docs/qa/seo-20261027');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'cdn-covers.json'),JSON.stringify({checkedAt:new Date().toISOString(),results},null,2));
  console.log(JSON.stringify({covers:results.length,pixelIdentical:results.filter(r=>r.pixelIdentical).length,changed:results.filter(r=>!r.pixelIdentical).length}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
