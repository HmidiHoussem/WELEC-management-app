import React from 'react';
import { View, StyleSheet } from 'react-native';
import ClientsScreen from './ClientsScreen';

export default function CRMScreen() {
  return (
    <View style={styles.container}>
      <ClientsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
});