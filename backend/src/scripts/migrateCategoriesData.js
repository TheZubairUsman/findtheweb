const fs = require('fs');
const path = require('path');
const { Category } = require('../models');

/**
 * Migration script to move categories from JSON file to database
 */
async function migrateCategoriesData() {
  try {
    console.log('Starting categories migration to database...');
    
    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../../src/data/categories.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.error('Categories JSON file not found at:', jsonPath);
      return;
    }
    
    const categoriesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    if (!Array.isArray(categoriesData)) {
      console.error('Invalid categories data format');
      return;
    }
    
    console.log(`Found ${categoriesData.length} categories to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const categoryData of categoriesData) {
      try {
        // Check if category already exists
        const existingCategory = await Category.findOne({
          where: { slug: categoryData.slug }
        });
        
        if (existingCategory) {
          console.log(`Skipping existing category: ${categoryData.name}`);
          skippedCount++;
          continue;
        }
        
        // Create new category
        const newCategory = await Category.create({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          icon: categoryData.icon,
          isActive: true,
          sortOrder: migratedCount,
          listingCount: 0
        });
        
        console.log(`Migrated: ${newCategory.name}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`Error migrating category "${categoryData.name}":`, error.message);
      }
    }
    
    console.log('\n=== Categories Migration Summary ===');
    console.log(`Total categories processed: ${categoriesData.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Skipped (already exist): ${skippedCount}`);
    console.log('Categories migration completed!');
    
  } catch (error) {
    console.error('Categories migration failed:', error);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateCategoriesData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Categories migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateCategoriesData;
