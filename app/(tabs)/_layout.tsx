import { Tabs } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../src/config/firebase';

export default function TabLayout() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#1e293b' },
        headerTintColor: '#f8fafc',
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
        headerRight: () => (
          <TouchableOpacity onPress={handleSignOut} style={{ marginRight: 15 }}>
            <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Sign Out</Text>
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clients CRM',
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Suppliers',
        }}
      />
    </Tabs>
  );
}

// import { SymbolView } from 'expo-symbols';
// import { Link, Tabs } from 'expo-router';
// import { Platform, Pressable } from 'react-native';

// import Colors from '@/constants/Colors';
// import { useColorScheme } from '@/components/useColorScheme';
// import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme].tint,
//         // Disable the static render of the header on web
//         // to prevent a hydration error in React Navigation v6.
//         headerShown: useClientOnlyValue(false, true),
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Tab One',
//           tabBarIcon: ({ color }) => (
//             <SymbolView
//               name={{
//                 ios: 'chevron.left.forwardslash.chevron.right',
//                 android: 'code',
//                 web: 'code',
//               }}
//               tintColor={color}
//               size={28}
//             />
//           ),
//           headerRight: () => (
//             <Link href="/modal" asChild>
//               <Pressable style={{ marginRight: 15 }}>
//                 {({ pressed }) => (
//                   <SymbolView
//                     name={{ ios: 'info.circle', android: 'info', web: 'info' }}
//                     size={25}
//                     tintColor={Colors[colorScheme].text}
//                     style={{ opacity: pressed ? 0.5 : 1 }}
//                   />
//                 )}
//               </Pressable>
//             </Link>
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="two"
//         options={{
//           title: 'Tab Two',
//           tabBarIcon: ({ color }) => (
//             <SymbolView
//               name={{
//                 ios: 'chevron.left.forwardslash.chevron.right',
//                 android: 'code',
//                 web: 'code',
//               }}
//               tintColor={color}
//               size={28}
//             />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }
