const fs = require('fs');
const path = require('path');

const metaTags = `
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<meta name="description" content="A movement that creates connection and raises awareness, celebrating all women and supporting Breast Cancer Awareness. Join the club, earn points, and unlock rewards.">

<!-- OpenGraph / Facebook / WhatsApp -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://wwwpinkorbrowncom.vercel.app/">
<meta property="og:title" content="Pink or Brown · Club">
<meta property="og:description" content="Celebrating women and raising breast cancer awareness. Join the club, earn points on every snap, climb the leaderboard, and unlock free merch.">
<meta property="og:image" content="https://wwwpinkorbrowncom.vercel.app/og-image.png">
<meta property="og:image:secure_url" content="https://wwwpinkorbrowncom.vercel.app/og-image.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="Pink or Brown · Club">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@PinkorBrown">
<meta name="twitter:creator" content="@PinkorBrown">
<meta name="twitter:title" content="Pink or Brown · Club">
<meta name="twitter:description" content="Celebrating women and raising breast cancer awareness. Join the club, earn points on every snap, climb the leaderboard, and unlock free merch.">
<meta name="twitter:image" content="https://wwwpinkorbrowncom.vercel.app/og-image.png">
<meta name="theme-color" content="#E0607E">`;

const files = [
  'index.html',
  'club.html',
  'Pink or Brown · Club.html',
  'register.html',
  'login.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove existing og or favicon if any
  content = content.replace(/<link rel="(icon|shortcut icon|apple-touch-icon)"[^>]*>/gi, '');
  content = content.replace(/<meta property="og:[^>]*>/gi, '');
  content = content.replace(/<meta name="twitter:[^>]*>/gi, '');
  content = content.replace(/<meta name="theme-color"[^>]*>/gi, '');

  // Insert right after <title>...</title>
  content = content.replace(/(<title>[^<]*<\/title>)/i, `$1\n${metaTags}`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Injected favicon & OpenGraph meta tags into ${file}`);
});
