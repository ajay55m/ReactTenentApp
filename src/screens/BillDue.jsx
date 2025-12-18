// BillDueScreen.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GreetingCard from "../components/GreetingCard";

// Demo due bills
const DUE_BILLS = [
  {
    id: "76",
    billNo: "76",
    billDate: "2025-12-08",
    billDuration: "2025-12-01 - 2025-12-08",
    building: "Dubai",
    unitNo: "2006",
    customerName: "Test",
    amount: "2,500.00",
    type: "Electricity",
  },
  {
    id: "77",
    billNo: "77",
    billDate: "2025-11-25",
    billDuration: "2025-11-01 - 2025-11-25",
    building: "LIV Marina",
    unitNo: "3402",
    customerName: "Rob Oconnor",
    amount: "1,850.00",
    type: "Gas",
  },
  {
    id: "78",
    billNo: "78",
    billDate: "2025-10-18",
    billDuration: "2025-10-01 - 2025-10-18",
    building: "Dubai Marina",
    unitNo: "1205",
    customerName: "Demo User",
    amount: "3,200.00",
    type: "Water",
  },
];

function getMonthYearLabel(dateStr) {
  const d = new Date(dateStr);
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

// 🔹 Skeleton card for loading state
const SkeletonDueCard = () => (
  <View style={styles.dueCard}>
    {/* Top row */}
    <View style={styles.cardTopRow}>
      <View style={[styles.iconBox, styles.skeletonBox]} />

      <View style={styles.titleArea}>
        <View
          style={[
            styles.skeletonBox,
            { width: "60%", height: 12, marginBottom: 6 },
          ]}
        />
        <View
          style={[styles.skeletonBox, { width: "40%", height: 10 }]}
        />
      </View>

      <View
        style={[
          styles.statusPill,
          styles.skeletonBox,
          { width: 50, height: 18 },
        ]}
      />
    </View>

    {/* Metrics row */}
    <View style={styles.metricsRow}>
      <View style={styles.metricItem}>
        <View
          style={[
            styles.skeletonBox,
            { width: "40%", height: 10, marginBottom: 4 },
          ]}
        />
        <View
          style={[
            styles.skeletonBox,
            { width: "70%", height: 14 },
          ]}
        />
      </View>

      <View style={styles.metricItem}>
        <View
          style={[
            styles.skeletonBox,
            { width: "50%", height: 10, marginBottom: 4 },
          ]}
        />
        <View
          style={[
            styles.skeletonBox,
            { width: "60%", height: 12 },
          ]}
        />
      </View>
    </View>

    {/* Duration */}
    <View
      style={[
        styles.skeletonBox,
        { width: "50%", height: 10, marginTop: 4 },
      ]}
    />

    {/* Actions */}
    <View style={styles.actionsRow}>
      <View
        style={[
          styles.skeletonBox,
          { width: 70, height: 24, borderRadius: 999, marginRight: 8 },
        ]}
      />
      <View
        style={[
          styles.skeletonBox,
          { width: 80, height: 24, borderRadius: 999 },
        ]}
      />
    </View>
  </View>
);

export default function BillDueScreen({ onPressPay, onPressHistory }) {
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSkeleton(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const sortedDueBills = useMemo(() => {
    return [...DUE_BILLS].sort(
      (a, b) => new Date(a.billDate).getTime() - new Date(b.billDate).getTime()
    );
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <View style={styles.root}>
        <View style={styles.mainContent}>
          <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Same greeting pattern as Profile */}
            <GreetingCard />

            {/* Header strip styled like profileHeader */}
            <View style={styles.headerRow}>
              <Text style={styles.pageTitle}>Bill Dues</Text>

              <TouchableOpacity
                style={styles.historyButton}
                onPress={onPressHistory}
              >
                <Text style={styles.historyButtonText}>Bill History</Text>
              </TouchableOpacity>
            </View>

            {/* If loading, show skeletons */}
            {showSkeleton ? (
              <>
                <View
                  style={[
                    styles.skeletonBox,
                    {
                      width: 100,
                      height: 12,
                      marginTop: 10,
                      marginBottom: 6,
                    },
                  ]}
                />
                <SkeletonDueCard />
                <SkeletonDueCard />
                <SkeletonDueCard />
              </>
            ) : (
              /* Grouped by month */
              sortedDueBills.map((bill, index) => {
                const currentLabel = getMonthYearLabel(bill.billDate);
                const prevLabel =
                  index > 0
                    ? getMonthYearLabel(sortedDueBills[index - 1].billDate)
                    : "";

                const showMonthHeader =
                  index === 0 || currentLabel !== prevLabel;
                const typeInitial =
                  bill.type?.charAt(0)?.toUpperCase() || "?";

                return (
                  <View key={bill.id}>
                    {showMonthHeader && (
                      <Text style={styles.monthHeader}>{currentLabel}</Text>
                    )}

                    <View style={styles.dueCard}>
                      {/* top row: icon + text + status pill */}
                      <View style={styles.cardTopRow}>
                        <View style={styles.iconBox}>
                          <Text style={styles.iconText}>{typeInitial}</Text>
                        </View>

                        <View style={styles.titleArea}>
                          <Text style={styles.billTitle}>
                            {bill.type} • {bill.billNo}
                          </Text>
                          <Text style={styles.billSubtitle}>
                            {bill.building} · Unit {bill.unitNo}
                          </Text>
                        </View>

                        <View style={styles.statusPill}>
                          <Text style={styles.statusPillText}>DUE</Text>
                        </View>
                      </View>

                      {/* main metric row */}
                      <View style={styles.metricsRow}>
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Amount</Text>
                          <Text style={styles.metricValue}>
                            {bill.amount} AED
                          </Text>
                        </View>

                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Bill Date</Text>
                          <Text style={styles.metricValueSmall}>
                            {bill.billDate}
                          </Text>
                        </View>
                      </View>

                      {/* duration text */}
                      <Text style={styles.durationText}>
                        Period: {bill.billDuration}
                      </Text>

                      {/* Actions row (right aligned) */}
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={styles.detailsButton}
                          onPress={() => console.log("View bill", bill.id)}
                        >
                          <Text style={styles.detailsButtonText}>
                            Details
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.payButton}
                          onPress={() => onPressPay && onPressPay(bill)}
                        >
                          <Text style={styles.payButtonText}>Pay Now</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* -------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e5e7eb",
  },
  root: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  /* Header strip – same vibe as profileHeader */
  headerRow: {
    backgroundColor: "#F5F5DC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "rgb(3,10,112)",
  },
  historyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  historyButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  /* Month header */
  monthHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 10,
    marginBottom: 6,
  },

  /* Card styled like the image */
  dueCard: {
    backgroundColor: "#FEFFFA",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  titleArea: {
    flex: 1,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  billSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FEE2E2",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B91C1C",
  },

  /* Metrics row  */
  metricsRow: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 8,
  },
  metricItem: {
    flex: 1,
    paddingVertical: 6,
  },
  metricLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  metricValueSmall: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  durationText: {
    fontSize: 11,
    color: "#6B7280",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  detailsButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
  detailsButtonText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  payButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#0066FF",
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* Skeleton */
  skeletonBox: {
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
  },
});
