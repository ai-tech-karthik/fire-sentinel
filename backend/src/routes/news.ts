import express from 'express';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all news with pagination and filtering
router.get('/', async (req: AuthRequest, res) => {
  try {
    const {
      symbol,
      sentiment_label,
      limit = '50',
      offset = '0',
    } = req.query;
    
    let sql = 'SELECT * FROM news WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;
    
    if (symbol && symbol !== 'all') {
      paramCount++;
      sql += ` AND symbol = $${paramCount}`;
      params.push(symbol);
    }
    
    if (sentiment_label && sentiment_label !== 'all') {
      paramCount++;
      sql += ` AND sentiment_label = $${paramCount}`;
      params.push(sentiment_label);
    }
    
    sql += ' ORDER BY published_at DESC, created_at DESC';
    
    paramCount++;
    sql += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit as string));
    
    paramCount++;
    sql += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset as string));
    
    const result = await query(sql, params);
    
    // Get total count
    let countSql = 'SELECT COUNT(*) FROM news WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 0;
    
    if (symbol && symbol !== 'all') {
      countParamCount++;
      countSql += ` AND symbol = $${countParamCount}`;
      countParams.push(symbol);
    }
    
    if (sentiment_label && sentiment_label !== 'all') {
      countParamCount++;
      countSql += ` AND sentiment_label = $${countParamCount}`;
      countParams.push(sentiment_label);
    }
    
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      news: result.rows,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get recent news
router.get('/recent', async (req: AuthRequest, res) => {
  try {
    const { limit = '10' } = req.query;
    
    const result = await query(
      'SELECT * FROM news ORDER BY published_at DESC, created_at DESC LIMIT $1',
      [parseInt(limit as string)]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get recent news error:', error);
    res.status(500).json({ error: 'Failed to fetch recent news' });
  }
});

// Get news by symbol
router.get('/symbol/:symbol', async (req: AuthRequest, res) => {
  try {
    const { symbol } = req.params;
    const { limit = '50' } = req.query;
    
    const result = await query(
      'SELECT * FROM news WHERE symbol = $1 ORDER BY published_at DESC, created_at DESC LIMIT $2',
      [symbol.toUpperCase(), parseInt(limit as string)]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get news by symbol error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get news by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM news WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Create news (used by monitoring jobs)
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      symbol,
      title,
      source,
      url,
      published_at,
      sentiment_score,
      sentiment_label,
    } = req.body;
    
    if (!symbol || !title) {
      return res.status(400).json({ error: 'Symbol and title are required' });
    }
    
    const result = await query(
      `INSERT INTO news (
        symbol, title, source, url, published_at, sentiment_score, sentiment_label
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      ON CONFLICT (symbol, url) DO UPDATE SET
        title = EXCLUDED.title,
        sentiment_score = EXCLUDED.sentiment_score,
        sentiment_label = EXCLUDED.sentiment_label
      RETURNING *`,
      [
        symbol.toUpperCase(),
        title,
        source || null,
        url || null,
        published_at || null,
        sentiment_score || null,
        sentiment_label || null,
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// Delete news
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM news WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    res.json({ message: 'News deleted successfully' });
  } catch (error: any) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

// Get news statistics
router.get('/stats/sentiment', async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT 
        sentiment_label,
        COUNT(*) as count,
        AVG(sentiment_score) as avg_score
      FROM news
      WHERE sentiment_label IS NOT NULL
      GROUP BY sentiment_label
      ORDER BY count DESC
    `);
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get news stats error:', error);
    res.status(500).json({ error: 'Failed to fetch news statistics' });
  }
});

export default router;
