const { backfill } = require('../scripts/backfill-discovery-categories.cjs');
const { Category, Website } = require('../src/models');

test('previews, applies, and safely repeats category mapping', async () => {
  const website = await Website.create({ name: 'Pending mapping', url: 'https://mapping.example.com', description: 'A pending test listing', status: 'pending', metadata: { submittedCategory: { id: 1, name: 'Technology', slug: 'technology' } } });
  const preview = await backfill();
  expect(preview.createCategories).toBeGreaterThan(0);
  expect(preview.linkWebsites).toBe(1);
  expect(await Category.count()).toBe(0);
  const applied = await backfill(true);
  expect(applied.linkWebsites).toBe(1);
  const category = await Category.findOne({ where: { slug: 'technology' } });
  await website.reload();
  expect(website.categoryId).toBe(category.id);
  expect(website.status).toBe('pending');
  const again = await backfill(true);
  expect(again.createCategories).toBe(0);
  expect(again.linkWebsites).toBe(0);
});

test('aborts on conflicting category names without creating categories', async () => {
  await Category.create({ name: 'Conflicting name', slug: 'technology' }, { hooks: false });
  await expect(backfill(true)).rejects.toThrow('Category conflict');
  expect(await Category.count()).toBe(1);
});

test('SQLite integer affinity retains UUID foreign keys in the existing schema', async () => {
  const { sequelize } = require('../src/models');
  await sequelize.query('CREATE TEMP TABLE affinity_categories (id UUID PRIMARY KEY)');
  await sequelize.query('CREATE TEMP TABLE affinity_websites (categoryId INTEGER REFERENCES affinity_categories(id))');
  const id = 'c8990eab-75bf-4a99-950f-502ed7fdd22d';
  await sequelize.query('INSERT INTO affinity_categories (id) VALUES (?)', { replacements: [id] });
  await sequelize.query('INSERT INTO affinity_websites (categoryId) VALUES (?)', { replacements: [id] });
  const [rows] = await sequelize.query('SELECT categoryId, typeof(categoryId) AS storageType FROM affinity_websites');
  expect(rows[0]).toEqual({ categoryId: id, storageType: 'text' });
  await sequelize.query('DROP TABLE affinity_websites');
  await sequelize.query('DROP TABLE affinity_categories');
});
