import { db, auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginForm = document.getElementById('login-form');
const adminContent = document.getElementById('admin-content');
const loginContainer = document.getElementById('login-container');
const addMatchForm = document.getElementById('add-match-form');
const matchesList = document.getElementById('admin-matches-list');

// Auth Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (loginContainer) loginContainer.style.display = 'none';
        if (adminContent) {
            adminContent.style.display = 'block';
            loadAdminMatches();
        }
    } else {
        if (loginContainer) loginContainer.style.display = 'block';
        if (adminContent) adminContent.style.display = 'none';
    }
});

// Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert("Login Failed: " + error.message);
        }
    });
}

// Logout
window.logout = () => {
    signOut(auth);
};

// Add Match
if (addMatchForm) {
    addMatchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newMatch = {
            sport: addMatchForm.sport.value,
            league: addMatchForm.league.value,
            teamA: addMatchForm.teamA.value,
            teamB: addMatchForm.teamB.value,
            streamUrl: addMatchForm.streamUrl.value,
            matchTime: addMatchForm.matchTime.value,
            live: addMatchForm.live.checked,
            createdAt: new Date().toISOString()
        };

        try {
            // We use a custom ID or let Firebase generate one
            // Ideally we stick to the backend convention if possible, but auto-ID is fine for manual adds
            await addDoc(collection(db, "matches"), newMatch);
            addMatchForm.reset();
            loadAdminMatches();
            alert("Match Added Successfully");
        } catch (error) {
            console.error("Error adding match: ", error);
            alert("Error adding match");
        }
    });
}

async function loadAdminMatches() {
    matchesList.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, "matches"));

    querySnapshot.forEach((docSnap) => {
        const match = docSnap.data();
        const id = docSnap.id;

        const div = document.createElement('div');
        div.className = 'match-item';
        div.style.border = "1px solid #444";
        div.style.padding = "10px";
        div.style.marginBottom = "10px";
        div.style.background = "#222";
        div.style.display = "flex";
        div.style.justifyButton = "space-between";
        div.style.alignItems = "center";

        div.innerHTML = `
            <div style="flex-grow:1">
                <strong>${match.teamA} vs ${match.teamB}</strong> (${match.league})<br>
                <small>${match.matchTime} | Live: ${match.live}</small>
            </div>
            <div>
                <button onclick="toggleLive('${id}', ${match.live})" class="btn" style="padding:5px 10px; font-size:0.8rem; background:${match.live ? 'orange' : 'green'}">${match.live ? 'Stop Live' : 'Go Live'}</button>
                <button onclick="deleteMatch('${id}')" class="btn" style="padding:5px 10px; font-size:0.8rem; background:red; margin-left:5px">Delete</button>
            </div>
        `;
        matchesList.appendChild(div);
    });
}

window.deleteMatch = async (id) => {
    if (confirm("Are you sure?")) {
        await deleteDoc(doc(db, "matches", id));
        loadAdminMatches();
    }
};

window.toggleLive = async (id, currentStatus) => {
    await updateDoc(doc(db, "matches", id), {
        live: !currentStatus
    });
    loadAdminMatches();
};

window.triggerScraper = async () => {
    if (!confirm("Force backend to scrape/generate matches now? This replaces current scraper data.")) return;

    // REPLACE WITH YOUR ACTUAL RENDER BACKEND URL
    // e.g., https://streamfy-backend.onrender.com/api/scrape
    // For now, we prompt the user or hardcode it if known. 
    const backendUrl = prompt("Enter your Render Backend URL (without /api/scrape):", "https://streamfy-zhv1.onrender.com");
    if (!backendUrl) return;

    try {
        const res = await fetch(`${backendUrl}/api/scrape`, { method: 'POST' });
        const data = await res.json();
        alert(`Scraper Success! Matches found: ${data.count}`);
        loadAdminMatches();
    } catch (err) {
        alert("Error syncing: " + err.message);
    }
}
