import ProductCatalog from "@/components/ProductCatalog";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import RecentPurchaseNotification from "@/components/RecentPurchaseNotification";


const Index = () => {
  return (
    <div className="min-h-screen">
      <AgeVerificationModal />
      <RecentPurchaseNotification />
      <Navigation />
      
      {/* Minimal hero - just headline and immediate products */}
      <section className="bg-gradient-to-b from-background to-muted/20 pt-24 pb-12">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Premium THCA Products
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              30-minute delivery • Lab tested • NYC's trusted source
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCTS IMMEDIATELY - No scrolling needed */}
      <div id="products" className="bg-background">
        <ProductCatalog />
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
