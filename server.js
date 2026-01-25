const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, '/')));

// Handle all routes by serving index.html (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- THE BOT (Keep-Alive System) ---
// This keeps the Render Free Tier active by pinging itself.
// User specific URL: https://mbsinav.onrender.com
const MY_URL = 'https://mbsinav.onrender.com';

function startKeepAlive() {
    console.log(`[BOT] Keep-Alive system started for: ${MY_URL}`);

    setInterval(async () => {
        try {
            console.log(`[BOT] Pinging ${MY_URL} to stay awake...`);
            const response = await fetch(MY_URL);

            if (response.ok) {
                console.log(`[BOT] Ping successful! Status: ${response.status}`);
            } else {
                console.warn(`[BOT] Ping returned status: ${response.status}`);
            }
        } catch (error) {
            console.error(`[BOT] Ping failed:`, error.message);
        }
    }, 1 * 60 * 1000); // Ping every 1 minute (Aggressive mode)
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Start the bot only if we are in production (or force it)
    // On Render, NODE_ENV is usually 'production'
    startKeepAlive();
});
