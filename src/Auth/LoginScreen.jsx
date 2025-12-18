import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { COLORS } from "./constants";
import { loginUser } from "../apiConfig";

const LoginScreen = ({ onLoginSuccess, onShowSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

 const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Email and password are required");
    return;
  }

  try {
    setLoading(true);

    const { ok, status, data } = await loginUser(email, password);

    if (!ok) {
      throw new Error(`Login failed. Status: ${status}`);
    }

    // ✅ backend response goes to SessionProvider
    onLoginSuccess?.(data);

  } catch (err) {
    Alert.alert("Login Failed", err.message || "Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image
          source={require("../../assets/images/sglobal-logo.jpg")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.fieldWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Enter username"
            placeholderTextColor={COLORS.TEXT_MUTED}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.fieldWrapper}>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Enter password"
            placeholderTextColor={COLORS.TEXT_MUTED}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeButton}
          >
            <Image
              source={
                isPasswordVisible
                  ? require("../../assets/images/eye-off.png")
                  : require("../../assets/images/eye.png")
              }
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => Alert.alert("Forgot Password", "Not implemented")}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.signupRow}>
        <Text style={styles.signupLabel}>Don't Have an Account</Text>
        <Text style={styles.signupSeparator}> | </Text>
        <TouchableOpacity onPress={onShowSignup}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor:   COLORS.CARD_BG_GLASS,
  },
  logoWrap: {
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logo: {
    width: 170,
    height: 60,
  },
  fieldWrapper: {
    marginBottom: 12,
  },
  inputContainer: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GREY,
    backgroundColor: COLORS.INPUT_BG,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  inputField: {
    flex: 1,
    color: COLORS.TEXT_DARK,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GREY,
    backgroundColor: COLORS.INPUT_BG,
    paddingHorizontal: 16,
  },
  eyeButton: {
    paddingLeft: 12,
    paddingVertical: 4,
  },
  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: "#4b5563",
  },
  forgotText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    textAlign: "right",
  },
  loginButton: {
    marginTop: 15,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.BUTTON_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  signupRow: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupLabel: {
    fontSize: 13,
    color: "#f9fafb",
    fontWeight: "600",
  },
  signupSeparator: {
    fontSize: 13,
    color: "#f9fafb",
    marginHorizontal: 4,
  },
  signupLink: {
    fontSize: 13,
    color: COLORS.TEXT_WHITE,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;