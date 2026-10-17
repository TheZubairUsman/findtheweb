const { sequelize } = require('../models');
const migrateProductsToDatabase = require('./migrateProductsToDatabase');
const migrateCategoriesData = require('./migrateCategoriesData');

/**
 * Master migration script to run all data migrations
 */
async function runAllMigrations() {
  try {
    console.log('=== Starting Complete Data Migration ===\n');
    
    // Ensure database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.\n');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.\n');
    
    // Run categories migration first
    console.log('1. Running Categories Migration...');
    await migrateCategoriesData();
    console.log('Categories migration completed.\n');
    
    // Run blog posts migration
    console.log('2. Running Blog Posts Migration...');
    await migrateProductsToDatabase();
    console.log('Blog posts migration completed.\n');
    
    console.log('=== All Migrations Completed Successfully ===');
    
  } catch (error) {
    console.error('Migration process failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migrations if called directly
if (require.main === module) {
  runAllMigrations()
    .then(() => {
      console.log('All migrations completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = runAllMigrations;
