import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Privacy Policy - New York Minute NYC"
        description="Learn how New York Minute NYC protects your privacy and handles your personal information for delivery in NYC."
      />
      <Navigation />
      <main className="container mx-auto px-4 py-20 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-bold mb-6">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Your privacy and data security are our top priorities
          </p>
          
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-2xl font-bold">1. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                We collect information you provide directly to us, including your name, email address, phone number, 
                delivery address, and age verification details. We also collect payment information and order history.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use your information to process orders, verify your age, communicate with you about your orders, 
                improve our service, comply with legal requirements, and send promotional communications (with your consent).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">3. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We share your information with licensed partner shops and couriers to fulfill your orders. We may also 
                share information with service providers who assist us in operating our platform, and with law enforcement 
                when required by law.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">4. Age Verification</h2>
              <p className="text-muted-foreground leading-relaxed">
                To comply with New York state law, we verify that all customers are 21 years or older. Your age 
                verification information is stored securely and used only for compliance purposes. Photo ID verification 
                is required at delivery.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your personal information. However, no 
                method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">6. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze site usage, and personalize 
                content. You can control cookies through your browser settings.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">7. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to access, correct, or delete your personal information. You can also opt out of 
                marketing communications at any time. To exercise these rights, contact us at privacy@newyorkminutenyc.com.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your information for as long as necessary to provide our services and comply with legal 
                obligations. Order records are retained for regulatory compliance purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for individuals under 21 years of age. We do not knowingly collect 
                information from anyone under 21.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">10. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by 
                posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about this Privacy Policy, please contact us at privacy@newyorkminutenyc.com or 
                visit our support page.
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

export default Privacy;
