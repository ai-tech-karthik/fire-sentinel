import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { alertsApi } from '@/services/api';
import { AlertCircle, TrendingUp, TrendingDown, Newspaper, Bell } from 'lucide-react';
import { toast } from 'sonner';
import type { Alert } from '@/types/types';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbolFilter, setSymbolFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAlerts = async () => {
    try {
      const data = await alertsApi.getAll();
      setAlerts(data);
      setFilteredAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    let filtered = [...alerts];

    if (symbolFilter !== 'all') {
      filtered = filtered.filter(alert => alert.symbol === symbolFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.alert_type === typeFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(alert =>
        alert.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  }, [alerts, symbolFilter, typeFilter, searchQuery]);

  const uniqueSymbols = [...new Set(alerts.map(a => a.symbol))].sort();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'profit_target':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'stop_loss':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'negative_sentiment':
        return <Newspaper className="h-4 w-4 text-orange-500" />;
      case 'custom_price':
        return <Bell className="h-4 w-4 text-primary" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAlertBadgeClass = (type: string) => {
    switch (type) {
      case 'profit_target':
        return 'bg-success/10 text-success hover:bg-success/20';
      case 'stop_loss':
        return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      case 'negative_sentiment':
        return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      case 'custom_price':
        return 'bg-primary/10 text-primary hover:bg-primary/20';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Alerts History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and filter all portfolio alerts
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol-filter">Symbol</Label>
              <Select value={symbolFilter} onValueChange={setSymbolFilter}>
                <SelectTrigger id="symbol-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Symbols</SelectItem>
                  {uniqueSymbols.map(symbol => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-filter">Alert Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="profit_target">Profit Target</SelectItem>
                  <SelectItem value="stop_loss">Stop Loss</SelectItem>
                  <SelectItem value="negative_sentiment">Negative Sentiment</SelectItem>
                  <SelectItem value="custom_price">Custom Price Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Alerts ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {alerts.length === 0 ? 'No alerts yet' : 'No alerts match your filters'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col gap-3 rounded-md border border-border p-4 md:flex-row md:items-start md:justify-between"
                >
                  <div className="flex flex-1 gap-3">
                    <div className="mt-1 shrink-0">
                      {getAlertIcon(alert.alert_type)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{alert.symbol}</span>
                        <Badge variant="secondary" className={getAlertBadgeClass(alert.alert_type)}>
                          {alert.alert_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      {alert.trigger_price && (
                        <p className="text-xs text-muted-foreground">
                          Trigger Price: ${alert.trigger_price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
