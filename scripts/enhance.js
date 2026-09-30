const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Pink or Brown · Club.html');
let src = fs.readFileSync(filePath, 'utf8');

// 1. Add GSAP to head if not present
if (!src.includes('gsap.min.js')) {
  src = src.replace('</head>', '<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>\n</head>');
}

// 2. Enhance burstAt with GSAP physics
const oldBurst = `function burstAt(x, y, n = 26){
  if(reduced()) return;
  for(let i=0;i<n;i++){
    const c = document.createElement('i'); c.className = 'confetti';
    const a = Math.random()*Math.PI*2, r = 60 + Math.random()*110;
    c.style.cssText = \`left:\${x}px;top:\${y}px;background:\${CONF[i%CONF.length]};--dx:\${Math.cos(a)*r}px;--dy:\${Math.sin(a)*r - 40}px;--rot:\${Math.random()*720-360}deg;\${i%3?'':'border-radius:50%'}\`;
    document.body.appendChild(c); setTimeout(() => c.remove(), 1100);
  }
}`;

const newBurst = `function burstAt(x, y, n = 26){
  if(reduced()) return;
  for(let i=0;i<n;i++){
    const c = document.createElement('i'); c.className = 'confetti';
    const a = Math.random()*Math.PI*2, r = 60 + Math.random()*110;
    const dx = Math.cos(a)*r, dy = Math.sin(a)*r - 40;
    const rot = Math.random()*720 - 360;
    c.style.cssText = \`left:\${x}px;top:\${y}px;background:\${CONF[i%CONF.length]};--dx:\${dx}px;--dy:\${dy}px;--rot:\${rot}deg;\${i%3?'':'border-radius:50%'}\`;
    document.body.appendChild(c);
    if(window.gsap){
      gsap.fromTo(c, {x:0, y:0, scale:1, rotation:0, opacity:1}, {x:dx, y:dy, rotation:rot, opacity:0, scale:0.35, duration:0.85 + Math.random()*0.35, ease:'power2.out', onComplete:() => c.remove()});
    } else {
      setTimeout(() => c.remove(), 1100);
    }
  }
}`;

if (src.includes(oldBurst)) {
  src = src.replace(oldBurst, newBurst);
  console.log('Replaced burstAt with GSAP');
} else {
  console.warn('burstAt match not found');
}

// 3. Enhance celebrate
const oldCelebrate = `function celebrate(el, pts){
  const [x, y] = centerOf(el);
  burstAt(x, y);
  if(pts){ const f = document.createElement('div'); f.className = 'floatpts'; f.textContent = (pts > 0 ? '+' : '') + fmt(pts) + ' pts'; f.style.left = x + 'px'; f.style.top = y + 'px'; document.body.appendChild(f); setTimeout(() => f.remove(), 1500); }
  setTimeout(() => { const p = document.querySelector('.pill-pts'); if(p){ p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); } }, 150);
}`;

const newCelebrate = `function celebrate(el, pts){
  const [x, y] = centerOf(el);
  burstAt(x, y);
  if(pts){
    const f = document.createElement('div'); f.className = 'floatpts';
    f.textContent = (pts > 0 ? '+' : '') + fmt(pts) + ' pts';
    f.style.left = x + 'px'; f.style.top = y + 'px';
    document.body.appendChild(f);
    if(window.gsap && !reduced()){
      gsap.fromTo(f, {opacity:0, y:10, scale:0.5}, {opacity:1, y:-30, scale:1.2, duration:0.3, ease:'back.out(2)', onComplete:() => {
        gsap.to(f, {opacity:0, y:-80, duration:0.7, ease:'power2.in', onComplete:() => f.remove()});
      }});
    } else {
      setTimeout(() => f.remove(), 1500);
    }
  }
  if(window.gsap && !reduced()){
    const pills = document.querySelectorAll('.pill-pts');
    if(pills.length) gsap.fromTo(pills, {scale:1}, {scale:1.24, duration:0.18, yoyo:true, repeat:1, ease:'power1.inOut'});
  } else {
    setTimeout(() => { const p = document.querySelector('.pill-pts'); if(p){ p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); } }, 150);
  }
}`;

if (src.includes(oldCelebrate)) {
  src = src.replace(oldCelebrate, newCelebrate);
  console.log('Replaced celebrate with GSAP');
} else {
  console.warn('celebrate match not found');
}

// 4. Enhance modal
const oldModal = `function modal(html, cls = ''){
  const d = $('#dlg'); if(d.open) d.close();
  d.className = cls; d.innerHTML = html; d.showModal();
  d.querySelectorAll('[data-close]').forEach(b => b.onclick = () => d.close());
  d.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => d.close()));
  return d;
}`;

const newModal = `function modal(html, cls = ''){
  const d = $('#dlg'); if(d.open) d.close();
  d.className = cls; d.innerHTML = html; d.showModal();
  d.querySelectorAll('[data-close]').forEach(b => b.onclick = () => d.close());
  d.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => d.close()));
  if(window.gsap && !reduced()){
    gsap.fromTo(d, {scale:0.88, opacity:0, y:18}, {scale:1, opacity:1, y:0, duration:0.3, ease:'back.out(1.5)'});
  }
  return d;
}`;

if (src.includes(oldModal)) {
  src = src.replace(oldModal, newModal);
  console.log('Replaced modal with GSAP');
} else {
  console.warn('modal match not found');
}

// 5. Enhance openCart and closeCart
const oldOpenCart = `function openCart(){ renderCart(); $('#drawer').classList.add('on'); $('#drawer').setAttribute('aria-hidden','false'); $('#scrim').classList.add('on'); document.body.classList.add('lock'); setTimeout(() => $('#drawer .x')?.focus(), 50); }`;
const oldCloseCart = `function closeCart(){ $('#drawer').classList.remove('on'); $('#drawer').setAttribute('aria-hidden','true'); $('#scrim').classList.remove('on'); document.body.classList.remove('lock'); }`;

const newOpenCart = `function openCart(){
  renderCart();
  const dr = $('#drawer'); const sc = $('#scrim');
  dr.classList.add('on'); dr.setAttribute('aria-hidden','false');
  sc.classList.add('on'); document.body.classList.add('lock');
  if(window.gsap && !reduced()){
    gsap.fromTo(dr, {x:360, opacity:0.85}, {x:0, opacity:1, duration:0.35, ease:'power3.out', clearProps:'transform,opacity'});
    gsap.fromTo(sc, {opacity:0}, {opacity:1, duration:0.25});
  }
  setTimeout(() => $('#drawer .x')?.focus(), 50);
}`;

const newCloseCart = `function closeCart(){
  const dr = $('#drawer'); const sc = $('#scrim');
  if(window.gsap && !reduced() && dr.classList.contains('on')){
    gsap.to(dr, {x:360, opacity:0, duration:0.22, ease:'power3.in', onComplete:() => {
      dr.classList.remove('on'); dr.setAttribute('aria-hidden','true');
      gsap.set(dr, {clearProps:'all'});
    }});
    gsap.to(sc, {opacity:0, duration:0.2, onComplete:() => {
      sc.classList.remove('on');
      gsap.set(sc, {clearProps:'all'});
    }});
  } else {
    dr.classList.remove('on'); dr.setAttribute('aria-hidden','true'); sc.classList.remove('on');
  }
  document.body.classList.remove('lock');
}`;

if (src.includes(oldOpenCart) && src.includes(oldCloseCart)) {
  src = src.replace(oldOpenCart, newOpenCart);
  src = src.replace(oldCloseCart, newCloseCart);
  console.log('Replaced openCart and closeCart with GSAP');
} else {
  console.warn('openCart/closeCart match not found');
}

// 6. Enhance route() with smooth GSAP transition and staggered card entrances
const oldRouteEnd = `  updateCartBadge();
  if(!u && ['home','s','shop','product','community'].includes(r) && !popupShown) scheduleTimedPopup();
}`;

const newRouteEnd = `  updateCartBadge();
  if(!u && ['home','s','shop','product','community'].includes(r) && !popupShown) scheduleTimedPopup();
  if(window.gsap && !reduced()){
    gsap.fromTo(v, {opacity:0, y:12}, {opacity:1, y:0, duration:0.35, ease:'power2.out', clearProps:'transform,opacity'});
    const cards = v.querySelectorAll('.pcard, .reveal, .snap, .reward, .stk, .event, .card');
    if(cards.length > 0){
      gsap.from(Array.from(cards).slice(0, 16), {
        opacity:0, y:20, duration:0.45, stagger:0.04, ease:'power2.out', clearProps:'all'
      });
    }
    const stickers = v.querySelectorAll('.collage .ic');
    stickers.forEach((s, idx) => {
      gsap.to(s, {
        y: (idx % 2 === 0 ? 6 : -6),
        rotation: (idx % 2 === 0 ? 2.5 : -2.5),
        duration: 2.5 + idx * 0.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }
}`;

if (src.includes(oldRouteEnd)) {
  src = src.replace(oldRouteEnd, newRouteEnd);
  console.log('Replaced route() with GSAP');
} else {
  console.warn('route() match not found');
}

// 6.5. Enhance viewDashboard with animated ring and count-up
const oldBindNav = `  bindClubNav();
  const lk = $('#link'); if(lk) lk.onclick = () => linkFlow(u);`;

const newBindNav = `  bindClubNav();
  if(window.gsap && !reduced()){
    const circle = v.querySelector('.ring circle:last-child');
    if(circle){
      const r = 88, c = 2*Math.PI*r, targetOff = c*(1 - Math.min(1,pct));
      gsap.fromTo(circle, {strokeDashoffset: c}, {strokeDashoffset: targetOff, duration: 1.2, ease: 'power3.out'});
    }
    const numEl = v.querySelector('.ring .num');
    if(numEl){
      const counter = { val: 0 };
      gsap.to(counter, {
        val: u.lifetime,
        duration: 1.2,
        ease: 'power3.out',
        onUpdate: () => { numEl.textContent = fmt(Math.round(counter.val)); }
      });
    }
  }
  const lk = $('#link'); if(lk) lk.onclick = () => linkFlow(u);`;

if (src.includes(oldBindNav)) {
  src = src.replace(oldBindNav, newBindNav);
  console.log('Added viewDashboard GSAP ring animation');
} else {
  console.warn('oldBindNav match not found');
}

// 7. Add button interactive feedback at the end before </script>
const oldScriptEnd = `window.addEventListener('hashchange', route);
route();
</script>`;

const newScriptEnd = `window.addEventListener('hashchange', route);
route();

// GSAP interactive button micro-interactions
document.addEventListener('pointerdown', e => {
  const btn = e.target.closest?.('.btn, .sw, .chips button');
  if(btn && window.gsap && !reduced()){
    gsap.to(btn, {scale:0.95, duration:0.12, ease:'power1.out'});
  }
});
document.addEventListener('pointerup', e => {
  const btn = e.target.closest?.('.btn, .sw, .chips button');
  if(btn && window.gsap && !reduced()){
    gsap.to(btn, {scale:1, duration:0.18, ease:'back.out(2)'});
  }
});
</script>`;

if (src.includes(oldScriptEnd)) {
  src = src.replace(oldScriptEnd, newScriptEnd);
  console.log('Added GSAP micro-interactions');
} else {
  console.warn('Script end match not found');
}

// Verify syntax
const scriptStart = src.indexOf('<script>') + '<script>'.length;
const scriptEnd = src.lastIndexOf('</script>');
const jsCode = src.substring(scriptStart, scriptEnd);
try {
  new Function(jsCode);
  console.log('All JS syntax checks passed successfully!');
  fs.writeFileSync(path.join(__dirname, '..', 'Pink or Brown · Club.html'), src, 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'club.html'), src, 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'index.html'), src, 'utf8');
  console.log('Successfully written Pink or Brown · Club.html, club.html, and index.html!');
} catch (e) {
  console.error('Syntax error during enhancement:', e);
  process.exit(1);
}
