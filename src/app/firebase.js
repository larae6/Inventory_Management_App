import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyCAe9JML1s13VnFYLsyzm9OHr6QsdBBfK8",
    authDomain: "pantry-tracker-6856d.firebaseapp.com",
    projectId: "pantry-tracker-6856d",
    storageBucket: "pantry-tracker-6856d.appspot.com",
    messagingSenderId: "440243955860",
    appId: "1:440243955860:web:75fccafeb4639fd614ac81",
    measurementId: "G-3SG3Y3W7Q9"
  };
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };