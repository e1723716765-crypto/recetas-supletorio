import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Loading() {
  return (
    <View style={styles.contenedor}>
      <ActivityIndicator size="large" color="#ff6b00" />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  }
});