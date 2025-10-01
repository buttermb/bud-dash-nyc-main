import { Leaf } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t py-12">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">THCA NYC</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium THCA delivery connecting NYC customers with licensed local shops.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/#products" className="hover:text-primary transition-colors">Flower</a></li>
              <li><a href="/#products" className="hover:text-primary transition-colors">Edibles</a></li>
              <li><a href="/#products" className="hover:text-primary transition-colors">Vapes</a></li>
              <li><a href="/#products" className="hover:text-primary transition-colors">Concentrates</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="/partner-shops" className="hover:text-primary transition-colors">Partner Shops</a></li>
              <li><a href="/become-courier" className="hover:text-primary transition-colors">Become a Courier</a></li>
              <li><a href="/courier/login" className="hover:text-primary transition-colors">Driver Portal</a></li>
              <li><a href="/support" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/faq" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="/support" className="hover:text-primary transition-colors">Contact Support</a></li>
              <li><a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 THCA NYC. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Must be 21+ to order. THCA products contain ≤0.3% delta-9 THC and are legal under NY state law.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
