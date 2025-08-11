// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCccDXZj2DeCwq4sP3t80VxCuhdBY8ChNc",
  authDomain: "projetotcc-879a0.firebaseapp.com",
  projectId: "projetotcc-879a0",
  storageBucket: "projetotcc-879a0.firebasestorage.app",
  messagingSenderId: "474983589736",
  appId: "1:474983589736:web:907da1f73b899381a118dd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);