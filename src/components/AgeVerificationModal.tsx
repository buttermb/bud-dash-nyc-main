import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";

const AgeVerificationModal = () => {
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const { user } = useAuth();

  useEffect(() => {
    // Only show to non-authenticated users who haven't been age-verified
    if (!user) {
      // Remove localStorage check - age verification now requires real ID verification
      setOpen(true);
    }
  }, [user]);

  const handleVerify = (isOver21: boolean) => {
    if (isOver21) {
      // Remove localStorage - age verification now requires account creation and real ID verification
      setOpen(false);
      // Prompt to sign up for ID verification
      setTimeout(() => {
        setShowAuthModal(true);
      }, 500);
    } else {
      window.location.href = "https://google.com";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">{/* Hide close button */}
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl text-center">Age Verification Required</DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              You must be 21 years or older to access this website and purchase THCA products.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full text-lg"
              onClick={() => handleVerify(true)}
            >
              I am 21 or older
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full text-lg"
              onClick={() => handleVerify(false)}
            >
              I am under 21
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center pt-4">
            You'll need to create an account and verify your ID with a government-issued document. By entering, you agree to our Terms of Service and Privacy Policy.
          </p>
        </DialogContent>
      </Dialog>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
};

export default AgeVerificationModal;
