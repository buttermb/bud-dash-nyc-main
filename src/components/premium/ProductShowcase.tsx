import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { GlowButton } from './GlowButton';
import { FloatingBadge } from './FloatingBadge';
import { ParallaxSection } from './ParallaxSection';
import OptimizedImage from '@/components/OptimizedImage';

interface ProductShowcaseProps {
  product: {
    name: string;
    image_url: string;
    category: string;
    thca_percentage?: number;
    strain_type?: string;
    price: number;
  };
  onShopNow?: () => void;
}

export function ProductShowcase({ product, onShopNow }: ProductShowcaseProps) {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(45,212,191,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(45,212,191,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(45,212,191,0.3) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>
      
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Product image with parallax */}
          <ParallaxSection speed={30}>
            <motion.div
              className="relative aspect-square"
              whileHover={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-vibrant rounded-none shadow-glow" />
              <OptimizedImage
                src={product.image_url}
                alt={product.name}
                className="relative object-contain p-8 mix-blend-multiply"
              />
              
              {/* Floating badges */}
              <div className="absolute top-4 left-4">
                <FloatingBadge delay={0}>NEW</FloatingBadge>
              </div>
              <div className="absolute bottom-4 right-4">
                <FloatingBadge delay={0.2}>LIMITED</FloatingBadge>
              </div>
            </motion.div>
          </ParallaxSection>
          
          {/* Product info */}
          <div className="space-y-6">
            <motion.h2 
              className="heading-massive drop-shadow-[0_0_20px_rgba(45,212,191,0.5)]"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {product.name.split(' ')[0]}
              <br />
              <span className="text-primary text-glow">
                {product.name.split(' ').slice(1).join(' ')}
              </span>
            </motion.h2>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Badge className="bg-primary text-primary-foreground text-sm font-black uppercase px-4 py-2">
                {product.category}
              </Badge>
              {product.thca_percentage && (
                <Badge className="bg-primary/10 text-primary border-2 border-primary text-sm font-black uppercase px-4 py-2">
                  {product.thca_percentage}% THC
                </Badge>
              )}
              {product.strain_type && (
                <Badge className="bg-accent/10 text-accent border-2 border-accent text-sm font-black uppercase px-4 py-2">
                  {product.strain_type}
                </Badge>
              )}
            </motion.div>
            
            <motion.p 
              className="text-lg md:text-xl text-foreground/80 font-medium leading-relaxed"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Premium cannabis product. Lab-tested, quality-guaranteed, and 
              ready to elevate your experience.
            </motion.p>
            
            <motion.div 
              className="flex items-center gap-6"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-5xl md:text-6xl font-black text-primary">
                ${product.price}
              </span>
              <GlowButton onClick={onShopNow}>
                Order Now
              </GlowButton>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
