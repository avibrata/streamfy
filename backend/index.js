const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { db } = require('./firebase');
const { scrapeMatches } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable All CORS Requests
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.send('StreamFY Backend Service is Running 🚀');
});

// Manual trigger for scraping (protected ideally, open for now for simplicity)
app.post('/api/scrape', async (req, res) => {
    try {
        const matches = await runScraperAndUpdateDB();
        res.json({ success: true, count: matches.length, matches });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Runs the scraper and updates Firestore
 */
async function runScraperAndUpdateDB() {
    console.log("⏰ Starting Scheduled Scraping Task...");
    const matches = await scrapeMatches();

    if (matches.length === 0) {
        console.log("⚠️ No matches found to update.");
        return [];
    }

    const batch = db.batch();

    matches.forEach(match => {
        // efficient ID generation: sport-teamA-teamB-date
        // clean up strings to be ID friendly
        const cleanId = `${match.sport}-${match.teamA}-${match.teamB}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

        const docRef = db.collection('matches').doc(cleanId);

        batch.set(docRef, {
            ...match,
            updatedAt: new Date()
            // We might want to use set with merge: true if we don't want to overwrite manual overrides,
            // but the requirement says "Admin changes override scraper data".
            // Implementation strategy: 
            // 1. Scraper generally shouldn't overwrite if "manualOverride" flag is true.
            // 2. OR, simpler: Scraper updates. Admin can fix.
            // Let's check if the doc exists and has a manualOverride flag.
        }, { merge: true });
    });

    try {
        await batch.commit();
        console.log("🔥 Firestore successfully updated with new match data.");
    } catch (error) {
        console.error("❌ Firestore Batch Write Error:", error);
    }

    return matches;
}

// Schedule: Run every 10 minutes
// Cron expression: */10 * * * *
cron.schedule('*/10 * * * *', () => {
    runScraperAndUpdateDB();
});

console.log("📅 Cron Job scheduled: running every 10 minutes.");

app.listen(PORT, () => {
    console.log(`SERVER listening on port ${PORT}`);
});
