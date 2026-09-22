'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPrice, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Order = any;

const orderStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { items: any[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/admin/orders?limit=100');
        setOrders(data?.items || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load orders');
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      toast.success('Order status updated');
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Orders</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={cn('px-3 py-1.5 rounded-lg text-sm font-medium shrink-0', filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-navy')}
        >
          All ({orders.length})
        </button>
        {orderStatuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn('px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 capitalize', filter === status ? 'bg-primary text-white' : 'bg-gray-100 text-navy')}
          >
            {status.replace(/_/g, ' ')} ({orders.filter((o) => o.status === status).length})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse text-muted-foreground">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">No orders found</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-sm font-medium text-navy">{order.order_number}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{order.items?.length || 0} items</TableCell>
                  <TableCell className="text-sm font-bold text-navy">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <span className={cn('text-xs px-2 py-1 rounded-full', order.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                      {order.payment_status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-xs border rounded-md px-2 py-1 bg-white"
                    >
                      {orderStatuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
