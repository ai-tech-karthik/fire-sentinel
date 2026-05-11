import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { query } from '../config/database';
import { sendAlert } from '../utils/alertSender';

export const runNewsMonitor = async () => {
  try {
    // Get settings
    const settingsResult = await query('SELECT * FROM settings LIMIT 1');
    if (settingsResult.rows.length === 0) {
      console.log('No settings found, skipping news monitor');
      return;
    }
    
    const settings = settingsResult.rows[0];
    
    // Get unique symbols from stocks
    const symbolsResult = await query('SELECT DISTINCT symbol FROM stocks');
    const symbols = symbolsResult.rows.map((row: any) => row.symbol);
    
    if (symbols.length === 0) {
      console.log('No stocks to monitor for news');
      return;
    }
    
    console.log(`Monitoring news for ${symbols.length} symbols...`);
    
    // Process each symbol
    for (const symbol of symbols) {
      try {
        const articles = await fetchNews(symbol);
        
        if (articles.length > 0) {
          console.log(`Found ${articles.length} articles for ${symbol}`);
          
          // Analyze sentiment if Gen AI is configured
          for (const article of articles) {
            let sentimentScore = null;
            let sentimentLabel = null;
            
            if (settings.gen_ai_api_key && settings.gen_ai_platform) {
              const sentiment = await analyzeSentiment(
                article.title,
                settings.gen_ai_platform,
                settings.gen_ai_api_key
              );
              sentimentScore = sentiment.score;
              sentimentLabel = sentiment.label;
            }
            
            // Save news article
            await query(
              `INSERT INTO news (symbol, title, source, url, published_at, sentiment_score, sentiment_label)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (symbol, url) DO UPDATE SET
                 sentiment_score = EXCLUDED.sentiment_score,
                 sentiment_label = EXCLUDED.sentiment_label`,
              [
                symbol,
                article.title,
                article.source,
                article.url,
                article.publishedAt,
                sentimentScore,
                sentimentLabel,
              ]
            );
            
            // Create alert for negative sentiment
            if (sentimentLabel === 'negative') {
              await createSentimentAlert(symbol, article.title, sentimentScore);
            }
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error monitoring news for ${symbol}:`, error);
      }
    }
  } catch (error) {
    console.error('News monitor error:', error);
    throw error;
  }
};

const fetchNews = async (symbol: string): Promise<any[]> => {
  try {
    // Use Google News RSS feed
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(symbol + ' stock')}&hl=en-US&gl=US&ceid=US:en`;
    const response = await axios.get(url, { timeout: 10000 });
    
    const result = await parseStringPromise(response.data);
    const items = result.rss?.channel?.[0]?.item || [];
    
    return items.slice(0, 5).map((item: any) => ({
      title: item.title?.[0] || '',
      url: item.link?.[0] || '',
      source: item.source?.[0]?._ || 'Google News',
      publishedAt: item.pubDate?.[0] ? new Date(item.pubDate[0]) : new Date(),
    }));
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
};

const analyzeSentiment = async (
  text: string,
  platform: string,
  apiKey: string
): Promise<{ score: number; label: string }> => {
  try {
    switch (platform) {
      case 'openai':
        return await analyzeWithOpenAI(text, apiKey);
      case 'anthropic':
        return await analyzeWithAnthropic(text, apiKey);
      case 'google':
        return await analyzeWithGoogle(text, apiKey);
      default:
        return { score: 0, label: 'neutral' };
    }
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return { score: 0, label: 'neutral' };
  }
};

const analyzeWithOpenAI = async (text: string, apiKey: string) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial sentiment analyzer. Analyze the sentiment of the given text and respond with only a number between -1 (very negative) and 1 (very positive).',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    
    const score = parseFloat(response.data.choices[0].message.content.trim());
    return {
      score: isNaN(score) ? 0 : score,
      label: score < -0.3 ? 'negative' : score > 0.3 ? 'positive' : 'neutral',
    };
  } catch (error) {
    console.error('OpenAI sentiment analysis error:', error);
    return { score: 0, label: 'neutral' };
  }
};

const analyzeWithAnthropic = async (text: string, apiKey: string) => {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: `Analyze the sentiment of this text and respond with only a number between -1 (very negative) and 1 (very positive): ${text}`,
          },
        ],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    
    const score = parseFloat(response.data.content[0].text.trim());
    return {
      score: isNaN(score) ? 0 : score,
      label: score < -0.3 ? 'negative' : score > 0.3 ? 'positive' : 'neutral',
    };
  } catch (error) {
    console.error('Anthropic sentiment analysis error:', error);
    return { score: 0, label: 'neutral' };
  }
};

const analyzeWithGoogle = async (text: string, apiKey: string) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Analyze the sentiment of this text and respond with only a number between -1 (very negative) and 1 (very positive): ${text}`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    
    const score = parseFloat(response.data.candidates[0].content.parts[0].text.trim());
    return {
      score: isNaN(score) ? 0 : score,
      label: score < -0.3 ? 'negative' : score > 0.3 ? 'positive' : 'neutral',
    };
  } catch (error) {
    console.error('Google sentiment analysis error:', error);
    return { score: 0, label: 'neutral' };
  }
};

const createSentimentAlert = async (
  symbol: string,
  title: string,
  sentimentScore: number | null
) => {
  try {
    // Check if alert already exists recently (within last 24 hours)
    const recentAlert = await query(
      `SELECT id FROM alerts 
       WHERE symbol = $1 AND alert_type = 'negative_sentiment'
       AND created_at > NOW() - INTERVAL '24 hours'`,
      [symbol]
    );
    
    if (recentAlert.rows.length > 0) {
      console.log(`Sentiment alert already sent for ${symbol} in the last 24 hours`);
      return;
    }
    
    // Get stock_id
    const stockResult = await query(
      'SELECT id FROM stocks WHERE symbol = $1 LIMIT 1',
      [symbol]
    );
    
    const stockId = stockResult.rows.length > 0 ? stockResult.rows[0].id : null;
    
    // Create alert
    const message = `Negative sentiment detected for ${symbol}: "${title}"${sentimentScore ? ` (Score: ${sentimentScore.toFixed(2)})` : ''}`;
    
    await query(
      `INSERT INTO alerts (stock_id, symbol, alert_type, message, trigger_value)
       VALUES ($1, $2, 'negative_sentiment', $3, $4)`,
      [stockId, symbol, message, sentimentScore?.toString() || null]
    );
    
    console.log(`Sentiment alert created for ${symbol}`);
    
    // Send notification
    const alert = {
      symbol,
      alert_type: 'negative_sentiment',
      message,
      trigger_value: sentimentScore?.toString() || null,
    };
    
    await sendAlert(alert);
  } catch (error) {
    console.error('Error creating sentiment alert:', error);
  }
};
