const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let src = fs.readFileSync(filePath, 'utf8');

// 1. ADD CSS FOR AUTH MODAL
const modalCss = `
/* ===== Modal Dialog Enhancement ===== */
dialog.auth-modal{max-width:540px;width:calc(100% - 32px);padding:26px;border-radius:26px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 60px rgba(46,26,18,.25)}
dialog.auth-modal::backdrop{background:rgba(29,19,16,.6);backdrop-filter:blur(6px)}
`;

if (!src.includes('dialog.auth-modal')) {
  src = src.replace('</style>', modalCss + '\n</style>');
}

// 2. HERO CTA UPDATE: Change #/s/club to #/register
src = src.replace(
  `\${u ? \`<a class="btn" href="#/dashboard">Go to the club</a>\` : \`<a class="btn" href="#/s/club">Join the club</a>\`}`,
  `\${u ? \`<a class="btn" href="#/dashboard">Go to the club</a>\` : \`<a class="btn pink glow" href="#/register" data-open-register>Join the club</a>\`}`
);

// 3. SECTION #club UPDATE: Change Launching soon form to direct action
const oldClubBand = `<section class="band anchor" id="club" style="border:0">
    <div class="joinband">
      <div><span class="soon-tag">Launching soon</span>\${ic('vip-sticker').replace('class="ic ','style="height:90px;width:auto;display:block;margin-bottom:10px" class="ic ')}<h2>Join the club</h2>
        <p>A club where we celebrate boobs — nipples, colors, shapes and sizes. Whether you're here for fun, support, or to be part of this bold new movement, welcome to the Pink or Brown Club. Create your account and join a vibrant community that celebrates every unique set.</p></div>
      <div>\${u ? \`<p style="margin:0 0 14px">You're already in, \${esc(u.name.split(' ')[0])}. You have \${fmt(u.balance)} points to spend.</p><a class="btn" href="#/dashboard">Go to the club</a>\`
             : \`<ul class="perks" style="color:#fff"><li>100 welcome points</li><li>Early access to every drop</li><li>Free merch and event entry with points</li></ul>
                <form class="jform" id="homeJoin"><input type="email" id="hjem" placeholder="Enter your email" required aria-label="Email"><button class="btn" type="submit">Join the club</button></form>\`}</div>
    </div>
  </section>`;

const newClubBand = `<section class="band anchor" id="club" style="border:0">
    <div class="joinband">
      <div>\${ic('vip-sticker').replace('class="ic ','style="height:90px;width:auto;display:block;margin-bottom:10px" class="ic ')}<h2>Join the club</h2>
        <p>A club where we celebrate boobs — nipples, colors, shapes and sizes. Whether you're here for fun, support, or to be part of this bold new movement, welcome to the Pink or Brown Club. Create your account and join a vibrant community that celebrates every unique set.</p></div>
      <div>\${u ? \`<p style="margin:0 0 14px">You're already in, \${esc(u.name.split(' ')[0])}. You have \${fmt(u.balance)} points to spend.</p><a class="btn" href="#/dashboard">Go to the club</a>\`
             : \`<ul class="perks" style="color:#fff"><li>100 welcome points</li><li>Early access to every drop</li><li>Free merch and event entry with points</li></ul>
                <div style="margin-top:18px"><a class="btn block glow" href="#/register" data-open-register style="background:#fff;color:var(--ink);text-align:center;font-weight:800;font-size:1.05rem">Join the club & claim 100 points</a></div>\`}</div>
    </div>
  </section>`;

if (src.includes(oldClubBand)) {
  src = src.replace(oldClubBand, newClubBand);
  console.log('Updated #club band CTA');
}

// 4. FOOTER LINK UPDATE
src = src.replace('<li><a href="#/s/club">Join the club</a></li>', '<li><a href="#/register" data-open-register>Join the club</a></li>');

// 5. NAVBAR "Join the club" BUTTON: Always show on mobile too
src = src.replace(
  `: \`\${link('login','Log in', ['login','forgot'].includes(r))}<a class="btn small pink hide-sm" href="#/register" style="margin-left:4px">Join the club</a>\`);`,
  `: \`\${link('login','Log in', ['login','forgot'].includes(r))}<a class="btn small pink" href="#/register" data-open-register style="margin-left:4px">Join the club</a>\`);`
);

// 6. DEFINE registerFormHTML, bindRegisterForm, openRegisterModal, and openLoginModal
const authHelpers = `
/* =========================================================
   AUTH MODALS & REUSABLE FORMS
   ========================================================= */
function registerFormHTML(isModal = false){
  const prefix = isModal ? 'm_' : '';
  const pre = store.get('prefill', '');
  return \`
    <form id="\${prefix}regForm" novalidate>
      <div id="\${prefix}regErr"></div>

      <!-- Profile Photo Uploader -->
      <div class="avatar-picker">
        <label class="avatar-preview" for="\${prefix}avFile" title="Click to upload profile photo">
          <img id="\${prefix}avImg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23F9D3DC'/%3E%3Ctext x='50' y='58' font-size='32' text-anchor='middle' fill='%23E0607E'%3E📷%3C/text%3E%3C/svg%3E" alt="Avatar Preview">
          <span class="cam-icon">✎</span>
        </label>
        <div class="avatar-actions">
          <b>Profile Photo <span class="hint">(optional)</span></b>
          <p>Upload a photo or avatar for your club profile</p>
          <label class="avatar-btn" for="\${prefix}avFile">
            <span>Choose photo</span>
            <input type="file" id="\${prefix}avFile" accept="image/*" style="display:none">
          </label>
        </div>
      </div>

      <div class="row2">
        <div class="field"><label for="\${prefix}nm">Full Name</label><input id="\${prefix}nm" type="text" placeholder="Your name" autocomplete="name" required></div>
        <div class="field"><label for="\${prefix}ig">Instagram Handle</label><input id="\${prefix}ig" type="text" placeholder="@yourhandle" autocomplete="off" required></div>
      </div>

      <div class="field"><label for="\${prefix}em">Email Address</label><input id="\${prefix}em" type="email" placeholder="you@example.com" autocomplete="email" value="\${esc(pre)}" required></div>

      <div class="row2">
        <div class="field"><label for="\${prefix}pw">Password</label>
          <div class="pw-wrap"><input id="\${prefix}pw" type="password" placeholder="At least 8 characters" autocomplete="new-password" minlength="8" required>
            <button type="button" class="pw-toggle" id="\${prefix}pwTog">Show</button></div></div>
        <div class="field"><label for="\${prefix}dob">Date of Birth</label>
          <input id="\${prefix}dob" type="date" required>
          <div id="\${prefix}ageBadge"></div>
        </div>
      </div>

      <!-- Pick Your Team Cards -->
      <div class="field" style="margin-top:4px"><label>Choose Your Team</label>
        <div class="team-cards">
          <div class="team-card selected tp" data-team="pink">
            <div class="team-card-top"><span class="dot p"></span><span>Team Pink</span></div>
            <small>Bold, vibrant & celebratory. Dedicated to joyful body positivity.</small>
          </div>
          <div class="team-card tb" data-team="brown">
            <div class="team-card-top"><span class="dot b"></span><span>Team Brown</span></div>
            <small>Warm, earthy & empowering. Rooted in community strength.</small>
          </div>
        </div>
      </div>

      <div class="field"><label for="\${prefix}ref">Referral Code <span class="hint">(optional)</span></label><input id="\${prefix}ref" type="text" placeholder="Friend's @handle"></div>

      <label class="check"><input type="checkbox" id="\${prefix}tos"> <span>I confirm that I am 18 years of age or older, accept the terms and community rules, and support the cause.</span></label>
      
      <button class="btn block pink glow" type="submit" id="\${prefix}regBtn">Create Account & Claim 100 Pts</button>
    </form>
    <p class="alt" style="margin-top:14px">Already a member? <button type="button" class="linkbtn" id="\${prefix}toLog" style="font-weight:700;color:var(--pink);padding:0">Sign In</button></p>
  \`;
}

function bindRegisterForm(root, isModal = false){
  const prefix = isModal ? 'm_' : '';
  let selectedAvatar = null;
  let selectedTeam = 'pink';

  // Password toggle
  const pwInput = root.querySelector('#' + prefix + 'pw');
  const pwTog = root.querySelector('#' + prefix + 'pwTog');
  if(pwTog && pwInput){
    pwTog.onclick = () => {
      const isText = pwInput.type === 'text';
      pwInput.type = isText ? 'password' : 'text';
      pwTog.textContent = isText ? 'Show' : 'Hide';
    };
  }

  // Live Age Calculation & Verification
  const dobInput = root.querySelector('#' + prefix + 'dob');
  const ageBadge = root.querySelector('#' + prefix + 'ageBadge');
  if(dobInput && ageBadge){
    const updateAge = () => {
      const val = dobInput.value;
      if(!val){ ageBadge.innerHTML = ''; return; }
      const age = ageOf(val);
      if(age >= 18){
        ageBadge.innerHTML = \`<span class="age-badge valid">✓ \${age} years old · Verified 18+</span>\`;
      } else {
        ageBadge.innerHTML = \`<span class="age-badge invalid">✕ \${age} years old · Must be 18+ to join</span>\`;
      }
    };
    dobInput.onchange = updateAge;
    dobInput.oninput = updateAge;
  }

  // Interactive Team Selection Cards
  root.querySelectorAll('.team-card').forEach(card => {
    card.onclick = () => {
      root.querySelectorAll('.team-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedTeam = card.dataset.team;
    };
  });

  // Avatar Upload with Auto-Resize
  const fileInput = root.querySelector('#' + prefix + 'avFile');
  const avImg = root.querySelector('#' + prefix + 'avImg');
  if(fileInput && avImg){
    fileInput.onchange = e => {
      const file = e.target.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 200;
          canvas.width = size; canvas.height = size;
          const ctx = canvas.getContext('2d');
          const minD = Math.min(img.width, img.height);
          const sx = (img.width - minD)/2, sy = (img.height - minD)/2;
          ctx.drawImage(img, sx, sy, minD, minD, 0, 0, size, size);
          selectedAvatar = canvas.toDataURL('image/jpeg', 0.85);
          avImg.src = selectedAvatar;
          toast('Photo loaded!');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
  }

  // Switch to login
  const toLogBtn = root.querySelector('#' + prefix + 'toLog');
  if(toLogBtn){
    toLogBtn.onclick = () => {
      if(isModal){
        $('#dlg')?.close();
        openLoginModal();
      } else {
        location.hash = '#/login';
      }
    };
  }

  // Submit Handler
  const form = root.querySelector('#' + prefix + 'regForm');
  const errBox = root.querySelector('#' + prefix + 'regErr');
  form.onsubmit = async e => {
    e.preventDefault();
    const name = root.querySelector('#' + prefix + 'nm').value.trim(),
          handle = root.querySelector('#' + prefix + 'ig').value.trim().replace(/^@/, '').toLowerCase(),
          email = root.querySelector('#' + prefix + 'em').value.trim().toLowerCase(),
          pw = root.querySelector('#' + prefix + 'pw').value,
          dob = root.querySelector('#' + prefix + 'dob').value,
          ref = root.querySelector('#' + prefix + 'ref').value.trim().replace(/^@/, '').toLowerCase();

    const list = users();
    const errs = [];
    if(!name) errs.push('Please enter your full name.');
    if(!/^[a-z0-9._]{2,30}$/.test(handle)) errs.push('Instagram handle must use letters, numbers, dots and underscores only.');
    if(!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) errs.push('Please enter a valid email address.');
    else if(list.some(u => u.email === email)) errs.push('An account with this email already exists. Sign in instead.');
    if(list.some(u => u.handle === handle)) errs.push('That Instagram handle is already registered.');
    if(pw.length < 8) errs.push('Password must be at least 8 characters long.');
    if(!dob) errs.push('Please provide your date of birth.');
    else if(ageOf(dob) < 18) errs.push('You must be 18 or older to join the Pink or Brown Club.');
    if(!root.querySelector('#' + prefix + 'tos').checked) errs.push('Please confirm you are 18 or older and accept the community rules.');

    if(errs.length){
      errBox.innerHTML = \`<div class="err">\${errs.map(esc).join('<br>')}</div>\`;
      errBox.scrollIntoView({behavior:'smooth', block:'center'});
      return;
    }

    const regBtn = root.querySelector('#' + prefix + 'regBtn');
    if(regBtn){ regBtn.disabled = true; regBtn.textContent = 'Creating account…'; }

    let supabaseUid = null;
    if(window.POB_BACKEND?.isLive()){
      try {
        const sbRes = await window.POB_BACKEND.signUp({
          email, password: pw, name, handle, team: selectedTeam, dob, referral: ref, avatar_url: selectedAvatar
        });
        if(sbRes?.user) supabaseUid = sbRes.user.id;
      } catch(err){
        console.warn('Supabase signup notice:', err.message);
      }
    }

    const salt = uid() + uid();
    const u = newUser({
      id: supabaseUid || uid(),
      name, handle, email, team: selectedTeam, dob, avatar_url: selectedAvatar, salt, pass: await hash(pw, salt)
    });

    award(u, 'signup');
    const got = claimPending(u);
    const referrer = ref && list.find(x => x.handle === ref);
    if(referrer) award(referrer, 'referral', {note:'@'+handle});

    list.push(u);
    saveUsers(list);
    store.del('prefill');
    store.set('session', {uid:u.id, at:Date.now()});

    if(isModal && $('#dlg')?.open) $('#dlg').close();

    toast(\`Welcome to the club, \${name.split(' ')[0]}! +100 welcome points\`);
    location.hash = '#/dashboard';
    setTimeout(() => celebrateXY(innerWidth/2, innerHeight/3, 100 + got), 300);
  };
}

function openRegisterModal(){
  if(me()) return;
  const d = modal(\`
    <div style="position:relative">
      <button class="closex" data-close aria-label="Close" style="position:absolute;top:-4px;right:-4px;background:var(--line);color:var(--ink);width:32px;height:32px;border-radius:50%;display:grid;place-content:center;border:0;cursor:pointer;font-size:1.1rem;z-index:2">×</button>
      <div style="margin-bottom:16px;padding-right:36px">
        <h2 style="font-size:1.6rem;margin-bottom:4px">Join Pink or Brown · Club</h2>
        <p class="hint">100 welcome points awarded immediately upon joining.</p>
      </div>
      \${registerFormHTML(true)}
    </div>
  \`, 'auth-modal');
  bindRegisterForm(d, true);
}

function openLoginModal(){
  if(me()) return;
  const d = modal(\`
    <div style="position:relative">
      <button class="closex" data-close aria-label="Close" style="position:absolute;top:-4px;right:-4px;background:var(--line);color:var(--ink);width:32px;height:32px;border-radius:50%;display:grid;place-content:center;border:0;cursor:pointer;font-size:1.1rem;z-index:2">×</button>
      <div style="margin-bottom:16px;padding-right:36px">
        <h2 style="font-size:1.6rem;margin-bottom:4px">Welcome Back</h2>
        <p class="hint">Sign in to access your club points, rewards and messages.</p>
      </div>
      <form id="m_loginForm" novalidate>
        <div id="m_loginErr"></div>
        <div class="field"><label for="m_em">Email address</label><input id="m_em" type="email" placeholder="you@example.com" autocomplete="email" required></div>
        <div class="field"><label for="m_pw">Password</label>
          <div class="pw-wrap"><input id="m_pw" type="password" placeholder="Enter your password" autocomplete="current-password" required>
            <button type="button" class="pw-toggle" id="m_pwTog">Show</button></div></div>
        <button class="btn block pink glow" type="submit" id="m_loginBtn" style="margin-top:10px">Sign In</button>
      </form>
      <p class="alt" style="margin-top:14px">Don't have an account? <button type="button" class="linkbtn" id="m_toRegBtn" style="font-weight:700;color:var(--pink);padding:0">Join the club</button></p>
    </div>
  \`, 'auth-modal');

  const pwIn = d.querySelector('#m_pw'), pwT = d.querySelector('#m_pwTog');
  if(pwT && pwIn){
    pwT.onclick = () => {
      const isT = pwIn.type === 'text';
      pwIn.type = isT ? 'password' : 'text';
      pwT.textContent = isT ? 'Show' : 'Hide';
    };
  }

  const toReg = d.querySelector('#m_toRegBtn');
  if(toReg) toReg.onclick = () => { d.close(); openRegisterModal(); };

  d.querySelector('#m_loginForm').onsubmit = async e => {
    e.preventDefault();
    const em = d.querySelector('#m_em').value.trim().toLowerCase(), pw = d.querySelector('#m_pw').value;
    const errBox = d.querySelector('#m_loginErr');
    if(!em || !pw){ errBox.innerHTML = '<div class="err">Please enter your email and password.</div>'; return; }
    
    if(window.POB_BACKEND?.isLive()){
      try {
        const res = await window.POB_BACKEND.signIn({ email: em, password: pw });
        if(res && res.user){
          let u = users().find(x => x.id === res.user.id || x.email === em);
          if(!u){
            const prof = await window.POB_BACKEND.getCurrentUser().catch(() => null);
            u = newUser({
              id: res.user.id,
              name: prof?.name || res.user.user_metadata?.name || 'Member',
              handle: prof?.handle || res.user.user_metadata?.handle || 'member',
              email: em,
              team: prof?.team || res.user.user_metadata?.team || 'pink',
              dob: prof?.dob || res.user.user_metadata?.dob || '2000-01-01',
              avatar_url: prof?.avatar_url || res.user.user_metadata?.avatar_url || null,
              lifetime: prof?.lifetime_points || 100,
              balance: prof?.balance_points || 100
            });
            const list = users(); list.push(u); saveUsers(list);
          }
          store.set('session', {uid:u.id, at:Date.now()});
          d.close();
          toast('Welcome back, ' + u.name.split(' ')[0]);
          location.hash = '#/dashboard';
          return;
        }
      } catch(err){
        errBox.innerHTML = \`<div class="err">\${esc(err.message || "Invalid credentials.")}</div>\`;
        return;
      }
    }
    const u = users().find(x => x.email === em);
    if(!u || u.pass !== await hash(pw, u.salt)){
      errBox.innerHTML = '<div class="err">That email and password do not match.</div>';
      return;
    }
    store.set('session', {uid:u.id, at:Date.now()});
    d.close();
    toast('Welcome back, ' + u.name.split(' ')[0]);
    location.hash = '#/dashboard';
  };
}
`;

// Insert authHelpers before viewLogin
src = src.replace('function viewLogin(v){', authHelpers + '\nfunction viewLogin(v){');

// 7. SIMPLIFY viewRegister to use registerFormHTML(false) and bindRegisterForm(v, false)
const oldViewRegStart = src.indexOf('function viewRegister(v){');
const oldViewRegEnd = src.indexOf('function ringSVG(pct){');
const newViewRegisterSimple = `function viewRegister(v){
  const pend = store.get('pendingPts', null);
  v.innerHTML = \`<section class="auth">\${pitch}
    <div class="card" style="box-shadow:0 12px 36px rgba(46,26,18,.08)">
      <h2 style="margin-bottom:6px">Join Pink or Brown · Club</h2>
      <p class="hint" style="margin-bottom:20px"><b>100 welcome points</b>\${pend?\` + \${fmt(pend.pts)} from your order\`:''} awarded instantly.</p>
      \${registerFormHTML(false)}
    </div></section>\`;
  bindRegisterForm(v, false);
}
`;

src = src.substring(0, oldViewRegStart) + newViewRegisterSimple + src.substring(oldViewRegEnd);
console.log('Updated viewRegister to share registerFormHTML & bindRegisterForm');

// 8. ADD GLOBAL CLICK INTERCEPTOR FOR "JOIN THE CLUB" AND "SIGN IN" BUTTONS
const globalClickHook = `
// Intercept all "Join the club" clicks to open registration modal immediately
document.addEventListener('click', e => {
  const joinBtn = e.target.closest?.('a[href="#/register"], a[href="#/s/club"], [data-open-register], #cartJoin, #gj, #homeJoin button');
  if(joinBtn && !me()){
    e.preventDefault();
    openRegisterModal();
    return;
  }
  const loginBtn = e.target.closest?.('a[href="#/login"], [data-open-login]');
  if(loginBtn && !me() && !location.hash.includes('login')){
    e.preventDefault();
    openLoginModal();
    return;
  }
});
`;

src = src.replace("window.addEventListener('hashchange', route);", globalClickHook + "\nwindow.addEventListener('hashchange', route);");

// Write files
fs.writeFileSync(path.join(__dirname, '..', 'index.html'), src, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'club.html'), src, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'Pink or Brown · Club.html'), src, 'utf8');
console.log('Successfully updated index.html, club.html, and Pink or Brown · Club.html with Instant Registration Modal!');
