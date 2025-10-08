import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Copy, Key } from 'lucide-react';

interface CourierPinManagementProps {
  courierId: string;
  currentPin?: string;
  courierName: string;
}

export default function CourierPinManagement({ courierId, currentPin, courierName }: CourierPinManagementProps) {
  const [pin, setPin] = useState(currentPin || '');
  const [loading, setLoading] = useState(false);

  // Simple hash function for client-side PIN hashing  
  const hashPin = async (pin: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `$sha256$${hashHex}`;
  };

  const generatePin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_admin_pin');
      
      if (error) throw error;
      
      setPin(data);
      toast.success('PIN generated - remember to save it!');
    } catch (error) {
      toast.error('Failed to generate PIN');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const savePin = async () => {
    if (!pin || pin.length !== 6) {
      toast.error('PIN must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      // Hash the PIN before saving for security
      const hashedPin = await hashPin(pin);
      
      const { error } = await supabase
        .from('couriers')
        .update({ 
          admin_pin: hashedPin, 
          admin_pin_verified: false,
          pin_set_at: new Date().toISOString()
        })
        .eq('id', courierId);

      if (error) throw error;

      // Log security event
      await supabase.from('security_events').insert({
        event_type: 'courier_pin_updated',
        details: { 
          courier_id: courierId,
          courier_name: courierName,
          timestamp: new Date().toISOString()
        }
      });

      toast.success(`Admin PIN securely set for ${courierName}`);
      setPin(''); // Clear PIN after saving
    } catch (error) {
      toast.error('Failed to save PIN');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyPin = () => {
    navigator.clipboard.writeText(pin);
    toast.success('PIN copied to clipboard');
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Key className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Admin PIN Management</h3>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit PIN"
            maxLength={6}
            className="text-center text-lg tracking-widest font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={generatePin}
            disabled={loading}
            title="Generate random PIN"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={copyPin}
            disabled={!pin}
            title="Copy PIN"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={savePin}
          disabled={loading || !pin || pin.length !== 6}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Save Admin PIN'}
        </Button>

        <p className="text-xs text-muted-foreground">
          This PIN must be provided to the courier on their first login. PINs are securely hashed before storage. Keep it secure.
        </p>
      </div>
    </Card>
  );
}