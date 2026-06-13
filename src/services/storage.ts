import { Receta } from '../types';

import AsyncStorage from '@react-native-async-storage/async-storage';


export const guardarEnCache = async (clave: string, datos: Receta[] | Receta) => {
  try {
    const texto = JSON.stringify(datos);
    await AsyncStorage.setItem(`@MisRecetas:${clave}`, texto);
    console.log("✅ Guardado en caché correctamente");
  } catch (error) {
   
    console.log("❌ Error al guardar en caché:", error);
  }
};


export const leerDesdeCache = async <T>(clave: string): Promise<T | null> => {
  try {
    const texto = await AsyncStorage.getItem(`@MisRecetas:${clave}`);
    return texto ? (JSON.parse(texto) as T) : null;
  } catch (error) {
    console.log("❌ Error al leer caché:", error);
    return null;
  }
};

export const limpiarCache = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.log("❌ Error al limpiar:", error);
  }
};