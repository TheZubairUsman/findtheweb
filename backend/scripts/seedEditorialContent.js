const fs = require('fs');
const path = require('path');
const { BlogPost, Admin, sequelize } = require('../src/models');

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/editorial-manifest.json'), 'utf8'));
const appUrl = process.env.PUBLIC_SITE_URL || 'https://findtheweb.zus3cu.tech';

function article(post) {
  const sourceLinks = post.sources.map(([name, url]) => `<li><a href="${url}" rel="nofollow noopener noreferrer">${name}</a></li>`).join('');
  const angle = post.title.replace(/^(How to |A Practical |The |An )/i, '');
  return `<p><strong>${post.title}</strong> is a practical field guide for people who want a working result, not a pile of fashionable terms. This guide focuses on ${angle.toLowerCase()}, with decisions you can test in a real project this week.</p><h2>Start with the decision</h2><p>Before choosing a tool or process, write down the outcome, the people affected, the constraints, and what failure would cost. That short brief prevents the most common mistake in technical work: optimizing a component before understanding the job it must do.</p><h2>A useful working model</h2><ol><li><strong>Define the input:</strong> name the data, assumptions, and permissions involved.</li><li><strong>Choose the smallest reliable step:</strong> prefer a reversible experiment over a large commitment.</li><li><strong>Measure the outcome:</strong> track time saved, quality, reliability, and user friction.</li><li><strong>Add a human checkpoint:</strong> keep decisions reviewable when mistakes are expensive.</li></ol><h2>What good implementation looks like</h2><p>Good implementation is visible in the details: clear ownership, documented trade-offs, sensible defaults, and a recovery path when the happy path fails. Use a small test case first, keep the original workflow available, and record the result so the next person does not have to rediscover the same lesson.</p><h2>A checklist you can use today</h2><ul><li>Write the intended outcome in one sentence.</li><li>List the sensitive data and permissions before connecting tools.</li><li>Test one normal case, one edge case, and one failure case.</li><li>Set a success metric and a rollback condition.</li><li>Review the result with someone who was not involved in building it.</li></ul><h2>Sources and further reading</h2><ul>${sourceLinks}</ul><p class="ftw-editorial-note"><em>Editorial note:</em> This article is an original FindTheWeb synthesis. Sources are provided for verification and deeper reading; recommendations should be checked against your own environment and current provider documentation.</p>`;
}

async function run() {
  const admin = await Admin.findOne({ order: [['createdAt', 'ASC']] });
  if (!admin) throw new Error('No admin exists; refusing to seed without an author.');
  let created = 0; let updated = 0;
  for (const post of manifest) {
    const data = { title: post.title, slug: post.slug, excerpt: `A practical 2026 guide to ${post.title.toLowerCase()}, with a clear framework, trade-offs, and an actionable checklist.`, content: article(post), featuredImage: `${appUrl}/editorial-covers/${post.slug}.svg`, status: 'published', publishedAt: new Date(), categories: [post.category], tags: [post.category.toLowerCase(), '2026', 'guide', 'practical'], seoTitle: `${post.title} | FindTheWeb`, seoDescription: `A practical FindTheWeb guide to ${post.title.toLowerCase()}, including trade-offs, examples, and a safe starting checklist.`, seoKeywords: `${post.title.toLowerCase()}, ${post.category.toLowerCase()}, technology guide 2026`, featured: post.index < 2, allowComments: true, authorId: admin.id };
    const [row, wasCreated] = await BlogPost.findOrCreate({ where: { slug: post.slug }, defaults: data });
    if (wasCreated) created += 1; else { await row.update(data); updated += 1; }
  }
  console.log(JSON.stringify({ success: true, total: manifest.length, created, updated }));
}

run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await sequelize.close(); });
