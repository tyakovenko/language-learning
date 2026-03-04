# LinguaPath — 30-Day Language Learning App

A beautiful, mobile-friendly web app for structured 30-day language learning. Built with Bootstrap 5, vanilla JS, and hosted free on GitHub Pages.

## 🚀 Live Site

> Add your GitHub Pages URL here after deploying:
> `https://YOUR_USERNAME.github.io/language-learning`

Share the link with `?lang=spanish`, `?lang=german`, or `?lang=french` to load a specific course:
- Spanish: `https://YOUR_USERNAME.github.io/language-learning?lang=spanish`
- German:  `https://YOUR_USERNAME.github.io/language-learning?lang=german`
- French:  `https://YOUR_USERNAME.github.io/language-learning?lang=french`

---

## 📁 Project Structure

```
language-learning/
├── index.html          # App shell (Bootstrap 5 via CDN)
├── style.css           # Custom styles
├── app.js              # Application logic
└── content/
    ├── spanish.js      # 30-day Spanish content ← fill this in
    ├── german.js       # 30-day German content  ← fill this in
    └── french.js       # 30-day French content  ← fill this in
```

---

## ✏️ Adding Your Content

Open any file in `content/` and fill in the fields for each day:

```js
{
  day: 1,
  title: 'Greetings',
  funFact: 'A fun fact shown on the card front.',
  grammar: [
    { concept: 'Formal vs Informal You', explanation: 'Plain-English explanation...' }
  ],
  practice: [
    { type: 'fill-in',        prompt: 'Hello = ___',              answer: 'Hola', hint: 'Most common greeting' },
    { type: 'translate',      prompt: 'Translate: Good morning',  answer: 'Buenos días', hint: '' },
    { type: 'multiple-choice', prompt: 'Which means goodbye?',    choices: ['Hola','Adiós','Gracias'], answer: 'Adiós', hint: '' },
  ],
  resources: {
    listening: [{ label: 'Podcast Ep 1', url: 'https://...' }],
    reading:   [{ label: 'Grammar article', url: 'https://...' }],
    video:     [{ label: 'YouTube video', url: 'https://...' }],
  }
}
```

**Practice types:**
- `fill-in` — user types in a blank
- `translate` — user translates a full sentence
- `multiple-choice` — user picks from options

Answers are checked **case-insensitively** and **accent-flexibly** (e.g. `si` matches `sí`).

---

## ➕ Adding a New Language

1. Create `content/yourlanguage.js` (copy any existing file as a template)
2. Set `language`, `flag` (emoji), and fill in your 30 days
3. Add an `<option>` to the `#lang-select` dropdown in `index.html`
4. Done — no other code changes needed

---

## 🌐 Deploying to GitHub Pages

```bash
# First time — connect to your GitHub repo:
git remote add origin https://github.com/YOUR_USERNAME/language-learning.git
git push -u origin main

# Every time you add content:
git add .
git commit -m "Add Spanish Day 1 content"
git push
```

Then go to your repo → **Settings → Pages → Branch: main → Save**.
Your site will be live in ~60 seconds.

---

## 💻 Running Locally

```bash
cd language-learning
python3 -m http.server 8080
# Open http://localhost:8080 in your browser
```

> ⚠️ You must use a local server (not open `index.html` directly) because the app loads content files dynamically.
