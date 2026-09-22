'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, Mail, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Settings</h1>
      <div className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-navy">Store Information</h2>
          </div>
          <div className="space-y-4">
            <div><Label htmlFor="storeName">Store Name</Label><Input id="storeName" defaultValue="Qrobo" className="mt-1" /></div>
            <div><Label htmlFor="storeEmail">Store Email</Label><Input id="storeEmail" type="email" defaultValue="support@qrobo.in" className="mt-1" /></div>
            <div><Label htmlFor="storePhone">Store Phone</Label><Input id="storePhone" defaultValue="+91 98765 43210" className="mt-1" /></div>
            <Button onClick={() => toast.success('Settings saved')}>Save Changes</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-navy">Notifications</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-primary" /> <span className="text-sm">Email me when new orders are placed</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-primary" /> <span className="text-sm">Email me when stock is low</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> <span className="text-sm">Email me when new reviews are submitted</span></label>
            <Button className="mt-2" onClick={() => toast.success('Notification settings saved')}>Save Notifications</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-navy">Security</h2>
          </div>
          <div className="space-y-4">
            <div><Label htmlFor="adminPass">Change Admin Password</Label><Input id="adminPass" type="password" className="mt-1" /></div>
            <Button onClick={() => toast.success('Password updated')}>Update Password</Button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-sm font-bold text-navy mb-2">Payment Gateway</h3>
          <p className="text-sm text-muted-foreground">Razorpay integration is ready. Configure your Razorpay API keys in the environment variables to enable online payments.</p>
        </div>
      </div>
    </div>
  );
}
