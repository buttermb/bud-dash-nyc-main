import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEOHead } from "@/components/SEOHead";

const FAQ = () => {
  const faqs = [
    {
      question: "Are your products legal in NYC?",
      answer:
        "Yes. All products are derived from hemp and contain less than 0.3% Delta-9 THC, complying with federal and New York State regulations. We are a licensed premium retailer by the NYC Department of Consumer Affairs.",
    },
    {
      question: "Are your products lab tested?",
      answer:
        "Absolutely. Every product is third-party lab tested for potency, purity, pesticides, heavy metals, and contaminants. Certificates of Analysis (COAs) are available for all products upon request.",
    },
    {
      question: "What areas do you deliver to?",
      answer:
        "We deliver across all five boroughs: Manhattan, Brooklyn, Queens, Bronx, and Staten Island. Enter your address at checkout to confirm delivery availability. Orders typically arrive within 60 minutes.",
    },
    {
      question: "How fast is delivery?",
      answer:
        "Orders typically arrive within 45-60 minutes across NYC. You'll receive real-time tracking updates via SMS and can follow your courier's location on the map.",
    },
    {
      question: "Do you require ID verification?",
      answer:
        "Yes. You must be 21+ with valid government-issued ID. Our professional courier will verify your age at delivery. Acceptable IDs: driver's license, state ID, passport, or military ID.",
    },
    {
      question: "What are the delivery fees?",
      answer:
        "FREE delivery on orders over $100. $10 delivery fee for orders $50-$99. $15 for orders under $50. All fees are transparently displayed at checkout before you confirm your order.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept cash on delivery and select cryptocurrencies (Bitcoin, USDC). Additional payment options including card payments are coming soon. Make sure to have exact change ready.",
    },
    {
      question: "How discreet is your packaging?",
      answer:
        "100% discreet. Our premium packaging has no markings or branding that indicate the contents. Professional courier delivery ensures complete privacy and discretion.",
    },
    {
      question: "Will these products show up on a drug test?",
      answer:
        "Yes, products may result in positive drug test results. If you're subject to workplace drug testing, consult with your employer or testing authority before purchasing.",
    },
    {
      question: "What is your return policy?",
      answer:
        "Contact support immediately if you receive a damaged or incorrect product. Include your order number and photos. We'll work quickly to resolve any issues and ensure your satisfaction.",
    },
    {
      question: "How do I track my order?",
      answer:
        "After placing your order, you'll receive a tracking link via SMS and email. You can follow your courier's real-time location and estimated arrival time on our interactive map.",
    },
    {
      question: "What if I'm not home for delivery?",
      answer:
        "You must be present to receive and sign for the delivery. If you're not available, please reschedule through your tracking link or contact support to arrange a new delivery time.",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "Email us at support@newyorkminutenyc.com, call (212) 555-DASH, or use our live chat. We're available 8 AM - 10 PM EST every day. Typical response time is under 2 hours.",
    },
  ];

  return (
    <>
      <SEOHead
        title="FAQ - Premium NYC Delivery | Answers to Your Questions"
        description="Get answers to common questions about our premium NYC delivery service. Learn about delivery times, areas covered, payment methods, and more."
      />
      <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Navigation />
      
      <main className="flex-1 py-16 md:py-24">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6">
              FAQ
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Everything you need to know about premium NYC delivery
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-2 border-border/50 hover:border-primary/30 rounded-xl px-6 bg-card/80 backdrop-blur-sm transition-colors"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-bold uppercase tracking-wide text-base">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-16 p-8 md:p-10 bg-gradient-primary/10 border-2 border-primary/20 rounded-2xl text-center">
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3">Still have questions?</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Our NYC support team is here to help
            </p>
            <a
              href="/support"
              className="inline-block px-8 py-4 bg-accent hover:bg-accent-dark text-white font-bold uppercase tracking-wide rounded-lg shadow-accent transition-all hover:scale-105"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
};

export default FAQ;
