import React, { useState, useEffect } from 'react';
import { 
  View, ScrollView, Image, Text, TouchableOpacity, 
  StyleSheet, Alert, Dimensions, Modal, Pressable 
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Receta } from '../types';
import { obtenerDetalleReceta } from '../services/api';
import { guardarEnCache, leerDesdeCache } from '../services/storage';
import { agregarFavorito, esFavorito } from '../services/firebase';
import * as ImagePicker from 'expo-image-picker'; // Aquí está lo de la cámara
import { Ionicons } from '@expo/vector-icons';

const anchoPantalla = Dimensions.get('window').width;

type RutaDetalle = RouteProp<RootStackParamList, 'Detail'>;
type NavegacionDetalle = NativeStackNavigationProp<RootStackParamList, 'Detail'>;

interface Props {
  route: RutaDetalle;
  navigation: NavegacionDetalle;
}

export default function DetailScreen({ route }: Props) {
  const { idMeal } = route.params;

  const [receta, setReceta] = useState<Receta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [esFav, setEsFav] = useState(false);
  const [fotoPropia, setFotoPropia] = useState<string | undefined>();
  

  const [mostrarMenu, setMostrarMenu] = useState(false);

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        
        const esta = await esFavorito(idMeal);
        setEsFav(esta);

        // Traer datos de la API
        const datos = await obtenerDetalleReceta(idMeal);
        if (datos) {
          setReceta(datos);
          await guardarEnCache(`detalle_${idMeal}`, datos);
        } else {
          throw new Error('Sin datos');
        }

      } catch (err) {
        
        const guardado = await leerDesdeCache<Receta>(`detalle_${idMeal}`);
        if (guardado) setReceta(guardado);
      } finally {
        setCargando(false);
      }
    };

    cargarTodo();
  }, [idMeal]);

  
  const abrirCamara = async () => {
    setMostrarMenu(false); // Cierro el menú

    
    const permisoCamara = await ImagePicker.requestCameraPermissionsAsync();
    const permisoGaleria = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permisoCamara.granted || !permisoGaleria.granted) {
      Alert.alert('Ojo', 'Necesito permiso para acceder a la cámara y fotos');
      return;
    }

    
    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,    // Permite recortar después
      aspect: [4, 3],         // Formato de la foto
      quality: 0.7            // Calidad para que no pese mucho
    });

    if (!resultado.canceled) {
      setFotoPropia(resultado.assets[0].uri); // Guardo la foto tomada
    }
  };

  
  const abrirGaleria = async () => {
    setMostrarMenu(false); // Cierro el menú

    
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Ojo', 'Necesito permiso para ver tus fotos');
      return;
    }

    
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7
    });

    if (!resultado.canceled) {
      setFotoPropia(resultado.assets[0].uri);
    }
  };

  
  const agregarAFavoritos = async () => {
    if (!receta) return;

    try {
      await agregarFavorito({
        idMeal: receta.idMeal,
        nombre: receta.strMeal,
        imagenUrl: receta.strMealThumb,
        fotoUsuario: fotoPropia // Aquí guardo la foto (sea de cámara o galería)
      });

      setEsFav(true);
      Alert.alert('✅ Listo', 'Se guardó en tus favoritos');

    } catch (err) {
      Alert.alert('❌ Error', 'No se pudo guardar');
    }
  };

  
  const obtenerIngredientes = (datos: Receta) => {
    const lista = [];
    for (let i = 1; i <= 20; i++) {
      const ing = datos[`strIngredient${i}`];
      const cant = datos[`strMeasure${i}`];
      if (ing && ing.trim() !== '') {
        lista.push(`• ${ing} (${cant || 'al gusto'})`);
      }
    }
    return lista;
  };

  if (cargando) {
    return (
      <View style={estilos.cargando}>
        <Text style={{color: '#888'}}>Cargando receta...</Text>
      </View>
    );
  }

  if (!receta) {
    return (
      <View style={estilos.cargando}>
        <Text style={{color: '#d35400'}}>No se pudo cargar la receta</Text>
      </View>
    );
  }

  const ingredientes = obtenerIngredientes(receta);

  return (
    <ScrollView style={estilos.contenedor} showsVerticalScrollIndicator={false}>

      
      <Image 
        source={{ uri: receta.strMealThumb }} 
        style={estilos.imagenPrincipal} 
        resizeMode="cover"
      />

      <View style={estilos.cajaContenido}>

       
        <Text style={estilos.tituloReceta}>{receta.strMeal}</Text>
        <Text style={estilos.categoriaTexto}>{receta.strCategory}  •  {receta.strArea || 'Variado'}</Text>

        
        {fotoPropia && (
          <View style={estilos.cajaFotoUsuario}>
            <Image source={{ uri: fotoPropia }} style={estilos.imagenUsuario} />
            <TouchableOpacity style={estilos.botonQuitar} onPress={() => setFotoPropia(undefined)}>
              <Ionicons name="close-circle" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}

   
        <TouchableOpacity style={estilos.botonFoto} onPress={() => setMostrarMenu(true)}>
          <Ionicons name="camera-outline" size={16} color="#fff" />
          <Text style={estilos.textoBoton}> Tomar o elegir foto</Text>
        </TouchableOpacity>

       
        <TouchableOpacity 
          style={[estilos.botonFav, esFav && estilos.botonFavActivo]} 
          onPress={agregarAFavoritos}
          disabled={esFav}
        >
          <Ionicons name={esFav ? "heart" : "heart-outline"} size={16} color="#fff" />
          <Text style={estilos.textoBoton}>
            {esFav ? ' Ya está en favoritos' : ' Guardar en favoritos'}
          </Text>
        </TouchableOpacity>

       
        <Text style={estilos.subtitulo}>🧾 Ingredientes</Text>
        {ingredientes.map((item, i) => (
          <Text key={i} style={estilos.textoLista}>{item}</Text>
        ))}

        
        <Text style={estilos.subtitulo}>👨‍🍳 Preparación</Text>
        <Text style={estilos.textoInstrucciones}>{receta.strInstructions}</Text>

      </View>

     
      <Modal
        animationType="fade"
        transparent={true}
        visible={mostrarMenu}
        onRequestClose={() => setMostrarMenu(false)}
      >
        <Pressable style={estilos.fondoModal} onPress={() => setMostrarMenu(false)}>
          <View style={estilos.cajaModal}>
            <Text style={estilos.tituloModal}>¿Qué quieres hacer?</Text>

            <TouchableOpacity style={estilos.opcionModal} onPress={abrirCamara}>
              <Ionicons name="camera" size={22} color="#3498db" />
              <Text style={estilos.textoOpcion}> Abrir Cámara</Text>
            </TouchableOpacity>

            <TouchableOpacity style={estilos.opcionModal} onPress={abrirGaleria}>
              <Ionicons name="images" size={22} color="#2ecc71" />
              <Text style={estilos.textoOpcion}> Elegir de la Galería</Text>
            </TouchableOpacity>

            <TouchableOpacity style={estilos.botonCerrar} onPress={() => setMostrarMenu(false)}>
              <Text style={estilos.textoCerrar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </ScrollView>
  );
}


const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#fff'
  },
  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f6f2'
  },
  imagenPrincipal: {
    width: anchoPantalla,
    height: 260
  },
  cajaContenido: {
    padding: 20
  },
  tituloReceta: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d2d2d',
    marginBottom: 4
  },
  categoriaTexto: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15
  },
  cajaFotoUsuario: {
    position: 'relative',
    marginBottom: 12
  },
  imagenUsuario: {
    width: 140,
    height: 140,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF7029'
  },
  botonQuitar: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 15
  },
  botonFoto: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10
  },
  botonFav: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20
  },
  botonFavActivo: {
    backgroundColor: '#27ae60'
  },
  textoBoton: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d2d2d',
    marginTop: 15,
    marginBottom: 8
  },
  textoLista: {
    fontSize: 15,
    color: '#444',
    marginBottom: 3,
    paddingLeft: 5
  },
  textoInstrucciones: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    textAlign: 'justify'
  },

  //camara estilos
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cajaModal: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  tituloModal: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  opcionModal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  textoOpcion: {
    fontSize: 16,
    color: '#333'
  },
  botonCerrar: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    alignItems: 'center'
  },
  textoCerrar: {
    color: '#666',
    fontWeight: '500'
  }
});