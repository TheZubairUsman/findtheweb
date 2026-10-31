// Local-only QA host: ephemeral database and test-only identity.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = require('crypto').randomBytes(32).toString('hex');
process.env.TRUST_PROXY = 'false';
process.env.CORS_ORIGINS = 'http://127.0.0.1:5097,http://127.0.0.1:5098';
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = require('../src/index');
const { sequelize, Admin, BlogPost } = require('../src/models');
const host = express();
const dist = path.resolve(__dirname, '../../dist');
function localHtml(body) {
  return body.replace(/<script\b[^>]*src="https:\/\/(?:www\.googletagmanager\.com|pagead2\.googlesyndication\.com)[^"]*"[^>]*><\/script>/g, '');
}
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
  res.type(target.endsWith('.js') ? 'application/javascript' : 'text/html').send(target.endsWith('.html') ? localHtml(body) : body);
});
host.use(express.static(dist, { index: false }));
host.get('*', (req, res) => res.type('html').send(localHtml(fs.readFileSync(path.join(dist, 'index.html'), 'utf8'))));
(async () => {
  await sequelize.sync();
  await Admin.create({email:'browser-qa@example.test',password:'Local-QA-only-2026!',name:'Browser QA Editor',isActive:true});
  await BlogPost.bulkCreate([
    {title:'Safe automation QA guide',slug:'safe-automation-qa-guide',content:'<h2>Build a reliable workflow</h2><p>Keep useful steps, verify results and protect user data.</p><p>Example address: <code>https://work.example.com.review.example.net/</code></p><figure><figcaption>Safe workflow process</figcaption><ol><li>Review the scope.</li><li>Check a disposable example.</li><li>Record the verified result.</li></ol></figure><img src="x" onerror="window.__unsafeArticle=true"><script>window.__unsafeArticle=true</script>',excerpt:'Local QA fixture for automation readers.',status:'published',publishedAt:new Date(),featured:true,categories:['AI & Automation'],tags:['automation'],authorName:'QA Editor',featuredImage:'/logo.png'},
    {title:'Cybersecurity QA checklist',slug:'cybersecurity-qa-checklist',content:'<h2>Security review</h2><p>Verify authorization and protect data.</p>',excerpt:'Local QA fixture for security readers.',status:'published',publishedAt:new Date(),featured:true,categories:['Cybersecurity'],tags:['security'],authorName:'QA Editor',featuredImage:'/logo.png'}
  ]);
  const codeFixture=await BlogPost.findOne({where:{slug:'safe-automation-qa-guide'}});
  await codeFixture.update({content:codeFixture.content+'<pre><code>&lt;urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"&gt;\n  &lt;url&gt;&lt;loc&gt;https://example.com/a-long-but-valid-article-address&lt;/loc&gt;&lt;/url&gt;\n&lt;/urlset&gt;</code></pre><table><caption>Diagnostic evidence</caption><thead><tr><th scope="col">Request destination</th><th scope="col">Expected response and verification boundary</th></tr></thead><tbody><tr><td><code>https://example.com/a-long-but-valid-article-address</code></td><td>A published article response with the reviewed content.</td></tr></tbody></table>'});
  await BlogPost.bulkCreate(Array.from({length:12},(_,i)=>({title:`Pagination QA article ${i+1}`,slug:`pagination-qa-article-${i+1}`,content:'<p>Isolated pagination fixture.</p>',status:'published',publishedAt:new Date(Date.now()-60000*(i+1)),featured:i===0,categories:['Web Discovery'],tags:['discovery']})));
  await BlogPost.bulkCreate([{title:'Renderer private draft',slug:'seo-private-draft',content:'PrivateMarker',status:'draft'},{title:'Renderer future article',slug:'seo-future-article',content:'FutureMarker',status:'published',publishedAt:new Date(Date.now()+86400000)}]);
  host.listen(5097, '127.0.0.1', () => console.log('Ephemeral browser QA ready at http://127.0.0.1:5097/admin/login'));
})();
