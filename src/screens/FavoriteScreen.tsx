import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Favorito } from '../types';
import { suscribirFavoritos, eliminarFavorito } from '../services/firebase';
import Loading from '../components/Loading';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [cargando, setCargando] = useState(true);

  // Suscripción 
  useEffect(() => {
    const desuscribir = suscribirFavoritos((datos) => {
      setFavoritos(datos);
      setCargando(false);
    });
    return desuscribir; 
  }, []);

  // Eliminar favorito
  const borrarFavorito = async (id: string) => {
    try {
      await eliminarFavorito(id);
      Alert.alert('Eliminado', 'Receta quitada de favoritos');
    } catch (err) {
      Alert.alert('Error', 'No se pudo eliminar');
    }
  };

  if (cargando) return <Loading />;

  return (
    <View style={styles.contenedor}>
      {favoritos.length === 0 ? (
        <View style={styles.vacio}>
          <Ionicons name="heart-outline" size={60} color="#d1d5db" />
          <Text style={styles.textoVacio}>No tienes recetas favoritas aún</Text>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Image 
                source={{ uri: item.fotoUsuario || item.imagenUrl }} 
                style={styles.imagen} 
              />
              <View style={styles.info}>
                <Text style={styles.nombre} numberOfLines={2}>{item.nombre}</Text>
                <TouchableOpacity onPress={() => borrarFavorito(item.id)}>
                  <Ionicons name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    padding: 15
  },
  vacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textoVacio: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 10
  },
  item: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 2
  },
  imagen: {
    width: 80,
    height: 80
  },
  info: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nombre: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
    marginRight: 10
  }
});