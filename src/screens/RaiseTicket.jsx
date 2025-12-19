import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GreetingCard from "../components/GreetingCard";
import { useSession } from "../context/SessionContext";
import {
  raiseServiceTicket,
  getApprovedClient,
  getClientMeters,
} from "../apiConfig";
import { Picker } from "@react-native-picker/picker";

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════

const SkeletonBox = ({ style }) => <View style={[styles.skeletonBox, style]} />;

/* ─── Modern card component ────────────────────────────── */
const SummaryCard = ({ title, value, color, borderColor, icon }) => (
  <View style={[styles.card, { backgroundColor: color, borderColor, borderWidth: 1 }]}>
    <View style={styles.cardTopRow}>
      <View style={styles.cardIconWrapper}>{icon}</View>
      <View style={styles.cardTextWrapper}>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </View>
  </View>
);

const FormField = ({ label, required, height = 44, readOnly = false, ...props }) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>
      {label}
      {required && <Text style={styles.required}>*</Text>}
    </Text>
    <TextInput
      style={[styles.input, { height }, readOnly && styles.readOnlyInput]}
      editable={!readOnly}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  </View>
);

const Row = ({ label, value, customValue }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    {customValue ? customValue : <Text style={styles.rowValue}>{value}</Text>}
  </View>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const TicketScreen = ({ loading = false }) => {
  const { session } = useSession();
  const loginKey = session?.loginKey;
  const clientId = session?.clientId;

  const [activeTab, setActiveTab] = useState("dashboard");
  const [formLoading, setFormLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const formTimerRef = useRef(null);

  // ───────── FORM STATE ─────────
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [building, setBuilding] = useState("");
  const [unitNo, setUnitNo] = useState("");
  const [issueType, setIssueType] = useState("");
  const [meters, setMeters] = useState([]);
  const [meterName, setMeterName] = useState("");
  const [description, setDescription] = useState("");

  // ───────── LIFECYCLE ─────────
  useEffect(() => {
    return () => {
      if (formTimerRef.current) clearTimeout(formTimerRef.current);
    };
  }, []);

  // ───────── FETCH PROFILE DATA ─────────
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!clientId) return;

      try {
        const { ok, data } = await getApprovedClient(clientId);

        if (ok && data) {
          setProfileData(data);
          setName(data.FirstName || "");
          setPhone(data.MobileNumber || "");
          setBuilding(data.BuildingName || "");
          setUnitNo(data.UnitName || "");
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };

    fetchProfileData();
  }, [clientId]);

  // ───────── FETCH METERS ─────────
  useEffect(() => {
    const fetchMeters = async () => {
      if (!loginKey) return;

      try {
        const { ok, data } = await getClientMeters(loginKey);
        if (ok && Array.isArray(data)) {
          setMeters(data);
        }
      } catch (error) {
        console.error("Failed to fetch meters:", error);
      }
    };

    fetchMeters();
  }, [loginKey]);

  // ───────── HANDLERS ─────────
  const handleAddTicketPress = () => {
    setActiveTab("add");
    setFormLoading(true);

    if (formTimerRef.current) clearTimeout(formTimerRef.current);
    formTimerRef.current = setTimeout(() => {
      setFormLoading(false);
    }, 700);
  };

  const handleBackToDashboard = () => {
    setActiveTab("dashboard");
  };

  const handleSaveTicket = async () => {
    if (!loginKey) {
      Alert.alert("Error", "Session expired. Please login again.");
      return;
    }

    if (!name || !phone || !unitNo || !meterName) {
      Alert.alert("Validation", "Please fill all required fields");
      return;
    }

    if (!issueType) {
      Alert.alert("Validation", "Please select issue type");
      return;
    }

    try {
      setFormLoading(true);

      const payload = {
        Key: loginKey,
        Name: name,
        Phone: phone,
        BuildingName: building,
        UnitNo: unitNo,
        IssueType: issueType,
        MeterName: meterName,
        Description: description,
      };

      const { ok, data } = await raiseServiceTicket(payload);

      if (!ok) {
        throw new Error(data?.message || "Failed to raise ticket");
      }

      Alert.alert("Success", "Ticket raised successfully");

      // Only reset editable fields
      setIssueType("");
      setMeterName("");
      setDescription("");

      handleBackToDashboard();
    } catch (err) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  // ───────── RENDER FUNCTIONS ─────────

  // ───────── Dashboard View ─────────
  const renderDashboard = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Raise Ticket</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardsWrapper}>
        <SummaryCard
          title="Total Tickets"
          value="00"
          color="#ebe6ff"
          borderColor="#8b5cf6"
          icon={
            <Image
              source={require("../../assets/images/ticket.png")}
              style={{ width: 22, height: 22, tintColor: "#8b5cf6" }}
            />
          }
        />

        <SummaryCard
          title="Processing"
          value="00"
          color="#ffeede"
          borderColor="#f97316"
          icon={
            <Image
              source={require("../../assets/images/time-management.png")}
              style={{ width: 22, height: 22, tintColor: "#f97316" }}
            />
          }
        />

        <SummaryCard
          title="Completed"
          value="00"
          color="#ffe7f2"
          borderColor="#ec4899"
          icon={
            <Image
              source={require("../../assets/images/check-mark.png")}
              style={{ width: 22, height: 22, tintColor: "#ec4899" }}
            />
          }
        />

        <SummaryCard
          title="Pending"
          value="00"
          color="#e6ffef"
          borderColor="#22c55e"
          icon={
            <Image
              source={require("../../assets/images/wall-clock.png")}
              style={{ width: 22, height: 22, tintColor: "#22c55e" }}
            />
          }
        />
      </View>

      {/* Add Ticket Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddTicketPress}>
        <Text style={styles.addButtonText}>+ Add New Ticket</Text>
      </TouchableOpacity>

      {/* Ticket Detail Card */}
      <View style={styles.detailCard}>
        <Row label="Service No." value="LPSR0031" />
        <Row label="Issue Type" value="Hardware" />
        <Row label="Issue Raised By" value="Sep 25" />
        <Row label="Date" value="25-09-2025 13:30:52" />
        <Row label="Meter Name" value="35944915" />
        <Row label="Issue Description" value="Test" />
        <Row
          label="Status"
          customValue={
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
          }
        />
        <Row
          label="Delete"
          customValue={
            <TouchableOpacity style={styles.deleteBox}>
              <Image
                style={{ width: 16, height: 16, tintColor: "#fff" }}
                source={require("../../assets/images/bin.png")}
              />
            </TouchableOpacity>
          }
        />
      </View>
    </>
  );

  // ───────── Add Ticket View (real form) ─────────
  const renderAddTicket = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
          <Image
            source={require("../../assets/images/arrow.png")}
            style={{ width: 12, height: 12, tintColor: "#fff" }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Ticket</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <FormField label="Name" required value={name} readOnly />
        <FormField label="Phone Number" required value={phone} readOnly />
        <FormField label="Building Name" value={building} readOnly />
        <FormField label="Unit No." required value={unitNo} readOnly />

        {/* ISSUE TYPE - FIXED */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>
            Issue Type <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker 
              selectedValue={issueType} 
              onValueChange={setIssueType}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Select issue type" value="" color="#9ca3af" />
              <Picker.Item label="Hardware" value="Hardware" />
              <Picker.Item label="Software" value="Software" />
              <Picker.Item label="Connectivity" value="Connectivity" />
              <Picker.Item label="Power" value="Power" />
              <Picker.Item label="Others" value="Others" />
            </Picker>
          </View>
        </View>

        {/* METER NAME DROPDOWN - FIXED */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>
            Meter Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker 
              selectedValue={meterName} 
              onValueChange={setMeterName}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Select meter" value="" color="#9ca3af" />
              {meters.map((m) => (
                <Picker.Item
                  key={m.MeterID}
                  label={m.MeterName}
                  value={m.MeterName}
                />
              ))}
            </Picker>
          </View>
        </View>

        <FormField
          label="Description"
          multiline
          value={description}
          onChangeText={setDescription}
          height={90}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleBackToDashboard}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveTicket}>
            <Text style={styles.saveText}>Save Ticket</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );

  // ───────── Skeleton View for Dashboard ─────────
  const renderDashboardSkeleton = () => (
    <>
      <SkeletonBox
        style={{
          width: "40%",
          height: 32,
          borderRadius: 10,
          marginBottom: 14,
        }}
      />

      <View style={styles.cardsWrapper}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={[styles.card, styles.skeletonCard]}>
            <View style={styles.cardTopRow}>
              <SkeletonBox
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 10,
                }}
              />
              <View style={styles.cardTextWrapper}>
                <SkeletonBox
                  style={{
                    width: "40%",
                    height: 18,
                    borderRadius: 6,
                    marginBottom: 6,
                  }}
                />
                <SkeletonBox
                  style={{
                    width: "70%",
                    height: 12,
                    borderRadius: 6,
                  }}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      <SkeletonBox
        style={{
          alignSelf: "center",
          width: 180,
          height: 34,
          borderRadius: 999,
          marginVertical: 12,
        }}
      />

      <View style={[styles.detailCard, styles.skeletonCard]}>
        {Array.from({ length: 7 }).map((_, index) => (
          <View
            key={index}
            style={[styles.row, { borderBottomColor: "#E5E7EB" }]}
          >
            <SkeletonBox
              style={{
                width: "30%",
                height: 14,
                borderRadius: 6,
              }}
            />
            <SkeletonBox
              style={{
                width: "40%",
                height: 14,
                borderRadius: 6,
              }}
            />
          </View>
        ))}
      </View>
    </>
  );

  // ───────── Skeleton View for Add Form ─────────
  const renderAddFormSkeleton = () => (
    <>
      <View style={styles.header}>
        <SkeletonBox
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            marginRight: 8,
          }}
        />
        <SkeletonBox
          style={{
            flex: 1,
            height: 20,
            borderRadius: 8,
          }}
        />
      </View>

      <View
        style={[
          styles.detailCard,
          styles.skeletonCard,
          { paddingHorizontal: 12 },
        ]}
      >
        {Array.from({ length: 7 }).map((_, index) => (
          <View key={index} style={{ marginBottom: 14 }}>
            <SkeletonBox
              style={{
                width: "30%",
                height: 12,
                borderRadius: 6,
                marginBottom: 6,
              }}
            />
            <SkeletonBox
              style={{
                width: "100%",
                height: index === 6 ? 80 : 40,
                borderRadius: 8,
              }}
            />
          </View>
        ))}

        <View style={styles.buttonRow}>
          <SkeletonBox
            style={{
              flex: 1,
              height: 36,
              borderRadius: 20,
              marginRight: 10,
            }}
          />
          <SkeletonBox
            style={{
              flex: 1,
              height: 36,
              borderRadius: 20,
            }}
          />
        </View>
      </View>
    </>
  );

  // ───────── MAIN RENDER ─────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <GreetingCard />
        {loading && activeTab === "dashboard"
          ? renderDashboardSkeleton()
          : activeTab === "dashboard"
          ? renderDashboard()
          : formLoading
          ? renderAddFormSkeleton()
          : renderAddTicket()}
      </ScrollView>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // ─── Layout Styles ───
  safe: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  container: {
    padding: 12,
    paddingBottom: 24,
  },
  formContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 24,
  },

  // ─── Header Styles ───
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#F5F5DC",
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 14,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "900",
    color: "rgb(3,10,112)",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginLeft: 8,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
  },

  // ─── Summary Cards Styles ───
  cardsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  card: {
    width: "48%",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    marginRight: 10,
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 12,
    color: "#4b5563",
  },

  // ─── Button Styles ───
  addButton: {
    backgroundColor: "#1d4ed8",
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    marginVertical: 10,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#1d4ed8",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    elevation: 3,
  },
  saveText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "600",
  },

  // ─── Detail Card & Row Styles ───
  detailCard: {
    marginTop: 8,
    backgroundColor: "rgb(248,249,250)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 0.4,
    borderBottomColor: "#e5e7eb",
  },
  rowLabel: {
    fontSize: 12,
    color: "#0f1010ff",
  },
  rowValue: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "500",
  },
  statusPill: {
    backgroundColor: "#facc15",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-end",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
  },
  deleteBox: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#dc2626",
    borderColor: "#b91c1c",
    alignItems: "center",
    justifyContent: "center",
  },

  // ─── Form Styles ───
  fieldWrapper: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    marginBottom: 3,
    color: "#111827",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    fontSize: 13,
  },
  readOnlyInput: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  pickerWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    height: 44,
    justifyContent: "center",
  },
  picker: {
    height: 44,
    width: "100%",
    fontSize: 13,
    color: "#111827",
  },
  pickerItem: {
    fontSize: 13,
    height: 44,
  },

  // ─── Skeleton Styles ───
  skeletonBox: {
    backgroundColor: "#E5E7EB",
  },
  skeletonCard: {
    backgroundColor: "#f3f4f6",
    borderColor: "#E5E7EB",
  },

  // ─── Utility Styles ───
  errorText: {
    fontSize: 12,
    color: "#b91c1c",
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
  },
});

export default TicketScreen;
