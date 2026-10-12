import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { addClient, getClients, deleteClient, addClientHistory } from '../services/clientService';

export default function ClientsScreen() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Prevents multi-click spam
  
  // New Client Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [buildingType, setBuildingType] = useState('');

  // Expanded Client History State
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [fixType, setFixType] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [remarks, setRemarks] = useState('');

  const loadClients = async () => {
    setLoading(true);
    const result = await getClients();
    if (result.success) {
      setClients(result.data);
    } else {
      Alert.alert('Database Error', 'Could not fetch clients. Check your Firebase Security Rules!');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleAddClient = async () => {
    if (!name || !phone || !address) {
      Alert.alert('Validation Error', 'Please fill in Name, Phone, and Address.');
      return;
    }

    setSubmitting(true); // Lock button immediately
    const result = await addClient({ name, phone, address, buildingType: buildingType || 'Standard' });
    
    if (result.success) {
      setName(''); setPhone(''); setAddress(''); setBuildingType('');
      await loadClients(); // Refresh list cleanly
    } else {
      Alert.alert('Error', result.error);
    }
    setSubmitting(false); // Unlock button
  };

  const handleAddJobHistory = async (clientId) => {
    if (!fixType || !totalPrice) {
      Alert.alert('Validation Error', 'Please provide the fix type and total price.');
      return;
    }
    const result = await addClientHistory(clientId, { fixType, laborCost, partsUsed, totalPrice, remarks });
    if (result.success) {
      setFixType(''); setLaborCost(''); setPartsUsed(''); setTotalPrice(''); setRemarks('');
      loadClients();
      Alert.alert('Success', 'Job record added to client history!');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Client', 'Remove this client and their history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteClient(id); loadClients(); } },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Client CRM & Service History</Text>

      {/* Client Input Form */}
      <View style={styles.formCard}>
        <Text style={styles.cardTitle}>Register New Client</Text>
        <TextInput style={styles.input} placeholder="Client Name / Company" placeholderTextColor="#64748b" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#64748b" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Service Address" placeholderTextColor="#64748b" value={address} onChangeText={setAddress} />
        <TextInput style={styles.input} placeholder="Building Type (Residential, Commercial)" placeholderTextColor="#64748b" value={buildingType} onChangeText={setBuildingType} />
        
        <TouchableOpacity 
          style={[styles.addButton, submitting && { opacity: 0.6 }]} 
          onPress={handleAddClient} 
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>+ Save Client</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>Registered Clients ({clients.length})</Text>

      {/* Clients List */}
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
      ) : (
        clients.map((item) => (
          <View key={item.id} style={styles.clientCard}>
            <View style={styles.clientHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>{item.name}</Text>
                <Text style={styles.clientDetail}>📞 {item.phone}</Text>
                <Text style={styles.clientDetail}>📍 {item.address}</Text>
                <Text style={styles.clientBadge}>{item.buildingType}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* History Section Toggle */}
            <TouchableOpacity style={styles.historyToggleBtn} onPress={() => setSelectedClientId(selectedClientId === item.id ? null : item.id)}>
              <Text style={styles.historyToggleText}>
                {selectedClientId === item.id ? 'Hide Service History ▲' : `View / Add History (${item.history?.length || 0}) ▼`}
              </Text>
            </TouchableOpacity>

            {/* Expanded History Form & List */}
            {selectedClientId === item.id && (
              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>Past Repairs & Logs</Text>
                {item.history && item.history.length > 0 ? (
                  item.history.map((hist) => (
                    <View key={hist.id} style={styles.historyItem}>
                      <Text style={styles.histDate}>📅 {hist.date} | Total: ${hist.totalPrice}</Text>
                      <Text style={styles.histText}>🔧 Fix: {hist.fixType}</Text>
                      <Text style={styles.histText}>🔩 Parts: {hist.partsUsed || 'None'}</Text>
                      {hist.remarks ? <Text style={styles.histRemarks}>💬 {hist.remarks}</Text> : null}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No service history recorded yet.</Text>
                )}

                {/* Add Job Form */}
                <View style={styles.addJobSubForm}>
                  <Text style={styles.subCardTitle}>Add New Job Log</Text>
                  <TextInput style={styles.inputSmall} placeholder="Fix Type (e.g. Rewiring)" placeholderTextColor="#64748b" value={fixType} onChangeText={setFixType} />
                  <TextInput style={styles.inputSmall} placeholder="Parts Used (e.g. 2x Breakers)" placeholderTextColor="#64748b" value={partsUsed} onChangeText={setPartsUsed} />
                  <TextInput style={styles.inputSmall} placeholder="Labor Cost ($)" placeholderTextColor="#64748b" value={laborCost} onChangeText={setLaborCost} keyboardType="numeric" />
                  <TextInput style={styles.inputSmall} placeholder="Total Price ($)" placeholderTextColor="#64748b" value={totalPrice} onChangeText={setTotalPrice} keyboardType="numeric" />
                  <TextInput style={styles.inputSmall} placeholder="Remarks / Notes" placeholderTextColor="#64748b" value={remarks} onChangeText={setRemarks} />
                  <TouchableOpacity style={styles.addJobButton} onPress={() => handleAddJobHistory(item.id)}>
                    <Text style={styles.addJobButtonText}>+ Log Job to History</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc', marginBottom: 16 },
  subHeader: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginVertical: 12 },
  formCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#38bdf8', marginBottom: 10 },
  input: { backgroundColor: '#0f172a', color: '#f8fafc', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8, marginBottom: 10, fontSize: 14, borderWidth: 1, borderColor: '#334155' },
  inputSmall: { backgroundColor: '#0f172a', color: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginBottom: 8, fontSize: 13, borderWidth: 1, borderColor: '#334155' },
  addButton: { backgroundColor: '#3b82f6', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  clientCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  clientHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  clientName: { fontSize: 16, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 },
  clientDetail: { fontSize: 13, color: '#94a3b8', marginBottom: 2 },
  clientBadge: { alignSelf: 'flex-start', backgroundColor: '#334155', color: '#38bdf8', fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 6, overflow: 'hidden' },
  deleteText: { color: '#ef4444', fontWeight: '600', fontSize: 14 },
  historyToggleBtn: { marginTop: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#334155', alignItems: 'center' },
  historyToggleText: { color: '#38bdf8', fontWeight: '600', fontSize: 13 },
  historySection: { marginTop: 8, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 },
  historyTitle: { fontSize: 14, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 },
  historyItem: { backgroundColor: '#1e293b', padding: 8, borderRadius: 6, marginBottom: 6 },
  histDate: { fontSize: 12, color: '#38bdf8', fontWeight: 'bold', marginBottom: 2 },
  histText: { fontSize: 12, color: '#cbd5e1' },
  histRemarks: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 2 },
  emptyText: { color: '#64748b', fontSize: 12, fontStyle: 'italic', marginBottom: 8 },
  addJobSubForm: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10 },
  subCardTitle: { fontSize: 13, fontWeight: 'bold', color: '#cbd5e1', marginBottom: 6 },
  addJobButton: { backgroundColor: '#10b981', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  addJobButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
});

// import React, { useState, useEffect } from 'react';
// import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
// import { addClient, getClients, deleteClient, addClientHistory } from '../services/clientService';

// export default function ClientsScreen() {
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   // New Client Form States
//   const [name, setName] = useState('');
//   const [phone, setPhone] = useState('');
//   const [address, setAddress] = useState('');
//   const [buildingType, setBuildingType] = useState('');

//   // Expanded Client History State
//   const [selectedClientId, setSelectedClientId] = useState(null);
//   const [fixType, setFixType] = useState('');
//   const [laborCost, setLaborCost] = useState('');
//   const [partsUsed, setPartsUsed] = useState('');
//   const [totalPrice, setTotalPrice] = useState('');
//   const [remarks, setRemarks] = useState('');

//   const loadClients = async () => {
//     setLoading(true);
//     const result = await getClients();
//     if (result.success) setClients(result.data);
//     setLoading(false);
//   };

//   useEffect(() => {
//     loadClients();
//   }, []);

//   const handleAddClient = async () => {
//     if (!name || !phone || !address) {
//       Alert.alert('Validation Error', 'Please fill in Name, Phone, and Address.');
//       return;
//     }
//     setLoading(true);
//     const result = await addClient({ name, phone, address, buildingType: buildingType || 'Standard' });
//     if (result.success) {
//       setName(''); setPhone(''); setAddress(''); setBuildingType('');
//       loadClients();
//     } else {
//       Alert.alert('Error', result.error);
//     }
//     setLoading(false);
//   };

//   const handleAddJobHistory = async (clientId) => {
//     if (!fixType || !totalPrice) {
//       Alert.alert('Validation Error', 'Please provide the fix type and total price.');
//       return;
//     }
//     const result = await addClientHistory(clientId, { fixType, laborCost, partsUsed, totalPrice, remarks });
//     if (result.success) {
//       setFixType(''); setLaborCost(''); setPartsUsed(''); setTotalPrice(''); setRemarks('');
//       loadClients();
//       Alert.alert('Success', 'Job record added to client history!');
//     } else {
//       Alert.alert('Error', result.error);
//     }
//   };

//   const handleDelete = async (id) => {
//     Alert.alert('Delete Client', 'Remove this client and their history?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Delete', style: 'destructive', onPress: async () => { await deleteClient(id); loadClients(); } },
//     ]);
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.headerTitle}>Client CRM & Service History</Text>

//       {/* Client Input Form */}
//       <View style={styles.formCard}>
//         <Text style={styles.cardTitle}>Register New Client</Text>
//         <TextInput style={styles.input} placeholder="Client Name / Company" placeholderTextColor="#64748b" value={name} onChangeText={setName} />
//         <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#64748b" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
//         <TextInput style={styles.input} placeholder="Service Address" placeholderTextColor="#64748b" value={address} onChangeText={setAddress} />
//         <TextInput style={styles.input} placeholder="Building Type (Residential, Commercial)" placeholderTextColor="#64748b" value={buildingType} onChangeText={setBuildingType} />
//         <TouchableOpacity style={styles.addButton} onPress={handleAddClient}>
//           <Text style={styles.addButtonText}>+ Save Client</Text>
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.subHeader}>Registered Clients ({clients.length})</Text>

//       {/* Clients List */}
//       {loading ? (
//         <ActivityIndicator size="large" color="#3b82f6" />
//       ) : (
//         clients.map((item) => (
//           <View key={item.id} style={styles.clientCard}>
//             <View style={styles.clientHeaderRow}>
//               <View>
//                 <Text style={styles.clientName}>{item.name}</Text>
//                 <Text style={styles.clientDetail}>📞 {item.phone}</Text>
//                 <Text style={styles.clientDetail}>📍 {item.address}</Text>
//                 <Text style={styles.clientBadge}>{item.buildingType}</Text>
//               </View>
//               <TouchableOpacity onPress={() => handleDelete(item.id)}>
//                 <Text style={styles.deleteText}>Delete</Text>
//               </TouchableOpacity>
//             </View>

//             {/* History Section Toggle */}
//             <TouchableOpacity style={styles.historyToggleBtn} onPress={() => setSelectedClientId(selectedClientId === item.id ? null : item.id)}>
//               <Text style={styles.historyToggleText}>
//                 {selectedClientId === item.id ? 'Hide Service History ▲' : `View / Add History (${item.history?.length || 0}) ▼`}
//               </Text>
//             </TouchableOpacity>

//             {/* Expanded History Form & List */}
//             {selectedClientId === item.id && (
//               <View style={styles.historySection}>
//                 <Text style={styles.historyTitle}>Past Repairs & Logs</Text>
//                 {item.history && item.history.length > 0 ? (
//                   item.history.map((hist) => (
//                     <View key={hist.id} style={styles.historyItem}>
//                       <Text style={styles.histDate}>📅 {hist.date} | Total: ${hist.totalPrice}</Text>
//                       <Text style={styles.histText}>🔧 Fix: {hist.fixType}</Text>
//                       <Text style={styles.histText}>🔩 Parts: {hist.partsUsed || 'None'}</Text>
//                       {hist.remarks ? <Text style={styles.histRemarks}>💬 {hist.remarks}</Text> : null}
//                     </View>
//                   ))
//                 ) : (
//                   <Text style={styles.emptyText}>No service history recorded yet.</Text>
//                 )}

//                 {/* Add Job Form */}
//                 <View style={styles.addJobSubForm}>
//                   <Text style={styles.subCardTitle}>Add New Job Log</Text>
//                   <TextInput style={styles.inputSmall} placeholder="Fix Type (e.g. Rewiring)" placeholderTextColor="#64748b" value={fixType} onChangeText={setFixType} />
//                   <TextInput style={styles.inputSmall} placeholder="Parts Used (e.g. 2x Breakers)" placeholderTextColor="#64748b" value={partsUsed} onChangeText={setPartsUsed} />
//                   <TextInput style={styles.inputSmall} placeholder="Labor Cost ($)" placeholderTextColor="#64748b" value={laborCost} onChangeText={setLaborCost} keyboardType="numeric" />
//                   <TextInput style={styles.inputSmall} placeholder="Total Price ($)" placeholderTextColor="#64748b" value={totalPrice} onChangeText={setTotalPrice} keyboardType="numeric" />
//                   <TextInput style={styles.inputSmall} placeholder="Remarks / Notes" placeholderTextColor="#64748b" value={remarks} onChangeText={setRemarks} />
//                   <TouchableOpacity style={styles.addJobButton} onPress={() => handleAddJobHistory(item.id)}>
//                     <Text style={styles.addJobButtonText}>+ Log Job to History</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
//   headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc', marginBottom: 16 },
//   subHeader: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginVertical: 12 },
//   formCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
//   cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#38bdf8', marginBottom: 10 },
//   input: { backgroundColor: '#0f172a', color: '#f8fafc', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8, marginBottom: 10, fontSize: 14, borderWidth: 1, borderColor: '#334155' },
//   inputSmall: { backgroundColor: '#0f172a', color: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginBottom: 8, fontSize: 13, borderWidth: 1, borderColor: '#334155' },
//   addButton: { backgroundColor: '#3b82f6', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
//   addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
//   clientCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
//   clientHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
//   clientName: { fontSize: 16, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 },
//   clientDetail: { fontSize: 13, color: '#94a3b8', marginBottom: 2 },
//   clientBadge: { alignSelf: 'flex-start', backgroundColor: '#334155', color: '#38bdf8', fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 6, overflow: 'hidden' },
//   deleteText: { color: '#ef4444', fontWeight: '600', fontSize: 14 },
//   historyToggleBtn: { marginTop: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#334155', alignItems: 'center' },
//   historyToggleText: { color: '#38bdf8', fontWeight: '600', fontSize: 13 },
//   historySection: { marginTop: 8, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 },
//   historyTitle: { fontSize: 14, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 },
//   historyItem: { backgroundColor: '#1e293b', padding: 8, borderRadius: 6, marginBottom: 6 },
//   histDate: { fontSize: 12, color: '#38bdf8', fontWeight: 'bold', marginBottom: 2 },
//   histText: { fontSize: 12, color: '#cbd5e1' },
//   histRemarks: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 2 },
//   emptyText: { color: '#64748b', fontSize: 12, fontStyle: 'italic', marginBottom: 8 },
//   addJobSubForm: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10 },
//   subCardTitle: { fontSize: 13, fontWeight: 'bold', color: '#cbd5e1', marginBottom: 6 },
//   addJobButton: { backgroundColor: '#10b981', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
//   addJobButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
// });