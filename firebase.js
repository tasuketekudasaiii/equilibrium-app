/* ================================================================
   EQUILIBRIUM — firebase.js
   Firebase Auth + Firestore sync layer
   Strategy: localStorage stays the source of truth.
   When signed in, every DB write also pushes to Firestore.
   On sign-in, cloud data is loaded into localStorage, then the
   app re-renders normally — zero changes to core app logic.
   ================================================================ */

window.FireSync = (() => {

  const firebaseConfig = {
    apiKey: "AIzaSyDuZCiieKB9Sj79LLenPLE17qZpyQOFkE8",
    authDomain: "equilibrium-app-da889.firebaseapp.com",
    projectId: "equilibrium-app-da889",
    storageBucket: "equilibrium-app-da889.firebasestorage.app",
    messagingSenderId: "342334818127",
    appId: "1:342334818127:web:dae656ddc9a2fd33aae73a"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db   = firebase.firestore();

  let _user        = null;
  let _syncTimer   = null;
  let _pending     = {};
  let _initialized = false;

  const DATA_KEYS = [
    'eq_attacks','eq_meds','eq_doses','eq_sodium','eq_hydration',
    'eq_stress','eq_sleep','eq_caff','eq_emergency','eq_settings',
    'eq_badges','eq_pressure','eq_onboarding',
  ];

  // ── Helpers ──────────────────────────────────────────────────────
  function userDoc() {
    if (!_user) return null;
    return db.collection('users').doc(_user.uid).collection('data').doc('health');
  }

  function isSignedIn() { return _user !== null; }

  function getUser() { return _user; }

  // ── Debounced write to Firestore ─────────────────────────────────
  function push(key, value) {
    if (!_user) return;
    _pending[key] = value;
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(flush, 1500);
  }

  async function flush() {
    if (!_user || !Object.keys(_pending).length) return;
    const batch = { ..._pending };
    _pending = {};
    try {
      await userDoc().set(batch, { merge: true });
    } catch (e) {
      console.warn('[FireSync] write error:', e);
    }
  }

  // ── Load all cloud data → localStorage ──────────────────────────
  async function loadFromCloud() {
    if (!_user) return false;
    try {
      const doc = await userDoc().get();
      if (doc.exists) {
        const data = doc.data();
        Object.entries(data).forEach(([k, v]) => {
          if (k.startsWith('eq_')) localStorage.setItem(k, JSON.stringify(v));
        });
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[FireSync] load error:', e);
      return false;
    }
  }

  // ── Migrate existing localStorage → Firestore (new account) ─────
  async function migrateLocalToCloud() {
    if (!_user) return;
    const allData = {};
    DATA_KEYS.forEach(k => {
      try {
        const v = JSON.parse(localStorage.getItem(k));
        if (v !== null) allData[k] = v;
      } catch {}
    });
    if (!Object.keys(allData).length) return;
    try {
      await userDoc().set(allData, { merge: true });
    } catch (e) {
      console.warn('[FireSync] migration error:', e);
    }
  }

  // ── Re-render after auth state change ───────────────────────────
  function rerender() {
    try {
      const renders = {
        home: renderHome, symptoms: renderSymptoms,
        diet: renderDiet, wellness: renderWellness, more: renderMore,
      };
      renders[S?.tab]?.();
      // If account panel is open, refresh it so it shows signed-in state
      if (document.getElementById('panel-account')?.classList.contains('open')) {
        renderAccountPanel?.();
      }
    } catch {}
  }

  // ── Auth state listener ──────────────────────────────────────────
  auth.onAuthStateChanged(async user => {
    console.log('[FireSync] auth state changed:', user?.email || 'signed out');
    _user = user;
    _initialized = true;

    // Update UI immediately — don't wait for cloud data
    updateAccountBadge();
    try { rerender(); } catch(e) { console.warn('[FireSync] rerender error:', e); }

    if (user) {
      // Load/migrate cloud data in the background
      const hadCloudData = await loadFromCloud();
      if (!hadCloudData) await migrateLocalToCloud();
      // Re-render once more with fresh data
      try { rerender(); } catch(e) {}
    }
  });

  // ── Update the account icon/badge in More tab + header ──────────
  function updateAccountBadge() {
    const el = document.getElementById('more-account-sub');
    if (el) {
      el.textContent = _user
        ? (_user.displayName || _user.email || 'Signed in')
        : 'Sign in to back up your data';
    }
    // Update header subtitle to show signed-in name
    const hdr = document.getElementById('header-sub');
    if (hdr) {
      const name = _user?.displayName || _user?.email;
      hdr.textContent = _user && name
        ? `Signed in as ${name.split('@')[0]}`
        : "Your Ménière's Companion";
    }
  }

  // ── Google sign-in (popup → redirect fallback) ──────────────────
  async function signInGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await auth.signInWithPopup(provider);
      console.log('[FireSync] popup result:', result?.user?.email);
      if (result && result.user) {
        _user = result.user;
        applySignedInUI();
        return true;
      }
    } catch (e) {
      console.warn('[FireSync] popup error:', e.code, e.message);
      if (e.code === 'auth/popup-closed-by-user' ||
          e.code === 'auth/cancelled-popup-request') return false;
      // Any other failure → try redirect
      try {
        await auth.signInWithRedirect(provider);
      } catch (e2) {
        console.warn('[FireSync] redirect error:', e2);
        showToast('Sign in failed — try again');
      }
    }
    return false;
  }

  // ── Apply signed-in UI immediately ───────────────────────────────
  function applySignedInUI() {
    updateAccountBadge();
    try { renderHome?.(); } catch(e) { console.warn('[FireSync] renderHome error:', e); }
    try { renderMore?.(); } catch(e) { console.warn('[FireSync] renderMore error:', e); }
    try {
      if (document.getElementById('panel-account')?.classList.contains('open')) {
        renderAccountPanel?.();
      }
    } catch(e) { console.warn('[FireSync] renderAccountPanel error:', e); }
  }

  // ── Handle redirect result on page load ─────────────────────────
  auth.getRedirectResult().then(result => {
    if (result && result.user) {
      showToast('Signed in with Google ✓');
    }
  }).catch(e => {
    if (e.code && e.code !== 'auth/no-auth-event') {
      console.warn('[FireSync] redirect result error:', e.code);
    }
  });

  // ── Email sign-in ────────────────────────────────────────────────
  async function signInEmail(email, password) {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      return true;
    } catch (e) {
      const msg = {
        'auth/user-not-found':   'No account found with that email',
        'auth/wrong-password':   'Incorrect password',
        'auth/invalid-email':    'Invalid email address',
        'auth/invalid-credential': 'Invalid email or password',
      }[e.code] || 'Sign in failed — try again';
      showToast(msg);
      return false;
    }
  }

  // ── Create account ───────────────────────────────────────────────
  async function createAccount(email, password) {
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      return true;
    } catch (e) {
      const msg = {
        'auth/email-already-in-use': 'Email already in use — try signing in',
        'auth/weak-password':        'Password must be at least 6 characters',
        'auth/invalid-email':        'Invalid email address',
      }[e.code] || 'Could not create account — try again';
      showToast(msg);
      return false;
    }
  }

  // ── Sign out ─────────────────────────────────────────────────────
  async function signOut() {
    await flush(); // save any pending writes first
    await auth.signOut();
    showToast('Signed out — data saved locally');
  }

  // ── Password reset ───────────────────────────────────────────────
  async function resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      showToast('Reset email sent — check your inbox');
    } catch {
      showToast('Could not send reset email');
    }
  }

  return {
    isSignedIn, getUser, push, flush,
    signInGoogle, signInEmail, createAccount, signOut, resetPassword,
    updateAccountBadge,
  };

})();
