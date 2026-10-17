const fs = require('fs');
const path = require('path');
const { BlogPost } = require('../models');

/**
 * Migration script to move blog posts from JSON file to database
 */
async function migrateProductsToDatabase() {
  try {
    console.log('Starting blog posts migration to database...');
    
    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../../src/data/blogPosts.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.error('Blog posts JSON file not found at:', jsonPath);
      return;
    }
    
    const blogPostsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    if (!Array.isArray(blogPostsData)) {
      console.error('Invalid blog posts data format');
      return;
    }
    
    console.log(`Found ${blogPostsData.length} blog posts to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const postData of blogPostsData) {
      try {
        // Check if post already exists
        const existingPost = await BlogPost.findOne({
          where: { slug: postData.slug }
        });
        
        if (existingPost) {
          console.log(`Skipping existing post: ${postData.title}`);
          skippedCount++;
          continue;
        }
        
        // Create new blog post
        const newPost = await BlogPost.create({
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          content: postData.content,
          author: postData.author || 'Admin',
          publishDate: new Date(postData.publishDate),
          modifiedDate: new Date(postData.modifiedDate || postData.publishDate),
          image: postData.image,
          url: postData.url,
          tags: postData.tags || [],
          category: postData.category,
          readingTime: postData.readingTime || 5,
          featured: postData.featured || false,
          status: 'published',
          viewCount: 0,
          seoTitle: postData.title,
          seoDescription: postData.excerpt,
          seoKeywords: postData.tags ? postData.tags.join(', ') : ''
        });
        
        console.log(`Migrated: ${newPost.title}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`Error migrating post "${postData.title}":`, error.message);
      }
    }
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total posts processed: ${blogPostsData.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Skipped (already exist): ${skippedCount}`);
    console.log('Migration completed!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateProductsToDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateProductsToDatabase;
