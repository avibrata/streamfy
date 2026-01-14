const puppeteer = require('puppeteer-core');

async function scrapeMatches() {
    console.log("🕷️ Starting Scraper...");
    let browser = null;
    const matches = [];

    // 1. ATTEMPT REAL SCRAPING
    try {
        // Launch options optimized for free tier
        browser = await puppeteer.launch({
            headless: "new",
            ignoreHTTPSErrors: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--disable-software-rasterizer',
                '--disable-extensions',
                '--mute-audio'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
            timeout: 30000
        });

        const page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log("🔍 Navigating to BBC Sport...");
        await page.goto('https://www.bbc.com/sport/football/scores-fixtures', { waitUntil: 'domcontentloaded', timeout: 25000 });

        const scrapedGames = await page.evaluate(() => {
            const games = [];
            const articles = document.querySelectorAll('article');
            articles.forEach(art => {
                const teams = art.querySelectorAll('h3, .sp-c-fixture__team-name');
                if (teams.length >= 2) {
                    games.push({
                        teamA: teams[0].innerText,
                        teamB: teams[1].innerText,
                        league: "BBC Fixture"
                    });
                }
            });
            return games.slice(0, 5);
        });

        if (scrapedGames.length > 0) {
            console.log(`✅ scraped ${scrapedGames.length} real matches from BBC.`);
            scrapedGames.forEach(game => {
                matches.push({
                    sport: "football",
                    league: game.league,
                    teamA: game.teamA,
                    teamB: game.teamB,
                    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                    live: false,
                    matchTime: new Date().toISOString()
                });
            });
        }

    } catch (error) {
        console.error("⚠️ Scraper Engine Failed (Likely Low RAM or Timeout). Switching to Mock Data.", error.message);
        // We catch the error so the server process doesn't die. 
        // We proceed to the fallback block below.
    } finally {
        if (browser) {
            try { await browser.close(); } catch (e) { }
        }
    }

    // 2. FALLBACK / MOCK DATA
    if (matches.length === 0) {
        console.log("⚠️ Using Robust Fallback Data (Guaranteed Matches).");
        const today = new Date();

        matches.push(
            {
                sport: "football",
                league: "Premier League",
                teamA: "Man City",
                teamB: "Arsenal",
                streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                live: true,
                matchTime: today.toISOString()
            },
            {
                sport: "football",
                league: "La Liga",
                teamA: "Real Madrid",
                teamB: "Barcelona",
                streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                live: false,
                matchTime: new Date(today.getTime() + 7200000).toISOString()
            },
            {
                sport: "cricket",
                league: "T20 World Cup",
                teamA: "India",
                teamB: "Australia",
                streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                live: true,
                matchTime: today.toISOString()
            },
            {
                sport: "cricket",
                league: "IPL",
                teamA: "CSK",
                teamB: "Mumbai Indians",
                streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                live: false,
                matchTime: new Date(today.getTime() + 3600000).toISOString()
            }
        );
    }

    console.log(`✅ Total Matches Returning to DB: ${matches.length}`);
    return matches;
}

module.exports = { scrapeMatches };
