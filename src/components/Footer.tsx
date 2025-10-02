import { Leaf, Shield, Award, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t py-12">
      <div className="container px-4 mx-auto">
        {/* Compliance Badges Section */}
        <div className="mb-8 pb-8 border-b">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-semibold">Licensed Vendors</p>
                <p className="text-xs text-muted-foreground">NY State Compliant</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-semibold">Lab Tested</p>
                <p className="text-xs text-muted-foreground">Third-Party Verified</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-semibold">21+ Only</p>
                <p className="text-xs text-muted-foreground">Age Verified</p>
              </div>
            </div>
          </div>
        </div>
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

        <div className="border-t pt-8 space-y-4">
          {/* Legal Compliance Notice */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1 flex-shrink-0">21+</Badge>
              <div className="text-xs text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">Important Legal Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Age Requirement:</strong> Must be 21 years or older to purchase. Valid government-issued ID required at delivery.</li>
                  <li><strong>Legal Compliance:</strong> All products contain ≤0.3% delta-9 THC and are legal under the 2018 Farm Bill and NY State law.</li>
                  <li><strong>Licensed Operations:</strong> We partner exclusively with licensed smoke shops and dispensaries in New York.</li>
                  <li><strong>Quality Assurance:</strong> All products are third-party lab tested for safety, potency, and compliance.</li>
                  <li><strong>Discreet Delivery:</strong> Private packaging with no product identification on exterior.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
            <p>© 2024 THCA NYC. All rights reserved.</p>
            <p className="text-xs">Licensed • Compliant • Trusted</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
