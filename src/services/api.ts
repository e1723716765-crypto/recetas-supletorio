import axios from 'axios';
import { Receta, Categoria } from '../types';

// Crear instancia de Axios con la URL base
const api = axios.create({
  baseURL: 'https://www.themealdb.com/api/json/v1/1',
  timeout: 10000, 
});


export const buscarRecetas = async (nombre: string): Promise<Receta[]> => {
  try {
    const respuesta = await api.get('/search.php', {
      params: { s: nombre }
    });

    if (!respuesta.data.meals) return []; // Sin resultados
    return respuesta.data.meals as Receta[];

  } catch (error) {
    throw error; 
  }
};


export const obtenerDetalleReceta = async (id: string): Promise<Receta | null> => {
  try {
    const respuesta = await api.get('/lookup.php', {
      params: { i: id }
    });

    return respuesta.data.meals ? (respuesta.data.meals[0] as Receta) : null;

  } catch (error) {
    throw error;
  }
};


export const obtenerCategorias = async (): Promise<Categoria[]> => {
  try {
    const respuesta = await api.get('/categories.php');
    return respuesta.data.categories as Categoria[];

  } catch (error) {
    throw error;
  }
};


export const filtrarPorCategoria = async (categoria: string): Promise<Receta[]> => {
  try {
    const respuesta = await api.get('/filter.php', {
      params: { c: categoria }
    });

    return respuesta.data.meals ? (respuesta.data.meals as Receta[]) : [];

  } catch (error) {
    throw error;
  }
};