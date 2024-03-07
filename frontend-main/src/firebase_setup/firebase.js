import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
    apiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
    authDomain: "drone-location-389204.firebaseapp.com",
    databaseURL: "https://drone-location-389204-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "drone-location-389204",
    storageBucket: "drone-location-389204.appspot.com",
    messagingSenderId: "163807353912",
    appId: "1:163807353912:web:bb7e9008e28b2199421acd",
    measurementId: "G-DB952HL7DK"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database;