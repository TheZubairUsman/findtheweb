'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Read blog posts data from JSON file
      const postsPath = path.join(__dirname, '../../../src/data/blogPosts.json');
      const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

      const posts = postsData.map((post) => {
        // Generate random vote counts for demo purposes
        const votesUp = Math.floor(Math.random() * 100) + 5; // 5-104 upvotes
        const votesDown = Math.floor(Math.random() * 20); // 0-19 downvotes
        const commentCount = Math.floor(Math.random() * 25); // 0-24 comments
        const viewCount = Math.floor(Math.random() * 1000) + 50; // 50-1049 views

        return {
          id: Sequelize.UUIDV4,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          image: post.image,
          url: post.url,
          status: 'published',
          featured: post.featured || false,
          votes_up: votesUp,
          votes_down: votesDown,
          comment_count: commentCount,
          view_count: viewCount,
          tags: post.tags || [],
          category: post.category,
          published_at: new Date(post.publishDate),
          created_at: new Date(post.publishDate),
          updated_at: new Date(post.modifiedDate || post.publishDate),
        };
      });

      // Bulk insert posts
      await queryInterface.bulkInsert('posts', posts);
      console.log(`Successfully migrated ${posts.length} blog posts`);

    } catch (error) {
      console.error('Error migrating blog posts data:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('posts', null, {});
  },
};
