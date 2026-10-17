const { Admin, Website, Category, BlogPost } = require('../src/models');

describe('Model Tests', () => {
  describe('Admin Model', () => {
    it('should create admin with valid data', async () => {
      const adminData = {
        email: 'test@admin.com',
        password: 'testpassword123',
        name: 'Test Admin'
      };

      const admin = await Admin.create(adminData);

      expect(admin.email).toBe(adminData.email);
      expect(admin.name).toBe(adminData.name);
      expect(admin.password).not.toBe(adminData.password); // Should be hashed
    });

    it('should validate email format', async () => {
      const adminData = {
        email: 'invalid-email',
        password: 'testpassword123',
        name: 'Test Admin'
      };

      await expect(Admin.create(adminData)).rejects.toThrow();
    });

    it('should hash password before saving', async () => {
      const admin = await Admin.create({
        email: 'test@admin.com',
        password: 'plainpassword',
        name: 'Test Admin'
      });

      expect(admin.password).not.toBe('plainpassword');
      expect(admin.password.length).toBeGreaterThan(20); // Hashed password is longer
    });

    it('should compare passwords correctly', async () => {
      const admin = await Admin.create({
        email: 'test@admin.com',
        password: 'testpassword123',
        name: 'Test Admin'
      });

      const isValid = await admin.comparePassword('testpassword123');
      const isInvalid = await admin.comparePassword('wrongpassword');

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Category Model', () => {
    it('should create category with valid data', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test category description',
        icon: '🧪'
      };

      const category = await Category.create(categoryData);

      expect(category.name).toBe(categoryData.name);
      expect(category.description).toBe(categoryData.description);
      expect(category.slug).toBe('test-category');
      expect(category.isActive).toBe(true);
    });

    it('should generate unique slug', async () => {
      await Category.create({ name: 'Test Category' });
      const category2 = await Category.create({ name: 'Test Category' });

      expect(category2.slug).not.toBe('test-category');
      expect(category2.slug).toMatch(/test-category-\d+/);
    });

    it('should validate name length', async () => {
      await expect(Category.create({ name: 'A' })).rejects.toThrow();
      await expect(Category.create({ name: 'A'.repeat(101) })).rejects.toThrow();
    });
  });

  describe('Website Model', () => {
    let testCategory;

    beforeEach(async () => {
      testCategory = await Category.create({
        name: 'Test Category',
        description: 'Test category'
      });
    });

    it('should create website with valid data', async () => {
      const websiteData = {
        name: 'Test Website',
        url: 'https://test.com',
        description: 'Test website description',
        tier: 'standard',
        categoryId: testCategory.id
      };

      const website = await Website.create(websiteData);

      expect(website.name).toBe(websiteData.name);
      expect(website.url).toBe(websiteData.url);
      expect(website.tier).toBe(websiteData.tier);
      expect(website.totalHits).toBe(0);
      expect(website.status).toBe('active');
    });

    it('should validate URL format', async () => {
      const websiteData = {
        name: 'Test Website',
        url: 'invalid-url',
        description: 'Test website',
        categoryId: testCategory.id
      };

      await expect(Website.create(websiteData)).rejects.toThrow();
    });

    it('should track hits correctly', async () => {
      const website = await Website.create({
        name: 'Test Website',
        url: 'https://test.com',
        description: 'Test website',
        categoryId: testCategory.id
      });

      await website.incrementHits();
      expect(website.totalHits).toBe(1);
      expect(website.weeklyHits).toBe(1);
      expect(website.monthlyHits).toBe(1);
    });

    it('should filter by tier scope', async () => {
      await Website.bulkCreate([
        {
          name: 'Standard Website',
          url: 'https://standard.com',
          description: 'Standard tier',
          tier: 'standard',
          categoryId: testCategory.id
        },
        {
          name: 'Premium Website',
          url: 'https://premium.com',
          description: 'Premium tier',
          tier: 'premium',
          categoryId: testCategory.id
        }
      ]);

      const premiumSites = await Website.scope({ method: ['byTier', 'premium'] }).findAll();
      expect(premiumSites).toHaveLength(1);
      expect(premiumSites[0].tier).toBe('premium');
    });
  });

  describe('BlogPost Model', () => {
    it('should create blog post with valid data', async () => {
      const postData = {
        title: 'Test Blog Post',
        slug: 'test-blog-post',
        excerpt: 'Test excerpt',
        content: 'Test content',
        author: 'Test Author',
        category: 'test',
        status: 'published'
      };

      const post = await BlogPost.create(postData);

      expect(post.title).toBe(postData.title);
      expect(post.slug).toBe(postData.slug);
      expect(post.status).toBe(postData.status);
      expect(post.viewCount).toBe(0);
      expect(post.featured).toBe(false);
    });

    it('should generate slug from title if not provided', async () => {
      const post = await BlogPost.create({
        title: 'Test Blog Post Title',
        excerpt: 'Test excerpt',
        content: 'Test content',
        author: 'Test Author',
        category: 'test'
      });

      expect(post.slug).toBe('test-blog-post-title');
    });

    it('should increment view count', async () => {
      const post = await BlogPost.create({
        title: 'Test Post',
        excerpt: 'Test excerpt',
        content: 'Test content',
        author: 'Test Author',
        category: 'test'
      });

      await post.incrementViewCount();
      expect(post.viewCount).toBe(1);
    });

    it('should find published posts only', async () => {
      await BlogPost.bulkCreate([
        {
          title: 'Published Post',
          excerpt: 'Published',
          content: 'Content',
          author: 'Author',
          category: 'test',
          status: 'published'
        },
        {
          title: 'Draft Post',
          excerpt: 'Draft',
          content: 'Content',
          author: 'Author',
          category: 'test',
          status: 'draft'
        }
      ]);

      const publishedPosts = await BlogPost.scope('published').findAll();
      expect(publishedPosts).toHaveLength(1);
      expect(publishedPosts[0].status).toBe('published');
    });
  });
});
