#!/usr/bin/env node

const baseUrl = (process.env.FINDTHEWEB_PUBLIC_URL || 'https://findtheweb.zus3cu.tech').replace(/\/$/, '');
const apiUrl = (process.env.FINDTHEWEB_API_URL || 'https://api.zus3cu.tech/findtheweb').replace(/\/$/, '');

const checks = [
  { name: 'public home', url: `${baseUrl}/`, status: 200 },
  { name: 'public blog', url: `${baseUrl}/blog`, status: 200 },
  { name: 'public discover', url: `${baseUrl}/discover/5`, status: 200 },
  { name: 'legacy products route', url: `${baseUrl}/products`, status: 200 },
  { name: 'admin entry', url: `${baseUrl}/admin`, status: 200 },
  { name: 'robots', url: `${baseUrl}/robots.txt`, status: 200 },
  { name: 'sitemap', url: `${baseUrl}/sitemap.xml`, status: 200 },
  { name: 'api health', url: `${apiUrl}/health`, status: 200 },
  { name: 'api discovery', url: `${apiUrl}/api/v1/discover/5`, status: 200 },
  { name: 'admin remains protected', url: `${apiUrl}/api/v1/admin/websites`, status: 401 },
];

async function request(check) {
  const response = await fetch(check.url, { redirect: 'manual', headers: { 'user-agent': 'findtheweb-release-check/1.0' } });
  if (response.status !== check.status) {
    throw new Error(`${check.name}: expected ${check.status}, received ${response.status}`);
  }

  const text = await response.text();
  if (check.name === 'api health') {
    const payload = JSON.parse(text);
    if (payload.status !== 'ok') throw new Error('api health: status is not ok');
  }
  if (check.name === 'sitemap' && !/<urlset[\s>]/i.test(text)) {
    throw new Error('sitemap: response is not XML urlset content');
  }
  return { name: check.name, status: response.status };
}

(async () => {
  const results = [];
  for (const check of checks) results.push(await request(check));
  console.log(JSON.stringify({ ok: true, baseUrl, apiUrl, checks: results }, null, 2));
})().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message, cause: error.cause?.code || error.cause?.message || null }, null, 2));
  process.exitCode = 1;
});
