import express from 'express';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get settings
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT * FROM settings LIMIT 1');
    
    if (result.rows.length === 0) {
      // Create default settings if none exist
      const createResult = await query(
        `INSERT INTO settings (
          price_check_frequency, news_check_frequency
        ) VALUES (300, 600) RETURNING *`
      );
      return res.json(createResult.rows[0]);
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.put('/', async (req: AuthRequest, res) => {
  try {
    const {
      alpha_vantage_api_key,
      gen_ai_platform,
      gen_ai_api_key,
      price_check_frequency,
      news_check_frequency,
      email_enabled,
      email_address,
      slack_enabled,
      slack_webhook_url,
      sms_enabled,
      sms_phone_number,
    } = req.body;
    
    // Get existing settings
    const existing = await query('SELECT id FROM settings LIMIT 1');
    
    if (existing.rows.length === 0) {
      // Create new settings
      const result = await query(
        `INSERT INTO settings (
          alpha_vantage_api_key, gen_ai_platform, gen_ai_api_key,
          price_check_frequency, news_check_frequency,
          email_enabled, email_address,
          slack_enabled, slack_webhook_url,
          sms_enabled, sms_phone_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          alpha_vantage_api_key || null,
          gen_ai_platform || null,
          gen_ai_api_key || null,
          price_check_frequency || 300,
          news_check_frequency || 600,
          email_enabled || false,
          email_address || null,
          slack_enabled || false,
          slack_webhook_url || null,
          sms_enabled || false,
          sms_phone_number || null,
        ]
      );
      return res.json(result.rows[0]);
    }
    
    // Update existing settings
    const result = await query(
      `UPDATE settings SET
        alpha_vantage_api_key = COALESCE($1, alpha_vantage_api_key),
        gen_ai_platform = COALESCE($2, gen_ai_platform),
        gen_ai_api_key = COALESCE($3, gen_ai_api_key),
        price_check_frequency = COALESCE($4, price_check_frequency),
        news_check_frequency = COALESCE($5, news_check_frequency),
        email_enabled = COALESCE($6, email_enabled),
        email_address = COALESCE($7, email_address),
        slack_enabled = COALESCE($8, slack_enabled),
        slack_webhook_url = COALESCE($9, slack_webhook_url),
        sms_enabled = COALESCE($10, sms_enabled),
        sms_phone_number = COALESCE($11, sms_phone_number),
        updated_at = NOW()
      WHERE id = $12 RETURNING *`,
      [
        alpha_vantage_api_key,
        gen_ai_platform,
        gen_ai_api_key,
        price_check_frequency,
        news_check_frequency,
        email_enabled,
        email_address,
        slack_enabled,
        slack_webhook_url,
        sms_enabled,
        sms_phone_number,
        existing.rows[0].id,
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Clear API key (for security)
router.delete('/api-key/:type', async (req: AuthRequest, res) => {
  try {
    const { type } = req.params;
    
    let field: string;
    switch (type) {
      case 'alpha_vantage':
        field = 'alpha_vantage_api_key';
        break;
      case 'gen_ai':
        field = 'gen_ai_api_key';
        break;
      default:
        return res.status(400).json({ error: 'Invalid API key type' });
    }
    
    const result = await query(
      `UPDATE settings SET ${field} = NULL, updated_at = NOW() RETURNING *`
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Clear API key error:', error);
    res.status(500).json({ error: 'Failed to clear API key' });
  }
});

export default router;
