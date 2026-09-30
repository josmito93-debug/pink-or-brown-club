const fs = require('fs');
const path = require('path');

const inlineSvg = `<svg id="loaderSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 79" class="loader-svg-animated" aria-label="Pink or Brown">
<path class="svg-letter" fill="#ffffff" d="M 132.04 38.63 L 149.35 18.71 A 3.29 3.28 39.8 0 1 153.89 18.30 L 154.06 18.43 A 2.96 2.96 0.0 0 1 154.52 22.74 L 144.02 34.89 A 0.32 0.32 0.0 0 0 144.18 35.41 Q 153.31 37.64 157.18 46.24 Q 158.63 49.48 158.62 55.98 Q 158.61 61.52 158.48 65.88 A 3.28 3.27 -0.8 0 1 155.39 69.05 L 155.25 69.06 A 2.93 2.93 0.0 0 1 152.15 66.29 C 151.94 62.21 153.18 52.75 150.86 48.11 C 148.54 43.46 144.06 41.23 138.75 41.40 A 1.14 1.13 -70.3 0 0 137.95 41.78 L 132.13 48.48 A 1.45 1.42 65.5 0 0 1 131.79 49.41 L 131.79 65.98 A 3.06 3.06 0.0 0 1 128.56 69.03 L 128.31 69.01 A 2.99 2.99 0.0 0 1 125.33 66.02 L 125.32 8.65 A 3.17 3.16 -1.1 0 1 128.37 5.49 L 128.67 5.48 A 2.87 2.87 0.0 0 1 131.81 8.35 L 131.79 38.54 A 0.14 0.14 0.0 0 0 132.04 38.63 Z"/>
<circle class="svg-dot-i" fill="#ffffff" cx="61.52" cy="16.84" r="3.24"/>
<path class="svg-letter" fill="#ffffff" d="M 311.39 28.01 L 311.41 28.16 A 2.95 2.94 -9.2 0 1 309.01 31.49 Q 297.68 33.49 297.67 45.26 Q 297.67 54.77 297.68 65.61 A 3.07 3.06 0.4 0 1 294.56 68.68 L 294.44 68.68 A 3.11 3.11 0.0 0 1 291.38 65.58 Q 291.33 48.12 291.33 48.04 Q 291.11 41.05 292.13 38.04 C 294.50 31.08 300.72 25.77 307.98 25.26 A 3.22 3.22 0.0 0 1 311.39 28.01 Z"/>
<path class="svg-letter" fill="#ffffff" d="M 250.11 32.62 C 266.26 17.23 292.13 32.93 286.90 54.27 C 283.71 67.31 268.67 75.27 255.89 69.01 Q 247.79 65.05 244.34 56.53 Q 242.92 53.03 242.97 45.89 Q 243.07 30.41 243.03 26.14 A 0.26 0.26 0.0 0 1 243.29 25.87 L 249.30 25.87 A 0.26 0.26 0.0 0 1 249.56 26.13 L 249.56 32.38 A 0.33 0.32 68.3 0 0 250.11 32.62 Z M 281.18 48.87 A 15.82 15.82 0.0 0 0 265.36 33.05 A 15.82 15.82 0.0 0 0 249.54 48.87 A 15.82 15.82 0.0 0 0 265.36 64.69 A 15.82 15.82 0.0 0 0 281.18 48.87 Z"/>
<path class="svg-letter" fill="#ffffff" d="M 467.77 32.20 C 459.62 32.20 452.15 38.81 452.05 46.99 Q 451.91 59.64 451.89 65.64 A 3.02 3.02 0.0 0 1 448.79 68.64 L 448.64 68.64 A 3.20 3.20 0.0 0 1 445.52 65.54 Q 445.51 65.10 445.42 51.89 Q 445.36 43.69 447.14 39.60 C 450.71 31.36 458.54 25.71 467.78 25.72 C 477.01 25.72 484.84 31.38 488.41 39.62 Q 490.17 43.71 490.11 51.92 Q 490.01 65.13 490.00 65.57 A 3.20 3.20 0.0 0 1 486.87 68.66 L 486.72 68.66 A 3.02 3.02 0.0 0 1 483.62 65.65 Q 483.61 59.66 483.48 47.01 C 483.39 38.82 475.93 32.21 467.77 32.20 Z"/>
<path class="svg-letter" fill="#ffffff" d="M 95.07 26.05 C 104.31 26.05 112.14 31.71 115.72 39.96 Q 117.49 44.05 117.43 52.26 Q 117.33 65.48 117.32 65.92 A 3.21 3.21 0.0 0 1 114.19 69.02 L 114.04 69.02 A 3.02 3.02 0.0 0 1 110.94 66.01 Q 110.93 60.01 110.79 47.35 C 110.70 39.16 103.23 32.54 95.07 32.54 C 86.91 32.54 79.43 39.15 79.34 47.35 Q 79.20 60.00 79.19 66.00 A 3.02 3.02 0.0 0 1 76.09 69.01 L 75.94 69.01 A 3.21 3.21 0.0 0 1 72.81 65.91 Q 72.80 65.47 72.70 52.25 Q 72.64 44.04 74.42 39.95 C 77.99 31.70 85.83 26.05 95.07 26.05 Z"/>
<rect class="svg-letter" fill="#ffffff" x="-3.23" y="-21.47" transform="translate(61.55,47.69) rotate(0.1)" width="6.46" height="42.94" rx="3.16"/>
<path class="svg-letter" fill="#ffffff" d="M 355.45 48.86 A 22.25 22.25 0.0 0 1 333.20 71.11 A 22.25 22.25 0.0 0 1 310.95 48.86 A 22.25 22.25 0.0 0 1 333.20 26.61 A 22.25 22.25 0.0 0 1 355.45 48.86 Z M 348.98 48.86 A 15.81 15.81 0.0 0 0 333.17 33.05 A 15.81 15.81 0.0 0 0 317.36 48.86 A 15.81 15.81 0.0 0 0 333.17 64.67 A 15.81 15.81 0.0 0 0 348.98 48.86 Z"/>
<path class="svg-letter" fill="#ffffff" d="M 16.54 65.49 L 16.49 71.73 A 0.26 0.26 0.0 0 1 16.23 71.99 L 10.23 71.95 A 0.26 0.26 0.0 0 1 9.98 71.67 Q 10.05 67.41 10.06 51.96 Q 10.06 44.83 11.50 41.35 Q 15.01 32.87 23.12 28.97 C 35.93 22.82 50.88 30.87 53.97 43.91 C 59.04 65.25 33.10 80.74 17.09 65.26 A 0.33 0.32 -67.8 0 0 16.54 65.49 Z M 48.20 49.19 A 15.81 15.81 0.0 0 0 32.39 33.38 A 15.81 15.81 0.0 0 0 16.58 49.19 A 15.81 15.81 0.0 0 0 32.39 65.00 A 15.81 15.81 0.0 0 0 48.20 49.19 Z"/>
<path class="svg-letter" fill="#ffffff" d="M 400.50 27.80 Q 402.83 27.80 403.47 30.17 A 4.61 4.13 38.5 0 1 403.60 30.95 Q 403.83 33.77 403.60 46.81 Q 403.47 54.40 407.93 59.22 C 417.90 70.02 435.49 62.80 435.43 48.26 Q 435.39 38.23 435.44 30.99 A 3.10 3.09 -90.0 0 1 438.51 27.91 L 438.67 27.91 A 3.09 3.08 88.2 0 1 441.78 30.83 Q 441.85 32.10 441.83 47.77 C 441.82 56.92 437.26 64.66 429.25 68.60 C 419.55 73.38 409.53 70.45 402.15 62.86 Q 401.40 62.10 400.50 62.10 Q 399.59 62.10 398.85 62.86 C 391.47 70.45 381.45 73.38 371.75 68.60 C 363.74 64.66 359.18 56.91 359.17 47.76 Q 359.15 32.09 359.22 30.82 A 3.09 3.08 -88.1 0 1 362.33 27.91 L 362.49 27.91 A 3.10 3.09 -90.0 0 1 365.56 30.99 Q 365.61 38.23 365.57 48.26 C 365.51 62.80 383.10 70.02 393.07 59.22 Q 397.53 54.40 397.40 46.81 Q 397.17 33.77 397.40 30.95 A 4.61 4.13 -38.5 0 1 397.53 30.17 Q 398.17 27.80 400.50 27.80 Z"/>
<circle class="svg-dot-brown" fill="#93624a" cx="265.43" cy="48.80" r="7.63"/>
<circle class="svg-dot-pink" fill="#ff6099" cx="32.47" cy="49.04" r="7.51"/>
<path class="svg-letter" fill="#ffffff" d="M 214.93 65.79 A 1.38 1.38 0.0 0 1 213.55 67.16 L 213.05 67.16 A 1.42 1.42 0.0 0 1 211.63 65.77 Q 211.44 55.24 211.71 53.37 Q 212.68 46.54 219.95 44.96 A 1.63 1.63 0.0 0 1 221.93 46.55 L 221.93 47.12 A 1.09 1.09 0.0 0 1 221.00 48.20 Q 214.90 49.15 214.93 55.51 Q 214.95 60.95 214.93 65.79 Z"/>
<path class="svg-letter" fill="#ffffff" d="M 209.69 57.07 A 11.42 11.42 0.0 0 1 198.27 68.49 A 11.42 11.42 0.0 0 1 186.85 57.07 A 11.42 11.42 0.0 0 1 198.27 45.65 A 11.42 11.42 0.0 0 1 209.69 57.07 Z M 206.32 57.07 A 8.06 8.06 0.0 0 0 198.26 49.01 A 8.06 8.06 0.0 0 0 190.20 57.07 A 8.06 8.06 0.0 0 0 198.26 65.13 A 8.06 8.06 0.0 0 0 206.32 57.07 Z"/>
</svg>`;

const files = ['index.html', 'club.html', 'Pink or Brown · Club.html'];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  let src = fs.readFileSync(filePath, 'utf8');

  // 1. UPDATE CSS: REMOVE pill wrappers, style brand links clean
  const oldLoaderCssStart = src.indexOf('/* ===== Page Loader & Official Transparent Logos ===== */');
  const oldLoaderCssEnd = src.indexOf('</style>', oldLoaderCssStart);

  const cleanCss = `/* ===== Page Loader & Official Transparent Logos ===== */
.page-loader{position:fixed;inset:0;background:#180F0D;z-index:99999;display:flex;align-items:center;justify-content:center;transition:opacity .5s cubic-bezier(.4,0,.2,1), visibility .5s}
.page-loader.loaded{opacity:0;visibility:hidden;pointer-events:none}
.loader-content{display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center;padding:24px}
.loader-svg-animated{width:min(440px,90vw);height:auto;display:block;filter:drop-shadow(0 12px 36px rgba(255,96,153,.35))}
.loader-bar-wrap{width:220px;height:4px;background:rgba(255,255,255,.14);border-radius:99px;overflow:hidden;margin-top:6px}
.loader-bar{height:100%;width:0%;background:linear-gradient(90deg,#FF6099,#93624A);border-radius:99px}
.loader-text{font-size:.82rem;font-weight:700;color:#C2A69C;letter-spacing:.08em;text-transform:uppercase}

.nav-official-logo{height:34px;width:auto;display:block;transition:transform .2s}
.nav-official-logo:hover{transform:scale(1.04)}
.foot-official-logo{height:38px;width:auto;display:block}
`;

  if (oldLoaderCssStart !== -1 && oldLoaderCssEnd !== -1) {
    src = src.substring(0, oldLoaderCssStart) + cleanCss + src.substring(oldLoaderCssEnd);
  }

  // 2. INJECT INLINE SVG INTO PAGE LOADER
  const oldLoaderHtmlStart = src.indexOf('<!-- Fullscreen Official Brand Page Loader -->');
  const oldLoaderHtmlEnd = src.indexOf('</div>\n</div>', oldLoaderHtmlStart) + '</div>\n</div>'.length;

  const newLoaderHtml = `<!-- Fullscreen Official Brand Page Loader -->
<div id="pageLoader" class="page-loader">
  <div class="loader-content">
    ${inlineSvg}
    <div class="loader-bar-wrap">
      <div class="loader-bar" id="loaderBar"></div>
    </div>
    <span class="loader-text">Pink or Brown · Club</span>
  </div>
</div>`;

  if (oldLoaderHtmlStart !== -1) {
    src = src.substring(0, oldLoaderHtmlStart) + newLoaderHtml + src.substring(oldLoaderHtmlEnd);
    console.log(`✓ Injected animated inline SVG into ${file}`);
  }

  // 3. REMOVE ANY TAG / BADGE / PILL ABOVE THE HERO <h1>
  // The hero section must start directly with <h1> without any tag or pill div above it
  const oldFrontHeroStart = src.indexOf('<section class="front-hero">');
  const heroHeadingStart = src.indexOf('<h1>Celebrating boobs', oldFrontHeroStart);
  
  if (oldFrontHeroStart !== -1 && heroHeadingStart !== -1) {
    const newHeroFront = `<section class="front-hero">
    <div>
      `;
    src = src.substring(0, oldFrontHeroStart) + newHeroFront + src.substring(heroHeadingStart);
    console.log(`✓ Removed tag above hero in ${file}`);
  }

  // 4. CLEAN HEADER & FOOTER: NO PILL WRAPPERS, LOGO FREESTANDING
  src = src.replace(
    `$('#brandLink').innerHTML = '<span class="nav-brand-pill"><img src="logo-white.svg" alt="Pink or Brown" class="nav-official-logo"></span>';`,
    `$('#brandLink').innerHTML = '<img src="logo.svg" alt="Pink or Brown" class="nav-official-logo">';`
  );
  src = src.replace(
    `$('#footBrand').innerHTML = '<span class="nav-brand-pill"><img src="logo-white.svg" alt="Pink or Brown" class="foot-official-logo"></span>';`,
    `$('#footBrand').innerHTML = '<img src="logo.svg" alt="Pink or Brown" class="foot-official-logo">';`
  );
  src = src.replace(
    `<div class="pitch"><div style="margin-bottom:14px"><span class="nav-brand-pill" style="padding:10px 22px;display:inline-flex"><img src="logo-white.svg" alt="Pink or Brown" style="height:36px;width:auto"></span></div>`,
    `<div class="pitch"><div style="margin-bottom:14px"><img src="logo.svg" alt="Pink or Brown" style="height:44px;width:auto;display:block"></div>`
  );

  // 5. UPDATE runPageLoader() FOR INLINE SVG ANIMATION
  const oldRunLoaderStart = src.indexOf('function runPageLoader(){');
  const oldRunLoaderEnd = src.indexOf('if (document.readyState ===', oldRunLoaderStart);

  const newRunLoader = `function runPageLoader(){
  const loader = document.getElementById('pageLoader');
  if(!loader) return;
  const bar = document.getElementById('loaderBar');
  const letters = document.querySelectorAll('#loaderSvg .svg-letter');
  const dotPink = document.querySelector('#loaderSvg .svg-dot-pink');
  const dotBrown = document.querySelector('#loaderSvg .svg-dot-brown');
  const iDot = document.querySelector('#loaderSvg .svg-dot-i');

  if(window.gsap && !reduced()){
    const tl = gsap.timeline();
    // 1. Stagger letters pop-in with smooth scale & spring
    tl.fromTo(letters, 
        { scale: 0, opacity: 0, y: 18, transformOrigin: 'center center' }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.6, stagger: 0.035, ease: 'back.out(2)' }
      )
      // 2. The i dot pops in
      .fromTo(iDot,
        { scale: 0, opacity: 0, y: -10, transformOrigin: 'center center' },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2.5)' },
        '-=0.3'
      )
      // 3. Pink & Brown dots spring in with elastic bounce
      .fromTo([dotPink, dotBrown],
        { scale: 0, opacity: 0, transformOrigin: 'center center' },
        { scale: 1.45, opacity: 1, duration: 0.55, stagger: 0.14, ease: 'elastic.out(1, 0.5)' },
        '-=0.35'
      )
      .to([dotPink, dotBrown],
        { scale: 1, duration: 0.25, ease: 'power2.out' }
      )
      // 4. Loading bar fills in sync
      .to(bar, 
        { width: '100%', duration: 0.6, ease: 'power2.inOut' }, 
        '-=0.4'
      )
      // 5. Heartbeat pulse on pink dot
      .to(dotPink, {
        scale: 1.25,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
      }, '-=0.2')
      // 6. Smooth curtain wipe reveal
      .to(loader, {
        yPercent: -100,
        duration: 0.65,
        ease: 'power4.inOut',
        onComplete: () => {
          loader.classList.add('loaded');
          loader.style.display = 'none';
        }
      }, '+=0.1');
  } else {
    setTimeout(() => {
      if(loader){
        loader.classList.add('loaded');
        loader.style.display = 'none';
      }
    }, 700);
  }
}
`;

  if (oldRunLoaderStart !== -1 && oldRunLoaderEnd !== -1) {
    src = src.substring(0, oldRunLoaderStart) + newRunLoader + src.substring(oldRunLoaderEnd);
    console.log(`✓ Updated GSAP SVG animation logic in ${file}`);
  }

  fs.writeFileSync(filePath, src, 'utf8');
  console.log(`✓ Finished processing ${file}`);
});
