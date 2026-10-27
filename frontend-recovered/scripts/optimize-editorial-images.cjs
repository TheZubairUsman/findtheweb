// Format optimization only: preserve original generated PNG artwork unchanged.
const fs=require('fs'),path=require('path'),{chromium}=require('@playwright/test');
const folder=path.resolve(__dirname,'../../dist/editorial-images');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':chromium.executablePath())});
 try{const page=await browser.newPage();for(const file of ['browser-extension-permissions-20261027.png','personal-backup-recovery-20261027.png']){
  const target=path.join(folder,file.replace(/\.png$/,'.webp'));if(fs.existsSync(target))throw Error('Versioned optimized asset already exists: '+target);
  const original=fs.readFileSync(path.join(folder,file));
  const output=await page.evaluate(async src=>{const image=new Image();image.src=src;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;canvas.getContext('2d').drawImage(image,0,0);return canvas.toDataURL('image/webp',0.84);},'data:image/png;base64,'+original.toString('base64'));
  if(!output.startsWith('data:image/webp;base64,'))throw Error('WebP encoder unavailable');const bytes=Buffer.from(output.split(',')[1],'base64');fs.writeFileSync(target,bytes,{flag:'wx'});console.log(JSON.stringify({file:path.basename(target),originalBytes:original.length,optimizedBytes:bytes.length}));
 }}finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
