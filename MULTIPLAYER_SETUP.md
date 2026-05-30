# Multiplayer Tic Tac Toe - Firebase Setup Guide

Your game is now ready for **multiplayer over the internet**! Two players from different locations can play together when deployed on Netlify.

## How It Works

1. **Player 1** creates a game and gets a 6-letter room code
2. **Player 2** enters that code to join the game
3. Moves sync in real-time using Firebase Realtime Database
4. Scores are saved and maintained throughout the session

## Setup Instructions

### Step 1: Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a new project"**
3. Enter a project name (e.g., "TicTacToe")
4. Click **"Create project"** (skip analytics)

### Step 2: Create Realtime Database

1. In Firebase Console, go to **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. Choose location (closest to you)
4. Start in **"Test mode"** (for development)
5. Click **"Enable"**

### Step 3: Get Your Firebase Config

1. Go to **Project Settings** (gear icon)
2. Click **"Your apps"** or scroll to find your web app
3. If no app exists, click **"</>Web"** to create one
4. Copy your config values (you'll see them in a code block)

Example config you'll see:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "myproject.firebaseapp.com",
  databaseURL: "https://myproject.firebaseio.com",
  projectId: "myproject-12345",
  storageBucket: "myproject.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def"
};
```

### Step 4: Add Config to Your Project

1. Open `.env` file in your project root
2. Replace the placeholder values with your Firebase config:
   ```
   REACT_APP_FIREBASE_API_KEY=your_actual_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

### Step 5: Set Database Security Rules (Important!)

1. In Firebase Console, go to **Realtime Database** → **Rules**
2. Replace the rules with this (for development/testing):
   ```json
   {
     "rules": {
       "games": {
         "$gameId": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   ```
3. Click **"Publish"**

⚠️ **For production**, you should add proper authentication and security rules.

### Step 6: Test Locally

1. Save `.env` changes
2. Stop your dev server (Ctrl+C)
3. Run `npm start`
4. Open in two different browser windows/tabs:
   - Window 1: Create a game as "Player 1"
   - Window 2: Join with the room code as "Player 2"
5. Play! Moves should sync in real-time

## Deploy to Netlify

1. Push your code to GitHub
2. Go to [https://netlify.com](https://netlify.com)
3. Click **"New site from Git"**
4. Connect your GitHub repo
5. Set environment variables:
   - Go to **Site settings** → **Build & deploy** → **Environment**
   - Add all 7 Firebase config variables from your `.env`
6. Deploy!

## Troubleshooting

**"Game room not found"**
- Make sure the room code is correct (it's case-insensitive)
- The first player must have created the game first

**Moves not syncing?**
- Check Firebase connection in browser console
- Verify your Firebase credentials in `.env`
- Check Firebase Realtime Database → Rules (should allow read/write)

**Works locally but not on Netlify?**
- Make sure all 7 environment variables are set in Netlify site settings
- Rebuild the site after adding environment variables

## Game Features

✅ Create/Join games with room codes  
✅ Real-time move synchronization  
✅ Score tracking  
✅ Turn indicator (shows whose turn it is)  
✅ Works across different devices/locations  
✅ Auto-detects winner & draws  

Enjoy your multiplayer game! 🎮
