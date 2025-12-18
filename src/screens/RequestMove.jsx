import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GreetingCard from "../components/GreetingCard";
import { useSession } from "../context/SessionContext";
import {
  getApprovedClient,
  getFinalBillRequest,
} from "../apiConfig";

const RequestMoveout = () => {
  const { session, isReady } = useSession();

  const userId = session?.clientId;
  const officeId = session?.officeId;

  const [settleFinalBill, setSettleFinalBill] = useState(false);
  const [isFinalBillChecked, setIsFinalBillChecked] = useState(false);
  const [remarks, setRemarks] = useState("");

  // 🔹 Backend data
  const [profile, setProfile] = useState(null);
  const [contract, setContract] = useState(null);

  // 🔹 2s full-screen skeleton
  const [showSkeleton, setShowSkeleton] = useState(true);

  /* ------------------ FORMAT DATE ------------------ */
  const formatDate = (raw) => {
    if (!raw) return "-";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* ------------------ FETCH PROFILE ------------------ */
  const fetchProfile = async () => {
    const { ok, data } = await getApprovedClient(userId);
    if (!ok) throw new Error("Profile API failed");
    setProfile(data);
  };

  /* ------------------ FETCH CONTRACT ------------------ */
  const fetchContract = async () => {
    const { ok, data } = await getFinalBillRequest(userId, officeId);
    if (!ok) throw new Error("Contract API failed");

    if (Array.isArray(data) && data.length > 0) {
      setContract(data[0]);
    }
  };

  /* ------------------ LOAD DATA ------------------ */
  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || !userId || !officeId) return;

    const load = async () => {
      try {
        await Promise.all([fetchProfile(), fetchContract()]);
      } catch (e) {
        console.log("Moveout load error:", e.message);
      }
    };

    load();
  }, [isReady, userId, officeId]);

  // ---------- SKELETON UI ----------
  if (showSkeleton) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.skeletonContainer}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonGreetingCard} />
          <View style={styles.skeletonCardLarge} />
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonCardLarge} />
          <View style={styles.skeletonButton} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ------------------ DERIVED VALUES ------------------ */
  const community = profile?.AreaName || "—";
  const building = profile?.BuildingName || "—";
  const unit =
    profile?.UnitName ||
    contract?.OfficeNumber ||
    session?.officeNumber ||
    "—";

  // ---------- REAL UI ----------
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <GreetingCard />

        <Text style={styles.sectionTitle}>Request Moveout</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Community</Text>
            <Text style={styles.value}>{community}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Building Name</Text>
            <Text style={styles.value}>{building}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Unit</Text>
            <Text style={styles.value}>{unit}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Contract Type</Text>
            <Text style={styles.value}>Individual</Text>
          </View>

          <View style={styles.contractBox}>
            <Text style={styles.contractLabel}>Contract Start Date</Text>
            <Text style={styles.contractDate}>
              {formatDate(contract?.ContractStartDate)}
            </Text>
          </View>

          <View style={styles.contractBox}>
            <Text style={styles.contractLabel}>Contract End Date</Text>
            <Text style={styles.contractDate}>
              {formatDate(contract?.ContractEndDate)}
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setIsFinalBillChecked(!isFinalBillChecked)}
            >
              <View
                style={[
                  styles.checkboxBox,
                  isFinalBillChecked && styles.checkboxChecked,
                ]}
              >
                {isFinalBillChecked && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Request for Final Bill</Text>
          </View>

          {isFinalBillChecked && (
            <View style={styles.finalBillContent}>
              <Text style={styles.finalBillTitle}>Request For Final Bill</Text>

              <Text style={styles.inputLabel}>Remarks</Text>
              <TextInput
                style={styles.remarksInput}
                multiline
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Write your comments here..."
                placeholderTextColor="#9ca3af"
              />
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Deposit Adjustment</Text>

        <View style={styles.card}>
          {/* IBAN NUMBER */}
          <Text style={styles.inputLabel}>IBAN Number *</Text>
          <TextInput
            placeholder="AE07 1234 5678 9012 3456 7890"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.warning}>
            Please fill out the following to adjust security deposit.
          </Text>

          {/* ACCOUNT HOLDER */}
          <Text style={styles.inputLabel}>Account Holder Name *</Text>
          <TextInput
            placeholder="Mustafa M"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          {/* ACCOUNT NUMBER */}
          <Text style={styles.inputLabel}>Account Number *</Text>
          <TextInput
            placeholder="897456789012"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.error}>Invalid Account Number</Text>

          {/* BRANCH */}
          <Text style={styles.inputLabel}>Branch *</Text>
          <TextInput
            placeholder="Downtown Branch"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          {/* BANK NAME */}
          <Text style={styles.inputLabel}>Bank Name *</Text>
          <TextInput
            placeholder="Emirates NBD"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          {/* Upload File */}
          <Text style={styles.inputLabel}>Upload Tenancy Contract *</Text>
          <TouchableOpacity style={styles.uploadBtn}>
            <Text style={styles.uploadText}>Choose File</Text>
          </TouchableOpacity>

          {/* SWITCH */}
          <View style={styles.switchRow}>
            <Switch
              value={settleFinalBill}
              onValueChange={setSettleFinalBill}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settleFinalBill ? "#007bff" : "#f4f3f4"}
            />
            <Text style={styles.switchText}>
              Do you want to settle Final Bill with security deposit?
            </Text>
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RequestMoveout;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },

  sectionTitle: {
    borderRadius: 8,
    marginBottom: 16,
    fontWeight: "700",
    color: "#030a70",
    fontSize: 16,
     backgroundColor: "#F5F5DC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
     marginBottom: 12,
  },
   profileHeader: {
    
  },

  /* Main card */
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },

  label: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
    flex: 1,
    marginLeft: 8,
  },

  contractBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#0057ff",
  },

  contractLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  contractDate: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  /* Checkbox Row */
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 8,
  },

  checkbox: {
    marginRight: 12,
  },

  checkboxBox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#0057ff",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  checkboxChecked: {
    backgroundColor: "#0057ff",
  },

  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  checkboxLabel: {
    fontSize: 15,
    color: "#0057ff",
    fontWeight: "600",
  },

  /* Final Bill Content */
  finalBillContent: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  finalBillTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#030a70",
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 6,
    color: "#374151",
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    color: "#111827",
  },

  /* Date Container */
  dateContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
  },

  dateText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },

  /* Remarks Input */
  remarksInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    textAlignVertical: "top",
    minHeight: 120,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
  },

  warning: {
    fontSize: 13,
    color: "#92400e",
    marginTop: 6,
    marginBottom: 8,
    fontStyle: "italic",
    backgroundColor: "#fef3c7",
    padding: 8,
    borderRadius: 6,
  },

  error: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "500",
  },

  uploadBtn: {
    marginTop: 6,
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
  },

  uploadText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 8,
  },

  switchText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    color: "#374151",
    fontWeight: "500",
    lineHeight: 20,
  },

  saveBtn: {
    marginTop: 24,
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  /* ---------- Skeleton styles ---------- */
  skeletonContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  skeletonHeader: {
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  skeletonGreetingCard: {
    height: 80,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  skeletonCardLarge: {
    height: 200,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginBottom: 20,
  },
  skeletonSectionTitle: {
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  skeletonButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    width: "60%",
    alignSelf: "center",
  },
});