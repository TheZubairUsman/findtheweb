const fs = require('fs');
const path = require('path');

const DATA_FILE_PATH = path.join(__dirname, '../../data/products.json');

function readProductsFromFile() {
  try {
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

function writeProductsToFile(products) {
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
}

function toNumber(value, fallback = undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function paginate(items, page, limit) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * limit;
  const end = start + limit;
  const slice = items.slice(start, end);
  return {
    items: slice,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
}

// Get all products with pagination, search, and filtering (JSON storage)
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status = 'active',
      featured,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      minPrice,
      maxPrice,
    } = req.query;

    const pageNum = toNumber(page, 1);
    const limitNum = Math.min(100, toNumber(limit, 20));

    const all = readProductsFromFile();

    let filtered = all.filter(p => {
      if (status && status !== 'all' && p.status !== status) return false;
      if (category && p.category !== category) return false;
      if (featured !== undefined) {
        const f = String(featured).toLowerCase() === 'true';
        if ((p.featured || false) !== f) return false;
      }
      if (minPrice !== undefined && toNumber(p.price, 0) < toNumber(minPrice, 0)) return false;
      if (maxPrice !== undefined && toNumber(p.price, 0) > toNumber(maxPrice, Number.MAX_SAFE_INTEGER)) return false;
      if (search) {
        const q = String(search).toLowerCase();
        const hay = `${p.name || ''} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const order = String(sortOrder).toUpperCase() === 'ASC' ? 1 : -1;
    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });

    const { items, pagination } = paginate(filtered, pageNum, limitNum);

    res.json({ success: true, data: { products: items, pagination } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// Get a single product by ID (JSON storage)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const all = readProductsFromFile();
    const product = all.find(p => String(p.id) === String(id));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// Create a new product (JSON storage)
const createProduct = async (req, res) => {
  try {
    const body = req.body || {};
    const { name, price, category } = body;
    if (!name || price == null || !category) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }
    const all = readProductsFromFile();
    if (body.sku && all.some(p => p.sku === body.sku)) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }
    const now = new Date().toISOString();
    const nextId = all.length ? Math.max(...all.map(p => Number(p.id) || 0)) + 1 : 1;
    const product = {
      id: nextId,
      name: body.name,
      description: body.description || '',
      price: toNumber(body.price, 0),
      category: body.category,
      features: Array.isArray(body.features) ? body.features : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      images: Array.isArray(body.images) ? body.images : [],
      status: body.status || 'draft',
      sku: body.sku || null,
      stock: toNumber(body.stock, 0),
      weight: body.weight != null ? toNumber(body.weight, null) : null,
      dimensions: body.dimensions || null,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      seoKeywords: body.seoKeywords || null,
      featured: Boolean(body.featured),
      featuredOrder: body.featuredOrder != null ? toNumber(body.featuredOrder, null) : null,
      createdAt: now,
      updatedAt: now,
    };
    all.push(product);
    writeProductsToFile(all);
    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

// Update a product (JSON storage)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body || {};
    const all = readProductsFromFile();
    const index = all.findIndex(p => String(p.id) === String(id));
    if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });
    if (update.sku && update.sku !== all[index].sku && all.some(p => p.sku === update.sku)) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }
    const updated = {
      ...all[index],
      ...update,
      price: update.price != null ? toNumber(update.price, all[index].price) : all[index].price,
      stock: update.stock != null ? toNumber(update.stock, all[index].stock) : all[index].stock,
      weight: update.weight != null ? toNumber(update.weight, all[index].weight) : all[index].weight,
      featuredOrder: update.featuredOrder != null ? toNumber(update.featuredOrder, all[index].featuredOrder) : all[index].featuredOrder,
      features: Array.isArray(update.features) ? update.features : all[index].features,
      tags: Array.isArray(update.tags) ? update.tags : all[index].tags,
      images: Array.isArray(update.images) ? update.images : all[index].images,
      updatedAt: new Date().toISOString(),
    };
    all[index] = updated;
    writeProductsToFile(all);
    res.json({ success: true, data: updated, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// Delete a product (JSON storage)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const all = readProductsFromFile();
    const index = all.findIndex(p => String(p.id) === String(id));
    if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });
    all.splice(index, 1);
    writeProductsToFile(all);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

// Get featured products (JSON storage)
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const all = readProductsFromFile();
    const featured = all.filter(p => Boolean(p.featured));
    featured.sort((a, b) => (toNumber(a.featuredOrder, 9999) - toNumber(b.featuredOrder, 9999)) || (new Date(b.createdAt) - new Date(a.createdAt)));
    res.json({ success: true, data: featured.slice(0, toNumber(limit, 10)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured products' });
  }
};

// Get products by category (JSON storage)
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const all = readProductsFromFile();
    const filtered = all.filter(p => p.category === category && (p.status === 'active' || p.status === 'published'));
    const { items, pagination } = paginate(filtered, toNumber(page, 1), Math.min(100, toNumber(limit, 20)));
    res.json({ success: true, data: { products: items, pagination } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products by category' });
  }
};

// Search products (JSON storage)
const searchProducts = async (req, res) => {
  try {
    const { q, category, limit = 20, offset = 0 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query is required' });
    const all = readProductsFromFile();
    const query = String(q).toLowerCase();
    let result = all.filter(p => {
      if (category && p.category !== category) return false;
      const hay = `${p.name || ''} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
      return hay.includes(query);
    });
    const off = Math.max(0, toNumber(offset, 0));
    const lim = Math.min(100, toNumber(limit, 20));
    const rows = result.slice(off, off + lim);
    res.json({ success: true, data: { products: rows, totalCount: result.length, hasMore: off + rows.length < result.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to search products' });
  }
};

// Get product categories (JSON storage)
const getProductCategories = async (req, res) => {
  try {
    const all = readProductsFromFile();
    const set = new Set(all.map(p => p.category).filter(Boolean));
    const categoryList = Array.from(set).sort();
    res.json({ success: true, data: categoryList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product categories' });
  }
};

// Bulk update products (JSON storage)
const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updateData } = req.body || {};
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Product IDs are required' });
    }
    const all = readProductsFromFile();
    let updatedCount = 0;
    const idSet = new Set(productIds.map(x => String(x)));
    const updated = all.map(p => {
      if (!idSet.has(String(p.id))) return p;
      updatedCount += 1;
      return {
        ...p,
        ...updateData,
        price: updateData && updateData.price != null ? toNumber(updateData.price, p.price) : p.price,
        stock: updateData && updateData.stock != null ? toNumber(updateData.stock, p.stock) : p.stock,
        weight: updateData && updateData.weight != null ? toNumber(updateData.weight, p.weight) : p.weight,
        featuredOrder: updateData && updateData.featuredOrder != null ? toNumber(updateData.featuredOrder, p.featuredOrder) : p.featuredOrder,
        features: updateData && Array.isArray(updateData.features) ? updateData.features : p.features,
        tags: updateData && Array.isArray(updateData.tags) ? updateData.tags : p.tags,
        images: updateData && Array.isArray(updateData.images) ? updateData.images : p.images,
        updatedAt: new Date().toISOString(),
      };
    });
    writeProductsToFile(updated);
    res.json({ success: true, data: { updatedCount }, message: `${updatedCount} products updated successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to bulk update products' });
  }
};

// Bulk delete products (JSON storage)
const bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body || {};
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Product IDs are required' });
    }
    const all = readProductsFromFile();
    const before = all.length;
    const idSet = new Set(productIds.map(x => String(x)));
    const remaining = all.filter(p => !idSet.has(String(p.id)));
    writeProductsToFile(remaining);
    const deletedCount = before - remaining.length;
    res.json({ success: true, data: { deletedCount }, message: `${deletedCount} products deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to bulk delete products' });
  }
};

// Get product statistics (JSON storage)
const getProductStats = async (req, res) => {
  try {
    const all = readProductsFromFile();
    const totalProducts = all.length;
    const activeProducts = all.filter(p => p.status === 'active' || p.status === 'published').length;
    const featuredProducts = all.filter(p => Boolean(p.featured)).length;
    const outOfStock = all.filter(p => toNumber(p.stock, 0) === 0).length;
    const categoryCounts = all.reduce((acc, p) => { if (p.category) acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
    const categoryStats = Object.entries(categoryCounts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
    const prices = all.map(p => toNumber(p.price, 0)).filter(n => Number.isFinite(n));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const avgPrice = prices.length ? Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)) : 0;
    res.json({ success: true, data: { totalProducts, activeProducts, featuredProducts, outOfStock, categoryStats, priceStats: { minPrice, maxPrice, avgPrice } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product statistics' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getProductCategories,
  bulkUpdateProducts,
  bulkDeleteProducts,
  getProductStats,
};
