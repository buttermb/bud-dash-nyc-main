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
    <section className="py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to get premium THCA delivered to your door
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index} 
                className="relative overflow-hidden border-2 hover:shadow-strong transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="pt-12 pb-8 text-center space-y-4">
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
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
