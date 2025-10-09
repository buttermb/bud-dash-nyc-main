import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is THCA?",
      answer:
        "THCA (tetrahydrocannabinolic acid) is the non-psychoactive precursor to THC found in raw cannabis plants. When heated (through smoking, vaping, or cooking), THCA converts to THC through a process called decarboxylation. THCA products are federally compliant under the 2018 Farm Bill when derived from hemp containing less than 0.3% delta-9 THC.",
    },
    {
      question: "Is THCA legal in NYC?",
      answer:
        "Yes, hemp-derived THCA products are legal in New York State under both federal law (2018 Farm Bill) and state regulations, as long as they contain less than 0.3% delta-9 THC by dry weight. Our products are sourced from licensed NYC vendors and comply with all state and local regulations.",
    },
    {
      question: "How does delivery work?",
      answer:
        "We offer same-day delivery to Brooklyn, Queens, and Manhattan. Orders typically arrive within 30-45 minutes. After placing your order, a nearby partner shop accepts it, prepares your products, and assigns a courier for delivery. You'll receive real-time updates on your order status.",
    },
    {
      question: "What ID do I need at delivery?",
      answer:
        "You must present a valid government-issued photo ID showing you are 21 years or older. Acceptable IDs include a driver's license, state ID, passport, or military ID. The courier will verify your age before handing over your order. No ID, no delivery - no exceptions.",
    },
    {
      question: "What are the delivery fees?",
      answer:
        "Delivery fees vary by location: Brooklyn and Queens have a $5 base fee. Manhattan has a $10 fee ($5 base + $5 borough surcharge). Additional distance charges may apply for deliveries over 2 miles from the partner shop. All fees are clearly displayed before checkout.",
    },
    {
      question: "Can I track my order?",
      answer:
        "Yes! After placing your order, you'll receive a unique order number and can track your delivery in real-time. Track your order from the 'My Orders' page or via the link sent to your email. You'll see when the shop accepts your order, when it's being prepared, and when it's out for delivery.",
    },
    {
      question: "What are the purchase limits?",
      answer:
        "To comply with NYC regulations, we enforce the following limits: Flower products: Maximum 3 ounces per order. Concentrates: Maximum 24 grams per order. These limits help ensure responsible consumption and legal compliance. The cart will automatically prevent you from exceeding these limits.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We currently accept cash on delivery as our primary payment method. Simply have cash ready when the courier arrives. We're working on adding cryptocurrency payments (Bitcoin and USDC) soon. All transactions are discreet and secure.",
    },
    {
      question: "What if I'm not satisfied with my order?",
      answer:
        "Customer satisfaction is our priority. If you receive a damaged or incorrect product, please contact support immediately with your order number and photos. Due to the nature of cannabis products, we cannot accept returns once the seal is broken, but we'll work with you to resolve any legitimate issues.",
    },
    {
      question: "How do I become a partner shop or courier?",
      answer:
        "We're always looking for licensed NYC cannabis retailers and reliable couriers to join our network. Visit our 'Partner Shops' or 'Become a Courier' pages for eligibility requirements, benefits, and application forms. All partners must have proper licensing and pass background checks.",
    },
    {
      question: "What are your delivery hours?",
      answer:
        "We offer delivery 7 days a week from 8:00 AM to 10:00 PM. Orders placed outside these hours will be processed when we reopen. During peak hours (evenings and weekends), delivery times may be slightly longer than our standard 30-45 minute estimate.",
    },
    {
      question: "How should I store THCA products?",
      answer:
        "Keep THCA products in a cool, dark place away from direct sunlight and heat. For flower, use airtight containers to preserve freshness and potency. Edibles should be stored according to package instructions. Keep all products securely stored away from children and pets.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Navigation />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about THCA delivery in NYC
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-lg px-6 bg-card"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 p-6 bg-muted/50 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Our support team is here to help
            </p>
            <a
              href="/support"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
