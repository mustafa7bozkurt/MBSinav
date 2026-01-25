


const APP_VERSION = "8.3.0"; // Notes & Date Update

// KILL ALL SERVICE WORKERS IMMEDIATELY
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
            console.log("Unregistering SW:", registration);
            registration.unregister();
        }
    });
    caches.keys().then(names => {
        for (let name of names) caches.delete(name);
    });
}

// Force clear old tab state on load to ensure Home Page
localStorage.removeItem('mbsinav_current_tab');

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
        } else if (tabName === 'exam') {
            loadExams();
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

    // Create a timeline container
    const timelineContainer = document.createElement('div');
    timelineContainer.className = 'timeline-container';

    // Get items for this day
    const dayItems = fullSchedule.filter(i => parseInt(i.day) === dayIdx);

    // Loop from 05:00 to 24:00 (End of day)
    for (let h = 5; h <= 23; h++) {
        const hourStr = h.toString().padStart(2, '0') + ":00";

        // Find item for this hour (Simple match)
        // Note: Real apps might need range checks, but here we stick to simple "Start Time" match
        const item = dayItems.find(i => i.time.startsWith(h.toString().padStart(2, '0'))); // Matches 07:xx

        const row = document.createElement('div');
        row.className = 'timeline-row';

        let contentHtml = '';
        if (item) {
            contentHtml = `
                <div class="list-item-card" style="border-left-color: #3b82f6; margin-bottom:0;">
                    <div class="item-info">
                        <h3>${item.subject}</h3>
                        <span class="item-sub">${item.time} ${item.note ? '- ' + item.note : ''}</span>
                    </div>
                    <button onclick="deleteScheduleItem('${item.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </div>
            `;
        } else {
            contentHtml = `
                <div class="empty-slot" onclick="openScheduleModal('${hourStr}')">
                    <i class="fas fa-plus"></i> Ekle
                </div>
            `;
        }

        row.innerHTML = `
            <div class="time-col">${hourStr}</div>
            <div class="content-col">
                ${contentHtml}
            </div>
        `;
        timelineContainer.appendChild(row);
    }

    container.appendChild(timelineContainer);
}

// Modal Logic
function openScheduleModal(prefillTime = '') {
    document.getElementById('schedule-modal').classList.remove('hidden');
    // Pre-select current view day
    document.getElementById('sch-day').value = currentScheduleDay;
    if (prefillTime) {
        document.getElementById('sch-time').value = prefillTime;
    } else {
        document.getElementById('sch-time').value = '';
    }
}
function closeScheduleModal() { document.getElementById('schedule-modal').classList.add('hidden'); }


// Initialize Modal Logic (Checkboxes)
function initModalLogic() {
    document.querySelectorAll('.day-check').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.classList.toggle('active');
        });
    });
}

function saveScheduleItem() {
    if (!db) return;
    const mainDay = parseInt(document.getElementById('sch-day').value);
    const time = document.getElementById('sch-time').value;
    const subject = document.getElementById('sch-subject').value;
    const note = document.getElementById('sch-note').value;

    if (!time || !subject) { alert("Saat ve Ders zorunludur"); return; }

    const daysToAdd = [mainDay];

    // Check extra days
    document.querySelectorAll('.day-check.active').forEach(el => {
        const d = parseInt(el.dataset.d);
        if (!daysToAdd.includes(d)) daysToAdd.push(d);
    });

    // Batch Add
    const batchPromises = daysToAdd.map(d => {
        return db.collection(SCHEDULE_COLLECTION).add({
            day: d,
            time,
            subject,
            note,
            timestamp: Date.now()
        });
    });

    Promise.all(batchPromises)
        .then(() => {
            closeScheduleModal();
            // Reset checks
            document.querySelectorAll('.day-check').forEach(el => el.classList.remove('active'));
        })
        .catch(e => alert("Hata: " + e.message));
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
// --- GOALS & INTERACTIVITY ---
const GOAL_COLLECTION = "mbsinav_goals";

function handleQuickMenu(action) {
    // Toggles active button
    document.querySelectorAll('.shape-selector .shape-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Menu Logic
    if (action === 'durum') {
        document.getElementById('home-view-durum').classList.remove('hidden');
        document.getElementById('home-view-hedefler').classList.add('hidden');
    }
    else if (action === 'hedefler') {
        document.getElementById('home-view-durum').classList.add('hidden');
        document.getElementById('home-view-hedefler').classList.remove('hidden');
        loadGoals();
    }
    else if (action === 'netler') {
        switchTab('exam');
    }
    else if (action === 'notlar') {
        alert("Yakında...");
    }
}

function addGoal() {
    const input = document.getElementById('goal-input');
    const text = input.value.trim();
    if (!text) return;

    if (db) {
        db.collection(GOAL_COLLECTION).add({
            text: text,
            completed: false,
            timestamp: Date.now()
        }).then(() => {
            input.value = ''; // Clear
            // Listener will update UI
        });
    }
}

function loadGoals() {
    if (!db) return;
    // Real-time listener for goals
    db.collection(GOAL_COLLECTION).orderBy('timestamp', 'desc').onSnapshot(snap => {
        const container = document.getElementById('goal-list');
        if (!container) return;

        if (snap.empty) {
            container.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">Henüz hedef eklemedin. Hadi başla! 🚀</div>`;
            return;
        }

        let html = '';
        snap.forEach(doc => {
            const data = doc.data();
            const isDone = data.completed;
            html += `
                <div class="list-item-card" style="border-left-color: ${isDone ? '#10b981' : '#f97316'}; opacity: ${isDone ? '0.6' : '1'};">
                    <div class="item-info">
                        <h3 style="text-decoration: ${isDone ? 'line-through' : 'none'}">${data.text}</h3>
                        <span class="item-sub">${new Date(data.timestamp).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="toggleGoal('${doc.id}', ${!isDone})" style="background:none; border:none; cursor:pointer; color:${isDone ? '#10b981' : '#cbd5e1'}; font-size:1.2rem;">
                            <i class="fas fa-check-circle"></i>
                        </button>
                        <button onclick="deleteGoal('${doc.id}')" style="background:none; border:none; cursor:pointer; color:#ef4444; font-size:1rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    });
}

function toggleGoal(id, newState) {
    db.collection(GOAL_COLLECTION).doc(id).update({ completed: newState });
}

function deleteGoal(id) {
    if (confirm("Hedefi silmek istiyor musun?")) {
        db.collection(GOAL_COLLECTION).doc(id).delete();
    }
}

function filterSubjects(cat) {
    // Simple mock filter for subjects tab
}

// --- CHART & EXAMS ---
function switchExamSubTab(subTab) {
    // Buttons
    document.querySelectorAll('.sub-nav-btn').forEach(btn => {
        if (btn.innerText.toLowerCase().includes(subTab === 'netlerim' ? 'netlerim' : 'hesapla')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Views
    if (subTab === 'netlerim') {
        document.getElementById('sub-view-netlerim').classList.remove('hidden');
        document.getElementById('sub-view-hesapla').classList.add('hidden');
        loadExams(); // Refresh chart
    } else {
        document.getElementById('sub-view-netlerim').classList.add('hidden');
        document.getElementById('sub-view-hesapla').classList.remove('hidden');
    }
}

function loadExams() {
    if (!db) return;
    db.collection(EXAM_COLLECTION).orderBy('timestamp', 'desc').limit(10).get().then(snap => {
        const data = [];
        snap.forEach(doc => {
            const d = doc.data();
            data.push({
                net: d.net,
                date: new Date(d.timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                timestamp: d.timestamp
            });
        });
        // Sort for chart: Oldest first
        data.sort((a, b) => a.timestamp - b.timestamp);

        renderNetChart(data);
        renderHistoryList(data);
    });
}

function renderNetChart(data) {
    const svg = document.getElementById('net-chart');
    const labelsDiv = document.getElementById('chart-labels');
    if (!svg || data.length < 2) {
        if (svg) svg.innerHTML = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-size="12">Grafik için en az 2 veri lazım</text>`;
        return;
    }

    // Config
    const width = 350;
    const height = 200;
    const padding = 20;

    // Scales
    const nets = data.map(d => d.net);
    const minNet = Math.min(...nets) - 5;
    const maxNet = Math.max(...nets) + 5;

    const getY = (net) => height - padding - ((net - minNet) / (maxNet - minNet)) * (height - 2 * padding);
    const getX = (i) => padding + (i / (data.length - 1)) * (width - 2 * padding);

    // Build Path
    let pathD = `M ${getX(0)} ${getY(data[0].net)}`;
    let areaD = `M ${getX(0)} ${height} L ${getX(0)} ${getY(data[0].net)}`;

    data.forEach((d, i) => {
        pathD += ` L ${getX(i)} ${getY(d.net)}`;
        areaD += ` L ${getX(i)} ${getY(d.net)}`;
    });

    areaD += ` L ${getX(data.length - 1)} ${height} Z`;

    // Draw SVG
    let html = `
        <!-- Area -->
        <path d="${areaD}" class="chart-area" />
        <!-- Line -->
        <path d="${pathD}" class="chart-line" />
    `;

    // Dots & Labels
    let labelsHtml = '';
    data.forEach((d, i) => {
        html += `<circle cx="${getX(i)}" cy="${getY(d.net)}" class="chart-dot"><title>${d.net} Net - ${d.date}</title></circle>`;
        html += `<text x="${getX(i)}" y="${getY(d.net) - 10}" class="chart-label">${d.net}</text>`;

        // Axis Labels (First and Last only to prevent crowd)
        if (i === 0 || i === data.length - 1) {
            labelsHtml += `<span>${d.date}</span>`;
        }
    });

    svg.innerHTML = html;
    labelsDiv.innerHTML = labelsHtml;
}

function renderHistoryList(data) {
    // Reverse for list: Newest first
    const listData = [...data].reverse();
    const container = document.getElementById('net-history-list');
    if (!container) return;

    let html = '';
    listData.forEach(item => {
        html += `
             <div class="list-item-card" style="border-left-color: #f97316; height:auto; padding:10px;">
                <div class="item-info">
                    <h3>${item.net} Net</h3>
                    <span class="item-sub">${item.date}</span>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function saveQuickNet() {
    const val = parseFloat(document.getElementById('quick-net-input').value);
    if (!val) return;

    db.collection(EXAM_COLLECTION).add({
        net: val,
        type: 'quick',
        timestamp: Date.now()
    }).then(() => {
        document.getElementById('quick-net-input').value = '';
        loadExams();
        alert("Net kaydedildi!");
    });
}

function calculateNet() {
    const inps = document.querySelectorAll('#sub-view-hesapla input');
    let totalNet = 0;
    // Specific IDs mapping
    const trD = parseFloat(document.getElementById('calc-tr-d').value) || 0;
    const trY = parseFloat(document.getElementById('calc-tr-y').value) || 0;
    const matD = parseFloat(document.getElementById('calc-mat-d').value) || 0;
    const matY = parseFloat(document.getElementById('calc-mat-y').value) || 0;
    const fenD = parseFloat(document.getElementById('calc-fen-d').value) || 0;
    const sosD = parseFloat(document.getElementById('calc-sos-d').value) || 0;

    // Simple logic: we need 'calc-tr-d' etc. 
    // Just sum loops if we used class-based, but here we have specific IDs now.
    // Let's rely on manual calculation for accuracy or keep it simple.

    // Actually the user kept the old structure logic but IDs changed.
    // Let's implement robustly.
    totalNet += trD - (trY / 4);
    totalNet += matD - (matY / 4);
    totalNet += fenD - 0; // Assuming 0 wrong if not present, but user didn't ask for full inputs there
    // Wait, the HTML has specific inputs for Fen/Sos but only D?
    // Let's re-read HTML.
    // Ah, Fen(D), Sos(D) are there. No wrong inputs for them in previous step?
    // Checking previous step... Yes, only D for Fen/Sos in the HTML snapshot.
    totalNet += sosD;

    const resDisplay = document.querySelector('.result-value');
    if (resDisplay) resDisplay.innerText = totalNet.toFixed(2);

    if (db) {
        db.collection(EXAM_COLLECTION).add({
            net: totalNet,
            detail: { trD, trY, matD, matY, fenD, sosD },
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
        // CACHE BUSTING: Add version query param to force browser to see it as a new file
        navigator.serviceWorker.register('./sw.js?v=' + APP_VERSION).catch(console.log);
    }

    if (typeof firebase !== 'undefined') {
        loadSchedule(); // This also triggers dashboard update
    }

    renderDaySelector();
    initModalLogic();
});
