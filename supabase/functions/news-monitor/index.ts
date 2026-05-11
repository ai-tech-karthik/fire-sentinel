import { createClient } from 'jsr:@supabase/supabase-js@2';
import { DOMParser } from 'jsr:@b-fuze/deno-dom';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

function analyzeSentiment(text: string): { score: number; label: 'positive' | 'neutral' | 'negative' } {
  const positiveWords = [
    'gain', 'profit', 'surge', 'rally', 'growth', 'rise', 'increase', 'up', 'high', 'strong',
    'bullish', 'beat', 'exceed', 'outperform', 'success', 'positive', 'upgrade', 'buy',
  ];
  
  const negativeWords = [
    'loss', 'fall', 'drop', 'decline', 'down', 'low', 'weak', 'bearish', 'miss', 'underperform',
    'fail', 'negative', 'downgrade', 'sell', 'crash', 'plunge', 'tumble', 'slump',
  ];

  const lowerText = text.toLowerCase();
  let score = 0;

  for (const word of positiveWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) score += matches.length * 0.1;
  }

  for (const word of negativeWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) score -= matches.length * 0.1;
  }

  score = Math.max(-1, Math.min(1, score));

  let label: 'positive' | 'neutral' | 'negative';
  if (score > 0.2) label = 'positive';
  else if (score < -0.2) label = 'negative';
  else label = 'neutral';

  return { score: parseFloat(score.toFixed(2)), label };
}

async function analyzeSentimentWithAI(
  text: string,
  platform: string,
  apiKey: string
): Promise<{ score: number; label: 'positive' | 'neutral' | 'negative' } | null> {
  try {
    if (platform === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a financial sentiment analyzer. Analyze the sentiment of news headlines and return a JSON object with "score" (number between -1 and 1) and "label" (positive, neutral, or negative).',
            },
            {
              role: 'user',
              content: `Analyze the sentiment of this financial news headline: "${text}"`,
            },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) return null;

      const parsed = JSON.parse(content);
      return {
        score: parseFloat(parsed.score),
        label: parsed.label,
      };
    } else if (platform === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Analyze the sentiment of this financial news headline and return ONLY a JSON object with "score" (number between -1 and 1) and "label" (positive, neutral, or negative): "${text}"`,
            },
          ],
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const content = data.content[0]?.text;
      if (!content) return null;

      const parsed = JSON.parse(content);
      return {
        score: parseFloat(parsed.score),
        label: parsed.label,
      };
    } else if (platform === 'google') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze the sentiment of this financial news headline and return ONLY a JSON object with "score" (number between -1 and 1) and "label" (positive, neutral, or negative): "${text}"`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const content = data.candidates[0]?.content?.parts[0]?.text;
      if (!content) return null;

      const parsed = JSON.parse(content);
      return {
        score: parseFloat(parsed.score),
        label: parsed.label,
      };
    }

    return null;
  } catch (error) {
    console.error('AI sentiment analysis error:', error);
    return null;
  }
}

async function fetchGoogleNewsRSS(symbol: string): Promise<NewsItem[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(symbol + ' stock')}&hl=en-US&gl=US&ceid=US:en`;
    const response = await fetch(url);
    const xmlText = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    
    if (!doc) return [];

    const items = doc.querySelectorAll('item');
    const news: NewsItem[] = [];

    for (const item of items) {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const source = item.querySelector('source')?.textContent || 'Google News';

      if (title && link) {
        news.push({
          title,
          source,
          url: link,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        });
      }
    }

    return news.slice(0, 10);
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*');

    if (settingsError) throw settingsError;

    const settingsMap = (settingsData || []).reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    const genAiPlatform = settingsMap.api_genai_platform || 'none';
    const genAiKey = settingsMap.api_genai_key || '';
    const useAI = genAiPlatform !== 'none' && genAiKey.length > 0;

    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select('symbol')
      .order('symbol');

    if (stocksError) throw stocksError;

    const uniqueSymbols = [...new Set((stocks || []).map(s => s.symbol))];
    const results = [];
    const alertsToCreate = [];

    for (const symbol of uniqueSymbols) {
      const newsItems = await fetchGoogleNewsRSS(symbol);

      for (const newsItem of newsItems) {
        let sentiment;
        
        if (useAI) {
          const aiSentiment = await analyzeSentimentWithAI(newsItem.title, genAiPlatform, genAiKey);
          sentiment = aiSentiment || analyzeSentiment(newsItem.title);
        } else {
          sentiment = analyzeSentiment(newsItem.title);
        }

        const { error: insertError } = await supabase
          .from('news')
          .upsert({
            symbol,
            title: newsItem.title,
            source: newsItem.source,
            url: newsItem.url,
            published_at: newsItem.publishedAt,
            sentiment_score: sentiment.score,
            sentiment_label: sentiment.label,
          }, {
            onConflict: 'symbol,url',
            ignoreDuplicates: true,
          });

        if (insertError && insertError.code !== '23505') {
          console.error(`Error inserting news for ${symbol}:`, insertError);
        }

        if (sentiment.label === 'negative' && sentiment.score < -0.4) {
          alertsToCreate.push({
            symbol,
            alert_type: 'negative_sentiment',
            message: `Negative news detected for ${symbol}: "${newsItem.title}"`,
            trigger_value: `Sentiment: ${sentiment.score}`,
          });
        }
      }

      results.push({
        symbol,
        newsCount: newsItems.length,
      });
    }

    if (alertsToCreate.length > 0) {
      const { error: alertError } = await supabase
        .from('alerts')
        .insert(alertsToCreate);

      if (alertError) {
        console.error('Error creating alerts:', alertError);
      } else {
        for (const alert of alertsToCreate) {
          await supabase.functions.invoke('send-alert', {
            body: { alert },
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        alertsCreated: alertsToCreate.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in news-monitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
