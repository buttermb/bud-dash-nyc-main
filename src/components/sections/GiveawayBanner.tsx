import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GiveawayBanner() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* BOLD Background */}
      <div className="absolute inset-0 bg-gradient-vibrant opacity-20" />
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 20, repeat: Infinity }}
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,20,147,0.2) 0%, transparent 50%)',
          backgroundSize: '200% 200%',
        }}
      />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-black border-4 border-primary p-12 md:p-16"
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 opacity-50"
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,20,147,0.3)',
                '0 0 60px rgba(255,0,255,0.5)',
                '0 0 20px rgba(255,20,147,0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            {/* Icon */}
            <motion.div
              className="inline-block mb-6"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gift className="w-20 h-20 text-primary" strokeWidth={2.5} />
            </motion.div>

            {/* Heading */}
            <h2 className="heading-bold text-white mb-4">
              WIN BIG WITH
              <br />
              <span className="text-primary neon-glow">BUDDASH GIVEAWAYS</span>
            </h2>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/80 mb-8 font-medium">
              Enter for a chance to win premium products, exclusive merch, and more!
            </p>

            {/* CTA */}
            <Button
              size="xl"
              variant="premium"
              asChild
              className="text-xl px-12 py-7 font-black shadow-glow hover:shadow-neon"
            >
              <Link to="/giveaway">
                ENTER NOW
                <ArrowRight className="ml-2 w-6 h-6" />
              </Link>
            </Button>

            {/* Fine print */}
            <p className="text-sm text-white/40 mt-6">
              No purchase necessary. Must be 21+. See official rules for details.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
