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
  addJobLog,
  getJobLogs,
  updateContact,
  updateJobLog,
} from "../services/crmService";

export default function ClientDetailScreen({ client: initialClient, onBack }) {
  const { theme } = useTheme();
  const [client, setClient] = useState(initialClient);
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [jobLogs, setJobLogs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Edit Client Info State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(client?.name || "");
  const [editPhone, setEditPhone] = useState(client?.phone || "");
  const [editAddress, setEditAddress] = useState(client?.address || "");
  const [propertyType, setPropertyType] = useState(
    client?.buildingType || "Residential",
  );
  const [customPropertyType, setCustomPropertyType] = useState("");
  const [meterType, setMeterType] = useState(
    client?.meterType || "Single-Phase 230V",
  );
  const [customMeterType, setCustomMeterType] = useState("");
  const [mainBreaker, setMainBreaker] = useState(
    client?.mainBreaker || "32A Standard",
  );
  const [customMainBreaker, setCustomMainBreaker] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Job Log Modal State (Supports both Create and Edit)
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null); // null = create mode, id = edit mode
  const [jobDate, setJobDate] = useState("2026-10-15"); // Today's default date
  const [jobTitle, setJobTitle] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [remarks, setRemarks] = useState("");
  const [parts, setParts] = useState([
    {
      id: "1",
      partName: "Electric Cable 2.5mm",
      quantity: 1,
      unitPrice: 4.0,
      totalPrice: 4.0,
    },
  ]);

  const loadJobs = async () => {
    if (!client?.id) return;
    setLoadingJobs(true);
    const res = await getJobLogs(client.id);
    if (res.success) {
      setJobLogs(res.data);
    } else {
      Alert.alert("Error", res.error);
    }
    setLoadingJobs(false);
  };

  useEffect(() => {
    loadJobs();
  }, [client]);

  // Reset Job Modal Form
  const openNewJobModal = () => {
    setEditingJobId(null);
    setJobDate("2026-10-15");
    setJobTitle("");
    setLaborCost("");
    setRemarks("");
    setParts([
      { id: "1", partName: "", quantity: 1, unitPrice: 0.0, totalPrice: 0.0 },
    ]);
    setShowAddJobModal(true);
  };

  // Open Job Modal in Edit Mode
  const openEditJobModal = (job) => {
    setEditingJobId(job.id);
    setJobDate(job.date || "2026-10-15");
    setJobTitle(job.jobTitle || "");
    setLaborCost(String(job.laborCost || ""));
    setRemarks(job.remarks || "");
    setParts(
      job.parts && job.parts.length > 0
        ? job.parts
        : [
            {
              id: "1",
              partName: "",
              quantity: 1,
              unitPrice: 0.0,
              totalPrice: 0.0,
            },
          ],
    );
    setShowAddJobModal(true);
  };

  // Dynamic Parts Handlers
  const handleAddPartRow = () => {
    setParts([
      ...parts,
      {
        id: Date.now().toString(),
        partName: "",
        quantity: 1,
        unitPrice: 0.0,
        totalPrice: 0.0,
      },
    ]);
  };

  const handleUpdatePart = (id, field, value) => {
    setParts(
      parts.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            const qty =
              field === "quantity" ? parseFloat(value) || 0 : p.quantity;
            const price =
              field === "unitPrice" ? parseFloat(value) || 0 : p.unitPrice;
            updated.totalPrice = qty * price;
          }
          return updated;
        }
        return p;
      }),
    );
  };

  const handleRemovePartRow = (id) => {
    if (parts.length === 1) return;
    setParts(parts.filter((p) => p.id !== id));
  };

  const calculatePartsTotal = () =>
    parts.reduce((acc, p) => acc + (p.totalPrice || 0), 0);
  const calculateGrandTotal = () =>
    calculatePartsTotal() + (parseFloat(laborCost) || 0);

  // Save or Update Job Log
  const handleSaveJobLog = async () => {
    if (!jobTitle) {
      Alert.alert("Validation Error", "Please enter a Job Title.");
      return;
    }

    const jobData = {
      jobTitle,
      date: jobDate,
      status: "completed",
      parts,
      totalPartsCost: calculatePartsTotal(),
      laborCost: parseFloat(laborCost) || 0,
      totalJobPrice: calculateGrandTotal(),
      remarks,
    };

    let res;
    if (editingJobId) {
      res = await updateJobLog(client.id, editingJobId, jobData);
    } else {
      res = await addJobLog(client.id, jobData);
    }

    if (res.success) {
      setShowAddJobModal(false);
      loadJobs();
      Alert.alert(
        "Success",
        editingJobId ? "Intervention updated!" : "Job Intervention logged!",
      );
    } else {
      Alert.alert("Error", res.error);
    }
  };

  // Share Job Summary to WhatsApp
  const shareJobToWhatsApp = (job) => {
    let partsSummary = "";
    if (job.parts && job.parts.length > 0) {
      partsSummary = job.parts
        .map(
          (p) =>
            `• ${p.partName}: ${p.quantity}x @ ${p.unitPrice} TND = ${p.totalPrice} TND`,
        )
        .join("\n");
    }

    const message =
      `⚡ *WELEC Electrical Maintenance Summary*\n` +
      `👤 Client: ${client?.name}\n` +
      `📅 Date: ${job.date}\n` +
      `🛠️ Intervention: ${job.jobTitle}\n\n` +
      `*Itemized Materials Used:*\n${partsSummary || "None"}\n\n` +
      `👷 Labor Charge: ${job.laborCost || 0} TND\n` +
      `💰 *Total Amount: ${job.totalJobPrice || 0} TND*\n\n` +
      `Thank you for choosing WELEC!`;

    const encodedMsg = encodeURIComponent(message);
    const formattedPhone = client?.phone
      ? client.phone.replace(/[^0-9]/g, "")
      : "";
    Linking.openURL(`https://wa.me/${formattedPhone}?text=${encodedMsg}`);
  };

  const handleSaveClientInfo = async () => {
    if (!editName || !editPhone) {
      Alert.alert("Validation Error", "Name and Phone are required.");
      return;
    }
    setSavingEdit(true);

    const finalBuildingType =
      propertyType === "Other" ? customPropertyType || "Other" : propertyType;
    const finalMeterType =
      meterType === "Other" ? customMeterType || "Other" : meterType;
    const finalMainBreaker =
      mainBreaker === "Other" ? customMainBreaker || "Other" : mainBreaker;

    const updatedData = {
      name: editName,
      phone: editPhone,
      address: editAddress,
      buildingType: finalBuildingType,
      meterType: finalMeterType,
      mainBreaker: finalMainBreaker,
    };

    const res = await updateContact(client.id, updatedData);
    setSavingEdit(false);

    if (res.success) {
      setClient({ ...client, ...updatedData });
      setShowEditModal(false);
      Alert.alert("Success", "Client details updated!");
    } else {
      Alert.alert("Error", res.error);
    }
  };

  const openGoogleMaps = () => {
    if (!client?.address) return;
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`,
    );
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
            {client?.name || "Client Detail"}
          </Text>
          <Text style={[styles.clientSubHeader, { color: theme.subText }]}>
            {client?.phone}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.editHeaderBtn, { backgroundColor: theme.accent }]}
          onPress={() => setShowEditModal(true)}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.editBtnText}>Edit Info</Text>
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
            📋 Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeSubTab === "jobs" && {
              borderBottomColor: theme.accent,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveSubTab("jobs")}
        >
          <Text
            style={[
              styles.tabText,
              activeSubTab === "jobs"
                ? { color: theme.accent, fontWeight: "bold" }
                : { color: theme.subText },
            ]}
          >
            🛠️ Job History ({jobLogs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeSubTab === "docs" && {
              borderBottomColor: theme.accent,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveSubTab("docs")}
        >
          <Text
            style={[
              styles.tabText,
              activeSubTab === "docs"
                ? { color: theme.accent, fontWeight: "bold" }
                : { color: theme.subText },
            ]}
          >
            🧾 Documents
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* TAB 1: OVERVIEW */}
        {activeSubTab === "overview" && (
          <View>
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Contact & Location
                </Text>
                <TouchableOpacity onPress={() => setShowEditModal(true)}>
                  <Ionicons name="pencil" size={18} color={theme.accent} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.infoText, { color: theme.text }]}>
                📞 Phone: {client?.phone}
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                📍 Address: {client?.address || "Not specified"}
              </Text>
              {client?.address ? (
                <TouchableOpacity
                  style={[styles.mapBtn, { backgroundColor: theme.accent }]}
                  onPress={openGoogleMaps}
                >
                  <Ionicons name="map-outline" size={16} color="#fff" />
                  <Text style={styles.mapBtnText}>Open in Google Maps</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                  marginTop: 12,
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Electrical Technical Specs
                </Text>
                <TouchableOpacity onPress={() => setShowEditModal(true)}>
                  <Ionicons name="pencil" size={18} color={theme.accent} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.infoText, { color: theme.text }]}>
                🏢 Property Type: {client?.buildingType || "Residential"}
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                ⚡ Meter Type: {client?.meterType || "Single-Phase 230V"}
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                🔌 Main Breaker: {client?.mainBreaker || "32A Standard"}
              </Text>
            </View>
          </View>
        )}

        {/* TAB 2: JOB HISTORY & ITEMIZED PARTS */}
        {activeSubTab === "jobs" && (
          <View>
            <TouchableOpacity
              style={[styles.addJobBtn, { backgroundColor: theme.accent }]}
              onPress={openNewJobModal}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addJobBtnText}>Log New Job Intervention</Text>
            </TouchableOpacity>

            {loadingJobs ? (
              <ActivityIndicator
                size="large"
                color={theme.accent}
                style={{ marginTop: 20 }}
              />
            ) : jobLogs.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.subText }]}>
                No past job logs recorded yet.
              </Text>
            ) : (
              jobLogs.map((job) => (
                <View
                  key={job.id}
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
                      {job.jobTitle}
                    </Text>
                    <Text style={[styles.jobDate, { color: theme.accent }]}>
                      📅 {job.date}
                    </Text>
                  </View>

                  {job.parts && job.parts.length > 0 ? (
                    <View style={styles.partsTable}>
                      <Text
                        style={[
                          styles.tableHeaderTitle,
                          { color: theme.subText },
                        ]}
                      >
                        📦 Itemized Parts Used:
                      </Text>
                      {job.parts.map((p, idx) => (
                        <View key={idx} style={styles.tableRow}>
                          <Text style={[styles.colName, { color: theme.text }]}>
                            {p.partName || "Part"}
                          </Text>
                          <Text
                            style={[styles.colQty, { color: theme.subText }]}
                          >
                            {p.quantity}x
                          </Text>
                          <Text
                            style={[styles.colPrice, { color: theme.text }]}
                          >
                            {p.totalPrice} TND
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <View
                    style={[styles.jobFooter, { borderTopColor: theme.border }]}
                  >
                    <Text style={[styles.jobFeeText, { color: theme.subText }]}>
                      Labor Charge: {job.laborCost || 0} TND
                    </Text>
                    <Text style={[styles.jobTotalText, { color: "#10b981" }]}>
                      Total: {job.totalJobPrice || 0} TND
                    </Text>
                  </View>

                  {/* Card Action Row: Edit & Share to WhatsApp */}
                  <View
                    style={[
                      styles.jobActionRow,
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
                      onPress={() => openEditJobModal(job)}
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
                        { backgroundColor: "#25D366" },
                      ]}
                      onPress={() => shareJobToWhatsApp(job)}
                    >
                      <Ionicons name="logo-whatsapp" size={14} color="#fff" />
                      <Text style={[styles.cardActionText, { color: "#fff" }]}>
                        Share Summary
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: DOCUMENTS */}
        {activeSubTab === "docs" && (
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Linked Commercial Quotes & Invoices
            </Text>
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              No linked quotes or invoices. Phase 3 Billing integration ready.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* EDIT CLIENT DETAILS MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView
          style={[styles.modalOverlay, { backgroundColor: theme.background }]}
        >
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Update Client & Specs
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close-circle" size={28} color={theme.subText} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionSubtitle, { color: theme.text }]}>
              Contact Details
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
              placeholder="Full Name"
              placeholderTextColor={theme.placeholder}
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBg,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Phone Number"
              placeholderTextColor={theme.placeholder}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBg,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Address / Location"
              placeholderTextColor={theme.placeholder}
              value={editAddress}
              onChangeText={setEditAddress}
            />

            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.text, marginTop: 12 },
              ]}
            >
              Property Type
            </Text>
            <View style={styles.chipRow}>
              {["Residential", "Commercial", "Industrial", "Other"].map(
                (type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      propertyType === type
                        ? { backgroundColor: theme.accent }
                        : {
                            backgroundColor: theme.cardBg,
                            borderColor: theme.border,
                            borderWidth: 1,
                          },
                    ]}
                    onPress={() => setPropertyType(type)}
                  >
                    <Text
                      style={{
                        color: propertyType === type ? "#fff" : theme.text,
                        fontSize: 13,
                        fontWeight: "bold",
                      }}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
            {propertyType === "Other" && (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.cardBg,
                    color: theme.text,
                    borderColor: theme.border,
                    marginTop: 8,
                  },
                ]}
                placeholder="Specify Custom Property Type"
                placeholderTextColor={theme.placeholder}
                value={customPropertyType}
                onChangeText={setCustomPropertyType}
              />
            )}

            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.text, marginTop: 12 },
              ]}
            >
              Meter Type
            </Text>
            <View style={styles.chipRow}>
              {["Single-Phase 230V", "Three-Phase 380V", "Other"].map(
                (type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      meterType === type
                        ? { backgroundColor: theme.accent }
                        : {
                            backgroundColor: theme.cardBg,
                            borderColor: theme.border,
                            borderWidth: 1,
                          },
                    ]}
                    onPress={() => setMeterType(type)}
                  >
                    <Text
                      style={{
                        color: meterType === type ? "#fff" : theme.text,
                        fontSize: 13,
                        fontWeight: "bold",
                      }}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
            {meterType === "Other" && (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.cardBg,
                    color: theme.text,
                    borderColor: theme.border,
                    marginTop: 8,
                  },
                ]}
                placeholder="Specify Custom Meter Type"
                placeholderTextColor={theme.placeholder}
                value={customMeterType}
                onChangeText={setCustomMeterType}
              />
            )}

            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.text, marginTop: 12 },
              ]}
            >
              Main Breaker Capacity
            </Text>
            <View style={styles.chipRow}>
              {["32A Standard", "63A Industrial", "100A+", "Other"].map(
                (type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      mainBreaker === type
                        ? { backgroundColor: theme.accent }
                        : {
                            backgroundColor: theme.cardBg,
                            borderColor: theme.border,
                            borderWidth: 1,
                          },
                    ]}
                    onPress={() => setMainBreaker(type)}
                  >
                    <Text
                      style={{
                        color: mainBreaker === type ? "#fff" : theme.text,
                        fontSize: 13,
                        fontWeight: "bold",
                      }}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
            {mainBreaker === "Other" && (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.cardBg,
                    color: theme.text,
                    borderColor: theme.border,
                    marginTop: 8,
                  },
                ]}
                placeholder="Specify Custom Breaker Capacity"
                placeholderTextColor={theme.placeholder}
                value={customMainBreaker}
                onChangeText={setCustomMainBreaker}
              />
            )}

            <TouchableOpacity
              style={[
                styles.saveJobBtn,
                { backgroundColor: theme.accent, marginTop: 20 },
              ]}
              onPress={handleSaveClientInfo}
              disabled={savingEdit}
            >
              {savingEdit ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveJobBtnText}>Save Updates</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ADD / EDIT JOB INTERVENTION MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddJobModal}
        onRequestClose={() => setShowAddJobModal(false)}
      >
        <SafeAreaView
          style={[styles.modalOverlay, { backgroundColor: theme.background }]}
        >
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingJobId
                  ? "Edit Job Intervention"
                  : "Add New Job Intervention"}
              </Text>
              <TouchableOpacity onPress={() => setShowAddJobModal(false)}>
                <Ionicons name="close-circle" size={28} color={theme.subText} />
              </TouchableOpacity>
            </View>

            {/* Editable Intervention Date */}
            <Text style={[styles.fieldLabel, { color: theme.subText }]}>
              Intervention Date
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
              value={jobDate}
              onChangeText={setJobDate}
            />

            <Text style={[styles.fieldLabel, { color: theme.subText }]}>
              Job Title
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
              placeholder="e.g. Rewiring & Breaker Install"
              placeholderTextColor={theme.placeholder}
              value={jobTitle}
              onChangeText={setJobTitle}
            />

            {/* Column Legend / Header for Parts Table */}
            <Text style={[styles.sectionSubtitle, { color: theme.text }]}>
              Itemized Materials & Spare Parts
            </Text>

            <View style={styles.tableLegendRow}>
              <Text
                style={[styles.legendCol, { flex: 2, color: theme.subText }]}
              >
                Item Name
              </Text>
              <Text
                style={[
                  styles.legendCol,
                  { flex: 1, textAlign: "center", color: theme.subText },
                ]}
              >
                Qty
              </Text>
              <Text
                style={[
                  styles.legendCol,
                  { flex: 1.2, textAlign: "right", color: theme.subText },
                ]}
              >
                Unit Price (TND)
              </Text>
              <View style={{ width: 26 }} />
            </View>

            {parts.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.partPickerRow,
                  { backgroundColor: theme.cardBg, borderColor: theme.border },
                ]}
              >
                <TextInput
                  style={[
                    styles.inputSmall,
                    { flex: 2, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="Item Name"
                  placeholderTextColor={theme.placeholder}
                  value={item.partName}
                  onChangeText={(val) =>
                    handleUpdatePart(item.id, "partName", val)
                  }
                />
                <TextInput
                  style={[
                    styles.inputSmall,
                    {
                      flex: 1,
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
                    handleUpdatePart(item.id, "quantity", val)
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
                    handleUpdatePart(item.id, "unitPrice", val)
                  }
                />
                <TouchableOpacity
                  onPress={() => handleRemovePartRow(item.id)}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="trash" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.addPartRowBtn, { borderColor: theme.accent }]}
              onPress={handleAddPartRow}
            >
              <Text style={[styles.addPartRowText, { color: theme.accent }]}>
                + Add Material / Part
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.text, marginTop: 16 },
              ]}
            >
              Labor Charge & Summary
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
              placeholder="Labor Charge (TND)"
              placeholderTextColor={theme.placeholder}
              keyboardType="numeric"
              value={laborCost}
              onChangeText={setLaborCost}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBg,
                  color: theme.text,
                  borderColor: theme.border,
                  height: 70,
                },
              ]}
              placeholder="Technician Notes / Remarks"
              placeholderTextColor={theme.placeholder}
              multiline
              value={remarks}
              onChangeText={setRemarks}
            />

            <View
              style={[
                styles.summaryBox,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              <Text style={{ color: theme.subText }}>
                Parts Cost: {calculatePartsTotal().toFixed(2)} TND
              </Text>
              <Text style={{ color: theme.subText }}>
                Labor Charge: {(parseFloat(laborCost) || 0).toFixed(2)} TND
              </Text>
              <Text style={[styles.grandTotalText, { color: theme.accent }]}>
                Grand Total: {calculateGrandTotal().toFixed(2)} TND
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveJobBtn, { backgroundColor: theme.accent }]}
              onPress={handleSaveJobLog}
            >
              <Text style={styles.saveJobBtnText}>
                {editingJobId ? "Update Intervention" : "Save Job Intervention"}
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
  tabBar: { flexDirection: "row", borderWidth: 1 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13 },
  infoCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  infoText: { fontSize: 14, marginBottom: 6 },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  mapBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  addJobBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 6,
  },
  addJobBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  emptyText: { textAlign: "center", fontStyle: "italic", marginTop: 20 },
  jobCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  jobTitle: { fontSize: 15, fontWeight: "bold" },
  jobDate: { fontSize: 12, fontWeight: "bold" },
  partsTable: { marginVertical: 8 },
  tableHeaderTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  colName: { flex: 2, fontSize: 13 },
  colQty: { flex: 0.8, fontSize: 13, textAlign: "center" },
  colPrice: { flex: 1, fontSize: 13, textAlign: "right", fontWeight: "bold" },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  jobFeeText: { fontSize: 13 },
  jobTotalText: { fontSize: 14, fontWeight: "bold" },
  jobActionRow: {
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
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  fieldLabel: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
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
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  legendCol: { fontSize: 11, fontWeight: "bold" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  partPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
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
  grandTotalText: { fontSize: 16, fontWeight: "bold", marginTop: 4 },
  saveJobBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveJobBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

// import { Ionicons } from "@expo/vector-icons";
// import { useEffect, useState } from "react";
// import {
//     ActivityIndicator,
//     Alert,
//     Linking,
//     Modal,
//     SafeAreaView,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import { useTheme } from "../context/ThemeContext";
// import { addJobLog, getJobLogs, updateContact } from "../services/crmService";

// export default function ClientDetailScreen({ client: initialClient, onBack }) {
//   const { theme } = useTheme();
//   const [client, setClient] = useState(initialClient);
//   const [activeSubTab, setActiveSubTab] = useState("overview"); // 'overview' | 'jobs' | 'docs'
//   const [jobLogs, setJobLogs] = useState([]);
//   const [loadingJobs, setLoadingJobs] = useState(false);

//   // Edit Client Info & Technical Specs Modal State
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editName, setEditName] = useState(client?.name || "");
//   const [editPhone, setEditPhone] = useState(client?.phone || "");
//   const [editAddress, setEditAddress] = useState(client?.address || "");

//   // Tech Specs State with Custom Option Handlers
//   const [propertyType, setPropertyType] = useState(
//     client?.buildingType || "Residential",
//   );
//   const [customPropertyType, setCustomPropertyType] = useState("");

//   const [meterType, setMeterType] = useState(
//     client?.meterType || "Single-Phase 230V",
//   );
//   const [customMeterType, setCustomMeterType] = useState("");

//   const [mainBreaker, setMainBreaker] = useState(
//     client?.mainBreaker || "32A Standard",
//   );
//   const [customMainBreaker, setCustomMainBreaker] = useState("");

//   const [savingEdit, setSavingEdit] = useState(false);

//   // Add Job Log Modal State
//   const [showAddJobModal, setShowAddJobModal] = useState(false);
//   const [jobTitle, setJobTitle] = useState("");
//   const [laborCost, setLaborCost] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [parts, setParts] = useState([
//     {
//       id: "1",
//       partName: "Electric Cable 2.5mm",
//       quantity: 1,
//       unitPrice: 4.0,
//       totalPrice: 4.0,
//     },
//   ]);

//   const loadJobs = async () => {
//     if (!client?.id) return;
//     setLoadingJobs(true);
//     const res = await getJobLogs(client.id);
//     if (res.success) {
//       setJobLogs(res.data);
//     } else {
//       Alert.alert("Error", res.error);
//     }
//     setLoadingJobs(false);
//   };

//   useEffect(() => {
//     loadJobs();
//   }, [client]);

//   // Handle Save Updated Client Info & Tech Specs
//   const handleSaveClientInfo = async () => {
//     if (!editName || !editPhone) {
//       Alert.alert("Validation Error", "Name and Phone are required.");
//       return;
//     }

//     setSavingEdit(true);

//     const finalBuildingType =
//       propertyType === "Other" ? customPropertyType || "Other" : propertyType;
//     const finalMeterType =
//       meterType === "Other" ? customMeterType || "Other" : meterType;
//     const finalMainBreaker =
//       mainBreaker === "Other" ? customMainBreaker || "Other" : mainBreaker;

//     const updatedData = {
//       name: editName,
//       phone: editPhone,
//       address: editAddress,
//       buildingType: finalBuildingType,
//       meterType: finalMeterType,
//       mainBreaker: finalMainBreaker,
//     };

//     const res = await updateContact(client.id, updatedData);
//     setSavingEdit(false);

//     if (res.success) {
//       setClient({ ...client, ...updatedData });
//       setShowEditModal(false);
//       Alert.alert("Success", "Client details & technical specs updated!");
//     } else {
//       Alert.alert("Error", res.error);
//     }
//   };

//   // Dynamic Parts Table Handlers
//   const handleAddPartRow = () => {
//     const newPart = {
//       id: Date.now().toString(),
//       partName: "",
//       quantity: 1,
//       unitPrice: 0.0,
//       totalPrice: 0.0,
//     };
//     setParts([...parts, newPart]);
//   };

//   const handleUpdatePart = (id, field, value) => {
//     setParts(
//       parts.map((p) => {
//         if (p.id === id) {
//           const updated = { ...p, [field]: value };
//           if (field === "quantity" || field === "unitPrice") {
//             const qty =
//               field === "quantity" ? parseFloat(value) || 0 : p.quantity;
//             const price =
//               field === "unitPrice" ? parseFloat(value) || 0 : p.unitPrice;
//             updated.totalPrice = qty * price;
//           }
//           return updated;
//         }
//         return p;
//       }),
//     );
//   };

//   const handleRemovePartRow = (id) => {
//     if (parts.length === 1) return;
//     setParts(parts.filter((p) => p.id !== id));
//   };

//   const calculatePartsTotal = () =>
//     parts.reduce((acc, p) => acc + (p.totalPrice || 0), 0);
//   const calculateGrandTotal = () =>
//     calculatePartsTotal() + (parseFloat(laborCost) || 0);

//   const handleSaveJobLog = async () => {
//     if (!jobTitle) {
//       Alert.alert("Validation Error", "Please enter a Job Title.");
//       return;
//     }

//     const newJob = {
//       jobTitle,
//       status: "completed",
//       parts,
//       totalPartsCost: calculatePartsTotal(),
//       laborCost: parseFloat(laborCost) || 0,
//       totalJobPrice: calculateGrandTotal(),
//       remarks,
//       date: new Date().toISOString().split("T")[0],
//     };

//     const res = await addJobLog(client.id, newJob);
//     if (res.success) {
//       setJobTitle("");
//       setLaborCost("");
//       setRemarks("");
//       setParts([
//         { id: "1", partName: "", quantity: 1, unitPrice: 0.0, totalPrice: 0.0 },
//       ]);
//       setShowAddJobModal(false);
//       loadJobs();
//       Alert.alert("Success", "Job Intervention logged successfully!");
//     } else {
//       Alert.alert("Error", res.error);
//     }
//   };

//   const openGoogleMaps = () => {
//     if (!client?.address) return;
//     const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`;
//     Linking.openURL(url);
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
//             {client?.name || "Client Detail"}
//           </Text>
//           <Text style={[styles.clientSubHeader, { color: theme.subText }]}>
//             {client?.phone}
//           </Text>
//         </View>
//         <TouchableOpacity
//           style={[styles.editHeaderBtn, { backgroundColor: theme.accent }]}
//           onPress={() => setShowEditModal(true)}
//         >
//           <Ionicons name="create-outline" size={16} color="#fff" />
//           <Text style={styles.editBtnText}>Edit Info</Text>
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
//             📋 Overview
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.tabItem,
//             activeSubTab === "jobs" && {
//               borderBottomColor: theme.accent,
//               borderBottomWidth: 2,
//             },
//           ]}
//           onPress={() => setActiveSubTab("jobs")}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeSubTab === "jobs"
//                 ? { color: theme.accent, fontWeight: "bold" }
//                 : { color: theme.subText },
//             ]}
//           >
//             🛠️ Job History ({jobLogs.length})
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.tabItem,
//             activeSubTab === "docs" && {
//               borderBottomColor: theme.accent,
//               borderBottomWidth: 2,
//             },
//           ]}
//           onPress={() => setActiveSubTab("docs")}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeSubTab === "docs"
//                 ? { color: theme.accent, fontWeight: "bold" }
//                 : { color: theme.subText },
//             ]}
//           >
//             🧾 Documents
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 16 }}>
//         {/* TAB 1: OVERVIEW */}
//         {activeSubTab === "overview" && (
//           <View>
//             {/* Contact & Location Card */}
//             <View
//               style={[
//                 styles.infoCard,
//                 { backgroundColor: theme.cardBg, borderColor: theme.border },
//               ]}
//             >
//               <View style={styles.cardHeaderRow}>
//                 <Text style={[styles.cardTitle, { color: theme.text }]}>
//                   Contact & Location
//                 </Text>
//                 <TouchableOpacity onPress={() => setShowEditModal(true)}>
//                   <Ionicons name="pencil" size={18} color={theme.accent} />
//                 </TouchableOpacity>
//               </View>
//               <Text style={[styles.infoText, { color: theme.text }]}>
//                 📞 Phone: {client?.phone}
//               </Text>
//               <Text style={[styles.infoText, { color: theme.text }]}>
//                 📍 Address: {client?.address || "Not specified"}
//               </Text>
//               {client?.address ? (
//                 <TouchableOpacity
//                   style={[styles.mapBtn, { backgroundColor: theme.accent }]}
//                   onPress={openGoogleMaps}
//                 >
//                   <Ionicons name="map-outline" size={16} color="#fff" />
//                   <Text style={styles.mapBtnText}>Open in Google Maps</Text>
//                 </TouchableOpacity>
//               ) : null}
//             </View>

//             {/* Electrical Technical Specs Card */}
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
//               <View style={styles.cardHeaderRow}>
//                 <Text style={[styles.cardTitle, { color: theme.text }]}>
//                   Electrical Technical Specs
//                 </Text>
//                 <TouchableOpacity onPress={() => setShowEditModal(true)}>
//                   <Ionicons name="pencil" size={18} color={theme.accent} />
//                 </TouchableOpacity>
//               </View>
//               <Text style={[styles.infoText, { color: theme.text }]}>
//                 🏢 Property Type: {client?.buildingType || "Residential"}
//               </Text>
//               <Text style={[styles.infoText, { color: theme.text }]}>
//                 ⚡ Meter Type: {client?.meterType || "Single-Phase 230V"}
//               </Text>
//               <Text style={[styles.infoText, { color: theme.text }]}>
//                 🔌 Main Breaker: {client?.mainBreaker || "32A Standard"}
//               </Text>
//             </View>
//           </View>
//         )}

//         {/* TAB 2: JOB HISTORY & ITEMIZED PARTS */}
//         {activeSubTab === "jobs" && (
//           <View>
//             <TouchableOpacity
//               style={[styles.addJobBtn, { backgroundColor: theme.accent }]}
//               onPress={() => setShowAddJobModal(true)}
//             >
//               <Ionicons name="add" size={20} color="#fff" />
//               <Text style={styles.addJobBtnText}>Log New Job Intervention</Text>
//             </TouchableOpacity>

//             {loadingJobs ? (
//               <ActivityIndicator
//                 size="large"
//                 color={theme.accent}
//                 style={{ marginTop: 20 }}
//               />
//             ) : jobLogs.length === 0 ? (
//               <Text style={[styles.emptyText, { color: theme.subText }]}>
//                 No past job logs recorded yet.
//               </Text>
//             ) : (
//               jobLogs.map((job) => (
//                 <View
//                   key={job.id}
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
//                       {job.jobTitle}
//                     </Text>
//                     <Text style={[styles.jobDate, { color: theme.accent }]}>
//                       📅 {job.date}
//                     </Text>
//                   </View>

//                   {job.parts && job.parts.length > 0 ? (
//                     <View style={styles.partsTable}>
//                       <Text
//                         style={[
//                           styles.tableHeaderTitle,
//                           { color: theme.subText },
//                         ]}
//                       >
//                         📦 Itemized Parts Used:
//                       </Text>
//                       {job.parts.map((p, idx) => (
//                         <View key={idx} style={styles.tableRow}>
//                           <Text style={[styles.colName, { color: theme.text }]}>
//                             {p.partName || "Part"}
//                           </Text>
//                           <Text
//                             style={[styles.colQty, { color: theme.subText }]}
//                           >
//                             {p.quantity}x
//                           </Text>
//                           <Text
//                             style={[styles.colPrice, { color: theme.text }]}
//                           >
//                             {p.totalPrice} TND
//                           </Text>
//                         </View>
//                       ))}
//                     </View>
//                   ) : null}

//                   <View
//                     style={[styles.jobFooter, { borderTopColor: theme.border }]}
//                   >
//                     <Text style={[styles.jobFeeText, { color: theme.subText }]}>
//                       Labor Charge: {job.laborCost || 0} TND
//                     </Text>
//                     <Text style={[styles.jobTotalText, { color: "#10b981" }]}>
//                       Total: {job.totalJobPrice || 0} TND
//                     </Text>
//                   </View>
//                 </View>
//               ))
//             )}
//           </View>
//         )}

//         {/* TAB 3: DOCUMENTS */}
//         {activeSubTab === "docs" && (
//           <View
//             style={[
//               styles.infoCard,
//               { backgroundColor: theme.cardBg, borderColor: theme.border },
//             ]}
//           >
//             <Text style={[styles.cardTitle, { color: theme.text }]}>
//               Linked Commercial Quotes & Invoices
//             </Text>
//             <Text style={[styles.emptyText, { color: theme.subText }]}>
//               No linked quotes or invoices. Phase 3 Billing integration ready.
//             </Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* EDIT CLIENT DETAILS & TECH SPECS MODAL */}
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
//                 Update Client & Specs
//               </Text>
//               <TouchableOpacity onPress={() => setShowEditModal(false)}>
//                 <Ionicons name="close-circle" size={28} color={theme.subText} />
//               </TouchableOpacity>
//             </View>

//             {/* Basic Info Fields */}
//             <Text style={[styles.sectionSubtitle, { color: theme.text }]}>
//               Contact Details
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
//               placeholder="Full Name"
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
//               placeholder="Address / Location"
//               placeholderTextColor={theme.placeholder}
//               value={editAddress}
//               onChangeText={setEditAddress}
//             />

//             {/* Property Type Choice Selector */}
//             <Text
//               style={[
//                 styles.sectionSubtitle,
//                 { color: theme.text, marginTop: 12 },
//               ]}
//             >
//               Property Type
//             </Text>
//             <View style={styles.chipRow}>
//               {["Residential", "Commercial", "Industrial", "Other"].map(
//                 (type) => (
//                   <TouchableOpacity
//                     key={type}
//                     style={[
//                       styles.chip,
//                       propertyType === type
//                         ? { backgroundColor: theme.accent }
//                         : {
//                             backgroundColor: theme.cardBg,
//                             borderColor: theme.border,
//                             borderWidth: 1,
//                           },
//                     ]}
//                     onPress={() => setPropertyType(type)}
//                   >
//                     <Text
//                       style={{
//                         color: propertyType === type ? "#fff" : theme.text,
//                         fontSize: 13,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       {type}
//                     </Text>
//                   </TouchableOpacity>
//                 ),
//               )}
//             </View>
//             {propertyType === "Other" && (
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: theme.cardBg,
//                     color: theme.text,
//                     borderColor: theme.border,
//                     marginTop: 8,
//                   },
//                 ]}
//                 placeholder="Specify Custom Property Type"
//                 placeholderTextColor={theme.placeholder}
//                 value={customPropertyType}
//                 onChangeText={setCustomPropertyType}
//               />
//             )}

//             {/* Meter Type Choice Selector */}
//             <Text
//               style={[
//                 styles.sectionSubtitle,
//                 { color: theme.text, marginTop: 12 },
//               ]}
//             >
//               Meter Type
//             </Text>
//             <View style={styles.chipRow}>
//               {["Single-Phase 230V", "Three-Phase 380V", "Other"].map(
//                 (type) => (
//                   <TouchableOpacity
//                     key={type}
//                     style={[
//                       styles.chip,
//                       meterType === type
//                         ? { backgroundColor: theme.accent }
//                         : {
//                             backgroundColor: theme.cardBg,
//                             borderColor: theme.border,
//                             borderWidth: 1,
//                           },
//                     ]}
//                     onPress={() => setMeterType(type)}
//                   >
//                     <Text
//                       style={{
//                         color: meterType === type ? "#fff" : theme.text,
//                         fontSize: 13,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       {type}
//                     </Text>
//                   </TouchableOpacity>
//                 ),
//               )}
//             </View>
//             {meterType === "Other" && (
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: theme.cardBg,
//                     color: theme.text,
//                     borderColor: theme.border,
//                     marginTop: 8,
//                   },
//                 ]}
//                 placeholder="Specify Custom Meter Type"
//                 placeholderTextColor={theme.placeholder}
//                 value={customMeterType}
//                 onChangeText={setCustomMeterType}
//               />
//             )}

//             {/* Main Breaker Choice Selector */}
//             <Text
//               style={[
//                 styles.sectionSubtitle,
//                 { color: theme.text, marginTop: 12 },
//               ]}
//             >
//               Main Breaker Capacity
//             </Text>
//             <View style={styles.chipRow}>
//               {["32A Standard", "63A Industrial", "100A+", "Other"].map(
//                 (type) => (
//                   <TouchableOpacity
//                     key={type}
//                     style={[
//                       styles.chip,
//                       mainBreaker === type
//                         ? { backgroundColor: theme.accent }
//                         : {
//                             backgroundColor: theme.cardBg,
//                             borderColor: theme.border,
//                             borderWidth: 1,
//                           },
//                     ]}
//                     onPress={() => setMainBreaker(type)}
//                   >
//                     <Text
//                       style={{
//                         color: mainBreaker === type ? "#fff" : theme.text,
//                         fontSize: 13,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       {type}
//                     </Text>
//                   </TouchableOpacity>
//                 ),
//               )}
//             </View>
//             {mainBreaker === "Other" && (
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: theme.cardBg,
//                     color: theme.text,
//                     borderColor: theme.border,
//                     marginTop: 8,
//                   },
//                 ]}
//                 placeholder="Specify Custom Breaker Capacity"
//                 placeholderTextColor={theme.placeholder}
//                 value={customMainBreaker}
//                 onChangeText={setCustomMainBreaker}
//               />
//             )}

//             <TouchableOpacity
//               style={[
//                 styles.saveJobBtn,
//                 { backgroundColor: theme.accent, marginTop: 20 },
//               ]}
//               onPress={handleSaveClientInfo}
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

//       {/* ADD JOB INTERVENTION MODAL */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={showAddJobModal}
//         onRequestClose={() => setShowAddJobModal(false)}
//       >
//         <SafeAreaView
//           style={[styles.modalOverlay, { backgroundColor: theme.background }]}
//         >
//           <ScrollView contentContainerStyle={{ padding: 20 }}>
//             <View style={styles.modalHeaderRow}>
//               <Text style={[styles.modalTitle, { color: theme.text }]}>
//                 Add New Job Intervention
//               </Text>
//               <TouchableOpacity onPress={() => setShowAddJobModal(false)}>
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
//               placeholder="Job Title (e.g. Rewiring & Breaker Install)"
//               placeholderTextColor={theme.placeholder}
//               value={jobTitle}
//               onChangeText={setJobTitle}
//             />

//             <Text style={[styles.sectionSubtitle, { color: theme.text }]}>
//               Itemized Materials & Spare Parts
//             </Text>
//             {parts.map((item) => (
//               <View
//                 key={item.id}
//                 style={[
//                   styles.partPickerRow,
//                   { backgroundColor: theme.cardBg, borderColor: theme.border },
//                 ]}
//               >
//                 <TextInput
//                   style={[
//                     styles.inputSmall,
//                     { flex: 2, color: theme.text, borderColor: theme.border },
//                   ]}
//                   placeholder="Part Name"
//                   placeholderTextColor={theme.placeholder}
//                   value={item.partName}
//                   onChangeText={(val) =>
//                     handleUpdatePart(item.id, "partName", val)
//                   }
//                 />
//                 <TextInput
//                   style={[
//                     styles.inputSmall,
//                     { flex: 1, color: theme.text, borderColor: theme.border },
//                   ]}
//                   placeholder="Qty"
//                   placeholderTextColor={theme.placeholder}
//                   keyboardType="numeric"
//                   value={String(item.quantity)}
//                   onChangeText={(val) =>
//                     handleUpdatePart(item.id, "quantity", val)
//                   }
//                 />
//                 <TextInput
//                   style={[
//                     styles.inputSmall,
//                     { flex: 1.2, color: theme.text, borderColor: theme.border },
//                   ]}
//                   placeholder="Price (TND)"
//                   placeholderTextColor={theme.placeholder}
//                   keyboardType="numeric"
//                   value={String(item.unitPrice)}
//                   onChangeText={(val) =>
//                     handleUpdatePart(item.id, "unitPrice", val)
//                   }
//                 />
//                 <TouchableOpacity
//                   onPress={() => handleRemovePartRow(item.id)}
//                   style={{ padding: 4 }}
//                 >
//                   <Ionicons name="trash" size={18} color="#ef4444" />
//                 </TouchableOpacity>
//               </View>
//             ))}

//             <TouchableOpacity
//               style={[styles.addPartRowBtn, { borderColor: theme.accent }]}
//               onPress={handleAddPartRow}
//             >
//               <Text style={[styles.addPartRowText, { color: theme.accent }]}>
//                 + Add Material / Part
//               </Text>
//             </TouchableOpacity>

//             <Text
//               style={[
//                 styles.sectionSubtitle,
//                 { color: theme.text, marginTop: 16 },
//               ]}
//             >
//               Labor Charge & Summary
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
//               placeholder="Labor Charge (TND)"
//               placeholderTextColor={theme.placeholder}
//               keyboardType="numeric"
//               value={laborCost}
//               onChangeText={setLaborCost}
//             />
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
//               placeholder="Technician Notes / Remarks"
//               placeholderTextColor={theme.placeholder}
//               multiline
//               value={remarks}
//               onChangeText={setRemarks}
//             />

//             <View
//               style={[
//                 styles.summaryBox,
//                 { backgroundColor: theme.cardBg, borderColor: theme.border },
//               ]}
//             >
//               <Text style={{ color: theme.subText }}>
//                 Parts Cost: {calculatePartsTotal().toFixed(2)} TND
//               </Text>
//               <Text style={{ color: theme.subText }}>
//                 Labor Charge: {(parseFloat(laborCost) || 0).toFixed(2)} TND
//               </Text>
//               <Text style={[styles.grandTotalText, { color: theme.accent }]}>
//                 Grand Total: {calculateGrandTotal().toFixed(2)} TND
//               </Text>
//             </View>

//             <TouchableOpacity
//               style={[styles.saveJobBtn, { backgroundColor: theme.accent }]}
//               onPress={handleSaveJobLog}
//             >
//               <Text style={styles.saveJobBtnText}>Save Job Intervention</Text>
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
//   tabBar: { flexDirection: "row", borderWidth: 1 },
//   tabItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
//   tabText: { fontSize: 13 },
//   infoCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
//   cardHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   cardTitle: { fontSize: 16, fontWeight: "bold" },
//   infoText: { fontSize: 14, marginBottom: 6 },
//   mapBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//     borderRadius: 8,
//     marginTop: 10,
//     gap: 6,
//   },
//   mapBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
//   addJobBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 16,
//     gap: 6,
//   },
//   addJobBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
//   emptyText: { textAlign: "center", fontStyle: "italic", marginTop: 20 },
//   jobCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
//   jobCardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   jobTitle: { fontSize: 15, fontWeight: "bold" },
//   jobDate: { fontSize: 12, fontWeight: "bold" },
//   partsTable: { marginVertical: 8 },
//   tableHeaderTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
//   tableRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 2,
//   },
//   colName: { flex: 2, fontSize: 13 },
//   colQty: { flex: 0.8, fontSize: 13, textAlign: "center" },
//   colPrice: { flex: 1, fontSize: 13, textAlign: "right", fontWeight: "bold" },
//   jobFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingTop: 8,
//     marginTop: 8,
//     borderTopWidth: 1,
//   },
//   jobFeeText: { fontSize: 13 },
//   jobTotalText: { fontSize: 14, fontWeight: "bold" },
//   modalOverlay: { flex: 1 },
//   modalHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   modalTitle: { fontSize: 18, fontWeight: "bold" },
//   input: {
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//     fontSize: 14,
//     borderWidth: 1,
//   },
//   inputSmall: {
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//     borderRadius: 6,
//     fontSize: 13,
//     borderWidth: 1,
//   },
//   sectionSubtitle: { fontSize: 14, fontWeight: "bold", marginVertical: 8 },
//   chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
//   chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
//   partPickerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     marginBottom: 8,
//     gap: 6,
//   },
//   addPartRowBtn: {
//     borderStyle: "dashed",
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingVertical: 8,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   addPartRowText: { fontSize: 13, fontWeight: "bold" },
//   summaryBox: {
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     marginVertical: 12,
//     alignItems: "flex-end",
//   },
//   grandTotalText: { fontSize: 16, fontWeight: "bold", marginTop: 4 },
//   saveJobBtn: {
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   saveJobBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
// });

// // import { Ionicons } from "@expo/vector-icons";
// // import { useEffect, useState } from "react";
// // import {
// //   ActivityIndicator,
// //   Alert,
// //   Linking,
// //   Modal,
// //   SafeAreaView,
// //   ScrollView,
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   View,
// // } from "react-native";
// // import { useTheme } from "../context/ThemeContext";
// // import { addJobLog, getJobLogs } from "../services/crmService";

// // export default function ClientDetailScreen({ client, onBack }) {
// //   const { theme } = useTheme();
// //   const [activeSubTab, setActiveSubTab] = useState("overview"); // 'overview' | 'jobs' | 'docs'
// //   const [jobLogs, setJobLogs] = useState([]);
// //   const [loadingJobs, setLoadingJobs] = useState(false);

// //   // Add Job Log Modal State
// //   const [showAddJobModal, setShowAddJobModal] = useState(false);
// //   const [jobTitle, setJobTitle] = useState("");
// //   const [laborCost, setLaborCost] = useState("");
// //   const [remarks, setRemarks] = useState("");
// //   const [parts, setParts] = useState([
// //     {
// //       id: "1",
// //       partName: "Electric Cable 2.5mm",
// //       quantity: 1,
// //       unitPrice: 4.0,
// //       totalPrice: 4.0,
// //     },
// //   ]);

// //   const loadJobs = async () => {
// //     if (!client?.id) return;
// //     setLoadingJobs(true);
// //     const res = await getJobLogs(client.id);
// //     if (res.success) {
// //       setJobLogs(res.data);
// //     } else {
// //       Alert.alert("Error", res.error);
// //     }
// //     setLoadingJobs(false);
// //   };

// //   useEffect(() => {
// //     loadJobs();
// //   }, [client]);

// //   // Dynamic Parts Table Handlers
// //   const handleAddPartRow = () => {
// //     const newPart = {
// //       id: Date.now().toString(),
// //       partName: "",
// //       quantity: 1,
// //       unitPrice: 0.0,
// //       totalPrice: 0.0,
// //     };
// //     setParts([...parts, newPart]);
// //   };

// //   const handleUpdatePart = (id, field, value) => {
// //     setParts(
// //       parts.map((p) => {
// //         if (p.id === id) {
// //           const updated = { ...p, [field]: value };
// //           if (field === "quantity" || field === "unitPrice") {
// //             const qty =
// //               field === "quantity" ? parseFloat(value) || 0 : p.quantity;
// //             const price =
// //               field === "unitPrice" ? parseFloat(value) || 0 : p.unitPrice;
// //             updated.totalPrice = qty * price;
// //           }
// //           return updated;
// //         }
// //         return p;
// //       }),
// //     );
// //   };

// //   const handleRemovePartRow = (id) => {
// //     if (parts.length === 1) return;
// //     setParts(parts.filter((p) => p.id !== id));
// //   };

// //   // Calculations
// //   const calculatePartsTotal = () =>
// //     parts.reduce((acc, p) => acc + (p.totalPrice || 0), 0);
// //   const calculateGrandTotal = () =>
// //     calculatePartsTotal() + (parseFloat(laborCost) || 0);

// //   const handleSaveJobLog = async () => {
// //     if (!jobTitle) {
// //       Alert.alert("Validation Error", "Please enter a Job Title.");
// //       return;
// //     }

// //     const newJob = {
// //       jobTitle,
// //       status: "completed",
// //       parts,
// //       totalPartsCost: calculatePartsTotal(),
// //       laborCost: parseFloat(laborCost) || 0,
// //       totalJobPrice: calculateGrandTotal(),
// //       remarks,
// //       date: new Date().toISOString().split("T")[0],
// //     };

// //     const res = await addJobLog(client.id, newJob);
// //     if (res.success) {
// //       setJobTitle("");
// //       setLaborCost("");
// //       setRemarks("");
// //       setParts([
// //         { id: "1", partName: "", quantity: 1, unitPrice: 0.0, totalPrice: 0.0 },
// //       ]);
// //       setShowAddJobModal(false);
// //       loadJobs();
// //       Alert.alert("Success", "Job Intervention logged successfully!");
// //     } else {
// //       Alert.alert("Error", res.error);
// //     }
// //   };

// //   const openGoogleMaps = () => {
// //     if (!client?.address) return;
// //     const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`;
// //     Linking.openURL(url);
// //   };

// //   return (
// //     <SafeAreaView
// //       style={[styles.container, { backgroundColor: theme.background }]}
// //     >
// //       {/* Header Bar */}
// //       <View
// //         style={[
// //           styles.header,
// //           { backgroundColor: theme.cardBg, borderColor: theme.border },
// //         ]}
// //       >
// //         <TouchableOpacity onPress={onBack} style={styles.backBtn}>
// //           <Ionicons name="arrow-back" size={22} color={theme.text} />
// //         </TouchableOpacity>
// //         <View style={{ flex: 1, marginLeft: 10 }}>
// //           <Text style={[styles.clientNameHeader, { color: theme.text }]}>
// //             {client?.name || "Client Detail"}
// //           </Text>
// //           <Text style={[styles.clientSubHeader, { color: theme.subText }]}>
// //             {client?.phone}
// //           </Text>
// //         </View>
// //       </View>

// //       {/* Sub Navigation Tabs */}
// //       <View
// //         style={[
// //           styles.tabBar,
// //           { backgroundColor: theme.cardBg, borderColor: theme.border },
// //         ]}
// //       >
// //         <TouchableOpacity
// //           style={[
// //             styles.tabItem,
// //             activeSubTab === "overview" && {
// //               borderBottomColor: theme.accent,
// //               borderBottomWidth: 2,
// //             },
// //           ]}
// //           onPress={() => setActiveSubTab("overview")}
// //         >
// //           <Text
// //             style={[
// //               styles.tabText,
// //               activeSubTab === "overview"
// //                 ? { color: theme.accent, fontWeight: "bold" }
// //                 : { color: theme.subText },
// //             ]}
// //           >
// //             📋 Overview
// //           </Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity
// //           style={[
// //             styles.tabItem,
// //             activeSubTab === "jobs" && {
// //               borderBottomColor: theme.accent,
// //               borderBottomWidth: 2,
// //             },
// //           ]}
// //           onPress={() => setActiveSubTab("jobs")}
// //         >
// //           <Text
// //             style={[
// //               styles.tabText,
// //               activeSubTab === "jobs"
// //                 ? { color: theme.accent, fontWeight: "bold" }
// //                 : { color: theme.subText },
// //             ]}
// //           >
// //             🛠️ Job History ({jobLogs.length})
// //           </Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity
// //           style={[
// //             styles.tabItem,
// //             activeSubTab === "docs" && {
// //               borderBottomColor: theme.accent,
// //               borderBottomWidth: 2,
// //             },
// //           ]}
// //           onPress={() => setActiveSubTab("docs")}
// //         >
// //           <Text
// //             style={[
// //               styles.tabText,
// //               activeSubTab === "docs"
// //                 ? { color: theme.accent, fontWeight: "bold" }
// //                 : { color: theme.subText },
// //             ]}
// //           >
// //             🧾 Documents
// //           </Text>
// //         </TouchableOpacity>
// //       </View>

// //       <ScrollView contentContainerStyle={{ padding: 16 }}>
// //         {/* TAB 1: OVERVIEW */}
// //         {activeSubTab === "overview" && (
// //           <View>
// //             <View
// //               style={[
// //                 styles.infoCard,
// //                 { backgroundColor: theme.cardBg, borderColor: theme.border },
// //               ]}
// //             >
// //               <Text style={[styles.cardTitle, { color: theme.text }]}>
// //                 Contact & Location
// //               </Text>
// //               <Text style={[styles.infoText, { color: theme.text }]}>
// //                 📞 Phone: {client?.phone}
// //               </Text>
// //               <Text style={[styles.infoText, { color: theme.text }]}>
// //                 📍 Address: {client?.address || "Not specified"}
// //               </Text>
// //               {client?.address ? (
// //                 <TouchableOpacity
// //                   style={[styles.mapBtn, { backgroundColor: theme.accent }]}
// //                   onPress={openGoogleMaps}
// //                 >
// //                   <Ionicons name="map-outline" size={16} color="#fff" />
// //                   <Text style={styles.mapBtnText}>Open in Google Maps</Text>
// //                 </TouchableOpacity>
// //               ) : null}
// //             </View>

// //             <View
// //               style={[
// //                 styles.infoCard,
// //                 {
// //                   backgroundColor: theme.cardBg,
// //                   borderColor: theme.border,
// //                   marginTop: 12,
// //                 },
// //               ]}
// //             >
// //               <Text style={[styles.cardTitle, { color: theme.text }]}>
// //                 Electrical Technical Specs
// //               </Text>
// //               <Text style={[styles.infoText, { color: theme.text }]}>
// //                 🏢 Property Type: {client?.buildingType || "Residential"}
// //               </Text>
// //               <Text style={[styles.infoText, { color: theme.text }]}>
// //                 ⚡ Meter Type: Single-Phase 230V
// //               </Text>
// //               <Text style={[styles.infoText, { color: theme.text }]}>
// //                 🔌 Main Breaker: 32A Standard
// //               </Text>
// //             </View>
// //           </View>
// //         )}

// //         {/* TAB 2: JOB HISTORY & ITEMIZED PARTS */}
// //         {activeSubTab === "jobs" && (
// //           <View>
// //             <TouchableOpacity
// //               style={[styles.addJobBtn, { backgroundColor: theme.accent }]}
// //               onPress={() => setShowAddJobModal(true)}
// //             >
// //               <Ionicons name="add" size={20} color="#fff" />
// //               <Text style={styles.addJobBtnText}>Log New Job Intervention</Text>
// //             </TouchableOpacity>

// //             {loadingJobs ? (
// //               <ActivityIndicator
// //                 size="large"
// //                 color={theme.accent}
// //                 style={{ marginTop: 20 }}
// //               />
// //             ) : jobLogs.length === 0 ? (
// //               <Text style={[styles.emptyText, { color: theme.subText }]}>
// //                 No past job logs recorded yet.
// //               </Text>
// //             ) : (
// //               jobLogs.map((job) => (
// //                 <View
// //                   key={job.id}
// //                   style={[
// //                     styles.jobCard,
// //                     {
// //                       backgroundColor: theme.cardBg,
// //                       borderColor: theme.border,
// //                     },
// //                   ]}
// //                 >
// //                   <View style={styles.jobCardHeader}>
// //                     <Text style={[styles.jobTitle, { color: theme.text }]}>
// //                       {job.jobTitle}
// //                     </Text>
// //                     <Text style={[styles.jobDate, { color: theme.accent }]}>
// //                       📅 {job.date}
// //                     </Text>
// //                   </View>

// //                   {/* Itemized Parts Table */}
// //                   {job.parts && job.parts.length > 0 ? (
// //                     <View style={styles.partsTable}>
// //                       <Text
// //                         style={[
// //                           styles.tableHeaderTitle,
// //                           { color: theme.subText },
// //                         ]}
// //                       >
// //                         📦 Itemized Parts Used:
// //                       </Text>
// //                       {job.parts.map((p, idx) => (
// //                         <View key={idx} style={styles.tableRow}>
// //                           <Text style={[styles.colName, { color: theme.text }]}>
// //                             {p.partName || "Part"}
// //                           </Text>
// //                           <Text
// //                             style={[styles.colQty, { color: theme.subText }]}
// //                           >
// //                             {p.quantity}x
// //                           </Text>
// //                           <Text
// //                             style={[styles.colPrice, { color: theme.text }]}
// //                           >
// //                             {p.totalPrice} TND
// //                           </Text>
// //                         </View>
// //                       ))}
// //                     </View>
// //                   ) : null}

// //                   <View
// //                     style={[styles.jobFooter, { borderTopColor: theme.border }]}
// //                   >
// //                     <Text style={[styles.jobFeeText, { color: theme.subText }]}>
// //                       Labor Charge: {job.laborCost || 0} TND
// //                     </Text>
// //                     <Text style={[styles.jobTotalText, { color: "#10b981" }]}>
// //                       Total: {job.totalJobPrice || 0} TND
// //                     </Text>
// //                   </View>
// //                 </View>
// //               ))
// //             )}
// //           </View>
// //         )}

// //         {/* TAB 3: DOCUMENTS */}
// //         {activeSubTab === "docs" && (
// //           <View
// //             style={[
// //               styles.infoCard,
// //               { backgroundColor: theme.cardBg, borderColor: theme.border },
// //             ]}
// //           >
// //             <Text style={[styles.cardTitle, { color: theme.text }]}>
// //               Linked Commercial Quotes & Invoices
// //             </Text>
// //             <Text style={[styles.emptyText, { color: theme.subText }]}>
// //               No linked quotes or invoices. Phase 3 Billing integration ready.
// //             </Text>
// //           </View>
// //         )}
// //       </ScrollView>

// //       {/* Add New Job Intervention Modal */}
// //       <Modal
// //         animationType="slide"
// //         transparent={true}
// //         visible={showAddJobModal}
// //         onRequestClose={() => setShowAddJobModal(false)}
// //       >
// //         <SafeAreaView
// //           style={[styles.modalOverlay, { backgroundColor: theme.background }]}
// //         >
// //           <ScrollView contentContainerStyle={{ padding: 20 }}>
// //             <View style={styles.modalHeaderRow}>
// //               <Text style={[styles.modalTitle, { color: theme.text }]}>
// //                 Add New Job Intervention
// //               </Text>
// //               <TouchableOpacity onPress={() => setShowAddJobModal(false)}>
// //                 <Ionicons name="close-circle" size={28} color={theme.subText} />
// //               </TouchableOpacity>
// //             </View>

// //             <TextInput
// //               style={[
// //                 styles.input,
// //                 {
// //                   backgroundColor: theme.cardBg,
// //                   color: theme.text,
// //                   borderColor: theme.border,
// //                 },
// //               ]}
// //               placeholder="Job Title (e.g. Rewiring & Breaker Install)"
// //               placeholderTextColor={theme.placeholder}
// //               value={jobTitle}
// //               onChangeText={setJobTitle}
// //             />

// //             {/* Dynamic Parts Table Picker */}
// //             <Text style={[styles.sectionSubtitle, { color: theme.text }]}>
// //               Itemized Materials & Spare Parts
// //             </Text>
// //             {parts.map((item, index) => (
// //               <View
// //                 key={item.id}
// //                 style={[
// //                   styles.partPickerRow,
// //                   { backgroundColor: theme.cardBg, borderColor: theme.border },
// //                 ]}
// //               >
// //                 <TextInput
// //                   style={[
// //                     styles.inputSmall,
// //                     { flex: 2, color: theme.text, borderColor: theme.border },
// //                   ]}
// //                   placeholder="Part Name"
// //                   placeholderTextColor={theme.placeholder}
// //                   value={item.partName}
// //                   onChangeText={(val) =>
// //                     handleUpdatePart(item.id, "partName", val)
// //                   }
// //                 />
// //                 <TextInput
// //                   style={[
// //                     styles.inputSmall,
// //                     { flex: 1, color: theme.text, borderColor: theme.border },
// //                   ]}
// //                   placeholder="Qty"
// //                   placeholderTextColor={theme.placeholder}
// //                   keyboardType="numeric"
// //                   value={String(item.quantity)}
// //                   onChangeText={(val) =>
// //                     handleUpdatePart(item.id, "quantity", val)
// //                   }
// //                 />
// //                 <TextInput
// //                   style={[
// //                     styles.inputSmall,
// //                     { flex: 1.2, color: theme.text, borderColor: theme.border },
// //                   ]}
// //                   placeholder="Price (TND)"
// //                   placeholderTextColor={theme.placeholder}
// //                   keyboardType="numeric"
// //                   value={String(item.unitPrice)}
// //                   onChangeText={(val) =>
// //                     handleUpdatePart(item.id, "unitPrice", val)
// //                   }
// //                 />
// //                 <TouchableOpacity
// //                   onPress={() => handleRemovePartRow(item.id)}
// //                   style={{ padding: 4 }}
// //                 >
// //                   <Ionicons name="trash" size={18} color="#ef4444" />
// //                 </TouchableOpacity>
// //               </View>
// //             ))}

// //             <TouchableOpacity
// //               style={[styles.addPartRowBtn, { borderColor: theme.accent }]}
// //               onPress={handleAddPartRow}
// //             >
// //               <Text style={[styles.addPartRowText, { color: theme.accent }]}>
// //                 + Add Material / Part
// //               </Text>
// //             </TouchableOpacity>

// //             <Text
// //               style={[
// //                 styles.sectionSubtitle,
// //                 { color: theme.text, marginTop: 16 },
// //               ]}
// //             >
// //               Labor Charge & Summary
// //             </Text>
// //             <TextInput
// //               style={[
// //                 styles.input,
// //                 {
// //                   backgroundColor: theme.cardBg,
// //                   color: theme.text,
// //                   borderColor: theme.border,
// //                 },
// //               ]}
// //               placeholder="Labor Charge (TND)"
// //               placeholderTextColor={theme.placeholder}
// //               keyboardType="numeric"
// //               value={laborCost}
// //               onChangeText={setLaborCost}
// //             />

// //             <TextInput
// //               style={[
// //                 styles.input,
// //                 {
// //                   backgroundColor: theme.cardBg,
// //                   color: theme.text,
// //                   borderColor: theme.border,
// //                   height: 70,
// //                 },
// //               ]}
// //               placeholder="Technician Notes / Remarks"
// //               placeholderTextColor={theme.placeholder}
// //               multiline
// //               value={remarks}
// //               onChangeText={setRemarks}
// //             />

// //             {/* Computation Display */}
// //             <View
// //               style={[
// //                 styles.summaryBox,
// //                 { backgroundColor: theme.cardBg, borderColor: theme.border },
// //               ]}
// //             >
// //               <Text style={{ color: theme.subText }}>
// //                 Parts Cost: {calculatePartsTotal().toFixed(2)} TND
// //               </Text>
// //               <Text style={{ color: theme.subText }}>
// //                 Labor Charge: {(parseFloat(laborCost) || 0).toFixed(2)} TND
// //               </Text>
// //               <Text style={[styles.grandTotalText, { color: theme.accent }]}>
// //                 Grand Total: {calculateGrandTotal().toFixed(2)} TND
// //               </Text>
// //             </View>

// //             <TouchableOpacity
// //               style={[styles.saveJobBtn, { backgroundColor: theme.accent }]}
// //               onPress={handleSaveJobLog}
// //             >
// //               <Text style={styles.saveJobBtnText}>Save Job Intervention</Text>
// //             </TouchableOpacity>
// //           </ScrollView>
// //         </SafeAreaView>
// //       </Modal>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1 },
// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     padding: 14,
// //     borderWidth: 1,
// //   },
// //   backBtn: { padding: 4 },
// //   clientNameHeader: { fontSize: 18, fontWeight: "bold" },
// //   clientSubHeader: { fontSize: 12 },
// //   tabBar: { flexDirection: "row", borderWidth: 1 },
// //   tabItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
// //   tabText: { fontSize: 13 },
// //   infoCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
// //   cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
// //   infoText: { fontSize: 14, marginBottom: 6 },
// //   mapBtn: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     paddingVertical: 8,
// //     borderRadius: 8,
// //     marginTop: 10,
// //     gap: 6,
// //   },
// //   mapBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
// //   addJobBtn: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     padding: 12,
// //     borderRadius: 10,
// //     marginBottom: 16,
// //     gap: 6,
// //   },
// //   addJobBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
// //   emptyText: { textAlign: "center", fontStyle: "italic", marginTop: 20 },
// //   jobCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
// //   jobCardHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: 8,
// //   },
// //   jobTitle: { fontSize: 15, fontWeight: "bold" },
// //   jobDate: { fontSize: 12, fontWeight: "bold" },
// //   partsTable: { marginVertical: 8 },
// //   tableHeaderTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
// //   tableRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     paddingVertical: 2,
// //   },
// //   colName: { flex: 2, fontSize: 13 },
// //   colQty: { flex: 0.8, fontSize: 13, textAlign: "center" },
// //   colPrice: { flex: 1, fontSize: 13, textAlign: "right", fontWeight: "bold" },
// //   jobFooter: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     paddingTop: 8,
// //     marginTop: 8,
// //     borderTopWidth: 1,
// //   },
// //   jobFeeText: { fontSize: 13 },
// //   jobTotalText: { fontSize: 14, fontWeight: "bold" },
// //   modalOverlay: { flex: 1 },
// //   modalHeaderRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: 16,
// //   },
// //   modalTitle: { fontSize: 18, fontWeight: "bold" },
// //   input: {
// //     paddingHorizontal: 12,
// //     paddingVertical: 10,
// //     borderRadius: 8,
// //     marginBottom: 10,
// //     fontSize: 14,
// //     borderWidth: 1,
// //   },
// //   inputSmall: {
// //     paddingHorizontal: 8,
// //     paddingVertical: 6,
// //     borderRadius: 6,
// //     fontSize: 13,
// //     borderWidth: 1,
// //   },
// //   sectionSubtitle: { fontSize: 14, fontWeight: "bold", marginVertical: 8 },
// //   partPickerRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     padding: 8,
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     marginBottom: 8,
// //     gap: 6,
// //   },
// //   addPartRowBtn: {
// //     borderStyle: "dashed",
// //     borderWidth: 1,
// //     borderRadius: 8,
// //     paddingVertical: 8,
// //     alignItems: "center",
// //     marginBottom: 12,
// //   },
// //   addPartRowText: { fontSize: 13, fontWeight: "bold" },
// //   summaryBox: {
// //     padding: 12,
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     marginVertical: 12,
// //     alignItems: "flex-end",
// //   },
// //   grandTotalText: { fontSize: 16, fontWeight: "bold", marginTop: 4 },
// //   saveJobBtn: {
// //     paddingVertical: 14,
// //     borderRadius: 10,
// //     alignItems: "center",
// //     marginTop: 10,
// //   },
// //   saveJobBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
// // });
