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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get auth token
const getAuthToken = () => localStorage.getItem('auth_token');

// Generic fetch wrapper
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// Account operations
export const accountsApi = {
  async getAll(): Promise<Account[]> {
    const data = await apiFetch('/accounts');
    return Array.isArray(data) ? data : [];
  },

  async create(account: AccountFormData): Promise<Account> {
    return apiFetch('/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
  },

  async update(id: string, account: Partial<AccountFormData>): Promise<Account> {
    return apiFetch(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(account),
    });
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`/accounts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Stock operations
export const stocksApi = {
  async getAll(): Promise<Stock[]> {
    const data = await apiFetch('/stocks');
    return Array.isArray(data) ? data : [];
  },

  async getByAccount(accountId: string): Promise<Stock[]> {
    const data = await apiFetch(`/stocks/account/${accountId}`);
    return Array.isArray(data) ? data : [];
  },

  async create(stock: StockFormData): Promise<Stock> {
    return apiFetch('/stocks', {
      method: 'POST',
      body: JSON.stringify(stock),
    });
  },

  async update(id: string, stock: Partial<StockFormData>): Promise<Stock> {
    return apiFetch(`/stocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stock),
    });
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`/stocks/${id}`, {
      method: 'DELETE',
    });
  },

  async updatePrice(id: string, price: number): Promise<void> {
    await apiFetch(`/stocks/${id}/price`, {
      method: 'PATCH',
      body: JSON.stringify({ current_price: price }),
    });
  },
};

// Alert operations
export const alertsApi = {
  async getAll(limit?: number): Promise<Alert[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const data = await apiFetch(`/alerts?${params.toString()}`);
    return data.alerts || [];
  },

  async getRecent(limit: number = 10): Promise<Alert[]> {
    const data = await apiFetch(`/alerts/recent?limit=${limit}`);
    return Array.isArray(data) ? data : [];
  },

  async getBySymbol(symbol: string, limit?: number): Promise<Alert[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const data = await apiFetch(`/alerts/symbol/${symbol}?${params.toString()}`);
    return Array.isArray(data) ? data : [];
  },

  async getByStock(stockId: string, limit?: number): Promise<Alert[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const data = await apiFetch(`/alerts/stock/${stockId}?${params.toString()}`);
    return Array.isArray(data) ? data : [];
  },

  async getFiltered(filters: {
    symbol?: string;
    alert_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ alerts: Alert[]; total: number }> {
    const params = new URLSearchParams();
    if (filters.symbol) params.append('symbol', filters.symbol);
    if (filters.alert_type) params.append('alert_type', filters.alert_type);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    
    return apiFetch(`/alerts?${params.toString()}`);
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`/alerts/${id}`, {
      method: 'DELETE',
    });
  },
};

// News operations
export const newsApi = {
  async getAll(limit?: number): Promise<News[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const data = await apiFetch(`/news?${params.toString()}`);
    return data.news || [];
  },

  async getRecent(limit: number = 10): Promise<News[]> {
    const data = await apiFetch(`/news/recent?limit=${limit}`);
    return Array.isArray(data) ? data : [];
  },

  async getBySymbol(symbol: string, limit?: number): Promise<News[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const data = await apiFetch(`/news/symbol/${symbol}?${params.toString()}`);
    return Array.isArray(data) ? data : [];
  },

  async getFiltered(filters: {
    symbol?: string;
    sentiment_label?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ news: News[]; total: number }> {
    const params = new URLSearchParams();
    if (filters.symbol) params.append('symbol', filters.symbol);
    if (filters.sentiment_label) params.append('sentiment_label', filters.sentiment_label);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    
    return apiFetch(`/news?${params.toString()}`);
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`/news/${id}`, {
      method: 'DELETE',
    });
  },
};

// Settings operations
export const settingsApi = {
  async get(): Promise<Settings> {
    return apiFetch('/settings');
  },

  async update(settings: Partial<Settings>): Promise<Settings> {
    return apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// Price Alert operations
export const priceAlertsApi = {
  async getAll(): Promise<PriceAlert[]> {
    const data = await apiFetch('/price-alerts');
    return Array.isArray(data) ? data : [];
  },

  async getByStock(stockId: string): Promise<PriceAlert[]> {
    const data = await apiFetch(`/price-alerts/stock/${stockId}`);
    return Array.isArray(data) ? data : [];
  },

  async getBySymbol(symbol: string): Promise<PriceAlert[]> {
    const data = await apiFetch(`/price-alerts/symbol/${symbol}`);
    return Array.isArray(data) ? data : [];
  },

  async create(priceAlert: PriceAlertFormData): Promise<PriceAlert> {
    return apiFetch('/price-alerts', {
      method: 'POST',
      body: JSON.stringify(priceAlert),
    });
  },

  async update(id: string, priceAlert: Partial<PriceAlertFormData>): Promise<PriceAlert> {
    return apiFetch(`/price-alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(priceAlert),
    });
  },

  async toggle(id: string, enabled: boolean): Promise<PriceAlert> {
    return apiFetch(`/price-alerts/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    });
  },

  async reset(id: string): Promise<PriceAlert> {
    return apiFetch(`/price-alerts/${id}/reset`, {
      method: 'PATCH',
    });
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`/price-alerts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Auth operations
export const authApi = {
  async login(email: string, password: string) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  async register(email: string, password: string, name?: string) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  async getCurrentUser() {
    return apiFetch('/auth/me');
  },

  logout() {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
};
