import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getGiveaway, getRecentEntries, getUserEntry } from '@/lib/api/giveaway';
import { mixRealAndGeneratedEntries } from '@/lib/utils/socialProof';
import Hero from '@/components/giveaway/Hero';
import Timer from '@/components/giveaway/Timer';
import EntryForm from '@/components/giveaway/EntryForm';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GiveawayPage() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  
  const [giveaway, setGiveaway] = useState<any>(null);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadGiveaway();
  }, [user]);

  useEffect(() => {
    if (!giveaway) return;
    
    const interval = setInterval(() => {
      getRecentEntries(giveaway.id).then(realEntries => {
        const mixed = mixRealAndGeneratedEntries(realEntries, 10);
        setRecentEntries(mixed);
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [giveaway]);

  async function loadGiveaway() {
    try {
      const giveawayData = await getGiveaway('nyc-biggest-flower');
      setGiveaway(giveawayData);

      if (giveawayData) {
        const entriesData = await getRecentEntries(giveawayData.id);
        const mixed = mixRealAndGeneratedEntries(entriesData, 10);
        setRecentEntries(mixed);

        if (user) {
          const userEntryData = await getUserEntry(giveawayData.id, user.id);
          setUserEntry(userEntryData);
        }
      }
    } catch (error) {
      console.error('Error loading giveaway:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-white" />
        </motion.div>
      </div>
    );
  }

  if (!giveaway) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Giveaway Not Found</h1>
          <p className="text-gray-400">This giveaway doesn't exist or has ended.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative container mx-auto px-4 py-12 max-w-7xl">
        <Hero
          title={giveaway.title}
          tagline={giveaway.tagline}
          totalEntries={giveaway.total_entries}
          totalParticipants={giveaway.total_participants}
        />

        <Timer endDate={giveaway.end_date} />

        {userEntry ? (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold mb-4">You're Already Entered! 🎉</h2>
            <p className="text-gray-400">Total entries: {userEntry.totalEntries}</p>
          </div>
        ) : (
          <EntryForm
            giveaway={giveaway}
            referralCode={referralCode || undefined}
            onSuccess={loadGiveaway}
          />
        )}
      </div>
    </div>
  );
}
