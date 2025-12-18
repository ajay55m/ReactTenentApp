// src/PaymentHistory.jsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import GreetingCard from "../components/GreetingCard";
import { useSession } from "../context/SessionContext";
import { getApprovedClient, getPaymentHistory } from "../apiConfig";

const PaymentHistory = () => {
  const { session, isReady } = useSession();

  const loginKey = session?.loginKey;
  const clientId = session?.clientId;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    if (!isReady || !loginKey || !clientId) return;

    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        /* -------- PROFILE -------- */
        const profileRes = await getApprovedClient(clientId);
        if (mounted && profileRes.ok) {
          setProfile(profileRes.data);
        }

        /* -------- PAYMENT HISTORY (POST) -------- */
        const today = new Date();
        const fromDate = new Date();
        fromDate.setMonth(today.getMonth() - 12);

        const format = (d) => d.toISOString().split("T")[0];

        const paymentRes = await getPaymentHistory({
          key: loginKey,
          fromDate: format(fromDate),
          toDate: format(today),
          byOffice: false,
          officeIds: "",
          clientIds: clientId,
        });

        if (!paymentRes.ok || !Array.isArray(paymentRes.data)) {
          throw new Error("Payment history failed");
        }

        if (mounted) {
          setPayments(paymentRes.data);
        }
      } catch (err) {
        console.log("PaymentHistory error:", err.message);
        if (mounted) setError("Failed to load payment history.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [isReady, loginKey, clientId]);

  /* ---------------- PROFILE VALUES ---------------- */

  const p = profile || {};
  const customerName = p.FirstName || "—";
  const buildingName = p.BuildingName || "—";
  const unitName = p.UnitName || "";
  const buildingLabel =
    buildingName && unitName ? `${buildingName} - ${unitName}` : buildingName;

  /* ---------------- SKELETON ---------------- */

  if (loading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <GreetingCard loading={true} name=" " building=" " />
        <View style={[styles.headerStrip, styles.skeleton]} />
        <View style={[styles.paymentCard, styles.skeletonCard]}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.paymentRow}>
              <View style={[styles.skelLine, { width: "40%" }]} />
              <View style={[styles.skelLine, { width: "30%" }]} />
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <GreetingCard name={customerName} building={buildingLabel} />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.headerStrip}>
        <Text style={styles.headerStripText}>Payment History</Text>
      </View>

      {payments.length === 0 ? (
        <Text style={styles.errorText}>No payment records found.</Text>
      ) : (
        payments.map((pay) => (
          <View key={pay.PaymentId} style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment No.</Text>
              <Text style={styles.paymentValue}>{pay.PaymentNo}</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Received Amount</Text>
              <View style={styles.amountBadge}>
                <Text style={styles.amountBadgeText}>
                  {pay.TotalReceivedAmount} AED
                </Text>
              </View>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Mode</Text>
              <View style={styles.modeBadge}>
                <Text style={styles.modeBadgeText}>
                  {pay.PaymentMode || "—"}
                </Text>
              </View>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Bill Type</Text>
              <Text style={styles.paymentValue}>
                {pay.TransTypeName || "—"}
              </Text>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  /* Header strip */
  headerStrip: {
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
    borderRadius: 6,

  },
  headerStripText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#21098bff",
  },

  /* Payment card */
  paymentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  paymentLabel: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
    flex: 1,
  },
  paymentValue: {
    fontSize: 14,
    color: "#1e1c1cff",
    fontWeight: "900",
    flex: 1,
    textAlign: "right",
  },

  amountBadge: {
    backgroundColor: "#2c5cc7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  amountBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  modeBadge: {
    backgroundColor: "#2cb2c7ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modeBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  /* Skeleton styles */
  skeleton: {
    backgroundColor: "#e3e3e3",
  },
  skeletonCard: {
    backgroundColor: "#f3f3f3",
    borderRadius: 8,
  },
  skelLine: {
    height: 12,
    backgroundColor: "#e3e3e3",
    borderRadius: 6,
  },

  errorText: {
    fontSize: 12,
    color: "#b91c1c",
    marginBottom: 8,
  },
});

export default PaymentHistory;
