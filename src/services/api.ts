import { supabase } from '@/db/supabase';
import type {
  Account,
  Stock,
  Alert,
  News,
  Settings,
  PriceAlert,
  StockFormData,
  AccountFormData,
  SettingsFormData,
  PriceAlertFormData,
} from '@/types/types';

// Account operations
export const accountsApi = {
  async getAll(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(account: AccountFormData): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create account');
    return data;
  },

  async update(id: string, account: Partial<AccountFormData>): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update(account)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to update account');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Stock operations
export const stocksApi = {
  async getAll(): Promise<Stock[]> {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByAccount(accountId: string): Promise<Stock[]> {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(stock: StockFormData): Promise<Stock> {
    const { data, error } = await supabase
      .from('stocks')
      .insert(stock)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create stock');
    return data;
  },

  async update(id: string, stock: Partial<StockFormData>): Promise<Stock> {
    const { data, error } = await supabase
      .from('stocks')
      .update(stock)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to update stock');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('stocks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updatePrice(id: string, price: number): Promise<void> {
    const { error } = await supabase
      .from('stocks')
      .update({ 
        current_price: price,
        last_price_update: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Alert operations
export const alertsApi = {
  async getAll(limit?: number): Promise<Alert[]> {
    let query = supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getBySymbol(symbol: string): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    const { data, error } = await supabase
      .from('alerts')
      .insert(alert)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create alert');
    return data;
  },
};

// News operations
export const newsApi = {
  async getAll(limit?: number): Promise<News[]> {
    let query = supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getBySymbol(symbol: string, limit?: number): Promise<News[]> {
    let query = supabase
      .from('news')
      .select('*')
      .eq('symbol', symbol)
      .order('published_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(news: Omit<News, 'id' | 'created_at'>): Promise<News> {
    const { data, error } = await supabase
      .from('news')
      .insert(news)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create news');
    return data;
  },
};

// Settings operations
export const settingsApi = {
  async getAll(): Promise<Settings[]> {
    const { data, error } = await supabase
      .from('settings')
      .select('*');
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async get(key: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    
    if (error) throw error;
    return data?.value || null;
  },

  async set(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .update({ value })
      .eq('key', key);
    
    if (error) throw error;
  },

  async updateMultiple(settings: Record<string, string>): Promise<void> {
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
    }));

    for (const update of updates) {
      await this.set(update.key, update.value);
    }
  },

  async getFormData(): Promise<SettingsFormData> {
    const settings = await this.getAll();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      price_check_frequency: Number(settingsMap.price_check_frequency) || 300,
      news_check_frequency: Number(settingsMap.news_check_frequency) || 600,
      default_profit_target: Number(settingsMap.default_profit_target) || 20,
      default_stop_loss: Number(settingsMap.default_stop_loss) || 10,
      alert_email_enabled: settingsMap.alert_email_enabled === 'true',
      alert_email_address: settingsMap.alert_email_address || '',
      alert_slack_enabled: settingsMap.alert_slack_enabled === 'true',
      alert_slack_webhook: settingsMap.alert_slack_webhook || '',
      alert_sms_enabled: settingsMap.alert_sms_enabled === 'true',
      alert_sms_phone: settingsMap.alert_sms_phone || '',
      api_alpha_vantage_key: settingsMap.api_alpha_vantage_key || '',
      api_yahoo_finance_key: settingsMap.api_yahoo_finance_key || '',
      api_genai_platform: settingsMap.api_genai_platform || 'openai',
      api_genai_key: settingsMap.api_genai_key || '',
    };
  },
};

// Price Alerts operations
export const priceAlertsApi = {
  async getAll(): Promise<PriceAlert[]> {
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByStock(stockId: string): Promise<PriceAlert[]> {
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('stock_id', stockId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getBySymbol(symbol: string): Promise<PriceAlert[]> {
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getEnabled(): Promise<PriceAlert[]> {
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('enabled', true)
      .is('triggered_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(priceAlert: PriceAlertFormData): Promise<PriceAlert> {
    const { data, error } = await supabase
      .from('price_alerts')
      .insert(priceAlert)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create price alert');
    return data;
  },

  async update(id: string, priceAlert: Partial<PriceAlertFormData>): Promise<PriceAlert> {
    const { data, error } = await supabase
      .from('price_alerts')
      .update(priceAlert)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to update price alert');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleEnabled(id: string, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('price_alerts')
      .update({ enabled })
      .eq('id', id);
    
    if (error) throw error;
  },

  async markTriggered(id: string): Promise<void> {
    const { error } = await supabase
      .from('price_alerts')
      .update({ 
        enabled: false,
        triggered_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  async resetTriggered(id: string): Promise<void> {
    const { error } = await supabase
      .from('price_alerts')
      .update({ 
        enabled: true,
        triggered_at: null
      })
      .eq('id', id);
    
    if (error) throw error;
  },
};
