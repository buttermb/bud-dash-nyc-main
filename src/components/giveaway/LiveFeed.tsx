import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Entry {
  id: string;
  firstName: string;
  borough: string;
  entries: number;
  timeAgo: string;
}

interface LiveFeedProps {
  giveawayId: string;
}

const FAKE_NAMES = ['Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'James', 'Ashley', 'Chris', 'Amanda', 'Matt'];
const FAKE_LAST_INITIALS = ['M', 'R', 'K', 'T', 'L', 'W', 'B', 'P', 'H', 'C'];
const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

// Generate realistic fake entries
const generateFakeEntry = (): Entry => {
  const firstName = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
  const lastInitial = FAKE_LAST_INITIALS[Math.floor(Math.random() * FAKE_LAST_INITIALS.length)];
  const borough = BOROUGHS[Math.floor(Math.random() * BOROUGHS.length)];
  
  // Weighted toward 1-3 entries (70%), some higher (30%)
  const rand = Math.random();
  const entries = rand < 0.4 ? 1 : rand < 0.7 ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 10) + 3;
  
  // Recent timestamps (within last 30 minutes)
  const minutesAgo = Math.floor(Math.random() * 30);
  const timeAgo = minutesAgo === 0 ? 'just now' : 
                  minutesAgo === 1 ? '1 minute ago' : 
                  `${minutesAgo} minutes ago`;
  
  return {
    id: `fake-${Date.now()}-${Math.random()}`,
    firstName: `${firstName} ${lastInitial}.`,
    borough,
    entries,
    timeAgo
  };
};

export function LiveFeed({ giveawayId }: LiveFeedProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(loadEntries, 15000);
    return () => clearInterval(interval);
  }, [giveawayId]);

  const loadEntries = async () => {
    try {
      // Get real entries
      const { data: realEntries, error } = await supabase
        .from('giveaway_entries')
        .select('user_first_name, user_last_name, user_borough, total_entries, entered_at')
        .eq('giveaway_id', giveawayId)
        .order('entered_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Format real entries
      const formatted: Entry[] = (realEntries || []).map(entry => ({
        id: `real-${entry.entered_at}`,
        firstName: `${entry.user_first_name} ${entry.user_last_name[0]}.`,
        borough: entry.user_borough || 'NYC',
        entries: entry.total_entries,
        timeAgo: formatTimeAgo(entry.entered_at)
      }));

      // Mix with fake entries (30% fake, 70% real)
      const fakeCount = Math.ceil(formatted.length * 0.3);
      const fakeEntries = Array.from({ length: fakeCount }, generateFakeEntry);
      
      // Interleave real and fake entries
      const mixed: Entry[] = [];
      let realIndex = 0;
      let fakeIndex = 0;
      
      while (realIndex < formatted.length || fakeIndex < fakeEntries.length) {
        const useFake = Math.random() < 0.3 && fakeIndex < fakeEntries.length;
        if (useFake) {
          mixed.push(fakeEntries[fakeIndex++]);
        } else if (realIndex < formatted.length) {
          mixed.push(formatted[realIndex++]);
        }
      }

      setEntries(mixed.slice(0, 15)); // Show 15 total
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-purple-500',
      'from-green-500 to-blue-500',
      'from-pink-500 to-red-500',
      'from-yellow-500 to-orange-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-green-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white/10 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">LIVE</span>
        </div>
        <h3 className="text-2xl font-black text-white">Recent Entries</h3>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(entry.firstName)} rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                {entry.firstName[0]}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">
                  {entry.firstName} from {entry.borough}
                </div>
                <div className="text-sm text-white/60">
                  just entered
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <span className="text-green-400 font-bold text-sm">+{entry.entries}</span>
                </div>
                <div className="text-xs text-white/40">
                  {entry.timeAgo}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-bold text-orange-400">Entries are flying in! 🔥</span>
        </div>
      </div>
    </div>
  );
}
