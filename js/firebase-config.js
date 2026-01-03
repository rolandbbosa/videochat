// Firebase configuration - Replace with your own Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyBrIcWjuJ62Ni1M3ds963R6sj-PAU59wvQ",
    authDomain: "videochat-d857b.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "videochat-d857b",
    storageBucket: "videochat-d857b.firebasestorage.app",
    messagingSenderId: "602319735026",
    appId: "1:602319735026:web:11b8524bb2d592ae25686b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();