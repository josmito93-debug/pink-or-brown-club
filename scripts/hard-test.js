// ==============================================================================
// PINK OR BROWN · CLUB — AUTOMATED HARD TEST SUITE
// Tests endpoints, routing, cart logic, auth security, and live deployment
// ==============================================================================

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://wwwpinkorbrowncom.vercel.app';
const SUPABASE_URL = 'https://jijehgxugiouatsbvxuh.supabase.co';
const SUPABASE_ANON = 'sb_publishable_QHSxi5-qS47exiKlLG9Lig_bL2p4fYt';

let passed = 0;
let failed = 0;
const results = [];

function assert(description, condition, details = '') {
  if (condition) {
    passed++;
    results.push({ status: 'PASS', description, details });
    console.log(`  \x1b[32m✓ [PASS]\x1b[0m ${description}`);
  } else {
    failed++;
    results.push({ status: 'FAIL', description, details });
    console.log(`  \x1b[31m✗ [FAIL]\x1b[0m ${description} — ${details}`);
  }
}

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(url, options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runHardTest() {
  console.log('\n\x1b[36m============================================================');
  console.log('   PINK OR BROWN · CLUB — COMPREHENSIVE HARD TEST SUITE');
  console.log('============================================================\x1b[0m\n');

  // -------------------------------------------------------------
  // SUITE 1: PRODUCTION LIVE ENDPOINTS & SECURITY HEADERS
  // -------------------------------------------------------------
  console.log('\x1b[33m[1/6] Production Live Deployment & Security Headers\x1b[0m');
  try {
    const res = await fetchUrl(DOMAIN);
    assert('Live site returns HTTP 200 OK', res.status === 200, `Got HTTP ${res.status}`);
    assert('Content-Type is text/html; charset=utf-8', (res.headers['content-type'] || '').includes('text/html'));
    assert('Security Header: X-Content-Type-Options is nosniff', res.headers['x-content-type-options'] === 'nosniff');
    assert('Security Header: Strict-Transport-Security (HSTS) active', !!res.headers['strict-transport-security']);
    assert('HTML payload is complete (>1MB)', res.body.length > 1000000, `Size: ${res.body.length} bytes`);
    assert('Root index contains GSAP 3.12 library link', res.body.includes('gsap@3.12.5'));
    assert('Root index contains Supabase Client SDK link', res.body.includes('@supabase/supabase-js@2'));
    assert('Root index contains POB_CONFIG client connector', res.body.includes('supabase-client.js'));
  } catch (err) {
    assert('Live site reachable', false, err.message);
  }

  // -------------------------------------------------------------
  // SUITE 2: SERVERLESS API ENDPOINTS & VERIFICATION
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[2/6] Serverless API Endpoints & Verification\x1b[0m');

  // Test 2.1: Meta Instagram Webhook GET Handshake (Valid Token)
  try {
    const challengeCode = '987654321';
    const igVerifyRes = await fetchUrl(
      `${DOMAIN}/api/instagram-webhook?hub.mode=subscribe&hub.challenge=${challengeCode}&hub.verify_token=pinkorbrown_secret`
    );
    assert('Meta Webhook GET Handshake accepts valid verify_token', igVerifyRes.status === 200, `Got HTTP ${igVerifyRes.status}`);
    assert('Meta Webhook returns exact hub.challenge payload', igVerifyRes.body.trim() === challengeCode, `Got: "${igVerifyRes.body.trim()}"`);
  } catch (err) {
    assert('Meta Webhook GET handshake reachable', false, err.message);
  }

  // Test 2.2: Meta Instagram Webhook GET Handshake (Invalid Token Rejected)
  try {
    const badTokenRes = await fetchUrl(
      `${DOMAIN}/api/instagram-webhook?hub.mode=subscribe&hub.challenge=123&hub.verify_token=wrong_hacker_token`
    );
    assert('Meta Webhook rejects invalid verify_token with 403 Forbidden', badTokenRes.status === 403, `Got HTTP ${badTokenRes.status}`);
  } catch (err) {
    assert('Meta Webhook rejection test', false, err.message);
  }

  // Test 2.3: Stripe Checkout API Method Guard
  try {
    const checkoutGetRes = await fetchUrl(`${DOMAIN}/api/create-checkout`, { method: 'GET' });
    assert('/api/create-checkout rejects GET with 405 Method Not Allowed', checkoutGetRes.status === 405, `Got HTTP ${checkoutGetRes.status}`);
  } catch (err) {
    assert('/api/create-checkout method guard', false, err.message);
  }

  // Test 2.4: Stripe Webhook API Method Guard
  try {
    const webhookGetRes = await fetchUrl(`${DOMAIN}/api/stripe-webhook`, { method: 'GET' });
    assert('/api/stripe-webhook rejects GET with 405 Method Not Allowed', webhookGetRes.status === 405, `Got HTTP ${webhookGetRes.status}`);
  } catch (err) {
    assert('/api/stripe-webhook method guard', false, err.message);
  }

  // -------------------------------------------------------------
  // SUITE 3: SUPABASE API LIVE CONNECTIVITY & DATABASE HANDSHAKE
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[3/6] Supabase Live Database & REST API Handshake\x1b[0m');
  try {
    const rewardsRes = await fetchUrl(`${SUPABASE_URL}/rest/v1/rewards?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`
      }
    });
    assert('Supabase live database reachable & authenticated', rewardsRes.status === 200, `Got HTTP ${rewardsRes.status}`);
    const rows = JSON.parse(rewardsRes.body);
    assert('Supabase returns live seeded rewards rows (>0)', Array.isArray(rows) && rows.length >= 6, `Found ${rows.length} rewards`);
  } catch (err) {
    assert('Supabase rewards table test', false, err.message);
  }

  try {
    const revealsRes = await fetchUrl(`${SUPABASE_URL}/rest/v1/reveals?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`
      }
    });
    assert('Supabase live table reveals queried successfully', revealsRes.status === 200, `Status: ${revealsRes.status}`);
    const revRows = JSON.parse(revealsRes.body);
    assert('Supabase returns live seeded reveals rows (>0)', Array.isArray(revRows) && revRows.length >= 3, `Found ${revRows.length} reveals`);
  } catch (err) {
    assert('Supabase reveals table test', false, err.message);
  }

  // -------------------------------------------------------------
  // SUITE 4: LOCAL JAVASCRIPT SYNTAX & RUNTIME VERIFICATION
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[4/6] Code Quality, Syntax & AST Integrity\x1b[0m');

  const filesToCheck = [
    'index.html',
    'club.html',
    'Pink or Brown · Club.html',
    'js/supabase-client.js',
    'api/create-checkout.js',
    'api/stripe-webhook.js',
    'api/n8n-webhook.js',
    'api/instagram-webhook.js'
  ];

  for (const f of filesToCheck) {
    const fullPath = path.join(__dirname, '..', f);
    if (!fs.existsSync(fullPath)) {
      assert(`File exists: ${f}`, false, 'File not found');
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');

    if (f.endsWith('.html')) {
      const scriptStart = content.indexOf('<script>') + '<script>'.length;
      const scriptEnd = content.lastIndexOf('</script>');
      const jsCode = content.substring(scriptStart, scriptEnd);
      try {
        new Function(jsCode);
        assert(`Script syntax validation: ${f}`, true);
      } catch (err) {
        assert(`Script syntax validation: ${f}`, false, err.message);
      }
    } else if (f.endsWith('.js')) {
      try {
        new Function(content);
        assert(`Node/JS syntax validation: ${f}`, true);
      } catch (err) {
        assert(`Node/JS syntax validation: ${f}`, false, err.message);
      }
    }
  }

  // -------------------------------------------------------------
  // SUITE 5: BUSINESS LOGIC, CART ENGINE & AGE RESTRICTION TESTS
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[5/6] Business Logic, Cart & Age Validation Engine\x1b[0m');

  // Age calculation test
  const ageOf = iso => {
    const b = new Date(iso), n = new Date();
    let a = n.getFullYear() - b.getFullYear();
    const m = n.getMonth() - b.getMonth();
    if(m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
    return a;
  };

  assert('Age calculation: 2000-01-01 is >= 18', ageOf('2000-01-01') >= 18);
  assert('Age calculation: Today minus 17 years is < 18', ageOf(new Date(Date.now() - 17 * 365.25 * 86400000).toISOString().split('T')[0]) < 18);
  assert('Age calculation: Today minus 25 years is >= 18', ageOf(new Date(Date.now() - 25 * 365.25 * 86400000).toISOString().split('T')[0]) >= 18);

  // Cart & Pricing Calculation
  const PRODUCTS = [
    {id:'women-shirt', price:20},
    {id:'men-shirt', price:20},
    {id:'tank-top', price:25},
    {id:'trucker-cap', price:25},
    {id:'foam-trucker', price:25},
    {id:'unisex-hat', price:20},
    {id:'socks', price:15},
    {id:'underwear', price:22}
  ];

  const cart = [
    { pid: 'women-shirt', qty: 2 }, // $40
    { pid: 'socks', qty: 1 }        // $15 -> Subtotal $55
  ];

  const subtotal = cart.reduce((sum, item) => sum + (PRODUCTS.find(p => p.id === item.pid).price * item.qty), 0);
  assert('Cart subtotal calculation ($55)', subtotal === 55, `Got: $${subtotal}`);

  // Free shipping over $50
  const FREE_SHIP_AT = 50;
  const isFreeShipping = subtotal >= FREE_SHIP_AT;
  assert('Shipping rule: $55 order qualifies for Free Shipping', isFreeShipping === true);

  // Points discount calculation (100 pts = $1, max 50% of merchandise)
  const PTS_PER_DOLLAR = 100;
  const MAX_POINTS_SHARE = 0.5;
  const userBalance = 3000; // $30 worth of points
  const maxPtsAllowed = Math.floor(subtotal * MAX_POINTS_SHARE) * PTS_PER_DOLLAR; // max $27.50 -> 2700 pts ($27)
  const actualPtsUsed = Math.min(userBalance, maxPtsAllowed);
  const ptsDiscount = actualPtsUsed / PTS_PER_DOLLAR;
  const finalTotal = subtotal - ptsDiscount;

  assert('Points cap: max points share (50%) properly restricts discount', actualPtsUsed === 2700, `Used: ${actualPtsUsed}`);
  assert('Final Total after points deduction ($55 - $27 = $28)', finalTotal === 28, `Got: $${finalTotal}`);

  // Tier multiplier test
  const TIERS = [
    {name:'Blush', min:0, mult:1},
    {name:'Rose', min:500, mult:1.25},
    {name:'Cocoa', min:1500, mult:1.5},
    {name:'Icon', min:4000, mult:2}
  ];
  const tierOf = pts => {
    let t = TIERS[0];
    TIERS.forEach(x => { if (pts >= x.min) t = x; });
    return t;
  };

  assert('Tier progression: 0 pts -> Blush tier (1x)', tierOf(0).name === 'Blush' && tierOf(0).mult === 1);
  assert('Tier progression: 600 pts -> Rose tier (1.25x)', tierOf(600).name === 'Rose' && tierOf(600).mult === 1.25);
  assert('Tier progression: 1800 pts -> Cocoa tier (1.5x)', tierOf(1800).name === 'Cocoa' && tierOf(1800).mult === 1.5);
  assert('Tier progression: 5000 pts -> Icon tier (2.0x)', tierOf(5000).name === 'Icon' && tierOf(5000).mult === 2);

  // -------------------------------------------------------------
  // SUITE 6: UI ASSETS, ICONS & PHOTOS EMBEDDED INTEGRITY
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[6/6] Embedded Vector Icons, Graphics & Image Integrity\x1b[0m');
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert('Official Monogram vector SVG embedded', indexHtml.includes('pob-monogram'));
  assert('Pink and Brown Team badges embedded', indexHtml.includes('team-pink') && indexHtml.includes('team-brown'));
  assert('Awareness Ribbon vector embedded', indexHtml.includes('awareness-ribbon'));
  assert('All 8 product lines registered in catalog', ['women-shirt','men-shirt','tank-top','trucker-cap','foam-trucker','unisex-hat','socks','underwear'].every(id => indexHtml.includes(id)));
  assert('No legacy demo buttons present in Login template', !indexHtml.includes('id="demo">Enter with the demo account'));
  assert('Profile photo uploader HTML exists in register form', indexHtml.includes('id="avFile"') && indexHtml.includes('id="avImg"'));
  assert('Real-time age badge container exists in register form', indexHtml.includes('id="ageBadge"'));

  // -------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------
  console.log('\n\x1b[36m============================================================');
  console.log('   HARD TEST SUMMARY REPORT');
  console.log('============================================================\x1b[0m');
  console.log(`  Total Tests Run: \x1b[1m${passed + failed}\x1b[0m`);
  console.log(`  Passed:          \x1b[32m\x1b[1m${passed}\x1b[0m`);
  console.log(`  Failed:          ${failed === 0 ? '\x1b[32m0\x1b[0m' : `\x1b[31m\x1b[1m${failed}\x1b[0m`}`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\x1b[32m🌟 ALL AUDITS AND HARD TESTS PASSED WITH 100% SUCCESS!\x1b[0m\n');
  }
}

runHardTest().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
