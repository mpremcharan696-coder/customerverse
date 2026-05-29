import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyB-3u_10pQWLj6HE9-nTEkYu-z4bs3zyL8",
  authDomain: "auth-f826f.firebaseapp.com",
  projectId: "auth-f826f",
  storageBucket: "auth-f826f.firebasestorage.app",
  messagingSenderId: "888053285644",
  appId: "1:888053285644:web:1aac406ab14eaeabe7bf29",
  measurementId: "G-2EQ1H7NRFX"
}

const app = initializeApp(firebaseConfig)

export const auth            = getAuth(app)
export const googleProvider  = new GoogleAuthProvider()
export const facebookProvider = new FacebookAuthProvider()
