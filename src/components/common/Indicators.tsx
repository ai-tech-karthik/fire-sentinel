import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SentimentBadgeProps {
  sentiment: 'positive' | 'neutral' | 'negative';
  score?: number;
}

export function SentimentBadge({ sentiment, score }: SentimentBadgeProps) {
  const variants = {
    positive: 'bg-success/10 text-success hover:bg-success/20',
    neutral: 'bg-muted text-muted-foreground hover:bg-muted',
    negative: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  };

  return (
    <Badge variant="secondary" className={variants[sentiment]}>
      {sentiment}
      {score !== undefined && ` (${score.toFixed(2)})`}
    </Badge>
  );
}

interface PriceChangeIndicatorProps {
  value: number;
  percentage: number;
  showIcon?: boolean;
}

export function PriceChangeIndicator({ value, percentage, showIcon = true }: PriceChangeIndicatorProps) {
  const isPositive = value >= 0;
  const colorClass = isPositive ? 'text-success' : 'text-destructive';

  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      {showIcon && (
        isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
      )}
      <span className="font-medium">
        {isPositive ? '+' : ''}{value.toFixed(2)}
      </span>
      <span className="text-sm">
        ({isPositive ? '+' : ''}{percentage.toFixed(2)}%)
      </span>
    </div>
  );
}
