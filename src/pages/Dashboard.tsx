import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { accountsApi, stocksApi, alertsApi, newsApi } from '@/services/api';
import { PriceChangeIndicator, SentimentBadge } from '@/components/common/Indicators';
import { RefreshCw, TrendingUp, DollarSign, Percent, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type { Account, Stock, Alert as AlertType, News, AccountSummary, StockWithCalculations, PortfolioSummary } from '@/types/types';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [accountSummaries, setAccountSummaries] = useState<AccountSummary[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<AlertType[]>([]);
  const [recentNews, setRecentNews] = useState<News[]>([]);

  const calculateStockMetrics = (stock: Stock): StockWithCalculations => {
    const currentPrice = stock.current_price || stock.bought_price;
    const currentValue = stock.quantity * currentPrice;
    const costBasis = stock.quantity * stock.bought_price;
    const profitLoss = currentValue - costBasis;
    const profitLossPercentage = (profitLoss / costBasis) * 100;
    const priceChange = currentPrice - stock.bought_price;
    const priceChangePercentage = (priceChange / stock.bought_price) * 100;

    return {
      ...stock,
      currentValue,
      profitLoss,
      profitLossPercentage,
      priceChange,
      priceChangePercentage,
    };
  };

  const loadData = async () => {
    try {
      const [accounts, stocks, alerts, news] = await Promise.all([
        accountsApi.getAll(),
        stocksApi.getAll(),
        alertsApi.getAll(10),
        newsApi.getAll(10),
      ]);

      const accountSummariesData: AccountSummary[] = accounts.map((account) => {
        const accountStocks = stocks
          .filter((s) => s.account_id === account.id)
          .map(calculateStockMetrics);

        const totalValue = accountStocks.reduce((sum, s) => sum + s.currentValue, 0);
        const totalCost = accountStocks.reduce((sum, s) => sum + (s.quantity * s.bought_price), 0);
        const profitLoss = totalValue - totalCost;
        const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

        return {
          ...account,
          stocks: accountStocks,
          totalValue,
          totalCost,
          profitLoss,
          profitLossPercentage,
        };
      });

      const totalValue = accountSummariesData.reduce((sum, a) => sum + a.totalValue, 0);
      const totalCost = accountSummariesData.reduce((sum, a) => sum + a.totalCost, 0);
      const totalProfitLoss = totalValue - totalCost;
      const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

      setPortfolioSummary({
        totalValue,
        totalCost,
        totalProfitLoss,
        totalProfitLossPercentage,
      });

      setAccountSummaries(accountSummariesData);
      setRecentAlerts(alerts);
      setRecentNews(news);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    try {
      // Trigger price monitor job via backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/jobs/price-monitor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to trigger price monitor');
      
      toast.success('Prices updated successfully');
      await loadData();
    } catch (error) {
      console.error('Error refreshing prices:', error);
      toast.error('Failed to refresh prices');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 bg-muted" />
          <Skeleton className="h-64 bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your portfolio performance and recent activity
          </p>
        </div>
        <Button onClick={handleRefreshPrices} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Prices
        </Button>
      </div>

      {portfolioSummary && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Overall Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Total Value</span>
                </div>
                <p className="text-2xl font-semibold">
                  ${portfolioSummary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Total Cost</span>
                </div>
                <p className="text-2xl font-semibold">
                  ${portfolioSummary.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Profit/Loss</span>
                </div>
                <p className={`text-2xl font-semibold ${portfolioSummary.totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {portfolioSummary.totalProfitLoss >= 0 ? '+' : ''}${portfolioSummary.totalProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Percent className="h-4 w-4" />
                  <span>Return</span>
                </div>
                <p className={`text-2xl font-semibold ${portfolioSummary.totalProfitLossPercentage >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {portfolioSummary.totalProfitLossPercentage >= 0 ? '+' : ''}{portfolioSummary.totalProfitLossPercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {accountSummaries.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No accounts found. <Link to="/portfolio" className="font-medium underline">Add your first account</Link> to start tracking your portfolio.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Accounts</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {accountSummaries.map((account) => (
              <Card key={account.id} className="h-full border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-medium">{account.name}</CardTitle>
                  {account.description && (
                    <p className="text-sm text-muted-foreground">{account.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Value</p>
                      <p className="text-lg font-semibold">
                        ${account.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">P/L</p>
                      <PriceChangeIndicator
                        value={account.profitLoss}
                        percentage={account.profitLossPercentage}
                        showIcon={false}
                      />
                    </div>
                  </div>
                  {account.stocks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Holdings</p>
                      <div className="space-y-2">
                        {account.stocks.slice(0, 3).map((stock) => (
                          <div key={stock.id} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{stock.symbol}</span>
                            <PriceChangeIndicator
                              value={stock.profitLoss}
                              percentage={stock.profitLossPercentage}
                              showIcon={false}
                            />
                          </div>
                        ))}
                        {account.stocks.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{account.stocks.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-full border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Recent Alerts</CardTitle>
            <Link to="/alerts">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No alerts yet</p>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="space-y-1 border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium">{alert.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-full border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Recent News</CardTitle>
            <Link to="/news">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentNews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No news yet</p>
            ) : (
              <div className="space-y-3">
                {recentNews.map((news) => (
                  <div key={news.id} className="space-y-1 border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium">{news.symbol}</span>
                      {news.sentiment_label && (
                        <SentimentBadge sentiment={news.sentiment_label} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{news.title}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
