const puppeteer = require('puppeteer-core');

async function scrapeMatches() {
    console.log("🕷️ Starting Scraper...");

    // Launch options optimized for free tier (Render 512MB RAM limit)
    const browser = await puppeteer.launch({
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
        timeout: 60000 // Increase launch timeout
    });

    const matches = [];

    try {
        const page = await browser.newPage();

        // Block unnecessary resources to save bandwidth/time
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // 1. ATTEMPT REAL SCRAPING (BBC Football)
        console.log("🔍 Navigating to BBC Sport...");
        try {
            await page.goto('https://www.bbc.com/sport/football/scores-fixtures', { waitUntil: 'domcontentloaded', timeout: 30000 }); // 30s timeout

            const scrapedGames = await page.evaluate(() => {
                const games = [];
                // Simplified Selector Strategy for Demo:
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
                return games.slice(0, 5); // Limit to 5 real matches to safe
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
        } catch (realScrapeErr) {
            console.warn("⚠️ Real scraping attempt failed (or timeout). Proceeding to Fallback.", realScrapeErr.message);
        }

        // 2. IF NO MATCHES (or to ensure we have data), ADD FALLBACK DATA
        if (matches.length === 0) {
            console.log("⚠️ Using Robust Fallback Data.");
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
                    matchTime: new Date(today.getTime() + 7200000).toISOString() // +2h
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
                    matchTime: new Date(today.getTime() + 3600000).toISOString() // +1h
                }
            );
        }

    } catch (error) {
        console.error("❌ Scraper Critical Error:", error);
    } finally {
        if (browser) await browser.close();
    }

    console.log(`✅ Total Matches Returned: ${matches.length}`);
    return matches;
}

module.exports = { scrapeMatches };
