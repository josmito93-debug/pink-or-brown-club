// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/create-checkout
// Creates a Stripe Checkout Session with support for club points and discount codes
// ==============================================================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Standard catalog prices for security validation
const PRICES = {
  'women-shirt': 2000,
  'men-shirt': 2000,
  'tank-top': 2500,
  'trucker-cap': 2500,
  'foam-trucker': 2500,
  'unisex-hat': 2000,
  'socks': 1500,
  'underwear': 2200
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { items, pointsUsed = 0, clubCode = null, customerEmail, userId } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate subtotal from secure catalog prices (in cents)
    let subtotalCents = 0;
    const lineItems = items.map(item => {
      const unitAmount = PRICES[item.pid] || 2000;
      subtotalCents += unitAmount * item.qty;
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name || item.pid,
            description: `${item.color || ''} ${item.size ? '· Size ' + item.size : ''}`.trim()
          },
          unit_amount: unitAmount
        },
        quantity: item.qty
      };
    });

    // Check discount eligibility
    let discountCents = 0;
    let redemptionId = null;

    if (clubCode && userId) {
      const { data: redemption } = await supabase
        .from('redemptions')
        .select('*')
        .eq('code', clubCode.toUpperCase())
        .eq('user_id', userId)
        .is('used_at', null)
        .single();

      if (redemption) {
        redemptionId = redemption.id;
        if (redemption.reward_id === 'off10') {
          discountCents += Math.round(subtotalCents * 0.10);
        } else if (redemption.reward_id === 'cap') {
          discountCents += 2500; // Free cap
        } else if (redemption.reward_id === 'tee') {
          discountCents += 2000; // Free shirt
        }
      }
    }

    // Verify points balance from Supabase if points used
    let validPointsUsed = 0;
    if (pointsUsed > 0 && userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance_points')
        .eq('id', userId)
        .single();

      if (profile && profile.balance_points >= pointsUsed) {
        // 100 points = $1.00 (100 cents) -> 1 point = 1 cent
        // Can cover up to 50% of merchandise
        const maxPointsAllowed = Math.floor((subtotalCents - discountCents) * 0.5);
        validPointsUsed = Math.min(pointsUsed, maxPointsAllowed, profile.balance_points);
        discountCents += validPointsUsed;
      }
    }

    // Shipping calculation (free over $50)
    const isFreeShipping = (subtotalCents - discountCents) >= 5000;
    const shippingOptions = [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: isFreeShipping ? 0 : 500,
            currency: 'usd'
          },
          display_name: isFreeShipping ? 'Free Standard Shipping' : 'Standard Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 5 }
          }
        }
      }
    ];

    const origin = req.headers.origin || 'https://wwwpinkorbrowncom.vercel.app';
    const orderId = 'PB' + Math.floor(1000 + Math.random() * 9000);

    const discounts = [];
    if (discountCents > 0) {
      // Create a dynamic one-time Stripe coupon for the points / code discount
      const coupon = await stripe.coupons.create({
        amount_off: discountCents,
        currency: 'usd',
        duration: 'once',
        name: `Club Rewards & Points Discount ($${(discountCents / 100).toFixed(2)})`
      });
      discounts.push({ coupon: coupon.id });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail || undefined,
      line_items: lineItems,
      shipping_options: shippingOptions,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'MX', 'GB']
      },
      discounts: discounts.length ? discounts : undefined,
      mode: 'payment',
      metadata: {
        orderId,
        userId: userId || '',
        pointsUsed: validPointsUsed.toString(),
        redemptionId: redemptionId || '',
        clubCode: clubCode || ''
      },
      success_url: `${origin}/#/checkout?status=success&orderId=${orderId}`,
      cancel_url: `${origin}/#/checkout?status=cancel`
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      orderId
    });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
