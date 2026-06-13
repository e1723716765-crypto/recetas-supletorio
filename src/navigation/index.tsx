import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';


import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import FavoritesScreen from '../screens/FavoriteScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navegacion() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Mis Recetas' }} 
        />
        <Stack.Screen 
          name="Detail" 
          component={DetailScreen} 
          options={{ title: 'Detalle de Receta' }} 
        />
        <Stack.Screen 
          name="Favorites" 
          component={FavoritesScreen} 
          options={{ title: 'Mis Favoritos' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}