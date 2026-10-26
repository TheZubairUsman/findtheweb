// Run in the isolated Linux candidate, with production data mounted read-only.
const sqlite = require('sqlite3');
const bcrypt = require('bcrypt');
const legacy = require('bcryptjs');
async function open(file, mode) {
  let database;
  await new Promise((resolve,reject)=>{database=new sqlite.Database(file,mode,error=>error?reject(error):resolve());});
  return database;
}
const get = (db,sql)=>new Promise((resolve,reject)=>db.get(sql,(error,row)=>error?reject(error):resolve(row)));
const run = (db,sql)=>new Promise((resolve,reject)=>db.run(sql,error=>error?reject(error):resolve()));
const close = db=>new Promise((resolve,reject)=>db.close(error=>error?reject(error):resolve()));
(async()=>{
  const memory=await open(':memory:',sqlite.OPEN_READWRITE|sqlite.OPEN_CREATE);
  try {await run(memory,'CREATE TABLE smoke (value TEXT)');await run(memory,"INSERT INTO smoke VALUES ('test')");if((await get(memory,'SELECT value FROM smoke')).value!=='test')throw new Error('SQLite write roundtrip failed');}finally{await close(memory);}
  const db=await open('/production/database.sqlite',sqlite.OPEN_READONLY);
  let report;
  try {report=await get(db,'PRAGMA integrity_check');if(report.integrity_check!=='ok')throw new Error('Production database integrity failed');}finally{await close(db);}
  const hash=await legacy.hash('candidate-test-only',4);
  if(!await bcrypt.compare('candidate-test-only',hash))throw new Error('Legacy hash verification failed');
  console.log(JSON.stringify({linuxNativeModules:true,sqliteWrite:true,productionReadOnlyIntegrity:report.integrity_check,legacyPasswords:true}));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
