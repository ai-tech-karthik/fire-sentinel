import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { priceAlertsApi } from '@/services/api';
import { Bell, BellOff, Plus, Edit, Trash2, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { PriceAlert, PriceAlertFormData } from '@/types/types';

interface PriceAlertsManagerProps {
  stockId?: string;
  symbol: string;
  currentPrice?: number;
}

export function PriceAlertsManager({ stockId, symbol, currentPrice }: PriceAlertsManagerProps) {
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);
  const [alertForm, setAlertForm] = useState<PriceAlertFormData>({
    stock_id: stockId,
    symbol,
    target_price: 0,
    direction: 'above',
    note: '',
  });

  const loadPriceAlerts = async () => {
    try {
      const data = await priceAlertsApi.getBySymbol(symbol);
      setPriceAlerts(data);
    } catch (error) {
      console.error('Error loading price alerts:', error);
      toast.error('Failed to load price alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriceAlerts();
  }, [symbol]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAlert) {
        await priceAlertsApi.update(editingAlert.id, alertForm);
        toast.success('Price alert updated successfully');
      } else {
        await priceAlertsApi.create(alertForm);
        toast.success('Price alert created successfully');
      }
      setDialogOpen(false);
      setEditingAlert(null);
      setAlertForm({
        stock_id: stockId,
        symbol,
        target_price: 0,
        direction: 'above',
        note: '',
      });
      await loadPriceAlerts();
    } catch (error) {
      console.error('Error saving price alert:', error);
      toast.error('Failed to save price alert');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await priceAlertsApi.delete(id);
      toast.success('Price alert deleted successfully');
      await loadPriceAlerts();
    } catch (error) {
      console.error('Error deleting price alert:', error);
      toast.error('Failed to delete price alert');
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      await priceAlertsApi.toggleEnabled(id, enabled);
      toast.success(`Price alert ${enabled ? 'enabled' : 'disabled'}`);
      await loadPriceAlerts();
    } catch (error) {
      console.error('Error toggling price alert:', error);
      toast.error('Failed to update price alert');
    }
  };

  const handleResetTriggered = async (id: string) => {
    try {
      await priceAlertsApi.resetTriggered(id);
      toast.success('Price alert re-enabled');
      await loadPriceAlerts();
    } catch (error) {
      console.error('Error resetting price alert:', error);
      toast.error('Failed to reset price alert');
    }
  };

  const openEditDialog = (alert: PriceAlert) => {
    setEditingAlert(alert);
    setAlertForm({
      stock_id: alert.stock_id,
      symbol: alert.symbol,
      target_price: alert.target_price,
      direction: alert.direction,
      note: alert.note || '',
    });
    setDialogOpen(true);
  };

  const activeAlerts = priceAlerts.filter(a => a.enabled && !a.triggered_at);
  const triggeredAlerts = priceAlerts.filter(a => a.triggered_at);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Price Alerts ({activeAlerts.length} active)
          </span>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingAlert(null);
                setAlertForm({
                  stock_id: stockId,
                  symbol,
                  target_price: currentPrice || 0,
                  direction: 'above',
                  note: '',
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAlert ? 'Edit Price Alert' : 'Add Price Alert'} - {symbol}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-price">Target Price</Label>
                <Input
                  id="target-price"
                  type="number"
                  step="0.01"
                  value={alertForm.target_price}
                  onChange={(e) => setAlertForm({ ...alertForm, target_price: parseFloat(e.target.value) || 0 })}
                  required
                />
                {currentPrice && (
                  <p className="text-xs text-muted-foreground">
                    Current price: ${currentPrice.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="direction">Alert When Price</Label>
                <Select
                  value={alertForm.direction}
                  onValueChange={(value: 'above' | 'below') => setAlertForm({ ...alertForm, direction: value })}
                >
                  <SelectTrigger id="direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Reaches or exceeds target (↑)</SelectItem>
                    <SelectItem value="below">Falls to or below target (↓)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  id="note"
                  value={alertForm.note}
                  onChange={(e) => setAlertForm({ ...alertForm, note: e.target.value })}
                  placeholder="Add a note about this alert"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAlert ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {priceAlerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No price alerts set</p>
      ) : (
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between gap-2 rounded-md border border-border p-3"
            >
              <div className="flex flex-1 items-start gap-3">
                <div className="mt-1">
                  {alert.direction === 'above' ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      ${alert.target_price.toFixed(2)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {alert.direction === 'above' ? 'Above' : 'Below'}
                    </Badge>
                  </div>
                  {alert.note && (
                    <p className="text-sm text-muted-foreground">{alert.note}</p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleEnabled(alert.id, !alert.enabled)}
                  title={alert.enabled ? 'Disable alert' : 'Enable alert'}
                >
                  {alert.enabled ? (
                    <Bell className="h-4 w-4" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(alert)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Price Alert</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this price alert?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(alert.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}

          {triggeredAlerts.length > 0 && (
            <>
              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground">Triggered Alerts</p>
              </div>
              {triggeredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-border bg-muted/30 p-3"
                >
                  <div className="flex flex-1 items-start gap-3">
                    <div className="mt-1">
                      {alert.direction === 'above' ? (
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground">
                          ${alert.target_price.toFixed(2)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Triggered
                        </Badge>
                      </div>
                      {alert.note && (
                        <p className="text-sm text-muted-foreground">{alert.note}</p>
                      )}
                      {alert.triggered_at && (
                        <p className="text-xs text-muted-foreground">
                          Triggered: {new Date(alert.triggered_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleResetTriggered(alert.id)}
                      title="Re-enable alert"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Price Alert</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this triggered price alert?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(alert.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
