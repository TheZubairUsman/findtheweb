const fs = require('fs');
const path = require('path');
const { sequelize, ContactMessage } = require('../src/models');
(async () => {
  const mode = process.argv[2];
  if (mode === 'backup') {
    if (sequelize.getDialect() !== 'sqlite') throw new Error('Use provider-native backup for this database dialect');
    const folder = path.resolve(__dirname, '..', 'rollback-contact-' + new Date().toISOString().replace(/[:.]/g, '-'));
    fs.mkdirSync(folder, { mode: 0o700 });
    fs.copyFileSync(path.resolve(__dirname, '../src/index.js'), path.join(folder, 'index.js'));
    await sequelize.query('VACUUM INTO :file', { replacements: { file: path.join(folder, 'database.sqlite') } });
    fs.chmodSync(path.join(folder, 'database.sqlite'), 0o600);
    console.log('Contact release backup: ' + folder);
  } else if (mode === 'schema') {
    if (!ContactMessage) throw new Error('ContactMessage model must be deployed first');
    await ContactMessage.sync();
    console.log('Contact inbox table ready; existing tables unchanged');
  } else throw new Error('Expected backup or schema mode');
})().then(() => sequelize.close()).catch(async error => { console.error(error.message); await sequelize.close(); process.exitCode = 1; });
