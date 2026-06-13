// Interfaz para receta de la API
export interface Receta {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strInstructions?: string;
  strArea?: string;
  [key: string]: string | undefined; // Para ingredientes y medidas
}


export interface Categoria {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface Favorito {
  id: string;
  idMeal: string;
  nombre: string;
  imagenUrl: string;
  fotoUsuario?: string; 
  fechaAgregado: Date;
}


export type RootStackParamList = {
  Home: undefined;
  Detail: { idMeal: string };
  Favorites: undefined;
};