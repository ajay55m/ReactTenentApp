import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TenantApprovalPending = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FB" />

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Approval Pending</Text>

          <Text style={styles.message}>
            We are currently processing your request.
          </Text>

          <Text style={styles.message}>
            Please note that it will take approximately{" "}
            <Text style={styles.bold}>24 to 48 hours</Text> to complete.
            We appreciate your patience.
          </Text>

          <Text style={styles.message}>
            For any further information, please contact the administrator at
          </Text>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL("mailto:utility@strata-global.com")
            }
          >
            <Text style={styles.email}>utility@strata-global.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.replace("Login")}
          >
            <Text style={styles.loginText}>Login Here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TenantApprovalPending;
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
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#1E3A8A",
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    color: "#374151",
    lineHeight: 22,
    marginBottom: 10,
  },
  bold: {
    fontWeight: "600",
    color: "#111827",
  },
  email: {
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  loginText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },
});
