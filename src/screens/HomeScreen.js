import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Revenue Card */}
        <View style={[styles.revenueCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardSubtitle, { color: theme.subText }]}>Revenue This Month</Text>
            <Text style={styles.trendBadge}>📈 +12%</Text>
          </View>
          <Text style={[styles.revenueAmount, { color: '#10b981' }]}>16,000 €</Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <TouchableOpacity 
            style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={() => router.push('/billing')}
          >
            <Text style={styles.metricIcon}>⚠️</Text>
            <Text style={[styles.metricNumber, { color: theme.text }]}>4</Text>
            <Text style={[styles.metricLabel, { color: theme.subText }]}>Pending Invoices</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={() => router.push('/calendar')}
          >
            <Text style={styles.metricIcon}>📅</Text>
            <Text style={[styles.metricNumber, { color: theme.text }]}>4</Text>
            <Text style={[styles.metricLabel, { color: theme.subText }]}>Today's Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Shortcuts */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#1e293b' }]}
            onPress={() => router.push('/billing')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionBtnText}>Create Devis</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.accent }]}
            onPress={() => router.push('/crm')}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionBtnText}>Add Client</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtnFull, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={() => router.push('/crm')}
          >
            <Text style={styles.actionIcon}>🧾</Text>
            <Text style={[styles.actionBtnText, { color: theme.text }]}>Log Supplier Receipt</Text>
          </TouchableOpacity>

        </View>

        {/* Recent Activity */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Operations</Text>
        <View style={[styles.activityCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.activityTitle, { color: theme.text }]}>🔧 Circuit Breaker Panel Repair</Text>
          <Text style={[styles.activitySub, { color: theme.subText }]}>Client: Ahmed Ben Ali • Today, 10:30 AM</Text>
          <Text style={[styles.activityPrice, { color: theme.accent }]}>250 €</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  revenueCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardSubtitle: { fontSize: 13, fontWeight: '600' },
  trendBadge: { fontSize: 12, color: '#10b981', fontWeight: 'bold' },
  revenueAmount: { fontSize: 32, fontWeight: 'bold', marginTop: 8 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  metricCard: { flex: 0.48, padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  metricIcon: { fontSize: 22, marginBottom: 6 },
  metricNumber: { fontSize: 24, fontWeight: 'bold' },
  metricLabel: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  actionBtn: { width: '48%', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  actionBtnFull: { width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1 },
  actionIcon: { fontSize: 20, marginBottom: 4, marginRight: 6 },
  actionBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  activityCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
  activityTitle: { fontSize: 15, fontWeight: 'bold' },
  activitySub: { fontSize: 12, marginTop: 4 },
  activityPrice: { fontSize: 14, fontWeight: 'bold', marginTop: 6 },
});

// import React from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   ScrollView,
//   SafeAreaView,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { useTheme } from "../context/ThemeContext";

// export default function HomeScreen() {
//   const { theme, isDarkMode, toggleTheme } = useTheme();
//   const router = useRouter();

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: theme.background }]}
//     >
//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Top Header Row */}
//         <View style={styles.headerRow}>
//           <View>
//             <Text style={[styles.brandTitle, { color: theme.accent }]}>
//               ⚡ WELEC
//             </Text>
//             <Text style={[styles.welcomeText, { color: theme.subText }]}>
//               Operations Dashboard
//             </Text>
//           </View>

//           {/* Global Theme Toggle Button */}
//           <TouchableOpacity
//             style={[
//               styles.themeBtn,
//               { backgroundColor: theme.cardBg, borderColor: theme.border },
//             ]}
//             onPress={toggleTheme}
//           >
//             <Text
//               style={{ color: theme.text, fontSize: 13, fontWeight: "600" }}
//             >
//               {isDarkMode ? "☀️ Light" : "🌙 Dark"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Revenue Card */}
//         <View
//           style={[
//             styles.revenueCard,
//             { backgroundColor: theme.cardBg, borderColor: theme.border },
//           ]}
//         >
//           <View style={styles.cardHeaderRow}>
//             <Text style={[styles.cardSubtitle, { color: theme.subText }]}>
//               Revenue This Month
//             </Text>
//             <Text style={styles.trendBadge}>📈 +12%</Text>
//           </View>
//           <Text style={[styles.revenueAmount, { color: "#10b981" }]}>
//             16,000 €
//           </Text>
//         </View>

//         {/* Metrics Grid */}
//         <View style={styles.metricsGrid}>
//           <TouchableOpacity
//             style={[
//               styles.metricCard,
//               { backgroundColor: theme.cardBg, borderColor: theme.border },
//             ]}
//             onPress={() => router.push("/billing")}
//           >
//             <Text style={styles.metricIcon}>⚠️</Text>
//             <Text style={[styles.metricNumber, { color: theme.text }]}>4</Text>
//             <Text style={[styles.metricLabel, { color: theme.subText }]}>
//               Pending Invoices
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.metricCard,
//               { backgroundColor: theme.cardBg, borderColor: theme.border },
//             ]}
//             onPress={() => router.push("/calendar")}
//           >
//             <Text style={styles.metricIcon}>📅</Text>
//             <Text style={[styles.metricNumber, { color: theme.text }]}>4</Text>
//             <Text style={[styles.metricLabel, { color: theme.subText }]}>
//               Today's Schedule
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Quick Actions Shortcuts */}
//         <Text style={[styles.sectionTitle, { color: theme.text }]}>
//           Quick Actions
//         </Text>
//         <View style={styles.quickActionsGrid}>
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#1e293b" }]}
//             onPress={() => router.push("/billing")}
//           >
//             <Text style={styles.actionIcon}>📝</Text>
//             <Text style={styles.actionBtnText}>Create Devis</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: theme.accent }]}
//             onPress={() => router.push("/crm")}
//           >
//             <Text style={styles.actionIcon}>👤</Text>
//             <Text style={styles.actionBtnText}>Add Client</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.actionBtnFull,
//               { backgroundColor: theme.cardBg, borderColor: theme.border },
//             ]}
//             onPress={() => router.push("/crm")}
//           >
//             <Text style={styles.actionIcon}>🧾</Text>
//             <Text style={[styles.actionBtnText, { color: theme.text }]}>
//               Log Supplier Receipt
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Recent Activity */}
//         <Text style={[styles.sectionTitle, { color: theme.text }]}>
//           Recent Operations
//         </Text>
//         <View
//           style={[
//             styles.activityCard,
//             { backgroundColor: theme.cardBg, borderColor: theme.border },
//           ]}
//         >
//           <Text style={[styles.activityTitle, { color: theme.text }]}>
//             🔧 Circuit Breaker Panel Repair
//           </Text>
//           <Text style={[styles.activitySub, { color: theme.subText }]}>
//             Client: Ahmed Ben Ali • Today, 10:30 AM
//           </Text>
//           <Text style={[styles.activityPrice, { color: theme.accent }]}>
//             250 €
//           </Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContent: { padding: 20 },
//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   brandTitle: { fontSize: 22, fontWeight: "bold", letterSpacing: 1 },
//   welcomeText: { fontSize: 13, marginTop: 2 },
//   themeBtn: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//   },
//   revenueCard: {
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     marginBottom: 16,
//   },
//   cardHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   cardSubtitle: { fontSize: 13, fontWeight: "600" },
//   trendBadge: { fontSize: 12, color: "#10b981", fontWeight: "bold" },
//   revenueAmount: { fontSize: 32, fontWeight: "bold", marginTop: 8 },
//   metricsGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 24,
//   },
//   metricCard: {
//     flex: 0.48,
//     padding: 16,
//     borderRadius: 14,
//     borderWidth: 1,
//     alignItems: "center",
//   },
//   metricIcon: { fontSize: 22, marginBottom: 6 },
//   metricNumber: { fontSize: 24, fontWeight: "bold" },
//   metricLabel: { fontSize: 12, marginTop: 2 },
//   sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
//   quickActionsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginBottom: 24,
//   },
//   actionBtn: {
//     width: "48%",
//     paddingVertical: 18,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   actionBtnFull: {
//     width: "100%",
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     flexDirection: "row",
//     justifyContent: "center",
//     borderWidth: 1,
//   },
//   actionIcon: { fontSize: 20, marginBottom: 4, marginRight: 6 },
//   actionBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
//   activityCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
//   activityTitle: { fontSize: 15, fontWeight: "bold" },
//   activitySub: { fontSize: 12, marginTop: 4 },
//   activityPrice: { fontSize: 14, fontWeight: "bold", marginTop: 6 },
// });

// // import React, { useState } from "react";
// // import {
// //   StyleSheet,
// //   Text,
// //   View,
// //   TouchableOpacity,
// //   ScrollView,
// //   SafeAreaView,
// // } from "react-native";
// // import { darkTheme, lightTheme } from "../../constants/theme";

// // export default function HomeScreen({ navigation }) {
// //   const [isDarkMode, setIsDarkMode] = useState(false);

// //   const theme = isDarkMode ? darkTheme : lightTheme;

// //   return (
// //     <SafeAreaView
// //       style={[styles.container, { backgroundColor: theme.background }]}
// //     >
// //       <ScrollView
// //         contentContainerStyle={styles.scrollContent}
// //         showsVerticalScrollIndicator={false}
// //       >
// //         {/* Top Header Row */}
// //         <View style={styles.headerRow}>
// //           <View>
// //             <Text style={[styles.brandTitle, { color: theme.accent }]}>
// //               ⚡ WELEC
// //             </Text>
// //             <Text style={[styles.welcomeText, { color: theme.text }]}>
// //               Operations Dashboard
// //             </Text>
// //           </View>

// //           {/* Theme Toggle Button */}
// //           <TouchableOpacity
// //             style={[
// //               styles.themeBtn,
// //               { backgroundColor: theme.cardBg, borderColor: theme.border },
// //             ]}
// //             onPress={() => setIsDarkMode(!isDarkMode)}
// //           >
// //             <Text
// //               style={{ color: theme.text, fontSize: 13, fontWeight: "600" }}
// //             >
// //               {isDarkMode ? "☀️ Light" : "🌙 Dark"}
// //             </Text>
// //           </TouchableOpacity>
// //         </View>

// //         {/* 1. Main Revenue Highlight Card */}
// //         <View
// //           style={[
// //             styles.revenueCard,
// //             { backgroundColor: theme.cardBg, borderColor: theme.border },
// //           ]}
// //         >
// //           <View style={styles.cardHeaderRow}>
// //             <Text style={[styles.cardSubtitle, { color: theme.subText }]}>
// //               Revenue This Month
// //             </Text>
// //             <Text style={styles.trendBadge}>📈 +12%</Text>
// //           </View>
// //           <Text style={[styles.revenueAmount, { color: "#10b981" }]}>
// //             16,000 €
// //           </Text>
// //         </View>

// //         {/* 2. Metrics Dual Grid */}
// //         <View style={styles.metricsGrid}>
// //           {/* Pending Invoices Widget */}
// //           <View
// //             style={[
// //               styles.metricCard,
// //               { backgroundColor: theme.cardBg, borderColor: theme.border },
// //             ]}
// //           >
// //             <Text style={styles.metricIcon}>⚠️</Text>
// //             <Text style={[styles.metricNumber, { color: theme.text }]}>4</Text>
// //             <Text style={[styles.metricLabel, { color: theme.subText }]}>
// //               Pending Invoices
// //             </Text>
// //           </View>

// //           {/* Today's Tasks Widget */}
// //           <View
// //             style={[
// //               styles.metricCard,
// //               { backgroundColor: theme.cardBg, borderColor: theme.border },
// //             ]}
// //           >
// //             <Text style={styles.metricIcon}>📅</Text>
// //             <Text style={[styles.metricNumber, { color: theme.text }]}>4</Text>
// //             <Text style={[styles.metricLabel, { color: theme.subText }]}>
// //               Today's Schedule
// //             </Text>
// //           </View>
// //         </View>

// //         {/* 3. Quick Actions Section */}
// //         <Text style={[styles.sectionTitle, { color: theme.text }]}>
// //           Quick Actions
// //         </Text>
// //         <View style={styles.quickActionsGrid}>
// //           <TouchableOpacity
// //             style={[styles.actionBtn, { backgroundColor: "#1e293b" }]}
// //           >
// //             <Text style={styles.actionIcon}>📝</Text>
// //             <Text style={styles.actionBtnText}>Create Devis</Text>
// //           </TouchableOpacity>

// //           <TouchableOpacity
// //             style={[styles.actionBtn, { backgroundColor: theme.accent }]}
// //           >
// //             <Text style={styles.actionIcon}>👤</Text>
// //             <Text style={styles.actionBtnText}>Add Client</Text>
// //           </TouchableOpacity>

// //           <TouchableOpacity
// //             style={[
// //               styles.actionBtnFull,
// //               { backgroundColor: "#0f172a", borderColor: theme.border },
// //             ]}
// //           >
// //             <Text style={styles.actionIcon}>🧾</Text>
// //             <Text style={styles.actionBtnText}>Log Supplier Receipt</Text>
// //           </TouchableOpacity>
// //         </View>

// //         {/* 4. Recent Activity Placeholder */}
// //         <Text style={[styles.sectionTitle, { color: theme.text }]}>
// //           Recent Operations
// //         </Text>
// //         <View
// //           style={[
// //             styles.activityCard,
// //             { backgroundColor: theme.cardBg, borderColor: theme.border },
// //           ]}
// //         >
// //           <Text style={[styles.activityTitle, { color: theme.text }]}>
// //             🔧 Circuit Breaker Panel Repair
// //           </Text>
// //           <Text style={[styles.activitySub, { color: theme.subText }]}>
// //             Client: Ahmed Ben Ali • Today, 10:30 AM
// //           </Text>
// //           <Text style={[styles.activityPrice, { color: theme.accent }]}>
// //             250 €
// //           </Text>
// //         </View>
// //       </ScrollView>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //   },
// //   scrollContent: {
// //     padding: 20,
// //   },
// //   headerRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: 20,
// //   },
// //   brandTitle: {
// //     fontSize: 22,
// //     fontWeight: "bold",
// //     letterSpacing: 1,
// //   },
// //   welcomeText: {
// //     fontSize: 13,
// //     marginTop: 2,
// //   },
// //   themeBtn: {
// //     paddingHorizontal: 12,
// //     paddingVertical: 6,
// //     borderRadius: 20,
// //     borderWidth: 1,
// //   },
// //   revenueCard: {
// //     padding: 20,
// //     borderRadius: 16,
// //     borderWidth: 1,
// //     marginBottom: 16,
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.05,
// //     shadowRadius: 6,
// //     elevation: 2,
// //   },
// //   cardHeaderRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //   },
// //   cardSubtitle: {
// //     fontSize: 13,
// //     fontWeight: "600",
// //   },
// //   trendBadge: {
// //     fontSize: 12,
// //     color: "#10b981",
// //     fontWeight: "bold",
// //   },
// //   revenueAmount: {
// //     fontSize: 32,
// //     fontWeight: "bold",
// //     marginTop: 8,
// //   },
// //   metricsGrid: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     marginBottom: 24,
// //   },
// //   metricCard: {
// //     flex: 0.48,
// //     padding: 16,
// //     borderRadius: 14,
// //     borderWidth: 1,
// //     alignItems: "center",
// //   },
// //   metricIcon: {
// //     fontSize: 22,
// //     marginBottom: 6,
// //   },
// //   metricNumber: {
// //     fontSize: 24,
// //     fontWeight: "bold",
// //   },
// //   metricLabel: {
// //     fontSize: 12,
// //     marginTop: 2,
// //   },
// //   sectionTitle: {
// //     fontSize: 18,
// //     fontWeight: "bold",
// //     marginBottom: 12,
// //   },
// //   quickActionsGrid: {
// //     flexDirection: "row",
// //     flexWrap: "wrap",
// //     justifyContent: "space-between",
// //     marginBottom: 24,
// //   },
// //   actionBtn: {
// //     width: "48%",
// //     paddingVertical: 18,
// //     borderRadius: 12,
// //     alignItems: "center",
// //     marginBottom: 12,
// //   },
// //   actionBtnFull: {
// //     width: "100%",
// //     paddingVertical: 16,
// //     borderRadius: 12,
// //     alignItems: "center",
// //     flexDirection: "row",
// //     justifyContent: "center",
// //     borderWidth: 1,
// //   },
// //   actionIcon: {
// //     fontSize: 20,
// //     marginBottom: 4,
// //     marginRight: 6,
// //   },
// //   actionBtnText: {
// //     color: "#ffffff",
// //     fontWeight: "bold",
// //     fontSize: 14,
// //   },
// //   activityCard: {
// //     padding: 16,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //   },
// //   activityTitle: {
// //     fontSize: 15,
// //     fontWeight: "bold",
// //   },
// //   activitySub: {
// //     fontSize: 12,
// //     marginTop: 4,
// //   },
// //   activityPrice: {
// //     fontSize: 14,
// //     fontWeight: "bold",
// //     marginTop: 6,
// //   },
// // });
