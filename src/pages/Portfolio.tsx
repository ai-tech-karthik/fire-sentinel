import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { accountsApi, stocksApi } from '@/services/api';
import { PriceAlertsManager } from '@/components/common/PriceAlertsManager';
import { Plus, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Account, Stock, AccountFormData, StockFormData } from '@/types/types';

export default function Portfolio() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [expandedStocks, setExpandedStocks] = useState<Set<string>>(new Set());

  const [accountForm, setAccountForm] = useState<AccountFormData>({
    name: '',
    description: '',
  });

  const [stockForm, setStockForm] = useState<StockFormData>({
    account_id: '',
    symbol: '',
    quantity: 0,
    bought_price: 0,
    target_profit_percentage: 20,
    stop_loss_percentage: 10,
  });

  const loadData = async () => {
    try {
      const [accountsData, stocksData] = await Promise.all([
        accountsApi.getAll(),
        stocksApi.getAll(),
      ]);
      setAccounts(accountsData);
      setStocks(stocksData);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await accountsApi.update(editingAccount.id, accountForm);
        toast.success('Account updated successfully');
      } else {
        await accountsApi.create(accountForm);
        toast.success('Account created successfully');
      }
      setAccountDialogOpen(false);
      setEditingAccount(null);
      setAccountForm({ name: '', description: '' });
      await loadData();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Failed to save account');
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStock) {
        await stocksApi.update(editingStock.id, stockForm);
        toast.success('Stock updated successfully');
      } else {
        await stocksApi.create(stockForm);
        toast.success('Stock added successfully');
      }
      setStockDialogOpen(false);
      setEditingStock(null);
      setStockForm({
        account_id: '',
        symbol: '',
        quantity: 0,
        bought_price: 0,
        target_profit_percentage: 20,
        stop_loss_percentage: 10,
      });
      await loadData();
    } catch (error) {
      console.error('Error saving stock:', error);
      toast.error('Failed to save stock');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await accountsApi.delete(id);
      toast.success('Account deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const handleDeleteStock = async (id: string) => {
    try {
      await stocksApi.delete(id);
      toast.success('Stock removed successfully');
      await loadData();
    } catch (error) {
      console.error('Error deleting stock:', error);
      toast.error('Failed to remove stock');
    }
  };

  const handleExportCSV = () => {
    const csvData = stocks.map(stock => {
      const account = accounts.find(a => a.id === stock.account_id);
      return {
        Account: account?.name || '',
        Symbol: stock.symbol,
        Quantity: stock.quantity,
        'Bought Price': stock.bought_price,
        'Current Price': stock.current_price || '',
        'Target Profit %': stock.target_profit_percentage,
        'Stop Loss %': stock.stop_loss_percentage,
      };
    });

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => row[h as keyof typeof row]).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Portfolio exported successfully');
  };

  const openEditAccount = (account: Account) => {
    setEditingAccount(account);
    setAccountForm({
      name: account.name,
      description: account.description || '',
    });
    setAccountDialogOpen(true);
  };

  const openEditStock = (stock: Stock) => {
    setEditingStock(stock);
    setStockForm({
      account_id: stock.account_id,
      symbol: stock.symbol,
      quantity: stock.quantity,
      bought_price: stock.bought_price,
      target_profit_percentage: stock.target_profit_percentage,
      stop_loss_percentage: stock.stop_loss_percentage,
    });
    setStockDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Portfolio Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your accounts and stock holdings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Accounts</CardTitle>
          <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
                setEditingAccount(null);
                setAccountForm({ name: '', description: '' });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingAccount ? 'Edit Account' : 'Add Account'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    placeholder="e.g., Fidelity Brokerage"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-description">Description (Optional)</Label>
                  <Textarea
                    id="account-description"
                    value={accountForm.description}
                    onChange={(e) => setAccountForm({ ...accountForm, description: e.target.value })}
                    placeholder="Add notes about this account"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setAccountDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAccount ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accounts yet. Add your first account to get started.</p>
          ) : (
            <div className="space-y-2">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between rounded-md border border-border p-4">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    {account.description && (
                      <p className="text-sm text-muted-foreground">{account.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditAccount(account)}>
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
                          <AlertDialogTitle>Delete Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this account? All stocks in this account will also be deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAccount(account.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Stocks</CardTitle>
          <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
                setEditingStock(null);
                setStockForm({
                  account_id: accounts[0]?.id || '',
                  symbol: '',
                  quantity: 0,
                  bought_price: 0,
                  target_profit_percentage: 20,
                  stop_loss_percentage: 10,
                });
              }} disabled={accounts.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingStock ? 'Edit Stock' : 'Add Stock'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleStockSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stock-account">Account</Label>
                  <Select
                    value={stockForm.account_id}
                    onValueChange={(value) => setStockForm({ ...stockForm, account_id: value })}
                    required
                  >
                    <SelectTrigger id="stock-account">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock-symbol">Stock Symbol</Label>
                  <Input
                    id="stock-symbol"
                    value={stockForm.symbol}
                    onChange={(e) => setStockForm({ ...stockForm, symbol: e.target.value.toUpperCase() })}
                    placeholder="e.g., AAPL"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stock-quantity">Quantity</Label>
                    <Input
                      id="stock-quantity"
                      type="number"
                      step="0.00000001"
                      value={stockForm.quantity}
                      onChange={(e) => setStockForm({ ...stockForm, quantity: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock-price">Bought Price</Label>
                    <Input
                      id="stock-price"
                      type="number"
                      step="0.01"
                      value={stockForm.bought_price}
                      onChange={(e) => setStockForm({ ...stockForm, bought_price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stock-target">Target Profit %</Label>
                    <Input
                      id="stock-target"
                      type="number"
                      step="0.01"
                      value={stockForm.target_profit_percentage}
                      onChange={(e) => setStockForm({ ...stockForm, target_profit_percentage: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock-stoploss">Stop Loss %</Label>
                    <Input
                      id="stock-stoploss"
                      type="number"
                      step="0.01"
                      value={stockForm.stop_loss_percentage}
                      onChange={(e) => setStockForm({ ...stockForm, stop_loss_percentage: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setStockDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingStock ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {stocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stocks yet. Add your first stock to start tracking.</p>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <Table className="[&>div]:max-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Account</TableHead>
                    <TableHead className="whitespace-nowrap">Symbol</TableHead>
                    <TableHead className="whitespace-nowrap">Quantity</TableHead>
                    <TableHead className="whitespace-nowrap">Bought Price</TableHead>
                    <TableHead className="whitespace-nowrap">Current Price</TableHead>
                    <TableHead className="whitespace-nowrap">Target %</TableHead>
                    <TableHead className="whitespace-nowrap">Stop Loss %</TableHead>
                    <TableHead className="whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((stock) => {
                    const account = accounts.find(a => a.id === stock.account_id);
                    const isExpanded = expandedStocks.has(stock.id);
                    return (
                      <>
                        <TableRow key={stock.id}>
                          <TableCell className="whitespace-nowrap">{account?.name}</TableCell>
                          <TableCell className="whitespace-nowrap font-medium">{stock.symbol}</TableCell>
                          <TableCell className="whitespace-nowrap">{stock.quantity}</TableCell>
                          <TableCell className="whitespace-nowrap">${stock.bought_price.toFixed(2)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {stock.current_price ? `$${stock.current_price.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{stock.target_profit_percentage}%</TableCell>
                          <TableCell className="whitespace-nowrap">{stock.stop_loss_percentage}%</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newExpanded = new Set(expandedStocks);
                                  if (isExpanded) {
                                    newExpanded.delete(stock.id);
                                  } else {
                                    newExpanded.add(stock.id);
                                  }
                                  setExpandedStocks(newExpanded);
                                }}
                                title="Price Alerts"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEditStock(stock)}>
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
                                    <AlertDialogTitle>Remove Stock</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {stock.symbol} from your portfolio?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteStock(stock.id)}>
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/30">
                              <div className="p-4">
                                <PriceAlertsManager
                                  stockId={stock.id}
                                  symbol={stock.symbol}
                                  currentPrice={stock.current_price}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
