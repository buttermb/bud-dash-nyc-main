import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Gift, Truck, Shield, Clock } from "lucide-react";
import { toast } from "sonner";

const FirstVisitorPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [countdown, setCountdown] = useState(3600); // 60 minutes
  const discountCode = "FIRST10FREE";

  useEffect(() => {
    // Check eligibility
    const popupShown = localStorage.getItem("discount_popup_shown");
    const codeUsed = localStorage.getItem("discount_code_used");
    const deviceUsed = localStorage.getItem("device_discount_used");

    if (!popupShown && !codeUsed && !deviceUsed) {
      // Show after 8 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("discount_popup_shown", "true");
      }, 8000);

      // Exit intent detection
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0 && !popupShown) {
          setIsOpen(true);
          localStorage.setItem("discount_popup_shown", "true");
        }
      };

      document.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleGetCode = () => {
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const usedEmails = JSON.parse(localStorage.getItem("used_discount_emails") || "[]");
    if (usedEmails.includes(email)) {
      toast.error("This email has already been used for a discount");
      return;
    }

    usedEmails.push(email);
    localStorage.setItem("used_discount_emails", JSON.stringify(usedEmails));
    localStorage.setItem("discount_email_provided", email);
    localStorage.setItem("device_discount_used", navigator.userAgent);

    setShowCode(true);
    toast.success("Discount code revealed! Use at checkout");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discountCode);
    toast.success("Code copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:rotate-90"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-gradient-primary p-8 text-center text-white">
          <div className="animate-bounce mb-4">
            <Gift className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Welcome, New Customer!</h2>
          <div className="inline-block bg-white text-primary px-6 py-3 rounded-full text-2xl font-black my-4 shadow-elegant">
            10% OFF + FREE DELIVERY
          </div>
          <p className="text-white/90">On your first order - Limited time!</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <span>Exclusive 10% discount on all THCA products</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Truck className="w-3 h-3 text-green-600" />
              </div>
              <span>Free delivery on your entire order</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-3 h-3 text-green-600" />
              </div>
              <span>Lab-tested products & discreet packaging</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-3 h-3 text-green-600" />
              </div>
              <span>30-minute delivery guarantee</span>
            </div>
          </div>

          {!showCode ? (
            <div className="space-y-3 pt-2">
              <Input
                type="email"
                placeholder="Enter your email to get your code"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleGetCode()}
                className="h-12"
              />
              <Button onClick={handleGetCode} className="w-full h-12 text-lg font-bold">
                Get My Discount Code
              </Button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-dashed border-primary rounded-lg p-4 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Your exclusive discount code:</p>
              <div className="text-3xl font-black text-primary tracking-wider">
                {discountCode}
              </div>
              <Button onClick={handleCopyCode} variant="outline" className="w-full">
                Copy Code
              </Button>
              <p className="text-xs text-green-600 font-semibold">✓ Use at checkout to save 10%</p>
            </div>
          )}

          <div className="text-center text-sm text-destructive font-semibold pt-2">
            Offer expires in: {formatTime(countdown)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstVisitorPopup;
