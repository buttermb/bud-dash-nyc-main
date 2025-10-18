import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Zap, Leaf, Lock, DollarSign, MapPin } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Quick Delivery",
    description: "Get your order in under 60 minutes across NYC. Fast, reliable, and tracked every step.",
  },
  {
    icon: Lock,
    title: "100% Discreet Packaging",
    description: "No markings, complete privacy. Professional delivery that respects your discretion.",
  },
  {
    icon: MapPin,
    title: "NYC-Exclusive Service",
    description: "Built for the city, by the city. We know every neighborhood and deliver with precision.",
  },
  {
    icon: ShieldCheck,
    title: "Lab-Tested Quality",
    description: "Only premium selections, every time. Third-party tested for purity and potency.",
  },
];

const Features = () => {
  return (
    <section className="py-20 md:py-32 bg-muted/20">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 md:space-y-6 mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight">Why Choose Us</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Premium service that sets the standard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 bg-card/80 backdrop-blur-sm group"
              >
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
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
