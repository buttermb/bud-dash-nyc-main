import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ShoppingBag } from "lucide-react";

interface GuestCheckoutOptionProps {
  onGuestCheckout: () => void;
  onSignup: () => void;
}

const GuestCheckoutOption = ({ onGuestCheckout, onSignup }: GuestCheckoutOptionProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-4 mb-8">
      {/* Signup Option - BEST VALUE */}
      <Card className="relative overflow-hidden border-2 border-primary bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-xs font-bold">
          BEST VALUE
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Sign Up & Save</h3>
              <p className="text-2xl font-black text-primary">10% OFF</p>
            </div>
          </div>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Instant 10% discount on all orders</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Track your orders in real-time</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Save delivery addresses</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Exclusive member offers</span>
            </li>
          </ul>

          <Button onClick={onSignup} className="w-full h-12 text-base font-bold" variant="hero">
            Sign Up & Get 10% Off
          </Button>
        </div>
      </Card>

      {/* Guest Checkout */}
      <Card className="p-6 space-y-4 border-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Guest Checkout</h3>
            <p className="text-sm text-muted-foreground">Quick & Simple</p>
          </div>
        </div>
        
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            <span>No account needed</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            <span>Fast checkout process</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            <span>Track via email link</span>
          </li>
        </ul>

        <Button onClick={onGuestCheckout} variant="outline" className="w-full h-12 text-base font-bold">
          Continue as Guest
        </Button>
      </Card>
    </div>
  );
};

export default GuestCheckoutOption;
