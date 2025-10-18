import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Leaf, Shield, Truck, Users } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const About = () => {
  return (
    <>
      <SEOHead
        title="About NYM NYC - Premium Delivery Service | All Five Boroughs"
        description="Learn about New York's premier delivery service. Licensed, lab-tested, and serving Manhattan, Brooklyn, Queens, Bronx & Staten Island. Fast, discreet, premium quality."
      />
      <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6">
              About NYM NYC
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              New York's premium delivery service. Fast, discreet, and licensed.
              <br className="hidden md:block" />
              Serving all five boroughs with elevated experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
              <h2 className="text-2xl font-bold uppercase tracking-wide">Premium Quality</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Exclusively licensed NYC vendors. Every product is third-party lab tested for 
                potency, purity, and safety. Only the finest selections make it to your door.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              <h2 className="text-2xl font-bold uppercase tracking-wide">Licensed & Compliant</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Licensed Premium Retailer by NYC Department of Consumer Affairs. 
                All products comply with federal and New York State regulations.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Truck className="w-7 h-7 text-white" />
                </div>
              <h2 className="text-2xl font-bold uppercase tracking-wide">Lightning Delivery</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Under 60 minutes across all five boroughs. Professional drivers, 100% discreet 
                packaging, and real-time tracking. NYC speed meets premium service.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
              <h2 className="text-2xl font-bold uppercase tracking-wide">Curated Selection</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Hand-picked from licensed cultivators who prioritize quality. Indoor-grown, 
                properly cured, and consistently premium. No compromises.
              </p>
            </div>
          </div>

          <section className="mb-16 p-8 md:p-10 bg-gradient-primary/5 rounded-2xl border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Built by New Yorkers, for New Yorkers. We're making premium products accessible 
              to everyone who values quality, consistency, and convenience. From the Upper West Side 
              to Red Hook, Astoria to Park Slope—we're here for the city that never sleeps.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6">Our Standards</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Licensed & compliant vendors only",
                "Third-party lab testing on every batch",
                "Premium indoor-grown products",
                "Professional quality control",
                "100% discreet delivery",
                "21+ age verification enforced",
                "Transparent pricing, no hidden fees",
                "Dedicated NYC customer support"
              ].map((standard, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm font-medium">{standard}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card border-2 border-primary/20 p-8 md:p-10 rounded-2xl">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">Questions?</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Our NYC-based team is here to help.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <p className="font-bold text-sm uppercase tracking-wide text-primary">Email</p>
                <p className="text-foreground">support@newyorkminutenyc.com</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-sm uppercase tracking-wide text-primary">Phone</p>
                <p className="text-foreground">(212) 555-DASH</p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <p className="font-bold text-sm uppercase tracking-wide text-primary">Hours</p>
                <p className="text-foreground">8 AM - 10 PM, Every Day</p>
              </div>
            </div>
            <div className="pt-6 border-t border-border/50 text-sm text-muted-foreground">
              <p className="font-bold text-foreground mb-1">Licensed Premium Retailer</p>
              <p>NYC Department of Consumer Affairs</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
};

export default About;
