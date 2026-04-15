// seed data — categories, products with curated Unsplash image URLs
const db = require('./database');

const categories = [
  { id: 1, name: 'Chair',  slug: 'chair',  description: 'Comfortable seating for every room', sort_order: 1 },
  { id: 2, name: 'Beds',   slug: 'beds',   description: 'Premium beds for quality sleep',      sort_order: 2 },
  { id: 3, name: 'Sofas',  slug: 'sofas',  description: 'Stylish sofas for your living room',  sort_order: 3 },
  { id: 4, name: 'Lamp',   slug: 'lamp',   description: 'Modern lighting solutions',           sort_order: 4 },
  { id: 5, name: 'Table',  slug: 'table',  description: 'Dining and coffee tables',            sort_order: 5 },
  { id: 6, name: 'Shelf',  slug: 'shelf',  description: 'Storage and display shelving',        sort_order: 6 },
];

// curated Unsplash furniture images (no API key needed)
const products = [
  // Chairs
  {
    category_id: 1, name: 'Sakarias Armchair', slug: 'sakarias-armchair',
    description: 'A sleek armchair with a sturdy frame and comfortable padded seat. Perfect for reading corners.',
    price: 392, sku: 'CHR-001', stock: 12, material: 'Fabric, Steel', color: 'Dark Grey',
    dimensions: '65×70×85 cm', is_featured: 1,
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop',
  },
  {
    category_id: 1, name: 'Baltsar Chair', slug: 'baltsar-chair',
    description: 'Mid-century inspired chair with wooden legs and soft upholstery.',
    price: 299, sku: 'CHR-002', stock: 8, material: 'Velvet, Walnut Wood', color: 'Navy Blue',
    dimensions: '60×65×82 cm', is_featured: 1,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
  },
  {
    category_id: 1, name: 'Anjay Chair', slug: 'anjay-chair',
    description: 'Minimalist office chair with ergonomic support and breathable mesh back.',
    price: 519, sku: 'CHR-003', stock: 15, material: 'Mesh, Aluminium', color: 'Charcoal',
    dimensions: '58×62×90 cm', is_featured: 1,
    image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=600&fit=crop',
  },
  {
    category_id: 1, name: 'Nyantuy Chair', slug: 'nyantuy-chair',
    description: 'Statement lounge chair with plush cushioning and gold-tipped legs.',
    price: 921, sku: 'CHR-004', stock: 5, material: 'Bouclé, Brass', color: 'Cream',
    dimensions: '70×75×88 cm', is_featured: 1,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop',
  },
  {
    category_id: 1, name: 'Rattan Accent Chair', slug: 'rattan-accent-chair',
    description: 'Boho-style rattan accent chair, lightweight and stylish.',
    price: 245, sku: 'CHR-005', stock: 10, material: 'Rattan, Cotton', color: 'Natural',
    dimensions: '62×60×80 cm', is_featured: 0,
    image: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600&h=600&fit=crop',
  },
  {
    category_id: 1, name: 'Knoll Tulip Chair', slug: 'knoll-tulip-chair',
    description: 'Iconic tulip-style chair with a single pedestal base.',
    price: 680, sku: 'CHR-006', stock: 7, material: 'Fibreglass, Leather', color: 'White',
    dimensions: '56×52×78 cm', is_featured: 0,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&h=600&fit=crop',
  },

  // Sofas
  {
    category_id: 3, name: 'Caramel 3-Seater Sofa', slug: 'caramel-3-seater-sofa',
    description: 'Luxurious leather sofa in warm caramel tones — the centrepiece of any living room.',
    price: 1850, sku: 'SFA-001', stock: 4, material: 'Full-grain Leather, Solid Wood', color: 'Caramel',
    dimensions: '220×90×85 cm', is_featured: 1,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=500&fit=crop',
  },
  {
    category_id: 3, name: 'Sage Modular Sofa', slug: 'sage-modular-sofa',
    description: 'Versatile modular sofa you can arrange however you like.',
    price: 2400, sku: 'SFA-002', stock: 3, material: 'Linen, Pine', color: 'Sage Green',
    dimensions: '280×100×80 cm', is_featured: 0,
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=500&fit=crop',
  },
  {
    category_id: 3, name: 'Charcoal Corner Sofa', slug: 'charcoal-corner-sofa',
    description: 'Deep-seated L-shaped sofa, perfect for family lounges.',
    price: 2950, sku: 'SFA-003', stock: 2, material: 'Chenille, Oak', color: 'Dark Charcoal',
    dimensions: '300×200×82 cm', is_featured: 0,
    image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=500&fit=crop',
  },

  // Beds
  {
    category_id: 2, name: 'Nordic Platform Bed', slug: 'nordic-platform-bed',
    description: 'Low-profile platform bed with solid oak slats. Fits standard king mattress.',
    price: 1290, sku: 'BED-001', stock: 6, material: 'Solid Oak', color: 'Natural Oak',
    dimensions: '220×180×35 cm', is_featured: 1,
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&h=500&fit=crop',
  },
  {
    category_id: 2, name: 'Upholstered King Bed', slug: 'upholstered-king-bed',
    description: 'Tall padded headboard with button-tufted detail. Luxurious feel.',
    price: 1750, sku: 'BED-002', stock: 5, material: 'Velvet, MDF', color: 'Dusty Rose',
    dimensions: '215×175×120 cm', is_featured: 0,
    image: 'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=800&h=500&fit=crop',
  },
  {
    category_id: 2, name: 'Minimalist Bed Frame', slug: 'minimalist-bed-frame',
    description: 'Clean lines, solid wood construction. Pairs with any bedroom style.',
    price: 890, sku: 'BED-003', stock: 9, material: 'Birch Plywood', color: 'White',
    dimensions: '210×160×40 cm', is_featured: 0,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=500&fit=crop',
  },

  // Lamps
  {
    category_id: 4, name: 'Arc Floor Lamp', slug: 'arc-floor-lamp',
    description: 'Elegant arc lamp with a marble base. Warm 3000K bulb included.',
    price: 349, sku: 'LMP-001', stock: 14, material: 'Steel, Marble', color: 'Matte Black',
    dimensions: '40×40×190 cm', is_featured: 1,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop',
  },
  {
    category_id: 4, name: 'Rattan Pendant Light', slug: 'rattan-pendant-light',
    description: 'Handwoven rattan pendant, creates beautiful shadow patterns at night.',
    price: 189, sku: 'LMP-002', stock: 20, material: 'Rattan, Cotton cord', color: 'Natural',
    dimensions: '45×45×40 cm', is_featured: 0,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a35359e16?w=600&h=600&fit=crop',
  },
  {
    category_id: 4, name: 'Concrete Table Lamp', slug: 'concrete-table-lamp',
    description: 'Industrial-style table lamp with a raw concrete base.',
    price: 129, sku: 'LMP-003', stock: 18, material: 'Concrete, Linen', color: 'Grey',
    dimensions: '18×18×42 cm', is_featured: 0,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
  },

  // Tables
  {
    category_id: 5, name: 'Walnut Coffee Table', slug: 'walnut-coffee-table',
    description: 'Solid walnut coffee table with hairpin legs. Timeless design.',
    price: 620, sku: 'TBL-001', stock: 7, material: 'Solid Walnut, Steel', color: 'Dark Walnut',
    dimensions: '120×60×45 cm', is_featured: 1,
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=700&h=500&fit=crop',
  },
  {
    category_id: 5, name: 'Extendable Dining Table', slug: 'extendable-dining-table',
    description: 'Oak dining table that extends from 160 cm to 220 cm to seat up to 8.',
    price: 1450, sku: 'TBL-002', stock: 4, material: 'Solid Oak', color: 'Natural',
    dimensions: '160–220×90×75 cm', is_featured: 0,
    image: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=700&h=500&fit=crop',
  },

  // Shelves
  {
    category_id: 6, name: 'Floating Wall Shelf Set', slug: 'floating-wall-shelf-set',
    description: 'Set of 3 floating shelves in different sizes. Easy to install.',
    price: 175, sku: 'SHL-001', stock: 22, material: 'MDF, Metal brackets', color: 'White',
    dimensions: '60/80/100 cm × 20 cm', is_featured: 0,
    image: 'https://images.unsplash.com/photo-1532372320978-9b4e0e6c1b0a?w=600&h=600&fit=crop',
  },
  {
    category_id: 6, name: 'Industrial Bookshelf', slug: 'industrial-bookshelf',
    description: '5-tier industrial bookshelf with a pipe-and-wood design.',
    price: 480, sku: 'SHL-002', stock: 6, material: 'Pine, Iron pipe', color: 'Rustic Brown',
    dimensions: '90×30×180 cm', is_featured: 0,
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&h=600&fit=crop',
  },
];

function seed() {
  // categories
  const insertCat = db.prepare(`
    INSERT OR IGNORE INTO category (id, name, slug, description, sort_order)
    VALUES (@id, @name, @slug, @description, @sort_order)
  `);
  for (const c of categories) insertCat.run(c);

  // products + primary image
  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO product
      (category_id, name, slug, description, price, sku, stock,
       material, color, dimensions, is_featured)
    VALUES
      (@category_id, @name, @slug, @description, @price, @sku, @stock,
       @material, @color, @dimensions, @is_featured)
  `);
  const insertImage = db.prepare(`
    INSERT OR IGNORE INTO product_image (product_id, image_url, is_primary, sort_order)
    VALUES (?, ?, 1, 0)
  `);

  db.exec('BEGIN');
  try {
    for (const p of products) {
      const { image, ...productData } = p;
      const result = insertProduct.run(productData);
      const productId = result.lastInsertRowid;
      if (productId) insertImage.run(productId, image);
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  // demo coupon
  db.prepare(`
    INSERT OR IGNORE INTO coupon (code, discount_type, discount_value, min_order_value, is_active)
    VALUES ('MASA10', 'percentage', 10, 100, 1)
  `).run();

  console.log('Seed complete —', products.length, 'products,', categories.length, 'categories');
}

seed();
