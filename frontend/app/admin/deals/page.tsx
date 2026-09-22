'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';

type Deal = any;
type Product = any;

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productId, setProductId] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [daysValid, setDaysValid] = useState('7');

  const load = async () => {
    try {
      const [dealsRes, prodRes] = await Promise.all([
        apiFetch('/admin/deals'),
        apiFetch('/admin/products?is_published=true&limit=100'),
      ]);
      setDeals(dealsRes || []);
      setProducts(prodRes?.items || []);
    } catch (error) {
      toast.error('Failed to load data');
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) { toast.error('Select a product'); return; }
    const ends = new Date();
    ends.setDate(ends.getDate() + parseInt(daysValid));
    try {
      await apiFetch('/admin/deals', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          sale_price: parseFloat(salePrice) || 0,
          original_price: parseFloat(originalPrice) || 0,
          discount_percentage: parseFloat(discountPercentage) || 0,
          ends_at: ends.toISOString(),
          is_active: true,
        })
      });
      toast.success('Deal created');
      setProductId(''); setSalePrice(''); setOriginalPrice(''); setDiscountPercentage('');
      load();
    } catch (error) {
      toast.error('Failed to create deal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deal?')) return;
    try {
      await apiFetch(`/admin/deals/${id}`, { method: 'DELETE' });
      toast.success('Deal deleted');
      load();
    } catch (error) {
      toast.error('Failed to delete deal');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Deals</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-navy mb-4">Add Deal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="salePrice">Sale Price (Rs)</Label><Input id="salePrice" type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required className="mt-1" /></div>
            <div><Label htmlFor="originalPrice">Original Price (Rs)</Label><Input id="originalPrice" type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} required className="mt-1" /></div>
            <div><Label htmlFor="discountPercentage">Discount %</Label><Input id="discountPercentage" type="number" step="0.01" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="daysValid">Valid for (days)</Label><Input id="daysValid" type="number" value={daysValid} onChange={(e) => setDaysValid(e.target.value)} className="mt-1" /></div>
            <Button type="submit">Create Deal</Button>
          </form>
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          {isLoading ? <div className="p-4 animate-pulse">Loading...</div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Sale Price</TableHead><TableHead>Original</TableHead><TableHead>Discount</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="text-sm font-medium text-navy">{deal.product?.name || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-navy">{formatPrice(deal.sale_price)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground line-through">{formatPrice(deal.original_price)}</TableCell>
                    <TableCell className="text-sm font-bold text-red-500">{deal.discount_percentage}%</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => handleDelete(deal.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
