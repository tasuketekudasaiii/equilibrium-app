'use strict';
/* ================================================================
   EQUILIBRIUM — app.js
   ================================================================ */

// ── Constants ────────────────────────────────────────────────────
const SODIUM_GOAL = 1500;
const HYDRATION_GOAL = 8;
const CAFFEINE_WARN = 2;
const ALCOHOL_WARN = 1;

const K = {
  attacks:'eq_attacks', medications:'eq_meds', doses:'eq_doses',
  sodium:'eq_sodium', hydration:'eq_hydration', stress:'eq_stress',
  sleep:'eq_sleep', caff:'eq_caff', emergency:'eq_emergency', settings:'eq_settings',
  activeAttack:'eq_active_attack', tutorialSeen:'eq_tutorial_seen',
};

const SYMPTOMS = [
  {id:'vertigo',label:'🌀 Vertigo'},{id:'tinnitus',label:'🔔 Tinnitus'},
  {id:'hearing',label:'👂 Hearing Loss'},{id:'pressure',label:'🫧 Ear Pressure'},
  {id:'nausea',label:'🤢 Nausea'},{id:'vomiting',label:'🤮 Vomiting'},
  {id:'migraine',label:'🤕 Migraine'},{id:'brainfog',label:'🧠 Brain Fog'},
  {id:'drop',label:'⚠️ Drop Attack'},
];
const MOODS = [
  {id:'great',e:'😊',l:'Great'},{id:'calm',e:'😌',l:'Calm'},
  {id:'anxious',e:'😰',l:'Anxious'},{id:'fatigued',e:'😴',l:'Fatigued'},
  {id:'frustrated',e:'😤',l:'Frustrated'},
];
const MED_TYPES = ['diuretic','antihistamine','antiemetic','betahistine','corticosteroid','supplement','other'];

const FOOD_DB = [
  {n:'Fresh apple',s:0,srv:'1 medium'},{n:'Banana',s:1,srv:'1 medium'},
  {n:'Orange',s:0,srv:'1 medium'},{n:'Blueberries',s:1,srv:'1 cup'},
  {n:'Strawberries',s:1,srv:'1 cup'},{n:'Avocado',s:7,srv:'1 medium'},
  {n:'Cucumber',s:2,srv:'1 cup sliced'},{n:'Fresh tomato',s:6,srv:'1 medium'},
  {n:'Carrot (raw)',s:42,srv:'1 medium'},{n:'Broccoli',s:30,srv:'1 cup'},
  {n:'Spinach (fresh)',s:24,srv:'1 cup'},{n:'Bell pepper',s:4,srv:'1 medium'},
  {n:'White rice (cooked)',s:1,srv:'1 cup'},{n:'Brown rice (cooked)',s:5,srv:'1 cup'},
  {n:'Oatmeal (plain)',s:2,srv:'1 cup cooked'},{n:'Pasta (unsalted)',s:1,srv:'1 cup cooked'},
  {n:'Egg (large)',s:65,srv:'1 egg'},{n:'Milk (1%)',s:107,srv:'1 cup'},
  {n:'Greek yogurt (plain)',s:70,srv:'6 oz'},{n:'Cheddar cheese',s:185,srv:'1 oz'},
  {n:'Cottage cheese',s:459,srv:'½ cup'},{n:'Unsalted butter',s:2,srv:'1 tbsp'},
  {n:'Salted butter',s:91,srv:'1 tbsp'},
  {n:'Fresh chicken breast',s:65,srv:'3 oz cooked'},{n:'Fresh salmon',s:55,srv:'3 oz cooked'},
  {n:'Fresh tuna',s:44,srv:'3 oz cooked'},{n:'Ground beef (lean)',s:75,srv:'3 oz cooked'},
  {n:'Peanut butter (natural)',s:75,srv:'2 tbsp'},{n:'Almonds (unsalted)',s:0,srv:'1 oz'},
  {n:'Whole wheat bread',s:150,srv:'1 slice'},{n:'White bread',s:142,srv:'1 slice'},
  {n:'Breakfast cereal (Cheerios)',s:140,srv:'1 cup'},{n:'Granola bar',s:95,srv:'1 bar'},
  {n:'Saltine crackers',s:200,srv:'5 crackers'},{n:'Potato chips',s:170,srv:'1 oz'},
  {n:'Pretzels',s:385,srv:'1 oz'},{n:'Ketchup',s:154,srv:'1 tbsp'},
  {n:'Mustard',s:175,srv:'1 tbsp'},{n:'Ranch dressing',s:260,srv:'2 tbsp'},
  {n:'Hot sauce (Tabasco)',s:35,srv:'1 tsp'},{n:'Worcestershire sauce',s:167,srv:'1 tbsp'},
  {n:'Deli turkey breast',s:360,srv:'2 oz'},{n:'Canned tuna (in water)',s:287,srv:'3 oz'},
  // High sodium — flagged
  {n:'Canned soup',s:890,srv:'1 cup',f:true},{n:'Chicken noodle soup (canned)',s:940,srv:'1 cup',f:true},
  {n:'Soy sauce',s:902,srv:'1 tbsp',f:true},{n:'Teriyaki sauce',s:690,srv:'1 tbsp',f:true},
  {n:'Pickle (dill, large)',s:785,srv:'1 pickle',f:true},{n:'Ramen noodles (packaged)',s:1820,srv:'1 pkg',f:true},
  {n:'Frozen pizza (pepperoni)',s:810,srv:'1 slice',f:true},{n:'Fast food cheeseburger',s:1100,srv:'1 burger',f:true},
  {n:'Fast food fries (large)',s:490,srv:'large',f:true},{n:'Deli ham',s:600,srv:'2 oz',f:true},
  {n:'Pepperoni',s:443,srv:'1 oz'},{n:'Processed cheese slice',s:440,srv:'1 slice'},
  {n:'Canned beans',s:400,srv:'½ cup'},{n:'Tomato juice',s:615,srv:'1 cup',f:true},
  {n:'V8 juice',s:640,srv:'1 cup',f:true},{n:'Frozen dinner',s:700,srv:'1 meal',f:true},
  {n:'Pizza delivery (pepperoni)',s:820,srv:'1 slice',f:true},{n:'Restaurant pasta (marinara)',s:1000,srv:'1 dish',f:true},
  {n:'Sub sandwich (6-inch)',s:1100,srv:'6-inch',f:true},{n:'Chinese lo mein (takeout)',s:1200,srv:'1 cup',f:true},
  {n:'Sushi + soy sauce dip',s:600,srv:'6 pieces'},{n:'Table salt',s:2325,srv:'1 tsp',f:true},
  {n:'Low-sodium salt substitute',s:0,srv:'1 tsp'},
];

// ── Utilities ─────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const nowISO = () => new Date().toISOString();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const qs = (sel, ctx=document) => ctx.querySelector(sel);
const qsa = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

function fmtDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
}
function fmtDur(mins) {
  if (!mins || mins < 1) return '< 1m';
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins/60)}h ${mins%60}m`;
}
function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate()-n);
  return d.toISOString().split('T')[0];
}
function startOfWeek() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun, 1=Mon…
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}
function prevDate(dateStr) {
  const d = new Date(dateStr+'T12:00:00'); d.setDate(d.getDate()-1);
  return d.toISOString().split('T')[0];
}
function dateDiff(a, b) { // days b - a
  return Math.round((new Date(b)-new Date(a)) / 86400000);
}
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function pct(val, max) { return Math.min(100, Math.round(val/max*100)); }

function showToast(msg, ms=2500) {
  const t = qs('#toast'); t.textContent = msg;
  t.classList.add('on'); setTimeout(()=>t.classList.remove('on'), ms);
}

// ── Storage ───────────────────────────────────────────────────────
const DB = {
  g(k){try{return JSON.parse(localStorage.getItem(k))||null}catch{return null}},
  s(k,v){localStorage.setItem(k,JSON.stringify(v))},

  // Attacks
  attacks(){return this.g(K.attacks)||[]},
  saveAttack(a){const arr=this.attacks(),i=arr.findIndex(x=>x.id===a.id);i>=0?arr[i]=a:arr.unshift(a);this.s(K.attacks,arr)},
  delAttack(id){this.s(K.attacks,this.attacks().filter(a=>a.id!==id))},

  // Medications
  meds(){return this.g(K.medications)||[]},
  saveMed(m){const arr=this.meds(),i=arr.findIndex(x=>x.id===m.id);i>=0?arr[i]=m:arr.push(m);this.s(K.medications,arr)},
  delMed(id){this.s(K.medications,this.meds().filter(m=>m.id!==id))},

  // Doses
  doses(){return this.g(K.doses)||[]},
  dosesFor(date){return this.doses().filter(d=>d.date===date)},
  markDose(medId,date,time,taken){
    const arr=this.doses(),i=arr.findIndex(d=>d.medId===medId&&d.date===date&&d.time===time);
    const entry={medId,date,time,taken,at:taken?nowISO():null};
    i>=0?arr[i]=entry:arr.push(entry); this.s(K.doses,arr);
  },

  // Sodium
  sodiumLog(){return this.g(K.sodium)||{}},
  sodiumFor(date){return(this.sodiumLog()[date]||{items:[]})},
  addSodiumItem(date,item){
    const log=this.sodiumLog(); if(!log[date])log[date]={items:[]};
    log[date].items.push({...item,id:uid()}); this.s(K.sodium,log);
  },
  delSodiumItem(date,id){
    const log=this.sodiumLog(); if(log[date])log[date].items=log[date].items.filter(i=>i.id!==id);
    this.s(K.sodium,log);
  },
  totalSodium(date){return(this.sodiumFor(date).items||[]).reduce((s,i)=>s+(i.s||0),0)},

  // Hydration
  hydFor(date){return(this.g(K.hydration)||{})[date]||0},
  setHyd(date,n){const l=this.g(K.hydration)||{};l[date]=n;this.s(K.hydration,l)},

  // Stress/mood
  stressFor(date){return(this.g(K.stress)||{})[date]||null},
  saveStress(date,data){const l=this.g(K.stress)||{};l[date]=data;this.s(K.stress,l)},

  // Sleep
  sleepFor(date){return(this.g(K.sleep)||{})[date]||null},
  saveSleep(date,data){const l=this.g(K.sleep)||{};l[date]=data;this.s(K.sleep,l)},

  // Caffeine/alcohol
  caffFor(date){return(this.g(K.caff)||{})[date]||{c:0,a:0}},
  saveCaff(date,data){const l=this.g(K.caff)||{};l[date]=data;this.s(K.caff,l)},

  // Emergency
  emergency(){return this.g(K.emergency)||{}},
  saveEmergency(d){this.s(K.emergency,d)},

  // Settings
  settings(){return this.g(K.settings)||{dark:false,sodiumGoal:1500,hydGoal:8}},
  saveSettings(d){this.s(K.settings,d)},
};

// ── App State ─────────────────────────────────────────────────────
const S = {
  tab:'home',
  panel:null,
  attack:null,  // {id, startISO, interval}
  charts:{},
  viewDate: today(), // date currently being viewed across all tabs
};

// ── Panel helpers ─────────────────────────────────────────────────
function openPanel(id, renderFn) {
  if (S.panel) closePanel();
  S.panel = id;
  const el = qs(`#${id}`);
  el.classList.add('open');
  qs('#overlay').classList.add('on');
  if (renderFn) renderFn();
}
function closePanel() {
  if (!S.panel) return;
  qs(`#${S.panel}`)?.classList.remove('open');
  qs('#overlay').classList.remove('on');
  S.panel = null;
}
function pushPanel(id, renderFn) {  // stack a second panel
  const prev = S.panel;
  openPanel(id, renderFn);
  S.prevPanel = prev;
}
function popPanel() {
  closePanel();
  if (S.prevPanel) { openPanel(S.prevPanel); S.prevPanel = null; }
}

// ── Tab Navigation ────────────────────────────────────────────────
function switchTab(tab) {
  S.tab = tab;
  qsa('.nav-item').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  qsa('.view').forEach(v=>v.classList.toggle('active', v.id===`view-${tab}`));
  const renders = {home:renderHome, symptoms:renderSymptoms, diet:renderDiet, wellness:renderWellness, more:renderMore};
  renders[tab]?.();
}

// ── Date Navigation ───────────────────────────────────────────────
function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function dateNav() {
  const d      = S.viewDate;
  const isToday = d === today();
  const label  = isToday ? 'Today' : fmtDate(d);
  const dow    = isToday ? '' : new Date(d + 'T12:00:00').toLocaleDateString('en-US', {weekday:'long'});
  return `
    <div class="date-nav">
      <button class="date-nav-btn" data-action="prev-day">‹</button>
      <div class="date-nav-center">
        <div class="date-nav-label">${label}</div>
        ${!isToday ? `<div class="date-nav-sub">${dow}</div>` : ''}
        ${isToday ? '<div class="date-nav-today">Today</div>' : ''}
      </div>
      <button class="date-nav-btn" data-action="next-day" ${isToday ? 'disabled' : ''}>›</button>
    </div>`;
}

// ── Encouraging messages ──────────────────────────────────────────
function getBannerMsg(attacks7, sodium, glasses) {
  if (attacks7 === 0) return {icon:'🌟', title:"No attacks this week!", msg:"You're doing amazing. Keep up the consistent habits — they make a real difference."};
  if (glasses < 3)   return {icon:'💧', title:"Stay hydrated!", msg:"Consistent water intake is one of your most powerful tools. Aim for 8 glasses today."};
  if (sodium === 0)  return {icon:'🥗', title:"Log your meals today", msg:"Tracking sodium helps you spot patterns. You're in control of your triggers."};
  if (attacks7 >= 5) return {icon:'💙', title:"A tough week — but you're still here", msg:"Managing Ménière's is genuinely hard. Be gentle with yourself. Every log helps."};
  return {icon:'💙', title:"You're doing great", msg:"Every day you track is a day you're taking care of yourself. Keep going."};
}

// ── HOME VIEW ─────────────────────────────────────────────────────
function renderHome() {
  const t       = S.viewDate;
  const isToday = t === today();
  const sodium  = DB.totalSodium(t);
  const sGoal   = DB.settings().sodiumGoal || SODIUM_GOAL;
  const glasses = DB.hydFor(t);
  const stress  = DB.stressFor(t);
  const caff    = DB.caffFor(t);
  const allAtk  = DB.attacks();
  const atk7    = allAtk.filter(a => a.date >= startOfWeek()).length;
  const banner  = getBannerMsg(atk7, sodium, glasses);
  const dateStr = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  const sPct    = pct(sodium, sGoal);
  const hPct    = pct(glasses, HYDRATION_GOAL);

  qs('#view-home').innerHTML = `
    ${dateNav()}

    ${isToday ? `
    <div class="banner">
      <div class="banner-icon">${banner.icon}</div>
      <div>
        <div class="banner-title">${banner.title}</div>
        <div class="banner-text">${banner.msg}</div>
      </div>
    </div>` : `<div class="past-banner">📅 Viewing past data — changes will be saved to ${fmtDate(t)}</div>`}

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🧂</div>
        <div class="stat-val ${sodium > sGoal ? 'danger' : ''}">${sodium}<span style="font-size:13px;font-weight:600">mg</span></div>
        <div class="stat-label">Sodium today</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💧</div>
        <div class="stat-val">${glasses}</div>
        <div class="stat-label">Glasses of water</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-val ${atk7 >= 3 ? 'danger' : ''}">${atk7}</div>
        <div class="stat-label">Attacks this week</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">${stress ? MOODS.find(m=>m.id===stress.mood)?.e||'😌' : '—'}</div>
        <div class="stat-val">${stress ? stress.level : '—'}</div>
        <div class="stat-label">Stress level</div>
      </div>
    </div>

    <div class="card">
      <div class="card-hdr">
        <div><div class="card-title">🧂 Sodium Budget</div><div class="card-sub">Goal: under ${sGoal}mg/day</div></div>
        <button class="btn btn-ghost btn-sm" data-action="food-search">+ Log Food</button>
      </div>
      <div class="meter-hdr"><span>${sodium}mg consumed</span><span>${Math.max(0,sGoal-sodium)}mg remaining</span></div>
      <div class="meter-bar"><div class="meter-fill ${sPct>=100?'danger':sPct>=80?'warn':''}" style="width:${sPct}%"></div></div>
      ${sodium > sGoal ? '<p style="color:var(--danger);font-size:12px;font-weight:600;margin-top:4px;">⚠️ Daily sodium goal exceeded</p>' : ''}
    </div>

    <div class="card">
      <div class="card-hdr">
        <div><div class="card-title">💧 Hydration</div><div class="card-sub">${glasses} of ${HYDRATION_GOAL} glasses</div></div>
      </div>
      <div class="water-row" id="home-water"></div>
    </div>

    ${caff.c > 0 || caff.a > 0 ? `
    <div class="card">
      <div class="card-title" style="margin-bottom:8px">Today's Intake</div>
      <div style="display:flex;gap:var(--sp-md)">
        ${caff.c > 0 ? `<span class="pill ${caff.c >= CAFFEINE_WARN ? 'pill-warn' : 'pill-p'}">☕ ${caff.c} coffee</span>` : ''}
        ${caff.a > 0 ? `<span class="pill ${caff.a >= ALCOHOL_WARN ? 'pill-danger' : 'pill-p'}">🍷 ${caff.a} alcohol</span>` : ''}
      </div>
    </div>` : ''}

    <div class="card">
      <div class="card-title" style="margin-bottom:12px">Quick Actions</div>
      <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px">
        <button class="btn btn-outline btn-qa" data-go="symptoms">⚡ Log Attack</button>
        <button class="btn btn-outline btn-qa" data-action="medications">💊 Medications</button>
        <button class="btn btn-outline btn-qa" data-go="wellness">😌 Check In</button>
        <button class="btn btn-outline btn-qa" data-action="emergency">🚨 Emergency Card</button>
      </div>
    </div>

    ${allAtk.length > 0 ? `
    <div class="card">
      <div class="card-hdr">
        <div class="card-title">Recent Attacks</div>
        <button class="btn btn-ghost btn-sm" data-go="symptoms">See all</button>
      </div>
      ${allAtk.slice(0,3).map(attackEntry).join('')}
    </div>` : ''}
  `;

  renderWaterRow('#home-water', glasses, 'home');
  qs('#header-sub').textContent = "Your Ménière's Companion";
}

function attackEntry(a) {
  const cls = a.intensity >= 7 ? 'intense' : a.intensity >= 4 ? 'moderate' : '';
  return `
    <div class="attack-entry ${cls}" style="margin-bottom:var(--sp-md)">
      <div class="attack-date">${fmtDate(a.date)} ${a.startTime ? '· '+fmtTime(a.startTime) : ''}</div>
      <div class="attack-main">Intensity ${a.intensity}/10 · ${fmtDur(a.duration)}</div>
      <div class="attack-tags">${(a.symptoms||[]).map(s=>`<span class="attack-tag">${s}</span>`).join('')}</div>
      ${a.notes ? `<div style="font-size:13px;color:var(--text-m);margin-top:4px">${a.notes}</div>` : ''}
    </div>`;
}

function renderWaterRow(sel, filled, prefix) {
  const el = qs(sel); if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < HYDRATION_GOAL; i++) {
    const d = document.createElement('div');
    d.className = 'water-glass' + (i < filled ? ' filled' : '');
    d.textContent = i < filled ? '💧' : '·';
    d.dataset.action = 'water-glass';
    d.dataset.glass = i;
    d.dataset.prefix = prefix;
    el.appendChild(d);
  }
}

// ── SYMPTOMS VIEW ──────────────────────────────────────────────────
function renderSymptoms() {
  const t       = S.viewDate;
  const isToday = t === today();
  const allAttacks = DB.attacks();
  // Show attacks for the viewed date in the "today" slot, full history below
  const dayAttacks = allAttacks.filter(a => a.date === t);
  const attacks    = allAttacks;
  const active  = S.attack;

  qs('#view-symptoms').innerHTML = `
    ${dateNav()}

    ${isToday ? `
    <div class="card" style="text-align:center;padding:var(--sp-lg)">
      <p style="font-size:13px;color:var(--text-m);margin-bottom:var(--sp-md)">
        ${active ? 'Attack in progress — tap to stop & log' : 'Feeling an attack? Tap to log it now'}
      </p>
      <button class="attack-btn ${active ? 'recording' : ''}" id="attack-btn">
        <span>${active ? '⏹' : '⚡'}</span>
        <span class="attack-btn-label">${active ? 'Stop' : 'Attack'}</span>
        ${active ? `<span class="attack-timer" id="attack-clock">--:--</span>` : ''}
      </button>
      ${active ? '' : `<button class="btn btn-ghost btn-sm" style="margin-top:var(--sp-md)" data-action="log-attack">+ Log past attack</button>`}
    </div>` : `<div class="past-banner">📅 Viewing attacks for ${fmtDate(t)}</div>`}

    ${!isToday && dayAttacks.length === 0 ? `
      <div class="empty">
        <div class="empty-icon">✨</div>
        <div class="empty-title">No attacks on ${fmtDate(t)}</div>
        <div class="empty-text">Nothing was logged for this day.</div>
      </div>` : ''}

    ${dayAttacks.length > 0 ? `
      <div class="sec-hdr"><div class="sec-title">Attacks on ${fmtDate(t)}</div><span class="pill pill-p">${dayAttacks.length}</span></div>
      <div class="card">${dayAttacks.map(a => `
        <div class="list-item">
          <div class="list-icon">⚡</div>
          <div class="list-content">
            <div class="list-title">${a.startTime ? fmtTime(a.startTime) : 'Time not recorded'}</div>
            <div class="list-sub">${fmtDur(a.duration)} · ${(a.symptoms||[]).join(', ')||'No symptoms noted'}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="pill ${a.intensity>=7?'pill-danger':a.intensity>=4?'pill-warn':'pill-success'}">${a.intensity}/10</span>
            <button class="btn-icon" data-action="del-attack" data-id="${a.id}" style="font-size:14px;color:var(--text-m)">🗑</button>
          </div>
        </div>`).join('')}
      </div>` : ''}

    <div class="sec-hdr" style="margin-top:var(--sp-sm)">
      <div class="sec-title">Full History</div>
      ${attacks.length > 0 ? `<span class="pill pill-p">${attacks.length} total</span>` : ''}
    </div>

    ${attacks.length > 0 ? `
      <div class="card">
        <div class="card-title" style="margin-bottom:8px">Last 30 Days</div>
        <div class="chart-wrap"><canvas id="chart-attacks"></canvas></div>
      </div>
      <div class="card">
        ${attacks.slice(0,20).map(a => `
          <div class="list-item">
            <div class="list-icon">⚡</div>
            <div class="list-content">
              <div class="list-title">${fmtDate(a.date)}</div>
              <div class="list-sub">${fmtDur(a.duration)} · ${(a.symptoms||[]).join(', ')||'No symptoms noted'}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="pill ${a.intensity>=7?'pill-danger':a.intensity>=4?'pill-warn':'pill-success'}">${a.intensity}/10</span>
              <button class="btn-icon" data-action="del-attack" data-id="${a.id}" style="font-size:14px;color:var(--text-m)">🗑</button>
            </div>
          </div>`).join('')}
      </div>` : `
      <div class="empty">
        <div class="empty-icon">✨</div>
        <div class="empty-title">No attacks logged yet</div>
        <div class="empty-text">When you have a vertigo episode, tap the button above to log it. Tracking helps you find your triggers.</div>
      </div>`}
  `;

  if (active) startAttackClock();
  if (attacks.length > 0) setTimeout(()=>renderAttackChart(), 50);
}

// Attack timer
function startAttack() {
  const id = uid();
  const startISO = nowISO();
  S.attack = {id, startISO, interval: setInterval(updateAttackClock, 1000)};
  DB.s(K.activeAttack, {id, startISO});
  renderSymptoms();
  showToast('Attack timer started');
}

function stopAttack() {
  if (!S.attack) return;
  clearInterval(S.attack.interval);
  const startISO = S.attack.startISO;
  S.attack = null;
  DB.s(K.activeAttack, null);
  // Open log panel pre-filled
  openPanel('panel-log-attack', () => renderLogAttackPanel(startISO));
}

function startAttackClock() {
  if (S.attack) updateAttackClock();
}

function updateAttackClock() {
  const el = qs('#attack-clock'); if (!el || !S.attack) return;
  const secs = Math.floor((Date.now() - new Date(S.attack.startISO)) / 1000);
  const m = String(Math.floor(secs/60)).padStart(2,'0');
  const s = String(secs%60).padStart(2,'0');
  el.textContent = `${m}:${s}`;
}

function renderAttackChart() {
  const canvas = qs('#chart-attacks'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (S.charts.attacks) { S.charts.attacks.destroy(); }

  const attacks = DB.attacks();
  const labels = [], counts = [];
  for (let i = 29; i >= 0; i--) {
    const d = daysAgo(i);
    labels.push(i===0?'Today':i===1?'Yest':new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'numeric',day:'numeric'}));
    counts.push(attacks.filter(a=>a.date===d).length);
  }

  S.charts.attacks = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ data: counts, backgroundColor: 'rgba(91,155,138,0.6)', borderColor: '#5B9B8A', borderWidth: 2, borderRadius: 4 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 10 }, color: '#6B8A83' } },
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 }, color: '#6B8A83' }, grid: { color: 'rgba(0,0,0,0.05)' } }
      }
    }
  });
}

// Log past attack panel
function renderLogAttackPanel(prefillStart) {
  const bodyEl = qs('#panel-log-attack-body');
  const now = new Date();
  const defaultDate = today();
  const defaultTime = now.toTimeString().slice(0,5);

  // Pre-fill duration from elapsed time if available
  const elapsedMin  = prefillStart ? Math.max(0, Math.round((Date.now() - new Date(prefillStart)) / 60000)) : 0;
  const prefillH    = Math.min(23, Math.floor(elapsedMin / 60));
  const prefillMRaw = elapsedMin % 60;
  const prefillM    = Math.round(prefillMRaw / 5) * 5 >= 60 ? 55 : Math.round(prefillMRaw / 5) * 5;

  const hourOpts = Array.from({length:24}, (_,i) =>
    `<option value="${i}"${i===prefillH?' selected':''}>${i}h</option>`).join('');
  const minOpts  = [0,5,10,15,20,25,30,35,40,45,50,55].map(m =>
    `<option value="${m}"${m===prefillM?' selected':''}>${m}m</option>`).join('');

  bodyEl.innerHTML = `
    <form id="form-log-attack">
      <div class="form-group">
        <label class="form-label">Date</label>
        <input type="date" class="form-input" name="date" value="${prefillStart ? prefillStart.split('T')[0] : defaultDate}" max="${defaultDate}">
      </div>
      <div class="form-group">
        <label class="form-label">Start time</label>
        <input type="time" class="form-input" name="startTime" value="${prefillStart ? new Date(prefillStart).toTimeString().slice(0,5) : defaultTime}">
      </div>
      <div class="form-group">
        <label class="form-label">Duration</label>
        <div class="dur-picker">
          <select name="dur-h" class="form-input dur-sel">${hourOpts}</select>
          <select name="dur-m" class="form-input dur-sel">${minOpts}</select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Intensity <span id="intensity-val" style="color:var(--p)">5</span>/10</label>
        <div class="slider-row">
          <span>1</span>
          <input type="range" name="intensity" min="1" max="10" value="5" id="intensity-slider">
          <span>10</span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Symptoms experienced</label>
        <div class="chip-group">
          ${SYMPTOMS.map(s=>`
            <div class="chip">
              <input type="checkbox" id="sym-${s.id}" name="symptoms" value="${s.id}">
              <label for="sym-${s.id}">${s.label}</label>
            </div>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Notes (optional)</label>
        <textarea class="form-input" name="notes" placeholder="What were you doing? Any possible triggers?"></textarea>
      </div>
    </form>
  `;

  qs('#intensity-slider').addEventListener('input', function() {
    qs('#intensity-val').textContent = this.value;
  });
}

// ── DIET VIEW ──────────────────────────────────────────────────────
function renderDiet() {
  const t       = S.viewDate;
  const isToday = t === today();
  const sGoal  = DB.settings().sodiumGoal || SODIUM_GOAL;
  const sodium  = DB.totalSodium(t);
  const items   = DB.sodiumFor(t).items || [];
  const glasses = DB.hydFor(t);
  const caff    = DB.caffFor(t);
  const sPct    = pct(sodium, sGoal);

  qs('#view-diet').innerHTML = `
    ${dateNav()}
    ${!isToday ? `<div class="past-banner">📅 Viewing diet data for ${fmtDate(t)}</div>` : ''}
    <div class="sec-hdr"><div class="sec-title">🥗 Diet Tracker</div></div>

    <!-- Sodium -->
    <div class="card">
      <div class="card-hdr">
        <div><div class="card-title">🧂 Sodium</div><div class="card-sub">Goal: &lt;${sGoal}mg</div></div>
        <button class="btn btn-ghost btn-sm" data-action="food-search">+ Add Food</button>
      </div>
      <div class="meter-hdr"><span>${sodium}mg</span><span>${sGoal}mg goal</span></div>
      <div class="meter-bar"><div class="meter-fill ${sPct>=100?'danger':sPct>=80?'warn':''}" style="width:${sPct}%"></div></div>
      ${sodium > sGoal ? '<p style="color:var(--danger);font-size:13px;font-weight:600;margin-top:6px;">⚠️ Over your daily goal</p>' : `<p style="font-size:13px;color:var(--text-m);margin-top:6px">${Math.max(0,sGoal-sodium)}mg remaining</p>`}

      ${items.length > 0 ? `
      <div class="divider"></div>
      <div style="font-size:13px;font-weight:700;color:var(--text-m);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">Logged today</div>
      ${items.map(i=>`
        <div class="food-item">
          <div><div class="food-name">${i.n}</div><div class="food-serving">${i.srv}</div></div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="text-align:right">
              <div class="food-sodium ${i.s>400?'':''}">+${i.s}mg</div>
              ${i.f?'<div class="food-flag">⚠️ HIGH</div>':''}
            </div>
            <button style="font-size:16px;color:var(--text-m)" data-action="del-sodium" data-id="${i.id}">✕</button>
          </div>
        </div>`).join('')}` : ''}
    </div>

    <!-- High-sodium foods to avoid -->
    <div class="card">
      <div class="card-title" style="margin-bottom:10px">🚫 High-Sodium Foods to Avoid</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${['Canned soup','Soy sauce','Pickles','Ramen noodles','Deli meats','Frozen pizza','Fast food','Teriyaki sauce'].map(f=>`<span class="pill pill-danger">${f}</span>`).join('')}
      </div>
    </div>

    <!-- Hydration -->
    <div class="card">
      <div class="card-hdr">
        <div><div class="card-title">💧 Hydration</div><div class="card-sub">${glasses} of ${HYDRATION_GOAL} glasses (8 oz each)</div></div>
      </div>
      <div class="water-row" id="diet-water"></div>
      <p style="font-size:12px;color:var(--text-m);margin-top:10px">Consistent hydration helps stabilize inner ear fluid — aim for 8 glasses spread throughout the day.</p>
    </div>

    <!-- Caffeine & Alcohol -->
    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-md)">☕ Caffeine & Alcohol</div>

      <div style="margin-bottom:var(--sp-md)">
        <label class="form-label">Coffee / Caffeine (cups today)</label>
        <div class="stepper">
          <button class="stepper-btn" data-action="caff-dec">−</button>
          <div class="stepper-val" id="caff-val">${caff.c}</div>
          <button class="stepper-btn" data-action="caff-inc">+</button>
        </div>
        ${caff.c >= CAFFEINE_WARN ? '<p style="color:var(--warning);font-size:12px;font-weight:600;margin-top:6px;">⚠️ Caffeine can trigger attacks — consider cutting back</p>' : ''}
      </div>

      <div>
        <label class="form-label">Alcohol (drinks today)</label>
        <div class="stepper">
          <button class="stepper-btn" data-action="alc-dec">−</button>
          <div class="stepper-val" id="alc-val">${caff.a}</div>
          <button class="stepper-btn" data-action="alc-inc">+</button>
        </div>
        ${caff.a >= ALCOHOL_WARN ? '<p style="color:var(--danger);font-size:12px;font-weight:600;margin-top:6px;">⚠️ Alcohol can worsen Ménière\'s symptoms</p>' : ''}
      </div>
    </div>
  `;

  renderWaterRow('#diet-water', glasses, 'diet');
}

// ── WELLNESS VIEW ──────────────────────────────────────────────────
function renderWellness() {
  const t       = S.viewDate;
  const isToday = t === today();
  const stress = DB.stressFor(t) || {level:5, mood:'calm', notes:''};
  const sleep  = DB.sleepFor(t);

  qs('#view-wellness').innerHTML = `
    ${dateNav()}
    ${!isToday ? `<div class="past-banner">📅 Viewing wellness data for ${fmtDate(t)}</div>` : ''}
    <div class="sec-hdr"><div class="sec-title">🌿 Wellness Check-In</div></div>

    <!-- Stress & Mood -->
    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-md)">😌 Stress & Mood</div>

      <div class="form-group">
        <label class="form-label">Stress level: <strong id="stress-disp">${stress.level}</strong>/10</label>
        <div class="slider-row">
          <span>1</span>
          <input type="range" id="stress-slider" min="1" max="10" value="${stress.level}">
          <span>10</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">How are you feeling?</label>
        <div class="mood-picker" id="mood-picker">
          ${MOODS.map(m=>`
            <button class="mood-btn ${stress.mood===m.id?'selected':''}" data-action="mood" data-mood="${m.id}">
              ${m.e}<span>${m.l}</span>
            </button>`).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Journal (optional)</label>
        <textarea class="form-input" id="stress-notes" placeholder="How are you feeling today? Any worries or wins?">${stress.notes||''}</textarea>
      </div>

      <button class="btn btn-primary btn-full" id="btn-save-stress">Save Check-In</button>
    </div>

    <!-- Sleep log -->
    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-md)">🌙 Sleep Log</div>
      ${sleep ? `
        <div style="background:var(--surface2);border-radius:var(--r-md);padding:var(--sp-md);margin-bottom:var(--sp-md)">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <div><strong>${sleep.duration}h</strong> sleep</div>
            <div>${'⭐'.repeat(sleep.quality)}${'☆'.repeat(5-sleep.quality)}</div>
          </div>
          <div style="font-size:13px;color:var(--text-m)">${sleep.bedtime} → ${sleep.wakeTime}</div>
          ${sleep.quality <= 2 ? '<div style="color:var(--warning);font-size:12px;font-weight:600;margin-top:4px;">⚠️ Poor sleep is a common attack trigger</div>' : ''}
        </div>
      ` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-md)">
        <div class="form-group">
          <label class="form-label">Bedtime</label>
          <input type="time" class="form-input" id="sleep-bed" value="${sleep?.bedtime||'23:00'}">
        </div>
        <div class="form-group">
          <label class="form-label">Wake time</label>
          <input type="time" class="form-input" id="sleep-wake" value="${sleep?.wakeTime||'07:00'}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Sleep quality</label>
        <div class="star-row" id="star-row">
          ${[1,2,3,4,5].map(n=>`<span class="star-btn ${sleep&&n<=sleep.quality?'on':''}" data-star="${n}">⭐</span>`).join('')}
        </div>
      </div>
      <button class="btn btn-primary btn-full" id="btn-save-sleep" style="margin-top:4px">Save Sleep Log</button>
    </div>

    <!-- Stress trend -->
    <div class="card">
      <div class="card-title" style="margin-bottom:8px">Stress Trend (14 days)</div>
      <div class="chart-wrap"><canvas id="chart-stress"></canvas></div>
    </div>
  `;

  // Stress slider live
  qs('#stress-slider').addEventListener('input', function() {
    qs('#stress-disp').textContent = this.value;
  });

  // Star rating
  let selectedStar = sleep?.quality || 3;
  function updateStars(n) {
    selectedStar = n;
    qsa('.star-btn').forEach((btn, i) => btn.classList.toggle('on', i < n));
  }
  qs('#star-row').addEventListener('click', e => {
    const s = e.target.dataset.star; if (s) updateStars(+s);
  });

  // Save stress
  qs('#btn-save-stress').addEventListener('click', () => {
    const level = +qs('#stress-slider').value;
    const mood  = qs('.mood-btn.selected')?.dataset.mood || 'calm';
    const notes = qs('#stress-notes').value.trim();
    DB.saveStress(S.viewDate, {level, mood, notes});
    showToast(isToday ? 'Check-in saved 💙' : `Saved for ${fmtDate(S.viewDate)} 💙`);
  });

  // Save sleep
  qs('#btn-save-sleep').addEventListener('click', () => {
    const bed  = qs('#sleep-bed').value;
    const wake = qs('#sleep-wake').value;
    let dur = 0;
    if (bed && wake) {
      const [bh,bm] = bed.split(':').map(Number);
      const [wh,wm] = wake.split(':').map(Number);
      dur = ((wh*60+wm) - (bh*60+bm) + 1440) % 1440 / 60;
    }
    DB.saveSleep(S.viewDate, {bedtime:bed, wakeTime:wake, duration:Math.round(dur*10)/10, quality:selectedStar});
    renderWellness();
    showToast(isToday ? 'Sleep logged 🌙' : `Sleep saved for ${fmtDate(S.viewDate)} 🌙`);
  });

  setTimeout(() => renderStressChart(), 50);
}

function renderStressChart() {
  const canvas = qs('#chart-stress'); if (!canvas) return;
  if (S.charts.stress) S.charts.stress.destroy();
  const labels=[], data=[];
  for (let i=13;i>=0;i--) {
    const d = daysAgo(i);
    const s = DB.stressFor(d);
    labels.push(i===0?'Today':new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'numeric',day:'numeric'}));
    data.push(s ? s.level : null);
  }
  S.charts.stress = new Chart(canvas.getContext('2d'), {
    type:'line',
    data:{labels, datasets:[{data, borderColor:'#5B9B8A', backgroundColor:'rgba(91,155,138,0.1)', borderWidth:2, pointRadius:4, pointBackgroundColor:'#5B9B8A', tension:0.3, spanGaps:true}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
      scales:{x:{grid:{display:false},ticks:{maxTicksLimit:7,font:{size:10},color:'#6B8A83'}},
              y:{min:0,max:10,ticks:{stepSize:2,font:{size:10},color:'#6B8A83'},grid:{color:'rgba(0,0,0,0.05)'}}}}
  });
}

// ── MORE VIEW ──────────────────────────────────────────────────────
function renderAboutPanel() {
  qs('#panel-about-body').innerHTML = `

    <div style="text-align:center;padding:var(--sp-lg) 0 var(--sp-md)">
      <div style="width:72px;height:72px;border-radius:18px;background:#5B9B8A;margin:0 auto var(--sp-md);display:flex;align-items:center;justify-content:center">
        <svg viewBox="0 0 512 512" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
          <path d="M 96 196 Q 176 156 256 196 Q 336 236 416 196" stroke="white" stroke-width="36" fill="none" stroke-linecap="round"/>
          <path d="M 96 256 Q 176 216 256 256 Q 336 296 416 256" stroke="white" stroke-width="36" fill="none" stroke-linecap="round"/>
          <path d="M 96 316 Q 176 276 256 316 Q 336 356 416 316" stroke="white" stroke-width="36" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
      <div style="font-size:22px;font-weight:800;color:var(--text)">Equilibrium</div>
      <div style="font-size:13px;color:var(--text-m);margin-top:4px">Your Ménière's Companion · v1.0</div>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-sm)">What is Ménière's Disease?</div>
      <p style="font-size:14px;line-height:1.65;color:var(--text-m)">
        Ménière's disease is a chronic inner-ear condition that causes unpredictable episodes of
        vertigo, tinnitus (ringing in the ears), fluctuating hearing loss, and a feeling of
        fullness in the ear. Symptoms vary widely from person to person and can significantly
        impact daily life.
      </p>
      <p style="font-size:14px;line-height:1.65;color:var(--text-m);margin-top:var(--sp-sm)">
        While there is currently no cure, consistent tracking of diet, stress, sleep, and
        symptoms can help identify personal triggers and give your doctor a clear picture of
        your condition.
      </p>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-sm)">What Equilibrium Tracks</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
          ['⚡','Attacks & Symptoms','Log vertigo episodes with intensity, duration, and symptoms experienced'],
          ['🧂','Sodium Intake','Monitor daily sodium against your personal target'],
          ['💧','Hydration','Count daily water glasses toward your hydration goal'],
          ['😌','Stress & Mood','Journal your stress level and emotional state each day'],
          ['😴','Sleep','Track nightly sleep hours and quality'],
          ['☕','Caffeine & Alcohol','Monitor consumption of common Ménière\'s triggers'],
          ['💊','Medications','Log your meds and track daily dose adherence'],
          ['🔍','Trigger Insights','Correlate your habits with attack frequency'],
          ['📋','Doctor Report','Generate a 30-day summary for your next appointment'],
        ].map(([icon, title, desc]) => `
          <div style="display:flex;gap:12px;align-items:flex-start">
            <span style="font-size:20px;flex-shrink:0;margin-top:1px">${icon}</span>
            <div>
              <div style="font-size:14px;font-weight:600;color:var(--text)">${title}</div>
              <div style="font-size:12px;color:var(--text-m);line-height:1.5;margin-top:2px">${desc}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-sm)">🔒 Privacy</div>
      <p style="font-size:14px;line-height:1.65;color:var(--text-m)">
        All your health data is stored <strong>only on this device</strong> using your browser's
        local storage. Nothing is ever sent to a server, shared with third parties, or backed up
        to the cloud. If you clear your browser data, your Equilibrium data will be deleted.
      </p>
    </div>

    <div class="card" style="border-left:3px solid var(--accent)">
      <div class="card-title" style="margin-bottom:var(--sp-sm)">⚕️ Medical Disclaimer</div>
      <p style="font-size:13px;line-height:1.65;color:var(--text-m)">
        Equilibrium is a personal tracking tool and is <strong>not a medical device</strong>.
        It is not intended to diagnose, treat, cure, or prevent any disease. Always follow the
        advice of your physician or qualified health provider. If you are experiencing a medical
        emergency, call your local emergency services immediately.
      </p>
    </div>

    <div style="text-align:center;margin-top:var(--sp-lg);padding-bottom:var(--sp-md)">
      <button class="btn btn-outline" id="btn-view-tutorial" style="margin-bottom:var(--sp-md)">📖 View App Tutorial</button>
      <p style="font-size:11px;color:var(--text-m);line-height:1.7">
        Made with care for the Ménière's community 🌊<br>
        Open source · No ads · No tracking
      </p>
    </div>
  `;
  qs('#btn-view-tutorial').addEventListener('click', () => {
    closePanel();
    Tutorial.show();
  });
}

function renderMore() {
  qs('#view-more').innerHTML = `
    <div class="sec-hdr" style="margin-bottom:var(--sp-lg)"><div class="sec-title">More</div></div>

    <div class="more-item" data-action="medications">
      <div class="more-icon" style="background:#EBF5F2">💊</div>
      <div class="more-content">
        <div class="more-title">Medications</div>
        <div class="more-sub">Track doses & adherence</div>
      </div>
      <div class="more-arrow">›</div>
    </div>

    <div class="more-item" data-action="triggers">
      <div class="more-icon" style="background:#FEF5E0">🔍</div>
      <div class="more-content">
        <div class="more-title">Trigger Insights</div>
        <div class="more-sub">See your personal attack patterns</div>
      </div>
      <div class="more-arrow">›</div>
    </div>

    <div class="more-item" data-action="report">
      <div class="more-icon" style="background:#E8F7EA">📋</div>
      <div class="more-content">
        <div class="more-title">Doctor Report</div>
        <div class="more-sub">30-day summary for your next visit</div>
      </div>
      <div class="more-arrow">›</div>
    </div>

    <div class="more-item" data-action="emergency">
      <div class="more-icon" style="background:#FDEAEA">🚨</div>
      <div class="more-content">
        <div class="more-title">Emergency Card</div>
        <div class="more-sub">Your diagnosis & emergency contacts</div>
      </div>
      <div class="more-arrow">›</div>
    </div>

    <div class="more-item" data-action="about">
      <div class="more-icon" style="background:#EEF0FF">ℹ️</div>
      <div class="more-content">
        <div class="more-title">About Equilibrium</div>
        <div class="more-sub">App info, privacy & disclaimer</div>
      </div>
      <div class="more-arrow">›</div>
    </div>

    <div class="card" style="margin-top:var(--sp-lg)">
      <div class="card-title" style="margin-bottom:var(--sp-md)">Settings</div>
      <div class="form-group">
        <label class="form-label">Daily sodium goal (mg)</label>
        <input type="number" class="form-input" id="set-sodium" value="${DB.settings().sodiumGoal||1500}" min="500" max="3000">
      </div>
      <div class="toggle-row">
        <span class="toggle-label">Dark mode</span>
        <label class="toggle">
          <input type="checkbox" id="set-dark" ${DB.settings().dark?'checked':''}>
          <span class="toggle-track"></span>
        </label>
      </div>
      <button class="btn btn-primary btn-full" id="btn-save-settings" style="margin-top:var(--sp-sm)">Save Settings</button>
    </div>

    <p style="text-align:center;font-size:11px;color:var(--text-m);margin-top:var(--sp-lg);line-height:1.6">
      Equilibrium v1.0 · All data stays on your device
    </p>
  `;

  qs('#btn-save-settings').addEventListener('click', () => {
    const s = DB.settings();
    s.sodiumGoal = +qs('#set-sodium').value || 1500;
    s.dark = qs('#set-dark').checked;
    DB.saveSettings(s);
    applyTheme(s.dark);
    showToast('Settings saved');
  });

  qs('#set-dark').addEventListener('change', function() {
    applyTheme(this.checked);
  });
}

// ── MEDICATIONS PANEL ──────────────────────────────────────────────
function renderMedicationsPanel() {
  const meds  = DB.meds();
  const t     = today();
  const doses  = DB.dosesFor(t);
  const el    = qs('#panel-meds-body');

  // Build today's dose schedule
  const schedule = [];
  meds.forEach(m => {
    (m.times||[]).forEach(time => {
      const dose = doses.find(d=>d.medId===m.id&&d.time===time);
      schedule.push({med:m, time, taken:dose?.taken, missed:dose&&!dose.taken});
    });
  });
  schedule.sort((a,b)=>a.time.localeCompare(b.time));

  el.innerHTML = `
    ${meds.length === 0 ? `
      <div class="empty">
        <div class="empty-icon">💊</div>
        <div class="empty-title">No medications added yet</div>
        <div class="empty-text">Add your Ménière's medications to track doses and stay on schedule.</div>
      </div>` : ''}

    ${schedule.length > 0 ? `
      <div style="margin-bottom:var(--sp-md)">
        <div style="font-size:12px;font-weight:700;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Today's Schedule</div>
        ${schedule.map(item=>`
          <div class="dose-item">
            <div class="dose-time">${item.time}</div>
            <div class="dose-name">
              <div class="dose-name-text">${item.med.name}</div>
              <div class="dose-dosage">${item.med.dosage} · <span class="med-badge">${item.med.type}</span></div>
            </div>
            <button class="dose-check ${item.taken?'taken':item.missed?'missed':''}"
              data-action="toggle-dose"
              data-med="${item.med.id}" data-time="${item.time}" data-taken="${item.taken?'true':'false'}">
              ${item.taken?'✓':item.missed?'✕':'○'}
            </button>
          </div>`).join('')}
      </div>` : ''}

    ${meds.length > 0 ? `
      <div class="divider"></div>
      <div style="font-size:12px;font-weight:700;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;margin-top:var(--sp-md)">All Medications</div>
      ${meds.map(m=>`
        <div class="list-item">
          <div class="list-icon">💊</div>
          <div class="list-content">
            <div class="list-title">${m.name} <span class="med-badge">${m.type}</span></div>
            <div class="list-sub">${m.dosage} · ${(m.times||[]).join(', ')}</div>
          </div>
          <div class="list-actions">
            <button class="btn-icon" data-action="del-med" data-id="${m.id}" style="font-size:14px;color:var(--text-m)">🗑</button>
          </div>
        </div>`).join('')}` : ''}
  `;
}

function renderAddMedPanel() {
  const bodyEl = qs('#panel-add-med-body');
  bodyEl.innerHTML = `
    <form id="form-add-med">
      <div class="form-group">
        <label class="form-label">Medication name</label>
        <input type="text" class="form-input" name="name" placeholder="e.g. Betahistine" required>
      </div>
      <div class="form-group">
        <label class="form-label">Dosage</label>
        <input type="text" class="form-input" name="dosage" placeholder="e.g. 16mg" required>
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="form-input" name="type">
          ${MED_TYPES.map(t=>`<option value="${t}">${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" id="times-group">
        <label class="form-label">Dose times</label>
        <div id="times-list">
          <input type="time" class="form-input" name="times" value="08:00" style="margin-bottom:8px">
        </div>
        <button type="button" class="btn btn-ghost btn-sm" id="btn-add-time" style="margin-top:4px">+ Add another time</button>
      </div>
    </form>
  `;

  qs('#btn-add-time').addEventListener('click', () => {
    const inp = document.createElement('input');
    inp.type = 'time'; inp.className = 'form-input'; inp.name = 'times';
    inp.style.marginBottom = '8px';
    qs('#times-list').appendChild(inp);
  });
}

// ── TRIGGER INSIGHTS PANEL ────────────────────────────────────────
function renderTriggersPanel() {
  const attacks = DB.attacks();
  const el = qs('#panel-triggers-body');

  if (attacks.length < 3) {
    el.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">Not enough data yet</div>
        <div class="empty-text">Log at least 3 attacks to start seeing trigger patterns. Keep tracking — insights will appear soon.</div>
      </div>`;
    return;
  }

  // Analyze triggers: for each attack, look at the day before
  let total = attacks.length;
  let counts = {sodium:0, stress:0, sleep:0, caffeine:0, alcohol:0};
  let totalSodium = 0, sodiumDays = 0;

  attacks.forEach(a => {
    const prev = prevDate(a.date);
    const sGoal = DB.settings().sodiumGoal || SODIUM_GOAL;
    const s = DB.totalSodium(prev);
    const str = DB.stressFor(prev);
    const slp = DB.sleepFor(prev);
    const ca  = DB.caffFor(prev);
    if (s > sGoal * 0.9) counts.sodium++;
    if (str && str.level >= 7) counts.stress++;
    if (slp && slp.quality <= 2) counts.sleep++;
    if (ca.c >= CAFFEINE_WARN) counts.caffeine++;
    if (ca.a >= ALCOHOL_WARN) counts.alcohol++;
    const todaySodium = DB.totalSodium(a.date);
    if (todaySodium > 0) { totalSodium += todaySodium; sodiumDays++; }
  });

  function pctStr(n) { return total > 0 ? Math.round(n/total*100) : 0; }
  const triggers = [
    {label:'High sodium (day before)', icon:'🧂', pct:pctStr(counts.sodium), count:counts.sodium},
    {label:'High stress (day before)', icon:'😰', pct:pctStr(counts.stress), count:counts.stress},
    {label:'Poor sleep (night before)', icon:'😴', pct:pctStr(counts.sleep), count:counts.sleep},
    {label:'Caffeine (day before)', icon:'☕', pct:pctStr(counts.caffeine), count:counts.caffeine},
    {label:'Alcohol (day before)', icon:'🍷', pct:pctStr(counts.alcohol), count:counts.alcohol},
  ].sort((a,b)=>b.pct-a.pct);

  const topTriggers = triggers.filter(t=>t.pct>=30);

  // Week-by-week frequency
  const weeks = {};
  attacks.forEach(a => {
    const d = new Date(a.date+'T12:00:00');
    const wk = `W${Math.ceil(d.getDate()/7)} ${d.toLocaleDateString('en-US',{month:'short'})}`;
    weeks[wk] = (weeks[wk]||0) + 1;
  });

  el.innerHTML = `
    <div style="margin-bottom:var(--sp-lg)">
      <div style="font-size:12px;font-weight:700;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;margin-bottom:var(--sp-md)">Analysis based on ${total} logged attacks</div>

      ${topTriggers.length > 0 ? `
        <div class="card" style="background:var(--warning-light);margin-bottom:var(--sp-md)">
          <div class="card-title" style="margin-bottom:8px">⚠️ Your Top Triggers</div>
          ${topTriggers.map(t=>`<div style="margin-bottom:4px">• ${t.icon} ${t.label} (${t.pct}% of attacks)</div>`).join('')}
        </div>` : `
        <div class="card" style="background:var(--success-light);margin-bottom:var(--sp-md)">
          <div class="card-title">✅ No strong patterns found yet</div>
          <div style="font-size:14px;margin-top:6px">Keep logging and patterns will emerge over time.</div>
        </div>`}

      <div style="font-size:12px;font-weight:700;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;margin-bottom:var(--sp-md)">Trigger correlation</div>
      ${triggers.map(t=>`
        <div class="trigger-bar">
          <div class="trigger-label"><span>${t.icon} ${t.label}</span><span>${t.pct}% (${t.count}/${total})</span></div>
          <div class="meter-bar">
            <div class="meter-fill ${t.pct>=50?'danger':t.pct>=30?'warn':''}" style="width:${t.pct}%"></div>
          </div>
        </div>`).join('')}
    </div>

    <div style="font-size:12px;font-weight:700;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;margin-bottom:var(--sp-md)">Attack frequency</div>
    <div class="chart-wrap"><canvas id="chart-triggers"></canvas></div>

    <p style="font-size:12px;color:var(--text-m);margin-top:var(--sp-md);line-height:1.6">
      Trigger correlation shows how often a factor was present the day before an attack. Factors with 30%+ are likely meaningful triggers for you.
    </p>
  `;

  setTimeout(() => {
    const canvas = qs('#chart-triggers'); if (!canvas) return;
    const last30 = DB.attacks().filter(a=>a.date>=daysAgo(30));
    const lbls=[], vals=[];
    for (let i=29;i>=0;i--) {
      const d=daysAgo(i);
      lbls.push(i%5===0?(i===0?'Today':new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'numeric',day:'numeric'})):'');
      vals.push(last30.filter(a=>a.date===d).length);
    }
    new Chart(canvas.getContext('2d'),{
      type:'bar',data:{labels:lbls,datasets:[{data:vals,backgroundColor:'rgba(240,192,96,0.7)',borderColor:'#F0C060',borderWidth:2,borderRadius:4}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
        scales:{x:{grid:{display:false},ticks:{font:{size:10},color:'#6B8A83'}},
                y:{beginAtZero:true,ticks:{stepSize:1,font:{size:10},color:'#6B8A83'},grid:{color:'rgba(0,0,0,0.05)'}}}}
    });
  }, 50);
}

// ── DOCTOR REPORT PANEL ────────────────────────────────────────────
function renderReportPanel() {
  const el = qs('#panel-report-body');
  const days = 30;
  const from = daysAgo(days);
  const t = today();

  const attacks = DB.attacks().filter(a=>a.date>=from);
  const avgIntensity = attacks.length ? (attacks.reduce((s,a)=>s+a.intensity,0)/attacks.length).toFixed(1) : 'N/A';
  const avgDuration  = attacks.length ? Math.round(attacks.reduce((s,a)=>s+(a.duration||0),0)/attacks.length) : 'N/A';

  // Sodium averages
  let sodiumTotal=0, sodiumDays=0;
  for (let i=0;i<days;i++) {
    const d=daysAgo(i); const s=DB.totalSodium(d);
    if (s>0){sodiumTotal+=s;sodiumDays++;}
  }
  const avgSodium = sodiumDays ? Math.round(sodiumTotal/sodiumDays) : 'N/A';

  // Sleep averages
  let sleepTotal=0, sleepDays=0;
  for (let i=0;i<days;i++) {
    const sl=DB.sleepFor(daysAgo(i));
    if (sl){sleepTotal+=sl.duration||0;sleepDays++;}
  }
  const avgSleep = sleepDays ? (sleepTotal/sleepDays).toFixed(1) : 'N/A';

  // Stress averages
  let stressTotal=0, stressDays=0;
  for (let i=0;i<days;i++) {
    const s=DB.stressFor(daysAgo(i));
    if (s){stressTotal+=s.level;stressDays++;}
  }
  const avgStress = stressDays ? (stressTotal/stressDays).toFixed(1) : 'N/A';

  // Medication adherence
  const meds = DB.meds();
  let totalDoses=0, takenDoses=0;
  for (let i=0;i<days;i++) {
    const d = daysAgo(i);
    const doses = DB.dosesFor(d);
    meds.forEach(m => {
      (m.times||[]).forEach(time => {
        totalDoses++;
        const dose = doses.find(dd=>dd.medId===m.id&&dd.time===time);
        if (dose?.taken) takenDoses++;
      });
    });
  }
  const adherencePct = totalDoses > 0 ? Math.round(takenDoses/totalDoses*100) : 'N/A';

  const reportDate = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
  const e = DB.emergency();

  const reportText = `EQUILIBRIUM HEALTH REPORT
Generated: ${reportDate}
Patient: ${e.name || '(name not set)'}
Diagnosis: ${e.diagnosis || "Ménière's Disease"}
Doctor: ${e.doctor || '(not set)'}

PERIOD: Last ${days} days
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VERTIGO ATTACKS (${days} days)
• Total attacks: ${attacks.length}
• Average intensity: ${avgIntensity}/10
• Average duration: ${typeof avgDuration === 'number' ? fmtDur(avgDuration) : 'N/A'}
${attacks.length>0?`• Most intense: ${Math.max(...attacks.map(a=>a.intensity))}/10`:''}
${attacks.length>0?`• Attack dates: ${attacks.slice(0,8).map(a=>a.date).join(', ')}${attacks.length>8?'...':''}`:''}

DIET & SODIUM
• Average daily sodium: ${avgSodium}${typeof avgSodium === 'number' ? 'mg' : ''}
• Sodium goal: <${DB.settings().sodiumGoal||1500}mg/day

MEDICATION ADHERENCE
${meds.length>0 ? meds.map(m=>`• ${m.name} ${m.dosage} (${m.type}): ${m.times?.join(', ')}`).join('\n') : '• No medications logged'}
${totalDoses>0 ? `• Overall adherence: ${adherencePct}% (${takenDoses}/${totalDoses} doses)` : ''}

SLEEP
• Average sleep: ${avgSleep}${typeof avgSleep === 'number' ? ' hours/night' : ''}

STRESS
• Average stress level: ${avgStress}${typeof avgStress === 'number' ? '/10' : ''}

CURRENT MEDICATIONS
${e.medications || meds.map(m=>`${m.name} ${m.dosage}`).join(', ') || '(not set)'}

NOTES FOR PROVIDER
[Add any specific concerns or questions here before your appointment]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by Equilibrium — Ménière's Companion App`;

  el.innerHTML = `
    <div class="report-section">
      <h3>Summary</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-sm);margin-bottom:var(--sp-md)">
        <div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-val">${attacks.length}</div><div class="stat-label">Attacks (30d)</div></div>
        <div class="stat-card"><div class="stat-icon">🧂</div><div class="stat-val">${avgSodium}</div><div class="stat-label">Avg sodium (mg)</div></div>
        <div class="stat-card"><div class="stat-icon">💊</div><div class="stat-val">${adherencePct}${typeof adherencePct === 'number' ? '%' : ''}</div><div class="stat-label">Adherence</div></div>
        <div class="stat-card"><div class="stat-icon">🌙</div><div class="stat-val">${avgSleep}${typeof avgSleep === 'number' ? 'h' : ''}</div><div class="stat-label">Avg sleep</div></div>
      </div>
    </div>
    <div class="report-section">
      <h3>Full Report (copy to share)</h3>
      <div class="report-box" id="report-text">${reportText}</div>
    </div>
  `;

  qs('#btn-copy-report').onclick = () => {
    navigator.clipboard.writeText(reportText).then(()=>showToast('Report copied to clipboard! 📋')).catch(()=>{
      const ta = document.createElement('textarea');
      ta.value = reportText; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      showToast('Report copied! 📋');
    });
  };
}

// ── EMERGENCY CARD PANEL ───────────────────────────────────────────
function renderEmergencyPanel() {
  const e  = DB.emergency();
  const el = qs('#panel-emergency-body');

  el.innerHTML = `
    ${e.name || e.doctor ? `
    <div class="e-card" style="margin-bottom:var(--sp-md)">
      <div class="e-card-title">🚨 Emergency Card</div>
      ${e.name ? `<div class="e-field"><div class="e-field-label">Patient Name</div><div class="e-field-val">${e.name}</div></div>` : ''}
      ${e.diagnosis ? `<div class="e-field"><div class="e-field-label">Diagnosis</div><div class="e-field-val">${e.diagnosis}</div></div>` : ''}
      ${e.medications ? `<div class="e-field"><div class="e-field-label">Current Medications</div><div class="e-field-val">${e.medications}</div></div>` : ''}
      ${e.doctor ? `<div class="e-field"><div class="e-field-label">Doctor</div><div class="e-field-val">${e.doctor}${e.doctorPhone?' · '+e.doctorPhone:''}</div></div>` : ''}
      ${e.emergencyContact ? `<div class="e-field"><div class="e-field-label">Emergency Contact</div><div class="e-field-val">${e.emergencyContact}${e.emergencyPhone?' · '+e.emergencyPhone:''}</div></div>` : ''}
      ${e.notes ? `<div class="e-field"><div class="e-field-label">Notes</div><div class="e-field-val">${e.notes}</div></div>` : ''}
    </div>` : ''}

    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-md)">Edit Emergency Card</div>
      <form id="form-emergency">
        <div class="form-group">
          <label class="form-label">Your name</label>
          <input type="text" class="form-input" name="name" value="${e.name||''}" placeholder="Your full name">
        </div>
        <div class="form-group">
          <label class="form-label">Diagnosis</label>
          <input type="text" class="form-input" name="diagnosis" value="${e.diagnosis||"Ménière's Disease"}" placeholder="Ménière's Disease">
        </div>
        <div class="form-group">
          <label class="form-label">Current medications</label>
          <textarea class="form-input" name="medications" placeholder="List your medications and dosages">${e.medications||''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Doctor's name</label>
          <input type="text" class="form-input" name="doctor" value="${e.doctor||''}" placeholder="Dr. Smith">
        </div>
        <div class="form-group">
          <label class="form-label">Doctor's phone</label>
          <input type="tel" class="form-input" name="doctorPhone" value="${e.doctorPhone||''}" placeholder="555-0100">
        </div>
        <div class="form-group">
          <label class="form-label">Emergency contact name</label>
          <input type="text" class="form-input" name="emergencyContact" value="${e.emergencyContact||''}" placeholder="Jane Doe">
        </div>
        <div class="form-group">
          <label class="form-label">Emergency contact phone</label>
          <input type="tel" class="form-input" name="emergencyPhone" value="${e.emergencyPhone||''}" placeholder="555-0199">
        </div>
        <div class="form-group">
          <label class="form-label">Additional notes</label>
          <textarea class="form-input" name="notes" placeholder="Allergies, special instructions...">${e.notes||''}</textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-full">Save Emergency Card</button>
      </form>
    </div>
  `;

  qs('#form-emergency').addEventListener('submit', ev => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const data = Object.fromEntries(fd.entries());
    DB.saveEmergency(data);
    renderEmergencyPanel();
    showToast('Emergency card saved 🚨');
  });
}

// ── FOOD SEARCH PANEL ──────────────────────────────────────────────
let _foodSearchTimer = null;

function renderFoodSearch() {
  openPanel('panel-food-search', () => {
    qs('#food-search-input').value = '';
    renderFoodResults('');
    qs('#food-search-input').focus();
  });
}

function foodItemHTML(f, sourceLabel) {
  const flagClass = f.s > 600 ? 'var(--danger)' : f.s > 300 ? 'var(--warning)' : 'var(--p)';
  const data = JSON.stringify({n:f.n, s:f.s, srv:f.srv||'1 serving', f:!!f.f});
  return `
    <div class="food-item food-item-edit">
      <div class="food-item-info">
        <div class="food-name">${f.n}</div>
        <div class="food-serving">${f.srv}${sourceLabel ? ` · <span style="color:var(--text-m);font-style:italic">${sourceLabel}</span>` : ''}</div>
        ${f.f ? '<div class="food-flag">⚠️ HIGH SODIUM</div>' : ''}
      </div>
      <div class="food-item-add">
        <input type="number" class="form-input food-sodium-edit" value="${f.s}" min="0" max="9999" data-orig="${f.s}">
        <span class="food-sodium-unit">mg</span>
        <button class="btn btn-primary btn-sm food-add-btn" data-food='${data}'>Add</button>
      </div>
    </div>`;
}

function customFoodSection() {
  return `
    <div class="divider" style="margin:var(--sp-md) 0"></div>
    <div style="padding-bottom:var(--sp-md)">
      <div style="font-size:13px;font-weight:700;color:var(--text-m);margin-bottom:8px">Add custom food</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <input type="text" class="form-input" id="custom-food-name" placeholder="Food name" style="flex:2;min-width:120px">
        <input type="number" class="form-input" id="custom-food-sodium" placeholder="mg Na" style="flex:1;min-width:60px">
        <button class="btn btn-primary" id="btn-custom-food">Add</button>
      </div>
    </div>`;
}

function renderFoodResults(query) {
  const el = qs('#food-search-results');
  const q = query.toLowerCase().trim();
  const localResults = q.length === 0
    ? FOOD_DB.slice(0, 20)
    : FOOD_DB.filter(f => f.n.toLowerCase().includes(q));

  let html = '';
  if (localResults.length > 0) {
    html += `<div style="font-size:11px;font-weight:700;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;padding:var(--sp-sm) 0 4px">Common foods</div>`;
    html += localResults.map(f => foodItemHTML(f, '')).join('');
  }

  if (q.length >= 2) {
    html += `<div id="api-results-section">
      <div style="font-size:11px;font-weight:700;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;padding:var(--sp-md) 0 4px">Database results</div>
      <div id="api-results-inner"><div class="food-loading">Searching…</div></div>
    </div>`;
  }

  if (!localResults.length && q.length < 2) {
    html += `<div class="empty"><div class="empty-icon">🔎</div><div class="empty-title">Start typing to search</div></div>`;
  }

  html += customFoodSection();
  el.innerHTML = html;
  setupFoodAddButtons(el);
  setupCustomFood();

  if (q.length >= 2) {
    fetchFoodAPI(q);
  }
}

async function fetchFoodAPI(query) {
  const innerEl = qs('#api-results-inner');
  if (!innerEl) return;
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&fields=product_name,nutriments,serving_size&page_size=8&lc=en`;
    const resp = await fetch(url, {signal: AbortSignal.timeout(8000)});
    const data = await resp.json();
    const el = qs('#api-results-inner');
    if (!el) return; // panel closed

    const products = (data.products || []).filter(p => p.product_name && p.nutriments?.sodium_100g != null);
    if (!products.length) {
      el.innerHTML = '<div style="font-size:13px;color:var(--text-m);padding:8px 0">No database results found</div>';
      return;
    }

    const items = products.map(p => {
      const sodium100g = p.nutriments.sodium_100g; // grams per 100g
      let sodiumMg = Math.round(sodium100g * 1000); // mg per 100g
      let srv = '100g';
      const servMatch = (p.serving_size || '').match(/(\d+\.?\d*)\s*g/i);
      if (servMatch) {
        const servG = parseFloat(servMatch[1]);
        sodiumMg = Math.round(sodium100g * servG * 10);
        srv = p.serving_size;
      }
      return {n: p.product_name, s: sodiumMg, srv, f: sodiumMg > 600};
    });

    el.innerHTML = items.map(f => foodItemHTML(f, 'Open Food Facts')).join('');
    setupFoodAddButtons(el);
  } catch {
    const el = qs('#api-results-inner');
    if (el) el.innerHTML = '<div style="font-size:13px;color:var(--text-m);padding:8px 0">Database unavailable — use common foods or custom entry</div>';
  }
}

function setupFoodAddButtons(container) {
  // Sync sodium edit inputs with their Add button data
  container.querySelectorAll('.food-item-edit').forEach(item => {
    const input = item.querySelector('.food-sodium-edit');
    const btn   = item.querySelector('.food-add-btn');
    if (!input || !btn) return;
    input.addEventListener('input', () => {
      try {
        const food = JSON.parse(btn.dataset.food);
        food.s = parseInt(input.value) || 0;
        food.f = food.s > 600;
        btn.dataset.food = JSON.stringify(food);
      } catch {}
    });
    btn.addEventListener('click', () => {
      try {
        const food = JSON.parse(btn.dataset.food);
        food.s = parseInt(input.value) || 0;
        food.f = food.s > 600;
        addFoodToLog(food);
      } catch {}
    });
  });
}

function setupCustomFood() {
  const btn = qs('#btn-custom-food');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const name   = qs('#custom-food-name').value.trim();
    const sodium = parseInt(qs('#custom-food-sodium').value);
    if (!name || isNaN(sodium)) { showToast('Enter a name and sodium amount'); return; }
    addFoodToLog({n:name, s:sodium, srv:'1 serving', f: sodium > 600});
  });
}

function addFoodToLog(food) {
  DB.addSodiumItem(S.viewDate, food);
  closePanel();
  const currentTab = S.tab;
  if (currentTab === 'diet') renderDiet();
  else if (currentTab === 'home') renderHome();
  showToast(`+${food.s}mg sodium logged`);
}

// ── CALENDAR PICKER ──────────────────────────────────────────────
const Cal = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(), // 0-indexed
  mode: 'days', // 'days' | 'picker'

  open() {
    const d = new Date(S.viewDate + 'T12:00:00');
    this.year  = d.getFullYear();
    this.month = d.getMonth();
    this.mode  = 'days';
    this.render();
    qs('#cal-overlay').classList.add('on');
  },

  close() {
    qs('#cal-overlay').classList.remove('on');
  },

  renderPicker() {
    const now = new Date();
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const isPastLimit = this.year <= 2020;
    const isFutureLimit = this.year >= now.getFullYear();
    qs('#cal-modal').innerHTML = `
      <div class="cal-hdr">
        <button class="cal-nav-btn" id="cal-yr-prev" ${isPastLimit ? 'disabled' : ''}>‹</button>
        <div class="cal-month-lbl" style="cursor:default">${this.year}</div>
        <button class="cal-nav-btn" id="cal-yr-next" ${isFutureLimit ? 'disabled' : ''}>›</button>
      </div>
      <div class="cal-month-grid">
        ${MONTHS.map((m, i) => {
          const isFuture = this.year === now.getFullYear() && i > now.getMonth();
          const isSel    = this.year === new Date(S.viewDate+'T12:00:00').getFullYear() && i === new Date(S.viewDate+'T12:00:00').getMonth();
          return `<button class="cal-mon-btn${isSel?' selected':''}${isFuture?' disabled':''}" data-mi="${i}" ${isFuture?'disabled':''}>${m}</button>`;
        }).join('')}
      </div>
      <div class="cal-close-row">
        <button class="btn btn-ghost btn-full btn-sm" id="cal-close-btn">Close</button>
      </div>
    `;
    qs('#cal-yr-prev').onclick = () => { this.year--; this.renderPicker(); };
    qs('#cal-yr-next').onclick = () => { this.year++; this.renderPicker(); };
    qs('#cal-close-btn').onclick = () => this.close();
    qs('.cal-month-grid').addEventListener('click', e => {
      const btn = e.target.closest('[data-mi]');
      if (!btn || btn.disabled) return;
      this.month = +btn.dataset.mi;
      this.mode  = 'days';
      this.render();
    });
  },

  render() {
    if (this.mode === 'picker') { this.renderPicker(); return; }
    const now      = new Date();
    const todayStr = today();
    const year     = this.year;
    const month    = this.month;

    // First day of month & total days
    const firstDay  = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMon = new Date(year, month + 1, 0).getDate();
    const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {month:'long', year:'numeric'});

    // Gather days that have logged data (attacks or sodium)
    const attacks = DB.attacks();
    const sodiumLog = DB.sodiumLog();
    const dataDays = new Set([
      ...attacks.map(a => a.date),
      ...Object.keys(sodiumLog).filter(d => (sodiumLog[d]?.items||[]).length > 0),
    ]);

    // Can't go before earliest data or below year 2020
    const isFirstMonth = (year === 2020 && month === 0);
    // Can't go past current month
    const isCurrMonth  = (year === now.getFullYear() && month === now.getMonth());

    // Build day cells — use grid-column-start on day 1 instead of empty filler cells
    let cells = '';
    for (let d = 1; d <= daysInMon; d++) {
      const dateStr  = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isFuture = dateStr > todayStr;
      const isToday  = dateStr === todayStr;
      const isSel    = dateStr === S.viewDate;
      const hasData  = dataDays.has(dateStr);
      const cls = [
        'cal-day',
        isFuture ? 'future' : '',
        isToday  ? 'is-today' : '',
        isSel    ? 'selected' : '',
        hasData && !isSel ? 'has-data' : '',
      ].filter(Boolean).join(' ');
      const style = d === 1 && firstDay > 0 ? ` style="grid-column-start:${firstDay + 1}"` : '';
      cells += `<div class="${cls}" data-pick="${dateStr}"${style}>${d}</div>`;
    }

    qs('#cal-modal').innerHTML = `
      <div class="cal-hdr">
        <button class="cal-nav-btn" id="cal-prev" ${isFirstMonth ? 'disabled' : ''}>‹</button>
        <div class="cal-month-lbl cal-month-lbl-btn" id="cal-month-lbl" title="Pick month & year">${monthLabel} ▾</div>
        <button class="cal-nav-btn" id="cal-next" ${isCurrMonth ? 'disabled' : ''}>›</button>
      </div>
      <div class="cal-dow-row">
        ${['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>`<div class="cal-dow">${d}</div>`).join('')}
      </div>
      <div class="cal-grid">${cells}</div>
      <div class="cal-legend">
        <span><span class="cal-legend-dot" style="background:var(--p)"></span>Selected / Today</span>
        <span><span class="cal-legend-dot" style="background:var(--accent)"></span>Has logged data</span>
      </div>
      <div class="cal-close-row">
        <button class="btn btn-ghost btn-full btn-sm" id="cal-close-btn">Close</button>
      </div>
    `;

    qs('#cal-prev').onclick = () => {
      if (this.month === 0) { this.year--; this.month = 11; }
      else this.month--;
      this.render();
    };
    qs('#cal-next').onclick = () => {
      if (this.month === 11) { this.year++; this.month = 0; }
      else this.month++;
      this.render();
    };
    qs('#cal-month-lbl').onclick = () => { this.mode = 'picker'; this.renderPicker(); };
    qs('#cal-close-btn').onclick = () => this.close();

    // Day picks
    qs('#cal-modal').addEventListener('click', e => {
      const pick = e.target.closest('[data-pick]')?.dataset.pick;
      if (!pick) return;
      S.viewDate = pick;
      this.close();
      const renders = {home:renderHome, symptoms:renderSymptoms, diet:renderDiet, wellness:renderWellness};
      renders[S.tab]?.();
    }, {once: true});
  },
};

// ── THEME ────────────────────────────────────────────────────────
function applyTheme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  qs('#meta-theme').content = dark ? '#1A2E29' : '#5B9B8A';
}

// ── EVENT DELEGATION (main) ───────────────────────────────────────
document.addEventListener('click', e => {
  // Tab navigation
  const navItem = e.target.closest('.nav-item');
  if (navItem?.dataset.tab) { switchTab(navItem.dataset.tab); return; }

  // data-go (quick tab switch from home)
  const goEl = e.target.closest('[data-go]');
  if (goEl) { switchTab(goEl.dataset.go); return; }

  // data-action
  const act = e.target.closest('[data-action]')?.dataset.action;
  if (act) {
    switch(act) {
      case 'prev-day': {
        S.viewDate = shiftDate(S.viewDate, -1);
        const renders = {home:renderHome,symptoms:renderSymptoms,diet:renderDiet,wellness:renderWellness};
        renders[S.tab]?.();
        break;
      }
      case 'next-day': {
        if (S.viewDate < today()) {
          S.viewDate = shiftDate(S.viewDate, 1);
          const renders = {home:renderHome,symptoms:renderSymptoms,diet:renderDiet,wellness:renderWellness};
          renders[S.tab]?.();
        }
        break;
      }
      case 'food-search': renderFoodSearch(); break;
      case 'medications': openPanel('panel-medications', renderMedicationsPanel); break;
      case 'triggers':    openPanel('panel-triggers', renderTriggersPanel); break;
      case 'report':      openPanel('panel-report', renderReportPanel); break;
      case 'emergency':   openPanel('panel-emergency', renderEmergencyPanel); break;
      case 'log-attack':  openPanel('panel-log-attack', ()=>renderLogAttackPanel(null)); break;
      case 'add-med':     openPanel('panel-add-med', renderAddMedPanel); break;
      case 'about':       openPanel('panel-about', renderAboutPanel); break;

      case 'mood': {
        const m = e.target.closest('[data-mood]')?.dataset.mood;
        if (m) { qsa('.mood-btn').forEach(b=>b.classList.toggle('selected',b.dataset.mood===m)); }
        break;
      }
      case 'water-glass': {
        const g = +e.target.closest('[data-glass]').dataset.glass;
        const t = S.viewDate;
        const cur = DB.hydFor(t);
        const newVal = g < cur ? g : g + 1;
        DB.setHyd(t, clamp(newVal, 0, HYDRATION_GOAL));
        const prefix = e.target.closest('[data-prefix]')?.dataset.prefix || '';
        renderWaterRow(`#${prefix}-water`, DB.hydFor(t), prefix);
        if (S.tab === 'home') renderHome();
        break;
      }
      case 'caff-inc': case 'caff-dec': {
        const t=S.viewDate; const ca=DB.caffFor(t);
        ca.c = clamp(ca.c + (act.endsWith('inc')?1:-1), 0, 20);
        DB.saveCaff(t, ca);
        qs('#caff-val').textContent = ca.c;
        if (ca.c >= CAFFEINE_WARN) renderDiet();
        break;
      }
      case 'alc-inc': case 'alc-dec': {
        const t=S.viewDate; const ca=DB.caffFor(t);
        ca.a = clamp(ca.a + (act.endsWith('inc')?1:-1), 0, 20);
        DB.saveCaff(t, ca);
        qs('#alc-val').textContent = ca.a;
        if (ca.a >= ALCOHOL_WARN) renderDiet();
        break;
      }
      case 'toggle-dose': {
        const el2 = e.target.closest('[data-med]');
        const medId = el2.dataset.med;
        const time  = el2.dataset.time;
        const taken = el2.dataset.taken !== 'true';
        DB.markDose(medId, today(), time, taken);
        renderMedicationsPanel();
        showToast(taken ? 'Dose marked as taken ✓' : 'Dose unmarked');
        break;
      }
      case 'del-attack': {
        const id = e.target.closest('[data-id]').dataset.id;
        if (confirm('Delete this attack entry?')) {
          DB.delAttack(id); renderSymptoms(); showToast('Entry deleted');
        }
        break;
      }
      case 'del-sodium': {
        const id = e.target.closest('[data-id]').dataset.id;
        DB.delSodiumItem(today(), id);
        if (S.tab==='diet') renderDiet(); else renderHome();
        showToast('Food entry removed');
        break;
      }
      case 'del-med': {
        const id = e.target.closest('[data-id]').dataset.id;
        if (confirm('Remove this medication?')) {
          DB.delMed(id); renderMedicationsPanel(); showToast('Medication removed');
        }
        break;
      }

    }
    return;
  }

  // Attack button — open log panel immediately (skip timer)
  if (e.target.closest('#attack-btn')) {
    if (S.attack) {
      stopAttack(); // already timing → stop and open log
    } else {
      openPanel('panel-log-attack', () => renderLogAttackPanel(nowISO()));
    }
    return;
  }

  // Panel close
  if (e.target.closest('[data-close]') || e.target.id === 'overlay') {
    closePanel(); return;
  }

  // Open "add medication" from medications panel footer
  if (e.target.closest('#btn-open-add-med')) {
    openPanel('panel-add-med', renderAddMedPanel); return;
  }
});

// Calendar — open on date label click (event delegation since it's rendered dynamically)
document.addEventListener('click', e => {
  if (e.target.closest('.date-nav-center')) Cal.open();
});

// Calendar — close on overlay backdrop click
qs('#cal-overlay').addEventListener('click', e => {
  if (e.target === qs('#cal-overlay')) Cal.close();
});

// Logo — go home and refresh
document.getElementById('btn-home').addEventListener('click', () => {
  closePanel();
  switchTab('home');
});

// Theme toggle
document.getElementById('btn-theme').addEventListener('click', () => {
  const s = DB.settings();
  s.dark = !s.dark; DB.saveSettings(s); applyTheme(s.dark);
  qs('#btn-theme').textContent = s.dark ? '☀️' : '🌙';
});

// Food search live (debounce API calls, local results instant)
document.addEventListener('input', e => {
  if (e.target.id === 'food-search-input') {
    clearTimeout(_foodSearchTimer);
    _foodSearchTimer = setTimeout(() => renderFoodResults(e.target.value), 400);
  }
  if (e.target.id === 'intensity-slider') {
    const v = qs('#intensity-val'); if (v) v.textContent = e.target.value;
  }
});

// Form submissions
document.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;

  if (form.id === 'form-log-attack') {
    const fd = new FormData(form);
    const dur = (parseInt(fd.get('dur-h')) || 0) * 60 + (parseInt(fd.get('dur-m')) || 0);
    const startTimeStr = fd.get('startTime');
    const dateStr = fd.get('date') || today();
    const startISO = startTimeStr ? `${dateStr}T${startTimeStr}:00` : null;
    const syms = fd.getAll('symptoms');

    const attack = {
      id: uid(), date: dateStr, startTime: startISO,
      duration: dur, intensity: +fd.get('intensity'),
      symptoms: syms, notes: fd.get('notes').trim(),
    };
    DB.saveAttack(attack);
    closePanel();
    renderSymptoms();
    showToast('Attack logged ✓');
    return;
  }

  if (form.id === 'form-add-med') {
    const fd = new FormData(form);
    const times = fd.getAll('times').filter(t=>t);
    const med = {
      id: uid(), name: fd.get('name'), dosage: fd.get('dosage'),
      type: fd.get('type'), times: times,
    };
    DB.saveMed(med);
    closePanel();
    openPanel('panel-medications', renderMedicationsPanel);
    showToast('Medication added 💊');
    return;
  }
});

// ── TUTORIAL ──────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    icon: '🌊',
    title: 'Welcome to Equilibrium',
    body: 'Your personal companion for managing Ménière\'s disease. This quick tour shows you how to get the most out of the app.',
  },
  {
    icon: '🏠',
    title: 'Your Daily Dashboard',
    body: 'The <strong>Home</strong> tab shows today\'s sodium, hydration, attacks this week, and stress level. Use the ← → arrows to review past days.',
  },
  {
    icon: '⚡',
    title: 'Log Attacks',
    body: 'On the <strong>Symptoms</strong> tab, tap the attack button to open the log form instantly. Record intensity (1–10), duration, and which symptoms you experienced.',
  },
  {
    icon: '🧂',
    title: 'Track Your Sodium',
    body: 'The <strong>Diet</strong> tab lets you search foods and log sodium. Type any food name — the app suggests amounts from a database you can always edit before adding.',
  },
  {
    icon: '🌿',
    title: 'Daily Wellness Check-In',
    body: 'On the <strong>Wellness</strong> tab, log your stress level, mood, sleep, and trigger beverages like caffeine and alcohol every day.',
  },
  {
    icon: '☰',
    title: 'More Tools',
    body: 'The <strong>More</strong> tab has Medications, Trigger Insights, a Doctor Report you can copy for appointments, an Emergency Card, and Settings.',
  },
];

const Tutorial = {
  current: 0,

  show() {
    this.current = 0;
    qs('#tutorial-overlay').classList.remove('hidden');
    this.render();
  },

  hide() {
    qs('#tutorial-overlay').classList.add('hidden');
  },

  markSeen() {
    localStorage.setItem(K.tutorialSeen, '1');
    this.hide();
  },

  render() {
    const step  = TUTORIAL_STEPS[this.current];
    const total = TUTORIAL_STEPS.length;
    const isLast = this.current === total - 1;

    qs('#tutorial-step').innerHTML = `
      <div class="tut-icon">${step.icon}</div>
      <div class="tut-title">${step.title}</div>
      <div class="tut-body">${step.body}</div>
    `;

    // Dots
    qs('#tutorial-dots').innerHTML = TUTORIAL_STEPS.map((_, i) =>
      `<div class="tut-dot${i === this.current ? ' active' : ''}"></div>`
    ).join('');

    // Buttons
    qs('#btn-tut-prev').style.visibility = this.current > 0 ? 'visible' : 'hidden';
    qs('#btn-tut-next').textContent = isLast ? "Let's go! 🌊" : 'Next →';
  },
};

// Tutorial button wiring (runs once after DOM ready)
function initTutorial() {
  qs('#btn-tut-skip').addEventListener('click', () => Tutorial.markSeen());
  qs('#btn-tut-next').addEventListener('click', () => {
    if (Tutorial.current < TUTORIAL_STEPS.length - 1) {
      Tutorial.current++;
      Tutorial.render();
    } else {
      Tutorial.markSeen();
    }
  });
  qs('#btn-tut-prev').addEventListener('click', () => {
    if (Tutorial.current > 0) { Tutorial.current--; Tutorial.render(); }
  });
}

// ── INIT ──────────────────────────────────────────────────────────
function init() {
  // Restore active attack from storage (page reload resilience)
  const saved = DB.g(K.activeAttack);
  if (saved) {
    S.attack = {id: saved.id, startISO: saved.startISO, interval: setInterval(updateAttackClock, 1000)};
  }

  // Apply theme
  const settings = DB.settings();
  applyTheme(settings.dark);
  qs('#btn-theme').textContent = settings.dark ? '☀️' : '🌙';

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }

  // Wire tutorial buttons
  initTutorial();

  // Initial render
  switchTab('home');

  // Show tutorial on first launch
  if (!localStorage.getItem(K.tutorialSeen)) {
    setTimeout(() => Tutorial.show(), 400);
  }
}

document.addEventListener('DOMContentLoaded', init);
