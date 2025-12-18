import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, } from "react-native";
import GreetingCard from "../components/GreetingCard";
import { useSession } from "../context/SessionContext";
import { getContractsByClient, getOwnerContractsByClient } from "../apiConfig";

const SkeletonBox = ({ style }) => (
  <View style={[styles.skeletonBox, style]} />
);

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const monthIndex = d.getMonth(); // 0–11
  const year = d.getFullYear();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${monthNames[monthIndex]} ${year}`;
};

// NEW: helper to safely pick property values from potential shapes/casings
const pick = (obj, ...keys) => {
  if (!obj) return undefined;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined && obj[k] !== null) {
      return obj[k];
    }
  }
  return undefined;
};

const normalizeContract = (raw) => {
  if (!raw) return {};
  // try direct fields, then common alternate casings/nests
  const ContractID = pick(raw, "ContractID", "contractId", "id", "Id", "contractID");
  const ContractCategory = pick(raw, "ContractCategory", "contractCategory", "category");
  const ContractStatus = pick(raw, "ContractStatus", "contractStatus", "isActive", "active");
  const ContractExpiry = pick(raw, "ContractExpiry", "contractExpiry", "expiryDate", "ExpiryDate", "expiry");
  const PropertyName = pick(
    raw,
    "PropertyName",
    "propertyName",
    "Property",
    "property",
    "property_name",
    raw.Property && raw.Property.Name ? raw.Property.Name : undefined
  );
  const OfficeId = pick(raw, "OfficeId", "officeId", "office", "Unit", "unit", "office_id");

  return {
    ContractID,
    ContractCategory,
    ContractStatus,
    ContractExpiry,
    PropertyName,
    OfficeId,
    // include raw so you can inspect other fields later
    __raw: raw,
  };
};

const MyContract = () => {
  const { session } = useSession();

  const clientId = session?.clientId;
  const clientTypeId = session?.clientTypeId; // 👈 now comes from SessionContext

  const [showContractDetails, setShowContractDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contractData, setContractData] = useState(null); // full response

  // Load contracts from backend based on clientId + clientTypeId
useEffect(() => {
  // wait until session exists
  if (!session) return;

  const clientIdToUse = session.clientId || session.userId;
  if (!clientIdToUse) return; // nothing to do

  let isMounted = true;

  const loadContracts = async () => {
    try {
      setLoading(true);

      // attach loginKey (if present) for backend auth
      const headers = session.loginKey
        ? { Authorization: `Bearer ${session.loginKey}` }
        : {};

      let result;

       if (session.clientTypeId === 1) {
        result = await getOwnerContractsByClient(clientIdToUse);   
       } else {
        result = await getContractsByClient(clientIdToUse);
      }
      if (!result.ok) {
        throw new Error(`HTTP ${result.status}`);
      }

      if (!isMounted) return;
      setContractData(result.data);
    } catch (err) {
      console.log("Contract load failed:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  loadContracts();

  return () => {
    isMounted = false;
  };
}, [session]);


  // ---------- NORMALIZE and PICK first contract ----------
  const rawContract = Array.isArray(contractData) ? contractData[0] : contractData || null;
  const contract = normalizeContract(rawContract);

  const propertyName = contract.PropertyName || "—";
  const contractId = contract.ContractID ? String(contract.ContractID) : "—";
  const officeId = contract.OfficeId || contract.OfficeId === 0 ? String(contract.OfficeId) : "—";
  const contractExpiry = formatDate(contract.ContractExpiry);
  const isActive = contract.ContractStatus === true || contract.ContractStatus === "true" || contract.ContractStatus === 1 || contract.ContractStatus === "1";
  const contractTypeText = (contract.ContractCategory === 0 || contract.ContractCategory === "0") ? "RESIDENTIAL" : "COMMERCIAL";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* GREETING CARD (has its own skeleton) */}
      <GreetingCard loading={loading} />

      {/* ------------- HEADER STRIP ------------- */}
      {loading ? (
        <SkeletonBox
          style={{ width: "60%", height: 40, borderRadius: 10, marginBottom: 12 }}
        />
      ) : !showContractDetails ? (
        <View style={styles.headerStrip}>
          <Text style={styles.headerStripText}>My Contract</Text>
        </View>
      ) : (
        <View style={styles.detailsHeaderRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setShowContractDetails(false)}
            activeOpacity={0.7}
          >
            <Image
              source={require("../../assets/images/back-arrow.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <View style={[styles.headerStrip, styles.headerStripFlex]}>
            <Text style={styles.headerStripText}>View Contract Details</Text>
          </View>
        </View>
      )}

      {loading ? (
        <>
          {/* Summary skeleton card */}
          <View style={[styles.summaryCard, styles.skeletonCard]}>
            <SkeletonBox
              style={{
                width: "50%",
                height: 18,
                borderRadius: 8,
                marginBottom: 10,
              }}
            />
            <SkeletonBox
              style={{
                width: "80%",
                height: 20,
                borderRadius: 8,
                marginBottom: 10,
              }}
            />
            <SkeletonBox
              style={{
                width: "60%",
                height: 18,
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
            <SkeletonBox
              style={{
                width: "100%",
                height: 40,
                borderRadius: 10,
                marginTop: 4,
              }}
            />
          </View>
          <View style={[styles.detailsCard, styles.skeletonCard]}>
            <View style={styles.detailsTable}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.detailRow,
                    { borderBottomWidth: idx === 4 ? 0 : 1 },
                  ]}
                >
                  <SkeletonBox
                    style={{ width: "40%", height: 14, borderRadius: 6 }}
                  />
                  <SkeletonBox
                    style={{ width: "35%", height: 14, borderRadius: 6 }}
                  />
                </View>
              ))}
            </View>

            <SkeletonBox
              style={{
                width: "100%",
                height: 50,
                borderRadius: 10,
                marginBottom: 10,
              }}
            />
            <SkeletonBox
              style={{
                width: "100%",
                height: 50,
                borderRadius: 10,
              }}
            />
          </View>

          <View style={{ height: 40 }} />
        </>
      ) : !showContractDetails ? (
        <View style={styles.summaryCard}>
          <View style={[styles.summaryRow, styles.coloredRow]}>
            <Text style={styles.summaryLabel}>Contract Type</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {contractTypeText}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryRow, styles.coloredRow]}>
            <Text style={styles.summaryValueMain}>{propertyName}</Text>
            <View style={styles.approvedBadge}>
              <Text style={styles.approvedText}>
                {isActive ? "Approved" : "Inactive"}
              </Text>
            </View>
          </View>

          <View
            style={[styles.summaryRow, styles.coloredRow, { marginTop: 6 }]}
          >
            <Text style={styles.summaryLabel}>Contract Expiry</Text>
            <Text style={styles.summaryExpiry}>{contractExpiry}</Text>
          </View>

          <TouchableOpacity
            style={[styles.viewRow]}
            onPress={() => setShowContractDetails(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewRowText}>View Contract Details</Text>
            <Image
              source={require("../../assets/images/right.png")}
              style={styles.buildingIcon}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.detailsCard}>
          <View style={styles.detailsTable}>
            <DetailRow
              label="Property"
              value={propertyName}
              colored
            />
            <DetailRow
              label="Office / Unit"
              value={officeId}
              colored
            />
            <DetailRow
              label="Contract Type"
              value={contractTypeText}
              colored
            />
            <DetailRow
              label="Status"
              value={isActive ? "Active" : "Inactive"}
              colored
            />
            <DetailRow
              label="Contract ID"
              value={contractId}
              hideBorder
              colored
            />
          </View>
          <TouchableOpacity style={[styles.dateBox]} activeOpacity={0.7}>
            <View style={styles.dateRowLeft}>
              <View style={styles.dateIconBox}>
                <Text style={styles.dateIcon}>📅</Text>
              </View>
              <Text style={styles.dateLabel}>Contract Expiry Date</Text>
            </View>
            <Text style={styles.dateValue}>{contractExpiry}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const DetailRow = ({ label, value, hideBorder, colored }) => (
  <View
    style={[
      styles.detailRow,
      colored && styles.coloredRow,
      hideBorder && { borderBottomWidth: 0 },
    ]}
  >
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  /* SKELETON STYLE */
  skeletonBox: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  skeletonCard: {
    backgroundColor: "#f3f4f6",
  },

  /* Header strip */
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
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
     marginBottom: 12,
  },
  headerStripFlex: {
    flex: 1,
    marginBottom: 0,
    marginLeft: 12,
  },
  headerStripText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#030a70",
  },
  detailsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b62cc",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: "#fff",
  },

  /* Summary card */
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  coloredRow: {
    backgroundColor: "#f8fafc",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  summaryValueMain: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  summaryExpiry: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "#e5edff",
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1d4ed8",
  },

  approvedBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "#dcfce7",
  },
  approvedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },

  viewRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  viewRowText: {
    fontSize: 14,
    color: "#1d4ed8",
    fontWeight: "600",
  },
  buildingIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    tintColor: "#343439",
  },

  /* Details card */
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  detailsTable: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    marginBottom: 16,
    backgroundColor: "#f8fafc",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
    textAlign: "right",
  },

  dateBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
  },
  dateRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#e5edff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dateIcon: {
    fontSize: 16,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  dateValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1d4ed8",
  },
});

export default MyContract;