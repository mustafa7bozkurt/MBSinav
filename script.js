
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

// --- Navigation Logic ---
function switchTab(tabName) {
    // Hide all sections
    const sections = document.querySelectorAll('.mode-section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden'); // Ensure hidden class is used if defined, or just rely on CSS display:none logic
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

        // Scroll to top
        window.scrollTo(0, 0);
    }

    // Activate nav item
    // We look for the button that calls this function with this specific argument
    navItems.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });

    // Save state (optional)
    localStorage.setItem('mbsinav_current_tab', tabName);
}

// --- Countdown Logic ---
function updateCountdown() {
    // Target Date: June 15, 2026
    const examDate = new Date('2026-06-15T10:00:00').getTime();
    const now = new Date().getTime();
    const distance = examDate - now;

    if (distance < 0) return;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    const container = document.getElementById('countdown-display');
    if (container) {
        container.innerHTML = `
            <div class="time-box"><span class="time-val">${days}</span><span class="time-label">GÜN</span></div>
            <div class="time-box"><span class="time-val">${hours}</span><span class="time-label">SAAT</span></div>
            <div class="time-box"><span class="time-val">${minutes}</span><span class="time-label">DK</span></div>
        `;
    }
}

// --- Interactivity Features ---

// 1. Dashboard Quick Menu
function handleQuickMenu(action) {
    // Standard visual feedback
    document.querySelectorAll('.shape-selector .shape-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (action === 'netler') {
        switchTab('exam');
    } else if (action === 'hedefler') {
        alert("Hedefler modülü yakında eklenecek!"); // Placeholder
    } else if (action === 'notlar') {
        alert("Not defteri açılıyor..."); // Placeholder
    } else if (action === 'durum') {
        switchTab('home');
    }
}

// 2. Subject Filtering
function filterSubjects(category) {
    // Update UI buttons
    document.querySelectorAll('#tab-subjects .shape-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const items = document.querySelectorAll('#subject-list .list-item-card');

    items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (category === 'all' || itemCategory === category) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// 3. Calculator with Firebase Save
function calculateNet() {
    // Get all inputs
    const inps = document.querySelectorAll('#tab-exam input');
    let totalNet = 0;

    // Naive input gathering (Correct, Wrong pairs)
    // Order: TR-D, TR-Y, MAT-D, MAT-Y, FEN-D, FEN-Y, SOC-D, SOC-Y
    // We should probably rely on manual input order if IDs are not present, 
    // but better to just sum what we find for now or assumes standard order.

    for (let i = 0; i < inps.length; i += 2) {
        const correct = parseFloat(inps[i].value) || 0;
        const wrong = parseFloat(inps[i + 1].value) || 0;
        totalNet += correct - (wrong / 4);
    }

    const resDisplay = document.querySelector('#tab-exam .result-value');
    if (resDisplay) {
        resDisplay.innerText = totalNet.toFixed(2);
    }

    // Update Home Screen Stat as well
    const homeNet = document.querySelector('.result-value');
    // Note: Home screen might have same class, but ID targeting is safer. 
    // For now, let's just save to DB.

    saveExamResult(totalNet);
}

function saveExamResult(net) {
    if (!db) return;

    db.collection(EXAM_COLLECTION).add({
        net: net,
        date: new Date().toISOString(),
        timestamp: Date.now()
    }).then(() => {
        console.log("Net saved!");
        alert("Netiniz kaydedildi: " + net.toFixed(2));
    }).catch(err => {
        console.error("Save error", err);
        alert("Kaydetme hatası (İnternet bağlantını kontrol et)");
    });
}

// Load latest net on startup
function loadStats() {
    if (!db) return;

    db.collection(EXAM_COLLECTION).orderBy('timestamp', 'desc').limit(1).get().then(snap => {
        if (!snap.empty) {
            const data = snap.docs[0].data();
            const val = data.net;
            // Update UI
            const displays = document.querySelectorAll('.result-value');
            displays.forEach(d => d.innerText = val.toFixed(2));
        }
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Check last tab
    const lastTab = localStorage.getItem('mbsinav_current_tab');
    if (lastTab) {
        switchTab(lastTab);
    } else {
        switchTab('home');
    }

    // Register Service Worker (PWA Memory)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Error:', err));
    }

    // Load Data
    if (typeof firebase !== 'undefined') {
        loadStats();
    }
});
