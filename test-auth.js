import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function run() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, "admin@rgamerai.com", "Rgamer@2026");
    console.log("SUCCESS! User created:", userCredential.user.uid);
  } catch (error) {
    console.log("ERROR:", error.code, error.message);
  }
}
run();
