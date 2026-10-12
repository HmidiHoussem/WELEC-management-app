import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, SafeAreaView, Image } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your professional email and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={[styles.themeToggleBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]} 
          onPress={toggleTheme}
        >
          <Ionicons name={isDarkMode ? "sunny" : "moon"} size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View style={[styles.logoContainer, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Image
            source={require('../../assets/images/logo WELEC.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.subText }]}>Sign in to manage operations & invoices</Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
          placeholder="Professional Email"
          placeholderTextColor={theme.placeholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Password Input with Vector Eye Icon */}
        <View style={[styles.passwordContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TextInput
            style={[styles.passwordInput, { color: theme.text }]}
            placeholder="Password"
            placeholderTextColor={theme.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color={theme.subText} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
  themeToggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  formContainer: { flex: 1, justifyContent: 'center', maxWidth: 400, width: '100%', alignSelf: 'center' },
  logoContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  logoImage: { width: 180, height: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 13, marginBottom: 24, textAlign: 'center' },
  input: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 10, marginBottom: 16, fontSize: 15, borderWidth: 1 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, marginBottom: 20, borderWidth: 1, paddingRight: 12 },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  eyeBtn: { padding: 8 },
  button: { paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});

// import React, { useState } from 'react';
// import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, SafeAreaView, Image } from 'react-native';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../config/firebase';
// import { darkTheme, lightTheme } from '../../constants/theme';

// export default function LoginScreen() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert('Error', 'Please enter your professional email and password.');
//       return;
//     }

//     setLoading(true);
//     try {
//       await signInWithEmailAndPassword(auth, email.trim(), password);
//     } catch (error) {
//       Alert.alert('Authentication Failed', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const theme = isDarkMode ? darkTheme : lightTheme;

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
//       {/* Dark / Light Mode Switcher */}
//       <View style={styles.headerRow}>
//         <TouchableOpacity 
//           style={[styles.themeToggleBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]} 
//           onPress={() => setIsDarkMode(!isDarkMode)}
//         >
//           <Text style={{ fontSize: 14, color: theme.text }}>{isDarkMode ? '☀️ Light' : '🌙 Dark'}</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.formContainer}>
//         {/* WELEC Custom Logo Image Container */}
//         <View style={[styles.logoContainer, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
//           <Image
//             source={require('../../assets/images/logo WELEC.jpg')}
//             style={styles.logoImage}
//             resizeMode="contain"
//           />
//         <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
//         <Text style={[styles.subtitle, { color: theme.subText }]}>Sign in to manage operations & invoices</Text>
//         </View>


//         {/* Email Input */}
//         <TextInput
//           style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
//           placeholder="Professional Email"
//           placeholderTextColor={theme.placeholder}
//           value={email}
//           onChangeText={setEmail}
//           autoCapitalize="none"
//           keyboardType="email-address"
//         />

//         {/* Password Input with Eye Icon */}
//         <View style={[styles.passwordContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
//           <TextInput
//             style={[styles.passwordInput, { color: theme.text }]}
//             placeholder="Password"
//             placeholderTextColor={theme.placeholder}
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry={!showPassword}
//           />
//           <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
//             <Text style={{ fontSize: 16 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Sign In Button */}
//         <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleLogin} disabled={loading}>
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>Sign In</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginBottom: 10,
//   },
//   themeToggleBtn: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//   },
//   formContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     maxWidth: 400,
//     width: '100%',
//     alignSelf: 'center',
//   },
//   logoContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//     borderRadius: 16,
//     borderWidth: 1,
//     marginBottom: 20,
//   },
//   logoImage: {
//     width: 180,
//     height: 60,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 6,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 13,
//     marginBottom: 24,
//     textAlign: 'center',
//   },
//   input: {
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderRadius: 10,
//     marginBottom: 16,
//     fontSize: 15,
//     borderWidth: 1,
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 10,
//     marginBottom: 20,
//     borderWidth: 1,
//     paddingRight: 12,
//   },
//   passwordInput: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     fontSize: 15,
//   },
//   eyeBtn: {
//     padding: 4,
//   },
//   button: {
//     paddingVertical: 16,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });