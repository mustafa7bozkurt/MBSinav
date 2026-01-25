const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Keep-Alive Loop (The "Bot")
// This sends a request to itself every 5 minutes to prevent sleeping if on a platform that supports it (though Render free tier may still sleep if no external traffic)
const keepAliveURL = process.env.RENDER_EXTERNAL_URL; // Render provides this env var
if (keepAliveURL) {
    setInterval(async () => {
        try {
            await fetch(keepAliveURL);
            console.log('Keep-Alive Ping Sent');
        } catch (error) {
            console.error('Keep-Alive Ping Failed:', error);
        }
    }, 5 * 60 * 1000); // 5 Minutes
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
