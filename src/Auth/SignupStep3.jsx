import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { COLORS } from "./constants";

const SignupStep3 = ({
  signupForm,
  onChange,
  onSubmit,
  onBack,
  onVerifyOtp,
}) => {
  const [isPasswordVisible2, setIsPasswordVisible2] = useState(false);
  const [isPasswordVisible3, setIsPasswordVisible3] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Name:</Text>
          <Text style={styles.summaryValue}>
            {signupForm.name || "Not provided"}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>APRAM 5 (86):</Text>
          <Text style={styles.summaryValue}>
            {signupForm.building || "APRAM 5 (86)"}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Units:</Text>
          <Text style={styles.summaryValue}>
            {signupForm.units || "Not selected"}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Mobile:</Text>
          <Text style={styles.summaryValue}>
            {signupForm.phoneNo || "Not provided"}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Email:</Text>
          <Text style={styles.summaryValue}>
            {signupForm.emailId || "Not provided"}
          </Text>
        </View>
      </View>

      <Text style={styles.signupLabelText}>OTP:</Text>
      <View style={styles.otpContainer}>
        <TextInput
          style={styles.signupInput}
          placeholder="Enter OTP"
          placeholderTextColor={COLORS.TEXT_MUTED}
          value={signupForm.otp}
          onChangeText={(text) => onChange("otp", text)}
          keyboardType="number-pad"
        />
        <TouchableOpacity
          style={styles.verifyIdButton}
          onPress={onVerifyOtp}
        >
          <Text style={styles.verifyIdButtonText}>Verify</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.signupLabelText}>Enter Password:</Text>
      <View style={styles.signupPasswordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Enter password"
          placeholderTextColor={COLORS.TEXT_MUTED}
          value={signupForm.password}
          onChangeText={(text) => onChange("password", text)}
          secureTextEntry={!isPasswordVisible2}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible2(!isPasswordVisible2)}
          style={styles.eyeButton}
        >
          <Image
            source={
              isPasswordVisible2
                ? require("../../assets/images/eye-off.png")
                : require("../../assets/images/eye.png")
            }
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.signupLabelText}>Re-type Password:</Text>
      <View style={styles.signupPasswordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Re-type password"
          placeholderTextColor={COLORS.TEXT_MUTED}
          value={signupForm.confirmPassword}
          onChangeText={(text) => onChange("confirmPassword", text)}
          secureTextEntry={!isPasswordVisible3}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible3(!isPasswordVisible3)}
          style={styles.eyeButton}
        >
          <Image
            source={
              isPasswordVisible3
                ? require("../../assets/images/eye-off.png")
                : require("../../assets/images/eye.png")
            }
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.signupPageButtons}>
    
        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>SUBMIT</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        Please complete this step for security reasons
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.2)",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15, // Increased from 13
    fontWeight: "700",
    color: "#e5e7eb",
    flex: 1,
  },
  summaryValue: {
    fontSize: 15, // Increased from 13
    color: "#f9fafb",
    flex: 2,
    textAlign: "right",
    fontWeight: "500",
  },
  signupLabelText: {
    fontSize: 16, // Increased from 13
    color: "#e5e7eb",
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  signupInput: {
    backgroundColor: COLORS.INPUT_BG,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 14,
    fontSize: 16, // Increased from 14
    color: COLORS.TEXT_DARK,
    flex: 1,
    marginRight: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16, // Increased from default
    color: COLORS.TEXT_DARK,
    paddingVertical: 14,
  },
  otpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  verifyIdButton: {
    backgroundColor: COLORS.BUTTON_WARNING,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyIdButtonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 16, // Increased from 15
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  signupPasswordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.INPUT_BG,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  eyeButton: {
    paddingLeft: 12,
    paddingVertical: 4,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    tintColor: "#6b7280",
  },
  signupPageButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 15,
    gap: 12,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: "#e5e7eb",
    fontSize: 17, // Increased from 16
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  submitButton: {
    backgroundColor: COLORS.BUTTON_PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    shadowColor: COLORS.BUTTON_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 17, // Increased from 16
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  note: {
    fontSize: 14, // Increased from 13
    color: "#fbbf24",
    marginTop: 20,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 5,
    fontWeight: "500",
    lineHeight: 20,
  },
});

export default SignupStep3;