import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCImhr_OVwmMses70nZkCOde-SQl8H1NtY",
  authDomain: "fordb-e91e7.firebaseapp.com",
  databaseURL: "https://fordb-e91e7-default-rtdb.firebaseio.com",
  projectId: "fordb-e91e7",
  storageBucket: "fordb-e91e7.firebasestorage.app",
  messagingSenderId: "57021230060",
  appId: "1:57021230060:web:e477918d8b407a39912ec9",
  measurementId: "G-PG67KBQ1RE"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
