// src/Payment.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  Alert,            
  Linking, 
} from "react-native";
import GreetingCard from "../components/GreetingCard";

const SkeletonBox = ({ style }) => (
  <View style={[styles.skeletonBox, style]} />
);
  const handleDownloadReceipt = async () => {
    try {
      const res = await fetch(
        `https://residentapi.strata-global.com/api/get-receipt?reference=${encodeURIComponent(
          successData.reference
        )}`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      // ⚠️ Adjust `data.receiptUrl` to whatever your API actually returns
      const receiptUrl = data.receiptUrl || data.url;

      if (!receiptUrl) {
        Alert.alert("Receipt not available", "Could not find receipt URL.");
        return;
      }

      // 2. Open the URL – device will use PDF viewer / browser
      const supported = await Linking.canOpenURL(receiptUrl);

      if (supported) {
        await Linking.openURL(receiptUrl);
      } else {
        Alert.alert(
          "Cannot open receipt",
          "No application available to open this receipt."
        );
      }
    } catch (err) {
      console.log("Download receipt error:", err);
      Alert.alert(
        "Error",
        err?.message || "Failed to download receipt. Please try again."
      );
    }
  };

const Payment = ({
  onHome,
  customerName = "Daniel Wellington", // fallback if API fails
  building = "",
  unit = "",
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  // 🔹 profile + loading + error from backend (like Profile.jsx)
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);  // drives skeleton + card
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "https://residentapi.strata-global.com/api/get-approved-client?userId=752329",
          { method: "GET", signal: controller.signal }
        );

        if (!response.ok) {
          Alert.alert("Error", `Profile API failed\nStatus: ${response.status}`);
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (isMounted && data && typeof data === "object") {
          setProfile(data);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          Alert.alert(
            "Connection Error",
            err.message || "Unable to load profile for payment"
          );
          if (isMounted) setError("Failed to load profile.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const p = profile || {};

  // 🔹 Header values (prefer API, fallback to props)
  const headerName = p.FirstName || customerName;
  const buildingName = p.BuildingName || building;
  const unitName = p.UnitName || unit;
  const headerBuilding = buildingName
    ? unitName
      ? `${buildingName} - ${unitName}`
      : buildingName
    : "—";

  // 🔹 Bill data – use API building & unit when available
  const billData = {
    billNo: "42",
    buildingName: buildingName || "LIV Marina",
    billDate: "23 Oct 2025",
    unitNo: unitName || "4401_BTU",
    dueDate: "23 Oct 2025",
    description: "Security Deposit",
    amount: "3500",
    toPay: "3500",
    paidAmount: "0",
    totalSelectedAmount: "0.00",
  };

  const successData = {
    reference: "TST2575686787698",
    clientName: headerName,
    date: "23 Oct 2025",
    status: "Paid",
  };

  const handlePay = () => {
    setShowSuccess(true);
  };

  const handleHome = () => {
    if (onHome) onHome();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔹 Greeting Card (skeleton + API data) */}
        <GreetingCard
          loading={loading}
          name={headerName}
          building={headerBuilding}
        />

        {/* Optional small error text if you want */}
        {error && (
          <Text
            style={{
              color: "#B91C1C",
              fontSize: 12,
              marginBottom: 8,
              marginLeft: 4,
            }}
          >
            {error}
          </Text>
        )}

        {/* ---------- SKELETON STATE FOR PAYMENT CARD ---------- */}
        {loading ? (
          <>
            {/* Quick Pay skeleton card */}
            <View style={[styles.cardWrapper, styles.skeletonCard]}>
              <View style={styles.cardHeader}>
                <SkeletonBox
                  style={{
                    width: 110,
                    height: 16,
                    borderRadius: 8,
                  }}
                />
              </View>

              <View style={styles.cardBody}>
                {/* Bill No row skeleton */}
                <View style={styles.firstRow}>
                  <SkeletonBox
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      marginRight: 8,
                    }}
                  />
                  <SkeletonBox
                    style={{
                      width: 70,
                      height: 14,
                      borderRadius: 6,
                      marginRight: 6,
                    }}
                  />
                  <SkeletonBox
                    style={{
                      width: 60,
                      height: 14,
                      borderRadius: 6,
                    }}
                  />
                </View>

                {/* Detail rows skeleton */}
                {Array.from({ length: 8 }).map((_, idx) => (
                  <View key={idx} style={styles.row}>
                    <SkeletonBox
                      style={{
                        width: "40%",
                        height: 14,
                        borderRadius: 6,
                      }}
                    />
                    <SkeletonBox
                      style={{
                        width: "30%",
                        height: 14,
                        borderRadius: 6,
                      }}
                    />
                  </View>
                ))}

                {/* Total amount skeleton */}
                <View style={styles.totalRow}>
                  <SkeletonBox
                    style={{
                      width: "45%",
                      height: 16,
                      borderRadius: 6,
                    }}
                  />
                  <SkeletonBox
                    style={{
                      width: "25%",
                      height: 16,
                      borderRadius: 6,
                    }}
                  />
                </View>

                {/* Buttons skeleton */}
                <View style={styles.buttonsRow}>
                  <SkeletonBox
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 999,
                      marginRight: 8,
                    }}
                  />
                  <SkeletonBox
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 999,
                      marginLeft: 8,
                    }}
                  />
                </View>
              </View>
            </View>

            <View style={{ height: 24 }} />
          </>
        ) : (
          <>
            {/* ---------- QUICK PAY CARD (only before Pay) ---------- */}
            {!showSuccess && (
              <View style={styles.cardWrapper}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.headerIconBox}>
                      <Image
                        source={require("../../assets/images/quickpay.png")}
                        style={styles.headerIcon}
                      />
                    </View>
                    <Text style={styles.cardHeaderText}>Quick Pay</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.firstRow}>
                    <Text style={styles.billNoLabel}>Bill No.</Text>
                    <Text style={styles.billNoValue}> {billData.billNo}</Text>
                  </View>

                  <Row label="Building Name" value={billData.buildingName} />
                  <Row label="Bill Date" value={billData.billDate} />
                  <Row label="Unit No" value={billData.unitNo} />
                  <Row label="Due Date" value={billData.dueDate} />
                  <Row label="Description" value={billData.description} />
                  <Row label="Amount" value={billData.amount} />
                  <Row
                    label="To Pay"
                    value={billData.toPay}
                    valueStyle={styles.valueBlue}
                  />
                  <Row label="Paid Amount" value={billData.paidAmount} />

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Selected Amount</Text>
                    <Text style={styles.totalValue}>
                      {billData.totalSelectedAmount}
                    </Text>
                  </View>

                  <View style={styles.buttonsRow}>
                    <TouchableOpacity
                      style={styles.payButton}
                      activeOpacity={0.8}
                      onPress={handlePay}
                    >
                      <Text style={styles.payButtonText}>Pay</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.closeButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {!showSuccess && <View style={{ height: 24 }} />}

            {/* ---------- PAYMENT SUCCESS CARD (only after Pay) ---------- */}
            {showSuccess && (
              <View style={styles.successWrapper}>
                <View style={styles.successHeader}>
                  <View style={styles.successHeaderLeft}>
                    <View style={styles.successHeaderDot}>
                      <Text style={styles.successHeaderDotText}>✓</Text>
                    </View>
                    <Text style={styles.successHeaderText}>
                      Payment Successful
                    </Text>
                  </View>
                </View>

                <View style={styles.successBody}>
                  <View style={styles.bigCircle}>
                    <Text style={styles.bigTick}>✓</Text>
                  </View>

                  <Text style={styles.successTitle}>Payment Successful</Text>
                  <Text style={styles.successSubtitle}>
                    Your payment has been processed successfully.
                  </Text>

                  <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>
                        Transaction Reference :
                      </Text>
                      <Text style={styles.infoValue}>
                        {successData.reference}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Client Name</Text>
                      <Text style={[styles.infoValue, styles.linkText]}>
                        {successData.clientName}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Date</Text>
                      <Text style={styles.infoValue}>{successData.date}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Status</Text>
                      <Text style={[styles.infoValue, styles.paidText]}>
                        {successData.status}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                   style={styles.downloadButton}
                   activeOpacity={0.8}
                   onPress={handleDownloadReceipt}
                   > 
                  <Text style={styles.downloadButtonText}>
                   Download Receipt
                  </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.homeButton}
                    activeOpacity={0.8}
                    onPress={handleHome}
                  >
                    <Text style={styles.homeButtonText}>Home</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={{ height: 24 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Row = ({ label, value, valueStyle }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueStyle]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // skeleton
  skeletonBox: {
    backgroundColor: "#E5E7EB",
  },
  skeletonCard: {
    backgroundColor: "#f3f4f6",
    borderColor: "#E5E7EB",
  },

  cardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFDF3",
    borderWidth: 1,
    borderColor: "#F3E8A3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    backgroundColor: "#FFF8D5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3E8A3",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#E6F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  cardHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2933",
  },
  cardBody: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  firstRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
  },
  checkboxFilled: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#2563EB",
    backgroundColor: "#2563EB",
    marginRight: 10,
  },
  billNoLabel: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },
  billNoValue: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  label: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  valueBlue: {
    color: "#0066CC",
  },
  totalRow: {
    marginTop: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  payButton: {
    flex: 1,
    backgroundColor: "#0066FF",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    marginRight: 8,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    marginLeft: 8,
  },
  closeButtonText: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "600",
  },

  /* SUCCESS */
  successWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFDF3",
    borderWidth: 1,
    borderColor: "#F3E8A3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  successHeader: {
    backgroundColor: "#FFF8D5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3E8A3",
  },
  successHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  successHeaderDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  successHeaderDotText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  successHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2933",
  },
  successBody: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: "center",
  },
  bigCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  bigTick: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "700",
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2933",
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  linkText: {
    color: "#2563EB",
  },
  paidText: {
    color: "#16A34A",
  },
  downloadButton: {
    width: "100%",
    backgroundColor: "#0066FF",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  downloadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  homeButton: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  homeButtonText: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Payment;
