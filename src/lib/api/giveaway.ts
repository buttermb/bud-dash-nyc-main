import { supabase } from '@/integrations/supabase/client';

// ============================================
// GET GIVEAWAY
// ============================================
export async function getGiveaway(slug: string) {
  const { data, error } = await supabase
    .from('giveaways')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error:', error);
    return null;
  }

  return data;
}

// ============================================
// SUBMIT ENTRY
// ============================================
export async function submitGiveawayEntry(
  giveawayId: string,
  entryData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    borough: string;
    instagramHandle: string;
    instagramTagUrl: string;
    newsletterSubscribe: boolean;
    referralCode?: string;
  }
) {
  try {
    // 1. Get giveaway config
    const { data: giveaway } = await supabase
      .from('giveaways')
      .select('*')
      .eq('id', giveawayId)
      .single();

    if (!giveaway) throw new Error('Giveaway not found');

    // 2. Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: entryData.email,
      password: entryData.password,
      options: {
        data: {
          first_name: entryData.firstName,
          last_name: entryData.lastName,
          phone: entryData.phone,
          date_of_birth: entryData.dateOfBirth,
          borough: entryData.borough,
          instagram_handle: entryData.instagramHandle
        },
        emailRedirectTo: `${window.location.origin}/giveaway/nyc-biggest-flower`
      }
    });

    if (authError) throw authError;
    const userId = authData.user?.id;
    if (!userId) throw new Error('Failed to create user');

    // 3. Calculate entry numbers
    const { data: lastEntry } = await supabase
      .from('giveaway_entries')
      .select('entry_number_end')
      .eq('giveaway_id', giveawayId)
      .order('entry_number_end', { ascending: false })
      .limit(1)
      .maybeSingle();

    const entryNumberStart = (lastEntry?.entry_number_end || 0) + 1;

    // 4. Calculate bonus entries
    let newsletterEntries = 0;
    let referralEntries = 0;

    if (entryData.newsletterSubscribe) {
      newsletterEntries = giveaway.newsletter_bonus_entries || 1;
    }

    // 5. Handle referral (simplified - you can enhance this)
    if (entryData.referralCode) {
      referralEntries = giveaway.referral_bonus_entries || 3;
    }

    const totalEntries = 1 + newsletterEntries + referralEntries;
    const entryNumberEnd = entryNumberStart + totalEntries - 1;

    // 6. Create entry
    const { data: entry, error: entryError } = await supabase
      .from('giveaway_entries')
      .insert({
        giveaway_id: giveawayId,
        user_id: userId,
        user_email: entryData.email,
        user_first_name: entryData.firstName,
        user_last_name: entryData.lastName,
        user_phone: entryData.phone,
        user_borough: entryData.borough,
        instagram_handle: entryData.instagramHandle,
        instagram_tag_url: entryData.instagramTagUrl,
        newsletter_entries: newsletterEntries,
        referral_entries: referralEntries,
        total_entries: totalEntries,
        entry_number_start: entryNumberStart,
        entry_number_end: entryNumberEnd
      })
      .select()
      .single();

    if (entryError) throw entryError;

    // 7. Generate referral link using user ID
    const referralLink = `${window.location.origin}/giveaway/nyc-biggest-flower?ref=${userId}`;

    // 8. Reload to get updated totals
    const { data: updatedGiveaway } = await supabase
      .from('giveaways')
      .select('total_entries')
      .eq('id', giveawayId)
      .single();

    return {
      success: true,
      userId,
      entryId: entry.id,
      totalEntries,
      entryNumbers: {
        start: entryNumberStart,
        end: entryNumberEnd
      },
      breakdown: {
        base: 1,
        newsletter: newsletterEntries,
        referrals: referralEntries
      },
      referralLink,
      giveawayTotalEntries: updatedGiveaway?.total_entries || 0
    };

  } catch (error) {
    console.error('Error submitting entry:', error);
    throw error;
  }
}

// ============================================
// GET USER ENTRY
// ============================================
export async function getUserEntry(giveawayId: string, userId: string) {
  const { data: entry, error } = await supabase
    .from('giveaway_entries')
    .select('*')
    .eq('giveaway_id', giveawayId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !entry) return null;

  const { data: referrals } = await supabase
    .from('giveaway_referrals')
    .select('*')
    .eq('giveaway_id', giveawayId)
    .eq('referrer_user_id', userId);

  const referralLink = `${window.location.origin}/giveaway/nyc-biggest-flower?ref=${userId}`;

  return {
    entryId: entry.id,
    totalEntries: entry.total_entries,
    breakdown: {
      base: entry.base_entries,
      newsletter: entry.newsletter_entries,
      referrals: entry.referral_entries
    },
    referralStats: {
      successfulReferrals: referrals?.filter(r => r.converted).length || 0,
      totalBonusEntries: entry.referral_entries
    },
    referralLink,
    status: entry.status,
    entryNumbers: {
      start: entry.entry_number_start,
      end: entry.entry_number_end
    }
  };
}

// ============================================
// GET RECENT ENTRIES
// ============================================
export async function getRecentEntries(giveawayId: string, limit = 10) {
  const { data, error } = await supabase
    .from('giveaway_entries')
    .select('user_first_name, user_last_name, user_borough, total_entries, entered_at')
    .eq('giveaway_id', giveawayId)
    .order('entered_at', { ascending: false })
    .limit(limit);

  if (error) return [];

  return data.map(entry => ({
    name: `${entry.user_first_name} ${entry.user_last_name?.charAt(0)}.`,
    borough: entry.user_borough,
    entries: entry.total_entries,
    timestamp: formatTimeAgo(entry.entered_at)
  }));
}

function formatTimeAgo(dateString: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 minute ago';
  if (seconds < 300) return 'a few minutes ago';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  
  const hours = Math.floor(minutes / 60);
  return `${hours} hours ago`;
}
