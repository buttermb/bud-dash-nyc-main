import { Shield, Award, Clock, Package } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    {
      icon: Shield,
      title: "Licensed Hemp Retailer",
      description: "NY State Compliant",
    },
    {
      icon: Award,
      title: "Lab-Tested THCA",
      description: "Potency & Purity",
    },
    {
      icon: Clock,
      title: "30min Delivery",
      description: "All 5 Boroughs",
    },
    {
      icon: Package,
      title: "Discreet Packaging",
      description: "Private & Secure",
    },
  ];

  return (
    <section className="py-16 bg-card/50 border-y border-border">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-lg hover:border-primary border-2 border-transparent transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-wide">{badge.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
