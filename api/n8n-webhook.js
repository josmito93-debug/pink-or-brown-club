// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/n8n-webhook
// Connects n8n workflow for automated Instagram story tracking & post moderation
// ==============================================================================

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Security check using shared secret
  const authHeader = req.headers['authorization'];
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized webhook request' });
  }

  const { action, payload } = req.body;

  try {
    switch (action) {
      // 1. Instagram DM verification code received in @pinkorbrown DM
      case 'verify_ig_code': {
        const { igHandle, code } = payload;
        if (!code) return res.status(400).json({ error: 'Missing code' });

        const cleanCode = code.trim().toUpperCase();
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, handle, ig_linked')
          .eq('ig_code', cleanCode)
          .single();

        if (error || !profile) {
          return res.status(404).json({ error: 'No user matching that verification code' });
        }

        // Mark account as linked and award 50 points
        await supabase
          .from('profiles')
          .update({ ig_linked: true, handle: igHandle ? igHandle.toLowerCase() : profile.handle })
          .eq('id', profile.id);

        await supabase.from('point_logs').insert({
          user_id: profile.id,
          type: 'link',
          pts: 50,
          note: 'Instagram verified via DM'
        });

        return res.status(200).json({ success: true, userId: profile.id });
      }

      // 2. Submission approval (feed post, story, challenge)
      case 'approve_submission': {
        const { submissionId, reviewerId } = payload;
        const { data: sub, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('id', submissionId)
          .single();

        if (error || !sub) {
          return res.status(404).json({ error: 'Submission not found' });
        }

        const ptsMap = { story: 50, post: 100, challenge: 250 };
        const pts = ptsMap[sub.type] || 50;

        // Mark approved
        await supabase
          .from('submissions')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: reviewerId || null
          })
          .eq('id', submissionId);

        // Award points
        await supabase.from('point_logs').insert({
          user_id: sub.user_id,
          type: sub.type,
          pts,
          note: `Approved ${sub.type}`
        });

        // Add to public gallery if image is present
        if (sub.image_url) {
          await supabase.from('snaps').insert({
            user_id: sub.user_id,
            image_url: sub.image_url,
            caption: `${sub.type.toUpperCase()} approved entry`
          });
        }

        return res.status(200).json({ success: true, pointsAwarded: pts });
      }

      default:
        return res.status(400).json({ error: 'Unknown webhook action' });
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: err.message });
  }
};
