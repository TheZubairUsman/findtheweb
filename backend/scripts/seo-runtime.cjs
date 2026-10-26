const fs=require('fs'),path=require('path');
const models=require('../src/models');const {sequelize}=models;
const root=path.resolve(__dirname,'..'),backup=path.join(root,'rollback-seo-20261027-render1');
const files=['package.json','package-lock.json','src/index.js','src/routes/seo.js','src/services/editorialSeo.js','src/data/social-covers.json'];
async function counts(){const result={};for(const name of ['Admin','User','BlogPost','Website','CommunityProfile','Collection','ContactMessage'])if(models[name])result[name]=await models[name].count();return result;}
(async()=>{
 if(process.argv[2]==='backup'){
  fs.mkdirSync(backup,{mode:0o700});const present=[];
  for(const file of files)if(fs.existsSync(path.join(root,file))){const target=path.join(backup,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target,fs.constants.COPYFILE_EXCL);present.push(file);}
  await sequelize.query('VACUUM INTO :file',{replacements:{file:path.join(backup,'database.sqlite')}});fs.chmodSync(path.join(backup,'database.sqlite'),0o600);
  fs.writeFileSync(path.join(backup,'baseline.json'),JSON.stringify({counts:await counts(),present}),{mode:0o600,flag:'wx'});console.log('SEO backup complete');
 }else if(process.argv[2]==='verify'){
  const [rows]=await sequelize.query('PRAGMA integrity_check');if(rows[0].integrity_check!=='ok')throw Error('Database integrity failed');
  const baseline=JSON.parse(fs.readFileSync(path.join(backup,'baseline.json'))),current=await counts();for(const [key,value] of Object.entries(baseline.counts))if(current[key]<value)throw Error('Data count decreased: '+key);
  const response=await fetch('http://127.0.0.1:5000/api/v1/seo/articles/technical-seo-for-a-javascript-website');const body=await response.json();if(response.status!==200||!body.data?.content||body.data.author.email)throw Error('Published rendering endpoint failed');
  const receipt={integrity:'ok',counts:current,sanitizer:require('sanitize-html/package.json').version};fs.writeFileSync(path.join(backup,'verification.json'),JSON.stringify(receipt),{mode:0o600});console.log(JSON.stringify(receipt));
 }else throw Error('Expected backup or verify');
})().then(()=>sequelize.close()).catch(async e=>{console.error(e.message);await sequelize.close();process.exitCode=1;});
