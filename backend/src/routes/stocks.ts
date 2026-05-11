import express from 'express';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all stocks
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT s.*, a.name as account_name 
      FROM stocks s 
      LEFT JOIN accounts a ON s.account_id = a.id 
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get stocks error:', error);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// Get stocks by account
router.get('/account/:accountId', async (req: AuthRequest, res) => {
  try {
    const { accountId } = req.params;
    const result = await query(
      'SELECT * FROM stocks WHERE account_id = $1 ORDER BY created_at DESC',
      [accountId]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get stocks by account error:', error);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// Get stock by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM stocks WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Get stock error:', error);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

// Create stock
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      account_id,
      symbol,
      quantity,
      bought_price,
      target_profit_percentage,
      stop_loss_percentage,
    } = req.body;
    
    if (!account_id || !symbol || !quantity || !bought_price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await query(
      `INSERT INTO stocks (
        account_id, symbol, quantity, bought_price, 
        target_profit_percentage, stop_loss_percentage
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        account_id,
        symbol.toUpperCase(),
        quantity,
        bought_price,
        target_profit_percentage || 20.00,
        stop_loss_percentage || 10.00,
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Create stock error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Stock already exists in this account' });
    }
    res.status(500).json({ error: 'Failed to create stock' });
  }
});

// Update stock
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      quantity,
      bought_price,
      current_price,
      target_profit_percentage,
      stop_loss_percentage,
    } = req.body;
    
    const result = await query(
      `UPDATE stocks SET 
        quantity = COALESCE($1, quantity),
        bought_price = COALESCE($2, bought_price),
        current_price = COALESCE($3, current_price),
        target_profit_percentage = COALESCE($4, target_profit_percentage),
        stop_loss_percentage = COALESCE($5, stop_loss_percentage),
        updated_at = NOW()
      WHERE id = $6 RETURNING *`,
      [quantity, bought_price, current_price, target_profit_percentage, stop_loss_percentage, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Update stock price
router.patch('/:id/price', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { current_price } = req.body;
    
    if (!current_price) {
      return res.status(400).json({ error: 'Current price is required' });
    }
    
    const result = await query(
      `UPDATE stocks SET 
        current_price = $1,
        last_price_update = NOW(),
        updated_at = NOW()
      WHERE id = $2 RETURNING *`,
      [current_price, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Update stock price error:', error);
    res.status(500).json({ error: 'Failed to update stock price' });
  }
});

// Delete stock
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM stocks WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json({ message: 'Stock deleted successfully' });
  } catch (error: any) {
    console.error('Delete stock error:', error);
    res.status(500).json({ error: 'Failed to delete stock' });
  }
});

// Get unique symbols
router.get('/symbols/unique', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT DISTINCT symbol FROM stocks ORDER BY symbol'
    );
    res.json(result.rows.map((row: any) => row.symbol));
  } catch (error: any) {
    console.error('Get unique symbols error:', error);
    res.status(500).json({ error: 'Failed to fetch symbols' });
  }
});

export default router;
