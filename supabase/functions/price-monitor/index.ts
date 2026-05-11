import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

async function fetchAlphaVantagePrice(symbol: string, apiKey: string): Promise<StockPrice | null> {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      const quote = data['Global Quote'];
      return {
        symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      };
    }
    return null;
  } catch (error) {
    console.error(`Alpha Vantage error for ${symbol}:`, error);
    return null;
  }
}

async function fetchYahooFinancePrice(symbol: string): Promise<StockPrice | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.chart?.result?.[0]?.meta) {
      const meta = data.chart.result[0].meta;
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        symbol,
        price: currentPrice,
        change,
        changePercent,
      };
    }
    return null;
  } catch (error) {
    console.error(`Yahoo Finance error for ${symbol}:`, error);
    return null;
  }
}

async function fetchStockPrice(symbol: string, alphaVantageKey?: string): Promise<StockPrice | null> {
  if (alphaVantageKey) {
    const alphaPrice = await fetchAlphaVantagePrice(symbol, alphaVantageKey);
    if (alphaPrice) return alphaPrice;
  }

  const yahooPrice = await fetchYahooFinancePrice(symbol);
  return yahooPrice;
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

    const alphaVantageKey = settingsMap.api_alpha_vantage_key || Deno.env.get('ALPHA_VANTAGE_API_KEY');

    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select('*');

    if (stocksError) throw stocksError;

    const { data: priceAlerts, error: priceAlertsError } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('enabled', true)
      .is('triggered_at', null);

    if (priceAlertsError) throw priceAlertsError;

    const results = [];
    const alertsToCreate = [];
    const priceAlertsToDisable = [];

    for (const stock of stocks || []) {
      const priceData = await fetchStockPrice(stock.symbol, alphaVantageKey);

      if (priceData) {
        const { error: updateError } = await supabase
          .from('stocks')
          .update({
            current_price: priceData.price,
            last_price_update: new Date().toISOString(),
          })
          .eq('id', stock.id);

        if (updateError) {
          console.error(`Error updating stock ${stock.symbol}:`, updateError);
          continue;
        }

        const profitLossPercent = ((priceData.price - stock.bought_price) / stock.bought_price) * 100;

        if (profitLossPercent >= stock.target_profit_percentage) {
          alertsToCreate.push({
            stock_id: stock.id,
            symbol: stock.symbol,
            alert_type: 'profit_target',
            message: `${stock.symbol} has reached your profit target of ${stock.target_profit_percentage}%. Current profit: ${profitLossPercent.toFixed(2)}%`,
            trigger_price: priceData.price,
            trigger_value: `${profitLossPercent.toFixed(2)}%`,
          });
        } else if (profitLossPercent <= -stock.stop_loss_percentage) {
          alertsToCreate.push({
            stock_id: stock.id,
            symbol: stock.symbol,
            alert_type: 'stop_loss',
            message: `${stock.symbol} has hit your stop loss of ${stock.stop_loss_percentage}%. Current loss: ${Math.abs(profitLossPercent).toFixed(2)}%`,
            trigger_price: priceData.price,
            trigger_value: `${profitLossPercent.toFixed(2)}%`,
          });
        }

        results.push({
          symbol: stock.symbol,
          price: priceData.price,
          updated: true,
        });

        const stockPriceAlerts = (priceAlerts || []).filter(
          pa => pa.symbol === stock.symbol || pa.stock_id === stock.id
        );

        for (const priceAlert of stockPriceAlerts) {
          let triggered = false;

          if (priceAlert.direction === 'above' && priceData.price >= priceAlert.target_price) {
            triggered = true;
          } else if (priceAlert.direction === 'below' && priceData.price <= priceAlert.target_price) {
            triggered = true;
          }

          if (triggered) {
            alertsToCreate.push({
              stock_id: stock.id,
              symbol: stock.symbol,
              alert_type: 'custom_price',
              message: `${stock.symbol} has ${priceAlert.direction === 'above' ? 'reached or exceeded' : 'fallen to or below'} your target price of $${priceAlert.target_price.toFixed(2)}. Current price: $${priceData.price.toFixed(2)}${priceAlert.note ? `. Note: ${priceAlert.note}` : ''}`,
              trigger_price: priceData.price,
              trigger_value: `Target: $${priceAlert.target_price.toFixed(2)} (${priceAlert.direction})`,
            });

            priceAlertsToDisable.push(priceAlert.id);
          }
        }
      } else {
        results.push({
          symbol: stock.symbol,
          error: 'Failed to fetch price',
        });
      }
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

    if (priceAlertsToDisable.length > 0) {
      const { error: disableError } = await supabase
        .from('price_alerts')
        .update({ 
          enabled: false,
          triggered_at: new Date().toISOString()
        })
        .in('id', priceAlertsToDisable);

      if (disableError) {
        console.error('Error disabling price alerts:', disableError);
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
    console.error('Error in price-monitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
