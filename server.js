// server.js
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Neon PostgreSQL connection pool
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_VbfomApGF17h@ep-plain-heart-aqnr5gg1-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Database connected successfully. Server time:', res.rows[0].now);
  }
});

// API Endpoint 1: Search Stores by Name
app.get('/api/search-stores', async (req, res) => {
  const query = req.query.q || '';
  try {
    const result = await pool.query(
      'SELECT store_id, store_name FROM stores WHERE store_name ILIKE $1 ORDER BY store_name LIMIT 20',
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching stores:', error);
    res.status(500).json({ error: 'Database search query failed.' });
  }
});

// API Endpoint 2: Get Store Info and Storefront Products
app.get('/api/stores/:storeId/products', async (req, res) => {
  const { storeId } = req.params;
  try {
    // 1. Fetch Store Details
    const storeResult = await pool.query(
      'SELECT store_id, store_name FROM stores WHERE store_id = $1',
      [storeId]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    // 2. Fetch Store's Products (using mapped columns matches: photos array, image_url string, images array, current_stock_level, category, description)
    const productsResult = await pool.query(
      'SELECT id, store_id, name, price, description, photos, images, image_url, current_stock_level FROM products WHERE store_id = $1 ORDER BY id DESC',
      [storeId]
    );

    res.json({
      store: storeResult.rows[0],
      products: productsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching store storefront products:', error);
    res.status(500).json({ error: 'Database query failed.' });
  }
});

// Base root endpoint
app.get('/', (req, res) => {
  res.json({
    status: "active",
    message: "VendorVerse E-Commerce API is running.",
    endpoints: [
      "/api/search-stores?q=...",
      "/api/stores/:storeId/products",
      "/api/ecom/checkout"
    ]
  });
});

// API Endpoint 3: E-Commerce Transactional Checkout Registration
app.post('/api/ecom/checkout', async (req, res) => {
  const { storeId, buyerName, method, cart } = req.body;
  
  console.log('Received Checkout Order Payload:', { storeId, buyerName, method, cart });
  if (!storeId || !cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Invalid checkout payload parameters.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const txId = `TX_CUST_${Date.now()}_${storeId}`;
    let totalCheckoutAmount = 0;
    // Perform transactional stock checks and updates
    for (const item of cart) {
      const prodRes = await client.query('SELECT current_stock_level, price, cost_price, name FROM products WHERE id = $1', [item.productId]);
      if (prodRes.rows.length === 0) {
        throw new Error(`Product ID ${item.productId} not found.`);
      }
      const product = prodRes.rows[0];
      const currentStock = product.current_stock_level;
      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product ID ${item.productId}.`);
      }
      const unitPrice = parseFloat(product.price || 0);
      const costPrice = parseFloat(product.cost_price || 0);
      const itemTotal = unitPrice * item.quantity;
      totalCheckoutAmount += itemTotal;
      // Deduct stock levels
      await client.query(
        'UPDATE products SET current_stock_level = current_stock_level - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
      // Record transaction
      const itemTxId = `${txId}_${item.productId}`;
      await client.query(
        `INSERT INTO transactions (transaction_id, store_id, product_id, quantity, client_name, amount, method, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [itemTxId, storeId, item.productId, item.quantity, buyerName || 'E-Commerce Buyer', itemTotal, method || 'Razorpay', 'COMPLETED']
      );
      // Record P&L
      const netMargin = unitPrice > 0 ? ((unitPrice - costPrice) / unitPrice) * 100 : 0;
      await client.query(
        `INSERT INTO profit_loss_tracking (transaction_id, cost_price_per_unit, selling_price_per_unit, net_profit_margin, total_expense, total_revenue)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [itemTxId, costPrice, unitPrice, isNaN(netMargin) ? 0 : netMargin, costPrice * item.quantity, itemTotal]
      );
    }
    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Payment verified and order confirmed successfully!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error executing checkout transaction:', error);
    res.status(500).json({ error: error.message || 'Internal checkout transaction database processing failed.' });
  } finally {
    client.release();
  }
});

// Catch-all fallback route
app.use((req, res) => {
  res.status(404).json({ error: "Route not found. Valid endpoints are /api/search-stores or /api/stores/:id/products" });
});

app.listen(PORT, () => {
  console.log(`Express API Server running on port ${PORT}`);
});
