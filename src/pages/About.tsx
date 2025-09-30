import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Leaf, Shield, Truck, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About Bud-Dash NYC</h1>
          
          <p className="text-lg text-muted-foreground mb-12">
            Bud-Dash NYC is the premier platform connecting New York City customers with licensed local THCA retailers. 
            We're committed to providing fast, legal, and reliable delivery of premium THCA products across Brooklyn, 
            Queens, and Manhattan.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Premium Quality</h2>
              </div>
              <p className="text-muted-foreground">
                All products are sourced from licensed NYC shops and undergo third-party lab testing to ensure 
                quality, potency, and compliance with state regulations.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Legal & Compliant</h2>
              </div>
              <p className="text-muted-foreground">
                We operate in full compliance with New York state law. All THCA products contain ≤0.3% delta-9 THC 
                and are legal for adults 21 and over.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Fast Delivery</h2>
              </div>
              <p className="text-muted-foreground">
                Orders are typically delivered within 30-45 minutes. Our network of verified couriers ensures your 
                products arrive quickly and discreetly.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Community Focused</h2>
              </div>
              <p className="text-muted-foreground">
                We partner with local NYC shops and support small businesses. By using Bud-Dash, you're helping 
                strengthen the local cannabis community.
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground">
              Our mission is to make premium THCA products accessible to New York City residents through a convenient, 
              safe, and legal platform. We believe in transparency, quality, and exceptional customer service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Why Choose Bud-Dash?</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Verified licensed retailers only</li>
              <li>Third-party lab tested products</li>
              <li>Fast delivery (typically 30-45 minutes)</li>
              <li>Transparent pricing with no hidden fees</li>
              <li>Secure payment options (cash on delivery)</li>
              <li>21+ age verification at delivery</li>
              <li>Full compliance with NY state law</li>
              <li>Dedicated customer support</li>
            </ul>
          </section>

          <section className="bg-muted/30 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Get In Touch</h2>
            <p className="text-muted-foreground mb-4">
              Have questions or want to learn more? We'd love to hear from you.
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>Email: info@bud-dash.nyc</p>
              <p>Support: support@bud-dash.nyc</p>
              <p>Hours: 8 AM - 10 PM Daily</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
