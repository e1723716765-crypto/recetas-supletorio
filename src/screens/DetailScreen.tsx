import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Receta } from '../types';
import { obtenerDetalleReceta } from '../services/api';
import { guardarEnCache, leerDesdeCache } from '../services/storage';
import { agregarFavorito, esFavorito } from '../services/firebase';
import * as ImagePicker from 'expo-image-picker';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorImage';
import { Ionicons } from '@expo/vector-icons';

type DetalleRutaProp = RouteProp<RootStackParamList, 'Detail'>;
type DetalleNavegacionProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;

interface Props {
  route: DetalleRutaProp;
  navigation: DetalleNavegacionProp;
}

export default function DetailScreen({ route }: Props) {
  const { idMeal } = route.params;
  const [receta, setReceta] = useState<Receta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [yaEsFavorito, setYaEsFavorito] = useState(false);
  const [fotoUsuario, setFotoUsuario] = useState<string | undefined>();

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        // Verificar si es favorito
        const favorito = await esFavorito(idMeal);
        setYaEsFavorito(favorito);

        // Cargar desde API o caché
        const datos = await obtenerDetalleReceta(idMeal);
        if (datos) {
          setReceta(datos);
          await guardarEnCache(`detalle_${idMeal}`, datos);
        } else {
          throw new Error('No se encontró la receta');
        }
      } catch (err) {
        setError('Error al cargar. Mostrando datos guardados.');
        const cache = await leerDesdeCache<Receta>(`detalle_${idMeal}`);
        if (cache) setReceta(cache);
      } finally {
        setCargando(false);
      }
    };
    cargarDetalle();
  }, [idMeal]);

  // Seleccionar imagen 
  const seleccionarImagen = async () => {
    // permisos
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7
    });

    if (!resultado.canceled && resultado.assets[0].uri) {
      setFotoUsuario(resultado.assets[0].uri);
    }
  };

  // Agregar favoritos
  const agregarAFavoritos = async () => {
  if (!receta) return;

  try {
    await agregarFavorito({
      idMeal: receta.idMeal,
      nombre: receta.strMeal,
      imagenUrl: receta.strMealThumb,
      
      fotoUsuario: fotoUsuario ? fotoUsuario : undefined
    });

    setYaEsFavorito(true);
    Alert.alert('✅ Éxito', 'Receta agregada a favoritos');

  } catch (err: any) {
    console.log("❌ ERROR:", err);
    Alert.alert('❌ Error', 'No se pudo agregar');
  }
};

  // Extraer ingredientes
  const obtenerIngredientes = (receta: Receta) => {
    const ingredientes = [];
    for (let i = 1; i <= 20; i++) {
      const ing = receta[`strIngredient${i}`];
      const med = receta[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredientes.push(`${ing} - ${med || 'al gusto'}`);
      }
    }
    return ingredientes;
  };

  if (cargando) return <Loading />;
  if (error && !receta) return <ErrorMessage mensaje={error} />;
  if (!receta) return <ErrorMessage mensaje="Receta no encontrada" />;

  const ingredientes = obtenerIngredientes(receta);

  return (
    <ScrollView style={styles.contenedor} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: receta.strMealThumb }} style={styles.imagen} />
      
      <View style={styles.cuerpo}>
        <Text style={styles.titulo}>{receta.strMeal}</Text>
        <Text style={styles.categoria}>{receta.strCategory}</Text>

        {}
        {fotoUsuario && (
          <Image source={{ uri: fotoUsuario }} style={styles.fotoUsuario} />
        )}
        <TouchableOpacity style={styles.botonImagen} onPress={seleccionarImagen}>
          <Ionicons name="camera" size={18} color="white" />
          <Text style={styles.textoBoton}>Agregar foto propia</Text>
        </TouchableOpacity>

        {}
        <TouchableOpacity 
          style={[styles.botonFavorito, yaEsFavorito && styles.botonFavoritoActivo]} 
          onPress={agregarAFavoritos}
          disabled={yaEsFavorito}
        >
          <Ionicons name="heart" size={18} color="white" />
          <Text style={styles.textoBoton}>
            {yaEsFavorito ? 'Ya está en favoritos' : 'Agregar a favoritos'}
          </Text>
        </TouchableOpacity>

        {}
        <Text style={styles.subtitulo}>Ingredientes:</Text>
        {ingredientes.map((ing, i) => (
          <Text key={i} style={styles.ingrediente}>• {ing}</Text>
        ))}

        {}
        <Text style={styles.subtitulo}>Instrucciones:</Text>
        <Text style={styles.instrucciones}>{receta.strInstructions}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: 'white'
  },
  imagen: {
    width: '100%',
    height: 250
  },
  cuerpo: {
    padding: 20
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  categoria: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 15
  },
  fotoUsuario: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 10
  },
  botonImagen: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  botonFavorito: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  botonFavoritoActivo: {
    backgroundColor: '#10b981'
  },
  textoBoton: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 15
  },
  ingrediente: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 3
  },
  instrucciones: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    textAlign: 'justify'
  }
});