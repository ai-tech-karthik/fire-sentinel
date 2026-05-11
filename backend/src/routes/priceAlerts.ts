import express from 'express';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all price alerts
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM price_alerts ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get price alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch price alerts' });
  }
});

// Get price alerts by stock ID
router.get('/stock/:stockId', async (req: AuthRequest, res) => {
  try {
    const { stockId } = req.params;
    const result = await query(
      'SELECT * FROM price_alerts WHERE stock_id = $1 ORDER BY created_at DESC',
      [stockId]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get price alerts by stock error:', error);
    res.status(500).json({ error: 'Failed to fetch price alerts' });
  }
});

// Get price alerts by symbol
router.get('/symbol/:symbol', async (req: AuthRequest, res) => {
  try {
    const { symbol } = req.params;
    const result = await query(
      'SELECT * FROM price_alerts WHERE symbol = $1 ORDER BY created_at DESC',
      [symbol.toUpperCase()]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get price alerts by symbol error:', error);
    res.status(500).json({ error: 'Failed to fetch price alerts' });
  }
});

// Get enabled price alerts (for monitoring)
router.get('/enabled/all', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM price_alerts WHERE enabled = true AND triggered_at IS NULL ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get enabled price alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch enabled price alerts' });
  }
});

// Get price alert by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM price_alerts WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Price alert not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Get price alert error:', error);
    res.status(500).json({ error: 'Failed to fetch price alert' });
  }
});

// Create price alert
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      stock_id,
      symbol,
      target_price,
      direction,
      note,
    } = req.body;
    
    if (!symbol || !target_price || !direction) {
      return res.status(400).json({ error: 'Symbol, target_price, and direction are required' });
    }
    
    if (!['above', 'below'].includes(direction)) {
      return res.status(400).json({ error: 'Direction must be "above" or "below"' });
    }
    
    const result = await query(
      `INSERT INTO price_alerts (
        stock_id, symbol, target_price, direction, note
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [stock_id || null, symbol.toUpperCase(), target_price, direction, note || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Create price alert error:', error);
    res.status(500).json({ error: 'Failed to create price alert' });
  }
});

// Update price alert
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      target_price,
      direction,
      note,
    } = req.body;
    
    const result = await query(
      `UPDATE price_alerts SET
        target_price = COALESCE($1, target_price),
        direction = COALESCE($2, direction),
        note = COALESCE($3, note),
        updated_at = NOW()
      WHERE id = $4 RETURNING *`,
      [target_price, direction, note, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Price alert not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Update price alert error:', error);
    res.status(500).json({ error: 'Failed to update price alert' });
  }
});

// Toggle enabled status
router.patch('/:id/toggle', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Enabled must be a boolean' });
    }
    
    const result = await query(
      `UPDATE price_alerts SET
        enabled = $1,
        updated_at = NOW()
      WHERE id = $2 RETURNING *`,
      [enabled, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Price alert not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Toggle price alert error:', error);
    res.status(500).json({ error: 'Failed to toggle price alert' });
  }
});

// Mark as triggered
router.patch('/:id/trigger', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `UPDATE price_alerts SET
        triggered_at = NOW(),
        enabled = false,
        updated_at = NOW()
      WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Price alert not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Mark price alert as triggered error:', error);
    res.status(500).json({ error: 'Failed to mark price alert as triggered' });
  }
});

// Reset triggered alert
router.patch('/:id/reset', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `UPDATE price_alerts SET
        triggered_at = NULL,
        enabled = true,
        updated_at = NOW()
      WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Price alert not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Reset price alert error:', error);
    res.status(500).json({ error: 'Failed to reset price alert' });
  }
});

// Delete price alert
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM price_alerts WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Price alert not found' });
    }
    
    res.json({ message: 'Price alert deleted successfully' });
  } catch (error: any) {
    console.error('Delete price alert error:', error);
    res.status(500).json({ error: 'Failed to delete price alert' });
  }
});

export default router;
