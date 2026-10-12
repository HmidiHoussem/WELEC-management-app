import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📅 Job Scheduling Calendar</Text>
      <Text style={styles.subtext}>Coming in Phase 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold' },
  subtext: { color: '#94a3b8', fontSize: 14, marginTop: 8 },
});