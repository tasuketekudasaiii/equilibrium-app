# 🌊 Equilibrium — Ménière's Disease Companion

A compassionate, mobile-first Progressive Web App (PWA) for people living with Ménière's disease. Equilibrium helps you track symptoms, medications, diet, stress, and sleep — and over time, identifies your personal attack triggers.

> **Data is stored locally on your device and optionally synced to the cloud via Firebase. No ads. No tracking. Free forever.**

---

## 📱 Install on iPhone / Android

1. Open **myequilibrium.app** in **Safari** (iPhone) or **Chrome** (Android)
2. Tap the **Share** button → **"Add to Home Screen"**
3. Tap **Add**

The app installs like a native app — full screen, works offline, and auto-updates silently in the background whenever a new version is deployed.

---

## ✨ Features

### 🏠 Home Dashboard
- At-a-glance summary: sodium consumed, glasses of water, attacks this week, stress level
- Encouraging message that adapts to how your week is going
- Sodium budget progress bar with visual warning zones
- Tap-to-fill hydration tracker
- Quick actions: Log Attack, Medications, Wellness Check-In, Doctor Report
- **Rotating "Did You Know?" sodium facts** — a new tip each day
- **Medication reminder cards** with one-tap dose logging
- **Onboarding checklist** for first-time users with achievement tracking
- **Weekly summary** every Monday showing last week's stats (attacks, sodium, sleep)

### ⚡ Symptom Log
- **One-tap attack timer** — tap Start when an episode begins, Stop when it ends
- Log past attacks with date, time, duration, intensity (1–10), and symptoms (vertigo, tinnitus, hearing loss, ear pressure, nausea, vomiting, drop attack)
- Add post-attack notes
- 30-day attack frequency bar chart

### 🥗 Diet Tracker
- **✨ AI Powered Camera** — take a photo of any meal and Claude AI instantly identifies every ingredient with estimated sodium content. Edit, delete, or log individual items
- **Food search** — search 1 million+ foods from the USDA FoodData Central database
- **Barcode scanner** — scan packaged foods via Open Food Facts
- Sodium budget meter with daily goal (default 1,500mg, adjustable)
- High-sodium foods flagged with warnings
- **Hydration tracker** — tap glasses to log water intake
- **Caffeine & alcohol** — auto-detected when you log food, with threshold warnings

### 🌿 Wellness Check-In
- Daily stress level slider (1–10)
- Mood picker with emoji (Great, Calm, Anxious, Fatigued, Frustrated)
- Optional free-form journal entry
- Sleep log with bedtime, wake time, and quality rating (1–5 stars)
- 14-day stress trend chart

### 💊 Medications
- Add medications with name, dosage, type, and scheduled reminder times
- Daily dose schedule with one-tap check-off (taken ✓ / missed ✕)
- **Push notifications** — get reminded even when the app is closed, powered by Cloudflare Workers + Web Push API
- Individual toggles for morning check-in, evening check-in, and each medication reminder

### 🔍 Trigger Insights
- Automatically correlates attacks with the day before: sodium, stress, sleep, caffeine, alcohol
- Shows percentage correlation for each potential trigger once 3+ attacks are logged
- Helps you understand your personal patterns over time

### 📋 Doctor Report
- Auto-generates a 30-day summary: attack count, average intensity, average duration, sodium intake, medication adherence, sleep hours, and stress level
- One-tap **Copy to Clipboard** to paste into a message or email for your doctor

### 🚨 Emergency Card
- Store your name, diagnosis, medications, doctor contact, and emergency contact
- Displays as a bold card for quick reference at any time

### 🌟 Year in Review
- Beautiful animated slides summarising your entire year: total attacks, best month, sodium trends, wellness insights
- Auto-shows on January 1st

### 👤 Account & Cloud Sync
- Optional Firebase account (email/password or Google Sign-In)
- Syncs all your data across devices in real time
- Data stays local if you prefer not to sign in

---

## ⚙️ Settings

- **Daily sodium goal** — adjust from the default 1,500mg
- **Dark mode** — full dark theme
- **Push notifications** — enable/disable morning check-in, evening check-in, and medication reminders individually, with custom times
- **Export data** — download your full log as JSON

---

## 🏗️ Architecture

### Frontend
- Vanilla JS, HTML, CSS — no framework, no build step
- PWA with service worker (`sw.js`) for offline support and background caching
- Auto-detects new deployments and silently reloads when a new version is available

### Backend
- **Firebase Firestore** — optional cloud sync and authentication
- **Cloudflare Worker** (`equilibrium-vision`) — two functions:
  - **AI Vision**: proxies images to Claude Haiku for food identification
  - **Web Push**: stores subscriptions in Cloudflare KV and fires scheduled push notifications via VAPID + cron trigger (`*/15 * * * *`)

---

## 🗂️ File Structure

```
Equilibrium/
├── index.html        # App shell and all panel/overlay markup
├── app.js            # All app logic
├── app.css           # All styles — light + dark mode
├── firebase.js       # Firebase sync (runs after app.js)
├── manifest.json     # PWA configuration
├── sw.js             # Service worker — offline cache + push notifications
├── icon.svg          # App icon
└── icon-maskable.svg # Maskable icon for Android
```

---

## 🛠️ Running Locally

No build step required:

```bash
cd Equilibrium
python3 -m http.server 3000
# Open http://localhost:3000
```

---

## 🚀 Deployment

Deployed to **Cloudflare Pages** via GitHub. Every push to `main` triggers an automatic deployment to [myequilibrium.app](https://myequilibrium.app).

---

## 🔒 Privacy

- All data is stored in the browser's `localStorage` by default
- Optional cloud sync via Firebase (account required)
- No analytics, no third-party tracking
- AI Camera sends meal photos to the Cloudflare Worker which forwards them to Anthropic's API — no images are stored

---

## ⚠️ Medical Disclaimer

Equilibrium is a personal tracking tool, not a medical device. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider about your symptoms and treatment plan.

---

## 💙 For You...
Dedicated with all my love to my wife Ana Isabel. You deserve to live every day free of pain, free of fear, and full of joy. This was built for you. 💙
