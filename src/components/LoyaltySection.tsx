import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Users, Star, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import AuthModal from "./AuthModal";

const LoyaltySection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  const handleGetStarted = () => {
    if (user) {
      navigate("/account");
    } else {
      setAuthMode("signup");
      setShowAuthModal(true);
    }
  };

  const benefits = [
    {
      icon: Gift,
      title: "Earn Rewards",
      description: "Get points with every purchase",
    },
    {
      icon: Users,
      title: "Refer Friends",
      description: "Give $10, Get $10 in credits",
    },
    {
      icon: Star,
      title: "VIP Perks",
      description: "Early access to new products",
    },
    {
      icon: Trophy,
      title: "Birthday Bonus",
      description: "Special gift on your birthday",
    },
  ];

  return (
    <>
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight">
                Join The Club
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Earn rewards with every order. Refer friends. Get exclusive perks.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card
                    key={index}
                    className="border border-border/50 hover:border-primary/30 transition-all bg-card/80 backdrop-blur-sm text-center group hover:-translate-y-1"
                  >
                    <CardContent className="p-6 space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-1">{benefit.title}</p>
                        <p className="text-xs text-muted-foreground">{benefit.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* CTA Card */}
            <Card className="border-2 border-primary/30 bg-gradient-primary/5 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-5" />
              <CardContent className="p-8 md:p-10 text-center relative z-10">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-2">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-primary uppercase tracking-wide">
                      Loyalty Program
                    </span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wide">
                    Start Earning Today
                  </h3>
                  
                  <p className="text-muted-foreground">
                    Create an account and automatically join our rewards program. 
                    Earn 1 point per dollar spent. Redeem for discounts and exclusive perks.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button
                      size="lg"
                      className="bg-accent hover:bg-accent-dark text-white font-bold uppercase shadow-accent"
                      onClick={handleGetStarted}
                    >
                      {user ? "View My Rewards" : "Sign Up Free"}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="font-semibold uppercase hover:bg-primary/10"
                      onClick={() => navigate("/about")}
                    >
                      Learn More
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground pt-2">
                    No purchase necessary to join. Terms apply.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
};

export default LoyaltySection;
