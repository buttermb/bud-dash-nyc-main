import { useState } from "react";
import { Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const SubtleTopBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [showCode, setShowCode] = useState(false);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
  };

  const topBarDismissed = getCookie("top_bar_dismissed");
  const hasCode = getCookie("discount_code_used");

  if (isDismissed || topBarDismissed || hasCode) return null;

  const handleGetCode = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setShowCode(true);
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `discount_code_used=true; expires=${expires}; path=/; SameSite=Lax`;
    toast.success("Welcome! Code ready to use");
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `top_bar_dismissed=true; expires=${expires}; path=/; SameSite=Lax`;
  };

  return (
    <div className="bg-background/95 backdrop-blur-sm border-b border-border/40">
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center py-2 relative"
            >
              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
              >
                <Gift className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">
                  New members get <span className="text-primary font-bold">10% off</span>
                </span>
              </button>
              <button
                onClick={handleDismiss}
                className="absolute right-0 w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="py-3 relative"
            >
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute right-0 top-3 w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3" />
              </button>

              {!showCode ? (
                <div className="flex items-center justify-center gap-2 max-w-md mx-auto pr-6">
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleGetCode()}
                    className="h-9 text-sm"
                  />
                  <Button onClick={handleGetCode} size="sm" className="whitespace-nowrap">
                    Get Code
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 pr-6">
                  <div className="bg-primary/5 border border-primary/20 rounded px-3 py-1.5">
                    <span className="text-sm font-bold text-primary">FIRST10FREE</span>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText("FIRST10FREE");
                      toast.success("Code copied!");
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubtleTopBar;
