// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/stripe-webhook
// Listens to Stripe events, records orders in Supabase, and credits points
// ==============================================================================

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// We need raw body for Stripe signature validation
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe webhook secrets not configured' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    // If running in Node/Vercel with raw body buffer
    const buf = await new Promise((resolve, reject) => {
      let data = [];
      req.on('data', chunk => data.push(chunk));
      req.on('end', () => resolve(Buffer.concat(data)));
      req.on('error', err => reject(err));
    });

    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { orderId, userId, pointsUsed = '0', redemptionId } = session.metadata || {};

    const totalDollars = (session.amount_total || 0) / 100;
    const subtotalDollars = (session.amount_subtotal || 0) / 100;
    const shippingDollars = (session.total_details?.amount_shipping || 0) / 100;
    const discountDollars = (session.total_details?.amount_discount || 0) / 100;

    // Calculate points earned: $1 = 1 point base (or tier multiplier)
    let pointsEarned = Math.floor(subtotalDollars - discountDollars);

    try {
      // 1. If user is logged in, fetch their tier for multiplier
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('lifetime_points')
          .eq('id', userId)
          .single();

        if (profile) {
          let mult = 1;
          const lifetime = profile.lifetime_points || 0;
          if (lifetime >= 4000) mult = 2.0;
          else if (lifetime >= 1500) mult = 1.5;
          else if (lifetime >= 500) mult = 1.25;

          pointsEarned = Math.floor(pointsEarned * mult);
        }
      }

      // 2. Insert order into Supabase
      const { error: orderError } = await supabase.from('orders').insert({
        id: orderId || 'PB' + Math.floor(1000 + Math.random() * 9000),
        user_id: userId || null,
        email: session.customer_details?.email || session.customer_email,
        items: session.line_items || [],
        subtotal: subtotalDollars,
        discount: discountDollars,
        shipping: shippingDollars,
        total: totalDollars,
        points_used: parseInt(pointsUsed, 10) || 0,
        points_earned: pointsEarned,
        stripe_session_id: session.id,
        payment_status: session.payment_status,
        shipping_address: session.shipping_details?.address || null
      });

      if (orderError) {
        console.error('Error recording order in Supabase:', orderError);
      }

      // 3. Deduct points used
      const ptsUsedInt = parseInt(pointsUsed, 10);
      if (userId && ptsUsedInt > 0) {
        await supabase.from('point_logs').insert({
          user_id: userId,
          type: 'spend',
          pts: -ptsUsedInt,
          note: `Used on order ${orderId}`
        });
      }

      // 4. Award points earned
      if (userId && pointsEarned > 0) {
        await supabase.from('point_logs').insert({
          user_id: userId,
          type: 'purchase',
          pts: pointsEarned,
          note: `Earned on order ${orderId}`
        });
      }

      // 5. Mark coupon/code redemption as used
      if (redemptionId) {
        await supabase
          .from('redemptions')
          .update({ used_at: new Date().toISOString() })
          .eq('id', redemptionId);
      }

      console.log(`Order ${orderId} processed successfully! Points earned: ${pointsEarned}`);
    } catch (dbErr) {
      console.error('Database transaction error:', dbErr);
    }
  }

  res.status(200).json({ received: true });
};
