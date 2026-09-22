'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon, Package, Heart, MapPin, Key, LogOut, ShoppingBag } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Order = any;
type Address = any;
type Product = any;

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading account...</div>}>
      <AccountContent />
    </Suspense>
  );
}

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    const loadData = async () => {
      try {
        const [ordersRes, wishlistRes, addrRes] = await Promise.all([
          apiFetch('/orders'),
          apiFetch('/wishlist'),
          apiFetch('/addresses')
        ]);
        setOrders(ordersRes?.items || []);
        // In the new API, wishlist items should return product details.
        // Wait, does /wishlist return { product_id, product: {...} }?
        // Let's just use what it returns. Assuming it returns `product`.
        setWishlistProducts(wishlistRes?.items?.map((w: any) => w.product).filter(Boolean) || []);
        setAddresses(addrRes?.items || []);
      } catch (error) {
        console.error('Failed to load account data', error);
      }
    };
    loadData();
  }, [user, router]);

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
  }, [profile]);

  if (!user) return null;

  const updateProfile = async () => {
    try {
      await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ full_name: fullName, phone })
      });
      toast.success('Profile updated');
      refreshProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const tabs = [
    { value: 'profile', label: 'Profile', icon: UserIcon },
    { value: 'orders', label: 'Orders', icon: Package },
    { value: 'wishlist', label: 'Wishlist', icon: Heart },
    { value: 'addresses', label: 'Addresses', icon: MapPin },
    { value: 'password', label: 'Password', icon: Key },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-navy mb-6">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="space-y-1">
          <div className="p-4 bg-white rounded-xl border border-gray-200 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-lg">
                {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy truncate">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left',
                  activeTab === tab.value ? 'bg-primary text-white' : 'text-navy hover:bg-gray-100'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
          <button
            onClick={async () => { await signOut(); router.push('/'); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-navy mb-4">Profile Information</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email || ''} disabled className="mt-1 bg-gray-50" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
                </div>
                <Button onClick={updateProfile}>Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-navy mb-2">No orders yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start shopping to place your first order</p>
                  <Link href="/shop"><Button>Start Shopping</Button></Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold text-navy">Order #{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          'text-xs font-medium px-2 py-1 rounded-full',
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        )}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        <p className="text-sm font-bold text-navy mt-1">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded object-cover" />
                          )}
                          <span className="flex-1 text-muted-foreground">{item.product_name}</span>
                          <span className="text-muted-foreground">x{item.quantity}</span>
                          <span className="font-medium text-navy">{formatPrice(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              {wishlistProducts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-navy mb-2">Your wishlist is empty</h3>
                  <p className="text-sm text-muted-foreground mb-4">Save items you love for later</p>
                  <Link href="/shop"><Button>Browse Products</Button></Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlistProducts.map((product) => (
                    <Link key={product.id} href={`/product/${product.slug}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                      {product.primary_image && (
                        <div className="aspect-square overflow-hidden bg-gray-50">
                          <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-navy line-clamp-2 mb-1">{product.name}</h3>
                        <p className="text-sm font-bold text-navy">{formatPrice(product.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-navy mb-2">No saved addresses</h3>
                  <p className="text-sm text-muted-foreground">Addresses are saved during checkout</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-navy">{addr.full_name}</span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{addr.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{addr.address_line1}</p>
                        <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postal_code}</p>
                        <p className="text-sm text-muted-foreground">{addr.phone}</p>
                      </div>
                      {addr.is_default && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Default</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-navy mb-4">Change Password</h2>
              <PasswordChangeForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordChangeForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await apiFetch('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword })
      });
      toast.success('Password updated');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleChange} className="space-y-4 max-w-md">
      <div>
        <Label htmlFor="newPassword">New Password</Label>
        <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
        <Input id="confirmNewPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1" />
      </div>
      <Button type="submit" disabled={isLoading}>{isLoading ? 'Updating...' : 'Update Password'}</Button>
    </form>
  );
}
