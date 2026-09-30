const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let src = fs.readFileSync(filePath, 'utf8');

// 1. ADD CSS FOR STICKER TRAY & COMPOSER
const stickerCss = `
/* ===== Chat Stickers & Composer Enhancements ===== */
.composer-wrap{display:flex;flex-direction:column;border-top:1px solid var(--line);background:var(--surface)}
.sticker-tray{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:8px;padding:12px 14px;background:var(--bg);border-bottom:1px solid var(--line);max-height:160px;overflow-y:auto}
.stk-chip{background:var(--surface);border:1.5px solid var(--line);border-radius:12px;padding:6px;cursor:pointer;display:grid;place-items:center;transition:all .15s}
.stk-chip:hover{transform:scale(1.1);border-color:var(--pink)}
.stk-chip.emoji{font-size:1.4rem}
.stk-chip .ic{width:36px;height:36px}
.stk-toggle-btn{background:none;border:1.5px solid var(--line);border-radius:999px;padding:8px 14px;cursor:pointer;font-size:.86rem;font-weight:700;display:flex;align-items:center;gap:6px;color:var(--ink);transition:all .15s;flex:none}
.stk-toggle-btn:hover,.stk-toggle-btn.active{border-color:var(--pink);background:var(--pink-soft);color:var(--pink)}
.chat-sticker-visual{display:block;max-width:110px;height:auto;margin:2px 0}
.chat-sticker-visual svg{max-height:80px;width:auto}
.msg.has-sticker{background:none!important;padding:4px!important;border:none!important}
`;

if (!src.includes('composer-wrap')) {
  src = src.replace('</style>', stickerCss + '\n</style>');
}

// 2. UPDATE drawChat TO AUTO-SELECT FIRST CHAT & PROVIDE STICKER TRAY
const oldDrawChat = src.substring(
  src.indexOf('function drawChat(){'),
  src.indexOf('/* =========================================================\n   CLUB: PROFILE')
);

const newDrawChat = `function drawChat(){
  const u = me(); const box = $('#chat'); if(!box || !u) return;
  const ids = Object.keys(u.chats).filter(id => member(id) && !u.blocked.includes(id))
    .sort((a,b) => (u.chats[b].msgs.at(-1)?.at || Date.now()) - (u.chats[a].msgs.at(-1)?.at || Date.now()));
  
  // ALWAYS auto-select active conversation so message field & history are visible immediately
  if(!activeChat && ids.length){
    activeChat = ids[0];
  }

  if(activeChat && u.chats[activeChat]?.unread){ u.chats[activeChat].unread = false; saveMe(u); }
  const peer = activeChat ? member(activeChat) : null;
  box.classList.toggle('open', !!peer);

  box.innerHTML = \`<div class="convos">\${ids.length ? ids.map(id => { const m = member(id), t = u.chats[id], last = t.msgs.at(-1);
      const isStk = last && last.text.startsWith('[sticker:');
      const previewText = last ? (last.from===u.id?'You: ':'') + (isStk ? '✨ Sticker' : esc(last.text)) : 'Say hi';
      return \`<button class="convo" data-c="\${id}" aria-current="\${id===activeChat}">\${avatar(m)}<span class="t"><b>\${esc(m.name)}</b><small>\${previewText}</small></span>\${t.unread?'<span class="unread" aria-label="Unread"></span>':''}</button>\`; }).join('')
      : '<p class="empty" style="padding:16px">No conversations yet. Message someone from the leaderboard or gallery.</p>'}
      <div style="padding:14px"><a class="btn ghost small block" href="#/leaderboard">Find members</a></div></div>
    
    <div class="thread">\${peer ? \`
      <div class="top"><button class="btn ghost small back" id="back" aria-label="Back">\${ic('back')}</button>\${avatar(peer)}<div><b>\${esc(peer.name)}</b><small class="hint" style="display:block">@\${esc(peer.handle)}</small></div><span class="sp"></span>
        <button class="btn ghost small" id="rep">Report</button><button class="btn ghost small" id="blk">Block</button></div>
      
      <div class="msgs" id="msgs">\${u.chats[activeChat].msgs.map(m => {
        const isStk = m.text.startsWith('[sticker:');
        let content = '';
        if(isStk){
          const stkName = m.text.slice(9, -1);
          content = \`<span class="chat-sticker-visual">\${dr(stkName)}</span>\`;
        } else {
          content = esc(m.text);
        }
        return \`<div class="msg \${m.from===u.id?'mine':''} \${isStk?'has-sticker':''}">\${content}<time>\${clock(m.at)}</time></div>\`;
      }).join('') || '<p class="empty" style="margin:auto">Say hello or send a sticker below!</p>'}</div>
      
      <div class="typing" id="typing" hidden>\${esc(peer.name.split(' ')[0])} is typing…</div>
      
      <div class="composer-wrap">
        <div class="sticker-tray" id="stkTray" hidden>
          <button type="button" class="stk-chip" data-stk="team-pink" title="Team Pink">\${dr('team-pink')}</button>
          <button type="button" class="stk-chip" data-stk="team-brown" title="Team Brown">\${dr('team-brown')}</button>
          <button type="button" class="stk-chip" data-stk="p-b-heart" title="Pink & Brown Heart">\${dr('p-b-heart')}</button>
          <button type="button" class="stk-chip" data-stk="awareness-ribbon" title="Awareness Ribbon">\${dr('awareness-ribbon')}</button>
          <button type="button" class="stk-chip" data-stk="vip-sticker" title="VIP Sticker">\${dr('vip-sticker')}</button>
          <button type="button" class="stk-chip" data-stk="self-love" title="Self Love">\${dr('self-love')}</button>
          <button type="button" class="stk-chip emoji" data-em="💗">💗</button>
          <button type="button" class="stk-chip emoji" data-em="🤎">🤎</button>
          <button type="button" class="stk-chip emoji" data-em="👑">👑</button>
          <button type="button" class="stk-chip emoji" data-em="✨">✨</button>
          <button type="button" class="stk-chip emoji" data-em="👙">👙</button>
          <button type="button" class="stk-chip emoji" data-em="🔥">🔥</button>
          <button type="button" class="stk-chip emoji" data-em="🙌">🙌</button>
          <button type="button" class="stk-chip emoji" data-em="🎉">🎉</button>
        </div>
        <form class="composer" id="comp">
          <button type="button" class="stk-toggle-btn" id="stkBtn" title="Send stickers and emojis">✨ Stickers</button>
          <input id="mt" type="text" placeholder="Write a message or pick a sticker…" autocomplete="off" maxlength="500" aria-label="Message">
          <button class="btn pink glow" type="submit" id="sendMsgBtn">Send</button>
        </form>
      </div>\`
      : \`<div style="margin:auto;text-align:center;padding:30px">\${ic('message','empty-ic')}<p class="hint">Pick a conversation to start chatting.</p></div>\`}</div>\`;

  box.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { activeChat = b.dataset.c; drawChat(); });
  
  if(peer){
    const ms = $('#msgs'); ms.scrollTop = ms.scrollHeight;
    $('#back').onclick = () => { activeChat = null; drawChat(); };

    // Toggle sticker tray
    const stkBtn = $('#stkBtn');
    const stkTray = $('#stkTray');
    if(stkBtn && stkTray){
      stkBtn.onclick = () => {
        stkTray.hidden = !stkTray.hidden;
        stkBtn.classList.toggle('active', !stkTray.hidden);
      };
    }

    // Send sticker click
    box.querySelectorAll('[data-stk]').forEach(b => b.onclick = () => {
      const stk = b.dataset.stk;
      sendMsg(me(), activeChat, \`[sticker:\${stk}]\`);
      stkTray.hidden = true;
      stkBtn.classList.remove('active');
      drawChat();
      burstAt(innerWidth/2, innerHeight/2, 16);
    });

    // Send emoji click
    box.querySelectorAll('[data-em]').forEach(b => b.onclick = () => {
      const em = b.dataset.em;
      sendMsg(me(), activeChat, em);
      stkTray.hidden = true;
      stkBtn.classList.remove('active');
      drawChat();
    });

    // Send message submit
    $('#comp').onsubmit = e => {
      e.preventDefault();
      const t = $('#mt').value.trim();
      if(!t) return;
      const [x,y] = centerOf($('#comp .glow'));
      sendMsg(me(), activeChat, t);
      drawChat();
      $('#mt')?.focus();
      burstAt(x, y, 14);
    };

    $('#rep').onclick = () => toast('Reported. Our team reviews reports within 24 hours.');
    $('#blk').onclick = () => {
      const d = modal(\`<h2>Block \${esc(peer.name)}?</h2><p style="margin:12px 0 20px">They won't be able to message you, and the conversation disappears from your list.</p>
        <div style="display:flex;gap:10px"><button class="btn pink" id="yes">Block</button><button class="btn ghost" data-close>Cancel</button></div>\`);
      d.querySelector('#yes').onclick = () => { const uu = me(); uu.blocked.push(activeChat); saveMe(uu); activeChat = null; d.close(); toast('Blocked'); drawChat(); };
    };
    if(matchMedia('(min-width:761px)').matches) $('#mt').focus();
  }
  const cn = document.querySelector('.club-nav a[href="#/messages"]');
  if(cn){ const n = Object.values(me().chats).filter(t => t.unread).length; cn.innerHTML = ic('message') + 'Messages' + (n?\`<span class="badge-n">\${n}</span>\`:''); }
}
`;

src = src.replace(oldDrawChat, newDrawChat);

// Write to files
fs.writeFileSync(path.join(__dirname, '..', 'index.html'), src, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'club.html'), src, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'Pink or Brown · Club.html'), src, 'utf8');
console.log('✓ Successfully updated drawChat() with Auto-Select & Sticker Tray in index.html, club.html, and Pink or Brown · Club.html!');
