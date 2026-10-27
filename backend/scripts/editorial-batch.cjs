const fs=require('fs'),path=require('path');
const startupLog=console.log;let models;
try{console.log=(...args)=>console.error(...args);models=require('../src/models');}finally{console.log=startupLog;}
const {sequelize,BlogPost}=models;
const {applyEditorialRelease,restoreEditorialRelease,digest,editorialReleaseVersion}=require('../src/services/editorialRelease');
sequelize.options.logging=false;
const root=path.resolve(__dirname,'..');
async function inspect(slugs){
 if(!slugs.length||slugs.length>10||slugs.some(s=>! /^[a-z0-9][a-z0-9_-]{0,254}$/.test(s)))throw Error('Provide 1-10 valid slugs');
 const rows=[];for(const slug of slugs){const post=await BlogPost.findOne({where:{slug,status:'published'}});if(!post||post.publishedAt>new Date())throw Error('Published article required');rows.push({slug,expectedTitle:post.title,expectedContentSha256:digest(post.content),expectedFeaturedImageSha256:digest(post.featuredImage),expectedFields:Object.fromEntries(['excerpt','seoTitle','seoDescription'].map(k=>[k,post[k]??null])),publishedAt:post.publishedAt});}return rows;
}
(async()=>{
 const [mode,id,...args]=process.argv.slice(2);
 if(mode==='inspect'){console.log(JSON.stringify(await inspect([id,...args])));return;}
 if(editorialReleaseVersion!==2)throw Error('Deploy the reviewed editorial release service before publishing');
 if(!['preview','apply','rollback'].includes(mode)||! /^[a-z0-9][a-z0-9-]{2,71}$/.test(id||''))throw Error('Use preview/apply/rollback with a safe release id');
 const input=path.join(root,'editorial-releases',id+'.json'),backup=path.join(root,'editorial-backups',id);
 if(mode==='rollback'){
  const previous=JSON.parse(fs.readFileSync(path.join(backup,'before.json'))),applied=JSON.parse(fs.readFileSync(path.join(backup,'after.json')));
  if(fs.existsSync(path.join(backup,'rollback.json')))throw Error('Release already rolled back');
  const result=await restoreEditorialRelease({sequelize,BlogPost,previous,applied});
  fs.writeFileSync(path.join(backup,'rollback.json'),JSON.stringify(result,null,2),{flag:'wx',mode:0o600});console.log(JSON.stringify({release:id,rolledBack:result}));return;
 }
 const records=JSON.parse(fs.readFileSync(input,'utf8'));
 const preview=await applyEditorialRelease({sequelize,BlogPost,records,dryRun:true});
 if(mode==='preview'){console.log(JSON.stringify({release:id,preview}));return;}
 if(sequelize.getDialect()!=='sqlite')throw Error('Provider-native backup required before publishing on this database');
 fs.mkdirSync(path.dirname(backup),{recursive:true,mode:0o700});fs.mkdirSync(backup,{mode:0o700});
 await sequelize.query('VACUUM INTO :file',{replacements:{file:path.join(backup,'database.sqlite')}});fs.chmodSync(path.join(backup,'database.sqlite'),0o600);
 fs.copyFileSync(input,path.join(backup,'release.json'),fs.constants.COPYFILE_EXCL);fs.chmodSync(path.join(backup,'release.json'),0o600);
 const before=await BlogPost.count();
 const applied=await applyEditorialRelease({sequelize,BlogPost,records,backup:rows=>fs.writeFileSync(path.join(backup,'before.json'),JSON.stringify(rows,null,2),{flag:'wx',mode:0o600})});
 fs.writeFileSync(path.join(backup,'after.json'),JSON.stringify(applied,null,2),{flag:'wx',mode:0o600});
 console.log(JSON.stringify({release:id,updated:applied,articlesBefore:before,articlesAfter:await BlogPost.count()}));
})().then(()=>sequelize.close()).catch(async error=>{console.error(error.message);await sequelize.close();process.exitCode=1;});
