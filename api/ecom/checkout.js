import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_VbfomApGF17h@ep-plain-heart-aqnr5gg1-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
});

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
