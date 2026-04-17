/* ================================================================
   EQUILIBRIUM — firebase.js
   Firebase Auth + Firestore sync layer
   Strategy: localStorage stays the source of truth.
   When signed in, every DB write also pushes to Firestore.
   On sign-in, cloud data is loaded into localStorage, then the
   app re-renders normally — zero changes to core app logic.
   ================================================================ */

const FireSync = (() => {

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
    } catch {}
  }

  // ── Auth state listener ──────────────────────────────────────────
  auth.onAuthStateChanged(async user => {
    _user = user;
    _initialized = true;

    if (user) {
      const hadCloudData = await loadFromCloud();
      if (!hadCloudData) {
        // Brand new account — push whatever local data exists
        await migrateLocalToCloud();
      }
      rerender();
      updateAccountBadge();
    } else {
      rerender();
      updateAccountBadge();
    }
  });

  // ── Update the account icon/badge in More tab ────────────────────
  function updateAccountBadge() {
    const el = document.getElementById('more-account-sub');
    if (!el) return;
    el.textContent = _user
      ? (_user.displayName || _user.email || 'Signed in')
      : 'Sign in to back up your data';
  }

  // ── Google sign-in (redirect — works in PWA/iOS/Android) ────────
  async function signInGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithRedirect(provider);
    } catch (e) {
      showToast('Sign in failed — try again');
    }
  }

  // ── Handle redirect result on page load ─────────────────────────
  auth.getRedirectResult().then(result => {
    if (result && result.user) {
      showToast('Signed in with Google ✓');
    }
  }).catch(e => {
    if (e.code && e.code !== 'auth/no-auth-event') {
      showToast('Google sign-in failed — try again');
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
