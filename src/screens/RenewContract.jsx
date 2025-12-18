// RenewContract.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import DocumentPicker from "@react-native-documents/picker";
import GreetingCard from "../components/GreetingCard";
import { API_BASE_URL, getFinalBillRequest } from "../apiConfig";
import { useSession } from "../context/SessionContext";

const formatApiDate = (raw) => {
  if (!raw && raw !== 0) return "";

  console.log("formatApiDate input:", raw, "type:", typeof raw);

  try {
    if (typeof raw === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      console.log("Already in MM/DD/YYYY format:", raw);
      return raw;
    }

    // Handle "DD MMM YYYY" format (e.g., "22 Aug 2025")
    if (typeof raw === "string" && /^\d{1,2}\s+\w{3}\s+\d{4}$/.test(raw)) {
      console.log("Detected DD MMM YYYY format:", raw);
      const date = new Date(raw);
      if (!isNaN(date.getTime())) {
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const yyyy = date.getFullYear();
        const formatted = `${mm}/${dd}/${yyyy}`;
        console.log("Formatted DD MMM YYYY date:", formatted);
        return formatted;
      }
    }

    let date = new Date(raw);

    if (isNaN(date.getTime())) {
      const cleaned = String(raw).replace(/-/g, " ").trim();
      console.log("Trying cleaned version:", cleaned);
      date = new Date(cleaned);
      console.log("Cleaned date object:", date, "isValid:", !isNaN(date.getTime()));
    }

    if (!isNaN(date.getTime())) {
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = date.getFullYear();
      const formatted = `${mm}/${dd}/${yyyy}`;
      console.log("Formatted date:", formatted);
      return formatted;
    }
  } catch (e) {
    console.error("Date parsing error:", e);
  }

  console.log("Returning raw value:", String(raw));
  return String(raw);
};

const RENEW_ENDPOINT = "/renew-contract";

const RenewContract = () => {
  const { session, isReady } = useSession();
  
  const userId = session?.clientId;
  const officeId = session?.unit || session?.officeId ;
  const [officeNumberFromApi, setOfficeNumberFromApi] = useState("");
  const officeNumberDisplay = officeNumberFromApi || session?.officeNumber || session?.officeId || "";
  const loginKey = session?.loginKey || "";

  console.log("🔍 Session values:", { userId, officeId, officeNumber: session?.officeNumber, loginKey, isReady });

  // Debug state changes
  useEffect(() => {
    console.log("📊 State updated:", { contractId, startDate, endDate, officeNumberDisplay });
  }, [contractId, startDate, endDate, officeNumberDisplay]);

  const [contractId, setContractId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

const fetchContractData = async () => {
  setError("");
  setLoading(true);

  if (!userId || !officeId || !loginKey) {
    setError("Session data incomplete. Please login again.");
    setLoading(false);
    return;
  }

  try {
    const { ok, status, data } = await getFinalBillRequest(
  userId,
  officeId,
  { headers: { Authorization: `Bearer ${loginKey}` } }
    );

    if (!ok) {
      setError(`Server error (${status})`);
      setLoading(false);
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      setError("No active contract found for this office.");
      setLoading(false);
      return;
    }

    const contract = data[0]; // ✅ backend always returns array

    setOfficeNumberFromApi(contract.OfficeNumber ?? "");
    setContractId(String(contract.ContractId ?? ""));
    setStartDate(formatApiDate(contract.ContractStartDate));
    setEndDate(formatApiDate(contract.ContractEndDate));

    setError("");
  } catch (err) {
    console.error("fetchContractData error:", err);
    setError("Unable to fetch contract details");
  } finally {
    setLoading(false);
  }
};



useEffect(() => {
  if (isReady && userId && officeId) {
    fetchContractData();
  }
}, [isReady, userId, officeId]);


  const pickFile = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        copyTo: "cachesDirectory",
      });
      setSelectedFile(res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert("File error", "Unable to pick file");
      }
    }
  };

  const validateForm = () => {
    if (!contractId.trim()) {
      Alert.alert("Validation", "Please enter contract ID.");
      return false;
    }

    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(startDate)) {
      Alert.alert("Validation", "Enter valid start date (MM/DD/YYYY).");
      return false;
    }

    if (!dateRegex.test(endDate)) {
      Alert.alert("Validation", "Enter valid end date (MM/DD/YYYY).");
      return false;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      Alert.alert("Validation", "End date must be after start date.");
      return false;
    }

    if (!selectedFile) {
      Alert.alert("Validation", "Please upload the tenancy contract.");
      return false;
    }

    return true;
  };

  const submitRenew = async () => {
    if (!validateForm()) return;

    if (!userId || !officeId || !loginKey) {
      Alert.alert("Session Error", "Please login again.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("userId", String(userId));
      formData.append("officeid", String(officeId));
      formData.append("ContractId", contractId);
      formData.append("ContractStartDate", startDate);
      formData.append("ContractEndDate", endDate);

      formData.append("file", {
        uri: selectedFile.uri,
        name: selectedFile.name || `contract_${Date.now()}.pdf`,
        type: selectedFile.type || "application/pdf",
      });

      const response = await fetch(`${API_BASE_URL}${RENEW_ENDPOINT}`, {
        method: "POST",
        headers: {
          loginKey,
          Authorization: `Bearer ${loginKey}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.Message || "Submission failed");
      }

      Alert.alert("Success", result?.Message || "Contract renewed successfully", [
        { text: "OK", onPress: () => fetchContractData() },
      ]);

      setSelectedFile(null);
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isReady || loading) {
    return (
      <View style={styles.skeletonScreen}>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonCardLarge} />
        <View style={styles.skeletonStrip} />
        <View style={styles.skeletonDetailsCard}>
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLine} />
        </View>
        <View style={styles.skeletonInput} />
        <View style={styles.skeletonInput} />
        <View style={styles.skeletonInput} />
        <View style={styles.skeletonButton} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <GreetingCard
      />

      <View style={styles.headerStrip}>
        <Text style={styles.headerStripText}>Renew Contract</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.highlightedContainer}>
        <View style={styles.detailsCard}>
          <DetailItem label="Office Number" value={officeNumberDisplay || "N/A"} />
          <DetailItem label="Contract ID" value={contractId || "Not found"} />
          <DetailItem label="Start Date" value={startDate || "Not found"} />
          <DetailItem label="End Date" value={endDate || "Not found"} />
        </View>

        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>Contract ID *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter Contract ID"
            placeholderTextColor="#9ca3af"
            value={contractId}
            onChangeText={setContractId}
            editable={!submitting}
          />
        </View>

        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>Contract Start Date * (MM/DD/YYYY)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#9ca3af"
            value={startDate}
            onChangeText={setStartDate}
            editable={!submitting}
          />
        </View>

        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>Contract End Date * (MM/DD/YYYY)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#9ca3af"
            value={endDate}
            onChangeText={setEndDate}
            editable={!submitting}
          />
        </View>

        <View style={styles.uploadItem}>
          <Text style={styles.inputLabel}>Upload Tenancy Contract *</Text>
          <Text style={styles.uploadHint}>PDF or Image files only</Text>
          <View style={styles.uploadSection}>
            <TouchableOpacity
              style={[styles.uploadButton, submitting && styles.uploadButtonDisabled]}
              onPress={pickFile}
              disabled={submitting}
            >
              <Text style={styles.uploadButtonText}>
                {selectedFile ? "Change File" : "Choose File"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.fileText} numberOfLines={2}>
              {selectedFile ? selectedFile.name : "No file chosen"}
              {selectedFile?.size ? ` (${Math.round(selectedFile.size / 1024)} KB)` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.renewButton, submitting && styles.renewButtonDisabled]}
            onPress={submitRenew}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.renewButtonText}>Renew Contract</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.noteText}>
          * Required fields. Please ensure all information is accurate before submitting.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const DetailItem = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e5e7eb",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  highlightedContainer: {
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dbeafe",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  headerStrip: {
    fontWeight: "700",
    fontSize: 16,
    backgroundColor: "#F5F5DC",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerStripText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#030a70",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailLabel: {
    fontSize: 13,
    color: "#4b5563",
    flex: 1,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    textAlign: "right",
  },
  inputItem: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 6,
  },
  uploadHint: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
    fontStyle: "italic",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#111827",
  },
  uploadItem: {
    marginVertical: 12,
  },
  uploadSection: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  uploadButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#3b82f6",
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
    borderColor: "#9ca3af",
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
  },
  fileText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    flexWrap: "wrap",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  renewButton: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  renewButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  renewButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  noteText: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 12,
    textAlign: "center",
  },
  skeletonScreen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  skeletonHeader: {
    width: "40%",
    height: 20,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  skeletonCardLarge: {
    width: "100%",
    height: 80,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  skeletonStrip: {
    width: "50%",
    height: 24,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  skeletonDetailsCard: {
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    padding: 12,
    marginBottom: 16,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D1D5DB",
    marginBottom: 8,
  },
  skeletonInput: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  skeletonButton: {
    width: "40%",
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginTop: 8,
  },
});

export default RenewContract;