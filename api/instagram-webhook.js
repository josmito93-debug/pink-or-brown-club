// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/instagram-webhook
// Official Meta (Facebook) Developers Webhook for Instagram Graph API & Messenger
// Handles webhook verification (GET) and incoming DMs / Story mentions (POST)
// ==============================================================================

const { createClient } = require('@supabase/supabase-js');

const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

module.exports = async (req, res) => {
  // 1. META WEBHOOK HANDSHAKE (GET REQUEST)
  // Meta sends GET with hub.mode, hub.verify_token, and hub.challenge
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = process.env.META_VERIFY_TOKEN || 'pinkorbrown_secret';

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✓ Meta Webhook verified successfully');
      return res.status(200).send(challenge);
    } else {
      console.warn('⚠️ Meta Webhook verification token mismatch');
      return res.status(403).send('Forbidden');
    }
  }

  // 2. INCOMING INSTAGRAM EVENTS (POST REQUEST)
  if (req.method === 'POST') {
    const body = req.body;

    if (!supabase) {
      console.error('Supabase client not initialized');
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }

    try {
      if (body.object === 'instagram') {
        const entries = body.entry || [];

        for (const entry of entries) {
          const messagings = entry.messaging || [];

          for (const msgEvent of messagings) {
            const senderId = msgEvent.sender?.id;
            const message = msgEvent.message;

            if (!message) continue;

            const text = (message.text || '').trim();

            // Case A: User sent their POB verification code in DM (e.g., "POB-K8L9" or "Hey my code is POB-1234")
            const codeMatch = text.match(/\b(POB-[A-Z0-9]{4,8})\b/i);
            if (codeMatch) {
              const code = codeMatch[1].toUpperCase();
              console.log(`Received potential verification code: ${code}`);

              const { data: profile, error } = await supabase
                .from('profiles')
                .select('id, handle, ig_linked')
                .eq('ig_code', code)
                .single();

              if (profile && !profile.ig_linked) {
                // Link account
                await supabase
                  .from('profiles')
                  .update({ ig_linked: true })
                  .eq('id', profile.id);

                // Award 50 points
                await supabase.from('point_logs').insert({
                  user_id: profile.id,
                  type: 'link',
                  pts: 50,
                  note: 'Instagram account verified via DM'
                });

                console.log(`✓ Linked Instagram profile ${profile.id} (@${profile.handle})`);
              }
            }

            // Case B: Story mentions (User tagged @pinkorbrown in their story)
            const attachments = message.attachments || [];
            for (const att of attachments) {
              if (att.type === 'story_mention') {
                const storyUrl = att.payload?.url || '';
                console.log(`Story mention detected from IG sender ${senderId}`);
                // In production, match sender to user or record in submissions for moderation
              }
            }
          }
        }

        return res.status(200).send('EVENT_RECEIVED');
      }

      return res.status(200).send('OK');
    } catch (err) {
      console.error('Error processing Instagram webhook:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
