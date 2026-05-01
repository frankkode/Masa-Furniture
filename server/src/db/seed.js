// seed data — categories + products with LOCAL images only (no external URLs)
const db = require('./database');

const categories = [
  { id: 1, name: 'Chair',  slug: 'chair',  description: 'Comfortable seating for every room', sort_order: 1 },
  { id: 2, name: 'Beds',   slug: 'beds',   description: 'Premium beds for quality sleep',      sort_order: 2 },
  { id: 3, name: 'Sofas',  slug: 'sofas',  description: 'Stylish sofas for your living room',  sort_order: 3 },
  { id: 4, name: 'Lamp',   slug: 'lamp',   description: 'Modern lighting solutions',           sort_order: 4 },
  { id: 5, name: 'Table',  slug: 'table',  description: 'Dining and coffee tables',            sort_order: 5 },
  { id: 6, name: 'Shelf',  slug: 'shelf',  description: 'Storage and display shelving',        sort_order: 6 },
];

const products = [
  /* ── CHAIRS (4 products, local .png) ─────────────────────── */
  {
    category_id: 1, name: 'Sakarias Armchair', slug: 'sakarias-armchair',
    description: 'A refined armchair with gently sloped arms and a deep padded seat. The dark grey woven fabric pairs beautifully with black tapered legs, creating a silhouette that works equally well at a dining table or in a reading nook.',
    price: 392, sku: 'CHR-001', stock: 12, material: 'Woven Fabric, Steel Frame', color: 'Dark Grey',
    dimensions: '65×70×85 cm', weight: 8.5, is_featured: 1,
    image: '/chairs1.png',
  },
  {
    category_id: 1, name: 'Baltsar Plaid Lounge Chair', slug: 'baltsar-plaid-lounge',
    description: 'A statement lounge chair wrapped in bold black-and-white plaid fabric with a scoop-style seat and splayed black legs. Comes with a coordinating cream cushion for extra comfort. Mid-century charm meets modern pattern play.',
    price: 459, sku: 'CHR-002', stock: 8, material: 'Plaid Tweed, Birch Wood', color: 'Black & White Plaid',
    dimensions: '72×68×76 cm', weight: 7.2, is_featured: 1,
    image: '/chairs2.png',
  },
  {
    category_id: 1, name: 'Comfor Dual-Tone Armchair', slug: 'comfor-dual-tone',
    description: 'Ergonomic armchair featuring quilted charcoal faux-leather on the inner shell and heather-grey bouclé on the outer. The generous padding and angled metal legs make it ideal for long work sessions or relaxed evenings.',
    price: 519, sku: 'CHR-003', stock: 15, material: 'Faux Leather, Bouclé, Steel', color: 'Charcoal / Grey',
    dimensions: '62×64×84 cm', weight: 9.0, is_featured: 1,
    image: '/chairs3.png',
  },
  {
    category_id: 1, name: 'Orbis Shell Chair', slug: 'orbis-shell-chair',
    description: 'A sleek shell-shaped dining chair in deep navy fabric, resting on warm walnut-stained wooden legs. The curved backrest hugs you gently, providing subtle lumbar support without bulk. Scandinavian minimalism at its best.',
    price: 299, sku: 'CHR-004', stock: 10, material: 'Wool Blend, Walnut Wood', color: 'Navy Blue',
    dimensions: '50×54×78 cm', weight: 5.4, is_featured: 1,
    image: '/chairs4.png',
  },

  /* ── SOFAS (6 products, local .webp) ─────────────────────── */
  {
    category_id: 3, name: 'Cloud Modular Sofa', slug: 'cloud-modular-sofa',
    description: 'Ultra-soft modular sofa with pillowy rounded cushions in calming sky blue. Each section can be rearranged to suit your space — line them up or create an L-shape. The low profile keeps the room feeling open and airy.',
    price: 2450, sku: 'SFA-001', stock: 4, material: 'Brushed Cotton, High-Density Foam', color: 'Sky Blue',
    dimensions: '320×100×65 cm', weight: 62, is_featured: 1,
    image: '/sofa1.webp',
  },
  {
    category_id: 3, name: 'Havana Leather Sofa', slug: 'havana-leather-sofa',
    description: 'Classic 3-seater sofa in rich cognac leather with clean lines and tapered wooden legs. Ages gracefully, developing a beautiful patina over time.',
    price: 1890, sku: 'SFA-002', stock: 5, material: 'Full-Grain Leather, Ash Wood', color: 'Cognac',
    dimensions: '210×88×82 cm', weight: 48, is_featured: 1,
    image: '/sofa2.webp',
  },
  {
    category_id: 3, name: 'Sage Corner Sectional', slug: 'sage-corner-sectional',
    description: 'Generous L-shaped sectional in sage green linen. Deep seats invite you to sink in, while removable covers make cleaning a breeze. Perfect for family movie nights.',
    price: 2850, sku: 'SFA-003', stock: 3, material: 'Linen, Solid Pine Frame', color: 'Sage Green',
    dimensions: '290×200×80 cm', weight: 58, is_featured: 0,
    image: '/sofa3.webp',
  },
  {
    category_id: 3, name: 'Ivory Bouclé Loveseat', slug: 'ivory-boucle-loveseat',
    description: 'Compact two-seater loveseat in creamy ivory bouclé. Rounded arms and a plush seat make this the cosiest spot in the room. Ideal for apartments and smaller spaces.',
    price: 1350, sku: 'SFA-004', stock: 7, material: 'Bouclé Fabric, Beech Wood', color: 'Ivory',
    dimensions: '150×85×78 cm', weight: 34, is_featured: 0,
    image: '/sofa4.webp',
  },
  {
    category_id: 3, name: 'Midnight Velvet Sofa', slug: 'midnight-velvet-sofa',
    description: 'Luxurious 3-seater in deep midnight blue velvet. Channel-tufted backrest adds visual texture while gold-tone legs bring a touch of glamour.',
    price: 2100, sku: 'SFA-005', stock: 4, material: 'Velvet, Gold-Tone Steel', color: 'Midnight Blue',
    dimensions: '220×92×84 cm', weight: 52, is_featured: 0,
    image: '/sofa5.webp',
  },
  {
    category_id: 3, name: 'Terracotta Daybed Sofa', slug: 'terracotta-daybed-sofa',
    description: 'Versatile daybed-style sofa in warm terracotta. Use it as a sofa by day and a guest bed by night. Linen upholstery feels cool to the touch.',
    price: 1680, sku: 'SFA-006', stock: 6, material: 'Linen, Steel Frame', color: 'Terracotta',
    dimensions: '200×95×72 cm', weight: 40, is_featured: 0,
    image: '/sofa6.webp',
  },

  /* ── BEDS (7 products, local .webp) ──────────────────────── */
  {
    category_id: 2, name: 'Velvet Upholstered Bed', slug: 'velvet-upholstered-bed',
    description: 'Elegant bed frame with a tall channelled headboard in deep navy velvet. Slim chrome legs give it a floating appearance. Fits standard king-size mattress (180×200 cm).',
    price: 1490, sku: 'BED-001', stock: 6, material: 'Velvet, Chrome Legs', color: 'Navy Blue',
    dimensions: '210×185×110 cm', weight: 45, is_featured: 1,
    image: '/bed1.webp',
  },
  {
    category_id: 2, name: 'Nordic Oak Platform Bed', slug: 'nordic-oak-platform',
    description: 'Low-profile platform bed in natural oak with integrated bedside shelves. Clean Scandinavian design — no box spring needed.',
    price: 1290, sku: 'BED-002', stock: 5, material: 'Solid Oak', color: 'Natural Oak',
    dimensions: '220×180×35 cm', weight: 55, is_featured: 1,
    image: '/bed2.webp',
  },
  {
    category_id: 2, name: 'Tufted Queen Bed', slug: 'tufted-queen-bed',
    description: 'Button-tufted headboard in dusty rose fabric, resting on a solid wood base. Romantic yet modern, this bed transforms any bedroom into a retreat.',
    price: 1150, sku: 'BED-003', stock: 8, material: 'Linen, MDF, Pine Slats', color: 'Dusty Rose',
    dimensions: '215×165×120 cm', weight: 42, is_featured: 0,
    image: '/bed3.webp',
  },
  {
    category_id: 2, name: 'Minimalist White Bed Frame', slug: 'minimalist-white-bed',
    description: 'Ultra-clean white bed frame with recessed legs and a slim headboard. Pair with crisp white sheets for a hotel-level aesthetic.',
    price: 890, sku: 'BED-004', stock: 10, material: 'Birch Plywood, Steel', color: 'Matte White',
    dimensions: '210×160×40 cm', weight: 35, is_featured: 0,
    image: '/bed4.webp',
  },
  {
    category_id: 2, name: 'Walnut Storage Bed', slug: 'walnut-storage-bed',
    description: 'King bed with two deep under-bed drawers in warm walnut finish. The panelled headboard adds mid-century character while the storage keeps clutter hidden.',
    price: 1650, sku: 'BED-005', stock: 4, material: 'Walnut Veneer, Solid Pine', color: 'Walnut',
    dimensions: '220×185×95 cm', weight: 68, is_featured: 0,
    image: '/bed5.webp',
  },
  {
    category_id: 2, name: 'Boucle Canopy Bed', slug: 'boucle-canopy-bed',
    description: 'Statement canopy bed wrapped in soft cream bouclé. The four-poster frame adds drama without feeling heavy. A true bedroom centrepiece.',
    price: 2100, sku: 'BED-006', stock: 3, material: 'Bouclé, Steel Frame', color: 'Cream',
    dimensions: '225×190×210 cm', weight: 72, is_featured: 0,
    image: '/bed6.webp',
  },
  {
    category_id: 2, name: 'Charcoal Linen Bed', slug: 'charcoal-linen-bed',
    description: 'Understated elegance in dark charcoal linen. Winged headboard and solid timber slats provide excellent support. Works in both classic and contemporary bedrooms.',
    price: 1080, sku: 'BED-007', stock: 7, material: 'Linen, Rubberwood', color: 'Charcoal',
    dimensions: '215×170×105 cm', weight: 40, is_featured: 0,
    image: '/bed7.webp',
  },

  /* ── LAMPS (12 products, local .webp) ────────────────────── */
  {
    category_id: 4, name: 'Octo Pendant Light', slug: 'octo-pendant-light',
    description: 'Hand-crafted wooden pendant lamp with delicate vertical slats that cast beautiful striped shadows. The warm walnut top cap adds a refined finish. A Scandinavian design classic.',
    price: 389, sku: 'LMP-001', stock: 14, material: 'Birch Wood, Cotton Cord', color: 'Natural Wood',
    dimensions: 'Ø45×40 cm', weight: 1.8, is_featured: 1,
    image: '/lamp1.webp',
  },
  {
    category_id: 4, name: 'Matte Black Arc Lamp', slug: 'matte-black-arc-lamp',
    description: 'Elegant arc floor lamp with a heavy marble base. The long sweeping arm brings light directly over your sofa or reading chair. Warm 3000K LED bulb included.',
    price: 349, sku: 'LMP-002', stock: 10, material: 'Steel, Marble Base', color: 'Matte Black',
    dimensions: '40×40×190 cm', weight: 12, is_featured: 1,
    image: '/lamp2.webp',
  },
  {
    category_id: 4, name: 'Brass Mushroom Table Lamp', slug: 'brass-mushroom-lamp',
    description: 'Retro-inspired mushroom-shaped table lamp in brushed brass. The frosted glass dome diffuses light softly — perfect as a bedside companion.',
    price: 179, sku: 'LMP-003', stock: 18, material: 'Brass, Frosted Glass', color: 'Brushed Brass',
    dimensions: '22×22×35 cm', weight: 2.5, is_featured: 0,
    image: '/lamp3.webp',
  },
  {
    category_id: 4, name: 'Paper Lantern Pendant', slug: 'paper-lantern-pendant',
    description: 'Oversized rice-paper pendant that bathes the room in soft, diffused glow. Lightweight and sculptural — a favourite for dining areas and entryways.',
    price: 129, sku: 'LMP-004', stock: 25, material: 'Rice Paper, Bamboo Frame', color: 'White',
    dimensions: 'Ø60×55 cm', weight: 0.8, is_featured: 0,
    image: '/lamp4.webp',
  },
  {
    category_id: 4, name: 'Industrial Cage Pendant', slug: 'industrial-cage-pendant',
    description: 'Open-cage pendant light in matte black iron. Exposes the bulb for an honest, industrial look. Works beautifully over kitchen islands and bar counters.',
    price: 149, sku: 'LMP-005', stock: 20, material: 'Iron, Fabric Cord', color: 'Matte Black',
    dimensions: 'Ø30×28 cm', weight: 1.5, is_featured: 0,
    image: '/lamp5.webp',
  },
  {
    category_id: 4, name: 'Ceramic Globe Lamp', slug: 'ceramic-globe-lamp',
    description: 'Handmade ceramic table lamp with a textured glaze finish and linen drum shade. Each piece is slightly unique due to the artisan glazing process.',
    price: 219, sku: 'LMP-006', stock: 12, material: 'Ceramic, Linen Shade', color: 'Speckled Cream',
    dimensions: '28×28×48 cm', weight: 3.8, is_featured: 0,
    image: '/lamp6.webp',
  },
  {
    category_id: 4, name: 'Tripod Floor Lamp', slug: 'tripod-floor-lamp',
    description: 'Walnut wood tripod legs with a fabric drum shade. The warm tone of the wood contrasts with the neutral shade, creating a cosy ambient glow.',
    price: 269, sku: 'LMP-007', stock: 9, material: 'Walnut Wood, Cotton Shade', color: 'Walnut / White',
    dimensions: '50×50×155 cm', weight: 5.5, is_featured: 0,
    image: '/lamp7.webp',
  },
  {
    category_id: 4, name: 'Rattan Dome Pendant', slug: 'rattan-dome-pendant',
    description: 'Handwoven rattan pendant light creating mesmerising shadow patterns when lit. Brings a natural, bohemian vibe to any space.',
    price: 199, sku: 'LMP-008', stock: 16, material: 'Natural Rattan', color: 'Honey',
    dimensions: 'Ø50×42 cm', weight: 1.4, is_featured: 0,
    image: '/lamp8.webp',
  },
  {
    category_id: 4, name: 'Concrete Desk Lamp', slug: 'concrete-desk-lamp',
    description: 'Industrial concrete base with an exposed Edison bulb. Raw and minimal — makes a bold statement on any desk or shelf.',
    price: 139, sku: 'LMP-009', stock: 14, material: 'Concrete, Steel', color: 'Grey',
    dimensions: '15×15×38 cm', weight: 4.2, is_featured: 0,
    image: '/lamp9.webp',
  },
  {
    category_id: 4, name: 'Gold Sputnik Chandelier', slug: 'gold-sputnik-chandelier',
    description: 'Mid-century sputnik chandelier with 12 arms radiating from a central sphere. Brushed gold finish adds warmth and a touch of Hollywood glamour.',
    price: 459, sku: 'LMP-010', stock: 6, material: 'Steel, Brass Plating', color: 'Brushed Gold',
    dimensions: 'Ø65×65 cm', weight: 4.0, is_featured: 0,
    image: '/lamp10.webp',
  },
  {
    category_id: 4, name: 'Opal Glass Sconce', slug: 'opal-glass-sconce',
    description: 'Minimalist wall sconce with an opal glass globe on a slim brass arm. Casts a soft, even glow — ideal for hallways and bedside walls.',
    price: 109, sku: 'LMP-011', stock: 30, material: 'Opal Glass, Brass', color: 'Brass / White',
    dimensions: '15×18×25 cm', weight: 1.2, is_featured: 0,
    image: '/lamp11.webp',
  },
  {
    category_id: 4, name: 'Smoked Glass Pendant', slug: 'smoked-glass-pendant',
    description: 'Sleek pendant light with a smoked glass shade that adds depth and mystery. The tinted glass softens the light beautifully over dining tables.',
    price: 189, sku: 'LMP-012', stock: 11, material: 'Smoked Glass, Chrome', color: 'Smoked Grey',
    dimensions: 'Ø25×30 cm', weight: 2.0, is_featured: 0,
    image: '/lamp12.webp',
  },

  /* ── TABLES (7 products, local .webp) ────────────────────── */
  {
    category_id: 5, name: 'Round Pedestal Coffee Table', slug: 'round-pedestal-coffee-table',
    description: 'Compact round coffee table with a clean white top and a sturdy taupe pedestal base. Its small footprint makes it perfect for tight living rooms and apartment spaces.',
    price: 420, sku: 'TBL-001', stock: 10, material: 'MDF, Powder-Coated Steel', color: 'White / Taupe',
    dimensions: 'Ø70×45 cm', weight: 14, is_featured: 1,
    image: '/table1.webp',
  },
  {
    category_id: 5, name: 'Walnut Dining Table', slug: 'walnut-dining-table',
    description: 'Solid walnut dining table seating up to 6. The natural grain pattern makes every piece one-of-a-kind. Finished with food-safe oil for easy maintenance.',
    price: 1450, sku: 'TBL-002', stock: 4, material: 'Solid Walnut', color: 'Dark Walnut',
    dimensions: '180×90×75 cm', weight: 42, is_featured: 1,
    image: '/table2.webp',
  },
  {
    category_id: 5, name: 'Marble Side Table', slug: 'marble-side-table',
    description: 'Luxurious side table with a genuine Carrara marble top on a black steel tripod base. Perfect next to a sofa or armchair for drinks and books.',
    price: 380, sku: 'TBL-003', stock: 12, material: 'Carrara Marble, Steel', color: 'White Marble / Black',
    dimensions: 'Ø40×55 cm', weight: 9, is_featured: 0,
    image: '/table3.webp',
  },
  {
    category_id: 5, name: 'Oak Extending Dining Table', slug: 'oak-extending-dining-table',
    description: 'Versatile dining table with a butterfly extension leaf — expands from 160 cm to 220 cm. Seats 4 comfortably, 8 when extended. Solid oak with a natural oil finish.',
    price: 1680, sku: 'TBL-004', stock: 5, material: 'Solid Oak', color: 'Natural Oak',
    dimensions: '160–220×90×75 cm', weight: 52, is_featured: 0,
    image: '/table4.webp',
  },
  {
    category_id: 5, name: 'Hairpin Leg Console Table', slug: 'hairpin-console-table',
    description: 'Slim console table with a reclaimed-wood top and black hairpin legs. Fits beautifully in entryways, behind sofas, or as a narrow desk.',
    price: 320, sku: 'TBL-005', stock: 9, material: 'Reclaimed Pine, Steel', color: 'Rustic / Black',
    dimensions: '120×35×78 cm', weight: 12, is_featured: 0,
    image: '/table5.webp',
  },
  {
    category_id: 5, name: 'Glass-Top Nesting Tables', slug: 'glass-top-nesting-tables',
    description: 'Set of 2 nesting tables with tempered glass tops and gold-tone frames. Tuck the smaller one under when not in use — instant extra surface when you need it.',
    price: 490, sku: 'TBL-006', stock: 8, material: 'Tempered Glass, Steel', color: 'Clear / Gold',
    dimensions: '55×55×50 cm (large)', weight: 11, is_featured: 0,
    image: '/table6.webp',
  },
  {
    category_id: 5, name: 'Concrete Outdoor Table', slug: 'concrete-outdoor-table',
    description: 'Weather-resistant dining table with a micro-cement top and powder-coated aluminium legs. Built for outdoor living but stylish enough for indoors.',
    price: 890, sku: 'TBL-007', stock: 4, material: 'Micro-Cement, Aluminium', color: 'Light Grey',
    dimensions: '160×80×75 cm', weight: 38, is_featured: 0,
    image: '/table7.webp',
  },

  /* ── SHELVES (4 products, local .jpg) ────────────────────── */
  {
    category_id: 6, name: 'Diamond Wall Shelf Set', slug: 'diamond-wall-shelf-set',
    description: 'Set of 3 diamond-shaped wall shelves in matte black metal with natural oak inlay shelves. Arrange them in a cluster for a striking geometric display. Each diamond rotates 45° for a fresh take on wall storage.',
    price: 285, sku: 'SHL-001', stock: 15, material: 'Powder-Coated Steel, Oak', color: 'Black / Natural',
    dimensions: '40×40 / 35×35 / 30×30 cm', weight: 6.5, is_featured: 1,
    image: '/shelf1.jpg',
  },
  {
    category_id: 6, name: 'Floating Minimalist Shelf', slug: 'floating-minimalist-shelf',
    description: 'Ultra-clean floating shelf in pure white. Concealed bracket system creates a true hovering effect. Perfect for displaying art objects, books, or decorative items.',
    price: 145, sku: 'SHL-002', stock: 25, material: 'MDF, Hidden Steel Bracket', color: 'Matte White',
    dimensions: '90×22×3 cm', weight: 3.2, is_featured: 0,
    image: '/shelf2.jpg',
  },
  {
    category_id: 6, name: 'Minimalist Display Shelf', slug: 'minimalist-display-shelf',
    description: 'Clean-lined wall shelf ideal for displaying sculptural objects or small collections. The understated design lets your displayed items take centre stage.',
    price: 165, sku: 'SHL-003', stock: 20, material: 'MDF, Steel Bracket', color: 'White',
    dimensions: '100×25×4 cm', weight: 3.5, is_featured: 0,
    image: '/shelf3.jpg',
  },
  {
    category_id: 6, name: 'Framed Box Shelf', slug: 'framed-box-shelf',
    description: 'Rectangular framed wall shelf with a dark metal frame and a warm timber shelf insert. The open frame design adds depth while keeping the look light and airy. Great for kitchens, bathrooms, or living rooms.',
    price: 195, sku: 'SHL-004', stock: 14, material: 'Steel Frame, Cedar Wood', color: 'Black / Cedar',
    dimensions: '60×15×35 cm', weight: 4.0, is_featured: 0,
    image: '/shelf4.jpg',
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
       material, color, dimensions, weight, is_featured)
    VALUES
      (@category_id, @name, @slug, @description, @price, @sku, @stock,
       @material, @color, @dimensions, @weight, @is_featured)
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

  // ── demo users ──────────────────────────────────────────────
  const bcrypt = require('bcryptjs');
  const adminPass  = bcrypt.hashSync('Admin@123', 12);
  const clientPass = bcrypt.hashSync('Client@123', 12);

  // Admin user
  const adminExists = db.prepare('SELECT id FROM user WHERE email = ?').get('admin@masa.com');
  if (!adminExists) {
    const r = db.prepare(
      'INSERT INTO user (username, email, password, is_staff) VALUES (?, ?, ?, 1)'
    ).run('admin', 'admin@masa.com', adminPass);
    db.prepare('INSERT OR IGNORE INTO wishlist (user_id) VALUES (?)').run(r.lastInsertRowid);
    db.prepare('INSERT OR IGNORE INTO user_profile (user_id) VALUES (?)').run(r.lastInsertRowid);
    console.log('  + Admin user created');
  }

  // Client user
  const clientExists = db.prepare('SELECT id FROM user WHERE email = ?').get('client@masa.com');
  if (!clientExists) {
    const r = db.prepare(
      'INSERT INTO user (username, email, password, is_staff) VALUES (?, ?, ?, 0)'
    ).run('client', 'client@masa.com', clientPass);
    db.prepare('INSERT OR IGNORE INTO wishlist (user_id) VALUES (?)').run(r.lastInsertRowid);
    db.prepare('INSERT OR IGNORE INTO user_profile (user_id) VALUES (?)').run(r.lastInsertRowid);
    console.log('  + Client user created');
  }

  console.log('Seed complete —', products.length, 'products,', categories.length, 'categories');
}

seed();
