// ==============================================================================
// PINK OR BROWN · CLUB — FRONTEND SUPABASE & API INTEGRATION CLIENT
// ==============================================================================
// Replace these with your real Supabase Project credentials:
// Supabase Dashboard -> Project Settings -> API -> Project URL & anon/public key
// ==============================================================================

window.POB_CONFIG = {
  supabaseUrl: 'https://jijehgxugiouatsbvxuh.supabase.co',
  supabaseAnonKey: 'sb_publishable_QHSxi5-qS47exiKlLG9Lig_bL2p4fYt',
  stripePublishableKey: window.ENV_STRIPE_PK || ''
};

// Initialize Supabase Client
let sb = null;
if (window.supabase && window.POB_CONFIG.supabaseUrl) {
  sb = window.supabase.createClient(window.POB_CONFIG.supabaseUrl, window.POB_CONFIG.supabaseAnonKey);
  console.log('✓ Connected to Supabase Production (jijehgxugiouatsbvxuh)');
} else {
  console.log('ℹ Running with local store bridge');
}

window.POB_BACKEND = {
  isLive: () => !!sb,

  // --- AUTHENTICATION ---
  async signUp({ email, password, name, handle, team, dob, referral }) {
    if (!sb) return null;
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { name, handle, team, dob, referral }
      }
    });
    if (error) throw error;
    return data;
  },

  async signIn({ email, password }) {
    if (!sb) return null;
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!sb) return;
    await sb.auth.signOut();
  },

  async getCurrentUser() {
    if (!sb) return null;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;

    const { data: profile } = await sb
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile;
  },

  // --- POINT LOGS & LEADERBOARD ---
  async getPointsLog(userId) {
    if (!sb) return [];
    const { data } = await sb
      .from('point_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async getLeaderboard(period = 'month') {
    if (!sb) return [];
    const { data } = await sb
      .from('profiles')
      .select('id, name, handle, team, lifetime_points, balance_points')
      .order('lifetime_points', { ascending: false })
      .limit(50);
    return data || [];
  },

  // --- REALTIME CHAT MESSAGES ---
  subscribeMessages(userId, onMessage) {
    if (!sb) return () => {};
    const channel = sb
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        payload => onMessage(payload.new)
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  },

  async sendMessage(senderId, recipientId, text) {
    if (!sb) return;
    const { data, error } = await sb
      .from('messages')
      .insert({ sender_id: senderId, recipient_id: recipientId, text });
    if (error) throw error;
    return data;
  },

  // --- REWARDS & REDEMPTION ---
  async redeemReward(userId, rewardId) {
    if (!sb) return null;
    const { data: reward } = await sb.from('rewards').select('*').eq('id', rewardId).single();
    if (!reward) throw new Error('Reward not found');

    const code = (reward.kind === 'ticket' ? 'TKT-' : 'POB-') + Math.random().toString(36).slice(2, 8).toUpperCase();

    // Insert redemption
    const { data: redemption, error: redErr } = await sb
      .from('redemptions')
      .insert({
        user_id: userId,
        reward_id: reward.id,
        name: reward.name,
        code
      })
      .select()
      .single();

    if (redErr) throw redErr;

    // Deduct points
    await sb.from('point_logs').insert({
      user_id: userId,
      type: 'redeem',
      pts: -reward.cost,
      note: reward.name
    });

    return redemption;
  },

  // --- STRIPE CHECKOUT ---
  async initiateCheckout({ items, pointsUsed, clubCode, customerEmail, userId }) {
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, pointsUsed, clubCode, customerEmail, userId })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to initialize checkout');
    }

    const { url } = await res.json();
    if (url) {
      window.location.href = url;
    }
  }
};
