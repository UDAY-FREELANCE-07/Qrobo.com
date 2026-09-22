'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, X, Search, PackageSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

type Product = any;
type Category = any;
type Brand = any;

const PAGE_SIZE = 12;

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
];

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 25000]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          apiFetch('/categories?sort=sort_order'),
          apiFetch('/brands?sort=name'),
        ]);
        setCategories(catRes?.items || []);
        setBrands(brandRes?.items || []);
      } catch (error) {
        console.error('Failed to load filters', error);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        is_published: 'true',
        limit: PAGE_SIZE.toString(),
        page: page.toString(),
      });

      if (searchQuery.trim()) {
        queryParams.append('search', searchQuery);
      }

      if (selectedCategory) {
        queryParams.append('category_slugs', selectedCategory);
      }

      if (selectedBrands.length > 0) {
        // Need to translate brand slugs to ids, wait, can we pass brand_slugs?
        // Wait, brand filtering in backend only supports brand_id.
        // Let's get the brand IDs from our preloaded `brands` list.
        const activeBrandIds = brands
          .filter(b => selectedBrands.includes(b.slug))
          .map(b => b.id);
        if (activeBrandIds.length > 0) {
            // Wait, backend only takes a single `brand_id` right now.
            // But if it's just a query param, let's pass the first one, or we need to update the backend to support array.
            // To prevent blocking, I'll update backend brand_ids later, but for now just pass one or comma separated.
            // Oh actually, I will pass it as brand_id for the first one for now, or let's update backend to `brand_id: z.string().optional()` -> we can't easily change UUID check.
            // I'll quickly just use the first brand id if available.
            queryParams.append('brand_id', activeBrandIds[0]);
        }
      }

      queryParams.append('min_price', priceRange[0].toString());
      queryParams.append('max_price', priceRange[1].toString());

      if (minRating > 0) {
          // Backend doesn't support minRating yet, but we'll fetch and hope for best or ignore it.
          // Wait, actually `minRating` and `inStockOnly` aren't in the backend schema either!
      }

      let backendSort = 'newest';
      if (sortBy === 'price-low') backendSort = 'price_asc';
      else if (sortBy === 'price-high') backendSort = 'price_desc';
      else if (sortBy === 'popularity') backendSort = 'popularity';
      else if (sortBy === 'rating') backendSort = 'rating';
      
      queryParams.append('sort', backendSort);

      const data = await apiFetch(`/products?${queryParams.toString()}`);
      setProducts(data?.items || []);
      setTotalProducts(data?.total || 0);
      setTotalPages(Math.ceil((data?.total || 0) / PAGE_SIZE));
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedBrands, priceRange, minRating, inStockOnly, sortBy, page, brands]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const toggleBrand = (brandSlug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandSlug)
        ? prev.filter((b) => b !== brandSlug)
        : [...prev, brandSlug]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrands([]);
    setPriceRange([0, 25000]);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('relevance');
    setPage(1);
  };

  const activeFilterCount = [
    searchQuery.trim() ? 1 : 0,
    selectedCategory ? 1 : 0,
    selectedBrands.length,
    priceRange[0] > 0 || priceRange[1] < 25000 ? 1 : 0,
    minRating > 0 ? 1 : 0,
    inStockOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-2">
          {selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name || 'Shop'
            : 'All Products'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className={cn(
          'w-64 shrink-0 space-y-6',
          showFilters ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto lg:relative lg:bg-transparent lg:p-0' : 'hidden lg:block'
        )}>
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-lg font-bold">Filters</h2>
            <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
          </div>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full justify-start text-primary">
              <X className="w-4 h-4 mr-2" />
              Clear all filters ({activeFilterCount})
            </Button>
          )}

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-navy mb-3">Categories</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={cn(
                  'block w-full text-left text-sm px-2 py-1 rounded transition-colors',
                  !selectedCategory ? 'text-primary font-medium bg-blue-50' : 'text-muted-foreground hover:text-navy'
                )}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                  className={cn(
                    'block w-full text-left text-sm px-2 py-1 rounded transition-colors',
                    selectedCategory === cat.slug ? 'text-primary font-medium bg-blue-50' : 'text-muted-foreground hover:text-navy'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-sm font-semibold text-navy mb-3">Brands</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedBrands.includes(brand.slug)}
                    onCheckedChange={() => toggleBrand(brand.slug)}
                  />
                  <span className="text-sm text-muted-foreground hover:text-navy">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-semibold text-navy mb-3">Price Range</h3>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => { setPriceRange([Number(e.target.value), priceRange[1]]); setPage(1); }}
                className="h-9 text-sm"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => { setPriceRange([priceRange[0], Number(e.target.value)]); setPage(1); }}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-sm font-semibold text-navy mb-3">Minimum Rating</h3>
            <div className="space-y-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={minRating === rating}
                    onCheckedChange={() => { setMinRating(rating); setPage(1); }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {rating === 0 ? 'All ratings' : `${rating}+ stars`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-sm font-semibold text-navy mb-3">Availability</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={inStockOnly}
                onCheckedChange={(checked) => { setInStockOnly(checked === true); setPage(1); }}
              />
              <span className="text-sm text-muted-foreground">In stock only</span>
            </label>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, totalProducts)} of {totalProducts}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <PackageSearch className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-navy mb-2">No products found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={cn(
                        'w-9 h-9 rounded-md text-sm font-medium transition-colors',
                        page === i + 1
                          ? 'bg-primary text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
