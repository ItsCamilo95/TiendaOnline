import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 👇 Reemplaza esto con TUS datos (te ayudo a obtenerlos)
const firebaseConfig = {
  apiKey: "AIzaSyAoiI0huynjJLic2SAevp_1JNp5WzFRwYo",
  authDomain: "ecommercevue-e799e.firebaseapp.com",
  projectId: "ecommercevue-e799e",
  storageBucket: "ecommercevue-e799e.firebasestorage.app",
  messagingSenderId: "421073970664",
  appId: "1:421073970664:web:81326cacecb16b1787f05d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Exportamos la base de datos