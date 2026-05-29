import pg from 'pg';

// Neon PostgreSQL connection pool
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
}
