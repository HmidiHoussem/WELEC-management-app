import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <>
      <Tabs
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: theme.cardBg },
          headerTintColor: theme.text,
          headerTitleAlign: 'center',
          // Header displays the WELEC brand plus the active screen title
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.accent }}>⚡ WELEC</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                • {route.name === 'index' ? 'Dashboard' : route.name.toUpperCase()}
              </Text>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/profile')} style={{ marginRight: 16 }}>
              <Ionicons name="person-circle-outline" size={26} color={theme.text} />
            </TouchableOpacity>
          ),
          tabBarStyle: {
            backgroundColor: theme.cardBg,
            borderTopColor: theme.border,
            height: 65,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.subText,
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="crm"
          options={{
            title: 'CRM',
            tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
          }}
        />

        {/* Center Floating Action Button */}
        <Tabs.Screen
          name="action"
          options={{
            title: '',
            tabBarButton: () => (
              <View style={styles.fabWrapper}>
                <TouchableOpacity
                  style={[styles.fabButton, { backgroundColor: theme.accent }]}
                  activeOpacity={0.85}
                  onPress={() => setModalVisible(true)}
                >
                  <Ionicons name="add" size={32} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="billing"
          options={{
            title: 'Billing',
            tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
          }}
        />
      </Tabs>

      {/* Quick Actions Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <View style={[styles.dragHandle, { backgroundColor: theme.subText }]} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Quick Actions</Text>

                <View style={styles.actionList}>
                  <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.inputBg, borderColor: theme.border }]} onPress={() => setModalVisible(false)}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#3b82f6' }]}>
                      <Ionicons name="document-text" size={22} color="#fff" />
                    </View>
                    <View>
                      <Text style={[styles.actionTitle, { color: theme.text }]}>New Devis / Invoice</Text>
                      <Text style={{ color: theme.subText, fontSize: 12 }}>Generate commercial quote</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.inputBg, borderColor: theme.border }]} onPress={() => setModalVisible(false)}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#10b981' }]}>
                      <Ionicons name="camera" size={22} color="#fff" />
                    </View>
                    <View>
                      <Text style={[styles.actionTitle, { color: theme.text }]}>Scan Supplier Receipt</Text>
                      <Text style={{ color: theme.subText, fontSize: 12 }}>Log spare parts purchase</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.inputBg, borderColor: theme.border }]} onPress={() => setModalVisible(false)}>
                    <View style={[styles.actionIconBg, { backgroundColor: theme.accent }]}>
                      <Ionicons name="person-add" size={22} color="#fff" />
                    </View>
                    <View>
                      <Text style={[styles.actionTitle, { color: theme.text }]}>New Client / Job</Text>
                      <Text style={{ color: theme.subText, fontSize: 12 }}>Register new contact</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabButton: {
    top: -15,
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  actionList: { marginBottom: 16 },
  actionItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  actionIconBg: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  actionTitle: { fontSize: 15, fontWeight: 'bold' },
  closeButton: { paddingVertical: 12, alignItems: 'center' },
});

/* to clear all  */
// import React, { useState } from 'react';
// import { Tabs } from 'expo-router';
// import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { signOut } from 'firebase/auth';
// import { auth } from '../../src/config/firebase';
// import { useTheme } from '../../src/context/ThemeContext';

// export default function TabLayout() {
//   const [modalVisible, setModalVisible] = useState(false);
//   const { theme, isDarkMode, toggleTheme } = useTheme();

//   const handleSignOut = async () => {
//     try {
//       await signOut(auth);
//     } catch (error) {
//       console.error('Error signing out: ', error);
//     }
//   };

//   return (
//     <>
//       <Tabs
//         screenOptions={{
//           headerStyle: { backgroundColor: theme.cardBg },
//           headerTintColor: theme.text,
//           tabBarStyle: {
//             backgroundColor: theme.cardBg,
//             borderTopColor: theme.border,
//             height: 65,
//             paddingBottom: 10,
//             paddingTop: 6,
//           },
//           tabBarActiveTintColor: theme.accent,
//           tabBarInactiveTintColor: theme.subText,
//           headerRight: () => (
//             <TouchableOpacity onPress={handleSignOut} style={{ marginRight: 16 }}>
//               <Ionicons name="log-out-outline" size={22} color="#ef4444" />
//             </TouchableOpacity>
//           ),
//         }}
//       >
//         <Tabs.Screen
//           name="index"
//           options={{
//             title: 'Dashboard',
//             tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
//           }}
//         />

//         <Tabs.Screen
//           name="crm"
//           options={{
//             title: 'CRM',
//             tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
//           }}
//         />

//         <Tabs.Screen
//           name="action"
//           options={{
//             title: '',
//             tabBarButton: () => (
//               <TouchableOpacity
//                 style={styles.fabContainer}
//                 activeOpacity={0.85}
//                 onPress={() => setModalVisible(true)}
//               >
//                 <View style={[styles.fabButton, { backgroundColor: theme.accent }]}>
//                   <Ionicons name="add" size={32} color="#ffffff" />
//                 </View>
//               </TouchableOpacity>
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="billing"
//           options={{
//             title: 'Billing',
//             tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
//           }}
//         />

//         <Tabs.Screen
//           name="calendar"
//           options={{
//             title: 'Calendar',
//             tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
//           }}
//         />
//       </Tabs>

//       {/* Quick Action Modal */}
//       <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
//         <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
//           <View style={styles.modalOverlay}>
//             <TouchableWithoutFeedback>
//               <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
//                 <View style={[styles.dragHandle, { backgroundColor: theme.subText }]} />
//                 <Text style={[styles.modalTitle, { color: theme.text }]}>Quick Actions</Text>
//                 <Text style={[styles.modalSubtitle, { color: theme.subText }]}>Tap an operational shortcut to begin</Text>

//                 <View style={styles.actionList}>
//                   <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.inputBg, borderColor: theme.border }]} onPress={() => setModalVisible(false)}>
//                     <View style={[styles.actionIconBg, { backgroundColor: '#3b82f6' }]}>
//                       <Ionicons name="document-text" size={22} color="#fff" />
//                     </View>
//                     <View style={styles.actionTextGroup}>
//                       <Text style={[styles.actionTitle, { color: theme.text }]}>New Devis / Invoice</Text>
//                       <Text style={[styles.actionDesc, { color: theme.subText }]}>Generate commercial quote for a client</Text>
//                     </View>
//                   </TouchableOpacity>

//                   <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.inputBg, borderColor: theme.border }]} onPress={() => setModalVisible(false)}>
//                     <View style={[styles.actionIconBg, { backgroundColor: '#10b981' }]}>
//                       <Ionicons name="camera" size={22} color="#fff" />
//                     </View>
//                     <View style={styles.actionTextGroup}>
//                       <Text style={[styles.actionTitle, { color: theme.text }]}>Scan Supplier Receipt</Text>
//                       <Text style={[styles.actionDesc, { color: theme.subText }]}>Log spare parts purchase to ledger</Text>
//                     </View>
//                   </TouchableOpacity>

//                   <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.inputBg, borderColor: theme.border }]} onPress={() => setModalVisible(false)}>
//                     <View style={[styles.actionIconBg, { backgroundColor: theme.accent }]}>
//                       <Ionicons name="person-add" size={22} color="#fff" />
//                     </View>
//                     <View style={styles.actionTextGroup}>
//                       <Text style={[styles.actionTitle, { color: theme.text }]}>New Client / Job</Text>
//                       <Text style={[styles.actionDesc, { color: theme.subText }]}>Register new contact or property log</Text>
//                     </View>
//                   </TouchableOpacity>
//                 </View>

//                 <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
//                   <Text style={styles.closeButtonText}>Close</Text>
//                 </TouchableOpacity>
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   fabContainer: { top: -20, justifyContent: 'center', alignItems: 'center', width: 60 },
//   fabButton: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6 },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
//   modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1 },
//   dragHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
//   modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
//   modalSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 20 },
//   actionList: { marginBottom: 16 },
//   actionItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
//   actionIconBg: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
//   actionTextGroup: { flex: 1 },
//   actionTitle: { fontSize: 15, fontWeight: 'bold' },
//   actionDesc: { fontSize: 12, marginTop: 2 },
//   closeButton: { paddingVertical: 14, alignItems: 'center' },
//   closeButtonText: { color: '#ef4444', fontWeight: 'bold', fontSize: 15 },
// });

// // import React, { useState } from 'react';
// // import { Tabs } from 'expo-router';
// // import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
// // import { Ionicons } from '@expo/vector-icons';
// // import { signOut } from 'firebase/auth';
// // import { auth } from '../../src/config/firebase';

// // export default function TabLayout() {
// //   const [modalVisible, setModalVisible] = useState(false);

// //   const handleSignOut = async () => {
// //     try {
// //       await signOut(auth);
// //     } catch (error) {
// //       console.error('Error signing out: ', error);
// //     }
// //   };

// //   return (
// //     <>
// //       <Tabs
// //         screenOptions={{
// //           headerStyle: { backgroundColor: '#1e293b' },
// //           headerTintColor: '#f8fafc',
// //           tabBarStyle: {
// //             backgroundColor: '#1e293b',
// //             borderTopColor: '#334155',
// //             height: 65,
// //             paddingBottom: 10,
// //             paddingTop: 6,
// //           },
// //           tabBarActiveTintColor: '#f59e0b', // Modern amber highlight
// //           tabBarInactiveTintColor: '#94a3b8',
// //           headerRight: () => (
// //             <TouchableOpacity onPress={handleSignOut} style={{ marginRight: 16 }}>
// //               <Ionicons name="log-out-outline" size={22} color="#ef4444" />
// //             </TouchableOpacity>
// //           ),
// //         }}
// //       >
// //         {/* 1. Dashboard Tab */}
// //         <Tabs.Screen
// //           name="index"
// //           options={{
// //             title: 'Dashboard',
// //             tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
// //           }}
// //         />

// //         {/* 2. CRM Tab */}
// //         <Tabs.Screen
// //           name="crm"
// //           options={{
// //             title: 'CRM',
// //             tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
// //           }}
// //         />

// //         {/* 3. Center FAB Dummy Tab */}
// //         <Tabs.Screen
// //           name="action"
// //           options={{
// //             title: '',
// //             tabBarButton: () => (
// //               <TouchableOpacity
// //                 style={styles.fabContainer}
// //                 activeOpacity={0.85}
// //                 onPress={() => setModalVisible(true)}
// //               >
// //                 <View style={styles.fabButton}>
// //                   <Ionicons name="add" size={32} color="#ffffff" />
// //                 </View>
// //               </TouchableOpacity>
// //             ),
// //           }}
// //         />

// //         {/* 4. Billing Tab */}
// //         <Tabs.Screen
// //           name="billing"
// //           options={{
// //             title: 'Billing',
// //             tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
// //           }}
// //         />

// //         {/* 5. Calendar Tab */}
// //         <Tabs.Screen
// //           name="calendar"
// //           options={{
// //             title: 'Calendar',
// //             tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
// //           }}
// //         />
// //       </Tabs>

// //       {/* Center Action FAB Modal Sheet */}
// //       <Modal
// //         animationType="slide"
// //         transparent={true}
// //         visible={modalVisible}
// //         onRequestClose={() => setModalVisible(false)}
// //       >
// //         <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
// //           <View style={styles.modalOverlay}>
// //             <TouchableWithoutFeedback>
// //               <View style={styles.modalContent}>
// //                 <View style={styles.dragHandle} />
// //                 <Text style={styles.modalTitle}>Quick Actions</Text>
// //                 <Text style={styles.modalSubtitle}>Tap an operational shortcut to begin</Text>

// //                 <View style={styles.actionList}>
// //                   <TouchableOpacity
// //                     style={styles.actionItem}
// //                     onPress={() => {
// //                       setModalVisible(false);
// //                       // Navigate to Devis Creation in Phase 3
// //                     }}
// //                   >
// //                     <View style={[styles.actionIconBg, { backgroundColor: '#3b82f6' }]}>
// //                       <Ionicons name="document-text" size={22} color="#fff" />
// //                     </View>
// //                     <View style={styles.actionTextGroup}>
// //                       <Text style={styles.actionTitle}>New Devis / Invoice</Text>
// //                       <Text style={styles.actionDesc}>Generate commercial quote for a client</Text>
// //                     </View>
// //                   </TouchableOpacity>

// //                   <TouchableOpacity
// //                     style={styles.actionItem}
// //                     onPress={() => {
// //                       setModalVisible(false);
// //                       // Navigate to Receipt Scanner in Step 2.2
// //                     }}
// //                   >
// //                     <View style={[styles.actionIconBg, { backgroundColor: '#10b981' }]}>
// //                       <Ionicons name="camera" size={22} color="#fff" />
// //                     </View>
// //                     <View style={styles.actionTextGroup}>
// //                       <Text style={styles.actionTitle}>Scan Supplier Receipt</Text>
// //                       <Text style={styles.actionDesc}>Log spare parts purchase to ledger</Text>
// //                     </View>
// //                   </TouchableOpacity>

// //                   <TouchableOpacity
// //                     style={styles.actionItem}
// //                     onPress={() => {
// //                       setModalVisible(false);
// //                       // Navigate to Client Creation
// //                     }}
// //                   >
// //                     <View style={[styles.actionIconBg, { backgroundColor: '#f59e0b' }]}>
// //                       <Ionicons name="person-add" size={22} color="#fff" />
// //                     </View>
// //                     <View style={styles.actionTextGroup}>
// //                       <Text style={styles.actionTitle}>New Client / Job</Text>
// //                       <Text style={styles.actionDesc}>Register new contact or property log</Text>
// //                     </View>
// //                   </TouchableOpacity>
// //                 </View>

// //                 <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
// //                   <Text style={styles.closeButtonText}>Close</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             </TouchableWithoutFeedback>
// //           </View>
// //         </TouchableWithoutFeedback>
// //       </Modal>
// //     </>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   fabContainer: {
// //     top: -20,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     width: 60,
// //   },
// //   fabButton: {
// //     width: 56,
// //     height: 56,
// //     borderRadius: 28,
// //     backgroundColor: '#f59e0b', // Amber highlight
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     shadowColor: '#f59e0b',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.4,
// //     shadowRadius: 8,
// //     elevation: 6,
// //   },
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0, 0, 0, 0.6)',
// //     justifyContent: 'flex-end',
// //   },
// //   modalContent: {
// //     backgroundColor: '#1e293b',
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     padding: 24,
// //     borderWidth: 1,
// //     borderColor: '#334155',
// //   },
// //   dragHandle: {
// //     width: 40,
// //     height: 4,
// //     backgroundColor: '#64748b',
// //     borderRadius: 2,
// //     alignSelf: 'center',
// //     marginBottom: 16,
// //   },
// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#f8fafc',
// //     textAlign: 'center',
// //   },
// //   modalSubtitle: {
// //     fontSize: 13,
// //     color: '#94a3b8',
// //     textAlign: 'center',
// //     marginBottom: 20,
// //   },
// //   actionList: {
// //     marginBottom: 16,
// //   },
// //   actionItem: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#0f172a',
// //     padding: 14,
// //     borderRadius: 12,
// //     marginBottom: 12,
// //     borderWidth: 1,
// //     borderColor: '#334155',
// //   },
// //   actionIconBg: {
// //     width: 42,
// //     height: 42,
// //     borderRadius: 10,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginRight: 14,
// //   },
// //   actionTextGroup: {
// //     flex: 1,
// //   },
// //   actionTitle: {
// //     color: '#f8fafc',
// //     fontSize: 15,
// //     fontWeight: 'bold',
// //   },
// //   actionDesc: {
// //     color: '#94a3b8',
// //     fontSize: 12,
// //     marginTop: 2,
// //   },
// //   closeButton: {
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //   },
// //   closeButtonText: {
// //     color: '#ef4444',
// //     fontWeight: 'bold',
// //     fontSize: 15,
// //   },
// // });

// // // import { Tabs } from 'expo-router';
// // // import { TouchableOpacity, Text } from 'react-native';
// // // import { signOut } from 'firebase/auth';
// // // import { auth } from '../../src/config/firebase';

// // // export default function TabLayout() {
// // //   const handleSignOut = async () => {
// // //     try {
// // //       await signOut(auth);
// // //     } catch (error) {
// // //       console.error('Error signing out: ', error);
// // //     }
// // //   };

// // //   return (
// // //     <Tabs
// // //       screenOptions={{
// // //         headerStyle: { backgroundColor: '#1e293b' },
// // //         headerTintColor: '#f8fafc',
// // //         tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
// // //         headerRight: () => (
// // //           <TouchableOpacity onPress={handleSignOut} style={{ marginRight: 15 }}>
// // //             <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Sign Out</Text>
// // //           </TouchableOpacity>
// // //         ),
// // //       }}>
// // //       <Tabs.Screen
// // //         name="index"
// // //         options={{
// // //           title: 'dashoard CRM',
// // //         }}
// // //       />
// // //       <Tabs.Screen
// // //         name="two"
// // //         options={{
// // //           title: 'Suppliers',
// // //         }}
// // //       />
// // //     </Tabs>
// // //   );
// // // }

// // // // import { SymbolView } from 'expo-symbols';
// // // // import { Link, Tabs } from 'expo-router';
// // // // import { Platform, Pressable } from 'react-native';

// // // // import Colors from '@/constants/Colors';
// // // // import { useColorScheme } from '@/components/useColorScheme';
// // // // import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// // // // export default function TabLayout() {
// // // //   const colorScheme = useColorScheme();

// // // //   return (
// // // //     <Tabs
// // // //       screenOptions={{
// // // //         tabBarActiveTintColor: Colors[colorScheme].tint,
// // // //         // Disable the static render of the header on web
// // // //         // to prevent a hydration error in React Navigation v6.
// // // //         headerShown: useClientOnlyValue(false, true),
// // // //       }}>
// // // //       <Tabs.Screen
// // // //         name="index"
// // // //         options={{
// // // //           title: 'Tab One',
// // // //           tabBarIcon: ({ color }) => (
// // // //             <SymbolView
// // // //               name={{
// // // //                 ios: 'chevron.left.forwardslash.chevron.right',
// // // //                 android: 'code',
// // // //                 web: 'code',
// // // //               }}
// // // //               tintColor={color}
// // // //               size={28}
// // // //             />
// // // //           ),
// // // //           headerRight: () => (
// // // //             <Link href="/modal" asChild>
// // // //               <Pressable style={{ marginRight: 15 }}>
// // // //                 {({ pressed }) => (
// // // //                   <SymbolView
// // // //                     name={{ ios: 'info.circle', android: 'info', web: 'info' }}
// // // //                     size={25}
// // // //                     tintColor={Colors[colorScheme].text}
// // // //                     style={{ opacity: pressed ? 0.5 : 1 }}
// // // //                   />
// // // //                 )}
// // // //               </Pressable>
// // // //             </Link>
// // // //           ),
// // // //         }}
// // // //       />
// // // //       <Tabs.Screen
// // // //         name="two"
// // // //         options={{
// // // //           title: 'Tab Two',
// // // //           tabBarIcon: ({ color }) => (
// // // //             <SymbolView
// // // //               name={{
// // // //                 ios: 'chevron.left.forwardslash.chevron.right',
// // // //                 android: 'code',
// // // //                 web: 'code',
// // // //               }}
// // // //               tintColor={color}
// // // //               size={28}
// // // //             />
// // // //           ),
// // // //         }}
// // // //       />
// // // //     </Tabs>
// // // //   );
// // // // }
