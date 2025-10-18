import { motion } from 'framer-motion';
import { Instagram, ExternalLink } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

const instagramPosts = [
  { id: 1, image: '/products/gelato-flower.jpg', likes: '2.4K' },
  { id: 2, image: '/products/purple-haze-flower.jpg', likes: '3.1K' },
  { id: 3, image: '/products/og-kush-premium.jpg', likes: '2.8K' },
  { id: 4, image: '/products/wedding-cake-premium.jpg', likes: '4.2K' },
  { id: 5, image: '/products/live-resin-vape.jpg', likes: '1.9K' },
  { id: 6, image: '/products/thca-gummies.jpg', likes: '3.5K' },
];

export default function InstagramFeed() {
  return (
    <section className="py-20 px-4 bg-black">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Instagram className="w-10 h-10 text-primary" />
            <h2 className="text-5xl md:text-6xl font-black text-white">
              FOLLOW <span className="text-primary">@BUDDASH</span>
            </h2>
          </div>
          <p className="text-xl text-white/60 font-medium">
            See what the community is loving
          </p>
        </motion.div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post, index) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/buddash"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-primary-magenta/10"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <OptimizedImage
                src={post.image}
                alt={`Instagram post ${post.id}`}
                className="object-cover transition-transform duration-500 group-hover:scale-110 w-full h-full"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-black">
                  <ExternalLink className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-black text-lg">❤️ {post.likes}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="https://instagram.com/buddash"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-vibrant text-black font-black text-lg hover:shadow-glow transition-all duration-300"
          >
            <Instagram className="w-6 h-6" />
            FOLLOW US ON INSTAGRAM
          </a>
        </motion.div>
      </div>
    </section>
  );
}
