import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { newsApi, stocksApi } from '@/services/api';
import { SentimentBadge } from '@/components/common/Indicators';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import type { News } from '@/types/types';

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [symbolFilter, setSymbolFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [symbols, setSymbols] = useState<string[]>([]);

  const loadNews = async () => {
    try {
      const [newsData, stocksData] = await Promise.all([
        newsApi.getAll(),
        stocksApi.getAll(),
      ]);
      setNews(newsData);
      setFilteredNews(newsData);
      const uniqueSymbols = [...new Set(stocksData.map(s => s.symbol))].sort();
      setSymbols(uniqueSymbols);
    } catch (error) {
      console.error('Error loading news:', error);
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshNews = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('news-monitor');
      if (error) throw error;
      
      toast.success('News updated successfully');
      await loadNews();
    } catch (error) {
      console.error('Error refreshing news:', error);
      toast.error('Failed to refresh news');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    let filtered = [...news];

    if (symbolFilter !== 'all') {
      filtered = filtered.filter(item => item.symbol === symbolFilter);
    }

    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(item => item.sentiment_label === sentimentFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNews(filtered);
  }, [news, symbolFilter, sentimentFilter, searchQuery]);

  const groupedNews = filteredNews.reduce((acc, item) => {
    if (!acc[item.symbol]) {
      acc[item.symbol] = [];
    }
    acc[item.symbol].push(item);
    return acc;
  }, {} as Record<string, News[]>);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">News Feed</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest news and sentiment analysis for your portfolio
          </p>
        </div>
        <Button onClick={handleRefreshNews} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh News
        </Button>
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
                placeholder="Search news..."
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
                  {symbols.map(symbol => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sentiment-filter">Sentiment</Label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger id="sentiment-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.keys(groupedNews).length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">
              {news.length === 0 ? 'No news articles yet' : 'No news matches your filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNews).map(([symbol, articles]) => (
            <Card key={symbol} className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{symbol}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="flex flex-col gap-3 rounded-md border border-border p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="flex-1 text-base font-medium">{article.title}</h3>
                        {article.sentiment_label && (
                          <SentimentBadge
                            sentiment={article.sentiment_label}
                            score={article.sentiment_score}
                          />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {article.source && <span>{article.source}</span>}
                        {article.published_at && (
                          <span>
                            {new Date(article.published_at).toLocaleDateString()}
                          </span>
                        )}
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            Read more
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
