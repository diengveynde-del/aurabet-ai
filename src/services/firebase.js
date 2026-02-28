import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  getAuth,
  signInWithPhoneNumber,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const firebaseStatus = {
  configured: hasFirebaseConfig,
  appId: import.meta.env.VITE_APP_ID || 'aurabet',
};

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const initInvisibleRecaptcha = (containerId = 'recaptcha-container') =>
  new RecaptchaVerifier(auth, containerId, { size: 'invisible' });

export const startPhoneSignIn = (phoneNumber, appVerifier) => signInWithPhoneNumber(auth, phoneNumber, appVerifier);

export const userProfileRef = ({ appId = firebaseStatus.appId, userId }) =>
  doc(db, 'artifacts', appId, 'users', userId, 'private', 'profile');

export const upsertProfile = async ({ appId = firebaseStatus.appId, userId, profile }) => {
  const profileRef = userProfileRef({ appId, userId });
  await setDoc(
    profileRef,
    {
      ...profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};
