// Local-only QA host: ephemeral database and test-only identity.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = require('crypto').randomBytes(32).toString('hex');
process.env.TRUST_PROXY = 'false';
process.env.CORS_ORIGINS = 'http://127.0.0.1:5097';
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = require('../src/index');
const { sequelize, Admin } = require('../src/models');
const host = express();
const dist = path.resolve(__dirname, '../../dist');
host.use('/api', (req, res, next) => { req.url = '/api' + req.url; app(req, res, next); });
host.use((req, res, next) => {
  if (/^\/(auth|analytics|websites)(\/|$)/.test(req.path) || /^\/admin\/(posts|dashboard)(\/|$)/.test(req.path) || /^\/blog\/(posts|categories|tags)(\/|$)/.test(req.path)) {
    req.url = '/api/v1' + req.url;
    return app(req, res, next);
  }
  next();
});
host.get(/\.(js|html)$/, (req, res, next) => {
  const target = path.resolve(dist, '.' + req.path);
  if (!target.startsWith(dist + path.sep) || !fs.existsSync(target)) return next();
  let body = fs.readFileSync(target, 'utf8').replaceAll('https://api.zus3cu.tech/findtheweb', 'http://127.0.0.1:5097');
  res.type(target.endsWith('.js') ? 'application/javascript' : 'text/html').send(body);
});
host.use(express.static(dist, { index: false }));
host.get('*', (req, res) => res.type('html').send(fs.readFileSync(path.join(dist, 'index.html'), 'utf8')));
(async () => {
  await sequelize.sync();
  await Admin.create({email:'browser-qa@example.test',password:'Local-QA-only-2026!',name:'Browser QA Editor',isActive:true});
  host.listen(5097, '127.0.0.1', () => console.log('Ephemeral browser QA ready at http://127.0.0.1:5097/admin/login'));
})();
