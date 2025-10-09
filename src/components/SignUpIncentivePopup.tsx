import { useState } from 'react';
import { X, Gift, Truck, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SignUpIncentivePopupProps {
  cartTotal: number;
  onSignUp: (email: string) => void;
  onContinueAsGuest: () => void;
  onClose: () => void;
  isVisible: boolean;
}

export default function SignUpIncentivePopup({ 
  cartTotal, 
  onSignUp, 
  onContinueAsGuest,
  onClose,
  isVisible 
}: SignUpIncentivePopupProps) {
  const [email, setEmail] = useState('');
  const discountAmount = (cartTotal * 0.1).toFixed(2);
  const shippingFee = cartTotal >= 100 ? 0 : 5.99;
  const totalSavings = (parseFloat(discountAmount) + shippingFee).toFixed(2);

  if (!isVisible) return null;

  const handleSignUp = () => {
    if (!email.includes('@')) {
      return;
    }
    onSignUp(email);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className={cn(
            "bg-background rounded-3xl shadow-2xl w-full max-w-md",
            "p-6 md:p-8 pointer-events-auto animate-scale-in",
            "max-h-[90vh] overflow-y-auto"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors touch-target"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Gift className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            Save ${totalSavings} Today! 🎉
          </h2>
          
          <p className="text-muted-foreground text-center mb-6">
            Create an account to unlock your discount
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-6 bg-muted/50 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-1.5 rounded-full flex-shrink-0">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm">
                <strong>10% off</strong> this order (${discountAmount})
              </span>
            </div>
            {shippingFee > 0 && (
              <div className="flex items-center gap-3">
                <div className="bg-primary p-1.5 rounded-full flex-shrink-0">
                  <Truck className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-sm">
                  <strong>Free shipping</strong> today (${shippingFee.toFixed(2)})
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="bg-primary p-1.5 rounded-full flex-shrink-0">
                <Gift className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm">
                <strong>Faster checkout</strong> next time
              </span>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2 mb-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-base"
              autoComplete="email"
              inputMode="email"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && email.includes('@')) {
                  handleSignUp();
                }
              }}
            />
          </div>

          {/* Primary CTA */}
          <Button
            onClick={handleSignUp}
            disabled={!email.includes('@')}
            variant="hero"
            size="lg"
            className="w-full h-14 mb-3 text-base font-semibold"
          >
            Sign Up & Save ${totalSavings}
          </Button>

          {/* Secondary CTA */}
          <button
            onClick={onContinueAsGuest}
            className="w-full text-muted-foreground text-sm hover:text-foreground transition-colors py-3"
          >
            No thanks, I'll pay full price
          </button>

          {/* Trust Signal */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Your info is secure. Unsubscribe anytime.</span>
          </div>
        </div>
      </div>
    </>
  );
}
