export interface Account {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Stock {
  id: string;
  account_id: string;
  symbol: string;
  quantity: number;
  bought_price: number;
  current_price?: number;
  target_profit_percentage: number;
  stop_loss_percentage: number;
  last_price_update?: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  stock_id?: string;
  symbol: string;
  alert_type: 'profit_target' | 'stop_loss' | 'negative_sentiment' | 'custom_price';
  message: string;
  trigger_price?: number;
  trigger_value?: string;
  created_at: string;
}

export interface PriceAlert {
  id: string;
  stock_id?: string;
  symbol: string;
  target_price: number;
  direction: 'above' | 'below';
  enabled: boolean;
  note?: string;
  triggered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PriceAlertFormData {
  stock_id?: string;
  symbol: string;
  target_price: number;
  direction: 'above' | 'below';
  note?: string;
}

export interface News {
  id: string;
  symbol: string;
  title: string;
  source?: string;
  url?: string;
  published_at?: string;
  sentiment_score?: number;
  sentiment_label?: 'positive' | 'neutral' | 'negative';
  created_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  price_check_frequency: number;
  news_check_frequency: number;
  email_enabled: boolean;
  email_address: string;
  slack_enabled: boolean;
  slack_webhook_url: string;
  sms_enabled: boolean;
  sms_phone_number: string;
  alpha_vantage_api_key: string;
  gen_ai_platform: 'openai' | 'anthropic' | 'google';
  gen_ai_api_key: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
}

export interface AccountSummary extends Account {
  stocks: StockWithCalculations[];
  totalValue: number;
  totalCost: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface StockWithCalculations extends Stock {
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  priceChange: number;
  priceChangePercentage: number;
}

export interface StockFormData {
  account_id: string;
  symbol: string;
  quantity: number;
  bought_price: number;
  target_profit_percentage: number;
  stop_loss_percentage: number;
}

export interface AccountFormData {
  name: string;
  description?: string;
}

export interface SettingsFormData {
  price_check_frequency: number;
  news_check_frequency: number;
  default_profit_target: number;
  default_stop_loss: number;
  alert_email_enabled: boolean;
  alert_email_address: string;
  alert_slack_enabled: boolean;
  alert_slack_webhook: string;
  alert_sms_enabled: boolean;
  alert_sms_phone: string;
  api_alpha_vantage_key: string;
  api_yahoo_finance_key: string;
  api_genai_platform: string;
  api_genai_key: string;
}

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment?: {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
  };
}
