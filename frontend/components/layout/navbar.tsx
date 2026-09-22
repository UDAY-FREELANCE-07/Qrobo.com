'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, Heart, User, ShoppingCart, Menu, X, Cpu, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useRouter } from 'next/navigation';

type Product = any;

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Deals', href: '/deals' },
  { label: 'Projects', href: '/projects' },
  { label: 'Learn', href: '/learn' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, setIsOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await apiFetch(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        setSearchResults(data?.items || []);
        setShowSearch(true);
      } catch (error) {
        console.error('Search failed', error);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-navy tracking-tight">Qrobo</span>
          </Link>

          {/* Search - Desktop */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-2xl relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearch(true)}
                  className="pl-10 pr-4 h-10 bg-gray-50 border-gray-200 rounded-full"
                />
              </div>
            </form>
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden animate-scale-in">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                  >
                    {product.primary_image && (
                      <img src={product.primary_image} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Rs {product.price.toFixed(0)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
                <button
                  onClick={() => { router.push(`/shop?q=${encodeURIComponent(searchQuery)}`); setShowSearch(false); }}
                  className="w-full p-3 text-sm text-primary hover:bg-blue-50 font-medium transition-colors"
                >
                  View all results
                </button>
              </div>
            )}
          </div>

          {/* Nav Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-navy hover:text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/account" className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Account">
              <User className="w-5 h-5 text-navy" />
            </Link>
            <Link href="/account?tab=wishlist" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" title="Wishlist">
              <Heart className="w-5 h-5 text-navy" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-navy" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Menu className="w-5 h-5 text-navy" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-lg font-bold text-navy">Qrobo</span>
                    </Link>
                    <SheetClose asChild>
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                      </button>
                    </SheetClose>
                  </div>

                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-gray-50"
                      />
                    </div>
                  </form>

                  {/* Mobile Nav Links */}
                  <nav className="flex flex-col p-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'px-4 py-3 text-sm font-medium rounded-md transition-colors flex items-center justify-between',
                          pathname === link.href
                            ? 'text-primary bg-blue-50'
                            : 'text-navy hover:bg-gray-50'
                        )}
                      >
                        {link.label}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-auto p-4 border-t">
                    {user ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Signed in as</p>
                        <p className="text-sm font-medium text-navy">{profile?.full_name || user.email}</p>
                        <Link href="/account" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full">My Account</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link href="/login" onClick={() => setMobileOpen(false)}>
                          <Button className="w-full">Sign In</Button>
                        </Link>
                        <Link href="/register" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full">Create Account</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
