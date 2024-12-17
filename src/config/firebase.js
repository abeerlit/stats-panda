import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAlpW___eY-slh7wVTqxYVeT2F32RrSyzE',
  authDomain: 'statspanda-7aa51.firebaseapp.com',
  projectId: 'statspanda-7aa51',
  storageBucket: 'statspanda-7aa51.appspot.com',
  messagingSenderId: '7301509608',
  appId: '1:7301509608:web:bc0b200d50ae428912f45d',
  measurementId: 'G-DFZ8C4X0EG',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('Firebase initialized');

export { db };
