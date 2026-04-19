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
  activeAttack:'eq_active_attack', tutorialSeen:'eq_tutorial_ver',
  badges:'eq_badges',
  notifLast:'eq_notif_last',
  weeklySummaryShown:'eq_week_summary',
  pressure:'eq_pressure',
  onboarding:'eq_onboarding',
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

const ONBOARDING_TASKS = [
  {id:'log_meal',    label:'Log a meal',              desc:'Open Diet → search and add a food item'},
  {id:'log_water',   label:'Log 4+ glasses of water', desc:'Tap the water glasses on the Home or Diet tab'},
  {id:'add_med',     label:'Add a medication',         desc:'Go to More → Medications → Add'},
  {id:'stress_in',   label:'Complete a stress check-in', desc:'Tap Wellness → save your mood and stress level'},
  {id:'log_sleep',   label:'Log your sleep',          desc:'Go to Wellness → save your sleep hours'},
  {id:'no_attack',   label:'Mark today attack-free',  desc:'If you have no attack today, just keep logging'},
  {id:'tutorial',    label:'Finish the app tour',     desc:'Go to More → About → View Tutorial'},
];

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
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const nowISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`; };
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
  s(k,v){localStorage.setItem(k,JSON.stringify(v)); window.FireSync?.push(k,v);},

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

// ── STREAKS & BADGES ──────────────────────────────────────────────
function hasDataForDate(d) {
  if (DB.attacks().some(a => a.date === d)) return true;
  if ((DB.sodiumFor(d).items || []).length > 0) return true;
  if (DB.stressFor(d)) return true;
  if (DB.sleepFor(d)) return true;
  if (DB.hydFor(d) > 0) return true;
  const caff = DB.caffFor(d);
  if (caff.c > 0 || caff.a > 0) return true;
  return false;
}

function getLoggingStreak() {
  // Counts consecutive calendar days with any logged data.
  // Starts from yesterday so the streak persists all day even before today's first log.
  // Today is added on top once the user has logged something today.
  const t = today();
  let streak = 0;
  let d = daysAgo(1); // start from yesterday
  while (hasDataForDate(d)) {
    streak++;
    const prev = new Date(d + 'T12:00:00');
    prev.setDate(prev.getDate() - 1);
    d = prev.toISOString().split('T')[0];
    if (streak > 365) break;
  }
  if (hasDataForDate(t)) streak++; // include today if already logged
  return streak;
}

function getSodiumStreak() {
  const sGoal = DB.settings().sodiumGoal || SODIUM_GOAL;
  let streak = 0;
  let d = today();
  while (true) {
    const s = DB.totalSodium(d);
    const hasItems = (DB.sodiumFor(d).items || []).length > 0;
    if (!hasItems) break; // no data logged, streak ends
    if (s >= sGoal) break; // over goal, streak ends
    streak++;
    const prev = new Date(d + 'T12:00:00');
    prev.setDate(prev.getDate() - 1);
    d = prev.toISOString().split('T')[0];
    if (streak > 365) break;
  }
  return streak;
}

function getEarnedBadges() {
  const badges = [];
  const logStreak = getLoggingStreak();
  const sodStreak = getSodiumStreak();
  const attacks = DB.attacks();
  const sGoal = DB.settings().sodiumGoal || SODIUM_GOAL;
  const anyData = hasDataForDate(today()) || attacks.length > 0;

  if (anyData) badges.push({emoji:'📝', label:'First Log'});
  if (logStreak >= 3) badges.push({emoji:'🔥', label:'3-Day Streak'});
  if (logStreak >= 7) badges.push({emoji:'💪', label:'Week Warrior'});
  if (logStreak >= 30) badges.push({emoji:'🏆', label:'Month Strong'});
  if (sodStreak >= 7) badges.push({emoji:'🧂', label:'Low Sodium Week'});

  // Attack free last 7 days
  const week = daysAgo(7);
  const recentAttacks = attacks.filter(a => a.date >= week);
  if (attacks.length > 0 && recentAttacks.length === 0) badges.push({emoji:'✨', label:'Attack Free Week'});

  // Hydration hero: met goal 5 of last 7 days
  const hGoal = DB.settings().hydGoal || HYDRATION_GOAL;
  let hydDays = 0;
  for (let i = 0; i < 7; i++) {
    if (DB.hydFor(daysAgo(i)) >= hGoal) hydDays++;
  }
  if (hydDays >= 5) badges.push({emoji:'💧', label:'Hydration Hero'});

  return badges;
}

function renderStreaksCardHTML() {
  const logStreak = getLoggingStreak();
  const sodStreak = getSodiumStreak();
  const badges = getEarnedBadges();
  const logIcon = logStreak >= 3 ? '🔥' : logStreak === 0 ? '❄️' : '📆';
  const sodIcon = sodStreak >= 3 ? '🔥' : sodStreak === 0 ? '❄️' : '🧂';

  return `
    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-md)">Streaks</div>
      <div class="streak-row">
        <div class="streak-item">
          <div class="streak-num">${logIcon} ${logStreak}</div>
          <div class="streak-lbl">Logging streak</div>
        </div>
        <div class="streak-item">
          <div class="streak-num">${sodIcon} ${sodStreak}</div>
          <div class="streak-lbl">Low-sodium streak</div>
        </div>
      </div>
      ${badges.length > 0 ? `
      <div class="badge-strip">
        ${badges.map(b=>`<span class="badge-pill">${b.emoji} ${b.label}</span>`).join('')}
      </div>` : ''}
    </div>`;
}

// ── ONBOARDING CHECKLIST ─────────────────────────────────────────
function getOnboardingState() {
  return DB.g(K.onboarding) || {startDate: today(), done: {}};
}

function checkOnboardingAuto() {
  // Auto-check tasks based on current data
  const state = getOnboardingState();
  const t = today();
  let changed = false;

  if ((DB.sodiumFor(t).items || []).length > 0 && !state.done.log_meal) {
    state.done.log_meal = true; changed = true;
  }
  if (DB.hydFor(t) >= 4 && !state.done.log_water) {
    state.done.log_water = true; changed = true;
  }
  if (DB.meds().length > 0 && !state.done.add_med) {
    state.done.add_med = true; changed = true;
  }
  if (DB.stressFor(t) && !state.done.stress_in) {
    state.done.stress_in = true; changed = true;
  }
  if (DB.sleepFor(t) && !state.done.log_sleep) {
    state.done.log_sleep = true; changed = true;
  }
  if (!DB.attacks().some(a => a.date === t) && hasDataForDate(t) && !state.done.no_attack) {
    state.done.no_attack = true; changed = true;
  }
  if (localStorage.getItem(K.tutorialSeen) && !state.done.tutorial) {
    state.done.tutorial = true; changed = true;
  }
  if (changed) DB.s(K.onboarding, state);
  return state;
}

function renderOnboardingCard() {
  const state = getOnboardingState();

  // Only show for first 14 days
  const startDate = new Date(state.startDate + 'T12:00:00');
  const daysSinceStart = Math.floor((Date.now() - startDate) / 86400000);
  if (daysSinceStart > 14) return '';

  // Auto-check what's been done
  checkOnboardingAuto();
  const fresh = getOnboardingState();
  const doneCount = Object.values(fresh.done).filter(Boolean).length;
  const total = ONBOARDING_TASKS.length;

  if (doneCount >= total) {
    // All done — show celebration and don't render again after dismissal
    if (fresh.celebrated) return '';
    return `
      <div class="card" style="background:linear-gradient(135deg,var(--p),var(--p-light));color:white" id="onboarding-card">
        <div style="font-size:24px;margin-bottom:6px">🎉</div>
        <div style="font-size:17px;font-weight:800;margin-bottom:4px">You're all set!</div>
        <div style="font-size:13px;opacity:0.9;line-height:1.5;margin-bottom:var(--sp-md)">You've completed the getting-started checklist. You're now an Equilibrium pro!</div>
        <button class="btn" style="background:rgba(255,255,255,0.25);color:white;font-size:13px" id="btn-dismiss-onboarding">Got it ✓</button>
      </div>`;
  }

  return `
    <div class="card" id="onboarding-card">
      <div class="card-hdr">
        <div>
          <div class="card-title">🚀 Getting Started</div>
          <div class="card-sub">${doneCount}/${total} tasks complete</div>
        </div>
        <button class="btn btn-ghost btn-sm" id="btn-dismiss-onboarding">Hide</button>
      </div>
      <div class="onboarding-progress">
        <div class="onboarding-bar" style="width:${Math.round(doneCount/total*100)}%"></div>
      </div>
      <div style="margin-top:var(--sp-sm)">
        ${ONBOARDING_TASKS.map(task => {
          const done = fresh.done[task.id];
          return `
            <div class="onboarding-task ${done ? 'done' : ''}">
              <div class="onboarding-check">${done ? '✓' : ''}</div>
              <div>
                <div class="onboarding-label">${task.label}</div>
                ${!done ? `<div class="onboarding-desc">${task.desc}</div>` : ''}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
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

    ${renderStreaksCardHTML()}
    ${renderBackupNudge()}

    ${renderOnboardingCard()}

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
  const signedIn = window.FireSync?.isSignedIn();
  const userName = window.FireSync?.getUser()?.displayName || window.FireSync?.getUser()?.email;
  qs('#header-sub').textContent = signedIn && userName
    ? `Signed in as ${userName.split('@')[0]}`
    : "Your Ménière's Companion";
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
  const prefillM    = Math.min(59, prefillMRaw);

  const hourOpts = Array.from({length:24}, (_,i) =>
    `<option value="${i}"${i===prefillH?' selected':''}>${i}h</option>`).join('');
  const minOpts  = Array.from({length:60}, (_,m) =>
    `<option value="${m}"${m===prefillM?' selected':''}>${m}m</option>`).join('');

  const attackDate = prefillStart ? prefillStart.split('T')[0] : defaultDate;
  const attackTime = prefillStart ? new Date(prefillStart).toTimeString().slice(0,5) : defaultTime;

  bodyEl.innerHTML = `
    <form id="form-log-attack">
      <div class="form-group">
        <label class="form-label">Date</label>
        <input type="date" class="form-input" name="date" value="${attackDate}" max="${defaultDate}">
      </div>
      <div class="form-group">
        <label class="form-label">Start time</label>
        <input type="time" class="form-input" name="startTime"
          value="${attackTime}"
          ${attackDate === defaultDate ? `max="${defaultTime}"` : ''}>
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
      <div class="form-group">
        <label class="form-label">Medications today</label>
        <div class="toggle-row">
          <span class="toggle-label">I took my scheduled medications today</span>
          <label class="toggle">
            <input type="checkbox" name="medsTaken" id="chk-meds-taken">
            <span class="toggle-track"></span>
          </label>
        </div>
      </div>
    </form>
  `;

  qs('#intensity-slider').addEventListener('input', function() {
    qs('#intensity-val').textContent = this.value;
  });

  // ── Future time guard ─────────────────────────────────────────────
  const dateInput = bodyEl.querySelector('[name="date"]');
  const timeInput = bodyEl.querySelector('[name="startTime"]');

  function updateTimeMax() {
    const nowStr  = new Date().toTimeString().slice(0,5);
    const isToday = dateInput.value === today();
    if (isToday) {
      timeInput.max = nowStr;
      // If current value is already in the future, clamp it
      if (timeInput.value > nowStr) {
        timeInput.value = nowStr;
        showToast('Start time set to now — can\'t log a future attack');
      }
    } else {
      timeInput.removeAttribute('max');
    }
  }

  dateInput.addEventListener('change', updateTimeMax);
  timeInput.addEventListener('change', updateTimeMax);
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
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" data-action="scan-plate">✨ AI Camera</button>
          <button class="btn btn-ghost btn-sm" data-action="food-search">+ Add</button>
        </div>
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

    <!-- Barometric Pressure -->
    <div class="card" id="pressure-card">
      <div style="font-size:13px;color:var(--text-m)">Loading pressure data…</div>
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
  renderPressureCard(S.viewDate);
}

// ── BAROMETRIC PRESSURE ──────────────────────────────────────────
async function renderPressureCard(viewDate) {
  const el = qs('#pressure-card');
  if (!el) return;

  const todayStr  = today();
  const isToday   = !viewDate || viewDate === todayStr;
  const targetDate = viewDate || todayStr;

  el.innerHTML = `<div class="card-title" style="margin-bottom:8px">🌡️ Weather & Pressure</div><div style="font-size:13px;color:var(--text-m)">${isToday ? 'Fetching current data…' : `Loading data for ${fmtDate(targetDate)}…`}</div>`;

  const pressureLog = DB.g(K.pressure) || [];

  // Only hit the live API when viewing today
  try { if (!isToday) throw new Error('past');
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, {timeout:8000})
    );
    const {latitude: lat, longitude: lon} = pos.coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=pressure_msl,relative_humidity_2m,temperature_2m&timezone=auto`;
    const resp = await fetch(url, {signal: AbortSignal.timeout(10000)});
    const data = await resp.json();
    const hpa = Math.round(data.current?.pressure_msl || 0);
    const humidity = Math.round(data.current?.relative_humidity_2m || 0);
    const tempC = data.current?.temperature_2m;
    const tempF = tempC != null ? Math.round(tempC * 9/5 + 32) : null;

    if (hpa > 0) {
      // Store reading (one per day, today only)
      const idx = pressureLog.findIndex(p => p.date === todayStr);
      const entry = {date: todayStr, hpa, humidity, tempF, time: nowISO()};
      if (idx >= 0) pressureLog[idx] = entry;
      else pressureLog.push(entry);
      // Keep last 90 days
      while (pressureLog.length > 90) pressureLog.shift();
      DB.s(K.pressure, pressureLog);
    }
  } catch (_) { /* geolocation or network failed — just show stored data */ }

  // Render with stored data — show the target date's reading
  const stored = DB.g(K.pressure) || [];
  const current = stored.find(p => p.date === targetDate)
    || (isToday ? stored[stored.length - 1] : null);
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i);
    const p = stored.find(x => x.date === d);
    last7.push(p ? p.hpa : null);
  }

  if (!current) {
    el.innerHTML = `<div class="card-title" style="margin-bottom:8px">🌡️ Weather & Pressure</div>
      <div style="font-size:13px;color:var(--text-m)">${isToday
        ? 'Unable to fetch pressure. Allow location access to enable this feature.'
        : `No pressure data saved for ${fmtDate(targetDate)}.`
      }</div>`;
    return;
  }

  const hpa = current.hpa;
  const humidity = current.humidity || null;
  const tempF = current.tempF || null;
  const status = hpa < 1010 ? {icon:'⚠️', label:'Low pressure — possible trigger', color:'var(--warning)'}
    : hpa > 1020 ? {icon:'✅', label:'High pressure — generally stable', color:'var(--success)'}
    : {icon:'🟢', label:'Normal pressure', color:'var(--text-m)'};

  el.innerHTML = `
    <div class="card-title" style="margin-bottom:8px">🌡️ Weather & Pressure${!isToday ? ` <span style="font-size:11px;font-weight:500;color:var(--text-m)">· ${fmtDate(targetDate)}</span>` : ''}</div>
    <div style="display:flex;gap:var(--sp-md);margin-bottom:var(--sp-md);flex-wrap:wrap">
      <div class="weather-stat">
        <div class="weather-val">${hpa}<span class="weather-unit"> hPa</span></div>
        <div class="weather-lbl">Pressure</div>
      </div>
      ${humidity != null ? `<div class="weather-stat">
        <div class="weather-val">${humidity}<span class="weather-unit">%</span></div>
        <div class="weather-lbl">Humidity</div>
      </div>` : ''}
      ${tempF != null ? `<div class="weather-stat">
        <div class="weather-val">${tempF}<span class="weather-unit">°F</span></div>
        <div class="weather-lbl">Temp</div>
      </div>` : ''}
    </div>
    <div style="font-size:12px;color:${status.color};margin-bottom:var(--sp-sm)">${status.icon} ${status.label}</div>
    ${humidity != null && humidity > 75 ? '<div style="font-size:12px;color:var(--warning);font-weight:600">💧 High humidity may worsen symptoms</div>' : ''}
    <div style="font-size:11px;color:var(--text-m);margin:var(--sp-sm) 0 4px">7-day pressure trend</div>
    <canvas id="pressure-sparkline" height="40"></canvas>
  `;

  // Draw sparkline
  const canvas = qs('#pressure-sparkline');
  if (canvas) {
    const valid = last7.filter(v => v !== null);
    const minV = valid.length ? Math.min(...valid) - 5 : 1000;
    const maxV = valid.length ? Math.max(...valid) + 5 : 1030;
    canvas.width = canvas.offsetWidth || 300;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = 40;
    const points = last7.map((v, i) => ({
      x: (i / 6) * (w - 20) + 10,
      y: v !== null ? h - ((v - minV) / (maxV - minV)) * (h - 8) - 4 : null
    }));
    ctx.strokeStyle = '#5B9B8A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    points.forEach(p => {
      if (p.y === null) { started = false; return; }
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    // Dots
    points.forEach(p => {
      if (p.y === null) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#5B9B8A';
      ctx.fill();
    });
  }
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

// ── SUPPORT PAGE ─────────────────────────────────────────────────
function openSupportPage() {
  openPanel('panel-support', () => {
    qs('#panel-support-body').innerHTML = `
      <div style="text-align:center;padding:var(--sp-xl) var(--sp-lg)">
        <div style="font-size:48px;margin-bottom:var(--sp-md)">💙</div>
        <p style="font-size:14px;color:var(--text-m);line-height:1.75;margin-bottom:var(--sp-lg)">
          If you're here, thank you for using Equilibrium. Building something meaningful for the Ménière's community has been incredibly rewarding, and your presence whether you donate or not means everything to me.
        </p>
        <p style="font-size:14px;color:var(--text-m);line-height:1.75;margin-bottom:var(--sp-lg)">
          I'm committed to keeping Equilibrium free, improving it consistently, and listening to what the community needs. Every update is driven by real feedback from real people managing this condition every day.
        </p>
        <p style="font-size:15px;font-weight:600;margin-bottom:var(--sp-xl)">
          Thank you for being part of this. 💙<br>
          <span style="font-weight:400;color:var(--text-m)">— Jorge</span>
        </p>
        <a href="https://ko-fi.com/myequilibriumapp" target="_blank" rel="noopener"
          class="btn btn-primary btn-full"
          style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px">
          💙 Support on Ko-fi
        </a>
      </div>`;
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
      <div style="font-size:13px;color:var(--text-m);margin-top:4px">Your Ménière's Companion · v1.4</div>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-md)">💛 Why Equilibrium Exists</div>
      <p style="font-size:14px;line-height:1.75;color:var(--text-m)">In 2020, our life changed.</p>
      <p style="font-size:14px;line-height:1.75;color:var(--text-m);margin-top:var(--sp-sm)">My wife started experiencing symptoms of Ménière's disease, and nothing has been quite the same since. I don't understand what it's physically like to live with Ménière's, but I have lived every side of this condition with her. The fear of not knowing when the next drop attack will come. The vertigo that arrives without warning and takes everything with it. The nausea, the exhaustion, the days where simply getting up feels like a victory.</p>
      <p style="font-size:14px;line-height:1.75;color:var(--text-m);margin-top:var(--sp-sm)">I understand what it's like going to many medical appointments, watching her try different medications and procedures, hoping something would finally stick. I have seen how a condition that lives inside your ear can reach into every corner of your life and rearrange it completely.</p>
      <p style="font-size:14px;line-height:1.75;color:var(--text-m);margin-top:var(--sp-sm)">Through all of it, I never stopped asking myself what more I could do.</p>
      <p style="font-size:14px;line-height:1.75;color:var(--text-m);margin-top:var(--sp-sm)">I started a little project that is now called Equilibrium.</p>
      <p style="font-size:14px;line-height:1.75;color:var(--text-m);margin-top:var(--sp-sm)">If helping my wife track her daily habits, her sodium, her stress, her sleep, and her attacks could make her even a little more aware of what triggers her symptoms then maybe she could take back some control. And if it could help her, it could help others too.</p>
      <p style="font-size:14px;line-height:1.75;color:var(--text-m);margin-top:var(--sp-sm)">That's why I dedicate this app, with all my love, to my wife Ana Isabel. You deserve to live every day free of pain, free of fear, and full of joy. This project can now help others because of you. Thank you. 💙</p>
      <p style="font-size:13px;font-weight:600;color:var(--text);margin-top:var(--sp-md);text-align:right">Jorge</p>
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
          ['🧂','Sodium Intake','Search 1M+ foods powered by the USDA FoodData Central database, then monitor daily sodium against your personal target'],
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
        Your health data is stored <strong>on this device</strong> by default. If you create a free
        account, your data is also securely backed up to the cloud so you never lose it and can
        access it across multiple devices.
      </p>
      <p style="font-size:14px;line-height:1.65;color:var(--text-m);margin-top:var(--sp-sm)">
        Your data is <strong>never shared with third parties</strong>. The only external connections
        are: cloud sync if you're signed in (your data only, fully encrypted), food searches via the
        <strong>USDA FoodData Central API</strong>, and local weather via <strong>Open-Meteo</strong>
        (no personal data sent).
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
        No ads · No tracking · Free forever
      </p>
    </div>

    <div class="card" style="border-left:3px solid #5B9B8A;text-align:center">
      <div style="font-size:22px;margin-bottom:var(--sp-sm)">💙</div>
      <div class="card-title" style="margin-bottom:var(--sp-sm)">Support Equilibrium</div>
      <p style="font-size:13px;color:var(--text-m);line-height:1.65;margin-bottom:var(--sp-md)">
        If you're here, thank you for using Equilibrium. Building something meaningful for the Ménière's community has been incredibly rewarding, and your presence whether you donate or not means everything to me.
      </p>
      <a href="https://ko-fi.com/myequilibriumapp" target="_blank" rel="noopener"
        class="btn btn-primary btn-full"
        style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px">
        💙 Support on Ko-fi
      </a>
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
        <div class="more-sub">Custom date range summary for your next visit</div>
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

    <div class="more-item" data-action="settings">
      <div class="more-icon" style="background:#F0F0F0">⚙️</div>
      <div class="more-content">
        <div class="more-title">Settings</div>
        <div class="more-sub">Sodium goal, dark mode & reminders</div>
      </div>
      <div class="more-arrow">›</div>
    </div>

    <!-- Year in Review — re-enable Jan 1 next year -->

    <div class="more-item" data-action="account">
      <div class="more-icon" style="background:#EBF5F2">👤</div>
      <div class="more-content">
        <div class="more-title">Account & Backup</div>
        <div class="more-sub" id="more-account-sub">${window.FireSync?.isSignedIn() ? (window.FireSync.getUser()?.displayName || window.FireSync.getUser()?.email || 'Signed in') : 'Sign in to back up your data'}</div>
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

    <div class="more-item" data-action="support">
      <div class="more-icon" style="background:#EFF3FF">💙</div>
      <div class="more-content">
        <div class="more-title">Support Equilibrium</div>
        <div class="more-sub">A small gesture, a big impact</div>
      </div>
      <div class="more-arrow">›</div>
    </div>

    <p style="text-align:center;font-size:11px;color:var(--text-m);margin-top:var(--sp-lg);line-height:1.6">
      Equilibrium v1.4 · Your data, your control
    </p>
  `;
}

// ── BACKUP NUDGE BANNER ──────────────────────────────────────────
function renderBackupNudge() {
  // Don't show if already signed in
  if (window.FireSync?.isSignedIn()) return '';
  // Only show after 3+ days of use
  const firstSeen = localStorage.getItem('eq_first_seen');
  if (!firstSeen) { localStorage.setItem('eq_first_seen', today()); return ''; }
  const daysSince = dateDiff(firstSeen, today());
  if (daysSince < 3) return '';
  // Don't show if dismissed this week
  const dismissed = localStorage.getItem('eq_nudge_dismissed');
  if (dismissed && dateDiff(dismissed, today()) < 7) return '';
  return `
    <div class="backup-nudge" id="backup-nudge">
      <div style="font-size:20px;flex-shrink:0">☁️</div>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:700;margin-bottom:2px">Back up your data</div>
        <div style="font-size:12px;opacity:0.85">Create a free account so you never lose your health history</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn btn-sm" style="background:white;color:var(--p);font-weight:700" data-action="account">Sign in</button>
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:white" id="btn-dismiss-nudge">✕</button>
      </div>
    </div>`;
}

// ── ACCOUNT PANEL ────────────────────────────────────────────────
function renderAccountPanel() {
  const el = qs('#panel-account-body');
  const user = window.FireSync?.getUser();

  if (user) {
    // Signed-in view
    el.innerHTML = `
      <div class="card" style="text-align:center;padding:var(--sp-xl) var(--sp-lg)">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--p);color:white;font-size:26px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto var(--sp-md)">
          ${(user.displayName || user.email || '?')[0].toUpperCase()}
        </div>
        <div style="font-size:18px;font-weight:800;margin-bottom:4px">${user.displayName || 'Account'}</div>
        <div style="font-size:13px;color:var(--text-m);margin-bottom:var(--sp-lg)">${user.email || ''}</div>
        ${user.emailVerified
          ? `<div class="pill pill-success" style="margin-bottom:var(--sp-lg)">☁️ Data syncing to cloud</div>`
          : `<div class="pill" style="background:var(--warning-light);color:#8a6000;margin-bottom:var(--sp-sm)">⚠️ Email not verified</div>
             <p style="font-size:12px;color:var(--text-m);margin-bottom:var(--sp-lg)">Check your inbox and click the verification link to secure your account.</p>
             <button class="btn btn-outline btn-full btn-sm" id="btn-resend-verify" style="margin-bottom:var(--sp-md)">Resend verification email</button>`
        }
        <button class="btn btn-outline btn-full" id="btn-sign-out">Sign out</button>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:var(--sp-sm)">🔒 Your Privacy</div>
        <p style="font-size:13px;color:var(--text-m);line-height:1.6">Your health data is stored securely in your personal account. Only you can access it. Equilibrium cannot read your data.</p>
      </div>
    `;
    qs('#btn-resend-verify')?.addEventListener('click', async () => {
      try {
        await window.FireSync.getUser().sendEmailVerification();
        showToast('Verification email sent 📧');
      } catch { showToast('Could not send email — try again shortly'); }
    });

    qs('#btn-sign-out').addEventListener('click', async () => {
      if (confirm('Sign out? Your data is safely backed up in the cloud.')) {
        await window.FireSync.signOut();
        closePanel();
        renderMore();
      }
    });
    return;
  }

  // Signed-out view — show sign in / create account
  let mode = 'signin'; // 'signin' | 'register'

  function renderForm() {
    el.innerHTML = `
      <div class="card" style="text-align:center;padding:var(--sp-lg) var(--sp-md) var(--sp-md)">
        <div style="font-size:32px;margin-bottom:var(--sp-sm)">🌿</div>
        <div style="font-size:18px;font-weight:800;margin-bottom:4px">${mode === 'signin' ? 'Welcome back' : 'Create account'}</div>
        <div style="font-size:13px;color:var(--text-m);margin-bottom:var(--sp-lg)">${mode === 'signin' ? 'Sign in to sync your data across devices' : 'Free forever — your data, your control'}</div>

        <!-- Google -->
        <button class="btn btn-full" id="btn-google-signin" style="background:#fff;color:#1A2B26;border:2px solid var(--border);margin-bottom:var(--sp-sm);gap:10px">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>

        <div style="display:flex;align-items:center;gap:var(--sp-sm);margin:var(--sp-md) 0">
          <div style="flex:1;height:1px;background:var(--border)"></div>
          <span style="font-size:12px;color:var(--text-m)">or</span>
          <div style="flex:1;height:1px;background:var(--border)"></div>
        </div>

        <!-- Email -->
        ${mode === 'register' ? `
        <div class="form-group">
          <input type="text" class="form-input" id="auth-name" placeholder="Your name" autocomplete="name">
        </div>` : ''}
        <div class="form-group">
          <input type="email" class="form-input" id="auth-email" placeholder="Email address" autocomplete="email">
        </div>
        <div class="form-group">
          <input type="password" class="form-input" id="auth-password" placeholder="Password (min 6 characters)" autocomplete="${mode === 'signin' ? 'current-password' : 'new-password'}">
        </div>

        <button class="btn btn-primary btn-full" id="btn-email-auth" style="margin-bottom:var(--sp-sm)">
          ${mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>

        ${mode === 'signin' ? `<button class="btn btn-ghost btn-full btn-sm" id="btn-forgot">Forgot password?</button>` : ''}

        <div style="margin-top:var(--sp-md);font-size:13px;color:var(--text-m)">
          ${mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          <button class="btn btn-ghost btn-sm" id="btn-toggle-mode" style="padding:4px 8px">
            ${mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </div>

      <div class="card">
        <div style="font-size:13px;color:var(--text-m);line-height:1.6;text-align:center">
          🔒 Your data is encrypted and private. Without an account it stays only on this device. Sign in to back it up to the cloud.<br><br>Equilibrium never sells or shares your health data.
        </div>
      </div>

      <button class="btn btn-ghost btn-full btn-sm" style="margin-top:var(--sp-sm);color:var(--text-m)" data-close>Continue as guest →</button>
    `;

    qs('#btn-google-signin').addEventListener('click', async () => {
      const ok = await window.FireSync.signInGoogle();
      if (ok) {
        const name = window.FireSync.getUser()?.displayName || window.FireSync.getUser()?.email || '';
        showToast(`Welcome, ${name.split('@')[0] || 'you'} ✓`);
        closePanel();
      }
    });

    qs('#btn-email-auth').addEventListener('click', async () => {
      const email    = qs('#auth-email').value.trim();
      const password = qs('#auth-password').value;
      const name     = qs('#auth-name')?.value.trim() || '';
      if (!email || !password) { showToast('Enter your email and password'); return; }
      if (mode === 'register' && !name) { showToast('Enter your name'); return; }
      const ok = mode === 'signin'
        ? await window.FireSync.signInEmail(email, password)
        : await window.FireSync.createAccount(email, password, name);
      if (ok) {
        const displayName = window.FireSync.getUser()?.displayName || name || email.split('@')[0];
        showToast(`Welcome, ${displayName} ✓`);
        closePanel();
      }
    });

    qs('#btn-toggle-mode').addEventListener('click', () => {
      mode = mode === 'signin' ? 'register' : 'signin';
      renderForm();
    });

    qs('#btn-forgot')?.addEventListener('click', async () => {
      const email = qs('#auth-email').value.trim();
      if (!email) { showToast('Enter your email first'); return; }
      await window.FireSync.resetPassword(email);
    });
  }

  renderForm();
}

function renderSettingsPanel() {
  const s = DB.settings();
  qs('#panel-settings-body').innerHTML = `
    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-md)">General</div>
      <div class="form-group">
        <label class="form-label">Daily sodium goal (mg)</label>
        <input type="number" class="form-input" id="set-sodium" value="${s.sodiumGoal||1500}" min="500" max="3000">
      </div>
      <div class="toggle-row">
        <span class="toggle-label">Dark mode</span>
        <label class="toggle">
          <input type="checkbox" id="set-dark" ${s.dark?'checked':''}>
          <span class="toggle-track"></span>
        </label>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-md)">🔔 Reminders</div>
      <div class="toggle-row" style="margin-bottom:var(--sp-sm)">
        <span class="toggle-label">Enable notifications</span>
        <label class="toggle">
          <input type="checkbox" id="set-notif" ${s.notifEnabled?'checked':''}>
          <span class="toggle-track"></span>
        </label>
      </div>
      <div id="notif-times" style="display:${s.notifEnabled?'block':'none'}">
        <div class="form-group" style="margin-top:var(--sp-sm)">
          <label class="form-label">Morning check-in</label>
          <input type="time" class="form-input" id="set-notif-morning" value="${s.notifMorning||'08:00'}">
        </div>
        <div class="form-group">
          <label class="form-label">Medication reminder</label>
          <input type="time" class="form-input" id="set-notif-med" value="${s.notifMed||'09:00'}">
        </div>
        <div class="form-group">
          <label class="form-label">Evening log</label>
          <input type="time" class="form-input" id="set-notif-evening" value="${s.notifEvening||'20:00'}">
        </div>
      </div>
    </div>

    <button class="btn btn-primary btn-full" id="btn-save-settings">Save Settings</button>
  `;

  qs('#btn-save-settings').addEventListener('click', async () => {
    const s = DB.settings();
    s.sodiumGoal = +qs('#set-sodium').value || 1500;
    s.dark = qs('#set-dark').checked;
    const notifWanted = qs('#set-notif').checked;
    if (notifWanted && !s.notifEnabled) {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        s.notifEnabled = perm === 'granted';
        if (perm !== 'granted') showToast('Notification permission denied');
      }
    } else {
      s.notifEnabled = notifWanted;
    }
    s.notifMorning = qs('#set-notif-morning')?.value || '08:00';
    s.notifMed     = qs('#set-notif-med')?.value    || '09:00';
    s.notifEvening = qs('#set-notif-evening')?.value || '20:00';
    DB.saveSettings(s);
    applyTheme(s.dark);
    showToast('Settings saved ✓');
  });

  qs('#set-dark').addEventListener('change', function() { applyTheme(this.checked); });
  qs('#set-notif').addEventListener('change', function() {
    qs('#notif-times').style.display = this.checked ? 'block' : 'none';
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

    ${(() => {
      const medAttacks = attacks.filter(a => a.medsTaken !== undefined);
      if (medAttacks.length < 3) return '';
      const taken = medAttacks.filter(a => a.medsTaken);
      const skipped = medAttacks.filter(a => !a.medsTaken);
      const takenPct = Math.round(taken.length / medAttacks.length * 100);
      const skippedPct = 100 - takenPct;
      return `
        <div style="margin-top:var(--sp-lg)">
          <div style="font-size:12px;font-weight:700;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;margin-bottom:var(--sp-md)">💊 Medication Adherence</div>
          <div class="card">
            <div style="margin-bottom:8px;font-size:14px"><strong>${taken.length}</strong> attacks when meds were taken (${takenPct}%)</div>
            <div style="font-size:14px"><strong>${skipped.length}</strong> attacks when meds were skipped (${skippedPct}%)</div>
            ${skipped.length > taken.length ? '<div style="font-size:12px;color:var(--warning);margin-top:8px">⚠️ You seem to have more attacks when skipping medications</div>' : ''}
          </div>
        </div>`;
    })()}
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
  const defaultTo   = today();
  const defaultFrom = daysAgo(29); // 30-day default

  el.innerHTML = `
    <p style="font-size:14px;color:var(--text-m);line-height:1.6;margin-bottom:var(--sp-lg)">
      Choose the date range you want to include in the report, then open it to save as PDF or print.
    </p>

    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-md)">📅 Report Period</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-md);margin-bottom:var(--sp-md)">
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">From</label>
          <input type="date" class="form-input" id="report-from" value="${defaultFrom}" max="${defaultTo}">
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">To</label>
          <input type="date" class="form-input" id="report-to" value="${defaultTo}" max="${defaultTo}">
        </div>
      </div>

      <div style="display:flex;gap:var(--sp-sm);flex-wrap:wrap;margin-bottom:var(--sp-md)">
        <button class="btn btn-ghost btn-sm" data-preset="7">Last 7 days</button>
        <button class="btn btn-ghost btn-sm" data-preset="30">Last 30 days</button>
        <button class="btn btn-ghost btn-sm" data-preset="60">Last 60 days</button>
        <button class="btn btn-ghost btn-sm" data-preset="90">Last 90 days</button>
      </div>

      <div id="report-range-summary" style="font-size:13px;color:var(--text-m);margin-bottom:var(--sp-md)"></div>

      <button class="btn btn-primary btn-full" id="btn-open-report">
        📄 Open Printable Report
      </button>
      <p style="font-size:12px;color:var(--text-m);text-align:center;margin-top:8px">Opens in a new tab · Use <strong>File → Print → Save as PDF</strong></p>
    </div>
  `;

  function updateSummary() {
    const from = qs('#report-from').value;
    const to   = qs('#report-to').value;
    if (!from || !to || from > to) {
      qs('#report-range-summary').textContent = '⚠️ Invalid range — "From" must be before "To"';
      return;
    }
    const days = dateDiff(from, to) + 1;
    const attacks = DB.attacks().filter(a => a.date >= from && a.date <= to).length;
    qs('#report-range-summary').textContent = `${days} day${days!==1?'s':''} · ${attacks} attack${attacks!==1?'s':''} in this period`;
  }

  updateSummary();
  qs('#report-from').addEventListener('change', updateSummary);
  qs('#report-to').addEventListener('change', updateSummary);

  // Preset buttons
  el.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const n = parseInt(btn.dataset.preset);
      qs('#report-from').value = daysAgo(n - 1);
      qs('#report-to').value   = today();
      updateSummary();
    });
  });

  qs('#btn-open-report').addEventListener('click', () => {
    const from = qs('#report-from').value;
    const to   = qs('#report-to').value;
    if (!from || !to || from > to) { showToast('Fix the date range first'); return; }
    openPrintReport(from, to);
  });
}

function openPrintReport(from, to) {
  if (!from) from = daysAgo(29);
  if (!to)   to   = today();

  // Build an ordered array of all dates in the range
  const rangeDates = [];
  let cur = new Date(from + 'T12:00:00');
  const end = new Date(to + 'T12:00:00');
  while (cur <= end) {
    rangeDates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  const days = rangeDates.length;

  const attacks = DB.attacks().filter(a => a.date >= from && a.date <= to);
  const avgIntensity = attacks.length ? (attacks.reduce((s,a)=>s+a.intensity,0)/attacks.length).toFixed(1) : '—';
  const avgDuration  = attacks.length ? Math.round(attacks.reduce((s,a)=>s+(a.duration||0),0)/attacks.length) : null;
  const sGoal = DB.settings().sodiumGoal || SODIUM_GOAL;

  let sodiumTotal=0, sodiumDays=0, sodiumOverGoal=0;
  let sleepTotal=0, sleepDays=0;
  let stressTotal=0, stressDays=0;
  const dailyAttacks = [];
  const dailySodium  = [];

  for (const d of rangeDates) {
    const sod = DB.totalSodium(d);
    const sl  = DB.sleepFor(d);
    const str = DB.stressFor(d);
    const atkCount = attacks.filter(a=>a.date===d).length;
    dailyAttacks.push(atkCount);
    dailySodium.push(sod);
    if (sod > 0) { sodiumTotal += sod; sodiumDays++; if (sod > sGoal) sodiumOverGoal++; }
    if (sl)  { sleepTotal  += sl.duration||0;  sleepDays++; }
    if (str) { stressTotal += str.level;        stressDays++; }
  }

  const avgSodium = sodiumDays ? Math.round(sodiumTotal/sodiumDays) : null;
  const avgSleep  = sleepDays  ? (sleepTotal/sleepDays).toFixed(1)  : null;
  const avgStress = stressDays ? (stressTotal/stressDays).toFixed(1): null;

  const meds = DB.meds();
  let totalDoses=0, takenDoses=0;
  for (const d of rangeDates) {
    const doses=DB.dosesFor(d);
    meds.forEach(m=>(m.times||[]).forEach(time=>{
      totalDoses++;
      if (doses.find(dd=>dd.medId===m.id&&dd.time===time&&dd.taken)) takenDoses++;
    }));
  }
  const adherencePct = totalDoses > 0 ? Math.round(takenDoses/totalDoses*100) : null;
  const e = DB.emergency();
  const reportDate = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

  // Build SVG bar charts (attacks + sodium)
  function svgBars(data, color, maxVal, w=520, h=80) {
    if (!maxVal) maxVal = Math.max(...data, 1);
    const bw = (w - (data.length-1)*2) / data.length;
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${data.map((v,i) => {
        const bh = Math.round((v/maxVal)*h);
        const x  = Math.round(i*(bw+2));
        return v > 0
          ? `<rect x="${x}" y="${h-bh}" width="${Math.max(1,Math.floor(bw))}" height="${bh}" rx="2" fill="${color}" opacity="0.85"/>`
          : `<rect x="${x}" y="${h-2}" width="${Math.max(1,Math.floor(bw))}" height="2" rx="1" fill="#ddd"/>`;
      }).join('')}
    </svg>`;
  }

  const atkSVG = svgBars(dailyAttacks, '#E07070', Math.max(...dailyAttacks, 1));
  const sodSVG = svgBars(dailySodium, '#5B9B8A', Math.max(...dailySodium, sGoal));

  function statBox(icon, val, label, sub='', color='#5B9B8A') {
    return `<div style="background:#f8faf9;border-radius:12px;padding:16px 12px;text-align:center;border:1px solid #e0ecea">
      <div style="font-size:22px;margin-bottom:4px">${icon}</div>
      <div style="font-size:26px;font-weight:800;color:${color};line-height:1">${val}</div>
      <div style="font-size:11px;font-weight:700;color:#6B8A83;margin-top:4px;text-transform:uppercase;letter-spacing:.5px">${label}</div>
      ${sub ? `<div style="font-size:11px;color:#aaa;margin-top:2px">${sub}</div>` : ''}
    </div>`;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Equilibrium Health Report — ${reportDate}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1A2B26; background: white; padding: 40px; max-width: 800px; margin: 0 auto; }
  @media print {
    body { padding: 20px; }
    .no-print { display: none !important; }
    @page { margin: 1.5cm; size: A4 portrait; }
  }
  h2 { font-size: 13px; font-weight: 800; color: #6B8A83; text-transform: uppercase; letter-spacing: 1px; margin: 28px 0 12px; border-bottom: 2px solid #EBF5F2; padding-bottom: 6px; }
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
  th { text-align: left; background: #EBF5F2; padding: 8px 10px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #3D7A6A; }
  td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .badge-red { background: #FDEAEA; color: #E07070; }
  .badge-green { background: #E8F7EA; color: #6DB87A; }
  .badge-yellow { background: #FEF5E0; color: #C0803A; }
  .chart-label { font-size: 10px; color: #aaa; display: flex; justify-content: space-between; margin-top: 4px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #EBF5F2; font-size: 11px; color: #aaa; text-align: center; }
  .print-btn { background: #5B9B8A; color: white; border: none; border-radius: 10px; padding: 12px 28px; font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 28px; }
  .print-btn:hover { background: #3D7A6A; }
</style>
</head>
<body>

<div class="no-print" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
  <button class="print-btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
  <button onclick="window.close()" style="background:#5B9B8A;border:none;border-radius:50px;padding:14px 26px;font-size:17px;font-weight:700;color:white;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.2);-webkit-tap-highlight-color:transparent">✕ Close</button>
</div>

<!-- Header -->
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #5B9B8A">
  <div style="display:flex;align-items:center;gap:14px">
    <div style="width:52px;height:52px;border-radius:14px;background:#5B9B8A;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg viewBox="0 0 512 512" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
        <path d="M 96 196 Q 176 156 256 196 Q 336 236 416 196" stroke="white" stroke-width="40" fill="none" stroke-linecap="round"/>
        <path d="M 96 256 Q 176 216 256 256 Q 336 296 416 256" stroke="white" stroke-width="40" fill="none" stroke-linecap="round"/>
        <path d="M 96 316 Q 176 276 256 316 Q 336 356 416 316" stroke="white" stroke-width="40" fill="none" stroke-linecap="round"/>
      </svg>
    </div>
    <div>
      <div style="font-size:22px;font-weight:800;color:#1A2B26">Equilibrium</div>
      <div style="font-size:12px;color:#6B8A83">Your Ménière's Companion</div>
    </div>
  </div>
  <div style="text-align:right">
    <div style="font-size:18px;font-weight:700;color:#1A2B26">Health Report</div>
    <div style="font-size:12px;color:#6B8A83">${reportDate}</div>
    <div style="font-size:12px;color:#6B8A83">${fmtDate(from)} — ${fmtDate(to)} (${days} days)</div>
  </div>
</div>

<!-- Patient info -->
${e.name||e.doctor ? `<div style="background:#EBF5F2;border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;gap:32px;flex-wrap:wrap">
  ${e.name ? `<div><div style="font-size:10px;font-weight:700;color:#6B8A83;text-transform:uppercase;letter-spacing:.5px">Patient</div><div style="font-size:15px;font-weight:700">${e.name}</div></div>` : ''}
  ${e.diagnosis ? `<div><div style="font-size:10px;font-weight:700;color:#6B8A83;text-transform:uppercase;letter-spacing:.5px">Diagnosis</div><div style="font-size:15px;font-weight:700">${e.diagnosis}</div></div>` : ''}
  ${e.doctor ? `<div><div style="font-size:10px;font-weight:700;color:#6B8A83;text-transform:uppercase;letter-spacing:.5px">Physician</div><div style="font-size:15px;font-weight:700">${e.doctor}</div></div>` : ''}
</div>` : ''}

<!-- Stats -->
<h2>${days}-Day Summary</h2>
<div class="stat-grid">
  ${statBox('⚡', attacks.length, 'Attacks', attacks.length===0?'Attack-free period':attacks.length>=5?'Frequent episodes':'', attacks.length>=5?'#E07070':attacks.length>=2?'#F0C060':'#6DB87A')}
  ${statBox('🧂', avgSodium ? avgSodium+'mg' : '—', 'Avg Sodium/day', avgSodium ? (avgSodium > sGoal ? '⚠️ Over goal' : '✓ Under goal') : 'No data', avgSodium && avgSodium > sGoal ? '#E07070' : '#5B9B8A')}
  ${statBox('🌙', avgSleep ? avgSleep+'h' : '—', 'Avg Sleep', avgSleep ? (parseFloat(avgSleep) < 6 ? 'Low — potential trigger' : 'Good range') : 'No data', avgSleep && parseFloat(avgSleep)<6?'#E07070':'#5B9B8A')}
  ${statBox('💊', adherencePct != null ? adherencePct+'%' : '—', 'Med Adherence', adherencePct != null ? `${takenDoses}/${totalDoses} doses` : 'No meds logged', adherencePct != null && adherencePct < 70 ? '#F0C060' : '#5B9B8A')}
</div>

<!-- Attack chart -->
<h2>Attack Frequency (${days} days)</h2>
<div>${atkSVG}</div>
<div class="chart-label"><span>${fmtDate(from)}</span><span>${fmtDate(to)}</span></div>
${(() => {
  if (!attacks.length) return '<p style="color:#6B8A83;font-size:14px;margin-top:8px">No attacks logged in this period.</p>';
  const pressureLog = DB.g(K.pressure) || [];
  const pressureMap = {};
  pressureLog.forEach(p => { pressureMap[p.date] = p; });
  return `
<table style="margin-top:16px">
  <tr><th>Date</th><th>Intensity</th><th>Duration</th><th>Symptoms</th><th>Pressure</th><th>Meds Taken</th></tr>
  ${attacks.slice(0,15).map(a => {
    const pEntry = pressureMap[a.date];
    const pressureCell = pEntry
      ? `${pEntry.hpa} hPa${pEntry.humidity != null ? ` · ${pEntry.humidity}%` : ''}${pEntry.hpa < 1010 ? ' ⚠️' : ''}`
      : '—';
    return `<tr>
    <td>${fmtDate(a.date)}</td>
    <td><span class="badge ${a.intensity>=7?'badge-red':a.intensity>=4?'badge-yellow':'badge-green'}">${a.intensity}/10</span></td>
    <td>${a.duration ? fmtDur(a.duration) : '—'}</td>
    <td style="color:#6B8A83">${(a.symptoms||[]).join(', ')||'—'}</td>
    <td style="color:#6B8A83;white-space:nowrap">${pressureCell}</td>
    <td>${a.medsTaken===true?'✓ Yes':a.medsTaken===false?'✗ No':'—'}</td>
  </tr>`;
  }).join('')}
</table>
${attacks.length > 15 ? `<p style="font-size:12px;color:#aaa;margin-top:8px">+ ${attacks.length-15} more attacks not shown</p>` : ''}`;
})()}

<!-- Sodium chart -->
<h2>Daily Sodium Intake (${days} days)</h2>
<div>${sodSVG}</div>
<div class="chart-label">
  <span>${fmtDate(from)}</span>
  <span style="color:#E07070">Goal: ${sGoal}mg/day · ${sodiumOverGoal} days over goal</span>
  <span>${fmtDate(to)}</span>
</div>

<!-- Sleep & Stress -->
<h2>Sleep & Stress</h2>
<table>
  <tr><th>Metric</th><th>Average</th><th>Days Logged</th><th>Notes</th></tr>
  <tr><td>Sleep duration</td><td>${avgSleep ? avgSleep+'h' : '—'}</td><td>${sleepDays}</td><td style="color:#6B8A83">${avgSleep ? (parseFloat(avgSleep)<6?'Below recommended 7–9h':'Within healthy range') : 'No sleep data logged'}</td></tr>
  <tr><td>Stress level</td><td>${avgStress ? avgStress+'/10' : '—'}</td><td>${stressDays}</td><td style="color:#6B8A83">${avgStress ? (parseFloat(avgStress)>=7?'High — potential trigger':parseFloat(avgStress)>=4?'Moderate':'Low') : 'No stress data logged'}</td></tr>
</table>

<!-- Medications -->
<h2>Medications</h2>
${meds.length > 0 ? `
<table>
  <tr><th>Medication</th><th>Dosage</th><th>Type</th><th>Schedule</th><th>Adherence (30d)</th></tr>
  ${meds.map(m => {
    let medTaken=0, medTotal=0;
    for(let i=0;i<days;i++){const d=daysAgo(i),doses=DB.dosesFor(d);(m.times||[]).forEach(t=>{medTotal++;if(doses.find(dd=>dd.medId===m.id&&dd.time===t&&dd.taken))medTaken++;});}
    const pct = medTotal>0?Math.round(medTaken/medTotal*100):null;
    return `<tr><td><strong>${m.name}</strong></td><td>${m.dosage}</td><td>${m.type}</td><td>${(m.times||[]).join(', ')}</td><td>${pct!=null?`<span class="badge ${pct>=80?'badge-green':pct>=60?'badge-yellow':'badge-red'}">${pct}%</span>`:'—'}</td></tr>`;
  }).join('')}
</table>` : '<p style="color:#6B8A83;font-size:14px;margin-top:8px">No medications logged.</p>'}

<!-- Notes -->
<h2>Notes for Provider</h2>
<div style="border:1px dashed #D4E4DF;border-radius:10px;padding:16px;min-height:80px;font-size:13px;color:#aaa;line-height:1.7">
  Add your specific concerns or questions here before your appointment…
</div>

<div class="footer">
  Generated by <strong>Equilibrium</strong> — Your Ménière's Companion &nbsp;·&nbsp; ${reportDate}<br>
  <em>This report is for informational purposes only and does not constitute medical advice.</em>
</div>

</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); }
  else showToast('Please allow pop-ups to open the report');
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
let _scanStream = null;
let _scanInterval = null;

function renderFoodSearch() {
  openPanel('panel-food-search', () => {
    qs('#food-search-input').value = '';
    renderFoodResults('');
    qs('#food-search-input').focus();
    // Add AI camera button next to input if not already there
    const inp = qs('#food-search-input');
    if (inp && !qs('#btn-scan-barcode')) {
      const btn = document.createElement('button');
      btn.id = 'btn-scan-barcode';
      btn.className = 'btn btn-ghost btn-sm';
      btn.textContent = '✨ AI Camera';
      btn.style.cssText = 'margin-top:6px;width:100%';
      btn.addEventListener('click', () => { closePanel(); openPlateScanner(); });
      inp.parentNode.appendChild(btn);
    }
  });
}

// Convert bare "100g" / "100 g" USDA default serving to US-friendly label
function normalizeSrv(srv) {
  if (!srv) return '1 serving';
  return /^100\s*g$/i.test(srv.trim()) ? '3.5 oz' : srv;
}

function foodItemHTML(f, sourceLabel) {
  const srv  = normalizeSrv(f.srv);
  const data = JSON.stringify({n:f.n, s:f.s, srv, f:!!f.f});
  return `
    <div class="food-item food-item-edit" data-base-sodium="${f.s}">
      <div class="food-item-info">
        <div class="food-name">${f.n}</div>
        <div class="food-serving">${srv}${sourceLabel ? ` · <span style="color:var(--text-m);font-style:italic">${sourceLabel}</span>` : ''}</div>
        ${f.f ? '<div class="food-flag">⚠️ HIGH SODIUM</div>' : ''}
      </div>
      <div class="food-item-add">
        <div class="food-qty-stepper">
          <button class="food-qty-btn food-qty-dec" type="button">−</button>
          <span class="food-qty-num">1</span>
          <button class="food-qty-btn food-qty-inc" type="button">+</button>
        </div>
        <input type="number" class="form-input food-sodium-edit" value="${f.s}" min="0" max="99999" data-base="${f.s}">
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

function getRecentFoods(limit = 12) {
  // Collect all logged foods across all dates, deduplicate by name, most recent first
  const log = DB.sodiumLog();
  const seen = new Set();
  const recent = [];
  // Sort dates descending
  const dates = Object.keys(log).sort((a,b) => b.localeCompare(a));
  for (const date of dates) {
    for (const item of (log[date].items || [])) {
      const key = item.n.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        recent.push({n: item.n, s: item.s, srv: item.srv || '1 serving', f: item.s > 600});
      }
      if (recent.length >= limit) return recent;
    }
  }
  return recent;
}

function renderFoodResults(query) {
  const el = qs('#food-search-results');
  const q = query.toLowerCase().trim();

  let html = '';

  if (q.length === 0) {
    html += `<div class="empty"><div class="empty-icon">🔎</div><div class="empty-title">Search for a food</div><div class="empty-text">Type any food name to search the USDA database of 1M+ foods</div></div>`;
  } else {
    // Local FOOD_DB filter as instant results
    const localResults = FOOD_DB.filter(f => f.n.toLowerCase().includes(q)).slice(0, 8);
    if (localResults.length > 0) {
      html += `<div style="font-size:11px;font-weight:700;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;padding:var(--sp-sm) 0 4px">Quick matches</div>`;
      html += localResults.map(f => foodItemHTML(f, '')).join('');
    }
    // API results section (async)
    html += `<div id="api-results-section">
      <div style="font-size:11px;font-weight:700;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;padding:var(--sp-md) 0 4px">USDA Database</div>
      <div id="api-results-inner"><div class="food-loading">Searching USDA…</div></div>
    </div>`;
  }

  html += customFoodSection();
  el.innerHTML = html;
  setupFoodAddButtons(el);
  setupCustomFood();

  if (q.length >= 2) fetchFoodAPI(q);
}

const USDA_KEY = '8Au8ObeS6w8wz5GIWyh3GTPpyIOvhb3SqHZgWhY9';

async function fetchFoodAPI(query) {
  const innerEl = qs('#api-results-inner');
  if (!innerEl) return;
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${USDA_KEY}&pageSize=10&dataType=Foundation,SR%20Legacy,Branded`;
    const resp = await fetch(url, {signal: AbortSignal.timeout(10000)});
    const data = await resp.json();
    const el = qs('#api-results-inner');
    if (!el) return; // panel closed

    const foods = (data.foods || []).filter(f => {
      const sod = f.foodNutrients?.find(n => n.nutrientId === 1093 || n.nutrientNumber === '307' || (n.nutrientName||'').toLowerCase().includes('sodium'));
      return f.description && sod != null;
    });

    if (!foods.length) {
      el.innerHTML = '<div style="font-size:13px;color:var(--text-m);padding:8px 0">No results in USDA database — try a different term or use custom entry below</div>';
      return;
    }

    // Deduplicate by normalised name — keep highest-quality data type first
    const seenNames = new Set();
    const dedupedFoods = foods.filter(f => {
      // Normalise: lowercase, trim, remove content in parentheses like "(NFS)" or ", raw"
      const norm = f.description.toLowerCase().replace(/\(.*?\)/g,'').replace(/,.*$/,'').trim();
      if (seenNames.has(norm)) return false;
      seenNames.add(norm);
      return true;
    });

    const items = dedupedFoods.map(f => {
      const sodNut = f.foodNutrients.find(n => n.nutrientId === 1093 || n.nutrientNumber === '307' || (n.nutrientName||'').toLowerCase().includes('sodium'));
      const sodPer100 = sodNut?.value || 0; // mg per 100g

      let sodiumMg = Math.round(sodPer100);
      let srv = '100g';
      if (f.servingSize && /^g$/i.test(f.servingSizeUnit || '')) {
        sodiumMg = Math.round((sodPer100 / 100) * f.servingSize);
        srv = f.householdServingFullText || `${f.servingSize}g`;
      } else if (f.householdServingFullText) {
        srv = f.householdServingFullText;
      }

      // Tidy up USDA's ALL-CAPS verbose descriptions
      let name = f.description;
      name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      if (name.length > 58) name = name.slice(0, 55) + '…';

      return {n: name, s: sodiumMg, srv, f: sodiumMg > 600};
    });

    el.innerHTML = items.map(f => foodItemHTML(f, 'USDA')).join('');
    setupFoodAddButtons(el);
  } catch {
    const el = qs('#api-results-inner');
    if (el) el.innerHTML = '<div style="font-size:13px;color:var(--text-m);padding:8px 0">USDA database unavailable — use common foods or custom entry below</div>';
  }
}

// ── BARCODE SCANNER ──────────────────────────────────────────────
function stopScanner() {
  if (_scanInterval) { clearInterval(_scanInterval); _scanInterval = null; }
  if (_scanStream) { _scanStream.getTracks().forEach(t => t.stop()); _scanStream = null; }
  const cont = qs('#scanner-container');
  if (cont) cont.classList.add('hidden');
}

async function startScanner() {
  // If BarcodeDetector is not supported (iOS Safari), show the fallback UI
  if (!('BarcodeDetector' in window)) {
    showScannerFallback();
    return;
  }
  try {
    _scanStream = await navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}});
    const video = qs('#scanner-video');
    if (!video) return;
    video.srcObject = _scanStream;
    video.play();
    qs('#scanner-container').classList.remove('hidden');

    const detector = new BarcodeDetector({formats: ['ean_13','ean_8','upc_a','upc_e']});
    _scanInterval = setInterval(async () => {
      if (!video.videoWidth) return;
      try {
        const codes = await detector.detect(video);
        if (codes.length > 0) {
          const barcode = codes[0].rawValue;
          stopScanner();
          lookupBarcode(barcode);
        }
      } catch (_) {}
    }, 500);
  } catch (err) {
    showToast('Camera access denied — try manual entry below');
    showScannerFallback();
  }
}

async function lookupBarcode(barcode) {
  showToast('Barcode found — looking up product…');
  try {
    const resp = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {signal: AbortSignal.timeout(10000)});
    const data = await resp.json();
    if (data.status === 1 && data.product) {
      const p = data.product;
      const name = p.product_name || 'Unknown product';
      const sodiumPer100 = (p.nutriments?.sodium_100g || 0) * 1000;
      const servingG = parseFloat(p.serving_size) || 100;
      const sodium = Math.round(sodiumPer100 / 100 * servingG);
      const srv = p.serving_size || '100g';
      const food = {n: name.charAt(0).toUpperCase() + name.slice(1).slice(0,55), s: sodium, srv, f: sodium > 600};
      // Open the panel first (sets up UI, clears old results), then inject barcode result
      renderFoodSearch();
      const resultsEl = qs('#food-search-results');
      if (resultsEl) {
        const section = document.createElement('div');
        section.innerHTML = `<div style="font-size:11px;font-weight:700;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;padding:var(--sp-sm) 0 4px">Scanned product</div>${foodItemHTML(food, 'Barcode')}`;
        resultsEl.prepend(section);
        setupFoodAddButtons(section);
      }
    } else {
      showToast('Product not found — try manual entry');
      showScannerFallback();
    }
  } catch {
    showToast('Could not look up product');
    showScannerFallback();
  }
}

function showScannerFallback() {
  // iOS / unsupported: show file capture + manual UPC entry inside food search panel
  openPanel('panel-food-search', () => {
    const el = qs('#food-search-results');
    if (!el) return;
    el.innerHTML = `
      <div class="scanner-fallback-card">
        <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:var(--sp-sm)">📷 Scan Barcode (iOS)</div>
        <p style="font-size:12px;color:var(--text-m);margin-bottom:var(--sp-md)">Take a photo of the barcode, or type it in manually below.</p>
        <label class="btn btn-outline btn-full" style="margin-bottom:var(--sp-sm);cursor:pointer">
          📷 Open Camera
          <input type="file" accept="image/*" capture="environment" id="barcode-file-input" style="display:none">
        </label>
        <div style="display:flex;gap:8px;align-items:center;margin-top:var(--sp-sm)">
          <input type="text" class="form-input" id="manual-barcode" placeholder="Type barcode number…" inputmode="numeric" style="flex:1">
          <button class="btn btn-primary" id="btn-manual-barcode">Look up</button>
        </div>
        <div id="barcode-lookup-result" style="margin-top:var(--sp-sm)"></div>
      </div>
    `;

    // File input handler — try BarcodeDetector on the image, then fall back to showing the image
    qs('#barcode-file-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if ('BarcodeDetector' in window) {
        try {
          const img = document.createElement('img');
          img.src = URL.createObjectURL(file);
          await new Promise(r => img.onload = r);
          const detector = new BarcodeDetector({formats: ['ean_13','ean_8','upc_a','upc_e']});
          const codes = await detector.detect(img);
          if (codes.length > 0) {
            lookupBarcode(codes[0].rawValue);
            return;
          }
        } catch {}
      }
      // Could not auto-detect — show manual input hint
      qs('#barcode-lookup-result').innerHTML = '<p style="font-size:12px;color:var(--text-m)">Could not read barcode automatically. Please type it in the box above.</p>';
    });

    // Manual barcode lookup
    qs('#btn-manual-barcode').addEventListener('click', () => {
      const code = qs('#manual-barcode').value.trim();
      if (!code) { showToast('Enter a barcode number'); return; }
      qs('#barcode-lookup-result').innerHTML = '<p style="font-size:12px;color:var(--text-m)">🔍 Looking up product…</p>';
      lookupBarcode(code);
    });
  });
}

// ── Plate Scanner ────────────────────────────────────────────────────
const VISION_WORKER = 'https://equilibrium-vision.midorilabs.workers.dev';

function openPlateScanner() {
  openPanel('panel-plate-scanner', renderPlateScanner);
}

function renderPlateScanner() {
  qs('#panel-plate-body').innerHTML = `
    <div style="text-align:center;padding:var(--sp-lg) 0">
      <div style="font-size:48px;margin-bottom:var(--sp-md)">📸</div>
      <div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:8px">Take a photo of your meal</div>
      <div style="font-size:13px;color:var(--text-m);margin-bottom:var(--sp-lg);line-height:1.5">AI will identify each food item and estimate the sodium content</div>
      <label class="btn btn-primary btn-full" style="cursor:pointer;margin-bottom:var(--sp-sm)">
        📷 Take Photo
        <input type="file" accept="image/*" capture="environment" id="plate-photo-input" style="display:none">
      </label>
      <label class="btn btn-outline btn-full" style="cursor:pointer">
        🖼️ Choose from Library
        <input type="file" accept="image/*" id="plate-library-input" style="display:none">
      </label>
    </div>
    <div id="plate-results"></div>
  `;
  qs('#plate-photo-input').addEventListener('change', e => handlePlatePhoto(e.target.files[0]));
  qs('#plate-library-input').addEventListener('change', e => handlePlatePhoto(e.target.files[0]));
}

async function handlePlatePhoto(file) {
  if (!file) return;
  const resultsEl = qs('#plate-results');

  // Show loading
  resultsEl.innerHTML = `
    <div style="text-align:center;padding:var(--sp-xl) 0">
      <div style="font-size:32px;margin-bottom:var(--sp-md)">🔍</div>
      <div style="font-size:14px;font-weight:600;color:var(--text)">Analyzing your meal…</div>
      <div style="font-size:12px;color:var(--text-m);margin-top:6px">This takes about 5–10 seconds</div>
    </div>`;

  try {
    // Compress image
    const base64 = await compressImage(file, 800, 0.7);
    const mediaType = file.type || 'image/jpeg';

    // Send to worker
    const resp = await fetch(VISION_WORKER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mediaType })
    });

    const data = await resp.json();
    if (!data.foods || data.foods.length === 0) {
      resultsEl.innerHTML = `<div class="empty"><div class="empty-icon">🤔</div><div class="empty-title">Couldn't identify foods</div><div class="empty-text">Try a clearer photo or better lighting</div></div>`;
      return;
    }

    renderPlateResults(data.foods, resultsEl);
  } catch (err) {
    resultsEl.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-title">Something went wrong</div><div class="empty-text">Check your connection and try again</div></div>`;
  }
}

function compressImage(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > h && w > maxSize) { h = h * maxSize / w; w = maxSize; }
      else if (h > maxSize) { w = w * maxSize / h; h = maxSize; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl.split(',')[1]); // return base64 only
    };
    img.onerror = reject;
    img.src = url;
  });
}

function renderPlateResults(foods, container) {
  // Store quantities per item
  const qtys = foods.map(() => 1);

  function render() {
    const totalSodium = foods.reduce((sum, f, i) => sum + Math.round(f.sodium_mg * qtys[i]), 0);
    container.innerHTML = `
      <div style="font-size:11px;font-weight:700;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;margin-bottom:var(--sp-sm)">🍽️ Found ${foods.length} item${foods.length>1?'s':''}</div>
      ${foods.map((f, i) => `
        <div class="card" style="margin-bottom:var(--sp-sm);padding:var(--sp-sm) var(--sp-md)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div style="flex:1">
              <div style="font-size:14px;font-weight:600;color:var(--text)">${f.name.charAt(0).toUpperCase()+f.name.slice(1)}</div>
              <div style="font-size:12px;color:var(--text-m);margin-top:2px">~${f.grams}g · ${f.notes||'estimated'}</div>
              <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
                <input type="number" class="plate-sodium-edit" data-idx="${i}" value="${Math.round(f.sodium_mg)}" min="0" style="width:72px;font-size:13px;font-weight:700;color:${Math.round(f.sodium_mg*qtys[i])>400?'var(--danger)':'var(--accent)'};border:1px solid var(--border);border-radius:6px;padding:2px 6px;background:var(--card);text-align:center">
                <span style="font-size:12px;color:var(--text-m)">mg sodium</span>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
              <button class="food-qty-btn food-qty-dec" data-idx="${i}" type="button">−</button>
              <span style="font-size:14px;font-weight:700;min-width:20px;text-align:center">${qtys[i]}×</span>
              <button class="food-qty-btn food-qty-inc" data-idx="${i}" type="button">+</button>
              <button class="food-qty-btn" data-remove="${i}" type="button" style="color:var(--danger);margin-left:4px">🗑️</button>
            </div>
          </div>
        </div>`).join('')}
      <div class="card" style="background:var(--accent-faint);border:1.5px solid var(--accent)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--text)">Total Sodium</div>
            <div style="font-size:11px;color:var(--text-m)">For this meal</div>
          </div>
          <div style="font-size:20px;font-weight:800;color:var(--accent)">${totalSodium}mg</div>
        </div>
      </div>
      <button class="btn btn-primary btn-full" id="btn-log-plate" style="margin-top:var(--sp-md)">Log All Items</button>
      <button class="btn btn-outline btn-full" id="btn-rescan-plate" style="margin-top:var(--sp-sm)">📸 Scan Again</button>
    `;

    // Sodium edits — update food object directly
    container.querySelectorAll('.plate-sodium-edit').forEach(input => {
      input.addEventListener('change', () => {
        const i = +input.dataset.idx;
        foods[i].sodium_mg = Math.max(0, parseInt(input.value) || 0);
        render();
      });
    });

    // Qty buttons
    container.querySelectorAll('.food-qty-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.idx;
        if (qtys[i] > 1) { qtys[i]--; render(); }
      });
    });
    container.querySelectorAll('.food-qty-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.idx;
        qtys[i]++; render();
      });
    });
    // Remove buttons
    container.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.remove;
        foods.splice(i, 1);
        qtys.splice(i, 1);
        if (foods.length === 0) {
          container.innerHTML = `<div class="empty"><div class="empty-icon">🍽️</div><div class="empty-title">No items left</div><div class="empty-text">Tap Scan Again to try a new photo</div></div><button class="btn btn-outline btn-full" id="btn-rescan-plate" style="margin-top:var(--sp-md)">📸 Scan Again</button>`;
          qs('#btn-rescan-plate').addEventListener('click', () => renderPlateScanner());
          return;
        }
        render();
      });
    });

    // Log all
    qs('#btn-log-plate').addEventListener('click', () => {
      foods.forEach((f, i) => {
        const sodium = Math.round(f.sodium_mg * qtys[i]);
        const name = f.name.charAt(0).toUpperCase() + f.name.slice(1);
        DB.addSodiumItem(S.viewDate, { n: name, s: sodium, srv: `~${f.grams}g`, f: sodium > 600 });
      });
      const total = foods.reduce((sum, f, i) => sum + Math.round(f.sodium_mg * qtys[i]), 0);
      closePanel();
      renderDiet();
      showToast(`✅ Logged ${foods.length} item${foods.length>1?'s':''} — ${total}mg sodium`);
      if (window.FireSync?.isSignedIn()) FireSync.push('eq_sodium', DB.sodiumLog());
    });

    // Rescan
    qs('#btn-rescan-plate').addEventListener('click', () => renderPlateScanner());
  }

  render();
}

function setupFoodAddButtons(container) {
  container.querySelectorAll('.food-item-edit').forEach(item => {
    const input   = item.querySelector('.food-sodium-edit');
    const btn     = item.querySelector('.food-add-btn');
    const qtyEl   = item.querySelector('.food-qty-num');
    const decBtn  = item.querySelector('.food-qty-dec');
    const incBtn  = item.querySelector('.food-qty-inc');
    if (!input || !btn) return;

    let qty = 1;
    const baseSodium = parseInt(input.dataset.base) || 0;

    function updateQty(delta) {
      qty = Math.max(1, Math.min(99, qty + delta));
      qtyEl.textContent = qty;
      input.value = Math.round(baseSodium * qty);
    }

    decBtn?.addEventListener('click', () => updateQty(-1));
    incBtn?.addEventListener('click', () => updateQty(+1));

    // Manual sodium edit overrides the auto-calculated value
    input.addEventListener('input', () => {
      // If user manually edits sodium, detach from qty × base logic
      // (qty stepper will still show, but won't recalculate)
      input.dataset.base = Math.round((parseInt(input.value) || 0) / qty) || 0;
    });

    btn.addEventListener('click', () => {
      try {
        const food = JSON.parse(btn.dataset.food);
        food.s = parseInt(input.value) || 0;
        food.f = food.s > 600;
        // Reflect qty in the food name if more than 1
        if (qty > 1) food.n = `${food.n} ×${qty}`;
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

// ── EXPORT TO CSV ───────────────────────────────────────────────
function downloadFile(filename, content, type='text/csv') {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function renderExportPanel() {
  const el = qs('#panel-export-body');
  el.innerHTML = `
    <div style="margin-bottom:var(--sp-md)">
      <p style="font-size:14px;color:var(--text-m);line-height:1.6;margin-bottom:var(--sp-lg)">Download your health data as CSV files for use in spreadsheets or to share with your doctor.</p>

      <div class="list-item" style="cursor:pointer" id="exp-attacks">
        <div class="list-icon">⚡</div>
        <div class="list-content">
          <div class="list-title">Attacks CSV</div>
          <div class="list-sub">Date, time, duration, intensity, symptoms, notes, meds</div>
        </div>
        <div class="more-arrow">↓</div>
      </div>

      <div class="list-item" style="cursor:pointer" id="exp-food">
        <div class="list-icon">🧂</div>
        <div class="list-content">
          <div class="list-title">Food Log CSV</div>
          <div class="list-sub">Date, food name, serving, sodium mg</div>
        </div>
        <div class="more-arrow">↓</div>
      </div>

      <div class="list-item" style="cursor:pointer" id="exp-wellness">
        <div class="list-icon">🌿</div>
        <div class="list-content">
          <div class="list-title">Wellness CSV</div>
          <div class="list-sub">Date, stress, mood, sleep hours, quality, caffeine, alcohol, pressure</div>
        </div>
        <div class="more-arrow">↓</div>
      </div>

      <div class="list-item" style="cursor:pointer" id="exp-json">
        <div class="list-icon">📦</div>
        <div class="list-content">
          <div class="list-title">All Data (JSON)</div>
          <div class="list-sub">Full backup of all Equilibrium data</div>
        </div>
        <div class="more-arrow">↓</div>
      </div>
    </div>
  `;

  qs('#exp-attacks').addEventListener('click', () => {
    const attacks = DB.attacks();
    if (!attacks.length) { showToast('No attack data to export'); return; }
    const rows = [['date','time','duration_min','intensity','symptoms','notes','medsTaken']];
    attacks.forEach(a => rows.push([
      a.date,
      a.startTime ? fmtTime(a.startTime) : '',
      a.duration || 0,
      a.intensity || '',
      (a.symptoms||[]).join(';'),
      (a.notes||'').replace(/,/g,' '),
      a.medsTaken !== undefined ? (a.medsTaken ? 'yes' : 'no') : '',
    ]));
    downloadFile(`equilibrium-attacks-${today()}.csv`, rows.map(r=>r.join(',')).join('\n'));
    showToast('Attacks exported!');
  });

  qs('#exp-food').addEventListener('click', () => {
    const log = DB.sodiumLog();
    const rows = [['date','food_name','serving','sodium_mg']];
    Object.keys(log).sort().forEach(date => {
      (log[date]?.items || []).forEach(i => rows.push([
        date,
        (i.n||'').replace(/,/g,' '),
        (i.srv||'').replace(/,/g,' '),
        i.s || 0,
      ]));
    });
    if (rows.length <= 1) { showToast('No food data to export'); return; }
    downloadFile(`equilibrium-food-${today()}.csv`, rows.map(r=>r.join(',')).join('\n'));
    showToast('Food log exported!');
  });

  qs('#exp-wellness').addEventListener('click', () => {
    const rows = [['date','stress_level','mood','sleep_hours','sleep_quality','caffeine','alcohol','pressure_hpa']];
    const pressureLog = DB.g(K.pressure) || [];
    const pressureMap = {};
    pressureLog.forEach(p => { pressureMap[p.date] = p.hpa; });
    // gather all dates with any wellness data
    const dates = new Set();
    const stressAll = DB.g(K.stress) || {};
    const sleepAll  = DB.g(K.sleep) || {};
    const caffAll   = DB.g(K.caff) || {};
    Object.keys(stressAll).forEach(d => dates.add(d));
    Object.keys(sleepAll).forEach(d => dates.add(d));
    Object.keys(caffAll).forEach(d => dates.add(d));
    [...dates].sort().forEach(date => {
      const st = DB.stressFor(date);
      const sl = DB.sleepFor(date);
      const ca = DB.caffFor(date);
      rows.push([
        date,
        st?.level || '',
        st?.mood || '',
        sl?.duration || '',
        sl?.quality || '',
        ca?.c || 0,
        ca?.a || 0,
        pressureMap[date] || '',
      ]);
    });
    if (rows.length <= 1) { showToast('No wellness data to export'); return; }
    downloadFile(`equilibrium-wellness-${today()}.csv`, rows.map(r=>r.join(',')).join('\n'));
    showToast('Wellness data exported!');
  });

  qs('#exp-json').addEventListener('click', () => {
    const allData = {};
    Object.keys(localStorage).filter(k => k.startsWith('eq_')).forEach(k => {
      try { allData[k] = JSON.parse(localStorage.getItem(k)); } catch { allData[k] = localStorage.getItem(k); }
    });
    downloadFile(`equilibrium-backup-${today()}.json`, JSON.stringify(allData, null, 2), 'application/json');
    showToast('Full backup exported!');
  });
}

// ── PUSH NOTIFICATION REMINDERS ──────────────────────────────────
async function checkNotifications() {
  const s = DB.settings();
  if (!s.notifEnabled) return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const now = new Date();
  const todayStr = today();
  const hhmm = now.toTimeString().slice(0,5);
  const last = DB.g(K.notifLast) || {};

  const reminders = [
    {key:'morning', action:'wellness', time: s.notifMorning || '08:00', title:'Morning Check-In ☀️', body:'Log your morning wellness and review your plan for the day.'},
    {key:'med',     action:'log-dose', time: s.notifMed || '09:00',     title:'Medication Reminder 💊', body:'Time to take your scheduled medications.'},
    {key:'evening', action:'food',     time: s.notifEvening || '20:00', title:'Evening Log 🌙', body:'Log today\'s attacks, food, and how you\'re feeling.'},
  ];

  reminders.forEach(r => {
    if (last[r.key] === todayStr) return; // already shown today
    const [rh, rm] = r.time.split(':').map(Number);
    const [nh, nm] = hhmm.split(':').map(Number);
    const rMins = rh * 60 + rm;
    const nMins = nh * 60 + nm;
    if (nMins >= rMins && nMins <= rMins + 30) {
      new Notification(r.title, {body: r.body, icon: './icon-192.png', data: {url: `./index.html?action=${r.action || ''}`}});
      last[r.key] = todayStr;
      DB.s(K.notifLast, last);
    }
  });
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
      case 'scan-plate':  openPlateScanner(); break;
      case 'medications': openPanel('panel-medications', renderMedicationsPanel); break;
      case 'triggers':    openPanel('panel-triggers', renderTriggersPanel); break;
      case 'report':      openPanel('panel-report', renderReportPanel); break;
      case 'emergency':   openPanel('panel-emergency', renderEmergencyPanel); break;
      case 'log-attack':  openPanel('panel-log-attack', ()=>renderLogAttackPanel(null)); break;
      case 'add-med':     openPanel('panel-add-med', renderAddMedPanel); break;
      case 'about':       openPanel('panel-about', renderAboutPanel); break;
      case 'support':     openSupportPage(); break;
      case 'settings':    openPanel('panel-settings', renderSettingsPanel); break;
      case 'export':      openPanel('panel-export', renderExportPanel); break;
      case 'account':     openPanel('panel-account', renderAccountPanel); break;

      case 'year-review': openPanel('panel-review', renderReviewPanel); break;

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
        const prevC = ca.c;
        ca.c = clamp(ca.c + (act.endsWith('inc')?1:-1), 0, 20);
        DB.saveCaff(t, ca);
        // Re-render if crossing the warning threshold in either direction
        if (ca.c >= CAFFEINE_WARN || prevC >= CAFFEINE_WARN) renderDiet();
        else qs('#caff-val').textContent = ca.c;
        break;
      }
      case 'alc-inc': case 'alc-dec': {
        const t=S.viewDate; const ca=DB.caffFor(t);
        const prevA = ca.a;
        ca.a = clamp(ca.a + (act.endsWith('inc')?1:-1), 0, 20);
        DB.saveCaff(t, ca);
        if (ca.a >= ALCOHOL_WARN || prevA >= ALCOHOL_WARN) renderDiet();
        else qs('#alc-val').textContent = ca.a;
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

  // Heat map day click
  const heatCell = e.target.closest('[data-heat-date]');
  if (heatCell) {
    S.viewDate = heatCell.dataset.heatDate;
    renderSymptoms();
    return;
  }

  // Backup nudge dismiss
  if (e.target.id === 'btn-dismiss-nudge' || e.target.closest('#btn-dismiss-nudge')) {
    localStorage.setItem('eq_nudge_dismissed', today());
    const nudge = qs('#backup-nudge');
    if (nudge) nudge.remove();
    return;
  }

  // Onboarding dismiss
  if (e.target.id === 'btn-dismiss-onboarding' || e.target.closest('#btn-dismiss-onboarding')) {
    const state = getOnboardingState();
    const doneCount = Object.values(state.done).filter(Boolean).length;
    if (doneCount >= ONBOARDING_TASKS.length) {
      state.celebrated = true;
      DB.s(K.onboarding, state);
    } else {
      state.startDate = '2000-01-01'; // force hide
      DB.s(K.onboarding, state);
    }
    renderHome();
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

  // Scanner close
  if (e.target.id === 'btn-stop-scanner' || e.target.closest('#btn-stop-scanner')) {
    stopScanner(); return;
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

    // Block future date+time combinations
    if (startTimeStr) {
      const chosen = new Date(`${dateStr}T${startTimeStr}:00`);
      if (chosen > new Date()) {
        showToast('Start time can\'t be in the future');
        return;
      }
    }

    const startISO = startTimeStr ? `${dateStr}T${startTimeStr}:00` : null;
    const syms = fd.getAll('symptoms');

    const attack = {
      id: uid(), date: dateStr, startTime: startISO,
      duration: dur, intensity: +fd.get('intensity'),
      symptoms: syms, notes: fd.get('notes').trim(),
      medsTaken: qs('#chk-meds-taken')?.checked ?? false,
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
const TUTORIAL_VERSION = 4; // bump this whenever tutorial content changes

const TUTORIAL_STEPS = [
  {
    icon: '🌊',
    title: 'Welcome to Equilibrium',
    body: 'Your personal companion for managing Ménière\'s disease. Track symptoms, sodium, wellness, and more — all in one place. This quick tour shows you everything.',
  },
  {
    icon: '🏠',
    title: 'Your Daily Dashboard',
    body: 'The <strong>Home</strong> tab shows today\'s sodium, hydration, attacks this week, and stress level. It also shows <strong>live weather and barometric pressure</strong> — pressure changes are a known Ménière\'s trigger. Use the ← → arrows to review any past day.',
  },
  {
    icon: '⚡',
    title: 'Log Attacks',
    body: 'On the <strong>Symptoms</strong> tab, tap the attack button to log instantly. Record intensity (1–10), duration (1–60 min), symptoms experienced, and any notes. Every attack is timestamped and saved to your history.',
  },
  {
    icon: '🧂',
    title: 'Track Your Sodium',
    body: 'The <strong>Diet</strong> tab lets you search and log food. Results come from the <strong>USDA FoodData Central</strong> database with over 1 million foods. You can also scan a barcode or search by name — and edit the sodium amount before adding.',
  },
  {
    icon: '🌿',
    title: 'Daily Wellness Check-In',
    body: 'On the <strong>Wellness</strong> tab, log your mood, stress level, hours of sleep, and trigger beverages like caffeine and alcohol. Consistent daily check-ins help reveal patterns over time.',
  },
  {
    icon: '☰',
    title: 'More Tools',
    body: 'The <strong>More</strong> tab has everything else: <strong>Medications</strong> to track doses, <strong>Trigger Insights</strong> to spot patterns, an <strong>Emergency Card</strong> with your info for first responders, and <strong>Settings</strong> to customize your goals.',
  },
  {
    icon: '📋',
    title: 'Doctor Report',
    body: 'Under More → <strong>Doctor Report</strong>, choose any date range and generate a beautiful PDF summary: attack history with barometric pressure readings, sodium averages, sleep, stress, and medications. <strong>Print it, download it, or send it</strong> directly to your doctor.',
  },
  {
    icon: '📱',
    title: 'Install & Back Up',
    body: '<strong>iPhone:</strong> open in Safari → tap <strong>(···)</strong> → Share → <strong>More (···)</strong> → "Add to Home Screen".<br><strong>Android:</strong> open in Chrome → tap the <strong>three dots menu</strong> → "Install app".<br><br>It opens fullscreen like a native app with no browser bar.<br><br><strong>Back up your data:</strong> go to More → Account & Backup and create a free account — your health history syncs to the cloud and is never lost.',
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
    localStorage.setItem(K.tutorialSeen, String(TUTORIAL_VERSION));
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

// ── ANNUAL YEAR-IN-REVIEW ────────────────────────────────────────
function buildReviewSlides(year) {
  const yearStart = `${year}-01-01`;
  const yearEnd   = `${year}-12-31`;

  const attacks = DB.attacks().filter(a => a.date >= yearStart && a.date <= yearEnd);
  const totalAttacks = attacks.length;

  // Best and worst months
  const byMonth = {};
  attacks.forEach(a => {
    const mo = a.date.slice(0, 7); // YYYY-MM
    byMonth[mo] = (byMonth[mo] || 0) + 1;
  });
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthEntries = Object.entries(byMonth).sort((a,b) => b[1] - a[1]);
  const worstMonth = monthEntries[0] ? {mo: monthEntries[0][0], count: monthEntries[0][1]} : null;

  // Most common symptom
  const symsCount = {};
  attacks.forEach(a => (a.symptoms||[]).forEach(s => { symsCount[s] = (symsCount[s]||0)+1; }));
  const topSymptom = Object.entries(symsCount).sort((a,b)=>b[1]-a[1])[0];

  // Sodium average
  const sodiumLog = DB.sodiumLog();
  let sodTotal = 0, sodDays = 0;
  Object.keys(sodiumLog).filter(d => d >= yearStart && d <= yearEnd).forEach(d => {
    const s = DB.totalSodium(d);
    if (s > 0) { sodTotal += s; sodDays++; }
  });
  const avgSodium = sodDays ? Math.round(sodTotal / sodDays) : 0;

  // Logging streak (best)
  let bestStreak = 0, currentStreak = 0;
  for (let i = 0; i <= 365; i++) {
    const d = new Date(yearStart + 'T12:00:00');
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().split('T')[0];
    if (ds > yearEnd) break;
    if (hasDataForDate(ds)) { currentStreak++; bestStreak = Math.max(bestStreak, currentStreak); }
    else currentStreak = 0;
  }

  // Days logged
  const daysLogged = Object.keys({
    ...Object.fromEntries((DB.g(K.stress)||{}) ? Object.entries(DB.g(K.stress)||{}) : []),
    ...Object.fromEntries((DB.g(K.sleep)||{}) ? Object.entries(DB.g(K.sleep)||{}) : []),
    ...Object.fromEntries(Object.keys(sodiumLog).map(k => [k, 1])),
  }).filter(d => d >= yearStart && d <= yearEnd).length;

  const slides = [
    {
      bg: 'linear-gradient(135deg, #5B9B8A 0%, #3D7A6A 100%)',
      emoji: '🌊',
      headline: `${year} in Review`,
      sub: `Your year managing Ménière's with Equilibrium`,
      stat: null,
    },
    {
      bg: 'linear-gradient(135deg, #E07070 0%, #B84040 100%)',
      emoji: '⚡',
      headline: `${totalAttacks} attacks tracked`,
      sub: totalAttacks === 0 ? 'An incredible attack-free year!' : totalAttacks < 20 ? 'A year of resilience' : 'Every log was a step toward understanding your triggers',
      stat: totalAttacks > 0 && worstMonth ? `Toughest month: ${monthNames[parseInt(worstMonth.mo.split('-')[1])-1]} (${worstMonth.count} attacks)` : null,
    },
    {
      bg: 'linear-gradient(135deg, #6DB87A 0%, #3D8A50 100%)',
      emoji: '🔥',
      headline: `${bestStreak}-day streak`,
      sub: bestStreak > 0 ? `That was your longest logging streak this year` : 'Start your streak this year',
      stat: daysLogged > 0 ? `${daysLogged} total days logged` : null,
    },
    {
      bg: 'linear-gradient(135deg, #E8A87C 0%, #C07840 100%)',
      emoji: '🧂',
      headline: avgSodium > 0 ? `${avgSodium}mg avg sodium` : 'Start tracking sodium',
      sub: avgSodium > 0
        ? avgSodium <= (DB.settings().sodiumGoal || 1500) ? '✅ Under your daily goal on average!' : 'Keep working toward your sodium goal'
        : 'Tracking sodium helps identify triggers',
      stat: avgSodium > 0 ? `${sodDays} days of food logging` : null,
    },
    ...(topSymptom ? [{
      bg: 'linear-gradient(135deg, #7B8FD8 0%, #4A5CB0 100%)',
      emoji: '📊',
      headline: `Most common: ${topSymptom[0]}`,
      sub: `Appeared in ${topSymptom[1]} attack${topSymptom[1]>1?'s':''} this year`,
      stat: `Tracked ${Object.keys(symsCount).length} different symptom type${Object.keys(symsCount).length>1?'s':''}`,
    }] : []),
    {
      bg: 'linear-gradient(135deg, #5B9B8A 0%, #3D7A6A 100%)',
      emoji: '💙',
      headline: 'You showed up',
      sub: 'Every day you tracked, you gave yourself — and your doctor — powerful information. Keep going.',
      stat: null,
    },
  ];

  return slides;
}

const YearReview = {
  current: 0,
  slides: [],

  show(year) {
    this.slides = buildReviewSlides(year || new Date().getFullYear() - 1);
    this.current = 0;
    qs('#review-overlay').classList.remove('hidden');
    this.render();
  },

  hide() {
    qs('#review-overlay').classList.add('hidden');
  },

  render() {
    const slide = this.slides[this.current];
    const total = this.slides.length;
    const isLast = this.current === total - 1;

    qs('#review-slide').innerHTML = `
      <div class="review-slide" style="background:${slide.bg}">
        <div class="review-emoji">${slide.emoji}</div>
        <div class="review-headline">${slide.headline}</div>
        <div class="review-sub">${slide.sub}</div>
        ${slide.stat ? `<div class="review-stat">${slide.stat}</div>` : ''}
      </div>
    `;

    qs('#review-dots').innerHTML = this.slides.map((_, i) =>
      `<div class="review-dot${i === this.current ? ' active' : ''}"></div>`
    ).join('');

    qs('#btn-review-prev').style.visibility = this.current > 0 ? 'visible' : 'hidden';
    qs('#btn-review-next').textContent = isLast ? '🎉 Done' : 'Next →';
  },
};

function initYearReview() {
  qs('#btn-review-skip').addEventListener('click', () => YearReview.hide());
  qs('#btn-review-next').addEventListener('click', () => {
    if (YearReview.current < YearReview.slides.length - 1) {
      YearReview.current++;
      YearReview.render();
    } else {
      YearReview.hide();
    }
  });
  qs('#btn-review-prev').addEventListener('click', () => {
    if (YearReview.current > 0) { YearReview.current--; YearReview.render(); }
  });
}

function renderReviewPanel() {
  const currentYear = new Date().getFullYear();
  const el = qs('#panel-review-body');
  el.innerHTML = `
    <div class="card">
      <div class="card-title" style="margin-bottom:var(--sp-sm)">🌟 Your Year in Review</div>
      <p style="font-size:13px;color:var(--text-m);margin-bottom:var(--sp-md)">See a beautiful summary of your health journey over the past year.</p>
      <button class="btn btn-primary btn-full" id="btn-start-review-${currentYear - 1}">View ${currentYear - 1} Review</button>
      ${currentYear === new Date().getFullYear() && new Date().getMonth() >= 6 ? `
        <button class="btn btn-ghost btn-full" id="btn-start-review-${currentYear}" style="margin-top:8px">View ${currentYear} So Far</button>
      ` : ''}
    </div>
  `;
  el.addEventListener('click', e => {
    const btn = e.target.closest('[id^="btn-start-review-"]');
    if (!btn) return;
    const year = parseInt(btn.id.replace('btn-start-review-',''));
    closePanel();
    setTimeout(() => YearReview.show(year), 200);
  });
}

// ── WEEKLY SUMMARY ───────────────────────────────────────────────
function showWeeklySummary() {
  const now = new Date();
  // Last week: Mon to Sun
  const thisMon = startOfWeek(); // this Monday
  const lastMon = shiftDate(thisMon, -7);
  const lastSun = shiftDate(thisMon, -1);

  const attacks = DB.attacks();
  const lastWeekAtk = attacks.filter(a => a.date >= lastMon && a.date <= lastSun);
  const prevMon = shiftDate(lastMon, -7);
  const prevSun = shiftDate(lastMon, -1);
  const prevWeekAtk = attacks.filter(a => a.date >= prevMon && a.date <= prevSun);

  // Sodium avg last week
  let sodTotal = 0, sodDays = 0;
  for (let i = 0; i < 7; i++) {
    const d = shiftDate(lastMon, i);
    const s = DB.totalSodium(d);
    if (s > 0) { sodTotal += s; sodDays++; }
  }
  const avgSodium = sodDays ? Math.round(sodTotal/sodDays) : 0;
  const sGoal = DB.settings().sodiumGoal || SODIUM_GOAL;

  // Sleep avg last week
  let slpTotal = 0, slpDays = 0;
  for (let i = 0; i < 7; i++) {
    const sl = DB.sleepFor(shiftDate(lastMon, i));
    if (sl) { slpTotal += sl.duration || 0; slpDays++; }
  }
  const avgSleep = slpDays ? (slpTotal/slpDays).toFixed(1) : 'N/A';

  // Best / worst day (attacks + sodium)
  let bestDay = null, worstDay = null, bestScore = Infinity, worstScore = -Infinity;
  for (let i = 0; i < 7; i++) {
    const d = shiftDate(lastMon, i);
    const atk = attacks.filter(a => a.date === d).length;
    const sod = DB.totalSodium(d);
    const score = atk * 100 + sod;
    if (score < bestScore) { bestScore = score; bestDay = d; }
    if (score > worstScore) { worstScore = score; worstDay = d; }
  }

  const atkDiff = lastWeekAtk.length - prevWeekAtk.length;
  const atkArrow = atkDiff > 0 ? `▲ ${atkDiff} more` : atkDiff < 0 ? `▼ ${Math.abs(atkDiff)} fewer` : '— same';
  const atkColor = atkDiff > 0 ? 'var(--danger)' : atkDiff < 0 ? 'var(--success)' : 'var(--text-m)';

  const el = qs('#weekly-summary-overlay');
  qs('#weekly-summary-body').innerHTML = `
    <div class="weekly-stat-grid">
      <div class="weekly-stat-item">
        <div class="weekly-stat-val">${lastWeekAtk.length}</div>
        <div class="weekly-stat-lbl">Attacks last week</div>
        <div style="font-size:12px;color:${atkColor};margin-top:2px">${atkArrow} vs week before</div>
      </div>
      <div class="weekly-stat-item">
        <div class="weekly-stat-val">${avgSodium > 0 ? avgSodium+'mg' : 'N/A'}</div>
        <div class="weekly-stat-lbl">Avg daily sodium</div>
        ${avgSodium > 0 ? `<div style="font-size:12px;color:${avgSodium <= sGoal ? 'var(--success)' : 'var(--danger)'};margin-top:2px">${avgSodium <= sGoal ? '✅ Under goal' : '⚠️ Over goal'}</div>` : ''}
      </div>
      <div class="weekly-stat-item">
        <div class="weekly-stat-val">${avgSleep}${avgSleep !== 'N/A' ? 'h' : ''}</div>
        <div class="weekly-stat-lbl">Avg sleep</div>
      </div>
      <div class="weekly-stat-item">
        <div class="weekly-stat-val">${prevWeekAtk.length}</div>
        <div class="weekly-stat-lbl">Attacks week before</div>
      </div>
    </div>
    ${bestDay ? `<div style="margin-top:var(--sp-md);font-size:13px">
      <div style="margin-bottom:4px">✅ <strong>Best day:</strong> ${fmtDate(bestDay)}</div>
      <div>⚠️ <strong>Toughest day:</strong> ${fmtDate(worstDay)}</div>
    </div>` : ''}
  `;

  el.classList.remove('hidden');
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

  // Wire weekly summary close button
  qs('#btn-close-weekly')?.addEventListener('click', () => {
    const thisMon = startOfWeek();
    localStorage.setItem(K.weeklySummaryShown, thisMon);
    qs('#weekly-summary-overlay').classList.add('hidden');
  });

  // Initial render
  switchTab('home');

  // Handle URL action params (from shortcuts or notification deep links)
  const urlAction = new URLSearchParams(location.search).get('action');
  if (urlAction) {
    setTimeout(() => {
      switch(urlAction) {
        case 'food':
          renderFoodSearch();
          break;
        case 'attack':
          switchTab('symptoms');
          break;
        case 'wellness':
          switchTab('wellness');
          break;
        case 'log-dose':
          openPanel('panel-medications', renderMedicationsPanel);
          break;
      }
    }, 300);
  }

  // Show tutorial on first launch OR when tutorial content has been updated
  const seenVer = parseInt(localStorage.getItem(K.tutorialSeen) || '0');
  if (seenVer < TUTORIAL_VERSION) {
    setTimeout(() => Tutorial.show(), 400);
  }

  // Show weekly summary on Mondays (once per week)
  const todayD = new Date();
  if (todayD.getDay() === 1) {
    const thisWeekMonday = startOfWeek();
    const lastShown = localStorage.getItem(K.weeklySummaryShown);
    if (lastShown !== thisWeekMonday) {
      setTimeout(() => showWeeklySummary(), 600);
    }
  }

  // Show year-in-review on Jan 1
  const todayStr2 = today();
  const reviewKey = `eq_review_shown_${new Date().getFullYear()-1}`;
  if (todayStr2.endsWith('-01-01') && !localStorage.getItem(reviewKey)) {
    localStorage.setItem(reviewKey, '1');
    setTimeout(() => YearReview.show(new Date().getFullYear() - 1), 1200);
  }
  initYearReview();

  // Check notifications
  checkNotifications();

  // Schedule automatic reset at midnight
  scheduleMidnightRollover();

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // If the calendar day changed while the app was in the background,
      // reset viewDate to today so all counters (water, sodium, food, caff) refresh
      const newDay = today();
      if (S.viewDate !== newDay && S.viewDate === _lastRenderedDate) {
        S.viewDate = newDay;
        const renders = {home:renderHome, symptoms:renderSymptoms, diet:renderDiet, wellness:renderWellness};
        renders[S.tab]?.();
      }
      _lastRenderedDate = today();
      checkNotifications();
    }
  });
}

// Tracks the last "today" date we rendered, so we can detect a day rollover
let _lastRenderedDate = today();

// ── Midnight rollover — fires exactly when the clock hits 00:00 ───
function scheduleMidnightRollover() {
  const now  = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 100); // next midnight + 100ms buffer
  const msUntil = midnight - now;
  setTimeout(() => {
    // Reset viewDate to the new day so all counters refresh
    S.viewDate = today();
    _lastRenderedDate = today();
    const renders = { home:renderHome, symptoms:renderSymptoms, diet:renderDiet, wellness:renderWellness };
    renders[S.tab]?.();
    scheduleMidnightRollover(); // reschedule for the next day
  }, msUntil);
}

document.addEventListener('DOMContentLoaded', init);
