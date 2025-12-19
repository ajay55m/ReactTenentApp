import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TenantRequestCancelled = ({
  reason = "Invalid documents",
  onResubmit,
  onBack,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              ❌ Move-In Request Rejected
            </Text>
          </View>

          {/* Message */}
          <Text style={styles.message}>
            Your move-in request has been rejected. Please review the reason
            below and make corrections before resubmitting.
          </Text>

          {/* Reason Box */}
          <View style={styles.reasonBox}>
            <View style={styles.reasonIndicator} />
            <Text style={styles.reasonText}>
              Rejected Reason:{" "}
              <Text style={styles.reasonHighlight}>{reason}</Text>
            </Text>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onResubmit}
          >
            <Text style={styles.primaryText}>Resubmit Move-In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onBack}
          >
            <Text style={styles.secondaryText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TenantRequestCancelled;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 6,
  },

  /* Header */
  header: {
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  /* Content */
  message: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 16,
  },

  /* Reason box */
  reasonBox: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  reasonIndicator: {
    width: 4,
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 4,
    marginRight: 10,
  },
  reasonText: {
    fontSize: 13,
    color: "#92400E",
  },
  reasonHighlight: {
    fontWeight: "700",
    color: "#B91C1C",
  },

  /* Buttons */
  primaryButton: {
    backgroundColor: "#1D4ED8",
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  secondaryButton: {
    marginHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  secondaryText: {
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
  },
});
