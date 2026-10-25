const { sequelize } = require('../src/models');

// Setup test database
beforeAll(async () => {
  // Use test database
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = 'findtheweb_test';
  // Tests must be self-contained; production secrets are never required here.
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'findtheweb-test-only-secret';
  
  // Sync database for tests
  await sequelize.sync({ force: true });
});

// Cleanup after all tests
afterAll(async () => {
  await sequelize.close();
});

// Clean database before each test
beforeEach(async () => {
  // Clear all tables
  const models = Object.keys(sequelize.models);
  for (const model of models) {
    await sequelize.models[model].destroy({ where: {}, force: true });
  }
});
