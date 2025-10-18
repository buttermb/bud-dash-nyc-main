import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Terms of Service - New York Minute NYC"
        description="Terms and conditions for using New York Minute NYC's premium cannabis delivery service in Brooklyn, Manhattan, and Queens."
      />
      <Navigation />
      <main className="container mx-auto px-4 py-20 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-bold mb-6">Terms of Service</h1>
          <p className="text-lg text-muted-foreground mb-12">
            By using our service, you agree to these terms
          </p>
          
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using New York Minute NYC, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">2. Age Requirement</h2>
              <p className="text-muted-foreground leading-relaxed">
                You must be 21 years of age or older to use this service. By using New York Minute NYC, you represent and 
                warrant that you are at least 21 years old. Valid government-issued photo identification will be 
                required at the time of delivery.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">3. Product Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                All products sold through our platform comply with New York state cannabis regulations. 
                Products are sourced from licensed vendors and are third-party lab tested. Lab results are 
                available upon request for all products.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">4. Ordering and Delivery</h2>
              <p className="text-muted-foreground leading-relaxed">
                Orders are processed and delivered by licensed local shops and independent couriers. Delivery is 
                available in Brooklyn, Queens, and Manhattan between 8 AM and 10 PM daily. Delivery fees vary by 
                location and are calculated at checkout.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">5. Payment</h2>
              <p className="text-muted-foreground leading-relaxed">
                We accept cash on delivery as our primary payment method. Cryptocurrency payments are coming soon. 
                All prices are in USD and include applicable taxes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">6. Returns and Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                Due to the nature of our products, we cannot accept returns once delivery is completed. If you receive 
                a damaged or incorrect product, please contact our support team within 24 hours for resolution.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">7. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree not to misuse our service, engage in fraudulent activity, or violate any applicable laws. 
                We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                New York Minute NYC acts as a platform connecting customers with licensed retailers. We are not responsible 
                for product quality issues, delivery delays beyond our control, or misuse of products after delivery.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">9. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the service after changes 
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">10. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at legal@newyorkminutenyc.com or visit our 
                support page.
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-12 pt-8 border-t border-border">
              Last Updated: January 2025
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
