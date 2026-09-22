'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Profile = any;

export default function AdminCustomersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/admin/customers?limit=100');
        setProfiles(data?.items || []);
      } catch (error) {
        toast.error('Failed to load customers');
      }
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Customers</h1>
      {isLoading ? <div className="animate-pulse">Loading...</div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="text-sm font-medium text-navy">{profile.full_name || profile.email}</TableCell>
                  <TableCell>
                    <span className={cn('text-xs px-2 py-1 rounded-full', profile.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600')}>
                      {profile.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{profile.phone || '-'}</TableCell>
                  <TableCell className="text-sm font-medium text-navy">{profile._count?.orders || 0}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(profile.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
