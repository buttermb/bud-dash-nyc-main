import { Shield, Award, Lock, Leaf, BadgeCheck, Package } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    {
      icon: Award,
      title: "Lab Tested",
      description: "Safety & Potency",
    },
    {
      icon: Shield,
      title: "100-Day Guarantee",
      description: "Money Back",
    },
    {
      icon: Package,
      title: "Discreet Packaging",
      description: "Private Delivery",
    },
    {
      icon: BadgeCheck,
      title: "Third-Party Tested",
      description: "Verified Quality",
    },
    {
      icon: Leaf,
      title: "USA Grown",
      description: "Premium Hemp",
    },
    {
      icon: Lock,
      title: "Secure Payment",
      description: "SSL Protected",
    },
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center gap-2 p-4 rounded-lg hover:bg-card transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
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
