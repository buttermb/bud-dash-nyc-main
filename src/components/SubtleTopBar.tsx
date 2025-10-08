import { useState } from "react";
import { Gift, X, ChevronDown } from "lucide-react";
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
    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/10">
      <div className="container mx-auto px-4">
        <AnimatePresence>
          {!isExpanded ? (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="flex items-center justify-between py-2"
            >
              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1"
              >
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  First order? <span className="text-primary font-bold">Get 10% off</span>
                </span>
                <ChevronDown className="w-4 h-4 text-primary" />
              </button>
              <button
                onClick={handleDismiss}
                className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center ml-2"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="py-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Join Our Community</h3>
                </div>
                <button onClick={() => setIsExpanded(false)} className="text-sm hover:underline">
                  Close
                </button>
              </div>

              {!showCode ? (
                <div className="flex gap-2 max-w-md">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleGetCode()}
                    className="flex-1"
                  />
                  <Button onClick={handleGetCode}>Get 10% Off</Button>
                </div>
              ) : (
                <div className="flex items-center gap-4 max-w-md">
                  <div className="bg-background border border-primary/20 rounded-lg px-4 py-2">
                    <div className="text-lg font-bold text-primary">FIRST10FREE</div>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText("FIRST10FREE");
                      toast.success("Code copied!");
                    }}
                    variant="outline"
                  >
                    Copy Code
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
