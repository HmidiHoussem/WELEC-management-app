import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
  addContact,
  deleteContact,
  getContactsByType,
} from "../services/crmService";
import ClientDetailScreen from "./ClientDetailScreen";
import SupplierDetailScreen from "./SupplierDetailScreen";

export default function CRMScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("client"); // 'client' | 'supplier' | 'partner'
  const [contacts, setContacts] = useState([]);
  const [counts, setCounts] = useState({ client: 0, supplier: 0, partner: 0 }); // Compteurs séparés
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Écrans de détail
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Quick Add Modal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [buildingType, setBuildingType] = useState("Residential");
  const [specialties, setSpecialties] = useState("");

  // État pour la suppression en ligne (sécurisé pour le Web et Mobile)
  const [deletingId, setDeletingId] = useState(null);

  // Charger les contacts par type et calculer les compteurs pour chaque onglet
  const loadContacts = async () => {
    setLoading(true);

    // Récupérer pour l'onglet actif
    const result = await getContactsByType(activeTab);
    if (result.success) {
      setContacts(result.data);
    } else {
      console.error("Error loading contacts:", result.error);
    }

    // Récupérer les compteurs pour tous les onglets pour un affichage dynamique précis
    const resClients = await getContactsByType("client");
    const resSuppliers = await getContactsByType("supplier");
    const resPartners = await getContactsByType("partner");

    setCounts({
      client: resClients.success ? resClients.data.length : 0,
      supplier: resSuppliers.success ? resSuppliers.data.length : 0,
      partner: resPartners.success ? resPartners.data.length : 0,
    });

    setLoading(false);
  };

  useEffect(() => {
    loadContacts();
  }, [activeTab]);

  // Si un client ou un fournisseur est ouvert, on affiche sa vue détaillée à la place du CRM Hub
  if (selectedClient) {
    return (
      <ClientDetailScreen
        client={selectedClient}
        onBack={() => {
          setSelectedClient(null);
          loadContacts();
        }}
      />
    );
  }

  if (selectedSupplier) {
    return (
      <SupplierDetailScreen
        supplier={selectedSupplier}
        onBack={() => {
          setSelectedSupplier(null);
          loadContacts();
        }}
      />
    );
  }

  const handleCreateContact = async () => {
    if (!name || !phone) {
      console.warn("Validation Error: Name and Phone number are required.");
      return;
    }

    const newContact = {
      type: activeTab, // 'client', 'supplier', or 'partner'
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      buildingType: activeTab === "client" ? buildingType : undefined,
      specialties: activeTab === "supplier" ? (specialties ? specialties.split(',').map(s => s.trim()) : ['General Supplier']) : undefined,
      totalOutstandingBalance: 0,
    };

    const res = await addContact(newContact);
    if (res.success) {
      setName(''); setPhone(''); setAddress(''); setSpecialties('');
      setShowAddModal(false);
      loadContacts();
    } else {
      console.error("Error Saving Contact:", res.error);
    }
  };

  const handleDeleteContact = async (id) => {
    const res = await deleteContact(id);
    if (res.success) {
      setDeletingId(null);
      loadContacts();
    } else {
      console.error("Error deleting contact:", res.error);
    }
  };

  const triggerCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const triggerWhatsApp = (phoneNumber, contactName) => {
    const msg = encodeURIComponent(
      `Hello ${contactName}, regarding your electrical maintenance with WELEC...`,
    );
    Linking.openURL(
      `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${msg}`,
    );
  };

  // Filtrer les contacts selon la barre de recherche
  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.address &&
        c.address.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={theme.subText}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by name, phone, address..."
          placeholderTextColor={theme.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Segmented Tabs Control avec vrais compteurs indépendants */}
      <View
        style={[
          styles.segmentedRow,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === "client" && { backgroundColor: theme.accent },
          ]}
          onPress={() => setActiveTab("client")}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === "client"
                ? { color: "#fff" }
                : { color: theme.subText },
            ]}
          >
            Clients ({counts.client})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === "supplier" && { backgroundColor: theme.accent },
          ]}
          onPress={() => setActiveTab("supplier")}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === "supplier"
                ? { color: "#fff" }
                : { color: theme.subText },
            ]}
          >
            Suppliers ({counts.supplier})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === "partner" && { backgroundColor: theme.accent },
          ]}
          onPress={() => setActiveTab("partner")}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === "partner"
                ? { color: "#fff" }
                : { color: theme.subText },
            ]}
          >
            Partners ({counts.partner})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add New Button */}
      <TouchableOpacity
        style={[
          styles.addNewBtn,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
        ]}
        onPress={() => setShowAddModal(!showAddModal)}
      >
        <Ionicons
          name={showAddModal ? "close" : "add-circle"}
          size={20}
          color={theme.accent}
        />
        <Text style={[styles.addNewText, { color: theme.text }]}>
          {showAddModal
            ? "Cancel"
            : `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        </Text>
      </TouchableOpacity>

      {/* Quick Add Form Drawer */}
      {showAddModal && (
        <View style={[styles.formCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.sectionSubtitle, { color: theme.text, marginBottom: 8 }]}>
            New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Registration
          </Text>

          <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Full Name / Company Name" placeholderTextColor={theme.placeholder} value={name} onChangeText={setName} />
          <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Phone Number (+216...)" placeholderTextColor={theme.placeholder} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Address / Location" placeholderTextColor={theme.placeholder} value={address} onChangeText={setAddress} />
          
          {activeTab === 'supplier' && (
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} 
              placeholder="Specialties (e.g. Disjoncteurs, Câbles)" 
              placeholderTextColor={theme.placeholder} 
              value={specialties} 
              onChangeText={setSpecialties} 
            />
          )}

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleCreateContact}>
            <Text style={styles.saveBtnText}>Save {activeTab}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Contact List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.accent}
          style={{ marginTop: 30 }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {filteredContacts.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              No {activeTab}s found.
            </Text>
          ) : (
            filteredContacts.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  { backgroundColor: theme.cardBg, borderColor: theme.border },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    {item.address ? (
                      <Text style={[styles.cardSub, { color: theme.subText }]}>
                        📍 {item.address}
                      </Text>
                    ) : null}
                    <Text style={[styles.cardSub, { color: theme.subText }]}>
                      📞 {item.phone}
                    </Text>
                  </View>

                  {/* Suppression en ligne sécurisée (Web & Mobile) */}
                  {deletingId === item.id ? (
                    <View style={styles.confirmDeleteContainer}>
                      <TouchableOpacity style={styles.confirmYesBtn} onPress={() => handleDeleteContact(item.id)}>
                        <Text style={styles.confirmYesText}>Confirm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.confirmNoBtn} onPress={() => setDeletingId(null)}>
                        <Ionicons name="close" size={16} color={theme.text} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setDeletingId(item.id)} style={{ padding: 4 }}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Financial Overview / Status */}
                <View style={styles.financialRow}>
                  <Text
                    style={[
                      styles.balanceText,
                      (item.totalOutstandingBalance || 0) > 0
                        ? { color: "#ef4444" }
                        : { color: "#10b981" },
                    ]}
                  >
                    💰 Balance: {item.totalOutstandingBalance || 0} TND
                  </Text>
                  {item.buildingType ? (
                    <Text style={styles.badge}>{item.buildingType}</Text>
                  ) : null}
                </View>

                {/* Action Row */}
                <View
                  style={[styles.actionRow, { borderTopColor: theme.border }]}
                >
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#10b981" },
                    ]}
                    onPress={() => triggerCall(item.phone)}
                  >
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#25D366" },
                    ]}
                    onPress={() => triggerWhatsApp(item.phone, item.name)}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: theme.inputBg,
                        borderWidth: 1,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => {
                      if (activeTab === "client") setSelectedClient(item);
                      if (activeTab === "supplier") setSelectedSupplier(item);
                      if (activeTab === "partner")
                        console.log("Partner detail screen coming up next!");
                    }}
                  >
                    <Text style={[styles.actionBtnText, { color: theme.text }]}>
                      {activeTab === "supplier"
                        ? "Ledger & Receipts"
                        : "Full Profile"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    height: 46,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14 },
  segmentedRow: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    padding: 4,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentText: { fontSize: 13, fontWeight: "bold" },
  addNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  addNewText: { fontSize: 14, fontWeight: "bold" },
  formCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  saveBtn: { paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  listContent: { paddingBottom: 40 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  cardSub: { fontSize: 13, marginTop: 2 },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceText: { fontSize: 13, fontWeight: "bold" },
  badge: {
    fontSize: 11,
    backgroundColor: "#334155",
    color: "#38bdf8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: { fontSize: 12, fontWeight: "bold", color: '#fff' },
  emptyText: { textAlign: "center", fontStyle: "italic", marginTop: 30 },
  confirmDeleteContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  confirmYesBtn: { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  confirmYesText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  confirmNoBtn: { padding: 4, borderRadius: 4, borderWidth: 1, borderColor: '#cbd5e1' },
});


// import { Ionicons } from "@expo/vector-icons";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Linking,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useTheme } from "../context/ThemeContext";
// import {
//   addContact,
//   deleteContact,
//   getContactsByType,
// } from "../services/crmService";
// import ClientDetailScreen from "./ClientDetailScreen";
// import SupplierDetailScreen from "./SupplierDetailScreen";

// export default function CRMScreen() {
//   const { theme } = useTheme();
//   const [activeTab, setActiveTab] = useState("client"); // 'client' | 'supplier' | 'partner'
//   const [contacts, setContacts] = useState([]);
//   const [counts, setCounts] = useState({ client: 0, supplier: 0, partner: 0 }); // Compteurs séparés
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Écrans de détail
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [selectedSupplier, setSelectedSupplier] = useState(null);

//   // Quick Add Modal Form State
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [buildingType, setBuildingType] = useState("Residential");
//   const [specialties, setSpecialties] = useState("");

//   // Charger les contacts par type et calculer les compteurs pour chaque onglet
//   const loadContacts = async () => {
//     setLoading(true);

//     // Récupérer pour l'onglet actif
//     const result = await getContactsByType(activeTab);
//     if (result.success) {
//       setContacts(result.data);
//     } else {
//       Alert.alert("Error", result.error);
//     }

//     // Récupérer les compteurs pour tous les onglets pour un affichage dynamique précis
//     const resClients = await getContactsByType("client");
//     const resSuppliers = await getContactsByType("supplier");
//     const resPartners = await getContactsByType("partner");

//     setCounts({
//       client: resClients.success ? resClients.data.length : 0,
//       supplier: resSuppliers.success ? resSuppliers.data.length : 0,
//       partner: resPartners.success ? resPartners.data.length : 0,
//     });

//     setLoading(false);
//   };

//   useEffect(() => {
//     loadContacts();
//   }, [activeTab]);

//   // Si un client ou un fournisseur est ouvert, on affiche sa vue détaillée à la place du CRM Hub
//   if (selectedClient) {
//     return (
//       <ClientDetailScreen
//         client={selectedClient}
//         onBack={() => {
//           setSelectedClient(null);
//           loadContacts();
//         }}
//       />
//     );
//   }

//   if (selectedSupplier) {
//     return (
//       <SupplierDetailScreen
//         supplier={selectedSupplier}
//         onBack={() => {
//           setSelectedSupplier(null);
//           loadContacts();
//         }}
//       />
//     );
//   }

//   // const handleCreateContact = async () => {
//   //   if (!name || !phone) {
//   //     Alert.alert("Validation Error", "Name and Phone number are required.");
//   //     return;
//   //   }

//   //   const newContact = {
//   //     type: activeTab,
//   //     name,
//   //     phone,
//   //     address,
//   //     buildingType: activeTab === "client" ? buildingType : undefined,
//   //     specialties:
//   //       activeTab === "supplier"
//   //         ? specialties.split(",").map((s) => s.trim())
//   //         : undefined,
//   //     totalOutstandingBalance: 0,
//   //   };

//   //   const res = await addContact(newContact);
//   //   if (res.success) {
//   //     setName("");
//   //     setPhone("");
//   //     setAddress("");
//   //     setSpecialties("");
//   //     setShowAddModal(false);
//   //     loadContacts();
//   //   } else {
//   //     Alert.alert("Error", res.error);
//   //   }
//   // };

// const handleCreateContact = async () => {
//     if (!name || !phone) {
//       Alert.alert('Validation Error', 'Name and Phone number are required.');
//       return;
//     }

//     const newContact = {
//       type: activeTab, // 'client', 'supplier', or 'partner'
//       name: name.trim(),
//       phone: phone.trim(),
//       address: address.trim(),
//       buildingType: activeTab === 'client' ? buildingType : undefined,
//       specialties: activeTab === 'supplier' ? (specialties ? specialties.split(',').map(s => s.trim()) : ['General Supplier']) : undefined,
//       totalOutstandingBalance: 0,
//     };

//     const res = await addContact(newContact);
//     if (res.success) {
//       setName(''); setPhone(''); setAddress(''); setSpecialties('');
//       setShowAddModal(false);
//       loadContacts();
//       Alert.alert('Success', `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} added successfully!`);
//     } else {
//       Alert.alert('Error Saving', res.error);
//     }
//   };

//   const handleDelete = (id) => {
//     Alert.alert(
//       "Delete Contact",
//       "Are you sure you want to remove this contact?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             const res = await deleteContact(id);
//             if (res.success) {
//               loadContacts();
//             } else {
//               Alert.alert("Error", res.error);
//             }
//           },
//         },
//       ],
//     );
//   };

//   const triggerCall = (phoneNumber) => {
//     Linking.openURL(`tel:${phoneNumber}`);
//   };

//   const triggerWhatsApp = (phoneNumber, contactName) => {
//     const msg = encodeURIComponent(
//       `Hello ${contactName}, regarding your electrical maintenance with WELEC...`,
//     );
//     Linking.openURL(
//       `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${msg}`,
//     );
//   };

//   // Filtrer les contacts selon la barre de recherche
//   const filteredContacts = contacts.filter(
//     (c) =>
//       c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       c.phone.includes(searchQuery) ||
//       (c.address &&
//         c.address.toLowerCase().includes(searchQuery.toLowerCase())),
//   );

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       {/* Search Bar */}
//       <View
//         style={[
//           styles.searchContainer,
//           { backgroundColor: theme.cardBg, borderColor: theme.border },
//         ]}
//       >
//         <Ionicons
//           name="search"
//           size={18}
//           color={theme.subText}
//           style={{ marginRight: 8 }}
//         />
//         <TextInput
//           style={[styles.searchInput, { color: theme.text }]}
//           placeholder="Search by name, phone, address..."
//           placeholderTextColor={theme.placeholder}
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//       </View>

//       {/* Segmented Tabs Control avec vrais compteurs indépendants */}
//       <View
//         style={[
//           styles.segmentedRow,
//           { backgroundColor: theme.cardBg, borderColor: theme.border },
//         ]}
//       >
//         <TouchableOpacity
//           style={[
//             styles.segmentBtn,
//             activeTab === "client" && { backgroundColor: theme.accent },
//           ]}
//           onPress={() => setActiveTab("client")}
//         >
//           <Text
//             style={[
//               styles.segmentText,
//               activeTab === "client"
//                 ? { color: "#fff" }
//                 : { color: theme.subText },
//             ]}
//           >
//             Clients ({counts.client})
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.segmentBtn,
//             activeTab === "supplier" && { backgroundColor: theme.accent },
//           ]}
//           onPress={() => setActiveTab("supplier")}
//         >
//           <Text
//             style={[
//               styles.segmentText,
//               activeTab === "supplier"
//                 ? { color: "#fff" }
//                 : { color: theme.subText },
//             ]}
//           >
//             Suppliers ({counts.supplier})
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.segmentBtn,
//             activeTab === "partner" && { backgroundColor: theme.accent },
//           ]}
//           onPress={() => setActiveTab("partner")}
//         >
//           <Text
//             style={[
//               styles.segmentText,
//               activeTab === "partner"
//                 ? { color: "#fff" }
//                 : { color: theme.subText },
//             ]}
//           >
//             Partners ({counts.partner})
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Add New Button */}
//       <TouchableOpacity
//         style={[
//           styles.addNewBtn,
//           { backgroundColor: theme.cardBg, borderColor: theme.border },
//         ]}
//         onPress={() => setShowAddModal(!showAddModal)}
//       >
//         <Ionicons
//           name={showAddModal ? "close" : "add-circle"}
//           size={20}
//           color={theme.accent}
//         />
//         <Text style={[styles.addNewText, { color: theme.text }]}>
//           {showAddModal
//             ? "Cancel"
//             : `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
//         </Text>
//       </TouchableOpacity>

//       {/* Quick Add Form Drawer */}
//       {/* {showAddModal && (
//         <View
//           style={[
//             styles.formCard,
//             { backgroundColor: theme.cardBg, borderColor: theme.border },
//           ]}
//         >
//           <TextInput
//             style={[
//               styles.input,
//               {
//                 backgroundColor: theme.inputBg,
//                 color: theme.text,
//                 borderColor: theme.border,
//               },
//             ]}
//             placeholder="Full Name / Company"
//             placeholderTextColor={theme.placeholder}
//             value={name}
//             onChangeText={setName}
//           />
//           <TextInput
//             style={[
//               styles.input,
//               {
//                 backgroundColor: theme.inputBg,
//                 color: theme.text,
//                 borderColor: theme.border,
//               },
//             ]}
//             placeholder="Phone (+216...)"
//             placeholderTextColor={theme.placeholder}
//             value={phone}
//             onChangeText={setPhone}
//             keyboardType="phone-pad"
//           />
//           <TextInput
//             style={[
//               styles.input,
//               {
//                 backgroundColor: theme.inputBg,
//                 color: theme.text,
//                 borderColor: theme.border,
//               },
//             ]}
//             placeholder="Address / Location"
//             placeholderTextColor={theme.placeholder}
//             value={address}
//             onChangeText={setAddress}
//           />

//           {activeTab === "supplier" && (
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: theme.inputBg,
//                   color: theme.text,
//                   borderColor: theme.border,
//                 },
//               ]}
//               placeholder="Specialties (e.g. Cables, Breakers)"
//               placeholderTextColor={theme.placeholder}
//               value={specialties}
//               onChangeText={setSpecialties}
//             />
//           )}

//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: theme.accent }]}
//             onPress={handleCreateContact}
//           >
//             <Text style={styles.saveBtnText}>Save {activeTab}</Text>
//           </TouchableOpacity>
//         </View>
//       )} */}

//       {/* Quick Add Form Drawer */}
//       {showAddModal && (
//         <View style={[styles.formCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
//           <Text style={[styles.sectionSubtitle, { color: theme.text, marginBottom: 8 }]}>
//             New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Registration
//           </Text>

//           <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Full Name / Company Name" placeholderTextColor={theme.placeholder} value={name} onChangeText={setName} />
//           <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Phone Number (+216...)" placeholderTextColor={theme.placeholder} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
//           <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Address / Location" placeholderTextColor={theme.placeholder} value={address} onChangeText={setAddress} />
          
//           {activeTab === 'supplier' && (
//             <TextInput 
//               style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} 
//               placeholder="Specialties (e.g. Disjoncteurs, Câbles)" 
//               placeholderTextColor={theme.placeholder} 
//               value={specialties} 
//               onChangeText={setSpecialties} 
//             />
//           )}

//           <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleCreateContact}>
//             <Text style={styles.saveBtnText}>Save {activeTab}</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Contact List */}
//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color={theme.accent}
//           style={{ marginTop: 30 }}
//         />
//       ) : (
//         <ScrollView contentContainerStyle={styles.listContent}>
//           {filteredContacts.length === 0 ? (
//             <Text style={[styles.emptyText, { color: theme.subText }]}>
//               No {activeTab}s found.
//             </Text>
//           ) : (
//             filteredContacts.map((item) => (
//               <View
//                 key={item.id}
//                 style={[
//                   styles.card,
//                   { backgroundColor: theme.cardBg, borderColor: theme.border },
//                 ]}
//               >
//                 <View style={styles.cardHeader}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={[styles.cardTitle, { color: theme.text }]}>
//                       {item.name}
//                     </Text>
//                     {item.address ? (
//                       <Text style={[styles.cardSub, { color: theme.subText }]}>
//                         📍 {item.address}
//                       </Text>
//                     ) : null}
//                     <Text style={[styles.cardSub, { color: theme.subText }]}>
//                       📞 {item.phone}
//                     </Text>
//                   </View>
//                   {/* Bouton suppression fonctionnel */}
//                   <TouchableOpacity
//                     onPress={() => handleDelete(item.id)}
//                     style={{ padding: 4 }}
//                   >
//                     <Ionicons name="trash-outline" size={18} color="#ef4444" />
//                   </TouchableOpacity>
//                 </View>

//                 {/* Financial Overview / Status */}
//                 <View style={styles.financialRow}>
//                   <Text
//                     style={[
//                       styles.balanceText,
//                       (item.totalOutstandingBalance || 0) > 0
//                         ? { color: "#ef4444" }
//                         : { color: "#10b981" },
//                     ]}
//                   >
//                     💰 Balance: {item.totalOutstandingBalance || 0} TND
//                   </Text>
//                   {item.buildingType ? (
//                     <Text style={styles.badge}>{item.buildingType}</Text>
//                   ) : null}
//                 </View>

//                 {/* Action Row */}
//                 <View
//                   style={[styles.actionRow, { borderTopColor: theme.border }]}
//                 >
//                   <TouchableOpacity
//                     style={[
//                       styles.actionButton,
//                       { backgroundColor: "#10b981" },
//                     ]}
//                     onPress={() => triggerCall(item.phone)}
//                   >
//                     <Ionicons name="call" size={16} color="#fff" />
//                     <Text style={styles.actionBtnText}>Call</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={[
//                       styles.actionButton,
//                       { backgroundColor: "#25D366" },
//                     ]}
//                     onPress={() => triggerWhatsApp(item.phone, item.name)}
//                   >
//                     <Ionicons name="logo-whatsapp" size={16} color="#fff" />
//                     <Text style={styles.actionBtnText}>WhatsApp</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={[
//                       styles.actionButton,
//                       {
//                         backgroundColor: theme.inputBg,
//                         borderWidth: 1,
//                         borderColor: theme.border,
//                       },
//                     ]}
//                     onPress={() => {
//                       if (activeTab === "client") setSelectedClient(item);
//                       if (activeTab === "supplier") setSelectedSupplier(item);
//                       if (activeTab === "partner")
//                         Alert.alert(
//                           "Partner",
//                           "Partner detail screen coming up next!",
//                         );
//                     }}
//                   >
//                     <Text style={[styles.actionBtnText, { color: theme.text }]}>
//                       {activeTab === "supplier"
//                         ? "Ledger & Receipts"
//                         : "Full Profile"}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))
//           )}
//         </ScrollView>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     height: 46,
//     marginBottom: 12,
//   },
//   searchInput: { flex: 1, fontSize: 14 },
//   segmentedRow: {
//     flexDirection: "row",
//     borderRadius: 10,
//     borderWidth: 1,
//     padding: 4,
//     marginBottom: 12,
//   },
//   segmentBtn: {
//     flex: 1,
//     paddingVertical: 8,
//     alignItems: "center",
//     borderRadius: 8,
//   },
//   segmentText: { fontSize: 13, fontWeight: "bold" },
//   addNewBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     marginBottom: 16,
//     gap: 8,
//   },
//   addNewText: { fontSize: 14, fontWeight: "bold" },
//   formCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
//   input: {
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//     fontSize: 14,
//     borderWidth: 1,
//   },
//   saveBtn: { paddingVertical: 12, borderRadius: 8, alignItems: "center" },
//   saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
//   listContent: { paddingBottom: 40 },
//   card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 10,
//   },
//   cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
//   cardSub: { fontSize: 13, marginTop: 2 },
//   financialRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   balanceText: { fontSize: 13, fontWeight: "bold" },
//   badge: {
//     fontSize: 11,
//     backgroundColor: "#334155",
//     color: "#38bdf8",
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 4,
//     overflow: "hidden",
//   },
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingTop: 12,
//     borderTopWidth: 1,
//     gap: 8,
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 8,
//     borderRadius: 8,
//     gap: 6,
//   },
//   actionBtnText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
//   emptyText: { textAlign: "center", fontStyle: "italic", marginTop: 30 },
// });

// // import { Ionicons } from "@expo/vector-icons";
// // import { useEffect, useState } from "react";
// // import {
// //   ActivityIndicator,
// //   Alert,
// //   Linking,
// //   ScrollView,
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   View,
// // } from "react-native";
// // import { useTheme } from "../context/ThemeContext";
// // import {
// //   addContact,
// //   deleteContact,
// //   getContactsByType,
// // } from "../services/crmService";
// // import ClientDetailScreen from "./ClientDetailScreen";
// // import SupplierDetailScreen from "./SupplierDetailScreen";

// // export default function CRMScreen() {
// //   const { theme } = useTheme();
// //   const [activeTab, setActiveTab] = useState("client"); // 'client' | 'supplier' | 'partner'
// //   const [contacts, setContacts] = useState([]);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   // Quick Add Modal Form State
// //   const [showAddModal, setShowAddModal] = useState(false);
// //   const [name, setName] = useState("");
// //   const [phone, setPhone] = useState("");
// //   const [address, setAddress] = useState("");
// //   const [buildingType, setBuildingType] = useState("Residential");
// //   // États pour les écrans de détail
// //   const [selectedClient, setSelectedClient] = useState(null);
// //   const [selectedSupplier, setSelectedSupplier] = useState(null);

// //   const loadContacts = async () => {
// //     setLoading(true);
// //     const result = await getContactsByType(activeTab);
// //     if (result.success) {
// //       setContacts(result.data);
// //     } else {
// //       Alert.alert("Error", result.error);
// //     }
// //     setLoading(false);
// //   };

// //   useEffect(() => {
// //     loadContacts();
// //   }, [activeTab]);

// //   const handleCreateContact = async () => {
// //     if (!name || !phone) {
// //       Alert.alert("Validation Error", "Name and Phone number are required.");
// //       return;
// //     }

// //     const newContact = {
// //       type: activeTab,
// //       name,
// //       phone,
// //       address,
// //       buildingType: activeTab === "client" ? buildingType : undefined,
// //       totalOutstandingBalance: 0,
// //       clientRatingTag: "reliable",
// //     };

// //     const res = await addContact(newContact);
// //     if (res.success) {
// //       setName("");
// //       setPhone("");
// //       setAddress("");
// //       setShowAddModal(false);
// //       loadContacts();
// //     } else {
// //       Alert.alert("Error", res.error);
// //     }
// //   };

// //   const handleDelete = (id) => {
// //     Alert.alert(
// //       "Delete Contact",
// //       "Are you sure you want to remove this contact?",
// //       [
// //         { text: "Cancel", style: "cancel" },
// //         {
// //           text: "Delete",
// //           style: "destructive",
// //           onPress: async () => {
// //             await deleteContact(id);
// //             loadContacts();
// //           },
// //         },
// //       ],
// //     );
// //   };

// //   const triggerCall = (phoneNumber) => {
// //     Linking.openURL(`tel:${phoneNumber}`);
// //   };

// //   const triggerWhatsApp = (phoneNumber, contactName) => {
// //     const msg = encodeURIComponent(
// //       `Hello ${contactName}, regarding your electrical maintenance with WELEC...`,
// //     );
// //     Linking.openURL(
// //       `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${msg}`,
// //     );
// //   };

// //   // Filter contacts by search query
// //   const filteredContacts = contacts.filter(
// //     (c) =>
// //       c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //       c.phone.includes(searchQuery) ||
// //       (c.address &&
// //         c.address.toLowerCase().includes(searchQuery.toLowerCase())),
// //   );

// //   //  affichage de client details
// //   if (selectedClient) {
// //     return (
// //       <ClientDetailScreen
// //         client={selectedClient}
// //         onBack={() => setSelectedClient(null)}
// //       />
// //     );
// //   }
// //   // Si un fournisseur est sélectionné, on affiche sa vue détaillée
// //   if (selectedSupplier) {
// //     return (
// //       <SupplierDetailScreen
// //         supplier={selectedSupplier}
// //         onBack={() => setSelectedSupplier(null)}
// //       />
// //     );
// //   }

// //   return (
// //     <View style={[styles.container, { backgroundColor: theme.background }]}>
// //       {/* Search Bar */}
// //       <View
// //         style={[
// //           styles.searchContainer,
// //           { backgroundColor: theme.cardBg, borderColor: theme.border },
// //         ]}
// //       >
// //         <Ionicons
// //           name="search"
// //           size={18}
// //           color={theme.subText}
// //           style={{ marginRight: 8 }}
// //         />
// //         <TextInput
// //           style={[styles.searchInput, { color: theme.text }]}
// //           placeholder="Search by name, phone, address..."
// //           placeholderTextColor={theme.placeholder}
// //           value={searchQuery}
// //           onChangeText={setSearchQuery}
// //         />
// //       </View>

// //       {/* Segmented Tabs Control */}
// //       <View
// //         style={[
// //           styles.segmentedRow,
// //           { backgroundColor: theme.cardBg, borderColor: theme.border },
// //         ]}
// //       >
// //         <TouchableOpacity
// //           style={[
// //             styles.segmentBtn,
// //             activeTab === "client" && { backgroundColor: theme.accent },
// //           ]}
// //           onPress={() => setActiveTab("client")}
// //         >
// //           <Text
// //             style={[
// //               styles.segmentText,
// //               activeTab === "client"
// //                 ? { color: "#fff" }
// //                 : { color: theme.subText },
// //             ]}
// //           >
// //             Clients (
// //             {contacts.length === 0 && activeTab === "client"
// //               ? 0
// //               : contacts.filter((c) => activeTab === "client").length}
// //             )
// //           </Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity
// //           style={[
// //             styles.segmentBtn,
// //             activeTab === "supplier" && { backgroundColor: theme.accent },
// //           ]}
// //           onPress={() => setActiveTab("supplier")}
// //         >
// //           <Text
// //             style={[
// //               styles.segmentText,
// //               activeTab === "supplier"
// //                 ? { color: "#fff" }
// //                 : { color: theme.subText },
// //             ]}
// //           >
// //             Suppliers
// //           </Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity
// //           style={[
// //             styles.segmentBtn,
// //             activeTab === "partner" && { backgroundColor: theme.accent },
// //           ]}
// //           onPress={() => setActiveTab("partner")}
// //         >
// //           <Text
// //             style={[
// //               styles.segmentText,
// //               activeTab === "partner"
// //                 ? { color: "#fff" }
// //                 : { color: theme.subText },
// //             ]}
// //           >
// //             Partners
// //           </Text>
// //         </TouchableOpacity>
// //       </View>

// //       {/* Add New Button */}
// //       <TouchableOpacity
// //         style={[
// //           styles.addNewBtn,
// //           { backgroundColor: theme.cardBg, borderColor: theme.border },
// //         ]}
// //         onPress={() => setShowAddModal(!showAddModal)}
// //       >
// //         <Ionicons
// //           name={showAddModal ? "close" : "add-circle"}
// //           size={20}
// //           color={theme.accent}
// //         />
// //         <Text style={[styles.addNewText, { color: theme.text }]}>
// //           {showAddModal
// //             ? "Cancel"
// //             : `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
// //         </Text>
// //       </TouchableOpacity>

// //       {/* Quick Add Form Drawer */}
// //       {showAddModal && (
// //         <View
// //           style={[
// //             styles.formCard,
// //             { backgroundColor: theme.cardBg, borderColor: theme.border },
// //           ]}
// //         >
// //           <TextInput
// //             style={[
// //               styles.input,
// //               {
// //                 backgroundColor: theme.inputBg,
// //                 color: theme.text,
// //                 borderColor: theme.border,
// //               },
// //             ]}
// //             placeholder="Full Name / Company"
// //             placeholderTextColor={theme.placeholder}
// //             value={name}
// //             onChangeText={setName}
// //           />
// //           <TextInput
// //             style={[
// //               styles.input,
// //               {
// //                 backgroundColor: theme.inputBg,
// //                 color: theme.text,
// //                 borderColor: theme.border,
// //               },
// //             ]}
// //             placeholder="Phone (+216...)"
// //             placeholderTextColor={theme.placeholder}
// //             value={phone}
// //             onChangeText={setPhone}
// //             keyboardType="phone-pad"
// //           />
// //           <TextInput
// //             style={[
// //               styles.input,
// //               {
// //                 backgroundColor: theme.inputBg,
// //                 color: theme.text,
// //                 borderColor: theme.border,
// //               },
// //             ]}
// //             placeholder="Address / Location"
// //             placeholderTextColor={theme.placeholder}
// //             value={address}
// //             onChangeText={setAddress}
// //           />

// //           <TouchableOpacity
// //             style={[styles.saveBtn, { backgroundColor: theme.accent }]}
// //             onPress={handleCreateContact}
// //           >
// //             <Text style={styles.saveBtnText}>Save {activeTab}</Text>
// //           </TouchableOpacity>
// //         </View>
// //       )}

// //       {/* Contact List */}
// //       {loading ? (
// //         <ActivityIndicator
// //           size="large"
// //           color={theme.accent}
// //           style={{ marginTop: 30 }}
// //         />
// //       ) : (
// //         <ScrollView contentContainerStyle={styles.listContent}>
// //           {filteredContacts.length === 0 ? (
// //             <Text style={[styles.emptyText, { color: theme.subText }]}>
// //               No {activeTab}s found.
// //             </Text>
// //           ) : (
// //             filteredContacts.map((item) => (
// //               <View
// //                 key={item.id}
// //                 style={[
// //                   styles.card,
// //                   { backgroundColor: theme.cardBg, borderColor: theme.border },
// //                 ]}
// //               >
// //                 <View style={styles.cardHeader}>
// //                   <View>
// //                     <Text style={[styles.cardTitle, { color: theme.text }]}>
// //                       {item.name}
// //                     </Text>
// //                     {item.address ? (
// //                       <Text style={[styles.cardSub, { color: theme.subText }]}>
// //                         📍 {item.address}
// //                       </Text>
// //                     ) : null}
// //                     <Text style={[styles.cardSub, { color: theme.subText }]}>
// //                       📞 {item.phone}
// //                     </Text>
// //                   </View>
// //                   <TouchableOpacity onPress={() => handleDelete(item.id)}>
// //                     <Ionicons name="trash-outline" size={18} color="#ef4444" />
// //                   </TouchableOpacity>
// //                 </View>

// //                 {/* Financial Overview / Status */}
// //                 <View style={styles.financialRow}>
// //                   <Text
// //                     style={[
// //                       styles.balanceText,
// //                       item.totalOutstandingBalance > 0
// //                         ? { color: "#ef4444" }
// //                         : { color: "#10b981" },
// //                     ]}
// //                   >
// //                     💰 Balance: {item.totalOutstandingBalance} TND
// //                   </Text>
// //                   {item.buildingType ? (
// //                     <Text style={styles.badge}>{item.buildingType}</Text>
// //                   ) : null}
// //                 </View>

// //                 {/* Action Row */}
// //                 <View
// //                   style={[styles.actionRow, { borderTopColor: theme.border }]}
// //                 >
// //                   <TouchableOpacity
// //                     style={[
// //                       styles.actionButton,
// //                       { backgroundColor: "#10b981" },
// //                     ]}
// //                     onPress={() => triggerCall(item.phone)}
// //                   >
// //                     <Ionicons name="call" size={16} color="#fff" />
// //                     <Text style={styles.actionBtnText}>Call</Text>
// //                   </TouchableOpacity>

// //                   <TouchableOpacity
// //                     style={[
// //                       styles.actionButton,
// //                       { backgroundColor: "#25D366" },
// //                     ]}
// //                     onPress={() => triggerWhatsApp(item.phone, item.name)}
// //                   >
// //                     <Ionicons name="logo-whatsapp" size={16} color="#fff" />
// //                     <Text style={styles.actionBtnText}>WhatsApp</Text>
// //                   </TouchableOpacity>

// //                   <TouchableOpacity
// //                     style={[
// //                       styles.actionButton,
// //                       {
// //                         backgroundColor: theme.inputBg,
// //                         borderWidth: 1,
// //                         borderColor: theme.border,
// //                       },
// //                     ]}
// //                     onPress={() => {
// //                       if (activeTab === "client") setSelectedClient(item);
// //                       if (activeTab === "supplier") setSelectedSupplier(item); // <-- C'est ici qu'on l'utilise !
// //                     }}
// //                     // onPress={() =>
// //                     //   Alert.alert("Detail", "Full profile view coming up next!")
// //                     // }
// //                   >
// //                     <Text style={[styles.actionBtnText, { color: theme.text }]}>
// //                       {activeTab === "supplier"
// //                         ? "Ledger & Receipts"
// //                         : "Full Profile"}
// //                     </Text>
// //                   </TouchableOpacity>
// //                 </View>
// //               </View>
// //             ))
// //           )}
// //         </ScrollView>
// //       )}
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, padding: 16 },
// //   searchContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: 12,
// //     borderRadius: 10,
// //     borderWidth: 1,
// //     height: 46,
// //     marginBottom: 12,
// //   },
// //   searchInput: { flex: 1, fontSize: 14 },
// //   segmentedRow: {
// //     flexDirection: "row",
// //     borderRadius: 10,
// //     borderWidth: 1,
// //     padding: 4,
// //     marginBottom: 12,
// //   },
// //   segmentBtn: {
// //     flex: 1,
// //     paddingVertical: 8,
// //     alignItems: "center",
// //     borderRadius: 8,
// //   },
// //   segmentText: { fontSize: 13, fontWeight: "bold" },
// //   addNewBtn: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     padding: 12,
// //     borderRadius: 10,
// //     borderWidth: 1,
// //     marginBottom: 16,
// //     gap: 8,
// //   },
// //   addNewText: { fontSize: 14, fontWeight: "bold" },
// //   formCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
// //   input: {
// //     paddingHorizontal: 14,
// //     paddingVertical: 12,
// //     borderRadius: 8,
// //     marginBottom: 10,
// //     fontSize: 14,
// //     borderWidth: 1,
// //   },
// //   saveBtn: { paddingVertical: 12, borderRadius: 8, alignItems: "center" },
// //   saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
// //   listContent: { paddingBottom: 40 },
// //   card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
// //   cardHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "flex-start",
// //     marginBottom: 10,
// //   },
// //   cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
// //   cardSub: { fontSize: 13, marginTop: 2 },
// //   financialRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: 12,
// //   },
// //   balanceText: { fontSize: 13, fontWeight: "bold" },
// //   badge: {
// //     fontSize: 11,
// //     backgroundColor: "#334155",
// //     color: "#38bdf8",
// //     paddingHorizontal: 8,
// //     paddingVertical: 2,
// //     borderRadius: 4,
// //     overflow: "hidden",
// //   },
// //   actionRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     paddingTop: 12,
// //     borderTopWidth: 1,
// //     gap: 8,
// //   },
// //   actionButton: {
// //     flex: 1,
// //     flexDirection: "row",
// //     justifyContent: "center",
// //     alignItems: "center",
// //     paddingVertical: 8,
// //     borderRadius: 8,
// //     gap: 6,
// //   },
// //   actionBtnText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
// //   emptyText: { textAlign: "center", fontStyle: "italic", marginTop: 30 },
// // });

// // // import React from 'react';
// // // import { View, StyleSheet } from 'react-native';
// // // import ClientsScreen from './ClientsScreen';

// // // export default function CRMScreen() {
// // //   return (
// // //     <View style={styles.container}>
// // //       <ClientsScreen />
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, backgroundColor: '#0f172a' },
// // // });
