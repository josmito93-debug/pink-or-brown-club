const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let src = fs.readFileSync(filePath, 'utf8');

// 1. ADD CSS FOR LOADER AND OFFICIAL LOGOS
const loaderCss = `
/* ===== Page Loader & Official Transparent Logos ===== */
.page-loader{position:fixed;inset:0;background:var(--bg);z-index:99999;display:flex;align-items:center;justify-content:center;transition:opacity .5s cubic-bezier(.4,0,.2,1), visibility .5s}
.page-loader.loaded{opacity:0;visibility:hidden;pointer-events:none}
.loader-content{display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;padding:24px}
.loader-mark{width:76px;height:auto;display:block;filter:drop-shadow(0 8px 20px rgba(224,96,126,.3))}
.loader-logo{width:min(320px,82vw);height:auto;display:block;filter:drop-shadow(0 6px 16px rgba(46,26,18,.12))}
.loader-bar-wrap{width:180px;height:4px;background:var(--line);border-radius:99px;overflow:hidden;margin-top:8px}
.loader-bar{height:100%;width:0%;background:linear-gradient(90deg,var(--pink),var(--brown));border-radius:99px}
.loader-text{font-size:.8rem;font-weight:700;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-top:2px}

.nav-official-logo{height:36px;width:auto;display:block;object-fit:contain;transition:transform .2s}
.nav-official-logo:hover{transform:scale(1.04)}
.foot-official-logo{height:40px;width:auto;display:block;object-fit:contain}
.hero-brand-wrap{margin-bottom:20px;display:inline-block}
.hero-official-logo{height:60px;max-width:100%;width:auto;display:block;object-fit:contain;filter:drop-shadow(0 8px 20px rgba(224,96,126,.22))}
.pitch-official-logo{height:46px;max-width:100%;width:auto;display:block;object-fit:contain;margin-bottom:14px}

@media (max-width:720px){
  .nav-official-logo{height:30px}
  .hero-official-logo{height:44px}
  .loader-mark{width:64px}
  .loader-logo{width:240px}
}
`;

if (!src.includes('page-loader')) {
  src = src.replace('</style>', loaderCss + '\n</style>');
}

// 2. ADD PAGE LOADER HTML RIGHT AFTER <body>
const loaderHtml = `
<!-- Fullscreen Official Brand Page Loader -->
<div id="pageLoader" class="page-loader">
  <div class="loader-content">
    <div class="loader-mark-wrap">
      <img src="mark.png" alt="Pink or Brown Mark" class="loader-mark">
    </div>
    <img src="logo.png" alt="Pink or Brown" class="loader-logo">
    <div class="loader-bar-wrap">
      <div class="loader-bar" id="loaderBar"></div>
    </div>
    <span class="loader-text">Pink or Brown · Club</span>
  </div>
</div>
`;

if (!src.includes('id="pageLoader"')) {
  src = src.replace('<body>', '<body>\n' + loaderHtml);
}

// 3. UPDATE HERO IN viewHome TO INCLUDE OFFICIAL ANIMATED LOGO
const oldFrontHero = `<section class="front-hero">
    <div>
      <h1>Celebrating boobs and the <span class="pk">amazing</span> <span class="bn">connections</span> they create</h1>`;

const newFrontHero = `<section class="front-hero">
    <div>
      <div class="hero-brand-wrap">
        <img src="logo.png" alt="Pink or Brown Official" class="hero-official-logo">
      </div>
      <h1>Celebrating boobs and the <span class="pk">amazing</span> <span class="bn">connections</span> they create</h1>`;

if (src.includes(oldFrontHero)) {
  src = src.replace(oldFrontHero, newFrontHero);
  console.log('✓ Added official transparent logo to Hero');
}

// 4. UPDATE HEADER AND FOOTER BRAND INITIALIZATION
src = src.replace(
  `$('#brandLink').innerHTML = ic('brand-sticker','logo');`,
  `$('#brandLink').innerHTML = '<img src="logo.png" alt="Pink or Brown" class="nav-official-logo">';`
);
src = src.replace(
  `$('#footBrand').innerHTML = ic('brand-sticker','logo');`,
  `$('#footBrand').innerHTML = '<img src="logo.png" alt="Pink or Brown" class="foot-official-logo">';`
);

// 5. UPDATE pitch FOR AUTH TO SHOW LOGO
const oldPitch = `<div class="pitch"><div style="display:flex;gap:10px;align-items:center">\${ic('wordmark-sticker','','').replace('class="ic ','style="height:120px;width:auto" class="ic ')}\${ic('p-b-heart','','').replace('class="ic ','style="height:90px;width:auto" class="ic ')}</div>`;
const newPitch = `<div class="pitch"><div><img src="logo.png" alt="Pink or Brown" class="pitch-official-logo"></div>`;

if (src.includes(oldPitch)) {
  src = src.replace(oldPitch, newPitch);
  console.log('✓ Added official transparent logo to Auth Pitch');
}

// 6. ADD LOADER & HERO LOGO GSAP ANIMATION LOGIC BEFORE </script>
const loaderScript = `
// Page Loader GSAP Execution
function runPageLoader(){
  const loader = document.getElementById('pageLoader');
  if(!loader) return;
  const bar = document.getElementById('loaderBar');
  const mark = document.querySelector('.loader-mark');
  const logo = document.querySelector('.loader-logo');

  if(window.gsap && !reduced()){
    const tl = gsap.timeline();
    tl.fromTo(mark, 
        { scale: 0, rotate: -180, opacity: 0 }, 
        { scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.8)' }
      )
      .fromTo(logo, 
        { opacity: 0, y: 14, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out' }, 
        '-=0.25'
      )
      .to(bar, 
        { width: '100%', duration: 0.65, ease: 'power2.inOut' }, 
        '-=0.3'
      )
      .to(mark, 
        { scale: 1.12, rotate: 360, duration: 0.5, ease: 'power1.inOut' }, 
        '-=0.15'
      )
      .to(loader, {
        opacity: 0,
        scale: 1.04,
        duration: 0.45,
        ease: 'power3.inOut',
        onComplete: () => {
          loader.classList.add('loaded');
          loader.style.display = 'none';
        }
      });
  } else {
    setTimeout(() => {
      if(loader){
        loader.classList.add('loaded');
        loader.style.display = 'none';
      }
    }, 700);
  }
}

if (document.readyState === 'complete') {
  runPageLoader();
} else {
  window.addEventListener('load', runPageLoader);
}
`;

src = src.replace("window.addEventListener('hashchange', route);", loaderScript + "\nwindow.addEventListener('hashchange', route);");

// Write files
fs.writeFileSync(path.join(__dirname, '..', 'index.html'), src, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'club.html'), src, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'Pink or Brown · Club.html'), src, 'utf8');
console.log('✓ Successfully injected Page Loader and Official Transparent Animated Logos!');
