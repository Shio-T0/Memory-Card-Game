# Memory Card Game — Implementation Plan

## Status: Core game built, needs Firebase setup + real images

## What's Done
- [x] Project structure created
- [x] `index.html` — name entry + theme selection (food / monument)
- [x] `game.html` + `js/game.js` — 3x4 card grid, flip logic, match checking, timer, +3s penalty on wrong match, checkmark + name shown on match
- [x] `scoreboard.html` + `js/scoreboard.js` — teacher-password-protected live scoreboard (food, monument, combined), clear scores button
- [x] `css/style.css` — mobile-first responsive design, card flip animations
- [x] `js/firebase-config.js` — configured with project `classroom-memory-game`
- [x] `texts_names.json` — 6 foods + 6 monuments with names and descriptions
- [x] Placeholder images generated (12 total in `images/`)

## What's Left (TODO)
- [ ] **Firebase Realtime Database**: Go to Firebase Console → `classroom-memory-game` project → Build → Realtime Database → Create Database. Set rules to allow read/write:
  ```json
  {
    "rules": {
      ".read": true,
      ".write": true
    }
  }
  ```
  > Note: For production, tighten these rules. Open rules are fine for a classroom session.

- [ ] **Verify databaseURL**: The config assumes `https://classroom-memory-game-default-rtdb.firebaseio.com`. If the database was created in a different region, update `js/firebase-config.js` with the correct URL from the Firebase Console.

- [ ] **Replace placeholder images**: Replace the colored rectangles in `images/` with real images. Naming convention: `{number}-{theme}.png` (e.g., `1-food.png` = Sushi, `2-monument.png` = Colosseum). See `texts_names.json` for the full mapping.

- [ ] **Host the game**: Either use Firebase Hosting (`firebase init` + `firebase deploy`) or any static hosting (GitHub Pages, Netlify, etc.). Students need to access it from their phones.

- [ ] **Optional: Change teacher password**: Edit `TEACHER_PASSWORD` in `js/scoreboard.js` (currently `teacher123`).

## Architecture
```
Memory-Card-Game/
├── index.html              ← Entry: name + theme picker
├── game.html               ← Game board (3x4 grid)
├── scoreboard.html         ← Teacher live scoreboard
├── texts_names.json        ← Card data (names + descriptions)
├── css/style.css           ← All styles
├── js/
│   ├── firebase-config.js  ← Firebase SDK init
│   ├── game.js             ← Game logic, timer, scoring
│   └── scoreboard.js       ← Live scoreboard with Firebase listeners
└── images/
    ├── 1-food.png ... 6-food.png
    └── 1-monument.png ... 6-monument.png
```

## Game Flow
1. Player enters name → stored in sessionStorage
2. Picks theme (food or monument) → redirected to `game.html?theme=food`
3. 12 cards rendered (6 image + 6 text), shuffled randomly in 3x4 grid
4. Player flips 2 cards: if image matches its text description → matched (checkmark + name appears above board)
5. Wrong match → cards flip back after 0.8s, +3s penalty added to timer
6. All 6 pairs matched → game over, time saved to Firebase Realtime DB under `scores/{theme}`
7. Teacher accesses `scoreboard.html`, enters password, sees live-updating leaderboards
