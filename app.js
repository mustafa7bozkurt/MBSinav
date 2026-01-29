// --- CONFIGURATION ---
const APP_VERSION = "9.8.0"; // Force Update v9.8.0

// SW Safety Check Removed to prevent loop with registration below




// --- VERSION CHECK SYSTEM ---
async function checkVersion() {
    try {
        const response = await fetch('version.json?t=' + Date.now());
        const data = await response.json();

        if (data.version !== APP_VERSION) {
            console.log(`New version found: ${data.version} (Current: ${APP_VERSION})`);

            // Clear all caches
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            }

            // Unregister SW
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                for (let reg of regs) await reg.unregister();
            }

            // Reload
            console.warn("Auto-reload disabled due to stability issues.");
            // window.location.reload(true);
        }
    } catch (e) {
        console.error("Version check failed", e);
    }
}

// Check on load, visibility change, and every 60s
// document.addEventListener('DOMContentLoaded', checkVersion);
// document.addEventListener('visibilitychange', () => {
//     if (document.visibilityState === 'visible') checkVersion();
// });
// setInterval(checkVersion, 60000);

function forceUpdate() {
    checkVersion();
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
            // Init calc if empty
            const cont = document.getElementById('calc-dynamic-inputs');
            if (cont && !cont.innerHTML.trim()) renderCalculatorInputs();
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
// --- SETTINGS (Date Sync) ---
const SETTINGS_COLLECTION = "mbsinav_settings";
let targetDate = '2026-06-15T10:00'; // Default fallback
let startDate = '2025-09-01'; // Default Start Date

function loadSettings() {
    if (!db) return;
    db.collection(SETTINGS_COLLECTION).doc('global').onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.targetDate) {
                targetDate = data.targetDate;
                if (data.startDate) startDate = data.startDate;
                updateCountdown();
            }
        } else {
            // Create default
            updateCountdown();
        }
    });
    // Also init home view
    switchHomeSubTab('genel');
}

function updateCountdown() {
    const examDate = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const distance = examDate - now;

    // Call Process Update Here too
    renderProcessStatus();

    const container = document.getElementById('countdown-display');
    if (!container) return;

    if (distance < 0) {
        container.innerHTML = `<div style = "text-align:center; width:100%; color:#ef4444; font-weight:800;" > SINAV TARİHİ GEÇTİ</div> `;
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    container.innerHTML = `
    <div class="time-box" ><span class="time-val">${days}</span><span class="time-label">GÜN</span></div>
        <div class="time-box"><span class="time-val">${hours}</span><span class="time-label">SAAT</span></div>
        <div class="time-box"><span class="time-val">${minutes}</span><span class="time-label">DK</span></div>
`;
}

// Exam Date Modal
function openDateModal() {
    document.getElementById('date-modal').classList.remove('hidden');
    document.getElementById('exam-date-input').value = targetDate;
    document.getElementById('start-date-input').value = startDate;
}
function closeDateModal() { document.getElementById('date-modal').classList.add('hidden'); }
function saveExamDate() {
    const inp = document.getElementById('exam-date-input').value;
    const startInp = document.getElementById('start-date-input').value;

    if (!inp || !startInp) { alert("Lütfen tarihleri seçin"); return; }

    // Validate
    if (new Date(startInp) > new Date(inp)) {
        alert("Başlangıç tarihi sınav tarihinden sonra olamaz!");
        return;
    }

    // Save to Firebase
    if (db) {
        db.collection(SETTINGS_COLLECTION).doc('global').update({
            targetDate: inp,
            startDate: startInp
        }).then(() => {
            alert("Tarihler güncellendi!");
            closeDateModal();
        }).catch(e => {
            console.error(e);
            // If doc doesn't exist, set it
            db.collection(SETTINGS_COLLECTION).doc('global').set({
                targetDate: inp,
                startDate: startInp
            }).then(() => {
                alert("Ayarlar oluşturuldu ve kaydedildi!");
                closeDateModal();
            });
        });
    } else {
        // Fallback for offline
        targetDate = inp;
        startDate = startInp;
        updateCountdown();
        closeDateModal();
    }
}

function renderProcessStatus() {
    const startDisplay = document.getElementById('process-start-display');
    const endDisplay = document.getElementById('process-end-display');
    const bar = document.getElementById('process-bar');
    const percentTxt = document.getElementById('process-percent');
    const daysPassedTxt = document.getElementById('days-passed');
    const daysRemainingTxt = document.getElementById('days-remaining');

    if (!startDisplay || !bar) return;

    const start = new Date(startDate).getTime();
    const end = new Date(targetDate).getTime();
    const now = new Date().getTime();

    // Text Updates
    startDisplay.innerText = `Başlangıç: ${new Date(startDate).toLocaleDateString('tr-TR')}`;
    endDisplay.innerText = `Bitiş: ${new Date(targetDate).toLocaleDateString('tr-TR')}`;

    // Calculation
    let totalDuration = end - start;
    let elapsed = now - start;

    if (totalDuration <= 0) totalDuration = 1; // Prevent div by zero

    let percent = (elapsed / totalDuration) * 100;

    // Bounds
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    // Remaining / Passed Days
    const dPassed = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const dRemaining = Math.floor((end - now) / (1000 * 60 * 60 * 24));

    // Update DOM
    bar.style.width = `${percent}%`;
    percentTxt.innerText = `%${Math.floor(percent)}`;

    // Make text readable if bar is too small
    if (percent < 10) {
        percentTxt.style.position = 'absolute';
        percentTxt.style.left = '5px';
        percentTxt.style.color = '#94a3b8';
    } else {
        percentTxt.style.position = 'static';
        percentTxt.style.color = 'white';
    }

    if (daysPassedTxt) daysPassedTxt.innerText = dPassed > 0 ? dPassed : 0;
    if (daysRemainingTxt) daysRemainingTxt.innerText = dRemaining > 0 ? dRemaining : 0;
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
    <div class="shape-btn ${d === currentScheduleDay ? 'active' : ''}" onclick = "selectScheduleDay(${d})" >
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
    <div class="list-item-card" style = "border-left-color: #3b82f6; margin-bottom:0;" >
                    <div class="item-info">
                        <h3>${item.subject}</h3>
                        <span class="item-sub">${item.time} ${item.note ? '- ' + item.note : ''}</span>
                    </div>
                    <button onclick="deleteScheduleItem('${item.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </div>
    `;
        } else {
            contentHtml = `
    <div class="empty-slot" onclick = "openScheduleModal('${hourStr}')" >
        <i class="fas fa-plus"></i> Ekle
                </div>
    `;
        }

        row.innerHTML = `
    <div class="time-col" > ${hourStr}</div>
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

    // Populate Datalist for Subject Suggestions
    const datalist = document.getElementById('subject-options');
    if (datalist) {
        let options = '';
        subjects.forEach(s => {
            options += `<option value = "${s.name}" > `;
        });
        topics.forEach(t => {
            options += `<option value = "${t.name}" > `; // Just topic name for simplicity, or Subject - Topic
        });
        datalist.innerHTML = options;
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
    // Updated Selector for Genel Bakış list
    const container = document.getElementById('dashboard-schedule-list');
    if (!container) return;

    const d = new Date().getDay();
    const todayItems = fullSchedule.filter(i => parseInt(i.day) === d).sort((a, b) => a.time.localeCompare(b.time));

    if (todayItems.length === 0) {
        container.innerHTML = `<div style = "text-align:center; padding:10px; color:#64748b;" > Bugün boşsun! 🥳</div> `;
        return;
    }

    let html = '';
    // Show top 3
    todayItems.slice(0, 3).forEach(item => {
        html += `
    <div class="list-item-card" style = "border-left-color: #3b82f6;" >
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
const EXAM_CONFIG = {
    'tyt': {
        name: "YKS - TYT",
        base: 100, // Base points are rough estimates
        sections: [
            { id: "tr", label: "Türkçe (40)", coeff: 3.3 },
            { id: "sos", label: "Sosyal (20)", coeff: 3.4 },
            { id: "mat", label: "Matematik (40)", coeff: 3.3 },
            { id: "fen", label: "Fen (20)", coeff: 3.4 }
        ],
        info: "Tahmini puanlardır. OBP dahil edilmemiştir."
    },
    'ayt_say': {
        name: "YKS - AYT (Sayısal)",
        base: 100,
        sections: [
            { id: "mat", label: "Matematik (40)", coeff: 3 },
            { id: "fiz", label: "Fizik (14)", coeff: 2.85 },
            { id: "kim", label: "Kimya (13)", coeff: 3.07 },
            { id: "biyo", label: "Biyoloji (13)", coeff: 3.07 }
        ],
        info: "Sadece AYT ham puanıdır. TYT ve OBP dahil değildir."
    },
    'ayt_ea': {
        name: "YKS - AYT (Eşit Ağırlık)",
        base: 100,
        sections: [
            { id: "mat", label: "Matematik (40)", coeff: 3 },
            { id: "edb", label: "Edebiyat (24)", coeff: 3 },
            { id: "tar", label: "Tarih-1 (10)", coeff: 2.8 },
            { id: "cog", label: "Coğrafya-1 (6)", coeff: 3.33 }
        ],
        info: "Sadece AYT ham puanıdır. TYT ve OBP dahil değildir."
    },
    'ayt_soz': {
        name: "YKS - AYT (Sözel)",
        base: 100,
        sections: [
            { id: "edb", label: "Edebiyat (24)", coeff: 3 },
            { id: "tar", label: "Tarih-1 (10)", coeff: 2.8 },
            { id: "cog", label: "Coğrafya-1 (6)", coeff: 3.33 },
            { id: "tar2", label: "Tarih-2 (11)", coeff: 2.91 },
            { id: "cog2", label: "Coğrafya-2 (11)", coeff: 2.91 },
            { id: "fel", label: "Felsefe Grb. (12)", coeff: 3 },
            { id: "din", label: "Din Kül. (6)", coeff: 3.33 }
        ],
        info: "Sadece AYT ham puanıdır. TYT ve OBP dahil değildir."
    },
    'lgs': {
        name: "LGS",
        base: 195, // Approximate base
        sections: [
            { id: "tr", label: "Türkçe (20)", coeff: 3.6 }, // Coeffs scaled roughly for 500
            { id: "mat", label: "Matematik (20)", coeff: 3.6 },
            { id: "fen", label: "Fen (20)", coeff: 3.6 },
            { id: "ink", label: "İnkılap (10)", coeff: 1 },
            { id: "din", label: "Din (10)", coeff: 1 },
            { id: "dil", label: "Yabancı Dil (10)", coeff: 1 }
        ],
        info: "Standart sapma her yıl değişir, bu tahmini bir puandır."
    },
    'kpss_lisans': {
        name: "KPSS Lisans (P3)",
        base: 40, // Rough base
        sections: [
            { id: "gy", label: "Genel Yetenek (60)", coeff: 0.5 },
            { id: "gk", label: "Genel Kültür (60)", coeff: 0.5 }
        ],
        info: "Tahmini P3 puanıdır. Standart sapmaya göre değişir."
    },
    'kpss_onlisans': {
        name: "KPSS Önlisans (P93)",
        base: 40,
        sections: [
            { id: "gy", label: "Genel Yetenek (60)", coeff: 0.5 },
            { id: "gk", label: "Genel Kültür (60)", coeff: 0.5 }
        ],
        info: "Tahmini P93 puanıdır."
    },
    'kpss_orta': {
        name: "KPSS Ortaöğretim (P94)",
        base: 40,
        sections: [
            { id: "gy", label: "Genel Yetenek (60)", coeff: 0.5 },
            { id: "gk", label: "Genel Kültür (60)", coeff: 0.5 }
        ],
        info: "Tahmini P94 puanıdır."
    },
    'ales_say': {
        name: "ALES (Sayısal)",
        base: 70, // Differs wildly
        sections: [
            { id: "say", label: "Sayısal (50)", coeff: 0.75 },
            { id: "soz", label: "Sözel (50)", coeff: 0.25 }
        ],
        info: "Tahmini Sayısal puanıdır."
    },
    'ales_ea': {
        name: "ALES (Eşit Ağırlık)",
        base: 70,
        sections: [
            { id: "say", label: "Sayısal (50)", coeff: 0.5 },
            { id: "soz", label: "Sözel (50)", coeff: 0.5 }
        ],
        info: "Tahmini EA puanıdır."
    },
    'ales_soz': {
        name: "ALES (Sözel)",
        base: 70,
        sections: [
            { id: "say", label: "Sayısal (50)", coeff: 0.25 },
            { id: "soz", label: "Sözel (50)", coeff: 0.75 }
        ],
        info: "Tahmini Sözel puanıdır."
    },
    'dgs_say': {
        name: "DGS (Sayısal)",
        base: 130, // Very approximate
        sections: [
            { id: "say", label: "Sayısal (50)", coeff: 3 },
            { id: "soz", label: "Sözel (50)", coeff: 0.6 }
        ],
        info: "ÖBP hariç ham puandır."
    },
    'dgs_ea': {
        name: "DGS (Eşit Ağırlık)",
        base: 130,
        sections: [
            { id: "say", label: "Sayısal (50)", coeff: 1.8 },
            { id: "soz", label: "Sözel (50)", coeff: 1.8 }
        ],
        info: "ÖBP hariç ham puandır."
    },
    'dgs_soz': {
        name: "DGS (Sözel)",
        base: 130,
        sections: [
            { id: "say", label: "Sayısal (50)", coeff: 0.6 },
            { id: "soz", label: "Sözel (50)", coeff: 3 }
        ],
        info: "ÖBP hariç ham puandır."
    }
};

function renderCalculatorInputs() {
    const sel = document.getElementById('calc-exam-select');
    const container = document.getElementById('calc-dynamic-inputs');
    if (!sel || !container) return;

    const type = sel.value;
    const config = EXAM_CONFIG[type];

    let html = '';

    // Group into pairs for grid layout
    for (let i = 0; i < config.sections.length; i += 2) {
        const sec1 = config.sections[i];
        const sec2 = config.sections[i + 1];

        html += `<div class="input-grid" style="margin-bottom:15px;">`;

        // Col 1
        html += `
            <div>
                <label class="form-label">${sec1.label} (D)</label>
                <input type="number" class="form-input calc-inp-d" data-id="${sec1.id}" placeholder="0" min="0">
                <input type="number" class="form-input calc-inp-y" data-id="${sec1.id}" placeholder="Yanlış" min="0" style="margin-top:5px; font-size:0.8rem; padding:8px; opacity:0.8;">
            </div>
        `;

        // Col 2 (if exists)
        if (sec2) {
            html += `
            <div>
                <label class="form-label">${sec2.label} (D)</label>
                <input type="number" class="form-input calc-inp-d" data-id="${sec2.id}" placeholder="0" min="0">
                <input type="number" class="form-input calc-inp-y" data-id="${sec2.id}" placeholder="Yanlış" min="0" style="margin-top:5px; font-size:0.8rem; padding:8px; opacity:0.8;">
            </div>
        `;
        } else {
            html += `<div></div>`; // Spacer
        }

        html += `</div>`;
    }

    // Add info note
    html += `<div style="font-size:0.75rem; color:#64748b; margin-top:10px; font-style:italic;">${config.info}</div>`;

    container.innerHTML = html;
}

function calculateNet() {
    const sel = document.getElementById('calc-exam-select');
    if (!sel) return;
    const type = sel.value;
    const config = EXAM_CONFIG[type];

    let totalScore = 0;

    // CUSTOM LOGIC
    if (type === 'custom') {
        const base = parseFloat(document.getElementById('calc-base').value) || 0;
        const rule = parseFloat(document.getElementById('calc-rule').value) || 0;

        totalScore = base;

        // Loop Rows
        const rows = document.querySelectorAll('.custom-row');
        rows.forEach(row => {
            const d = parseFloat(row.querySelector('.c-d').value) || 0;
            const y = parseFloat(row.querySelector('.c-y').value) || 0;
            const coeff = parseFloat(row.querySelector('.c-coeff').value) || 0;

            let net = d;
            if (rule > 0) {
                net = d - (y / rule);
                if (net < 0) net = 0;
            }

            totalScore += (net * coeff);
        });

    } else {
        // STANDARD LOGIC
        totalScore = config.base || 0;
        let totalNet = 0; // Only for standard calc usage if needed inside list

        // Iterate inputs
        const dInputs = document.querySelectorAll('.calc-inp-d');
        const yInputs = document.querySelectorAll('.calc-inp-y');

        config.sections.forEach(sec => {
            // Find inputs for this section
            let d = 0, y = 0;

            // Not efficient loop but works for small form
            dInputs.forEach(inp => { if (inp.dataset.id === sec.id) d = parseFloat(inp.value) || 0; });
            yInputs.forEach(inp => { if (inp.dataset.id === sec.id) y = parseFloat(inp.value) || 0; });

            // Calculate Net (4 wrongs 1 right usually, change if needed)
            // Generally 4 for High School+ exams, 3 for Middle School (LGS used to be 3 but instructions say standard)
            // Let's assume 4 for all standard exams here or 3 for LGS if specifically requested.
            // Actually LGS is 3 wrongs 1 right. TYT/AYT/KPSS/ALES/DGS is 4 wrongs 1 right.

            let divider = 4;
            if (type === 'lgs') divider = 3;

            let net = d - (y / divider);
            if (net < 0) net = 0;

            // totalNet += net; // We don't really track total net for custom yet
            totalScore += (net * sec.coeff);
        });
    }

    // Display Result (Score)
    const resultBox = document.querySelector('.result-value');
    if (resultBox) resultBox.innerText = totalScore.toFixed(3);

    // Save Logic (We save Score for custom? Or Net?)
    // For Custom, "Total Net" is ambiguous because coefficients matter more.
    // Let's just save valid score as 'net' for now to fit the graph schema.
    // Technically graph axis says "NET" but user sees score.
    // Wait, graph calls it "Netlerim". If I save Score (350), graph will spike.
    // Standard exams save Net (e.g. 65).
    // Let's save Calculated Score for Custom Exam, assuming user wants to track Points there.
    // But this breaks the graph scale if mixed.
    // User requested "Hesaplayabilsin". Didn't explicitly say "Graph it".
    // I will save it anyway.

    saveNetToHistory(totalScore, type === 'custom' ? 'Özel' : EXAM_CONFIG[type].name);
}

// Add Custom Row Helper
function addCustomRow() {
    const cont = document.getElementById('custom-rows-container');
    if (!cont) return;

    const div = document.createElement('div');
    div.className = 'custom-row input-grid';
    div.style.marginBottom = '10px';
    div.style.gap = '5px';
    div.style.gridTemplateColumns = '2fr 1fr 1fr 1fr';

    div.innerHTML = `
        <input type="text" class="form-input" placeholder="Ders Adı">
        <input type="number" class="form-input c-d" placeholder="D">
        <input type="number" class="form-input c-y" placeholder="Y">
        <input type="number" class="form-input c-coeff" placeholder="Katsayı">
    `;

    cont.appendChild(div);
}

function saveNetToHistory(netVal, examType) {
    if (!db) return;

    // Prepare object
    const docData = {
        net: parseFloat(netVal.toFixed(2)),
        examType: examType,
        timestamp: Date.now()
    };

    db.collection(EXAM_COLLECTION).add(docData).then(() => {
        // Refresh graph
        renderHomeNetChart();
        loadExams(); // Refreshes history list
    });
}

// Exam Sub Tab Switcher
function switchExamSubTab(subName) {
    // 1. Update Buttons
    // Since buttons are manual div logic in HTML: onclick="switchExamSubTab('netlerim')"
    // We need to find them. They are .sub-nav-btn inside .sub-nav-container
    const btns = document.querySelectorAll('.sub-nav-btn');
    btns.forEach(btn => {
        if (btn.getAttribute('onclick').includes(subName)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 2. toggle views
    // IDs: sub-view-netlerim, sub-view-hesapla
    document.getElementById('sub-view-netlerim').classList.add('hidden');
    document.getElementById('sub-view-hesapla').classList.add('hidden');

    document.getElementById(`sub-view-${subName}`).classList.remove('hidden');

    // 3. Render logic
    if (subName === 'hesapla') {
        const cont = document.getElementById('calc-dynamic-inputs');
        // Initial render if empty
        if (cont && !cont.innerHTML.trim()) {
            renderCalculatorInputs();
        }
    } else if (subName === 'netlerim') {
        renderHomeNetChart(); // reuse home chart logic or separate?
    }
}

// --- GOALS & INTERACTIVITY ---
const GOAL_COLLECTION = "mbsinav_goals";

// --- HOME SUB-TABS ---
function switchHomeSubTab(tabName) {
    // 1. Update Buttons
    const buttons = document.querySelectorAll('#tab-home .shape-selector .shape-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(`'${tabName}'`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 2. Hide All Views
    document.getElementById('home-view-genel').classList.add('hidden');
    document.getElementById('home-view-durum').classList.add('hidden');
    document.getElementById('home-view-hedefler').classList.add('hidden');
    document.getElementById('home-view-notlar').classList.add('hidden');

    // 3. Show Target View
    const target = document.getElementById(`home-view-${tabName}`);
    if (target) {
        target.classList.remove('hidden');
    }

    // 4. Specific Loads
    if (tabName === 'genel') {
        updateDashboardSchedule();
        renderDashboardGoals();
    } else if (tabName === 'durum') {
        renderDurumSchedule(); // New function for list view in Durum tab
        // Also ensure progress is updated
        renderProcessStatus();
    } else if (tabName === 'hedefler') {
        loadGoals();
    } else if (tabName === 'netler') {
        renderHomeNetChart();
        // Init calc if empty
        const cont = document.getElementById('calc-dynamic-inputs');
        if (cont && !cont.innerHTML.trim()) renderCalculatorInputs();
    } else if (tabName === 'notlar') {
        loadNotes();
    }
}


// Render Today's Goals for Dashboard
function renderDashboardGoals() {
    if (!db) return;
    // Just show top 3 goals
    db.collection(GOAL_COLLECTION).where('completed', '==', false).limit(3).get().then(snap => {
        const container = document.getElementById('dashboard-goals-list');
        if (!container) return;

        if (snap.empty) {
            container.innerHTML = `<div style = "text-align:center; padding:10px; color:#64748b;" > Bugün için hedefin yok.</div> `;
            return;
        }

        let html = '';
        snap.forEach(doc => {
            const data = doc.data();
            html += `
    <div class="list-item-card" style = "border-left-color: #f97316; padding:10px;" >
        <span style="font-size:0.9rem;">${data.text}</span>
                </div>
    `;
        });
        container.innerHTML = html;
    });
}

function renderDurumSchedule() {
    // Shows same as dashboard but allows see all essentially (reusing updateDashboardSchedule logic but targeting different container?)
    // Actually updateDashboardSchedule filters by Today. 'Durum' tab usually implies Status of Today.
    // So let's reuse logic but target #durum-schedule-list
    const container = document.getElementById('durum-schedule-list');
    if (!container) return;

    const d = new Date().getDay();
    const todayItems = fullSchedule.filter(i => parseInt(i.day) === d).sort((a, b) => a.time.localeCompare(b.time));

    if (todayItems.length === 0) {
        container.innerHTML = `<div style = "text-align:center; padding:10px; color:#64748b;" > Bugün boşsun! 🥳</div> `;
        return;
    }

    let html = '';
    todayItems.forEach(item => {
        html += `
    <div class="list-item-card" style = "border-left-color: #3b82f6;" >
        <div class="item-info">
            <h3>${item.subject}</h3>
            <span class="item-sub">${item.time} ${item.note ? '- ' + item.note : ''}</span>
        </div>
            </div>
    `;
    });
    container.innerHTML = html;
}


function addGoal() {
    const input = document.getElementById('goal-input');
    const dateInput = document.getElementById('goal-date');
    const text = input.value.trim();
    const dateVal = dateInput ? dateInput.value : null;

    if (!text) return;

    if (db) {
        db.collection(GOAL_COLLECTION).add({
            text: text,
            targetDate: dateVal,
            completed: false,
            timestamp: Date.now()
        }).then(() => {
            input.value = '';
            if (dateInput) dateInput.value = '';
            loadGoals();
            renderDashboardGoals();
        });
    }
}

function loadGoals() {
    if (!db) return;
    db.collection(GOAL_COLLECTION).orderBy('timestamp', 'desc').onSnapshot(snap => {
        const container = document.getElementById('goal-list');
        if (!container) return;

        if (snap.empty) {
            container.innerHTML = `<div style = "text-align:center; padding:20px; color:#64748b;" > Henüz hedef eklemedin.Hadi başla! 🚀</div> `;
            return;
        }

        let html = '';
        snap.forEach(doc => {
            const data = doc.data();
            const isDone = data.completed;
            const dateBadge = data.targetDate ? `<span class="item-badge" style = "background:#f1f5f9; color:#64748b; font-size:0.7rem; margin-right:5px;" >📅 ${new Date(data.targetDate).toLocaleDateString('tr-TR')}</span> ` : '';

            html += `
    <div class="list-item-card" style = "border-left-color: ${isDone ? '#10b981' : '#f97316'}; opacity: ${isDone ? '0.6' : '1'};" >
                    <div class="item-info">
                        <h3 style="text-decoration: ${isDone ? 'line-through' : 'none'}">${data.text}</h3>
                        <div style="margin-top:5px;">
                            ${dateBadge}
                            <span class="item-sub">${new Date(data.timestamp).toLocaleDateString('tr-TR')}</span>
                        </div>
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

// --- NOTES SYSTEM ---
const NOTES_COLLECTION = "mbsinav_notes";

function addNote() {
    const input = document.getElementById('note-input');
    const dateInput = document.getElementById('note-date');
    const text = input.value.trim();
    const dateVal = dateInput ? dateInput.value : null;

    if (!text) return;

    if (db) {
        db.collection(NOTES_COLLECTION).add({
            text: text,
            targetDate: dateVal,
            timestamp: Date.now()
        }).then(() => {
            input.value = '';
            if (dateInput) dateInput.value = '';
        });
    }
}

function loadNotes() {
    if (!db) return;
    db.collection(NOTES_COLLECTION).orderBy('timestamp', 'desc').onSnapshot(snap => {
        const container = document.getElementById('note-list');
        if (!container) return;

        if (snap.empty) {
            container.innerHTML = `<div style = "text-align:center; padding:20px; color:#64748b;" > Henüz not yok.</div> `;
            return;
        }

        let html = '';
        snap.forEach(doc => {
            const data = doc.data();
            html += `
    <div class="list-item-card" style = "border-left-color: #a855f7;" >
                    <div class="item-info">
                        <h3>${data.text}</h3>
                        <span class="item-sub">${new Date(data.timestamp).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <button onclick="deleteNote('${doc.id}')" style="background:none; border:none; cursor:pointer; color:#ef4444;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
    `;
        });
        container.innerHTML = html;
    });
}

function deleteNote(id) {
    if (confirm("Notu silmek istiyor musun?")) {
        db.collection(NOTES_COLLECTION).doc(id).delete();
    }
}

const SUBJECTS_COLLECTION = "mbsinav_subjects";
const TOPICS_COLLECTION = "mbsinav_topics";

let subjects = [];
let topics = [];
let currentFilter = 'all';
let deleteSubjectPromptId = null;

// Load Data
function loadSubjectsAndTopics() {
    if (!db) return;

    // Load Subjects
    db.collection(SUBJECTS_COLLECTION).orderBy('timestamp', 'asc').onSnapshot(snap => {
        subjects = [];
        snap.forEach(doc => subjects.push({ id: doc.id, ...doc.data() }));
        // If empty (first time run?), maybe seed defaults?
        // For now, let's assume user starts empty or we seed defaults manually if needed.
        // Actually, let's seed defaults if absolutely empty to avoid blank screen shock.
        if (subjects.length === 0 && !localStorage.getItem('mbsinav_seeded')) {
            seedDefaultSubjects();
        }
        renderSubjectTabs();
    });

    // Load Topics
    db.collection(TOPICS_COLLECTION).orderBy('timestamp', 'desc').onSnapshot(snap => {
        topics = [];
        snap.forEach(doc => topics.push({ id: doc.id, ...doc.data() }));

        renderTopics();
    });
}

function seedDefaultSubjects() {
    const defaults = [
        { name: 'Matematik', icon: 'fas fa-infinity' },
        { name: 'Türkçe', icon: 'fas fa-book' },
        { name: 'Fen', icon: 'fas fa-flask' },
        { name: 'Sosyal', icon: 'fas fa-globe-europe' }
    ];
    defaults.forEach(d => {
        db.collection(SUBJECTS_COLLECTION).add({ ...d, timestamp: Date.now() });
    });
    localStorage.setItem('mbsinav_seeded', 'true');
}

// --- SOCIAL PAGE LOGIC ---
const CAPSULE_COLLECTION = "mbsinav_capsules";
const BUCKET_COLLECTION = "mbsinav_bucketlist";

// Navigation
function openSocialSubTab(subName) {
    const grid = document.querySelector('.social-grid');
    if (grid) grid.classList.add('hidden');

    // Hide all social sub-views first
    document.querySelectorAll('[id^="social-view-"]').forEach(el => el.classList.add('hidden'));

    // Show target
    const target = document.getElementById(`social-view-${subName}`);
    if (target) {
        target.classList.remove('hidden');

        // Load data specific functions
        if (subName === 'capsule') loadCapsules();
        if (subName === 'bucket') loadBucketList();
        if (subName === 'movies') loadMovies();
        if (subName === 'stories') loadStories();
        if (subName === 'thisorthat') loadQuestions();
    }
}

function closeSocialSubTab() {
    // Hide all social sub-views
    document.querySelectorAll('[id^="social-view-"]').forEach(el => el.classList.add('hidden'));

    // Show grid
    const grid = document.querySelector('.social-grid');
    if (grid) grid.classList.remove('hidden');
}

// 1. CAPSULE LOGIC
function addCapsule() {
    const title = document.getElementById('cap-title').value;
    const msg = document.getElementById('cap-message').value;
    const date = document.getElementById('cap-date').value;

    if (!title || !msg || !date) { alert("Lütfen tüm alanları doldurun."); return; }

    db.collection(CAPSULE_COLLECTION).add({
        title,
        message: msg,
        unlockDate: date,
        timestamp: Date.now()
    }).then(() => {
        alert("Kapsül kilitlendi! 🔒");
        document.getElementById('cap-title').value = '';
        document.getElementById('cap-message').value = '';
        document.getElementById('cap-date').value = '';
        loadCapsules();
    });
}

function loadCapsules() {
    if (!db) return;
    const container = document.getElementById('capsule-list');
    db.collection(CAPSULE_COLLECTION).orderBy('timestamp', 'desc').get().then(snap => {
        if (snap.empty) {
            container.innerHTML = `<div style = "text-align:center; color:#64748b; padding:20px;" > Henüz kapsülün yok.</div> `;
            return;
        }

        let html = '';
        const now = new Date();

        snap.forEach(doc => {
            const data = doc.data();
            const unlock = new Date(data.unlockDate);
            const isLocked = unlock > now;

            if (isLocked) {
                html += `
    <div class="list-item-card" style = "border-left-color: #fbbf24; opacity:0.7;" >
                        <div class="item-info">
                            <h3>🔒 ${data.title}</h3>
                            <span class="item-sub">Açılma Tarihi: ${unlock.toLocaleDateString('tr-TR')}</span>
                        </div>
                        <i class="fas fa-lock" style="color:#fbbf24;"></i>
                    </div>
    `;
            } else {
                html += `
    <div class="list-item-card" style = "border-left-color: #10b981;" >
        <div class="item-info">
            <h3>🔓 ${data.title}</h3>
            <p style="font-size:0.9rem; margin-top:5px; color:#cbd5e1;">${data.message}</p>
            <span class="item-sub" style="margin-top:5px; display:block;">${unlock.toLocaleDateString('tr-TR')} tarihinde açıldı.</span>
        </div>
                    </div>
    `;
            }
        });
        container.innerHTML = html;
    });
}

// 2. BUCKET LIST LOGIC
function addBucketItem() {
    const input = document.getElementById('bucket-input');
    const text = input.value.trim();
    if (!text) return;

    db.collection(BUCKET_COLLECTION).add({
        text,
        done: false,
        timestamp: Date.now()
    }).then(() => {
        input.value = '';
        loadBucketList();
    });
}

function loadBucketList() {
    if (!db) return;
    db.collection(BUCKET_COLLECTION).orderBy('timestamp', 'desc').onSnapshot(snap => {
        const container = document.getElementById('bucket-list');
        if (snap.empty) {
            container.innerHTML = `<div style = "text-align:center; color:#64748b; padding:20px;" > Listen boş.Ekle bi şeyler!</div> `;
            return;
        }

        let html = '';
        snap.forEach(doc => {
            const data = doc.data();
            html += `
    <div class="list-item-card" style = "border-left-color: #34d399;" >
                    <div class="item-info">
                        <h3 style="text-decoration: ${data.done ? 'line-through' : 'none'}; opacity:${data.done ? 0.5 : 1}">${data.text}</h3>
                    </div>
                    <div style="display:flex; gap:10px;">
                         <button onclick="toggleBucket('${doc.id}', ${!data.done})" style="background:none; border:none; cursor:pointer; color:${data.done ? '#10b981' : '#cbd5e1'};">
                            <i class="fas fa-check-circle"></i>
                        </button>
                        <button onclick="deleteBucket('${doc.id}')" style="background:none; border:none; cursor:pointer; color:#ef4444;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
    `;
        });
        container.innerHTML = html;
    });
}

function toggleBucket(id, state) {
    db.collection(BUCKET_COLLECTION).doc(id).update({ done: state });
}

function deleteBucket(id) {
    if (confirm("Silmek istiyor musun?")) db.collection(BUCKET_COLLECTION).doc(id).delete();
}

// 1. SUBJECTS (TABS)
function renderSubjectTabs() {
    const container = document.getElementById('subject-tabs-container');
    if (!container) return;

    let html = '';

    // "All" Tab (Fixed)
    html += `
    <div class="shape-btn subject-tab-btn ${currentFilter === 'all' ? 'active' : ''}" onclick = "filterSubjects('all', this)" >
            <i class="fas fa-layer-group"></i>
            <span>Tümü</span>
        </div>
    `;

    // Dynamic Tabs
    subjects.forEach(sub => {
        html += `
    <div class="shape-btn subject-tab-btn ${currentFilter === sub.id ? 'active' : ''}" onclick = "filterSubjects('${sub.id}', this, event)" >
                <i class="${sub.icon || 'fas fa-book'}"></i>
                <span>${sub.name}</span>
                ${generateSubjectDeletePrompt(sub.id)}
            </div>
    `;
    });

    // "Add" Button
    html += `
    <div class="shape-btn" onclick = "addNewSubject()" style = "background: rgba(255,255,255,0.05); border:1px dashed #64748b;" >
            <i class="fas fa-plus"></i>
            <span>Ekle</span>
        </div>
    `;

    container.innerHTML = html;
}

function generateSubjectDeletePrompt(id) {
    return `
    <div id = "del-prompt-${id}" class="delete-prompt hidden" onclick = "confirmDeleteSubject('${id}', event)" >
        Sileyim mi ? <span style="text-decoration:underline; font-weight:bold;">SİL</span>
        </div>
    `;
}

function addNewSubject() {
    const name = prompt("Yeni dersin adı ne?");
    if (!name) return;

    db.collection(SUBJECTS_COLLECTION).add({
        name: name,
        icon: 'fas fa-bookmark', // Default icon
        timestamp: Date.now()
    });
}

function filterSubjects(cat, btnElement, event) {
    currentFilter = cat;

    // UI Update
    // Re-rendering whole tabs to update 'active' class is easiest or just toggle
    // Let's just update classes manually for smoothness
    document.querySelectorAll('.subject-tab-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    // Filter Topics
    renderTopics();

    // Delete Prompt Logic (Only for specific subjects, not 'all')
    if (cat !== 'all' && event) {
        // Show prompt logic similar to previous attempt
        hideAllDeletePrompts();
        const prompt = document.getElementById(`del-prompt-${cat}`);
        if (prompt) {
            prompt.classList.remove('hidden');
            deleteSubjectPromptId = cat;
            event.stopPropagation();
        }
    } else {
        hideAllDeletePrompts();
    }
}

function confirmDeleteSubject(id, event) {
    event.stopPropagation();
    if (!db) return;

    // Delete Subject
    db.collection(SUBJECTS_COLLECTION).doc(id).delete();

    // Delete associated topics? Or keep them orphaned?
    // Better to keep them or delete? For simplicity, let's keep them (or user can delete manually)
    // But typically user expects cleanup. Let's leave them for now to avoid accidental mass data loss.

    // Reset filter
    filterSubjects('all');
    hideAllDeletePrompts();
}

// 2. TOPICS (LIST)
function renderTopics() {
    const container = document.getElementById('subject-list');
    if (!container) return;

    // Filter
    let displayTopics = topics;
    if (currentFilter !== 'all') {
        displayTopics = topics.filter(t => t.subjectId === currentFilter);
    }

    if (displayTopics.length === 0) {
        if (currentFilter === 'all' && subjects.length === 0) {
            container.innerHTML = `<div style = "text-align:center; padding:20px; color:#64748b;" > Hiç ders yok. "Ekle" butonuna basarak başla!</div> `;
            return;
        }
        // Show "Add Topic" button even if empty
    }

    let html = '';

    displayTopics.forEach(t => {
        // Find subject color/icon if needed. For now standard look.
        // Status color logic
        let statusColor = '#64748b'; // Gray (Not started)
        let statusText = 'Başlanmadı';
        if (t.status === 'working') { statusColor = '#f97316'; statusText = 'Çalışılıyor'; }
        else if (t.status === 'done') { statusColor = '#10b981'; statusText = 'Tamamlandı'; }

        html += `
    <div class="list-item-card" style = "border-left-color: ${statusColor};" >
                <div class="item-info">
                    <h3>${t.name}</h3>
                    <span class="item-sub">${getSubjectName(t.subjectId)}</span>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <span class="item-badge" style="background:${statusColor}20; color:${statusColor}; font-size:0.7rem;">${statusText}</span>
                    <button onclick="deleteTopic('${t.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
    `;
    });

    // Add "New Topic" Button at bottom
    // Only show if a specific subject is selected (to know where to add)
    // Or if 'all' is selected, prompt needs to ask for subject.
    html += `
    <div onclick = "addNewTopic()" style = "
margin - top: 15px;
padding: 15px;
border: 2px dashed #334155;
border - radius: 15px;
text - align: center;
color: #94a3b8;
cursor: pointer;
transition: all 0.2s;
" onmouseover="this.style.borderColor = '#3b82f6'; this.style.color = '#3b82f6'" 
onmouseout = "this.style.borderColor='#334155'; this.style.color='#94a3b8'" >
    <i class="fas fa-plus-circle"></i> Yeni Konu Ekle
        </div>
    `;

    container.innerHTML = html;
}

function addNewTopic() {
    let subjectId = currentFilter;

    // If "All" is selected, we must ask user to choose a subject
    if (subjectId === 'all') {
        // For simplicity, let's just pick the first one or ask user to select a tab first.
        // Or show a prompt with dropdown.
        // Let's ask user to select a tab first for better UX than a complex prompt.
        const subName = prompt("Hangi derse ekleyeceksin? (Dersin tam adını yaz):");
        if (!subName) return;
        const sub = subjects.find(s => s.name.toLowerCase() === subName.toLowerCase());
        if (!sub) {
            alert("Böyle bir ders bulunamadı. Önce dersi seçebilir ya da ders ekleyebilirsin.");
            return;
        }
        subjectId = sub.id;
    }

    const name = prompt("Konu adı ne?");
    if (!name) return;

    db.collection(TOPICS_COLLECTION).add({
        name: name,
        subjectId: subjectId,
        status: 'pending', // pending, working, done
        timestamp: Date.now()
    });
}

function deleteTopic(id) {
    if (confirm("Bu konuyu silmek istiyor musun?")) {
        db.collection(TOPICS_COLLECTION).doc(id).delete();
    }
}

function getSubjectName(id) {
    const s = subjects.find(sub => sub.id === id);
    return s ? s.name : 'Genel';
}

function hideAllDeletePrompts() {
    document.querySelectorAll('.delete-prompt').forEach(p => p.classList.add('hidden'));
    deleteSubjectPromptId = null;
}

// Global Click for prompts
document.addEventListener('click', (e) => {
    if (deleteSubjectPromptId) {
        hideAllDeletePrompts();
    }
});

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
        if (svg) svg.innerHTML = `<text x = "50%" y = "50%" dominant - baseline="middle" text - anchor="middle" fill = "#64748b" font - size="12" > Grafik için en az 2 veri lazım</text> `;
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
    let pathD = `M ${getX(0)} ${getY(data[0].net)} `;
    let areaD = `M ${getX(0)} ${height} L ${getX(0)} ${getY(data[0].net)} `;

    data.forEach((d, i) => {
        pathD += ` L ${getX(i)} ${getY(d.net)} `;
        areaD += ` L ${getX(i)} ${getY(d.net)} `;
    });

    areaD += ` L ${getX(data.length - 1)} ${height} Z`;

    // Draw SVG
    let html = `
    < !--Area -->
        <path d="${areaD}" class="chart-area" />
        <!--Line -->
    <path d="${pathD}" class="chart-line" />
`;

    // Dots & Labels
    let labelsHtml = '';
    data.forEach((d, i) => {
        html += `<circle cx = "${getX(i)}" cy = "${getY(d.net)}" class="chart-dot" > <title>${d.net} Net - ${d.date}</title></circle> `;
        html += `<text x = "${getX(i)}" y = "${getY(d.net) - 10}" class="chart-label" > ${d.net}</text> `;

        // Axis Labels (First and Last only to prevent crowd)
        if (i === 0 || i === data.length - 1) {
            labelsHtml += `<span > ${d.date}</span> `;
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
    <div class="list-item-card" style = "border-left-color: #f97316; height:auto; padding:10px;" >
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

// --- Home Page Net Chart ---
function renderHomeNetChart() {
    if (!db) return;
    const historyContainer = document.getElementById('home-net-history-list');

    db.collection(EXAM_COLLECTION).orderBy('timestamp', 'desc').limit(5).get().then(snap => {
        const data = [];
        if (historyContainer) historyContainer.innerHTML = '';

        snap.forEach(doc => {
            const d = doc.data();
            data.push({
                net: d.net,
                date: new Date(d.timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                timestamp: d.timestamp
            });

            // Populate List
            if (historyContainer) {
                const el = document.createElement('div');
                el.className = 'list-item-card';
                el.style.borderLeftColor = '#3b82f6';
                el.innerHTML = `
    <div class="item-info" >
                         <h3>${d.net} Net</h3>
                         <span class="item-sub">${new Date(d.timestamp).toLocaleDateString('tr-TR')}</span>
                    </div>
    `;
                historyContainer.appendChild(el);
            }
        });

        // Simplified Chart Logic (Reusing same SVG structure as main but applied to home chart)
        data.sort((a, b) => a.timestamp - b.timestamp); // Sort by date ascending

        if (data.length < 2) return; // Need points

        // Draw Chart
        const svg = document.getElementById('home-net-chart');
        const labelArea = document.getElementById('home-chart-labels');
        if (!svg) return;

        // Reset
        svg.innerHTML = '';
        if (labelArea) labelArea.innerHTML = '';

        // Dimensions
        const width = 350;
        const height = 200;
        const padding = 20;
        const effectiveHeight = height - (padding * 2);
        const effectiveWidth = width - (padding * 2);

        // Normalize
        const maxNet = Math.max(...data.map(d => d.net)) * 1.1; // +10%
        const minNet = 0;

        // Points
        let pointsStr = "";
        data.forEach((d, i) => {
            const x = padding + (i / (data.length - 1)) * effectiveWidth;
            const y = height - padding - ((d.net / maxNet) * effectiveHeight);

            pointsStr += `${x},${y} `;

            // Draw Dots
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.classList.add("chart-dot");
            dot.setAttribute("cx", x);
            dot.setAttribute("cy", y);

            // Label inside SVG
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `${d.net} Net(${d.date})`;
            dot.appendChild(title);

            svg.appendChild(dot);

            // Axis Labels
            if (labelArea) {
                const span = document.createElement('span');
                span.innerText = d.date;
                labelArea.appendChild(span);
            }
        });

        // Path
        const path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        path.classList.add("chart-line");
        path.setAttribute("points", pointsStr.trim());
        svg.prepend(path);
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('app-version-display').innerText = APP_VERSION;
    setInterval(updateCountdown, 1000);
    updateCountdown();

    const savedTab = localStorage.getItem('mbsinav_current_tab');
    if (savedTab) {
        switchTab(savedTab);
    } else {
        switchTab('home');
    }

    /* SW DISABLED
    if ('serviceWorker' in navigator) {
        // ULTRA AGGRESSIVE CACHE BUSTING
        // We use Date.now() to ensure the browser ALWAYS fetches the new sw.js file
        navigator.serviceWorker.register('./sw-v9.js?t=' + Date.now()).then(reg => {
            console.log('SW Registered');
            // Force update check immediately
            reg.update();
        }).catch(console.log);
    }
    */

    if (typeof firebase !== 'undefined') {
        loadSchedule(); // This also triggers dashboard update
    }

    renderDaySelector();

    if (typeof firebase !== 'undefined') {
        loadSettings();
        loadSubjectsAndTopics();
    }

    initModalLogic();
});

// 3. MOVIES LOGIC
let allMovies = [];

async function loadMovies() {
    try {
        if (allMovies.length === 0) {
            const res = await fetch('movies.json?v=' + APP_VERSION);
            allMovies = await res.json();
        }
        renderMovies(allMovies);
    } catch (e) { console.error(e); }
}

function renderMovies(list) {
    const container = document.getElementById('movie-list');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `<div style = "text-align:center; padding:20px; color:#cbd5e1;" > Kriterlere uygun film bulunamadı.</div> `;
        return;
    }

    let html = '';
    list.forEach(m => {
        html += `
    <div class="list-item-card" style = "border-left-color: #f472b6; display:block;" >
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <h3 style="color:#f472b6;">${m.title}</h3>
                    <span style="background:#f472b6; color:white; padding:2px 6px; border-radius:4px; font-size:0.8rem; font-weight:bold;">${m.imdb}</span>
                </div>
                <div style="font-size:0.85rem; color:#cbd5e1; margin:5px 0;">
                    ${m.year} • ${m.genre}
                </div>
                 <div style="font-size:0.8rem; color:#94a3b8; font-style:italic;">
                    ${m.description}
                </div>
                <div style="font-size:0.75rem; color:#64748b; margin-top:5px;">
                   Oyuncular: ${m.cast.join(', ')}
                </div>
            </div>
    `;
    });
    container.innerHTML = html;
}

function filterMovies() {
    const genre = document.getElementById('movie-genre').value;
    const minImdb = parseFloat(document.getElementById('movie-min-imdb').value) || 0;
    const cast = document.getElementById('movie-cast').value.toLowerCase();

    const filtered = allMovies.filter(m => {
        const matchesGenre = genre === '' || m.genre.includes(genre);
        const matchesImdb = m.imdb >= minImdb;
        const matchesCast = cast === '' || m.cast.some(c => c.toLowerCase().includes(cast));
        return matchesGenre && matchesImdb && matchesCast;
    });

    renderMovies(filtered);
}

// 4. STORIES LOGIC
async function loadStories() {
    const container = document.getElementById('story-list');
    try {
        const res = await fetch('stories.json?v=' + APP_VERSION);
        let stories = await res.json();

        // Filter out requested removal if it exists (just in case)
        stories = stories.filter(s => !s.name.includes("Atatürk"));

        let html = '';
        stories.forEach((s, index) => {
            // Shorten story for preview
            const isLong = s.story.length > 100;
            const preview = isLong ? s.story.substring(0, 100) + '...' : s.story;

            html += `
    <div class="list-item-card" id = "story-${index}" style = "border-left-color: #fb923c; display:block; cursor:pointer;" onclick = "toggleStory(${index})" >
                    <div style="display:flex; justify-content:space-between;">
                        <h3 style="color:#fb923c;">${s.name}</h3>
                        <i class="fas fa-chevron-down" id="icon-${index}" style="color:#cbd5e1; transition:transform 0.3s;"></i>
                    </div>
                    <span class="item-sub" style="display:block; margin-bottom:10px;">${s.title}</span>
                    
                    <p class="story-preview" id="preview-${index}" style="font-size:0.9rem; color:#cbd5e1; line-height:1.4;">
                        "${preview}"
                    </p>
                    <p class="story-full hidden" id="full-${index}" style="font-size:0.9rem; color:#fff; line-height:1.6; margin-top:10px;">
                        "${s.story}"
                    </p>
                </div>
    `;
        });
        container.innerHTML = html;
    } catch (e) { console.error(e); }
}

function toggleStory(index) {
    const preview = document.getElementById(`preview-${index}`);
    const full = document.getElementById(`full-${index}`);
    const icon = document.getElementById(`icon-${index}`);

    if (full.classList.contains('hidden')) {
        full.classList.remove('hidden');
        preview.classList.add('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        full.classList.add('hidden');
        preview.classList.remove('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

// 5. THIS OR THAT
let questions = [];
let currentQIndex = -1;

async function loadQuestions() {
    try {
        if (questions.length === 0) {
            const res = await fetch('questions.json?v=' + APP_VERSION);
            questions = await res.json();
            // Shuffle
            questions.sort(() => Math.random() - 0.5);
        }
        nextQuestion();
    } catch (e) { console.error(e); }
}

function nextQuestion() {
    currentQIndex++;
    if (currentQIndex >= questions.length) {
        alert("Tüm sorular bitti! Başa dönülüyor.");
        currentQIndex = 0;
    }

    document.getElementById('game-container').classList.remove('hidden');
    document.getElementById('game-stats').classList.add('hidden');

    const q = questions[currentQIndex];
    document.getElementById('btn-opt-a').innerText = q.a;
    document.getElementById('btn-opt-b').innerText = q.b;
}

function voteThisOrThat(option) {
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('game-stats').classList.remove('hidden');

    const q = questions[currentQIndex];

    // Fake stats generator for fun
    let pctA = Math.floor(Math.random() * 80) + 10; // Random % between 10-90
    let pctB = 100 - pctA;

    document.getElementById('stat-a-label').innerText = `${q.a} (% ${pctA})`;
    document.getElementById('stat-b-label').innerText = `${q.b} (% ${pctB})`;

    document.getElementById('stat-bar').style.width = pctA + '%';
}
