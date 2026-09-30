const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let src = fs.readFileSync(filePath, 'utf8');

// 1. ADD CSS FOR AVATAR, AGE BADGE, AND REFINED AUTH
const extraCss = `
/* ===== Enhanced Production Auth & Profile Styling ===== */
.av.has-img{overflow:hidden;background:var(--tile);border:2px solid var(--line)}
.av .av-img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}
.avatar-picker{display:flex;align-items:center;gap:18px;margin-bottom:18px;padding:16px;background:var(--bg);border-radius:18px;border:1.5px dashed var(--line);transition:border-color .2s}
.avatar-picker:hover{border-color:var(--pink)}
.avatar-preview{position:relative;width:76px;height:76px;border-radius:50%;background:var(--surface);border:2px solid var(--pink);overflow:hidden;display:grid;place-content:center;flex:none;cursor:pointer;box-shadow:0 4px 12px rgba(224,96,126,.2)}
.avatar-preview img{width:100%;height:100%;object-fit:cover;display:block}
.avatar-preview .cam-icon{position:absolute;inset:0;background:rgba(30,15,10,.5);display:grid;place-content:center;color:#fff;opacity:0;transition:opacity .2s;font-size:1.1rem}
.avatar-preview:hover .cam-icon{opacity:1}
.avatar-actions{display:flex;flex-direction:column;gap:6px}
.avatar-actions b{font-size:.94rem}
.avatar-actions p{font-size:.8rem;color:var(--muted)}
.avatar-btn{background:var(--surface);border:1.5px solid var(--line);border-radius:999px;padding:6px 14px;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;width:fit-content;transition:all .2s}
.avatar-btn:hover{background:var(--pink-soft);border-color:var(--pink);color:var(--ink)}
.age-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:.78rem;font-weight:700;margin-top:6px;width:fit-content}
.age-badge.valid{background:color-mix(in srgb,var(--ok) 18%,transparent);color:var(--ok)}
.age-badge.invalid{background:color-mix(in srgb,var(--pink) 18%,transparent);color:var(--pink)}
.pw-wrap{position:relative}
.pw-wrap input{padding-right:48px}
.pw-toggle{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:0;cursor:pointer;color:var(--muted);font-size:.85rem;font-weight:600;padding:6px}
.pw-toggle:hover{color:var(--ink)}
.team-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.team-card{display:flex;flex-direction:column;gap:6px;padding:14px;border:2px solid var(--line);border-radius:16px;cursor:pointer;background:var(--surface);transition:border-color .2s, transform .15s}
.team-card:hover{transform:translateY(-2px)}
.team-card.selected.tp{border-color:var(--pink);background:color-mix(in srgb,var(--pink) 10%,transparent)}
.team-card.selected.tb{border-color:var(--brown);background:color-mix(in srgb,var(--brown) 10%,transparent)}
.team-card-top{display:flex;align-items:center;gap:8px;font-weight:700;font-size:.95rem}
.team-card small{color:var(--muted);font-size:.8rem}
`;

if (!src.includes('avatar-picker')) {
  src = src.replace('</style>', extraCss + '\n</style>');
}

// 2. UPDATE avatar(m, lg) TO RENDER AVATAR IMAGE WHEN AVAILABLE
const oldAvatar = `const avatar = (m, lg) => \`<span class="av\${lg?' lg':''}" style="background:\${avColor(m.team)}">\${esc(initials(m.name))}</span>\`;`;
const newAvatar = `const avatar = (m, lg) => (m && m.avatar_url)
  ? \`<span class="av\${lg?' lg':''} has-img"><img src="\${esc(m.avatar_url)}" alt="\${esc(m.name)}" class="av-img"></span>\`
  : \`<span class="av\${lg?' lg':''}" style="background:\${avColor(m?.team || 'pink')}">\${esc(initials(m?.name || 'Member'))}</span>\`;`;

if (src.includes(oldAvatar)) {
  src = src.replace(oldAvatar, newAvatar);
  console.log('Updated avatar() function to support profile photos');
}

// 3. UPDATE newUser() TO STORE avatar_url AND bio
const oldNewUser = `function newUser(o){ return Object.assign({id:uid(), createdAt:Date.now(), lifetime:0, balance:0, igLinked:false, igCode:null, badges:[], log:[], subs:[], redemptions:[], chats:null, blocked:[], liked:[]}, o); }`;
const newNewUser = `function newUser(o){ return Object.assign({id:uid(), createdAt:Date.now(), lifetime:0, balance:0, igLinked:false, igCode:null, badges:[], log:[], subs:[], redemptions:[], chats:null, blocked:[], liked:[], avatar_url:null, bio:''}, o); }`;

if (src.includes(oldNewUser)) {
  src = src.replace(oldNewUser, newNewUser);
  console.log('Updated newUser() object schema');
}

// 4. REDESIGN viewLogin WITHOUT DEMO TRACES
const oldViewLogin = src.substring(
  src.indexOf('function viewLogin(v){'),
  src.indexOf('function viewForgot(v){')
);

const newViewLogin = `function viewLogin(v){
  v.innerHTML = \`<section class="auth">\${pitch}
    <div class="card" style="box-shadow:0 12px 36px rgba(46,26,18,.08)"><h2 style="margin-bottom:6px">Sign in to your account</h2>
      <p class="hint" style="margin-bottom:20px">Access your club points, rewards, messages and monthly challenges.</p>
      <form id="f" novalidate><div id="e"></div>
        <div class="field"><label for="em">Email address</label><input id="em" type="email" placeholder="you@example.com" autocomplete="email" required></div>
        <div class="field"><label for="pw">Password</label>
          <div class="pw-wrap"><input id="pw" type="password" placeholder="Enter your password" autocomplete="current-password" required>
            <button type="button" class="pw-toggle" id="pwTog" aria-label="Show password">Show</button></div></div>
        <button class="btn block pink glow" type="submit" style="margin-top:10px">Sign In</button></form>
      <p class="alt"><a href="#/forgot">Forgot password?</a> · Don't have an account? <a href="#/register"><b>Join the club</b></a></p></div></section>\`;

  const pwInput = $('#pw');
  const pwTog = $('#pwTog');
  if(pwTog && pwInput){
    pwTog.onclick = () => {
      const isText = pwInput.type === 'text';
      pwInput.type = isText ? 'password' : 'text';
      pwTog.textContent = isText ? 'Show' : 'Hide';
    };
  }

  $('#f').onsubmit = async e => {
    e.preventDefault();
    const em = $('#em').value.trim().toLowerCase(), pw = $('#pw').value;
    if(!em || !pw){
      $('#e').innerHTML = '<div class="err">Please enter both your email and password.</div>';
      return;
    }
    const btn = $('#f button[type=submit]');
    if(btn){ btn.disabled = true; btn.textContent = 'Signing in…'; }

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
          toast('Welcome back, ' + u.name.split(' ')[0]);
          afterAuth();
          return;
        }
      } catch(err){
        console.warn('Supabase auth check:', err.message);
        $('#e').innerHTML = \`<div class="err">\${esc(err.message || "Invalid login credentials.")}</div>\`;
        if(btn){ btn.disabled = false; btn.textContent = 'Sign In'; }
        return;
      }
    }
    const u = users().find(x => x.email === em);
    if(!u || u.pass !== await hash(pw, u.salt)){
      $('#e').innerHTML = \`<div class="err">That email and password don't match. Check both and try again.</div>\`;
      if(btn){ btn.disabled = false; btn.textContent = 'Sign In'; }
      return;
    }
    store.set('session', {uid:u.id, at:Date.now()});
    const got = claimPending(u); if(got) saveMe(u);
    toast(got ? \`Logged in · +\${got} points from your order\` : 'Welcome back, ' + u.name.split(' ')[0]);
    afterAuth();
  };
}
`;

src = src.replace(oldViewLogin, newViewLogin);
console.log('Replaced viewLogin with sleek production design');

// 5. REDESIGN viewForgot
const oldViewForgot = src.substring(
  src.indexOf('function viewForgot(v){'),
  src.indexOf('function viewRegister(v){')
);

const newViewForgot = `function viewForgot(v){
  v.innerHTML = \`<section class="auth">\${pitch}<div class="card" style="box-shadow:0 12px 36px rgba(46,26,18,.08)"><h2 style="margin-bottom:6px">Reset your password</h2>
    <p class="hint" style="margin-bottom:20px">Enter your email and we'll send you instructions to set a new password.</p>
    <form id="f"><div class="field"><label for="em">Email address</label><input id="em" type="email" placeholder="you@example.com" required></div><button class="btn block pink glow">Send reset link</button></form>
    <p class="alt"><a href="#/login">Back to Sign In</a></p></div></section>\`;
  $('#f').onsubmit = e => { e.preventDefault(); toast('Password reset link sent — please check your inbox'); location.hash = '#/login'; };
}
`;

src = src.replace(oldViewForgot, newViewForgot);
console.log('Replaced viewForgot');

// 6. REDESIGN viewRegister WITH PHOTO UPLOAD, LIVE AGE BADGE, AND TEAM CARDS
const oldViewRegister = src.substring(
  src.indexOf('function viewRegister(v){'),
  src.indexOf('function ringSVG(pct){')
);

const newViewRegister = `function viewRegister(v){
  const pre = store.get('prefill', '');
  const pend = store.get('pendingPts', null);
  let selectedAvatar = null;
  let selectedTeam = 'pink';

  v.innerHTML = \`<section class="auth">\${pitch}
    <div class="card" style="box-shadow:0 12px 36px rgba(46,26,18,.08)"><h2 style="margin-bottom:6px">Join Pink or Brown · Club</h2>
      <p class="hint" style="margin-bottom:20px"><b>100 welcome points</b>\${pend?\` + \${fmt(pend.pts)} from your order\`:''} awarded instantly.</p>
      
      <form id="f" novalidate><div id="e"></div>

        <!-- Profile Photo Uploader -->
        <div class="avatar-picker">
          <label class="avatar-preview" for="avFile" title="Click to upload profile photo">
            <img id="avImg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23F9D3DC'/%3E%3Ctext x='50' y='58' font-size='32' text-anchor='middle' fill='%23E0607E'%3E📷%3C/text%3E%3C/svg%3E" alt="Avatar Preview">
            <span class="cam-icon">✎</span>
          </label>
          <div class="avatar-actions">
            <b>Profile Photo <span class="hint">(optional)</span></b>
            <p>Upload a photo or avatar for your club profile</p>
            <label class="avatar-btn" for="avFile">
              <span>Choose photo</span>
              <input type="file" id="avFile" accept="image/*" style="display:none">
            </label>
          </div>
        </div>

        <div class="row2">
          <div class="field"><label for="nm">Full Name</label><input id="nm" type="text" placeholder="Your name" autocomplete="name" required></div>
          <div class="field"><label for="ig">Instagram Handle</label><input id="ig" type="text" placeholder="@yourhandle" autocomplete="off" required></div>
        </div>

        <div class="field"><label for="em">Email Address</label><input id="em" type="email" placeholder="you@example.com" autocomplete="email" value="\${esc(pre)}" required></div>

        <div class="row2">
          <div class="field"><label for="pw">Password</label>
            <div class="pw-wrap"><input id="pw" type="password" placeholder="At least 8 characters" autocomplete="new-password" minlength="8" required>
              <button type="button" class="pw-toggle" id="pwTogReg">Show</button></div></div>
          <div class="field"><label for="dob">Date of Birth</label>
            <input id="dob" type="date" required>
            <div id="ageBadge"></div>
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

        <div class="field"><label for="ref">Referral Code <span class="hint">(optional)</span></label><input id="ref" type="text" placeholder="Friend's @handle"></div>

        <label class="check"><input type="checkbox" id="tos"> <span>I confirm that I am 18 years of age or older, accept the terms and community rules, and support the cause.</span></label>
        
        <button class="btn block pink glow" type="submit" id="regBtn">Create Account & Claim 100 Pts</button>
      </form>
      <p class="alt">Already a member? <a href="#/login"><b>Sign In</b></a></p></div></section>\`;

  // Password toggle
  const pwReg = $('#pw'), pwTogReg = $('#pwTogReg');
  if(pwTogReg && pwReg){
    pwTogReg.onclick = () => {
      const isText = pwReg.type === 'text';
      pwReg.type = isText ? 'password' : 'text';
      pwTogReg.textContent = isText ? 'Show' : 'Hide';
    };
  }

  // Live Age Calculation & Verification
  const dobInput = $('#dob'), ageBadge = $('#ageBadge');
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
  v.querySelectorAll('.team-card').forEach(card => {
    card.onclick = () => {
      v.querySelectorAll('.team-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedTeam = card.dataset.team;
    };
  });

  // Avatar Upload with Auto-Resize to lightweight WebP/JPEG dataURL
  const fileInput = $('#avFile'), avImg = $('#avImg');
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
          canvas.width = size;
          canvas.height = size;
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

  // Form Submission
  $('#f').onsubmit = async e => {
    e.preventDefault();
    const name = $('#nm').value.trim(),
          handle = $('#ig').value.trim().replace(/^@/, '').toLowerCase(),
          email = $('#em').value.trim().toLowerCase(),
          pw = $('#pw').value,
          dob = $('#dob').value,
          ref = $('#ref').value.trim().replace(/^@/, '').toLowerCase();

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
    if(!$('#tos').checked) errs.push('Please confirm you are 18 or older and accept the community rules.');

    if(errs.length){
      $('#e').innerHTML = \`<div class="err">\${errs.map(esc).join('<br>')}</div>\`;
      $('#e').scrollIntoView({behavior:'smooth', block:'center'});
      return;
    }

    const regBtn = $('#regBtn');
    if(regBtn){ regBtn.disabled = true; regBtn.textContent = 'Creating account…'; }

    let supabaseUid = null;
    if(window.POB_BACKEND?.isLive()){
      try {
        const sbRes = await window.POB_BACKEND.signUp({
          email,
          password: pw,
          name,
          handle,
          team: selectedTeam,
          dob,
          referral: ref,
          avatar_url: selectedAvatar
        });
        if(sbRes?.user) supabaseUid = sbRes.user.id;
      } catch(err){
        console.warn('Supabase signup notice:', err.message);
      }
    }

    const salt = uid() + uid();
    const u = newUser({
      id: supabaseUid || uid(),
      name,
      handle,
      email,
      team: selectedTeam,
      dob,
      avatar_url: selectedAvatar,
      salt,
      pass: await hash(pw, salt)
    });

    award(u, 'signup');
    const got = claimPending(u);
    const referrer = ref && list.find(x => x.handle === ref);
    if(referrer) award(referrer, 'referral', {note:'@'+handle});

    list.push(u);
    saveUsers(list);
    store.del('prefill');
    store.set('session', {uid:u.id, at:Date.now()});

    toast(\`Welcome to the club, \${name.split(' ')[0]}! +100 welcome points\`);
    afterAuth();
    setTimeout(() => celebrateXY(innerWidth/2, innerHeight/3, 100 + got), 300);
  };
}
`;

src = src.replace(oldViewRegister, newViewRegister);
console.log('Replaced viewRegister with high-end registration experience');

// 7. ENHANCE viewProfile TO ALLOW CHANGING PROFILE PHOTO AND VIEWING VERIFIED AGE
const oldViewProfile = src.substring(
  src.indexOf('function viewProfile(v, u){'),
  src.indexOf('/* =========================================================\n   BOOT')
);

const newViewProfile = `function viewProfile(v, u){
  const orders = store.get('orders', []).filter(o => o.uid === u.id);
  const userAge = u.dob ? ageOf(u.dob) : null;
  let newAvatarUrl = u.avatar_url || null;

  v.innerHTML = clubNav('profile') + \`<h1 style="font-size:clamp(2rem,4vw,2.8rem);margin-bottom:22px">Profile & Account</h1>
    <div class="grid">
      <section class="card c6">
        <h2 style="margin-bottom:14px">Your Profile</h2>
        <form id="pf">
          <!-- Avatar section -->
          <div class="avatar-picker" style="margin-bottom:20px">
            <label class="avatar-preview" for="profAvFile">
              <img id="profAvImg" src="\${u.avatar_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23F9D3DC'/%3E%3Ctext x='50' y='58' font-size='32' text-anchor='middle' fill='%23E0607E'%3E📷%3C/text%3E%3C/svg%3E"}" alt="Profile avatar">
              <span class="cam-icon">✎</span>
            </label>
            <div class="avatar-actions">
              <b>Change Photo</b>
              <p>JPG or PNG for your public member badge</p>
              <label class="avatar-btn" for="profAvFile">
                <span>Upload new photo</span>
                <input type="file" id="profAvFile" accept="image/*" style="display:none">
              </label>
            </div>
          </div>

          <div class="field"><label for="nm">Display Name</label><input id="nm" type="text" value="\${esc(u.name)}"></div>
          <div class="field"><label>Email Address</label><input type="email" value="\${esc(u.email)}" disabled><span class="hint">Managed via Supabase Auth</span></div>
          <div class="row2">
            <div class="field"><label>Instagram</label><input type="text" value="@\${esc(u.handle)}" disabled><span class="hint">\${u.igLinked?'✓ Verified & Linked':'Not linked yet'}</span></div>
            <div class="field"><label>Age Verification</label><input type="text" value="\${userAge ? userAge + ' years old · 18+ verified' : 'Verified 18+'}" disabled></div>
          </div>
          <div class="field"><label>Team</label>
            <div class="team">
              <label><input type="radio" name="team" value="pink" \${u.team==='pink'?'checked':''}><span class="dot p"></span>Team Pink</label>
              <label><input type="radio" name="team" value="brown" \${u.team==='brown'?'checked':''}><span class="dot b"></span>Team Brown</label>
            </div>
          </div>
          <button class="btn pink glow" type="submit" style="margin-top:10px">Save Changes</button>
        </form>
      </section>

      <section class="card c6">
        <h2 style="margin-bottom:10px">Order History</h2>
        \${orders.length ? \`<ul class="list">\${orders.map(o => \`<li><b>\${o.id}</b><span>\${o.items.reduce((a,i)=>a+i.qty,0)} items · \${money(o.total)}</span><span class="when">\${ago(o.at)}</span></li>\`).join('')}</ul>\` : '<p class="empty">No store orders yet. Every purchase earns points toward free merchandise.</p>'}
        <h2 style="margin:24px 0 10px">Membership Security</h2>
        <p class="hint" style="margin-bottom:14px">Member since \${new Date(u.createdAt).toLocaleDateString('en-US',{month:'long',year:'numeric'})}\${u.blocked.length?\` · \${u.blocked.length} blocked\`:''}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          \${u.blocked.length?'<button class="btn ghost small" id="unb">Unblock all</button>':''}
          <button class="btn ghost small" id="del" style="color:var(--pink)">Delete account</button>
        </div>
      </section>
    </div>\`;

  bindClubNav();

  // Photo upload handler in Profile
  const pFile = $('#profAvFile'), pImg = $('#profAvImg');
  if(pFile && pImg){
    pFile.onchange = e => {
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
          newAvatarUrl = canvas.toDataURL('image/jpeg', 0.85);
          pImg.src = newAvatarUrl;
          toast('Photo loaded — click Save Changes to apply');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
  }

  $('#pf').onsubmit = e => {
    e.preventDefault();
    u.name = $('#nm').value.trim() || u.name;
    u.team = document.querySelector('input[name=team]:checked').value;
    if(newAvatarUrl) u.avatar_url = newAvatarUrl;
    saveMe(u);
    toast('Profile updated successfully');
    route();
  };

  const unb = $('#unb');
  if(unb) unb.onclick = () => { u.blocked = []; saveMe(u); toast('Unblocked'); route(); };

  $('#del').onclick = () => {
    const d = modal(\`<h2>Delete your account?</h2><p style="margin:12px 0 20px">Your points, badges, messages and codes will be permanently removed.</p>
      <div style="display:flex;gap:10px"><button class="btn pink" id="yes">Delete account</button><button class="btn ghost" data-close>Cancel</button></div>\`);
    d.querySelector('#yes').onclick = () => {
      saveUsers(users().filter(x => x.id !== u.id));
      store.del('session');
      d.close();
      toast('Account deleted');
      location.hash = '#/';
    };
  };
}
`;

src = src.replace(oldViewProfile, newViewProfile);
console.log('Replaced viewProfile');

// Validate syntax
const scriptStart = src.indexOf('<script>') + '<script>'.length;
const scriptEnd = src.lastIndexOf('</script>');
const jsCode = src.substring(scriptStart, scriptEnd);
try {
  new Function(jsCode);
  console.log('All JS syntax checks passed successfully!');
  fs.writeFileSync(path.join(__dirname, '..', 'index.html'), src, 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'club.html'), src, 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'Pink or Brown · Club.html'), src, 'utf8');
  console.log('Successfully written index.html, club.html, and Pink or Brown · Club.html!');
} catch (e) {
  console.error('Syntax error during update:', e);
  process.exit(1);
}
