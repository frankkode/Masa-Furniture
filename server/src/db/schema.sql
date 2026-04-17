PRAGMA foreign_keys = ON;
PRAGMA journal_mode  = WAL;

-- ── auth & users ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user (
  id           INTEGER      PRIMARY KEY AUTOINCREMENT,
  username     VARCHAR(150) NOT NULL UNIQUE,
  email        VARCHAR(254) NOT NULL UNIQUE,
  password     VARCHAR(128) NOT NULL,
  is_staff     INTEGER      NOT NULL DEFAULT 0,
  is_superuser INTEGER      NOT NULL DEFAULT 0,
  is_active    INTEGER      NOT NULL DEFAULT 1,
  date_joined  DATETIME     NOT NULL DEFAULT (datetime('now')),
  last_login   DATETIME
);

CREATE TABLE IF NOT EXISTS user_profile (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
  phone       VARCHAR(20),
  avatar_url  VARCHAR(500),
  birth_date  DATE,
  created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS session (
  session_key  VARCHAR(40) PRIMARY KEY,
  session_data TEXT        NOT NULL,
  expire_date  DATETIME    NOT NULL
);

CREATE TABLE IF NOT EXISTS social_account (
  id           INTEGER      PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER      NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  provider     VARCHAR(30)  NOT NULL,
  provider_uid VARCHAR(200) NOT NULL,
  UNIQUE (user_id, provider)
);

-- ── catalogue ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS category (
  id          INTEGER      PRIMARY KEY AUTOINCREMENT,
  parent_id   INTEGER      REFERENCES category(id) ON DELETE SET NULL,
  name        VARCHAR(200) NOT NULL,
  slug        VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  image_url   VARCHAR(500),
  is_active   INTEGER      NOT NULL DEFAULT 1,
  sort_order  INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product (
  id           INTEGER       PRIMARY KEY AUTOINCREMENT,
  category_id  INTEGER       NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
  name         VARCHAR(300)  NOT NULL,
  slug         VARCHAR(300)  NOT NULL UNIQUE,
  description  TEXT,
  price        REAL          NOT NULL,
  sale_price   REAL,
  sku          VARCHAR(100)  NOT NULL UNIQUE,
  stock        INTEGER       NOT NULL DEFAULT 0,
  material     VARCHAR(200),
  dimensions   VARCHAR(200),
  weight       REAL,
  color        VARCHAR(50),
  is_active    INTEGER       NOT NULL DEFAULT 1,
  is_featured  INTEGER       NOT NULL DEFAULT 0,
  created_at   DATETIME      NOT NULL DEFAULT (datetime('now')),
  updated_at   DATETIME      NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_image (
  id          INTEGER      PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER      NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  image_url   VARCHAR(500) NOT NULL,
  alt_text    VARCHAR(200),
  is_primary  INTEGER      NOT NULL DEFAULT 0,
  sort_order  INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS review (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER  NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  user_id     INTEGER  NOT NULL REFERENCES user(id)    ON DELETE CASCADE,
  rating      INTEGER  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(200),
  body        TEXT,
  is_approved INTEGER  NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- ── cart ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cart (
  id           INTEGER     PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER     REFERENCES user(id) ON DELETE CASCADE,
  session_key  VARCHAR(40),
  created_at   DATETIME    NOT NULL DEFAULT (datetime('now')),
  updated_at   DATETIME    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cart_item (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  cart_id     INTEGER  NOT NULL REFERENCES cart(id)    ON DELETE CASCADE,
  product_id  INTEGER  NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  quantity    INTEGER  NOT NULL DEFAULT 1,
  added_at    DATETIME NOT NULL DEFAULT (datetime('now')),
  UNIQUE (cart_id, product_id)
);

-- ── addresses ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS address (
  id          INTEGER      PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER      NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  full_name   VARCHAR(200) NOT NULL,
  phone       VARCHAR(20),
  street      VARCHAR(300) NOT NULL,
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100),
  country     VARCHAR(100) NOT NULL DEFAULT 'Rwanda',
  postal_code VARCHAR(20),
  type        VARCHAR(20)  NOT NULL DEFAULT 'shipping',
  is_default  INTEGER      NOT NULL DEFAULT 0
);

-- ── orders ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "order" (
  id                  INTEGER       PRIMARY KEY AUTOINCREMENT,
  user_id             INTEGER       NOT NULL REFERENCES user(id) ON DELETE RESTRICT,
  status              VARCHAR(30)   NOT NULL DEFAULT 'pending',
  subtotal            REAL          NOT NULL,
  shipping_cost       REAL          NOT NULL DEFAULT 0,
  discount_amount     REAL          NOT NULL DEFAULT 0,
  total_price         REAL          NOT NULL,
  shipping_address_id INTEGER       REFERENCES address(id) ON DELETE SET NULL,
  coupon_id           INTEGER       REFERENCES coupon(id)  ON DELETE SET NULL,
  notes               TEXT,
  stripe_payment_id   VARCHAR(200),
  created_at          DATETIME      NOT NULL DEFAULT (datetime('now')),
  updated_at          DATETIME      NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_item (
  id          INTEGER       PRIMARY KEY AUTOINCREMENT,
  order_id    INTEGER       NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  product_id  INTEGER       NOT NULL REFERENCES product(id) ON DELETE RESTRICT,
  quantity    INTEGER       NOT NULL,
  unit_price  REAL          NOT NULL,
  color       VARCHAR(100),
  size        VARCHAR(100)
);

-- Store global shop settings (key/value)
CREATE TABLE IF NOT EXISTS settings (
  key   VARCHAR(100) PRIMARY KEY,
  value TEXT         NOT NULL
);
INSERT OR IGNORE INTO settings (key, value) VALUES ('shipping_fee',            '9.90');
INSERT OR IGNORE INTO settings (key, value) VALUES ('free_shipping_threshold', '100');

CREATE TABLE IF NOT EXISTS payment (
  id              INTEGER  PRIMARY KEY AUTOINCREMENT,
  order_id        INTEGER  NOT NULL UNIQUE REFERENCES "order"(id) ON DELETE CASCADE,
  amount          REAL     NOT NULL,
  method          VARCHAR(50)  NOT NULL DEFAULT 'card',
  status          VARCHAR(30)  NOT NULL DEFAULT 'pending',
  transaction_id  VARCHAR(200),
  created_at      DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- ── promotions ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coupon (
  id              INTEGER       PRIMARY KEY AUTOINCREMENT,
  code            VARCHAR(50)   NOT NULL UNIQUE,
  discount_type   VARCHAR(20)   NOT NULL DEFAULT 'percentage',
  discount_value  REAL          NOT NULL,
  min_order_value REAL          NOT NULL DEFAULT 0,
  max_uses        INTEGER,
  used_count      INTEGER       NOT NULL DEFAULT 0,
  expires_at      DATETIME,
  is_active       INTEGER       NOT NULL DEFAULT 1
);

-- ── wishlist ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wishlist (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER  NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
  created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS wishlist_item (
  id           INTEGER  PRIMARY KEY AUTOINCREMENT,
  wishlist_id  INTEGER  NOT NULL REFERENCES wishlist(id)  ON DELETE CASCADE,
  product_id   INTEGER  NOT NULL REFERENCES product(id)   ON DELETE CASCADE,
  added_at     DATETIME NOT NULL DEFAULT (datetime('now')),
  UNIQUE (wishlist_id, product_id)
);

-- ── notifications ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notification (
  id          INTEGER     PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER     NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL DEFAULT '',
  message     TEXT        NOT NULL,
  type        VARCHAR(50) NOT NULL DEFAULT 'info',
  link        VARCHAR(500),
  is_read     INTEGER     NOT NULL DEFAULT 0,
  created_at  DATETIME    NOT NULL DEFAULT (datetime('now'))
);

-- ── permissions & audit ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_type (
  id         INTEGER      PRIMARY KEY AUTOINCREMENT,
  app_label  VARCHAR(100) NOT NULL,
  model      VARCHAR(100) NOT NULL,
  UNIQUE (app_label, model)
);

CREATE TABLE IF NOT EXISTS permission (
  id               INTEGER      PRIMARY KEY AUTOINCREMENT,
  codename         VARCHAR(100) NOT NULL,
  name             VARCHAR(255) NOT NULL,
  content_type_id  INTEGER      NOT NULL REFERENCES content_type(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS permissions_mixin (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES user(id)       ON DELETE CASCADE,
  permission_id  INTEGER NOT NULL REFERENCES permission(id) ON DELETE CASCADE,
  UNIQUE (user_id, permission_id)
);

CREATE TABLE IF NOT EXISTS log_entry (
  id           INTEGER     PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER     NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  action       VARCHAR(20) NOT NULL,
  action_time  DATETIME    NOT NULL DEFAULT (datetime('now')),
  object_id    TEXT,
  message      TEXT        NOT NULL
);

-- ── indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_product_category   ON product(category_id);
CREATE INDEX IF NOT EXISTS idx_product_slug       ON product(slug);
CREATE INDEX IF NOT EXISTS idx_product_featured   ON product(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_image      ON product_image(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_user          ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_item_cart     ON cart_item(cart_id);
CREATE INDEX IF NOT EXISTS idx_order_user         ON "order"(user_id);
CREATE INDEX IF NOT EXISTS idx_order_status       ON "order"(status);
CREATE INDEX IF NOT EXISTS idx_review_product     ON review(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user      ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_user  ON notification(user_id);
