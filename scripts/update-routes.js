const fs = require('fs');
const path = require('path');

// 1. UPDATE vercel.json
const vercelConfig = {
  version: 2,
  cleanUrls: true,
  rewrites: [
    { source: "/register", destination: "/index.html" },
    { source: "/login", destination: "/index.html" },
    { source: "/forgot", destination: "/index.html" },
    { source: "/dashboard", destination: "/index.html" },
    { source: "/leaderboard", destination: "/index.html" },
    { source: "/rewards", destination: "/index.html" },
    { source: "/messages", destination: "/index.html" },
    { source: "/profile", destination: "/index.html" },
    { source: "/shop", destination: "/index.html" },
    { source: "/community", destination: "/index.html" },
    { source: "/checkout", destination: "/index.html" },
    { source: "/product/(.*)", destination: "/index.html" },
    { source: "/club", destination: "/index.html" },
    { source: "/club.html", destination: "/index.html" },
    { source: "/Pink%20or%20Brown%20%C2%B7%20Club.html", destination: "/index.html" }
  ],
  headers: [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" }
      ]
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, '..', 'vercel.json'),
  JSON.stringify(vercelConfig, null, 2),
  'utf8'
);
console.log('✓ Updated vercel.json with clean rewrites for /register and /login');

// 2. UPDATE index.html route() TO SUPPORT BOTH CLEAN PATHS AND HASHES
let indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const oldRouteStart = `function route(){
  const parts = location.hash.replace(/^#\\/?/, '').split('?')[0].split('/');
  const r = parts[0] || 'home', arg = parts[1];`;

const newRouteStart = `function getRouteParts(){
  if(location.hash && location.hash !== '#/' && location.hash !== '#'){
    const parts = location.hash.replace(/^#\\/?/, '').split('?')[0].split('/');
    return { r: parts[0] || 'home', arg: parts[1] };
  }
  const cleanPath = location.pathname.replace(/^\\/+|\\/+$/g, '');
  if(cleanPath && cleanPath !== 'index' && cleanPath !== 'index.html' && cleanPath !== 'club' && cleanPath !== 'club.html'){
    const parts = cleanPath.replace(/\\.html$/, '').split('/');
    return { r: parts[0] || 'home', arg: parts[1] };
  }
  return { r: 'home', arg: null };
}

function route(){
  const { r, arg } = getRouteParts();`;

if (indexHtml.includes(oldRouteStart)) {
  indexHtml = indexHtml.replace(oldRouteStart, newRouteStart);
  console.log('✓ Updated route() to support /register and /login paths');
} else {
  console.warn('oldRouteStart match not found');
}

// Ensure popups don't trigger when user is specifically on /register or /login
indexHtml = indexHtml.replace(
  "if(!u && ['home','s','shop','product','community'].includes(r) && !popupShown) scheduleTimedPopup();",
  "if(!u && ['home','s'].includes(r) && !popupShown) scheduleTimedPopup();"
);

// Write to index.html, club.html, and Pink or Brown · Club.html
fs.writeFileSync(path.join(__dirname, '..', 'index.html'), indexHtml, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'club.html'), indexHtml, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'Pink or Brown · Club.html'), indexHtml, 'utf8');

// 3. CREATE STANDALONE register.html AND login.html FILES
// These guarantee that even on local webservers or direct static serving, /register and /login load instantly
const makeRedirectHtml = (targetHash, title) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Pink or Brown · ${title}</title>
<script>
window.location.replace('/#/${targetHash}');
</script>
</head>
<body style="font-family:sans-serif;background:#FCEFF2;display:grid;place-content:center;height:100vh;margin:0;color:#2E1A12">
<p>Loading Pink or Brown · ${title}…</p>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'register.html'), makeRedirectHtml('register', 'Join the Club'), 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'login.html'), makeRedirectHtml('login', 'Sign In'), 'utf8');
console.log('✓ Created static fallback register.html and login.html');
