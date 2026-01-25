
const APP_VERSION = "1.1.1"; // Bump this manually to force update UI

function forceUpdate() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
                registration.unregister();
            }
            window.location.reload(true);
        });
        // Also clear cache storage
        caches.keys().then(names => {
            for (let name of names) caches.delete(name);
        });
    } else {
        window.location.reload(true);
    }
}

// --- FIREBASE CONFIG (Copied from AluminyumHesap) ---
const firebaseConfig = {
    apiKey: "AIzaSyA-iba_G88bOloy08of9LtV3WbGLIYj7sw",
    authDomain: "aluminyumapp.firebaseapp.com",
    projectId: "aluminyumapp",
    storageBucket: "aluminyumapp.firebasestorage.app",
    messagingSenderId: "595544210446",
    appId: "1:595544210446:web:120a178403556b3e06905f",
    measurementId: "G-K44PGWGPG1"
};

// Initialize
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase initialized");
} catch (e) {
    console.log("Firebase init error (might be offline):", e);
}

const EXAM_COLLECTION = "mbsinav_exams";
const SCHEDULE_COLLECTION = "mbsinav_schedule";

// --- Navigation Logic ---
function switchTab(tabName) {
    // Hide all sections
    const sections = document.querySelectorAll('.mode-section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });

    // Deactivate all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(`tab-${tabName}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
        window.scrollTo(0, 0);

        if (tabName === 'program') {
            const d = new Date().getDay(); // 0 is Sunday
            // If Sunday, show prompt
            if (d === 0) checkSundayReminder();
            // Default to today
            selectScheduleDay(d);
        }
    }

    // Activate nav item
    navItems.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });

    localStorage.setItem('mbsinav_current_tab', tabName);
}

// --- Countdown Logic ---
let targetDate = localStorage.getItem('mbsinav_target_date') || '2026-06-15T10:00';

function updateCountdown() {
    const examDate = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const distance = examDate - now;

    const container = document.getElementById('countdown-display');
    if (!container) return;

    if (distance < 0) {
        container.innerHTML = `<div style="text-align:center; width:100%; color:#ef4444; font-weight:800;">SINAV TARİHİ GEÇTİ</div>`;
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    container.innerHTML = `
        <div class="time-box"><span class="time-val">${days}</span><span class="time-label">GÜN</span></div>
        <div class="time-box"><span class="time-val">${hours}</span><span class="time-label">SAAT</span></div>
        <div class="time-box"><span class="time-val">${minutes}</span><span class="time-label">DK</span></div>
    `;
}

// Exam Date Modal
function openDateModal() {
    document.getElementById('date-modal').classList.remove('hidden');
    document.getElementById('exam-date-input').value = targetDate;
}
function closeDateModal() { document.getElementById('date-modal').classList.add('hidden'); }
function saveExamDate() {
    const inp = document.getElementById('exam-date-input').value;
    if (!inp) { alert("Lütfen bir tarih seçin"); return; }
    targetDate = inp;
    localStorage.setItem('mbsinav_target_date', targetDate);
    updateCountdown();
    closeDateModal();
}

// --- SCHEDULE SYSTEM ---
let fullSchedule = [];
let currentScheduleDay = 1; // 0=Sun, 1=Mon

// Load Schedule
function loadSchedule() {
    if (!db) return;
    db.collection(SCHEDULE_COLLECTION).onSnapshot(snap => {
        fullSchedule = [];
        snap.forEach(doc => {
            fullSchedule.push({ id: doc.id, ...doc.data() });
        });
        renderSchedule(currentScheduleDay);
        updateDashboardSchedule();
    });
}

const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
// Render Day Selector
function renderDaySelector() {
    const container = document.getElementById('day-selector');
    if (!container) return;

    // Sort logic to make sure current day is first or nicely ordered? 
    // Standard Mon-Sun order might be better for Turkey
    // 1(Mon) ... 6(Sat) 0(Sun)
    const order = [1, 2, 3, 4, 5, 6, 0];

    let html = '';
    order.forEach(d => {
        // Short Names
        const short = dayNames[d].substring(0, 3);
        html += `
            <div class="shape-btn ${d === currentScheduleDay ? 'active' : ''}" onclick="selectScheduleDay(${d})">
                <span style="font-weight:700; font-size:1.1rem;">${short}</span>
                <span style="font-size:0.6rem;">Gün</span>
            </div>
        `;
    });
    container.innerHTML = html;
}

function selectScheduleDay(d) {
    currentScheduleDay = d;
    renderDaySelector();
    renderSchedule(d);
}

function renderSchedule(dayIdx) {
    const title = document.getElementById('schedule-day-title');
    if (title) title.innerText = dayNames[dayIdx];

    const container = document.getElementById('schedule-list');
    if (!container) return;
    container.innerHTML = '';

    const dayItems = fullSchedule.filter(i => parseInt(i.day) === dayIdx).sort((a, b) => a.time.localeCompare(b.time));

    if (dayItems.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">Bu gün için plan yok.</div>`;
        return;
    }

    dayItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item-card';
        // Random color border based on subject hash? or just static blue
        div.style.borderLeftColor = '#3b82f6';

        div.innerHTML = `
            <div class="item-info">
                <h3>${item.subject}</h3>
                <span class="item-sub">${item.time} ${item.note ? '- ' + item.note : ''}</span>
            </div>
            <button onclick="deleteScheduleItem('${item.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(div);
    });
}

// Modal Logic
function openScheduleModal() {
    document.getElementById('schedule-modal').classList.remove('hidden');
    // Pre-select current view day
    document.getElementById('sch-day').value = currentScheduleDay;
}
function closeScheduleModal() { document.getElementById('schedule-modal').classList.add('hidden'); }

function saveScheduleItem() {
    if (!db) return;
    const day = document.getElementById('sch-day').value;
    const time = document.getElementById('sch-time').value;
    const subject = document.getElementById('sch-subject').value;
    const note = document.getElementById('sch-note').value;

    if (!time || !subject) { alert("Saat ve Ders zorunludur"); return; }

    db.collection(SCHEDULE_COLLECTION).add({
        day: parseInt(day),
        time,
        subject,
        note,
        timestamp: Date.now()
    }).then(() => {
        closeScheduleModal();
    }).catch(e => alert("Hata: " + e.message));
}

function deleteScheduleItem(id) {
    if (confirm("Silmek istediğine emin misin?")) {
        db.collection(SCHEDULE_COLLECTION).doc(id).delete();
    }
}

// Sunday Logic
function checkSundayReminder() {
    const today = new Date().getDay();
    if (today === 0) {
        // Show banner
        const banner = document.getElementById('sunday-banner');
        if (banner) banner.style.display = 'block';
    }
}

function hideSundayBanner() {
    document.getElementById('sunday-banner').style.display = 'none';
}

function copyLastWeek() {
    // Logic: If user wants to copy, we theoretically take all items and duplicate them?
    // Actually, since our data model is "Day Index", items repeat every week automatically unless date-bound.
    // The user requirement "Geçen haftanın aynısının olmasını istiyorsa... eski program devam etsin" implies
    // the program MIGHT be date-specific or cleared weekly.
    // BUT, typical simple apps just have a "Weekly Template" (Mon-Sun) that repeats forever.
    // If I implemented it as a template (0-6), then "Copy Last Week" is redundant because it's ALREADY there.
    // However, if the user assumes "Weekly Clearing", then valid.
    // For now, since I implemented Day Index (0-6), it IS a repeating template.
    // So "Copy Last Week" effectively just means "Don't delete anything".
    // I will show a message explaining this.

    alert("Programınız zaten haftalık döngü şeklindedir. Değişiklik yapmadığınız sürece her hafta aynı program geçerlidir. 😎");
    hideSundayBanner();
}

// Update Dashboard "Today's Plan"
function updateDashboardSchedule() {
    // Check if we are on dashboard list container?
    // Actually we need to target the list in #tab-home
    // The previous static HTML had a class .list-container inside .form-section of #tab-home
    // Let's find a way to target it.
    // We can add an ID to that list in HTML update later, or use querySelector.
    // Selector: #tab-home .list-container
    const container = document.querySelector('#tab-home .list-container');
    if (!container) return;

    const d = new Date().getDay();
    const todayItems = fullSchedule.filter(i => parseInt(i.day) === d).sort((a, b) => a.time.localeCompare(b.time));

    if (todayItems.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:10px; color:#64748b;">Bugün boşsun! 🥳</div>`;
        return;
    }

    let html = '';
    // Show top 3
    todayItems.slice(0, 3).forEach(item => {
        html += `
             <div class="list-item-card" style="border-left-color: #3b82f6;">
                <div class="item-info">
                    <h3>${item.subject}</h3>
                    <span class="item-sub">${item.time} ${item.note ? '- ' + item.note : ''}</span>
                </div>
                <span class="item-badge badge-blue">Program</span>
            </div>
        `;
    });
    // Add "See All" link behavior?
    container.innerHTML = html;
}

// --- CALC & INTERACTIVITY ---
function handleQuickMenu(action) {
    document.querySelectorAll('.shape-selector .shape-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (action === 'netler') switchTab('exam');
    else if (action === 'durum') switchTab('home');
    else if (action === 'hedefler' || action === 'notlar') alert("Yakında...");
}

function filterSubjects(cat) {
    // Simple mock filter for subjects tab
    // ... (Keep existing if needed or rely on manual updates)
}

function calculateNet() {
    const inps = document.querySelectorAll('#tab-exam input');
    let totalNet = 0;
    for (let i = 0; i < inps.length; i += 2) {
        const correct = parseFloat(inps[i].value) || 0;
        const wrong = parseFloat(inps[i + 1].value) || 0;
        totalNet += correct - (wrong / 4);
    }
    const resDisplay = document.querySelector('#tab-exam .result-value');
    if (resDisplay) resDisplay.innerText = totalNet.toFixed(2);

    if (db) {
        db.collection(EXAM_COLLECTION).add({
            net: totalNet,
            date: new Date().toISOString(),
            timestamp: Date.now()
        }).then(() => alert("Net kaydedildi: " + totalNet.toFixed(2)));
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('app-version-display').innerText = APP_VERSION;
    setInterval(updateCountdown, 1000);
    updateCountdown();

    switchTab('home');

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(console.log);
    }

    if (typeof firebase !== 'undefined') {
        loadSchedule(); // This also triggers dashboard update
    }

    renderDaySelector();
});
