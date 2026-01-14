# StreamFY - Deployment & Setup Guide

## 1. Firebase Setup (Database & Auth)

1.  **Create Project**: Go to [content-firebase-console](https://console.firebase.google.com/) and create a new project (e.g., `streamfy-app`).
2.  **Firestore Database**:
    *   Navigate to **Build > Firestore Database**.
    *   Click **Create Database**.
    *   Choose a location (e.g., `nam5 (us-central)`).
    *   Start in **Test mode** (or Production mode, we will update rules later).
3.  **Authentication**:
    *   Navigate to **Build > Authentication**.
    *   Click **Get Started**.
    *   Enable **Email/Password** provider.
    *   Create an initial Admin user manually in the "Users" tab (e.g., `admin@streamfy.com` / `password123`).
4.  **Admin SDK (Service Account for Backend)**:
    *   Go to **Project Settings > Service accounts**.
    *   Click **Generate new private key**.
    *   Save this JSON file. You will need its content for the Backend `FIREBASE_SERVICE_ACCOUNT` variable.
5.  **Web App Config (For Frontend)**:
    *   Go to **Project Settings > General**.
    *   Click the **</>** icon to add a web app.
    *   Copy the `firebaseConfig` object (apiKey, authDomain, etc.).
    *   **ACTION**: Paste this config into `frontend/js/firebase-config.js`.

---

## 2. Backend Deployment (Railway)

1.  **Push to GitHub**:
    *   Initialize a git repo in the `streamfy` folder.
    *   Commit all files.
    *   Push to a new GitHub repository.
2.  **Create Railway Project**:
    *   Go to [Railway](https://railway.app/).
    *   Click **New Project > Deploy from GitHub repo**.
    *   Select your `streamfy` repository.
3.  **Configure Service**:
    *   Railway will likely detect the `backend` folder or `package.json`. If it tries to deploy the root, you might need to configure the "Root Directory" in service settings to `/backend`.
4.  **Environment Variables**:
    *   In Railway Service Settings, go to **Variables**.
    *   Add `FIREBASE_SERVICE_ACCOUNT`: Paste the **MINIFIED JSON string** of the service account key you eventually downloaded in Step 1.4.
    *   (Optional) Add `PORT`: `3000`.
5.  **Build & Deploy**:
    *   Railway should automatically install dependencies (`npm install`) and start the server (`npm start`).
6.  **Verify**:
    *   Check the Deploy Logs. You should see "StreamFY Backend Service is Running" and "Firebase Admin Initialized Successfully".

---

## 3. Frontend Deployment (Netlify)

1.  **Create Netlify Site**:
    *   Go to [Netlify](https://www.netlify.com/).
    *   Click **Add new site > Import from Git**.
    *   Select the same GitHub repo.
2.  **Build Settings**:
    *   **Base directory**: `frontend`
    *   **Publish directory**: `frontend` (since it's static HTML/JS, we just serve the folder).
    *   **Build command**: (Leave empty).
3.  **Deploy**:
    *   Click **Deploy Site**.
4.  **Verify**:
    *   Visit the generated URL. You should see the Landing Page.
    *   Go to `/admin.html` to log in with the user you created in Step 1.3.

---

## 4. Testing the Flow

1.  **Add a Match (Admin)**: Log in to the Admin Panel and add a match manually.
2.  **Check Home Page**: Go to the main site; the match should appear.
3.  **Check Stream**: Click the match card; the stream page should load.
4.  **Backend Scraper**: The backend is scheduled to run every 10 minutes. Check Railway logs to see it saying "Scraped X matches". (Update `scraper.js` with real logic to actually scrape data).
