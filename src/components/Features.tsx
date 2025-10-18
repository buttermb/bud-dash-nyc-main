import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Zap, Leaf, Lock, DollarSign, MapPin } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Quick",
    description: "From the Upper West Side to Red Hook, we deliver across all five boroughs in under 60 minutes.",
  },
  {
    icon: Lock,
    title: "100% Discreet",
    description: "No markings, complete privacy. Professional delivery that respects your discretion in the city that never sleeps.",
  },
  {
    icon: MapPin,
    title: "NYC-Exclusive",
    description: "Built for New Yorkers, by New Yorkers. We know every neighborhood and deliver with precision.",
  },
  {
    icon: ShieldCheck,
    title: "Lab-Tested",
    description: "Only premium selections, every time. Third-party tested for purity and potency you can trust.",
  },
];

const Features = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-3 md:space-y-4 mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight">Why Choose Us</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Premium service that sets the NYC standard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 bg-card/90 backdrop-blur-sm group"
              >
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold uppercase tracking-wide">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
