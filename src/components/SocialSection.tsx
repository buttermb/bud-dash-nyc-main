import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Facebook, MessageCircle } from "lucide-react";

const SocialSection = () => {
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      handle: "@nymnyc",
      url: "#",
      color: "hover:bg-pink-600",
      description: "Daily deals & new drops",
    },
    {
      name: "Twitter",
      icon: Twitter,
      handle: "@nymnyc",
      url: "#",
      color: "hover:bg-blue-500",
      description: "Real-time updates",
    },
    {
      name: "Facebook",
      icon: Facebook,
      handle: "/nymnyc",
      url: "#",
      color: "hover:bg-blue-600",
      description: "Community & reviews",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-card border-y border-border">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Follow The Journey
            </h2>
            <p className="text-muted-foreground">
              Join 10K+ New Yorkers staying updated on deals, drops & NYC culture
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="p-6 rounded-xl border border-border/50 bg-background hover:border-primary/30 transition-all hover:-translate-y-1">
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-sm mb-1">{social.name}</p>
                        <p className="text-xs text-primary">{social.handle}</p>
                        <p className="text-xs text-muted-foreground mt-1">{social.description}</p>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Live Chat CTA */}
          <div className="pt-6 border-t border-border/50">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/5 border border-primary/20">
              <MessageCircle className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-bold">Need Help?</p>
                <p className="text-xs text-muted-foreground">Chat with us 8AM-10PM EST</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="ml-2 font-semibold text-xs uppercase"
              >
                Chat Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialSection;
