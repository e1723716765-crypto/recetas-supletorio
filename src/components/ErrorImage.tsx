import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  mensaje: string;
}

export default function ErrorMessage({ mensaje }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.texto}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    padding: 20,
    alignItems: 'center'
  },
  texto: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center'
  }
});