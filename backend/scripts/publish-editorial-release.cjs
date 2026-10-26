const fs=require('fs'),path=require('path');
const {sequelize,BlogPost}=require('../src/models');
const {applyEditorialRelease}=require('../src/services/editorialRelease');
const backup=path.resolve(__dirname,'../rollback-seo-20261027-render1');
(async()=>{
 if(process.argv[2]!=='--apply')throw Error('Use --apply only after backup and editorial validation');
 if(!fs.existsSync(path.join(backup,'database.sqlite')))throw Error('Consistent database backup required');
 const records=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../editorial-release-20261027.json'),'utf8'));
 const before=await BlogPost.count();
 const result=await applyEditorialRelease({sequelize,BlogPost,records,backup:rows=>fs.writeFileSync(path.join(backup,'editorial-before.json'),JSON.stringify(rows,null,2),{flag:'wx',mode:0o600})});
 if(await BlogPost.count()!==before)throw Error('Article count changed unexpectedly');
 fs.writeFileSync(path.join(backup,'editorial-after.json'),JSON.stringify(result,null,2),{flag:'wx',mode:0o600});
 console.log(JSON.stringify({updated:result,preservedArticleCount:before}));
})().then(()=>sequelize.close()).catch(async e=>{console.error(e.message);await sequelize.close();process.exitCode=1;});
