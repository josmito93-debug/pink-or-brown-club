const fs = require('fs');
const path = require('path');

const files = ['index.html', 'club.html', 'Pink or Brown · Club.html'];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  let src = fs.readFileSync(filePath, 'utf8');

  // 1. UPDATE CSS FOR WHITE LOGO PILLS & DARK CLEAN LOADER
  const oldLoaderCssStart = src.indexOf('/* ===== Page Loader & Official Transparent Logos ===== */');
  const oldLoaderCssEnd = src.indexOf('</style>', oldLoaderCssStart);

  const newLoaderCss = `/* ===== Page Loader & Official Transparent Logos ===== */
.page-loader{position:fixed;inset:0;background:#1D1310;z-index:99999;display:flex;align-items:center;justify-content:center;transition:opacity .5s cubic-bezier(.4,0,.2,1), visibility .5s}
.page-loader.loaded{opacity:0;visibility:hidden;pointer-events:none}
.loader-content{display:flex;flex-direction:column;align-items:center;gap:18px;text-align:center;padding:24px}
.loader-logo{width:min(340px,85vw);height:auto;display:block;filter:drop-shadow(0 8px 24px rgba(255,96,153,.25))}
.loader-bar-wrap{width:200px;height:4px;background:rgba(255,255,255,.15);border-radius:99px;overflow:hidden;margin-top:6px}
.loader-bar{height:100%;width:0%;background:linear-gradient(90deg,#FF6099,#93624A);border-radius:99px}
.loader-text{font-size:.82rem;font-weight:700;color:#C2A69C;letter-spacing:.08em;text-transform:uppercase}

.hero-brand-wrap{margin-bottom:22px;display:inline-block}
.hero-logo-pill{background:#1D1310;padding:12px 28px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 12px 32px rgba(29,19,16,.28);border:1px solid rgba(255,255,255,.12);transition:transform .2s, box-shadow .2s}
.hero-logo-pill:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(255,96,153,.25)}
.hero-official-logo{height:52px;max-width:100%;width:auto;display:block}

.nav-brand-pill{background:#1D1310;padding:7px 18px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(29,19,16,.2);border:1px solid rgba(255,255,255,.08);transition:transform .15s}
.nav-brand-pill:hover{transform:scale(1.03)}
.nav-official-logo{height:28px;width:auto;display:block}
.foot-official-logo{height:32px;width:auto;display:block}
.pitch-official-logo{height:46px;max-width:100%;width:auto;display:block}

@media (max-width:720px){
  .hero-official-logo{height:38px}
  .hero-logo-pill{padding:9px 20px}
  .nav-official-logo{height:24px}
  .nav-brand-pill{padding:5px 14px}
  .loader-logo{width:260px}
}
`;

  if (oldLoaderCssStart !== -1 && oldLoaderCssEnd !== -1) {
    src = src.substring(0, oldLoaderCssStart) + newLoaderCss + src.substring(oldLoaderCssEnd);
  }

  // 2. CLEAN PAGE LOADER HTML: REMOVE mark.png (THE X LOGO) COMPLETELY
  const oldLoaderHtmlStart = src.indexOf('<!-- Fullscreen Official Brand Page Loader -->');
  const oldLoaderHtmlEnd = src.indexOf('</div>\n</div>', oldLoaderHtmlStart) + '</div>\n</div>'.length;

  const newLoaderHtml = `<!-- Fullscreen Official Brand Page Loader -->
<div id="pageLoader" class="page-loader">
  <div class="loader-content">
    <img src="logo-white.svg" alt="Pink or Brown" class="loader-logo">
    <div class="loader-bar-wrap">
      <div class="loader-bar" id="loaderBar"></div>
    </div>
    <span class="loader-text">Pink or Brown · Club</span>
  </div>
</div>`;

  if (oldLoaderHtmlStart !== -1) {
    src = src.substring(0, oldLoaderHtmlStart) + newLoaderHtml + src.substring(oldLoaderHtmlEnd);
    console.log(`✓ Cleaned page loader HTML in ${file} (removed X logo)`);
  }

  // 3. UPDATE HERO LOGO TO USE WHITE-LETTERS LOGO IN PILL
  const oldHeroBadgeStart = src.indexOf('<div class="hero-brand-wrap">');
  if (oldHeroBadgeStart !== -1) {
    const oldHeroBadgeEnd = src.indexOf('</div>', oldHeroBadgeStart) + 6;
    const newHeroBadge = `<div class="hero-brand-wrap">
        <div class="hero-logo-pill">
          <img src="logo-white.svg" alt="Pink or Brown Official" class="hero-official-logo">
        </div>
      </div>`;
    src = src.substring(0, oldHeroBadgeStart) + newHeroBadge + src.substring(oldHeroBadgeEnd);
  }

  // 4. UPDATE HEADER AND FOOTER BRAND INITIALIZATION TO USE WHITE LOGO IN PILL
  src = src.replace(
    `$('#brandLink').innerHTML = '<img src="logo.png" alt="Pink or Brown" class="nav-official-logo">';`,
    `$('#brandLink').innerHTML = '<span class="nav-brand-pill"><img src="logo-white.svg" alt="Pink or Brown" class="nav-official-logo"></span>';`
  );
  src = src.replace(
    `$('#brandLink').innerHTML = '<img src="logo.svg" alt="Pink or Brown" class="nav-official-logo">';`,
    `$('#brandLink').innerHTML = '<span class="nav-brand-pill"><img src="logo-white.svg" alt="Pink or Brown" class="nav-official-logo"></span>';`
  );
  src = src.replace(
    `$('#footBrand').innerHTML = '<img src="logo.png" alt="Pink or Brown" class="foot-official-logo">';`,
    `$('#footBrand').innerHTML = '<span class="nav-brand-pill"><img src="logo-white.svg" alt="Pink or Brown" class="foot-official-logo"></span>';`
  );
  src = src.replace(
    `$('#footBrand').innerHTML = '<img src="logo.svg" alt="Pink or Brown" class="foot-official-logo">';`,
    `$('#footBrand').innerHTML = '<span class="nav-brand-pill"><img src="logo-white.svg" alt="Pink or Brown" class="foot-official-logo"></span>';`
  );

  // 5. UPDATE PITCH LOGO
  src = src.replace(
    `<div class="pitch"><div><img src="logo.png" alt="Pink or Brown" class="pitch-official-logo"></div>`,
    `<div class="pitch"><div style="margin-bottom:14px"><span class="nav-brand-pill" style="padding:10px 22px;display:inline-flex"><img src="logo-white.svg" alt="Pink or Brown" style="height:36px;width:auto"></span></div>`
  );
  src = src.replace(
    `<div class="pitch"><div><img src="logo.svg" alt="Pink or Brown" class="pitch-official-logo"></div>`,
    `<div class="pitch"><div style="margin-bottom:14px"><span class="nav-brand-pill" style="padding:10px 22px;display:inline-flex"><img src="logo-white.svg" alt="Pink or Brown" style="height:36px;width:auto"></span></div>`
  );

  // 6. UPDATE runPageLoader() GSAP LOGIC (NO X MARK ANIMATION)
  const oldRunLoaderStart = src.indexOf('function runPageLoader(){');
  const oldRunLoaderEnd = src.indexOf('if (document.readyState ===', oldRunLoaderStart);

  const newRunLoader = `function runPageLoader(){
  const loader = document.getElementById('pageLoader');
  if(!loader) return;
  const bar = document.getElementById('loaderBar');
  const logo = document.querySelector('.loader-logo');

  if(window.gsap && !reduced()){
    const tl = gsap.timeline();
    tl.fromTo(logo, 
        { scale: 0.85, opacity: 0, y: 15 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)' }
      )
      .to(bar, 
        { width: '100%', duration: 0.65, ease: 'power2.inOut' }, 
        '-=0.2'
      )
      .to(loader, {
        opacity: 0,
        scale: 1.03,
        duration: 0.45,
        ease: 'power3.inOut',
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
    console.log(`✓ Updated runPageLoader() in ${file}`);
  }

  fs.writeFileSync(filePath, src, 'utf8');
  console.log(`✓ Successfully updated ${file} with official white logo & clean loader`);
});
