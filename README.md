# Sari-Sari Store Smart Inventory System

A complete starter system for sari-sari store owners using `Node.js`, `Express`, `PostgreSQL`, and a modern mobile-first frontend in plain `HTML`, `CSS`, and `JavaScript`.

## Core Features

- Dashboard with total sales today, profit, transaction count, utang balance, low-stock alerts, and top sellers
- Product management with add, edit, archive, search, and filter
- POS checkout with automatic stock deduction and printable receipt
- Utang module with customers, running ledger, and payment posting
- Inventory tracking for stock-in, stock-out, and adjustments
- Reports for daily summaries, top-selling products, and slow-moving products

## Backend Folder Structure

```text
backend/
  .env.example
  package.json
  src/
    app.js
    server.js
    config/
      db.js
    controllers/
      authController.js
      customerController.js
      dashboardController.js
      inventoryController.js
      productController.js
      reportController.js
      salesController.js
    db/
      schema.sql
    middleware/
      authMiddleware.js
    models/
      customerModel.js
      inventoryModel.js
      productModel.js
      reportModel.js
      salesModel.js
      userModel.js
    routes/
      authRoutes.js
      customerRoutes.js
      dashboardRoutes.js
      index.js
      inventoryRoutes.js
      productRoutes.js
      reportRoutes.js
      salesRoutes.js
    services/
      authService.js
      customerService.js
      dashboardService.js
      inventoryService.js
      productService.js
      reportService.js
      salesService.js
```

## Frontend Files

```text
frontend/
  index.html
  login.html
  dashboard.html
  products.html
  pos.html
  utang.html
  inventory.html
  reports.html
  css/
    styles.css
  js/
    api.js
    dashboard.js
    inventory.js
    layout.js
    login.js
    pos.js
    products.js
    reports.js
    utang.js
```

## Database Requirements Covered

### Tables

- `products`
- `sales`
- `sale_items`
- `customers`
- `ledger`
- `inventory_logs`
- `users`

### Relationships

- `sales.user_id -> users.id`
- `sales.customer_id -> customers.id`
- `sale_items.sale_id -> sales.id`
- `sale_items.product_id -> products.id`
- `ledger.customer_id -> customers.id`
- `ledger.sale_id -> sales.id`
- `inventory_logs.product_id -> products.id`
- `inventory_logs.sale_item_id -> sale_items.id`

### Constraints and Indexes

- Unique SKU on `products.sku`
- Check constraints for non-negative prices, stock, balances, and valid types
- Indexes on product stock, sales dates, ledger customer/date, and inventory logs
- `updated_at` triggers for `users`, `products`, and `customers`

### Auto-calculation

- Stock levels are updated inside checkout and inventory transactions
- Customer running balances are updated when credit sales and payments are posted

## ERD

```text
users
  └─< sales >─┬─< sale_items >─> products
              │
              └─< ledger >─> customers

products ─< inventory_logs >─ users
sale_items ─┘
```

## Sample API Requests and Responses

### Login

`POST /api/auth/login`

```json
{
  "pin": "1234"
}
```

```json
{
  "message": "Login successful.",
  "token": "session-token-value",
  "expiresAt": 1770000000000,
  "user": {
    "id": 1,
    "fullName": "Store Owner",
    "role": "owner"
  }
}
```

### Create Product

`POST /api/products`

```json
{
  "name": "RC Cola Mismo",
  "sku": "BEV-009",
  "buyingPrice": 17,
  "sellingPrice": 20,
  "stock": 24,
  "criticalLevel": 8,
  "category": "Beverages",
  "unit": "bottle"
}
```

### Checkout Sale

`POST /api/sales/checkout`

```json
{
  "paymentType": "cash",
  "amountPaid": 100,
  "notes": "Counter sale",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ]
}
```

```json
{
  "saleId": 7,
  "paymentType": "cash",
  "totalAmount": 50,
  "totalProfit": 9,
  "amountPaid": 100,
  "changeAmount": 50,
  "receiptLines": [
    {
      "product": "Lucky Me Pancit Canton",
      "quantity": 2,
      "unitPrice": 15,
      "lineTotal": 30
    }
  ]
}
```

### Record Payment

`POST /api/customers/:customerId/payments`

```json
{
  "amount": 50,
  "notes": "Partial payment"
}
```

### Inventory Log

`POST /api/inventory/logs`

```json
{
  "productId": 1,
  "logType": "stock_in",
  "quantity": 12,
  "reason": "Supplier delivery",
  "notes": "Restock before weekend"
}
```

## Run Locally

1. Open a terminal in [backend](/C:/Users/Christopher/Documents/New%20project/backend).
2. Install dependencies:

```bash
npm install
```

3. Copy [backend/.env.example](/C:/Users/Christopher/Documents/New%20project/backend/.env.example) to `.env`.
4. Create a PostgreSQL database named `sari_sari_inventory`.
5. Run [backend/src/db/schema.sql](/C:/Users/Christopher/Documents/New%20project/backend/src/db/schema.sql).
6. Start the server:

```bash
npm run dev
```

7. Open `http://localhost:4000`.
8. Log in with the default demo PIN: `1234`.

## Optional Improvements

- Add barcode scanning
- Add supplier and purchase order modules
- Add receipt PDF export
- Add role-based staff accounts
- Add offline caching for unstable internet connections
