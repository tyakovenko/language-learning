/* ================================================
   LINGUAPATH — MAIN APPLICATION LOGIC
   ================================================ */

// ---- State ----
let currentLang = 'spanish';
let currentDay = null;
let course = null;

// ---- DOM References ----
const viewDashboard = document.getElementById('view-dashboard');
const viewLesson = document.getElementById('view-lesson');
const dayCardsGrid = document.getElementById('day-cards-grid');
const langSelect = document.getElementById('lang-select');
const backBtn = document.getElementById('back-btn');
const navHomeBtn = document.getElementById('nav-home-btn');
const progressFill = document.getElementById('progress-bar-fill');
const progressLabel = document.getElementById('progress-label');
const streakCount = document.getElementById('streak-count');
const heroFlag = document.getElementById('hero-flag');
const heroTitle = document.getElementById('hero-title');
const heroSubtitle = document.getElementById('hero-subtitle');
const lessonDayBadge = document.getElementById('lesson-day-badge');
const lessonTitle = document.getElementById('lesson-title');
const lessonFunfact = document.getElementById('lesson-funfact');
const grammarCards = document.getElementById('grammar-cards');
const practiceProblems = document.getElementById('practice-problems');
const resourceLinks = document.getElementById('resource-links');
const completeBtn = document.getElementById('complete-btn');

// ---- Progress Storage ----
function getProgress(lang) {
    try {
        return JSON.parse(localStorage.getItem('progress_' + lang)) || {};
    } catch { return {}; }
}

function saveProgress(lang, progress) {
    localStorage.setItem('progress_' + lang, JSON.stringify(progress));
}

function isDayComplete(lang, day) {
    return !!getProgress(lang)[day];
}

function markDayComplete(lang, day) {
    const p = getProgress(lang);
    if (!p[day]) {
        p[day] = { completedAt: new Date().toISOString() };
        saveProgress(lang, p);
    }
}

function countCompleted(lang) {
    return Object.keys(getProgress(lang)).length;
}

// ---- Streak Calculation ----
function calcStreak(lang) {
    const p = getProgress(lang);
    const dates = Object.values(p)
        .map(v => new Date(v.completedAt).toDateString())
        .filter((d, i, a) => a.indexOf(d) === i)
        .sort((a, b) => new Date(b) - new Date(a));

    if (!dates.length) return 0;
    let streak = 0;
    let check = new Date();
    check.setHours(0, 0, 0, 0);

    for (const d of dates) {
        const day = new Date(d);
        if (day.toDateString() === check.toDateString()) {
            streak++;
            check.setDate(check.getDate() - 1);
        } else { break; }
    }
    return streak;
}

// ---- URL Param Routing ----
function getLangFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang') || null;
}

function setLangInURL(lang) {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url.toString());
}

// ---- Load Language Course ----
async function loadCourse(lang) {
    return new Promise((resolve, reject) => {
        // Remove any previously loaded content script
        const old = document.getElementById('content-script');
        if (old) old.remove();
        if (window.COURSE) delete window.COURSE;

        const script = document.createElement('script');
        script.id = 'content-script';
        script.src = `content/${lang}.js`;
        script.onload = () => {
            if (window.COURSE) resolve(window.COURSE);
            else reject(new Error('COURSE not defined in content/' + lang + '.js'));
        };
        script.onerror = () => reject(new Error('Could not load content/' + lang + '.js'));
        document.head.appendChild(script);
    });
}

// ---- Render Dashboard ----
function renderDashboard() {
    showView('dashboard');
    document.title = `LinguaPath — 30-Day ${course.language} Plan`;

    heroFlag.textContent = course.flag || '🌍';
    heroTitle.textContent = `Your 30-Day ${course.language} Journey`;
    heroSubtitle.textContent = 'Click any day to begin. All days are open from Day 1.';

    const completed = countCompleted(currentLang);
    const total = course.days.length;
    progressFill.style.width = `${Math.round((completed / total) * 100)}%`;
    progressLabel.textContent = `${completed} / ${total} days complete`;
    streakCount.textContent = calcStreak(currentLang);

    dayCardsGrid.innerHTML = '';

    course.days.forEach(day => {
        const done = isDayComplete(currentLang, day.day);
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
        col.innerHTML = `
      <div class="day-card ${done ? 'completed' : ''}" data-day="${day.day}" role="button" tabindex="0"
           aria-label="Day ${day.day}: ${day.title}">
        <div class="day-number">Day ${day.day}</div>
        <div class="day-card-title">${escHtml(day.title)}</div>
        <p class="day-card-fact">${escHtml(day.funFact || '')}</p>
      </div>`;
        col.querySelector('.day-card').addEventListener('click', () => openLesson(day.day));
        col.querySelector('.day-card').addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') openLesson(day.day);
        });
        dayCardsGrid.appendChild(col);
    });
}

// ---- Render Lesson ----
function openLesson(dayNum) {
    currentDay = dayNum;
    const day = course.days.find(d => d.day === dayNum);
    if (!day) return;

    showView('lesson');
    document.title = `Day ${dayNum}: ${day.title} — LinguaPath`;

    lessonDayBadge.textContent = `Day ${dayNum}`;
    lessonTitle.textContent = day.title;
    lessonFunfact.textContent = day.funFact || '';

    // Complete button state
    if (isDayComplete(currentLang, dayNum)) {
        completeBtn.textContent = '✓  Completed';
        completeBtn.classList.add('is-done');
    } else {
        completeBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Mark Complete';
        completeBtn.classList.remove('is-done');
    }

    renderGrammar(day.grammar || []);
    renderPractice(day.practice || []);
    renderResources(day.resources || {});
}

// ---- Grammar ----
function renderGrammar(concepts) {
    grammarCards.innerHTML = '';
    if (!concepts.length) {
        grammarCards.innerHTML = '<p class="no-resources">No grammar notes for this day.</p>';
        return;
    }
    concepts.forEach(c => {
        const div = document.createElement('div');
        div.className = 'grammar-card';
        div.innerHTML = `
      <div class="grammar-concept">${escHtml(c.concept)}</div>
      <p class="grammar-explanation">${escHtml(c.explanation)}</p>`;
        grammarCards.appendChild(div);
    });
}

// ---- Practice ----
function renderPractice(problems) {
    practiceProblems.innerHTML = '';
    if (!problems.length) {
        practiceProblems.innerHTML = '<p class="no-resources">No practice problems for this day.</p>';
        return;
    }
    problems.forEach((prob, idx) => {
        const div = document.createElement('div');
        div.className = 'practice-item';

        if (prob.type === 'multiple-choice') {
            div.innerHTML = `
        <p class="practice-prompt"><strong>Q${idx + 1}.</strong> ${escHtml(prob.prompt)}</p>
        <div class="practice-choices">
          ${prob.choices.map(ch =>
                `<button class="choice-btn" data-choice="${escHtml(ch)}">${escHtml(ch)}</button>`
            ).join('')}
        </div>
        <div class="practice-feedback" id="feedback-${idx}"></div>`;

            div.querySelectorAll('.choice-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const selected = btn.dataset.choice;
                    const correct = normalise(selected) === normalise(prob.answer);
                    const fb = div.querySelector(`#feedback-${idx}`);

                    div.querySelectorAll('.choice-btn').forEach(b => {
                        b.disabled = true;
                        if (normalise(b.dataset.choice) === normalise(prob.answer)) b.classList.add('correct');
                    });

                    if (correct) {
                        btn.classList.add('correct');
                        fb.textContent = '✓ Correct!';
                        fb.className = 'practice-feedback correct';
                    } else {
                        btn.classList.add('incorrect');
                        fb.textContent = `✗ The correct answer is: ${prob.answer}${prob.hint ? ' — ' + prob.hint : ''}`;
                        fb.className = 'practice-feedback incorrect';
                    }
                });
            });

        } else {
            // fill-in or translate
            div.innerHTML = `
        <p class="practice-prompt"><strong>Q${idx + 1}.</strong> ${escHtml(prob.prompt)}</p>
        <input class="practice-input" type="text" placeholder="Type your answer…"
               id="input-${idx}" autocomplete="off" autocorrect="off" spellcheck="false" />
        <br/>
        <button class="btn-check-answer" data-idx="${idx}">Check Answer</button>
        <div class="practice-feedback" id="feedback-${idx}"></div>`;

            const input = div.querySelector(`#input-${idx}`);
            const checkBtn = div.querySelector('.btn-check-answer');

            const doCheck = () => {
                const userVal = input.value;
                const correct = normalise(userVal) === normalise(prob.answer);
                const fb = div.querySelector(`#feedback-${idx}`);

                if (!userVal.trim()) return;

                if (correct) {
                    input.classList.add('correct');
                    input.classList.remove('incorrect');
                    fb.textContent = '✓ Correct!';
                    fb.className = 'practice-feedback correct';
                    input.disabled = true;
                    checkBtn.disabled = true;
                } else {
                    input.classList.add('incorrect');
                    input.classList.remove('correct');
                    fb.textContent = `✗ The correct answer is: ${prob.answer}${prob.hint ? ' — ' + prob.hint : ''}`;
                    fb.className = 'practice-feedback incorrect';
                }
            };

            checkBtn.addEventListener('click', doCheck);
            input.addEventListener('keydown', e => { if (e.key === 'Enter') doCheck(); });
        }

        practiceProblems.appendChild(div);
    });
}

// ---- Resources ----
function renderResources(resources) {
    resourceLinks.innerHTML = '';
    const cats = [
        { key: 'listening', label: 'Listening', icon: 'bi-headphones' },
        { key: 'reading', label: 'Reading', icon: 'bi-book' },
        { key: 'video', label: 'Video', icon: 'bi-play-circle' },
    ];

    let hasAny = false;
    cats.forEach(cat => {
        const links = resources[cat.key];
        if (!links || !links.length) return;
        hasAny = true;

        const col = document.createElement('div');
        col.className = 'col-12 col-md-4';
        col.innerHTML = `<div class="resource-group-title">${cat.label}</div>`;

        links.forEach(link => {
            const a = document.createElement('a');
            a.className = 'resource-link';
            a.href = link.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.innerHTML = `<i class="bi ${cat.icon}"></i>${escHtml(link.label)}`;
            col.appendChild(a);
        });

        resourceLinks.appendChild(col);
    });

    if (!hasAny) {
        resourceLinks.innerHTML = '<p class="no-resources col-12">No resources linked for this day yet.</p>';
    }
}

// ---- Mark Complete ----
completeBtn.addEventListener('click', () => {
    if (!currentDay) return;
    markDayComplete(currentLang, currentDay);
    completeBtn.innerHTML = '✓  Completed';
    completeBtn.classList.add('is-done');
    updateProgressBar();
});

function updateProgressBar() {
    const completed = countCompleted(currentLang);
    const total = course ? course.days.length : 30;
    progressFill.style.width = `${Math.round((completed / total) * 100)}%`;
    progressLabel.textContent = `${completed} / ${total} days complete`;
    streakCount.textContent = calcStreak(currentLang);
}

// ---- View Switcher ----
function showView(which) {
    if (which === 'dashboard') {
        viewDashboard.classList.remove('d-none');
        viewDashboard.classList.add('view-fade');
        viewLesson.classList.add('d-none');
        backBtn.classList.add('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        viewLesson.classList.remove('d-none');
        viewLesson.classList.add('view-fade');
        viewDashboard.classList.add('d-none');
        backBtn.classList.remove('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ---- Language Switcher ----
async function switchLanguage(lang) {
    currentLang = lang;
    setLangInURL(lang);
    try {
        course = await loadCourse(lang);
        renderDashboard();
    } catch (e) {
        console.error(e);
        showError(`Could not load content for "${lang}". Make sure content/${lang}.js exists.`);
    }
}

langSelect.addEventListener('change', e => switchLanguage(e.target.value));
backBtn.addEventListener('click', renderDashboard);
navHomeBtn.addEventListener('click', e => { e.preventDefault(); renderDashboard(); });

// ---- Helpers ----
function normalise(str) {
    return str.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // accent-insensitive
}

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

function showError(msg) {
    viewDashboard.classList.remove('d-none');
    viewLesson.classList.add('d-none');
    dayCardsGrid.innerHTML = `<div class="col-12 text-center py-5">
    <p style="color:var(--coral);font-size:1.1rem;">${msg}</p>
  </div>`;
}

// ---- Boot ----
(async () => {
    const urlLang = getLangFromURL();
    if (urlLang) {
        currentLang = urlLang;
        langSelect.value = urlLang;
    } else {
        currentLang = langSelect.value;
    }

    try {
        course = await loadCourse(currentLang);
        renderDashboard();
    } catch (e) {
        console.error(e);
        showError(`Could not load content for "${currentLang}". Make sure content/${currentLang}.js exists.`);
    }
})();
