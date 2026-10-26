const fs = require('fs');
const os = require('os');
const path = require('path');
const bcrypt = require('bcrypt');
const legacyBcrypt = require('bcryptjs');
const Handlebars = require('handlebars');
const { Sequelize, DataTypes } = require('sequelize');
const proxyaddr = require(require.resolve('proxy-addr', { paths: [path.dirname(require.resolve('express'))] }));

describe('Security dependency compatibility', () => {
  it('composes email locally with the upgraded mail transport', async () => {
    const transport = require('nodemailer').createTransport({ jsonTransport: true, disableFileAccess: true, disableUrlAccess: true });
    const info = await transport.sendMail({ from: 'FindTheWeb <sender@example.test>', to: 'reader@example.test', subject: 'Article update', text: 'Your reading list is ready.', html: '<p>Your reading list is ready.</p>' });
    const message = JSON.parse(info.message);
    expect(message.subject).toBe('Article update');
    expect(message.to[0].address).toBe('reader@example.test');
    expect(message.html).toContain('reading list');
  });

  it('preserves Sequelize UUID default generation after the UUID upgrade', async () => {
    const db = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
    try {
      const Row = db.define('UuidCompatibility', { id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true } });
      await db.sync();
      const row = await Row.create({});
      expect(require('uuid').validate(row.id)).toBe(true);
      expect(require('uuid').version(row.id)).toBe(4);
    } finally { await db.close(); }
  });
  it('verifies existing bcrypt hashes without a password reset', async () => {
    const hash = await legacyBcrypt.hash('test-only-password', 4);
    expect(await bcrypt.compare('test-only-password', hash)).toBe(true);
    expect(await bcrypt.compare('wrong-password', hash)).toBe(false);
    const newHash = await bcrypt.hash('test-only-password', 4);
    expect(await legacyBcrypt.compare('test-only-password', newHash)).toBe(true);
  });

  it('does not trust arbitrary IPv4 clients via a short mapped IPv6 prefix', () => {
    const trust = proxyaddr.compile('::ffff:10.0.0.0/8');
    expect(trust('203.0.113.5')).toBe(false);
    expect(proxyaddr.compile('10.0.0.0/8')('10.1.2.3')).toBe(true);
  });

  it('renders ordinary templates while escaping untrusted content', () => {
    const render = Handlebars.compile('Hello {{name}}: {{message}}');
    expect(render({name:'Visitor',message:'<script>alert(1)</script>'})).toContain('&lt;script&gt;');
    expect(Handlebars.compile('{{lookup value "constructor"}}')({value:{}})).toBe('');
  });

  it('preserves file-backed SQLite data across close and reopen', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'findtheweb-sqlite-qa-'));
    const file = path.join(dir, 'compat.sqlite');
    let db;
    try {
      db = new Sequelize({dialect:'sqlite',storage:file,logging:false});
      const Row = db.define('Compatibility', {title:DataTypes.STRING,metadata:DataTypes.JSON});
      await db.sync();
      await Row.create({title:'Retained article',metadata:{tags:['security','qa']}});
      await db.close();
      db = new Sequelize({dialect:'sqlite',storage:file,logging:false});
      const Restored = db.define('Compatibility', {title:DataTypes.STRING,metadata:DataTypes.JSON});
      const record = await Restored.findOne();
      expect(record.title).toBe('Retained article');
      expect(record.metadata.tags).toEqual(['security','qa']);
      const [integrity] = await db.query('PRAGMA integrity_check');
      expect(integrity[0].integrity_check).toBe('ok');
    } finally {
      if (db) await db.close();
      if (fs.existsSync(file)) fs.unlinkSync(file);
      fs.rmdirSync(dir);
    }
  });
});
