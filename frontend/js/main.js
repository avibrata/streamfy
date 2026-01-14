import { db } from './firebase-config.js';
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const footballGrid = document.getElementById('football-matches');
const cricketGrid = document.getElementById('cricket-matches');

/**
 * Validates if the current page is the Home Page
 */
if (footballGrid || cricketGrid) {
    loadMatches();
}

async function loadMatches() {
    console.log("Loading matches...");
    // Show loaders if needed or clear content
    if (footballGrid) footballGrid.innerHTML = '<div class="loader"></div>';
    if (cricketGrid) cricketGrid.innerHTML = '<div class="loader"></div>';

    try {
        const matchesRef = collection(db, "matches");
        // Get all matches or filter by date ideally
        // For demo: get all and sort on client or simple query
        const q = query(matchesRef, orderBy("matchTime", "asc"));
        const querySnapshot = await getDocs(q);

        // clear loaders
        if (footballGrid) footballGrid.innerHTML = '';
        if (cricketGrid) cricketGrid.innerHTML = '';

        if (querySnapshot.empty) {
            if (footballGrid) footballGrid.innerHTML = '<p style="color:var(--text-gray)">No matches found today.</p>';
            if (cricketGrid) cricketGrid.innerHTML = '<p style="color:var(--text-gray)">No matches found today.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const match = doc.data();
            const matchId = doc.id;
            const card = createMatchCard(match, matchId);

            if (match.sport === 'football' && footballGrid) {
                footballGrid.appendChild(card);
            } else if (match.sport === 'cricket' && cricketGrid) {
                cricketGrid.appendChild(card);
            } else {
                // Default to football or separate section
                if (footballGrid) footballGrid.appendChild(card);
            }
        });

    } catch (error) {
        console.error("Error fetching matches:", error);
        if (footballGrid) footballGrid.innerHTML = '<p>Error loading matches. Please try again later.</p>';
    }
}

function createMatchCard(match, id) {
    const div = document.createElement('div');
    div.className = 'match-card';
    div.onclick = () => {
        window.location.href = `stream.html?id=${id}`;
    };

    const isLive = match.live ? '<div class="live-indicator">🔴 LIVE</div>' : '';

    // Format Date
    const dateObj = new Date(match.matchTime);
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
        ${isLive}
        <div class="card-header">
            <span class="league-name">${match.league}</span>
        </div>
        <div class="card-body">
            <div class="team">
                <div class="team-logo">${match.teamA.charAt(0)}</div>
                <div class="team-name">${match.teamA}</div>
            </div>
            <div class="vs">VS<br><span style="font-size:0.7em; font-weight:normal">${timeStr}</span></div>
            <div class="team">
                <div class="team-logo">${match.teamB.charAt(0)}</div>
                <div class="team-name">${match.teamB}</div>
            </div>
        </div>
    `;
    return div;
}

// Logic for Streaming Page
const videoElement = document.getElementById('video');

if (videoElement) {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');

    if (matchId) {
        loadStream(matchId);
    } else {
        alert("No match selected!");
        window.location.href = 'index.html';
    }
}

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadStream(id) {
    try {
        const docRef = doc(db, "matches", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const match = docSnap.data();
            document.getElementById('match-title').innerText = `${match.teamA} vs ${match.teamB}`;

            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(match.streamUrl);
                hls.attachMedia(videoElement);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    videoElement.play();
                });
            } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                videoElement.src = match.streamUrl;
                videoElement.addEventListener('loadedmetadata', function () {
                    videoElement.play();
                });
            }
        } else {
            console.log("No such match!");
            document.getElementById('match-title').innerText = "Match Not Found";
        }
    } catch (error) {
        console.error("Error loading stream:", error);
    }
}
