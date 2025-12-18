import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TenantRequestCancelled = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Request Cancelled</Text>

          <Text style={styles.message}>
            Your approval request has been cancelled.
          </Text>

          <Text style={styles.message}>
            Please contact the administrator if you believe this is a mistake
            or submit a new request.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onBack}
          >
            <Text style={styles.primaryText}>Back to Login</Text>
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
    borderRadius: 16,
    padding: 24,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#B91C1C",
    marginBottom: 14,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    color: "#374151",
    lineHeight: 22,
    marginBottom: 10,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
