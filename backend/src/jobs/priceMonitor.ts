import axios from 'axios';
import { query } from '../config/database';
import { sendAlert } from '../utils/alertSender';

export const runPriceMonitor = async () => {
  try {
    // Get settings
    const settingsResult = await query('SELECT * FROM settings LIMIT 1');
    if (settingsResult.rows.length === 0) {
      console.log('No settings found, skipping price monitor');
      return;
    }
    
    const settings = settingsResult.rows[0];
    const apiKey = settings.alpha_vantage_api_key;
    
    if (!apiKey) {
      console.log('No Alpha Vantage API key configured, skipping price monitor');
      return;
    }
    
    // Get all stocks
    const stocksResult = await query('SELECT * FROM stocks');
    const stocks = stocksResult.rows;
    
    if (stocks.length === 0) {
      console.log('No stocks to monitor');
      return;
    }
    
    console.log(`Monitoring ${stocks.length} stocks...`);
    
    // Process stocks with rate limiting (5 per minute for free tier)
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      
      try {
        // Fetch current price
        const price = await fetchStockPrice(stock.symbol, apiKey);
        
        if (price) {
          // Update stock price
          await query(
            `UPDATE stocks SET 
              current_price = $1, 
              last_price_update = NOW(),
              updated_at = NOW()
            WHERE id = $2`,
            [price, stock.id]
          );
          
          console.log(`${stock.symbol}: $${price}`);
          
          // Check profit target
          const profitTarget = parseFloat(stock.bought_price) * (1 + parseFloat(stock.target_profit_percentage) / 100);
          if (price >= profitTarget) {
            await createAlert(
              stock.id,
              stock.symbol,
              'profit_target',
              `${stock.symbol} has reached your profit target of ${stock.target_profit_percentage}%. Current price: $${price}, Target: $${profitTarget.toFixed(2)}`,
              price
            );
          }
          
          // Check stop loss
          const stopLoss = parseFloat(stock.bought_price) * (1 - parseFloat(stock.stop_loss_percentage) / 100);
          if (price <= stopLoss) {
            await createAlert(
              stock.id,
              stock.symbol,
              'stop_loss',
              `${stock.symbol} has hit your stop loss of ${stock.stop_loss_percentage}%. Current price: $${price}, Stop loss: $${stopLoss.toFixed(2)}`,
              price
            );
          }
          
          // Check custom price alerts
          await checkPriceAlerts(stock.symbol, price);
        }
        
        // Rate limiting: wait 12 seconds between requests (5 per minute)
        if (i < stocks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 12000));
        }
      } catch (error) {
        console.error(`Error monitoring ${stock.symbol}:`, error);
      }
    }
  } catch (error) {
    console.error('Price monitor error:', error);
    throw error;
  }
};

const fetchStockPrice = async (symbol: string, apiKey: string): Promise<number | null> => {
  try {
    // Try Alpha Vantage first
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const response = await axios.get(url, { timeout: 10000 });
    
    const quote = response.data['Global Quote'];
    if (quote && quote['05. price']) {
      return parseFloat(quote['05. price']);
    }
    
    // Fallback to Yahoo Finance
    return await fetchYahooPrice(symbol);
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    // Try Yahoo Finance as fallback
    return await fetchYahooPrice(symbol);
  }
};

const fetchYahooPrice = async (symbol: string): Promise<number | null> => {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await axios.get(url, { timeout: 10000 });
    
    const result = response.data?.chart?.result?.[0];
    if (result?.meta?.regularMarketPrice) {
      return parseFloat(result.meta.regularMarketPrice);
    }
    
    return null;
  } catch (error) {
    console.error(`Yahoo Finance error for ${symbol}:`, error);
    return null;
  }
};

const createAlert = async (
  stockId: string,
  symbol: string,
  alertType: string,
  message: string,
  triggerPrice: number
) => {
  try {
    // Check if alert already exists recently (within last hour)
    const recentAlert = await query(
      `SELECT id FROM alerts 
       WHERE stock_id = $1 AND alert_type = $2 
       AND created_at > NOW() - INTERVAL '1 hour'`,
      [stockId, alertType]
    );
    
    if (recentAlert.rows.length > 0) {
      console.log(`Alert already sent for ${symbol} ${alertType} in the last hour`);
      return;
    }
    
    // Create alert
    const result = await query(
      `INSERT INTO alerts (stock_id, symbol, alert_type, message, trigger_price)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [stockId, symbol, alertType, message, triggerPrice]
    );
    
    console.log(`Alert created: ${symbol} ${alertType}`);
    
    // Send notification
    await sendAlert(result.rows[0]);
  } catch (error) {
    console.error('Error creating alert:', error);
  }
};

const checkPriceAlerts = async (symbol: string, currentPrice: number) => {
  try {
    // Get enabled price alerts for this symbol
    const result = await query(
      `SELECT * FROM price_alerts 
       WHERE symbol = $1 AND enabled = true AND triggered_at IS NULL`,
      [symbol]
    );
    
    for (const alert of result.rows) {
      const targetPrice = parseFloat(alert.target_price);
      let triggered = false;
      
      if (alert.direction === 'above' && currentPrice >= targetPrice) {
        triggered = true;
      } else if (alert.direction === 'below' && currentPrice <= targetPrice) {
        triggered = true;
      }
      
      if (triggered) {
        // Mark alert as triggered
        await query(
          `UPDATE price_alerts SET 
            triggered_at = NOW(), 
            enabled = false,
            updated_at = NOW()
          WHERE id = $1`,
          [alert.id]
        );
        
        // Create alert
        const direction = alert.direction === 'above' ? 'reached or exceeded' : 'fallen to or below';
        const message = `${symbol} has ${direction} your target price of $${targetPrice}. Current price: $${currentPrice}${alert.note ? `. Note: ${alert.note}` : ''}`;
        
        await createAlert(
          alert.stock_id,
          symbol,
          'custom_price',
          message,
          currentPrice
        );
        
        console.log(`Custom price alert triggered: ${symbol} ${alert.direction} $${targetPrice}`);
      }
    }
  } catch (error) {
    console.error('Error checking price alerts:', error);
  }
};
