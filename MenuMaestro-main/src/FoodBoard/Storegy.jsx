import { initializeApp, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCdGCsFCvfwgJg23ToUNl8KpEiGM41fotY",
  authDomain: "fooddata-4ddda.firebaseapp.com",
  databaseURL: "https://fooddata-4ddda-default-rtdb.firebaseio.com",
  projectId: "fooddata-4ddda",
  storageBucket: "fooddata-4ddda.appspot.com",
  messagingSenderId: "216874707741",
  appId: "1:216874707741:web:ebcb269baea2880e698ff4"
};

// Check if Firebase app is already initialized
let app;
try {
  app = getApp();
} catch (e) {
  app = initializeApp(firebaseConfig);
}


export { app };
