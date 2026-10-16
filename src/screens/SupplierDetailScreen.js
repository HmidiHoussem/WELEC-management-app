import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
  addSupplierReceipt,
  deleteSupplierReceipt,
  getSupplierReceipts,
  updateContact,
  updateSupplierReceipt,
} from "../services/crmService";

export default function SupplierDetailScreen({
  supplier: initialSupplier,
  onBack,
}) {
  const { theme } = useTheme();
  const [supplier, setSupplier] = useState(initialSupplier);
  const [activeSubTab, setActiveSubTab] = useState("ledger");
  const [receipts, setReceipts] = useState([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  // Edit Supplier Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(supplier?.name || "");
  const [editPhone, setEditPhone] = useState(supplier?.phone || "");
  const [editAddress, setEditAddress] = useState(supplier?.address || "");
  const [specialties, setSpecialties] = useState(
    supplier?.specialties ? supplier.specialties.join(", ") : "",
  );
  const [savingEdit, setSavingEdit] = useState(false);

  // Add / Edit Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [editingReceiptId, setEditingReceiptId] = useState(null);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptCategory, setReceiptCategory] = useState("Parts Stock");
  const [customCategory, setCustomCategory] = useState("");
  const [receiptDate, setReceiptDate] = useState("2026-10-15");
  const [receiptNotes, setReceiptNotes] = useState("");

  // Detailed Items Table State
  const [items, setItems] = useState([
    { id: "1", article: "", quantity: 1, unitPrice: 0.0, totalHT: 0.0 },
  ]);

  // Payment Status Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedReceiptForStatus, setSelectedReceiptForStatus] =
    useState(null);

  const loadReceipts = async () => {
    if (!supplier?.id) return;
    setLoadingReceipts(true);
    const res = await getSupplierReceipts(supplier.id);
    if (res.success) {
      setReceipts(res.data);
    } else {
      Alert.alert("Error", res.error);
    }
    setLoadingReceipts(false);
  };

  useEffect(() => {
    loadReceipts();
  }, [supplier]);

  // Open Add Receipt Modal
  const openNewReceiptModal = () => {
    setEditingReceiptId(null);
    setReceiptNumber("");
    setReceiptCategory("Parts Stock");
    setCustomCategory("");
    setReceiptDate("2026-10-15");
    setReceiptNotes("");
    setItems([
      { id: "1", article: "", quantity: 1, unitPrice: 0.0, totalHT: 0.0 },
    ]);
    setShowReceiptModal(true);
  };

  // Open Edit Receipt Modal
  const openEditReceiptModal = (rec) => {
    setEditingReceiptId(rec.id);
    setReceiptNumber(rec.receiptNumber || "");
    setReceiptCategory(
      ["Parts Stock", "Tools & Equipment", "Cables & Wiring", "Solar"].includes(
        rec.category,
      )
        ? rec.category
        : "Other",
    );
    setCustomCategory(
      ["Parts Stock", "Tools & Equipment", "Cables & Wiring", "Solar"].includes(
        rec.category,
      )
        ? ""
        : rec.category,
    );
    setReceiptDate(rec.date || "2026-10-15");
    setReceiptNotes(rec.notes || "");
    setItems(
      rec.items && rec.items.length > 0
        ? rec.items
        : [{ id: "1", article: "", quantity: 1, unitPrice: 0.0, totalHT: 0.0 }],
    );
    setShowReceiptModal(true);
  };

  // Itemized Table Handlers
  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        article: "",
        quantity: 1,
        unitPrice: 0.0,
        totalHT: 0.0,
      },
    ]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            const qty =
              field === "quantity" ? parseFloat(value) || 0 : item.quantity;
            const price =
              field === "unitPrice" ? parseFloat(value) || 0 : item.unitPrice;
            updated.totalHT = qty * price;
          }
          return updated;
        }
        return item;
      }),
    );
  };

  const handleRemoveItemRow = (id) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const calculateGrandTotal = () =>
    items.reduce((acc, item) => acc + (item.totalHT || 0), 0);

  // Save or Update Receipt
  const handleSaveReceipt = async () => {
    if (!receiptNumber) {
      Alert.alert("Validation Error", "Receipt / Invoice number is required.");
      return;
    }

    const finalCategory =
      receiptCategory === "Other" ? customCategory || "Other" : receiptCategory;

    const receiptData = {
      receiptNumber,
      category: finalCategory,
      date: receiptDate,
      items,
      amount: calculateGrandTotal(),
      status: "Pending",
      notes: receiptNotes,
    };

    let res;
    if (editingReceiptId) {
      res = await updateSupplierReceipt(
        supplier.id,
        editingReceiptId,
        receiptData,
      );
    } else {
      res = await addSupplierReceipt(supplier.id, receiptData);
    }

    if (res.success) {
      setShowReceiptModal(false);
      loadReceipts();
    } else {
      Alert.alert("Error", res.error);
    }
  };

  const handleDeleteReceipt = async (receiptId) => {
    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to delete this receipt?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const res = await deleteSupplierReceipt(supplier.id, receiptId);
            if (res.success) loadReceipts();
          },
        },
      ],
    );
  };

  // Update Status (Settled vs Pending)
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedReceiptForStatus) return;
    const res = await updateSupplierReceipt(
      supplier.id,
      selectedReceiptForStatus.id,
      { status: newStatus },
    );
    if (res.success) {
      setShowStatusModal(false);
      setSelectedReceiptForStatus(null);
      loadReceipts();
    }
  };

  const calculateTotalOwed = () =>
    receipts.reduce(
      (acc, r) => (r.status === "Pending" ? acc + (r.amount || 0) : acc),
      0,
    );

  const handleSaveSupplierInfo = async () => {
    if (!editName || !editPhone) return;
    setSavingEdit(true);
    const updatedData = {
      name: editName,
      phone: editPhone,
      address: editAddress,
      specialties: specialties.split(",").map((s) => s.trim()),
    };
    const res = await updateContact(supplier.id, updatedData);
    setSavingEdit(false);
    if (res.success) {
      setSupplier({ ...supplier, ...updatedData });
      setShowEditModal(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header Bar */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.clientNameHeader, { color: theme.text }]}>
            {supplier?.name}
          </Text>
          <Text style={[styles.clientSubHeader, { color: theme.subText }]}>
            🏢 Supplier Ledger
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.editHeaderBtn, { backgroundColor: theme.accent }]}
          onPress={() => setShowEditModal(true)}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Contact Bar */}
      <View
        style={[
          styles.contactRow,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.contactBtn, { backgroundColor: "#10b981" }]}
          onPress={() => Linking.openURL(`tel:${supplier?.phone}`)}
        >
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.contactBtnText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactBtn, { backgroundColor: "#25D366" }]}
          onPress={() =>
            Linking.openURL(
              `https://wa.me/${supplier?.phone?.replace(/[^0-9]/g, "")}`,
            )
          }
        >
          <Ionicons name="logo-whatsapp" size={16} color="#fff" />
          <Text style={styles.contactBtnText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactBtn, { backgroundColor: theme.accent }]}
          onPress={openNewReceiptModal}
        >
          <Ionicons name="camera" size={16} color="#fff" />
          <Text style={styles.contactBtnText}>📷 Scan Receipt</Text>
        </TouchableOpacity>
      </View>

      {/* Sub Navigation Tabs */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeSubTab === "ledger" && {
              borderBottomColor: theme.accent,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveSubTab("ledger")}
        >
          <Text
            style={[
              styles.tabText,
              activeSubTab === "ledger"
                ? { color: theme.accent, fontWeight: "bold" }
                : { color: theme.subText },
            ]}
          >
            🧾 Expense Ledger ({receipts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeSubTab === "overview" && {
              borderBottomColor: theme.accent,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveSubTab("overview")}
        >
          <Text
            style={[
              styles.tabText,
              activeSubTab === "overview"
                ? { color: theme.accent, fontWeight: "bold" }
                : { color: theme.subText },
            ]}
          >
            📋 Overview & Specialties
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {activeSubTab === "ledger" && (
          <View>
            <View
              style={[
                styles.balanceBanner,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.bannerLabel, { color: theme.subText }]}>
                Outstanding Balance Owed to Supplier:
              </Text>
              <Text
                style={[
                  styles.bannerAmount,
                  { color: calculateTotalOwed() > 0 ? "#ef4444" : "#10b981" },
                ]}
              >
                {calculateTotalOwed().toFixed(2)} TND
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.addJobBtn, { backgroundColor: theme.accent }]}
              onPress={openNewReceiptModal}
            >
              <Ionicons name="receipt" size={20} color="#fff" />
              <Text style={[styles.addJobBtnText, { color: "#fff" }]}>
                Log New Supplier Receipt / Invoice
              </Text>
            </TouchableOpacity>

            {loadingReceipts ? (
              <ActivityIndicator
                size="large"
                color={theme.accent}
                style={{ marginTop: 20 }}
              />
            ) : receipts.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.subText }]}>
                No receipts logged for this supplier yet.
              </Text>
            ) : (
              receipts.map((rec) => (
                <View
                  key={rec.id}
                  style={[
                    styles.jobCard,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.jobCardHeader}>
                    <Text style={[styles.jobTitle, { color: theme.text }]}>
                      Receipt #{rec.receiptNumber}
                    </Text>
                    <Text style={[styles.jobDate, { color: theme.accent }]}>
                      📅 {rec.date}
                    </Text>
                  </View>
                  <Text style={[styles.infoText, { color: theme.subText }]}>
                    🏷️ Category: {rec.category}
                  </Text>

                  {/* Detailed Items Table inside card */}
                  {rec.items && rec.items.length > 0 ? (
                    <View style={styles.receiptTable}>
                      <View style={styles.tableHeadRow}>
                        <Text
                          style={[styles.th, { flex: 2, color: theme.subText }]}
                        >
                          Article
                        </Text>
                        <Text
                          style={[
                            styles.th,
                            {
                              flex: 0.8,
                              textAlign: "center",
                              color: theme.subText,
                            },
                          ]}
                        >
                          Qté
                        </Text>
                        <Text
                          style={[
                            styles.th,
                            {
                              flex: 1.2,
                              textAlign: "right",
                              color: theme.subText,
                            },
                          ]}
                        >
                          P.U HT
                        </Text>
                        <Text
                          style={[
                            styles.th,
                            {
                              flex: 1.2,
                              textAlign: "right",
                              color: theme.subText,
                            },
                          ]}
                        >
                          Total HT
                        </Text>
                      </View>
                      {rec.items.map((it, idx) => (
                        <View key={idx} style={styles.tableBodyRow}>
                          <Text
                            style={[styles.td, { flex: 2, color: theme.text }]}
                          >
                            {it.article || "Item"}
                          </Text>
                          <Text
                            style={[
                              styles.td,
                              {
                                flex: 0.8,
                                textAlign: "center",
                                color: theme.subText,
                              },
                            ]}
                          >
                            {it.quantity}
                          </Text>
                          <Text
                            style={[
                              styles.td,
                              {
                                flex: 1.2,
                                textAlign: "right",
                                color: theme.text,
                              },
                            ]}
                          >
                            {it.unitPrice} TND
                          </Text>
                          <Text
                            style={[
                              styles.td,
                              {
                                flex: 1.2,
                                textAlign: "right",
                                color: theme.text,
                                fontWeight: "bold",
                              },
                            ]}
                          >
                            {it.totalHT} TND
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {rec.notes ? (
                    <Text
                      style={[
                        styles.infoText,
                        { color: theme.text, marginTop: 6 },
                      ]}
                    >
                      💬 Notes: {rec.notes}
                    </Text>
                  ) : null}

                  <View
                    style={[styles.jobFooter, { borderTopColor: theme.border }]}
                  >
                    {/* Clickable Status */}
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedReceiptForStatus(rec);
                        setShowStatusModal(true);
                      }}
                    >
                      <Text
                        style={{
                          color:
                            rec.status === "Pending" ? "#ef4444" : "#10b981",
                          fontWeight: "bold",
                          textDecorationLine: "underline",
                        }}
                      >
                        Status: {rec.status} 🔽
                      </Text>
                    </TouchableOpacity>

                    <Text style={[styles.jobTotalText, { color: theme.text }]}>
                      Total: {rec.amount} TND
                    </Text>
                  </View>

                  {/* Card Actions: Edit & Delete */}
                  <View
                    style={[
                      styles.cardActionRow,
                      { borderTopColor: theme.border },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.cardActionBtn,
                        {
                          backgroundColor: theme.inputBg,
                          borderColor: theme.border,
                          borderWidth: 1,
                        },
                      ]}
                      onPress={() => openEditReceiptModal(rec)}
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={14}
                        color={theme.text}
                      />
                      <Text
                        style={[styles.cardActionText, { color: theme.text }]}
                      >
                        Update
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.cardActionBtn,
                        { backgroundColor: "#ef4444" },
                      ]}
                      onPress={() => handleDeleteReceipt(rec.id)}
                    >
                      <Ionicons name="trash-outline" size={14} color="#fff" />
                      <Text style={[styles.cardActionText, { color: "#fff" }]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeSubTab === "overview" && (
          <View>
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Supplier Details
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                📞 Phone: {supplier?.phone}
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                📍 Address: {supplier?.address || "Not specified"}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* STATUS CHANGE MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showStatusModal}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.statusModalOverlay}>
          <View
            style={[
              styles.statusModalBox,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Update Payment Status
            </Text>
            <TouchableOpacity
              style={[styles.statusOptionBtn, { backgroundColor: "#10b981" }]}
              onPress={() => handleUpdateStatus("Settled")}
            >
              <Text style={styles.statusOptionText}>
                Mark as Settled (Paid Full)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusOptionBtn, { backgroundColor: "#ef4444" }]}
              onPress={() => handleUpdateStatus("Pending")}
            >
              <Text style={styles.statusOptionText}>Mark as Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusOptionBtn,
                {
                  backgroundColor: theme.inputBg,
                  borderWidth: 1,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={[styles.statusOptionText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ADD / EDIT RECEIPT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReceiptModal}
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <SafeAreaView
          style={[styles.modalOverlay, { backgroundColor: theme.background }]}
        >
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingReceiptId
                  ? "Edit Supplier Receipt"
                  : "Log Supplier Receipt"}
              </Text>
              <TouchableOpacity onPress={() => setShowReceiptModal(false)}>
                <Ionicons name="close-circle" size={28} color={theme.subText} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: theme.subText }]}>
              Receipt / Invoice Number
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBg,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="e.g. REC-9921"
              placeholderTextColor={theme.placeholder}
              value={receiptNumber}
              onChangeText={setReceiptNumber}
            />

            <Text style={[styles.fieldLabel, { color: theme.subText }]}>
              Date
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBg,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.placeholder}
              value={receiptDate}
              onChangeText={setReceiptDate}
            />

            <Text style={[styles.fieldLabel, { color: theme.subText }]}>
              Category
            </Text>
            <View style={styles.chipRow}>
              {[
                "Parts Stock",
                "Tools & Equipment",
                "Cables & Wiring",
                "Solar",
                "Other",
              ].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    receiptCategory === cat
                      ? { backgroundColor: theme.accent }
                      : {
                          backgroundColor: theme.cardBg,
                          borderColor: theme.border,
                          borderWidth: 1,
                        },
                  ]}
                  onPress={() => setReceiptCategory(cat)}
                >
                  <Text
                    style={{
                      color: receiptCategory === cat ? "#fff" : theme.text,
                      fontSize: 13,
                      fontWeight: "bold",
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {receiptCategory === "Other" && (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.cardBg,
                    color: theme.text,
                    borderColor: theme.border,
                    marginTop: 6,
                  },
                ]}
                placeholder="Specify Custom Category"
                placeholderTextColor={theme.placeholder}
                value={customCategory}
                onChangeText={setCustomCategory}
              />
            )}

            {/* Detailed Facture Table */}
            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.text, marginTop: 14 },
              ]}
            >
              Itemized Facture (N / Article / Qté / P.U HT / Total HT)
            </Text>

            <View style={styles.tableLegendRow}>
              <Text
                style={[styles.legendCol, { flex: 2, color: theme.subText }]}
              >
                Article
              </Text>
              <Text
                style={[
                  styles.legendCol,
                  { flex: 0.8, textAlign: "center", color: theme.subText },
                ]}
              >
                Qté
              </Text>
              <Text
                style={[
                  styles.legendCol,
                  { flex: 1.2, textAlign: "right", color: theme.subText },
                ]}
              >
                P.U HT
              </Text>
              <View style={{ width: 26 }} />
            </View>

            {items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.partPickerRow,
                  { backgroundColor: theme.cardBg, borderColor: theme.border },
                ]}
              >
                <Text
                  style={{
                    color: theme.subText,
                    fontSize: 12,
                    fontWeight: "bold",
                    width: 16,
                  }}
                >
                  {index + 1}
                </Text>
                <TextInput
                  style={[
                    styles.inputSmall,
                    { flex: 2, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="Article"
                  placeholderTextColor={theme.placeholder}
                  value={item.article}
                  onChangeText={(val) =>
                    handleUpdateItem(item.id, "article", val)
                  }
                />
                <TextInput
                  style={[
                    styles.inputSmall,
                    {
                      flex: 0.8,
                      color: theme.text,
                      borderColor: theme.border,
                      textAlign: "center",
                    },
                  ]}
                  placeholder="Qty"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="numeric"
                  value={String(item.quantity)}
                  onChangeText={(val) =>
                    handleUpdateItem(item.id, "quantity", val)
                  }
                />
                <TextInput
                  style={[
                    styles.inputSmall,
                    {
                      flex: 1.2,
                      color: theme.text,
                      borderColor: theme.border,
                      textAlign: "right",
                    },
                  ]}
                  placeholder="Price"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="numeric"
                  value={String(item.unitPrice)}
                  onChangeText={(val) =>
                    handleUpdateItem(item.id, "unitPrice", val)
                  }
                />
                <TouchableOpacity
                  onPress={() => handleRemoveItemRow(item.id)}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="trash" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.addPartRowBtn, { borderColor: theme.accent }]}
              onPress={handleAddItemRow}
            >
              <Text style={[styles.addPartRowText, { color: theme.accent }]}>
                + Add Article Row
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.summaryBox,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.grandTotalText, { color: theme.accent }]}>
                Grand Total HT: {calculateGrandTotal().toFixed(2)} TND
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveJobBtn, { backgroundColor: theme.accent }]}
              onPress={handleSaveReceipt}
            >
              <Text style={styles.saveJobBtnText}>
                {editingReceiptId ? "Update Receipt" : "Save Receipt to Ledger"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
  },
  backBtn: { padding: 4 },
  editHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editBtnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  clientNameHeader: { fontSize: 18, fontWeight: "bold" },
  clientSubHeader: { fontSize: 12 },
  contactRow: { flexDirection: "row", padding: 12, borderWidth: 1, gap: 8 },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  contactBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  tabBar: { flexDirection: "row", borderWidth: 1 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13 },
  balanceBanner: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: "center",
  },
  bannerLabel: { fontSize: 13, fontWeight: "bold" },
  bannerAmount: { fontSize: 26, fontWeight: "bold", marginTop: 4 },
  infoCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  infoText: { fontSize: 14, marginBottom: 4 },
  addJobBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 6,
  },
  addJobBtnText: { fontWeight: "bold", fontSize: 14 },
  emptyText: { textAlign: "center", fontStyle: "italic", marginTop: 20 },
  jobCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  jobTitle: { fontSize: 15, fontWeight: "bold" },
  jobDate: { fontSize: 12, fontWeight: "bold" },
  receiptTable: {
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
    borderColor: "#cbd5e1",
  },
  tableHeadRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 4,
    marginBottom: 4,
    borderBottomColor: "#cbd5e1",
  },
  th: { fontSize: 11, fontWeight: "bold" },
  tableBodyRow: { flexDirection: "row", paddingVertical: 2 },
  td: { fontSize: 12 },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    alignItems: "center",
  },
  jobTotalText: { fontSize: 14, fontWeight: "bold" },
  cardActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  cardActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  cardActionText: { fontSize: 12, fontWeight: "bold" },
  modalOverlay: { flex: 1 },
  statusModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusModalBox: {
    width: "80%",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusOptionBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  statusOptionText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  inputSmall: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 13,
    borderWidth: 1,
  },
  sectionSubtitle: { fontSize: 14, fontWeight: "bold", marginVertical: 8 },
  tableLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 4,
    gap: 6,
  },
  legendCol: { fontSize: 11, fontWeight: "bold" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  partPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
    gap: 6,
  },
  addPartRowBtn: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  addPartRowText: { fontSize: 13, fontWeight: "bold" },
  summaryBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 12,
    alignItems: "flex-end",
  },
  grandTotalText: { fontSize: 16, fontWeight: "bold" },
  saveJobBtn: { paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  saveJobBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

// import { Ionicons } from "@expo/vector-icons";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Linking,
//   Modal,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useTheme } from "../context/ThemeContext";
// import {
//   addSupplierReceipt,
//   getSupplierReceipts,
//   updateContact,
// } from "../services/crmService";

// export default function SupplierDetailScreen({
//   supplier: initialSupplier,
//   onBack,
// }) {
//   const { theme } = useTheme();
//   const [supplier, setSupplier] = useState(initialSupplier);
//   const [activeSubTab, setActiveSubTab] = useState("ledger"); // 'ledger' | 'overview'
//   const [receipts, setReceipts] = useState([]);
//   const [loadingReceipts, setLoadingReceipts] = useState(false);

//   // Edit Supplier Modal State
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editName, setEditName] = useState(supplier?.name || "");
//   const [editPhone, setEditPhone] = useState(supplier?.phone || "");
//   const [editAddress, setEditAddress] = useState(supplier?.address || "");
//   const [specialties, setSpecialties] = useState(
//     supplier?.specialties || "Disjoncteurs, Câbles, Tableaux",
//   );
//   const [savingEdit, setSavingEdit] = useState(false);

//   // Add Receipt Modal State (OCR / Manual Log)
//   const [showReceiptModal, setShowReceiptModal] = useState(false);
//   const [receiptNumber, setReceiptNumber] = useState("");
//   const [receiptAmount, setReceiptAmount] = useState("");
//   const [receiptCategory, setReceiptCategory] = useState("Parts Stock");
//   const [receiptDate, setReceiptDate] = useState("2026-10-15");
//   const [receiptNotes, setReceiptNotes] = useState("");

//   const loadReceipts = async () => {
//     if (!supplier?.id) return;
//     setLoadingReceipts(true);
//     const res = await getSupplierReceipts(supplier.id);
//     if (res.success) {
//       setReceipts(res.data);
//     } else {
//       Alert.alert("Error", res.error);
//     }
//     setLoadingReceipts(false);
//   };

//   useEffect(() => {
//     loadReceipts();
//   }, [supplier]);

//   const handleSaveSupplierInfo = async () => {
//     if (!editName || !editPhone) {
//       Alert.alert("Validation Error", "Name and Phone are required.");
//       return;
//     }
//     setSavingEdit(true);

//     const updatedData = {
//       name: editName,
//       phone: editPhone,
//       address: editAddress,
//       specialties: specialties.split(",").map((s) => s.trim()),
//     };

//     const res = await updateContact(supplier.id, updatedData);
//     setSavingEdit(false);

//     if (res.success) {
//       setSupplier({ ...supplier, ...updatedData });
//       setShowEditModal(false);
//       Alert.alert("Success", "Supplier details updated!");
//     } else {
//       Alert.alert("Error", res.error);
//     }
//   };

//   const handleSaveReceipt = async () => {
//     if (!receiptNumber || !receiptAmount) {
//       Alert.alert(
//         "Validation Error",
//         "Receipt Number and Amount are required.",
//       );
//       return;
//     }

//     const newReceipt = {
//       receiptNumber,
//       amount: parseFloat(receiptAmount) || 0,
//       category: receiptCategory,
//       date: receiptDate,
//       status: "Pending",
//       notes: receiptNotes,
//     };

//     const res = await addSupplierReceipt(supplier.id, newReceipt);
//     if (res.success) {
//       setReceiptNumber("");
//       setReceiptAmount("");
//       setReceiptNotes("");
//       setShowReceiptModal(false);
//       loadReceipts();
//       Alert.alert("Success", "Receipt logged successfully to ledger!");
//     } else {
//       Alert.alert("Error", res.error);
//     }
//   };

//   const calculateTotalOwed = () =>
//     receipts.reduce(
//       (acc, r) => (r.status === "Pending" ? acc + (r.amount || 0) : acc),
//       0,
//     );

//   const triggerCall = () => {
//     if (supplier?.phone) Linking.openURL(`tel:${supplier.phone}`);
//   };

//   const triggerWhatsApp = () => {
//     if (!supplier?.phone) return;
//     const msg = encodeURIComponent(
//       `Hello ${supplier.name}, regarding our material orders with WELEC...`,
//     );
//     Linking.openURL(
//       `https://wa.me/${supplier.phone.replace(/[^0-9]/g, "")}?text=${msg}`,
//     );
//   };

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: theme.background }]}
//     >
//       {/* Header Bar */}
//       <View
//         style={[
//           styles.header,
//           { backgroundColor: theme.cardBg, borderColor: theme.border },
//         ]}
//       >
//         <TouchableOpacity onPress={onBack} style={styles.backBtn}>
//           <Ionicons name="arrow-back" size={22} color={theme.text} />
//         </TouchableOpacity>
//         <View style={{ flex: 1, marginLeft: 10 }}>
//           <Text style={[styles.clientNameHeader, { color: theme.text }]}>
//             {supplier?.name || "Supplier Detail"}
//           </Text>
//           <Text style={[styles.clientSubHeader, { color: theme.subText }]}>
//             🏢 Supplier Ledger
//           </Text>
//         </View>
//         <TouchableOpacity
//           style={[styles.editHeaderBtn, { backgroundColor: theme.accent }]}
//           onPress={() => setShowEditModal(true)}
//         >
//           <Ionicons name="create-outline" size={16} color="#fff" />
//           <Text style={styles.editBtnText}>Edit</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Quick Action Contact Bar */}
//       <View
//         style={[
//           styles.contactRow,
//           { backgroundColor: theme.cardBg, borderColor: theme.border },
//         ]}
//       >
//         <TouchableOpacity
//           style={[styles.contactBtn, { backgroundColor: "#10b981" }]}
//           onPress={triggerCall}
//         >
//           <Ionicons name="call" size={16} color="#fff" />
//           <Text style={styles.contactBtnText}>Call</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.contactBtn, { backgroundColor: "#25D366" }]}
//           onPress={triggerWhatsApp}
//         >
//           <Ionicons name="logo-whatsapp" size={16} color="#fff" />
//           <Text style={styles.contactBtnText}>WhatsApp</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.contactBtn, { backgroundColor: theme.accent }]}
//           onPress={() => setShowReceiptModal(true)}
//         >
//           <Ionicons name="camera" size={16} color="#fff" />
//           <Text style={styles.contactBtnText}>📷 Scan Receipt</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Sub Navigation Tabs */}
//       <View
//         style={[
//           styles.tabBar,
//           { backgroundColor: theme.cardBg, borderColor: theme.border },
//         ]}
//       >
//         <TouchableOpacity
//           style={[
//             styles.tabItem,
//             activeSubTab === "ledger" && {
//               borderBottomColor: theme.accent,
//               borderBottomWidth: 2,
//             },
//           ]}
//           onPress={() => setActiveSubTab("ledger")}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeSubTab === "ledger"
//                 ? { color: theme.accent, fontWeight: "bold" }
//                 : { color: theme.subText },
//             ]}
//           >
//             🧾 Expense Ledger ({receipts.length})
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.tabItem,
//             activeSubTab === "overview" && {
//               borderBottomColor: theme.accent,
//               borderBottomWidth: 2,
//             },
//           ]}
//           onPress={() => setActiveSubTab("overview")}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeSubTab === "overview"
//                 ? { color: theme.accent, fontWeight: "bold" }
//                 : { color: theme.subText },
//             ]}
//           >
//             📋 Overview & Specialties
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 16 }}>
//         {/* TAB 1: LEDGER & RECEIPTS */}
//         {activeSubTab === "ledger" && (
//           <View>
//             {/* Balance Summary Banner */}
//             <View
//               style={[
//                 styles.balanceBanner,
//                 { backgroundColor: theme.cardBg, borderColor: theme.border },
//               ]}
//             >
//               <Text style={[styles.bannerLabel, { color: theme.subText }]}>
//                 Outstanding Balance Owed to Supplier:
//               </Text>
//               <Text
//                 style={[
//                   styles.bannerAmount,
//                   { color: calculateTotalOwed() > 0 ? "#ef4444" : "#10b981" },
//                 ]}
//               >
//                 {calculateTotalOwed().toFixed(2)} TND
//               </Text>
//             </View>

//             <TouchableOpacity
//               style={[styles.addJobBtn, { backgroundColor: theme.accent }]}
//               onPress={() => setShowReceiptModal(true)}
//             >
//               <Ionicons name="receipt" size={20} color="#fff" />
//               <Text style={[styles.addJobBtnText, { color: "#fff" }]}>
//                 Log New Supplier Receipt / Invoice
//               </Text>
//             </TouchableOpacity>

//             {loadingReceipts ? (
//               <ActivityIndicator
//                 size="large"
//                 color={theme.accent}
//                 style={{ marginTop: 20 }}
//               />
//             ) : receipts.length === 0 ? (
//               <Text style={[styles.emptyText, { color: theme.subText }]}>
//                 No receipts logged for this supplier yet.
//               </Text>
//             ) : (
//               receipts.map((rec) => (
//                 <View
//                   key={rec.id}
//                   style={[
//                     styles.jobCard,
//                     {
//                       backgroundColor: theme.cardBg,
//                       borderColor: theme.border,
//                     },
//                   ]}
//                 >
//                   <View style={styles.jobCardHeader}>
//                     <Text style={[styles.jobTitle, { color: theme.text }]}>
//                       Receipt #{rec.receiptNumber}
//                     </Text>
//                     <Text style={[styles.jobDate, { color: theme.accent }]}>
//                       📅 {rec.date}
//                     </Text>
//                   </View>
//                   <Text style={[styles.infoText, { color: theme.subText }]}>
//                     🏷️ Category: {rec.category}
//                   </Text>
//                   {rec.notes ? (
//                     <Text style={[styles.infoText, { color: theme.text }]}>
//                       💬 Notes: {rec.notes}
//                     </Text>
//                   ) : null}

//                   <View
//                     style={[styles.jobFooter, { borderTopColor: theme.border }]}
//                   >
//                     <Text
//                       style={{
//                         color: rec.status === "Pending" ? "#ef4444" : "#10b981",
//                         fontWeight: "bold",
//                       }}
//                     >
//                       Status: {rec.status}
//                     </Text>
//                     <Text style={[styles.jobTotalText, { color: theme.text }]}>
//                       Amount: {rec.amount} TND
//                     </Text>
//                   </View>
//                 </View>
//               ))
//             )}
//           </View>
//         )}

//         {/* TAB 2: OVERVIEW & SPECIALTIES */}
//         {activeSubTab === "overview" && (
//           <View>
//             <View
//               style={[
//                 styles.infoCard,
//                 { backgroundColor: theme.cardBg, borderColor: theme.border },
//               ]}
//             >
//               <Text style={[styles.cardTitle, { color: theme.text }]}>
//                 Supplier Details
//               </Text>
//               <Text style={[styles.infoText, { color: theme.text }]}>
//                 📞 Phone: {supplier?.phone}
//               </Text>
//               <Text style={[styles.infoText, { color: theme.text }]}>
//                 📍 Address: {supplier?.address || "Not specified"}
//               </Text>
//             </View>

//             <View
//               style={[
//                 styles.infoCard,
//                 {
//                   backgroundColor: theme.cardBg,
//                   borderColor: theme.border,
//                   marginTop: 12,
//                 },
//               ]}
//             >
//               <Text style={[styles.cardTitle, { color: theme.text }]}>
//                 Specialty Materials Supplied
//               </Text>
//               <View style={styles.chipRow}>
//                 {supplier?.specialties ? (
//                   Array.isArray(supplier.specialties) ? (
//                     supplier.specialties.map((spec, i) => (
//                       <View
//                         key={i}
//                         style={[
//                           styles.specChip,
//                           {
//                             backgroundColor: theme.inputBg,
//                             borderColor: theme.border,
//                           },
//                         ]}
//                       >
//                         <Text
//                           style={{
//                             color: theme.text,
//                             fontSize: 13,
//                             fontWeight: "600",
//                           }}
//                         >
//                           ⚡ {spec}
//                         </Text>
//                       </View>
//                     ))
//                   ) : (
//                     <Text style={[styles.infoText, { color: theme.text }]}>
//                       {supplier.specialties}
//                     </Text>
//                   )
//                 ) : (
//                   <Text style={[styles.infoText, { color: theme.subText }]}>
//                     No specialties listed.
//                   </Text>
//                 )}
//               </View>
//             </View>
//           </View>
//         )}
//       </ScrollView>

//       {/* EDIT SUPPLIER MODAL */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={showEditModal}
//         onRequestClose={() => setShowEditModal(false)}
//       >
//         <SafeAreaView
//           style={[styles.modalOverlay, { backgroundColor: theme.background }]}
//         >
//           <ScrollView contentContainerStyle={{ padding: 20 }}>
//             <View style={styles.modalHeaderRow}>
//               <Text style={[styles.modalTitle, { color: theme.text }]}>
//                 Update Supplier Info
//               </Text>
//               <TouchableOpacity onPress={() => setShowEditModal(false)}>
//                 <Ionicons name="close-circle" size={28} color={theme.subText} />
//               </TouchableOpacity>
//             </View>

//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: theme.cardBg,
//                   color: theme.text,
//                   borderColor: theme.border,
//                 },
//               ]}
//               placeholder="Company / Supplier Name"
//               placeholderTextColor={theme.placeholder}
//               value={editName}
//               onChangeText={setEditName}
//             />
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: theme.cardBg,
//                   color: theme.text,
//                   borderColor: theme.border,
//                 },
//               ]}
//               placeholder="Phone Number"
//               placeholderTextColor={theme.placeholder}
//               value={editPhone}
//               onChangeText={setEditPhone}
//               keyboardType="phone-pad"
//             />
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: theme.cardBg,
//                   color: theme.text,
//                   borderColor: theme.border,
//                 },
//               ]}
//               placeholder="Address / Warehouse Location"
//               placeholderTextColor={theme.placeholder}
//               value={editAddress}
//               onChangeText={setEditAddress}
//             />
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: theme.cardBg,
//                   color: theme.text,
//                   borderColor: theme.border,
//                 },
//               ]}
//               placeholder="Specialties (comma separated)"
//               placeholderTextColor={theme.placeholder}
//               value={specialties}
//               onChangeText={setSpecialties}
//             />

//             <TouchableOpacity
//               style={[
//                 styles.saveJobBtn,
//                 { backgroundColor: theme.accent, marginTop: 20 },
//               ]}
//               onPress={handleSaveSupplierInfo}
//               disabled={savingEdit}
//             >
//               {savingEdit ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.saveJobBtnText}>Save Updates</Text>
//               )}
//             </TouchableOpacity>
//           </ScrollView>
//         </SafeAreaView>
//       </Modal>

//       {/* LOG SUPPLIER RECEIPT MODAL */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={showReceiptModal}
//         onRequestClose={() => setShowReceiptModal(false)}
//       >
//         <SafeAreaView
//           style={[styles.modalOverlay, { backgroundColor: theme.background }]}
//         >
//           <ScrollView contentContainerStyle={{ padding: 20 }}>
//             <View style={styles.modalHeaderRow}>
//               <Text style={[styles.modalTitle, { color: theme.text }]}>
//                 📷 Scan / Log Supplier Receipt
//               </Text>
//               <TouchableOpacity onPress={() => setShowReceiptModal(false)}>
//                 <Ionicons name="close-circle" size={28} color={theme.subText} />
//               </TouchableOpacity>
//             </View>

//             <Text style={[styles.fieldLabel, { color: theme.subText }]}>
//               Receipt / Invoice Number
//             </Text>
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: theme.cardBg,
//                   color: theme.text,
//                   borderColor: theme.border,
//                 },
//               ]}
//               placeholder="e.g. REC-9921"
//               placeholderTextColor={theme.placeholder}
//               value={receiptNumber}
//               onChangeText={setReceiptNumber}
//             />

//             <Text style={[styles.fieldLabel, { color: theme.subText }]}>
//               Total Amount (TND)
//             </Text>
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: theme.cardBg,
//                   color: theme.text,
//                   borderColor: theme.border,
//                 },
//               ]}
//               placeholder="0.00"
//               placeholderTextColor={theme.placeholder}
//               keyboardType="numeric"
//               value={receiptAmount}
//               onChangeText={setReceiptAmount}
//             />

//             <Text style={[styles.fieldLabel, { color: theme.subText }]}>
//               Receipt Date
//             </Text>
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: theme.cardBg,
//                   color: theme.text,
//                   borderColor: theme.border,
//                 },
//               ]}
//               placeholder="YYYY-MM-DD"
//               placeholderTextColor={theme.placeholder}
//               value={receiptDate}
//               onChangeText={setReceiptDate}
//             />

//             <Text style={[styles.fieldLabel, { color: theme.subText }]}>
//               Category
//             </Text>
//             <View style={styles.chipRow}>
//               {[
//                 "Parts Stock",
//                 "Tools & Equipment",
//                 "Cables & Wiring",
//                 "Solar",
//               ].map((cat) => (
//                 <TouchableOpacity
//                   key={cat}
//                   style={[
//                     styles.chip,
//                     receiptCategory === cat
//                       ? { backgroundColor: theme.accent }
//                       : {
//                           backgroundColor: theme.cardBg,
//                           borderColor: theme.border,
//                           borderWidth: 1,
//                         },
//                   ]}
//                   onPress={() => setReceiptCategory(cat)}
//                 >
//                   <Text
//                     style={{
//                       color: receiptCategory === cat ? "#fff" : theme.text,
//                       fontSize: 13,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     {cat}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Text
//               style={[
//                 styles.fieldLabel,
//                 { color: theme.subText, marginTop: 10 },
//               ]}
//             >
//               Notes / Parts Purchased
//             </Text>
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: theme.cardBg,
//                   color: theme.text,
//                   borderColor: theme.border,
//                   height: 70,
//                 },
//               ]}
//               placeholder="e.g. 5x Circuit Breakers 32A"
//               placeholderTextColor={theme.placeholder}
//               multiline
//               value={receiptNotes}
//               onChangeText={setReceiptNotes}
//             />

//             <TouchableOpacity
//               style={[
//                 styles.saveJobBtn,
//                 { backgroundColor: theme.accent, marginTop: 20 },
//               ]}
//               onPress={handleSaveReceipt}
//             >
//               <Text style={styles.saveJobBtnText}>Save to Supplier Ledger</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 14,
//     borderWidth: 1,
//   },
//   backBtn: { padding: 4 },
//   editHeaderBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 6,
//     gap: 4,
//   },
//   editBtnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
//   clientNameHeader: { fontSize: 18, fontWeight: "bold" },
//   clientSubHeader: { fontSize: 12 },
//   contactRow: { flexDirection: "row", padding: 12, borderWidth: 1, gap: 8 },
//   contactBtn: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderRadius: 8,
//     gap: 6,
//   },
//   contactBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
//   tabBar: { flexDirection: "row", borderWidth: 1 },
//   tabItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
//   tabText: { fontSize: 13 },
//   balanceBanner: {
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     marginBottom: 16,
//     alignItems: "center",
//   },
//   bannerLabel: { fontSize: 13, fontWeight: "bold" },
//   bannerAmount: { fontSize: 26, fontWeight: "bold", marginTop: 4 },
//   infoCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
//   cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
//   infoText: { fontSize: 14, marginBottom: 6 },
//   chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
//   specChip: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//     borderWidth: 1,
//   },
//   addJobBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 16,
//     gap: 6,
//   },
//   addJobBtnText: { fontWeight: "bold", fontSize: 14 },
//   emptyText: { textAlign: "center", fontStyle: "italic", marginTop: 20 },
//   jobCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
//   jobCardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   jobTitle: { fontSize: 15, fontWeight: "bold" },
//   jobDate: { fontSize: 12, fontWeight: "bold" },
//   jobFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingTop: 8,
//     marginTop: 8,
//     borderTopWidth: 1,
//     alignItems: "center",
//   },
//   jobTotalText: { fontSize: 14, fontWeight: "bold" },
//   modalOverlay: { flex: 1 },
//   modalHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   modalTitle: { fontSize: 18, fontWeight: "bold" },
//   fieldLabel: {
//     fontSize: 12,
//     fontWeight: "bold",
//     marginBottom: 4,
//     marginTop: 8,
//   },
//   input: {
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//     fontSize: 14,
//     borderWidth: 1,
//   },
//   chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
//   saveJobBtn: { paddingVertical: 14, borderRadius: 10, alignItems: "center" },
//   saveJobBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
// });
