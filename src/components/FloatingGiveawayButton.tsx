import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';

export default function FloatingGiveawayButton() {
  return (
    <Link
      to="/giveaway/nyc-biggest-flower"
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary via-emerald-500 to-blue-500 text-white px-5 py-3 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
    >
      <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      <span className="font-bold text-sm hidden sm:inline">Enter Giveaway</span>
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg" />
    </Link>
  );
}