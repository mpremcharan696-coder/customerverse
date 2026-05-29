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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { storeId } = req.query;
  try {
    const storeResult = await pool.query(
      'SELECT store_id, store_name FROM stores WHERE store_id = $1',
      [storeId]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found.' });
    }

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
}
