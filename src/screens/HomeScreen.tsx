import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { buscarRecetas, obtenerCategorias, filtrarPorCategoria } from '../services/api';
import { guardarEnCache, leerDesdeCache } from '../services/storage';
import { Receta, Categoria } from '../types';
import RecipeItem from '../components/RecipeItem';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorImage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavegacionProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const [busqueda, setBusqueda] = useState('');
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const navegacion = useNavigation<NavegacionProp>();

  // Cargar categorías 
  useEffect(() => {
    const cargarInicial = async () => {
      try {
       
        const cats = await obtenerCategorias();
        setCategorias(cats);
        
        // Cargar  desde caché
        const recetasCache = await leerDesdeCache<Receta[]>('ultimaBusqueda');
        if (recetasCache) setRecetas(recetasCache);
      } catch (err) {
        setError('No se pudieron cargar los datos iniciales');
      }
    };
    cargarInicial();
  }, []);

  // Buscar 
  const manejarBusqueda = async () => {
    if (!busqueda.trim()) return;
    setCargando(true);
    setError('');
    try {
      const datos = await buscarRecetas(busqueda);
      setRecetas(datos);
      await guardarEnCache('ultimaBusqueda', datos); 
      if (datos.length === 0) setError('No se encontraron recetas');
    } catch (err) {
      setError('Sin conexión o error al buscar. Mostrando datos guardados.');
      // Usar caché si hay error
      const recetasCache = await leerDesdeCache<Receta[]>('ultimaBusqueda');
      if (recetasCache) setRecetas(recetasCache);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar por categoría
  const manejarFiltro = async (categoria: string) => {
    setCategoriaSeleccionada(categoria);
    setCargando(true);
    setError('');
    try {
      const datos = await filtrarPorCategoria(categoria);
      setRecetas(datos);
      await guardarEnCache(`categoria_${categoria}`, datos);
      if (datos.length === 0) setError('No hay recetas en esta categoría');
    } catch (err) {
      setError('Error al filtrar. Cargando datos guardados.');
      const cache = await leerDesdeCache<Receta[]>(`categoria_${categoria}`);
      if (cache) setRecetas(cache);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      {/* Barra de búsqueda */}
      <View style={styles.buscador}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.input}
          placeholder="Buscar receta..."
          value={busqueda}
          onChangeText={setBusqueda}
          onSubmitEditing={manejarBusqueda}
        />
      </View>

      {}
      <TouchableOpacity 
        style={styles.botonFavoritos}
        onPress={() => navegacion.navigate('Favorites')}
      >
        <Ionicons name="heart" size={18} color="white" />
        <Text style={styles.textoBoton}>Mis Favoritos</Text>
      </TouchableOpacity>

      {}
      <FlatList
        horizontal
        data={categorias}
        keyExtractor={(item) => item.idCategory}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoriaItem,
              categoriaSeleccionada === item.strCategory && styles.categoriaActiva
            ]}
            onPress={() => manejarFiltro(item.strCategory)}
          >
            <Text style={styles.categoriaTexto}>{item.strCategory}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={styles.listaCategorias}
      />

      {}
      {cargando ? (
        <Loading />
      ) : error ? (
        <ErrorMessage mensaje={error} />
      ) : (
        <FlatList
          data={recetas}
          keyExtractor={(item) => item.idMeal}
          renderItem={({ item }) => <RecipeItem receta={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: 15
  },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9cbcfc',
    marginBottom: 10
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16
  },
  botonFavoritos: {
    flexDirection: 'row',
    backgroundColor: '#111a02',
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15
  },
  textoBoton: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6
  },
  listaCategorias: {
    maxHeight: 40,
    marginBottom: 10,
    paddingLeft: 15
  },
  categoriaItem: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8
  },
  categoriaActiva: {
    backgroundColor: '#ff6b00'
  },
  categoriaTexto: {
    color: '#1f2937',
    fontWeight: '500'
  }
});