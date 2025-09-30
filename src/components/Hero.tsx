import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, Leaf } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/95" />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-hero z-0" />

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="px-4 py-2 text-sm border-primary/20 bg-primary/5">
              <Leaf className="w-4 h-4 mr-2" />
              Legal THCA Delivery in NYC
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Premium THCA{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Delivered Fast
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Connect with licensed NYC smoke shops for same-day THCA delivery. 
            Legal, verified, and delivered to your door.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">21+ Age Verified</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Under 45 Min Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Licensed Vendors Only</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="hero" size="lg" className="text-lg">
              Shop Now
            </Button>
            <Button variant="outline" size="lg" className="text-lg">
              Learn More
            </Button>
          </div>

          {/* Legal Notice */}
          <p className="text-xs text-muted-foreground pt-8">
            Must be 21+ to order. THCA products contain ≤0.3% delta-9 THC and are legal under NY state law.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
