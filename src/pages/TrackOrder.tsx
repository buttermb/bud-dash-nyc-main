import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Loader2, Package, Search } from 'lucide-react';

export default function TrackOrder() {
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatTrackingCode = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Format as ABC-DEF-GH12
    let formatted = '';
    if (cleaned.length > 0) formatted += cleaned.substring(0, 3);
    if (cleaned.length > 3) formatted += '-' + cleaned.substring(3, 6);
    if (cleaned.length > 6) formatted += '-' + cleaned.substring(6, 10);
    
    return formatted;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTrackingCode(e.target.value);
    setTrackingCode(formatted);
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formatted = trackingCode.replace(/\s/g, '').toUpperCase();
    
    // Validate format
    if (!/^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{4}$/.test(formatted)) {
      toast.error('Invalid tracking code format. Use format: ABC-DEF-GH12');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('public_order_tracking')
        .select('tracking_code')
        .eq('tracking_code', formatted)
        .maybeSingle();

      if (error || !data) {
        toast.error('Order not found. Please check your tracking code.');
        setLoading(false);
        return;
      }

      navigate(`/track/${formatted}`);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
              <Package className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your tracking code to see real-time updates</p>
          </div>

          {/* Tracking Form */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border">
            <form onSubmit={handleTrack}>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Tracking Code
                </label>
                <Input
                  type="text"
                  value={trackingCode}
                  onChange={handleInputChange}
                  placeholder="ABC-DEF-GH12"
                  className="text-lg text-center font-mono uppercase tracking-wider h-14"
                  maxLength={12}
                  required
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Found in your order confirmation email or SMS
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Track Order
                  </>
                )}
              </Button>
            </form>

            {/* Example */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground text-center mb-2">Example format:</p>
              <div className="flex items-center justify-center space-x-2">
                <code className="px-3 py-1 bg-muted rounded text-sm font-mono">ABC-DEF-GH12</code>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Can't find your tracking code?{' '}
              <a href="/support" className="text-primary hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
