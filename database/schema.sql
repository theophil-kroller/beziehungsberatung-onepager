PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name_de TEXT NOT NULL,
  name_en TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('individual','couple')),
  sessions_total INTEGER NOT NULL CHECK (sessions_total >= 0),
  session_minutes INTEGER NOT NULL,
  validity_days INTEGER,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  product_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'manual',
  provider_payment_id TEXT,
  amount_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS credits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  product_id TEXT NOT NULL,
  purchase_id INTEGER,
  total INTEGER NOT NULL,
  remaining INTEGER NOT NULL,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id)
);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  credit_id INTEGER NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  booking_event_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (credit_id) REFERENCES credits(id)
);

CREATE TABLE IF NOT EXISTS access_tokens (
  token_hash TEXT PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  expires_at TEXT,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  title_de TEXT NOT NULL,
  title_en TEXT NOT NULL,
  material_type TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_credits_customer ON credits(customer_id);
CREATE INDEX IF NOT EXISTS idx_materials_product ON materials(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_customer ON purchases(customer_id);

INSERT OR IGNORE INTO products
(id,name_de,name_en,session_type,sessions_total,session_minutes,validity_days)
VALUES
('process-5','Prozessbegleitung – 5 Sitzungen','Process support – 5 sessions','individual',5,60,180),
('poly-starter','Poly Starter','Poly Starter','couple',3,90,180),
('trust-restart','Neustart nach Vertrauensbruch','Restart after a breach of trust','couple',5,90,180);
