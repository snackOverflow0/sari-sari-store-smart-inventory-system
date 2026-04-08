CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  pin_salt VARCHAR(120) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'owner',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  buying_price NUMERIC(12, 2) NOT NULL CHECK (buying_price >= 0),
  selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  critical_level INTEGER NOT NULL DEFAULT 5 CHECK (critical_level >= 0),
  category VARCHAR(80) NOT NULL DEFAULT 'General',
  unit VARCHAR(40) NOT NULL DEFAULT 'pc',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(140) NOT NULL,
  phone VARCHAR(30),
  address TEXT,
  notes TEXT,
  current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (current_balance >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('cash', 'credit', 'mixed')),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  total_cost NUMERIC(12, 2) NOT NULL CHECK (total_cost >= 0),
  total_profit NUMERIC(12, 2) NOT NULL,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  change_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (change_amount >= 0),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_buying_price NUMERIC(12, 2) NOT NULL CHECK (unit_buying_price >= 0),
  unit_selling_price NUMERIC(12, 2) NOT NULL CHECK (unit_selling_price >= 0),
  line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
  line_profit NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  sale_id INTEGER REFERENCES sales(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('credit', 'payment', 'adjustment')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  balance_after NUMERIC(12, 2) NOT NULL CHECK (balance_after >= 0),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sale_item_id INTEGER REFERENCES sale_items(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  log_type VARCHAR(20) NOT NULL CHECK (log_type IN ('stock_in', 'stock_out', 'adjustment')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  before_stock INTEGER NOT NULL CHECK (before_stock >= 0),
  after_stock INTEGER NOT NULL CHECK (after_stock >= 0),
  reason VARCHAR(120) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_stock_critical ON products(stock, critical_level);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_balance ON customers(current_balance DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_customer_date ON ledger(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_date ON inventory_logs(product_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO users (full_name, pin_salt, pin_hash, role)
SELECT 'Store Owner', 'sari-owner-salt', 'cf983dbed872f2b2db1babd24bc148edfa9fb644fa8fc1f1ba1612f080822747', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'owner');

INSERT INTO products (name, sku, buying_price, selling_price, stock, critical_level, category, unit)
VALUES
  ('Lucky Me Pancit Canton', 'NOOD-001', 12.50, 15.00, 48, 15, 'Noodles', 'pack'),
  ('Coke Mismo', 'BEV-001', 18.00, 20.00, 22, 10, 'Beverages', 'bottle'),
  ('Bear Brand 33g', 'MILK-001', 14.00, 16.00, 8, 12, 'Milk', 'sachet'),
  ('Safeguard White', 'CARE-001', 33.00, 38.00, 16, 6, 'Personal Care', 'bar'),
  ('555 Sardines', 'CAN-001', 26.00, 30.00, 35, 10, 'Canned Goods', 'can'),
  ('Nescafe Original 25g', 'COF-001', 8.00, 10.00, 60, 20, 'Coffee', 'sachet'),
  ('Gardenia Classic', 'BRD-001', 72.00, 78.00, 6, 8, 'Bread', 'loaf')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO customers (full_name, phone, address, notes, current_balance)
SELECT 'Maria Santos', '09171234567', 'Purok 1', 'Regular neighborhood buyer', 120.00
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE full_name = 'Maria Santos');

INSERT INTO customers (full_name, phone, address, notes, current_balance)
SELECT 'Juan Dela Cruz', '09181234567', 'Purok 2', 'Pays weekly', 80.00
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE full_name = 'Juan Dela Cruz');
