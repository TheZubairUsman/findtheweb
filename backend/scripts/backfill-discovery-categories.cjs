// Run with --apply only after taking and verifying a database backup.
// SQLite accepts UUID text in the existing INTEGER-affinity foreign key column.
const fs = require('fs');
const path = require('path');
const { sequelize, Category, Website } = require('../src/models');

async function backfill(apply = false) {
  if (sequelize.getDialect() !== 'sqlite') throw new Error('This backfill supports SQLite only; migrate the foreign key type first on other databases.');
  const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/categories.json'), 'utf8'));
  if (!Array.isArray(source) || !source.length) throw new Error('Category export is empty or invalid');
  const ids = new Set();
  const slugs = new Set();
  for (const category of source) {
    if (!category.id || !category.name || !category.slug || ids.has(String(category.id)) || slugs.has(category.slug)) throw new Error('Invalid or duplicate exported category');
    ids.add(String(category.id)); slugs.add(category.slug);
  }
  const result = await sequelize.transaction(async transaction => {
    const existing = await Category.findAll({ transaction });
    const bySlug = new Map(existing.map(category => [category.slug, category]));
    let created = 0; let linked = 0;
    for (const sourceCategory of source) {
      const found = bySlug.get(sourceCategory.slug);
      if (found && found.name !== sourceCategory.name) throw new Error(`Category conflict for ${sourceCategory.slug}`);
      if (!found) {
        created++;
        if (apply) bySlug.set(sourceCategory.slug, await Category.create({ name: sourceCategory.name, slug: sourceCategory.slug, description: sourceCategory.description || null }, { transaction, hooks: false }));
      }
    }
    const websites = await Website.findAll({ where: { categoryId: null }, transaction });
    for (const website of websites) {
      const submitted = website.metadata?.submittedCategory;
      if (!submitted) continue;
      const match = source.find(category => String(category.id) === String(submitted.id) && category.slug === submitted.slug);
      if (!match) throw new Error(`Unmatched category for website ${website.id}`);
      linked++;
      if (apply) await website.update({ categoryId: bySlug.get(match.slug).id }, { transaction });
    }
    return { mode: apply ? 'applied' : 'preview', exportedCategories: source.length, createCategories: created, linkWebsites: linked };
  });
  return result;
}
module.exports = { backfill };
if (require.main === module) {
  backfill(process.argv.includes('--apply')).then(result => console.log(JSON.stringify(result)))
    .catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => sequelize.close());
}
