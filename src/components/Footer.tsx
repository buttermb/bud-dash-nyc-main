import { Shield, Award, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import NYMLogo from "./NYMLogo";

const Footer = () => {
  return (
    <footer className="bg-[hsl(222_47%_8%)] border-t border-border py-12">
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
              <NYMLogo size={50} />
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-wider">NEW YORK MINUTE</span>
                <span className="text-xs text-muted-foreground tracking-widest">THCA DELIVERY. ELEVATED.</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Hemp-derived THCA products. Lab-tested. NYC licensed.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-black mb-4 uppercase tracking-wide">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/#products" className="hover:text-primary transition-colors">THCA Flower</Link></li>
              <li><Link to="/#products" className="hover:text-primary transition-colors">THCA Pre-Rolls</Link></li>
              <li><Link to="/#products" className="hover:text-primary transition-colors">THCA Vapes</Link></li>
              <li><Link to="/#products" className="hover:text-primary transition-colors">THCA Concentrates</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-black mb-4 uppercase tracking-wide">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/partner-shops" className="hover:text-primary transition-colors">Partner Shops</Link></li>
              <li><Link to="/become-courier" className="hover:text-primary transition-colors">Become a Courier</Link></li>
              <li><Link to="/support" className="hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h3 className="font-black mb-4 uppercase tracking-wide">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/track-order" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border space-y-1">
              <p className="font-semibold text-foreground">Contact Us</p>
              <p className="text-xs">📞 (212) 555-THCA</p>
              <p className="text-xs">📧 support@nymthca.com</p>
              <p className="text-xs">🕐 9 AM - 11 PM Daily</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 space-y-4">
          {/* Legal Compliance Notice */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1 flex-shrink-0">21+</Badge>
              <div className="text-xs text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">THCA Legal Notice:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Licensed NY Cannabinoid Hemp Retailer:</strong> All operations comply with NY State hemp laws.</li>
                  <li><strong>Hemp-Derived THCA Products:</strong> All products contain ≤0.3% Delta-9 THC and are federally legal.</li>
                  <li><strong>THCA is Non-Psychoactive:</strong> THCA does not produce psychoactive effects in its raw form.</li>
                  <li><strong>21+ Age Verification:</strong> Must be 21+ with valid ID. Age verified at delivery.</li>
                  <li><strong>Lab-Tested:</strong> All products tested for potency and purity by third-party laboratories.</li>
                  <li><strong>Discreet Delivery:</strong> Private packaging with no product identification on exterior.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
            <p>© 2024 New York Minute. All rights reserved.</p>
            <p className="text-xs font-semibold tracking-wider">THCA DELIVERY. ELEVATED.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
