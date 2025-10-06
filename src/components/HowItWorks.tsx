import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Store, Truck } from "lucide-react";

const steps = [
  {
    icon: ShoppingBag,
    title: "Browse & Order",
    description: "Shop THCA products from licensed NYC smoke shops. Real-time inventory, transparent pricing.",
  },
  {
    icon: Store,
    title: "Shop Prepares",
    description: "Your order is accepted and prepared by a verified local shop. Quality guaranteed.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Licensed courier delivers to your door with ID verification. Cash or crypto payment.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-32 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-6 mb-24">
          <h2 className="text-6xl md:text-7xl font-black uppercase tracking-wider">How It Works</h2>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Three simple steps to get premium THCA delivered to your door
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index} 
                className="relative overflow-hidden border-2 hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur-sm"
              >
                <CardContent className="pt-16 pb-12 text-center space-y-6">
                  <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-black text-primary">{index + 1}</span>
                  </div>
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                    <Icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-wide">{step.title}</h3>
                  <p className="text-muted-foreground text-lg">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
