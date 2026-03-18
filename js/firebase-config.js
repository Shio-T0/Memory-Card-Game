const firebaseConfig = {
  apiKey: "AIzaSyBWRsiIWFYSoZJ5N6VGRFcEZf-tKzig2Ac",
  authDomain: "classroom-memory-game.firebaseapp.com",
  databaseURL: "https://classroom-memory-game-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "classroom-memory-game",
  storageBucket: "classroom-memory-game.firebasestorage.app",
  messagingSenderId: "458121634482",
  appId: "1:458121634482:web:7da446cd2f85a99ac6dfab"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
