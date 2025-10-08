import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ShoppingBag, Check } from "lucide-react";

interface GuestCheckoutOptionProps {
  onGuestCheckout: () => void;
  onSignup: () => void;
  cartTotal?: number;
}

const GuestCheckoutOption = ({ onGuestCheckout, onSignup, cartTotal = 0 }: GuestCheckoutOptionProps) => {
  const savings = cartTotal * 0.1;

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Signup Option - Premium Benefits */}
      <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background hover:border-primary/50 transition-colors">
        <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-1.5 text-xs font-bold rounded-bl-lg">
          RECOMMENDED
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Become a Member</h3>
              {cartTotal > 0 && (
                <p className="text-lg font-bold text-primary">Save ${savings.toFixed(2)} today</p>
              )}
            </div>
          </div>
          
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-2.5">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span><strong>10% off</strong> this order and all future purchases</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span><strong>Free shipping</strong> on every order, always</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span><strong>Track orders</strong> in real-time with live updates</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span><strong>Priority support</strong> and faster checkout</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span><strong>Exclusive offers</strong> and early product access</span>
            </li>
          </ul>

          <Button onClick={onSignup} className="w-full h-12 text-base font-bold" size="lg">
            Create Account & Save {cartTotal > 0 ? `$${savings.toFixed(2)}` : '10%'}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Takes 30 seconds • No credit card required
          </p>
        </div>
      </Card>

      {/* Guest Checkout - Simple Option */}
      <Card className="p-6 space-y-4 border-2 hover:border-muted-foreground/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-muted-foreground">Guest Checkout</h3>
            <p className="text-sm text-muted-foreground">Quick one-time purchase</p>
          </div>
        </div>
        
        <ul className="space-y-2.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2.5">
            <div className="w-5 h-5 flex-shrink-0 mt-0.5">•</div>
            <span>No account needed</span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="w-5 h-5 flex-shrink-0 mt-0.5">•</div>
            <span>Track order via email link</span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="w-5 h-5 flex-shrink-0 mt-0.5">•</div>
            <span>Standard checkout process</span>
          </li>
          <li className="flex items-start gap-2.5 opacity-50">
            <div className="w-5 h-5 flex-shrink-0 mt-0.5">✗</div>
            <span>No member discounts</span>
          </li>
          <li className="flex items-start gap-2.5 opacity-50">
            <div className="w-5 h-5 flex-shrink-0 mt-0.5">✗</div>
            <span>No free shipping</span>
          </li>
        </ul>

        <Button onClick={onGuestCheckout} variant="outline" className="w-full h-12 text-base font-bold" size="lg">
          Continue as Guest
        </Button>
      </Card>
    </div>
  );
};

export default GuestCheckoutOption;
