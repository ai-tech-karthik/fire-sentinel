import express from 'express';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all alerts with pagination and filtering
router.get('/', async (req: AuthRequest, res) => {
  try {
    const {
      symbol,
      alert_type,
      limit = '50',
      offset = '0',
    } = req.query;
    
    let sql = 'SELECT * FROM alerts WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;
    
    if (symbol && symbol !== 'all') {
      paramCount++;
      sql += ` AND symbol = $${paramCount}`;
      params.push(symbol);
    }
    
    if (alert_type && alert_type !== 'all') {
      paramCount++;
      sql += ` AND alert_type = $${paramCount}`;
      params.push(alert_type);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    paramCount++;
    sql += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit as string));
    
    paramCount++;
    sql += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset as string));
    
    const result = await query(sql, params);
    
    // Get total count
    let countSql = 'SELECT COUNT(*) FROM alerts WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 0;
    
    if (symbol && symbol !== 'all') {
      countParamCount++;
      countSql += ` AND symbol = $${countParamCount}`;
      countParams.push(symbol);
    }
    
    if (alert_type && alert_type !== 'all') {
      countParamCount++;
      countSql += ` AND alert_type = $${countParamCount}`;
      countParams.push(alert_type);
    }
    
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      alerts: result.rows,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get recent alerts
router.get('/recent', async (req: AuthRequest, res) => {
  try {
    const { limit = '10' } = req.query;
    
    const result = await query(
      'SELECT * FROM alerts ORDER BY created_at DESC LIMIT $1',
      [parseInt(limit as string)]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get recent alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch recent alerts' });
  }
});

// Get alerts by symbol
router.get('/symbol/:symbol', async (req: AuthRequest, res) => {
  try {
    const { symbol } = req.params;
    const { limit = '50' } = req.query;
    
    const result = await query(
      'SELECT * FROM alerts WHERE symbol = $1 ORDER BY created_at DESC LIMIT $2',
      [symbol.toUpperCase(), parseInt(limit as string)]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get alerts by symbol error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alerts by stock ID
router.get('/stock/:stockId', async (req: AuthRequest, res) => {
  try {
    const { stockId } = req.params;
    const { limit = '50' } = req.query;
    
    const result = await query(
      'SELECT * FROM alerts WHERE stock_id = $1 ORDER BY created_at DESC LIMIT $2',
      [stockId, parseInt(limit as string)]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get alerts by stock error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alert by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM alerts WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Get alert error:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

// Create alert (used by monitoring jobs)
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      stock_id,
      symbol,
      alert_type,
      message,
      trigger_price,
      trigger_value,
    } = req.body;
    
    if (!symbol || !alert_type || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await query(
      `INSERT INTO alerts (
        stock_id, symbol, alert_type, message, trigger_price, trigger_value
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [stock_id || null, symbol.toUpperCase(), alert_type, message, trigger_price || null, trigger_value || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Delete alert
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM alerts WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json({ message: 'Alert deleted successfully' });
  } catch (error: any) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Get alert statistics
router.get('/stats/summary', async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT 
        alert_type,
        COUNT(*) as count
      FROM alerts
      GROUP BY alert_type
      ORDER BY count DESC
    `);
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get alert stats error:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

export default router;
