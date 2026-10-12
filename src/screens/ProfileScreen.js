import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const user = auth.currentUser;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
            <Ionicons name="person" size={36} color="#fff" />
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{user?.displayName || 'Technician / Admin'}</Text>
          <Text style={[styles.userEmail, { color: theme.subText }]}>{user?.email || 'user@welec.com'}</Text>
        </View>

        {/* Preferences Section */}
        <Text style={[styles.sectionHeader, { color: theme.subText }]}>PREFERENCES</Text>
        
        <TouchableOpacity 
          style={[styles.row, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
          onPress={toggleTheme}
        >
          <View style={styles.rowLeft}>
            <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={20} color={theme.accent} />
            <Text style={[styles.rowLabel, { color: theme.text }]}>Dark Mode</Text>
          </View>
          <Text style={{ color: theme.subText, fontWeight: 'bold' }}>
            {isDarkMode ? 'ON 🌙' : 'OFF ☀️'}
          </Text>
        </TouchableOpacity>

        {/* Account Actions */}
        <Text style={[styles.sectionHeader, { color: theme.subText, marginTop: 24 }]}>ACCOUNT</Text>
        
        <TouchableOpacity 
          style={[styles.row, { backgroundColor: theme.cardBg, borderColor: '#fca5a5' }]}
          onPress={handleSignOut}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={[styles.rowLabel, { color: '#ef4444' }]}>Sign Out</Text>
          </View>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  userCard: { padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 24 },
  avatar: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { fontSize: 13, marginTop: 4 },
  sectionHeader: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
});