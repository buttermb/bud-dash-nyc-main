import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Zap, Leaf, Lock, DollarSign, MapPin } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Age Verified",
    description: "Strict 21+ enforcement with ID verification at signup and delivery.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Average delivery time under 45 minutes across Brooklyn, Queens, and Manhattan.",
  },
  {
    icon: Leaf,
    title: "100% Legal",
    description: "All THCA products are hemp-derived with ≤0.3% delta-9 THC, legal in NY.",
  },
  {
    icon: Lock,
    title: "Licensed Vendors",
    description: "Only verified, licensed NYC smoke shops and dispensaries on our platform.",
  },
  {
    icon: DollarSign,
    title: "Flexible Payment",
    description: "Pay with cash on delivery or cryptocurrency (Bitcoin, USDC).",
  },
  {
    icon: MapPin,
    title: "Track Your Order",
    description: "Real-time updates from order placement to doorstep delivery.",
  },
];

const Features = () => {
  return (
    <section className="py-20">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">Why Choose Us</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Safe, legal, and convenient THCA delivery you can trust
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-soft"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
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
