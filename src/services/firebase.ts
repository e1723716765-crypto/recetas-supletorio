import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  onSnapshot, 
  where 
} from 'firebase/firestore';
import { Favorito } from '../types';


const firebaseConfig = {
  apiKey: "AIzaSyBdZkH0yfH9xQZbX7yLmR8wQeT9vY7uI8aS",
  authDomain: "species-app-13fcb.firebaseapp.com",
  projectId: "species-app-13fcb",
  storageBucket: "species-app-13fcb.appspot.com",
  messagingSenderId: "983445679288",
  appId: "1:983445679288:web:41f8a01e2cb8709c8e184d"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 

const COLECCION_FAVORITOS = 'favoritos';


export const agregarFavorito = async (favorito: Omit<Favorito, 'id' | 'fechaAgregado'>) => {
  try {
    const datosAGuardar: any = {
      idMeal: favorito.idMeal,
      nombre: favorito.nombre,
      imagenUrl: favorito.imagenUrl,
      fechaAgregado: new Date()
    };

   
    if (favorito.fotoUsuario) {
      datosAGuardar.fotoUsuario = favorito.fotoUsuario;
    }

    const docRef = await addDoc(collection(db, COLECCION_FAVORITOS), datosAGuardar);
    console.log("✅ FAVORITO GUARDADO:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("❌ ERROR FIREBASE:", error.code, error.message);
    throw error;
  }
};

export const obtenerFavoritos = async (): Promise<Favorito[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLECCION_FAVORITOS));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Favorito[];
  } catch (error) {
    console.error("❌ ERROR AL LEER:", error);
    throw error;
  }
};

export const eliminarFavorito = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLECCION_FAVORITOS, id));
  } catch (error) {
    console.error("❌ ERROR AL ELIMINAR:", error);
    throw error;
  }
};

export const esFavorito = async (idMeal: string): Promise<boolean> => {
  try {
    const q = query(collection(db, COLECCION_FAVORITOS), where('idMeal', '==', idMeal));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("❌ ERROR AL VERIFICAR:", error);
    return false;
  }
};

export const suscribirFavoritos = (callback: (favoritos: Favorito[]) => void) => {
  return onSnapshot(collection(db, COLECCION_FAVORITOS), (snapshot) => {
    const datos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Favorito[];
    callback(datos);
  });
};