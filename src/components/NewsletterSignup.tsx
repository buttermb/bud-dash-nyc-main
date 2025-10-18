import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { toast } from "sonner";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Thanks for subscribing! Check your inbox for exclusive offers.");
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-gradient-primary rounded-xl p-8 md:p-10 text-center space-y-4">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Mail className="w-6 h-6 text-white" />
        <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-white">
          Stay Connected
        </h3>
      </div>
      <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto">
        Get exclusive deals, new product alerts, and delivery updates straight to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 flex-1"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="bg-white text-primary hover:bg-white/90 font-bold uppercase tracking-wide px-8"
          disabled={isLoading}
        >
          {isLoading ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
      <p className="text-white/60 text-xs">
        Join 5,000+ satisfied customers. Unsubscribe anytime.
      </p>
    </div>
  );
};

export default NewsletterSignup;
