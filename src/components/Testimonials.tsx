import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Marcus R.",
    location: "Upper East Side",
    rating: 5,
    text: "Best delivery service in NYC, hands down. Fast, discreet, and the quality is always top-notch. My go-to for premium flower.",
    verified: true,
  },
  {
    name: "Sarah K.",
    location: "Williamsburg",
    rating: 5,
    text: "Incredibly professional and quick. Love the packaging—totally discreet. The lab-tested products give me peace of mind.",
    verified: true,
  },
  {
    name: "David L.",
    location: "Hell's Kitchen",
    rating: 5,
    text: "Was skeptical at first, but the ID verification and professional couriers made me feel secure. Products are fire 🔥",
    verified: true,
  },
  {
    name: "Jasmine T.",
    location: "Park Slope",
    rating: 5,
    text: "Finally, a delivery service that actually delivers on time! The tracking feature is clutch. Highly recommend.",
    verified: true,
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/20">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
            What NYC Says
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Real reviews from real customers across the five boroughs
          </p>
        </div>

        {/* Mobile: Swipeable Carousel */}
        <div className="md:hidden">
          <Carousel className="w-full max-w-sm mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <TestimonialCard testimonial={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-16 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-black text-primary mb-2">5,000+</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Happy Customers
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-primary mb-2">4.9★</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Average Rating
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-primary mb-2">&lt;45min</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Avg Delivery
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all group">
      <CardContent className="p-6 space-y-4">
        <Quote className="w-8 h-8 text-primary/30 group-hover:text-primary/50 transition-colors" />
        
        <div className="flex gap-1">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>

        <p className="text-sm leading-relaxed text-foreground/90">
          "{testimonial.text}"
        </p>

        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">{testimonial.name}</p>
              <p className="text-xs text-muted-foreground">{testimonial.location}</p>
            </div>
            {testimonial.verified && (
              <div className="flex items-center gap-1 text-xs text-primary">
                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                  ✓
                </div>
                <span className="font-semibold">Verified</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Testimonials;
