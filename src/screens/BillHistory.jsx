// BillHistoryScreen.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GreetingCard from "../components/GreetingCard";
import { useSession } from "../context/SessionContext";
import { getBillHistory } from "../apiConfig";

/* ---------------- FILTERS ---------------- */

const FILTERS = [
  { key: "all", label: "All", icon: "📊" },
  { key: "last6", label: "6 Months", icon: "🗓️" },
];

/* ---------------- HELPERS ---------------- */

function monthsDiff(from, to) {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

const formatApiDate = (d) => d.toISOString().split("T")[0];

/* ---------------- SCREEN ---------------- */

export default function BillHistoryScreen() {
  const { session, isReady } = useSession();

  const loginKey = session?.loginKey;
  const clientId = session?.clientId;

  const [activeFilter, setActiveFilter] = useState("all");
  const [billData, setBillData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- FETCH BILL HISTORY ---------------- */

  const fetchBillHistory = useCallback(async () => {
    if (!loginKey || !clientId) return;

    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const fromDate = new Date();
      fromDate.setMonth(today.getMonth() - 12);

      const { ok, data } = await getBillHistory({
        key: loginKey,
        fromDate: formatApiDate(fromDate),
        toDate: formatApiDate(today),
        byOffice: false,
        officeIds: "",
        clientIds: clientId,
      });

      if (!ok || !Array.isArray(data)) {
        throw new Error("Failed to load bill history");
      }

      const normalized = data.map((bill) => ({
        id: String(bill.BillId || bill.Gen_No),
        billDate: bill.BillDate,
        type: bill.TransTypeName || "Bill",
        paymentMethod: "Online Payment",
        amount: Number(bill.BillAmount || 0).toFixed(2),
        currency: bill.CurrencyType || "AED",
        billNo: bill.BillNo,
      }));

      setBillData(normalized);
    } catch (err) {
      console.log("Bill history error:", err.message);
      setError("Unable to load bill history");
    } finally {
      setLoading(false);
    }
  }, [loginKey, clientId]);

  useEffect(() => {
    if (isReady) {
      fetchBillHistory();
    }
  }, [isReady, fetchBillHistory]);

  /* ---------------- FILTERED DATA ---------------- */

  const filteredBills = useMemo(() => {
    const today = new Date();

    return billData.filter((bill) => {
      const billDate = new Date(bill.billDate);
      const diff = monthsDiff(billDate, today);

      if (activeFilter === "last6") {
        return diff >= 0 && diff < 6;
      }
      return true;
    });
  }, [billData, activeFilter]);

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <GreetingCard />

        <Text style={styles.headerTitle}>Bill History</Text>

        {/* Filters */}
        <View style={styles.filtersRow}>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {f.icon} {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* STATES */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading bills...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchBillHistory}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredBills.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📄 No bills found</Text>
          </View>
        ) : (
          filteredBills.map((bill) => (
            <Pressable key={bill.id} style={styles.billCard}>
              <View style={styles.billRow}>
                {/* Left icon */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {bill.type.charAt(0)}
                  </Text>
                </View>

                {/* Middle content */}
                <View style={styles.billInfo}>
                  <Text style={styles.billName} numberOfLines={1}>
                    #{bill.billNo} {bill.type}
                  </Text>

                  {/* Payment Method – highlighted */}
                  <View style={styles.paymentBadge}>
                    <Text style={styles.paymentBadgeText}>
                      {bill.paymentMethod}
                    </Text>
                  </View>
                </View>

                {/* Amount – grey badge */}
                <View style={styles.amountBadge}>
                  <Text style={styles.amountText}>
                    {bill.amount} {bill.currency}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  scrollContent: { padding: 16 },

  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },
  headerTitle: {
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

  filtersRow: { flexDirection: "row", marginBottom: 16 },
  filterPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterPillActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  filterText: { fontSize: 13, fontWeight: "700", color: "#374151" },
  filterTextActive: { color: "#FFFFFF" },

  billCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },

  billRow: { flexDirection: "row", alignItems: "center" },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: "700" },

  billInfo: { flex: 1 },

  billName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  /* Payment method badge */
  paymentBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7", // light green
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#166534",
  },

  /* Amount badge */
  amountBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  amountText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },

  loadingContainer: { alignItems: "center", paddingVertical: 40 },
  loadingText: { marginTop: 12, color: "#6B7280" },

  errorContainer: {
    backgroundColor: "#FEF2F2",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  errorText: { color: "#DC2626", marginBottom: 12 },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: "#FFFFFF", fontWeight: "600" },

  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#6B7280" },
});
