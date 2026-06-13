import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Receta } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavegacionProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  receta: Receta;
}

export default function RecipeItem({ receta }: Props) {
  const navegacion = useNavigation<NavegacionProp>();

  return (
    <TouchableOpacity 
      style={styles.contenedor}
      onPress={() => navegacion.navigate('Detail', { idMeal: receta.idMeal })}
    >
      <Image 
        source={{ uri: receta.strMealThumb }} 
        style={styles.imagen}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={2}>{receta.strMeal}</Text>
        <Text style={styles.categoria}>{receta.strCategory}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  imagen: {
    width: 100,
    height: 100
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center'
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  categoria: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  }
});