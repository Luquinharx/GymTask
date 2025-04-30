import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC60KEVrIQIen91OPHnZ9IV_LhozfceSvY",
  authDomain: "gyntask.firebaseapp.com",
  projectId: "gyntask",
  storageBucket: "gyntask.firebasestorage.app",
  messagingSenderId: "889424709344",
  appId: "1:889424709344:web:4ced0dd8b7e1dfe2e83285",
  measurementId: "G-33R6WTR9TZ"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
