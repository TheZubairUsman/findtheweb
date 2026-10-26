const fs = require('fs');
const path = require('path');
const models = require('../src/models');
const { sequelize } = models;
const root = path.resolve(__dirname, '..');
const backup = path.join(root, 'rollback-security-20261026-criticalfix1');
const keys = ['Admin','User','BlogPost','Website','CommunityProfile','Collection','ContactMessage'];
async function counts() {
  const result = {};
  for (const key of keys) if (models[key]) result[key] = await models[key].count();
  return result;
}
(async () => {
  const mode = process.argv[2];
  if (mode === 'backup') {
    if (sequelize.getDialect() !== 'sqlite') throw new Error('Provider-native backup required for this dialect');
    fs.mkdirSync(backup, {mode:0o700});
    for (const file of ['package.json','package-lock.json']) fs.copyFileSync(path.join(root,file),path.join(backup,file),fs.constants.COPYFILE_EXCL);
    await sequelize.query('VACUUM INTO :file',{replacements:{file:path.join(backup,'database.sqlite')}});
    fs.chmodSync(path.join(backup,'database.sqlite'),0o600);
    fs.writeFileSync(path.join(backup,'baseline.json'),JSON.stringify({counts:await counts(),node:process.version}),{mode:0o600,flag:'wx'});
    console.log('Security backup ready: '+backup);
  } else if (mode === 'verify') {
    let healthy = false;
    for (let i=0;i<30;i++) {
      try { const response=await fetch('http://127.0.0.1:5000/health'); if(response.ok){healthy=true;break;} } catch (_) {}
      await new Promise(resolve=>setTimeout(resolve,300));
    }
    if (!healthy) throw new Error('Health did not recover');
    await sequelize.authenticate();
    const [integrity] = await sequelize.query('PRAGMA integrity_check');
    if(integrity[0].integrity_check!=='ok')throw new Error('SQLite integrity check failed');
    const baseline=JSON.parse(fs.readFileSync(path.join(backup,'baseline.json'),'utf8'));
    const current=await counts();
    for(const [key,value] of Object.entries(baseline.counts)) if(current[key]<value)throw new Error('Data count decreased: '+key);
    const expected={handlebars:'4.7.10','proxy-addr':'2.0.8',tar:'7.5.22',sqlite3:'6.0.1',bcrypt:'6.0.0'};
    const installed={};
    for(const [name,version] of Object.entries(expected)) {
      installed[name]=JSON.parse(fs.readFileSync(path.join(root,'node_modules',name,'package.json'),'utf8')).version;
      if(installed[name]!==version)throw new Error('Dependency mismatch: '+name);
    }
    const hash=await require('bcryptjs').hash('runtime-test-only',4);
    if(!await require('bcrypt').compare('runtime-test-only',hash))throw new Error('Legacy password compatibility failed');
    const receipt={health:true,integrity:'ok',counts:current,versions:installed,node:process.version};
    fs.writeFileSync(path.join(backup,'verification.json'),JSON.stringify(receipt),{mode:0o600});
    console.log(JSON.stringify(receipt));
  } else throw new Error('Expected backup or verify mode');
})().then(()=>sequelize.close()).catch(async error=>{console.error(error.message);await sequelize.close();process.exitCode=1;});
