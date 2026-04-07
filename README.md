# 🌊 Equilibrium — Ménière's Disease Companion

A compassionate, mobile first Progressive Web App (PWA) for people living with Ménière's disease. Equilibrium helps you track symptoms, medications, diet, stress, and sleep and over time, identifies your personal attack triggers.

> **All data is stored locally on your device. No account, no server, no data ever leaves your phone.**

---

## 📱 Install on iPhone

1. Open the app URL in **Safari**
2. Tap the **Share** button (the box with an arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add**

The app installs like a native app — full screen, no browser chrome, works offline.

---

## ✨ Features

### 🏠 Home Dashboard
- Today's at-a-glance summary: sodium consumed, glasses of water, attacks this week, and stress level
- Encouraging message that adapts to your current situation
- Sodium budget progress bar
- Tap-to-fill hydration tracker
- Quick action buttons to log attacks, check medications, check in on wellness, or access your emergency card

### ⚡ Symptom Log
- **One-tap attack timer** — tap the big button when a vertigo episode starts, tap again when it ends
- Log past attacks with date, time, duration, intensity (1–10), and symptoms (vertigo, tinnitus, hearing loss, ear pressure, nausea, vomiting, drop attack)
- Add post-attack notes
- 30-day attack frequency bar chart

### 🥗 Diet Tracker
- **Sodium tracker** with a visual daily budget meter (default goal: 1,500mg)
- Search and log from a database of 60+ common foods with their sodium content
- High-sodium foods are flagged with warnings (⚠️)
- Add custom foods not in the database
- **Hydration tracker** — tap glasses to log water intake
- **Caffeine & alcohol log** with steppers and threshold warnings

### 🌿 Wellness Check-In
- Daily stress level slider (1–10)
- Mood picker with emoji (Great, Calm, Anxious, Fatigued, Frustrated)
- Optional free-form journal entry
- Sleep log with bedtime, wake time, and quality rating (1–5 stars)
- 14-day stress trend line chart

### 💊 Medications
- Add medications with name, dosage, type (diuretic, antihistamine, antiemetic, etc.), and scheduled times
- Daily dose schedule with one-tap check-off (taken ✓ or missed ✕)
- Access from the **More** tab

### 🔍 Trigger Insights
- Automatically correlates your logged attacks with the day before: sodium intake, stress level, sleep quality, caffeine, and alcohol
- Shows a **"Your Top Triggers"** summary once 3+ attacks are logged
- Displays percentage correlation for each potential trigger
- Access from the **More** tab

### 📋 Doctor Report
- Auto-generates a 30-day summary including:
  - Attack count, average intensity, average duration
  - Average daily sodium intake
  - Medication adherence percentage
  - Average sleep hours
  - Average stress level
- One-tap **Copy to Clipboard** to paste into a message or email for your doctor
- Access from the **More** tab

### 🚨 Emergency Card
- Store your name, diagnosis, current medications, doctor's name & phone, and emergency contact
- Once saved, displays as a bold red card at the top of the panel
- Accessible in one tap from the Home screen quick actions
- Access from the **More** tab

---

## ⚙️ Settings

Found in the **More** tab:
- **Daily sodium goal** — adjust from the default 1,500mg (some doctors recommend up to 2,000mg)
- **Dark mode** — full dark theme with deep teal surfaces

---

## 🗂️ File Structure

```
Equilibrium/
├── index.html        # App shell and all panel markup
├── app.js            # All app logic (~1,800 lines)
├── app.css           # All styles, light + dark mode (~600 lines)
├── manifest.json     # PWA configuration
├── sw.js             # Service worker for offline support
├── icon.svg          # App icon (wave logo)
└── icon-maskable.svg # Maskable icon variant for Android
```

---

## 🛠️ Running Locally

No build step required. Just serve the files over HTTP:

```bash
# Python (built into macOS)
cd Equilibrium
python3 -m http.server 3000
# Then open http://localhost:3000
```

---

## 🔒 Privacy

- **Zero data collection.** Everything you log stays in your browser's `localStorage`.
- No analytics, no tracking, no external API calls (except loading Chart.js from a CDN on first use).
- To back up your data, use your browser's export tools or manually copy `localStorage`.
- Clearing your browser/app data will erase all logs.

---

## ⚠️ Medical Disclaimer

Equilibrium is a personal tracking tool, not a medical device. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider about your symptoms and treatment plan.

---

## 🤓 About

Built with care for people managing a chronic, unpredictable condition. Ménière's disease affects balance, hearing, and quality of life  this app aims to give you a little more control and insight on the hard days.

---

## 💙 For You...
Dedicated with all my love to my wife Ana Isabel. You deserve to live every day free of pain, free of fear, and full of joy. This was built for you. 💙
