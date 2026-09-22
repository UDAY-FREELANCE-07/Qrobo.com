'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Brand = any;

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [country, setCountry] = useState('');

  const load = async () => {
    try {
      const data = await apiFetch('/admin/brands');
      setBrands(data || []);
    } catch (error) {
      toast.error('Failed to load brands');
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), country };
    try {
      if (editing) {
        await apiFetch(`/admin/brands/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        toast.success('Brand updated');
      } else {
        await apiFetch('/admin/brands', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        toast.success('Brand created');
      }
      setEditing(null); setName(''); setSlug(''); setCountry('');
      load();
    } catch (error) {
      toast.error(editing ? 'Failed to update' : 'Failed to create');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand?')) return;
    try {
      await apiFetch(`/admin/brands/${id}`, { method: 'DELETE' });
      toast.success('Brand deleted');
      load();
    } catch (error) {
      toast.error('Cannot delete - products may reference this brand');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Brands</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-navy mb-4">{editing ? 'Edit Brand' : 'Add Brand'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" /></div>
            <div><Label htmlFor="slug">Slug</Label><Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1" placeholder="auto-generated" /></div>
            <div><Label htmlFor="country">Country</Label><Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1" /></div>
            <div className="flex gap-2">
              <Button type="submit">{editing ? 'Update' : 'Add'} Brand</Button>
              {editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); setName(''); setSlug(''); }}>Cancel</Button>}
            </div>
          </form>
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          {isLoading ? <div className="p-4 animate-pulse">Loading...</div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Country</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="text-sm font-medium text-navy">{brand.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{brand.slug}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{brand.country || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setEditing(brand); setName(brand.name); setSlug(brand.slug); setCountry(brand.country || ''); }}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(brand.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
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
