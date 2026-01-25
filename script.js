
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

// 3. Calculator
function calculateNet() {
    // Get all inputs
    const inps = document.querySelectorAll('#tab-exam input');
    let totalNet = 0;

    // Simple logic: (Correct - Wrong/4)
    // We assume pairs of (Correct, Wrong) inputs in order
    // This is a naive implementation for demo, robust one needs IDs

    for (let i = 0; i < inps.length; i += 2) {
        const correct = parseFloat(inps[i].value) || 0;
        const wrong = parseFloat(inps[i + 1].value) || 0;
        totalNet += correct - (wrong / 4);
    }

    const resDisplay = document.querySelector('#tab-exam .result-value');
    if (resDisplay) {
        // Animate count up
        let start = 0;
        const duration = 1000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);

            const currentVal = start + (totalNet - start) * ease;
            resDisplay.innerText = currentVal.toFixed(2);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }
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
});
