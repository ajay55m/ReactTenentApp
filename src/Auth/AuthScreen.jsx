import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from "react-native";
import { useSession } from "../context/SessionContext";
import LoginScreen from "./LoginScreen";
import SignupStep1 from "./SignupStep1";
import SignupStep2 from "./SignupStep2";
import SignupStep3 from "./SignupStep3";
import { COLORS } from "./constants";

const { width, height } = Dimensions.get("window");

const pickerOptions = {
  userType: [
    { label: "Owner", value: "Owner" },
    { label: "Tenant", value: "Tenant" },
    { label: "Visitor", value: "Visitor" },
  ],
  area: [
    { label: "DUBAI PRODUCTION CITY", value: "DUBAI PRODUCTION CITY" },
    { label: "Business Bay", value: "Business Bay" },
    { label: "Downtown Dubai", value: "Downtown Dubai" },
  ],
  building: [
    { label: "APRAM 5 (86)", value: "APRAM 5 (86)" },
    { label: "AFNAN 5 (B6)", value: "AFNAN 5 (B6)" },
    { label: "Building C", value: "Building C" },
  ],
  units: [
    { label: "806", value: "806" },
    { label: "807", value: "807" },
    { label: "808", value: "808" },
    { label: "809", value: "809" },
  ],
};

const AuthScreen = ({ navigation, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaKey, setCaptchaKey] = useState(Date.now());
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaInput2, setCaptchaInput2] = useState("");

  const [signupForm, setSignupForm] = useState({
    userType: "",
    area: "",
    building: "",
    name: "",
    units: "",
    phoneNo: "",
    emailId: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const onChange = (field, value) =>
    setSignupForm((s) => ({ ...s, [field]: value }));

  const openPicker = (type) => {
    setPickerType(type);
    setShowPicker(true);
  };

  const selectOption = (value) => {
    onChange(pickerType, value);
    setShowPicker(false);
  };

  const refreshCaptcha = () => {
    setCaptchaKey(Date.now());
  };

  const { saveSession } = useSession();

  const handleSubmit = () => {
    if (signupForm.password !== signupForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const sessionPayload = {
        FirstName: signupForm.name || "User",
        ClientId:
          signupForm.phoneNo ||
          signupForm.emailId ||
          `temp-${Date.now()}`,
        ClientTypeid: 1,
        EMail: signupForm.emailId || "",
        MobileNumber: signupForm.phoneNo || "",
      };

      saveSession?.(sessionPayload);
      alert("Success", "Registration successful — you are now logged in.");

      navigation?.navigate?.("Home");
    } catch (e) {
      console.warn("Registration handling error", e);
      alert("Error", "Unable to complete registration. Please try again.");
    }
  };

  const nextStep = () => setCurrentPage((p) => p + 1);
  const prevStep = () => setCurrentPage((p) => Math.max(1, p - 1));

  const handleSignupNext = () => {
    if (currentPage === 1) {
      if ((captchaInput || "").trim().toUpperCase() !== (captchaText || "").trim().toUpperCase()) {
        alert("Error", "Invalid CAPTCHA");
        return;
      }

      if (!signupForm.userType || !signupForm.area || !signupForm.building) {
        alert("Error", "Please fill all required fields");
        return;
      }
      nextStep();
    } else if (currentPage === 2) {
      if ((captchaInput2 || "").trim().toUpperCase() !== (captchaText || "").trim().toUpperCase()) {
        alert("Error", "Invalid CAPTCHA");
        return;
      }

      if (!signupForm.name || !signupForm.phoneNo || !signupForm.emailId) {
        alert("Error", "Please fill all required fields");
        return;
      }
      nextStep();
    }
  };

  const renderSignup = () => {
    switch (currentPage) {
      case 1:
        return (
          <SignupStep1
            signupForm={signupForm}
            onChange={onChange}
            onOpenPicker={openPicker}
            captchaText={captchaText}
            captchaKey={captchaKey}
            setCaptchaText={setCaptchaText}
            captchaInput={captchaInput}
            setCaptchaInput={setCaptchaInput}
            onNext={handleSignupNext}
            onBack={() => setActiveTab("login")}
            refreshCaptcha={refreshCaptcha}
          />
        );
      case 2:
        return (
          <SignupStep2
            signupForm={signupForm}
            onChange={onChange}
            onOpenPicker={openPicker}
            captchaText={captchaText}
            captchaKey={captchaKey}
            setCaptchaText={setCaptchaText}
            captchaInput2={captchaInput2}
            setCaptchaInput2={setCaptchaInput2}
            onNext={handleSignupNext}
            onBack={prevStep}
            refreshCaptcha={refreshCaptcha}
          />
        );
      case 3:
        return (
          <SignupStep3
            signupForm={signupForm}
            onChange={onChange}
            onSubmit={handleSubmit}
            onBack={prevStep}
            onVerifyOtp={() => alert("Verify OTP", "Not implemented")}
          />
        );
      default:
        return null;
    }
  };

  const getModalBackgroundColor = () =>
    activeTab === "login" ? "#ffffff" : "rgba(40, 40, 60, 0.98)";

  const getModalTextColor = () =>
    activeTab === "login" ? COLORS.TEXT_DARK : COLORS.TEXT_WHITE;

  const getModalBorderColor = () =>
    activeTab === "login" ? "#eee" : "rgba(255,255,255,0.1)";

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ImageBackground
        source={require("../../assets/images/background.webp")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.bgOverlay} />
        
        {/* Wrap content in TouchableWithoutFeedback to dismiss keyboard */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentContainer}>
            {/* Using ternary operator to conditionally apply card style */}
            <View
              style={[
                styles.card,
                activeTab === "login" 
                  ? styles.cardLogin  // Apply login card style
                  : styles.cardSignup // Apply signup card style
              ]}
            >
              <View style={[
                styles.tabContainer,
                activeTab === "login" 
                  ? styles.tabContainerLogin 
                  : styles.tabContainerSignup
              ]}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === "login" && styles.tabButtonActiveLogin,
                  ]}
                  onPress={() => {
                    setActiveTab("login");
                    setCurrentPage(1);
                  }}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === "login" ? styles.tabButtonTextActiveLogin : styles.tabButtonTextInactive,
                    ]}
                  >
                    Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === "signup" && styles.tabButtonActiveSignup,
                  ]}
                  onPress={() => setActiveTab("signup")}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === "signup" ? styles.tabButtonTextActiveSignup : styles.tabButtonTextInactive,
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {activeTab === "login" ? (
                  <LoginScreen
                    onLoginSuccess={onLoginSuccess}
                    onShowSignup={() => setActiveTab("signup")}
                  />
                ) : (
                  renderSignup()
                )}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ImageBackground>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[
                styles.modalContent,
                { backgroundColor: getModalBackgroundColor() }
              ]}>
                <View style={[styles.modalHeader, { borderBottomColor: getModalBorderColor() }]}>
                  <Text style={[styles.modalTitle, { color: getModalTextColor() }]}>
                    Select{" "}
                    {pickerType === "userType"
                      ? "User Type"
                      : pickerType === "area"
                      ? "Area"
                      : pickerType === "building"
                      ? "Building"
                      : "Unit"}
                  </Text>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={[styles.modalClose, { color: getModalTextColor() }]}>✕</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={pickerOptions[pickerType] || []}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.optionItem, { borderBottomColor: getModalBorderColor() }]}
                      onPress={() => selectOption(item.value)}
                    >
                      <Text style={[styles.optionText, { color: getModalTextColor() }]}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  contentContainer: {
   flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop:
      Platform.OS === "android" ? StatusBar.currentHeight + 10 : 40,
  },
  background: {
    flex: 1,
    width: "100%",
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    width: "94%",
    maxWidth: 600,
    maxHeight: height * 0.88,
    borderRadius: 28,
    padding: 20,

    /* ✅ EXACT FIRST IMAGE GLASS */
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 35,
    elevation: 16,
  },
  // Login Card Style - Keep existing glass effect
  cardLogin: {
    backgroundColor: "rgba(91, 22, 230, 0.03)",
    borderColor: "rgba(255,255,255,0.7)",
  },
  // Signup Card Style - New solid background (darker gray-blue like in the image)
  cardSignup: {
  backgroundColor: "rgb(23,38,29)", // Forest green


    borderColor: "rgba(100, 100, 150, 0.4)",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
  },
  // Login Tab Container Style
  tabContainerLogin: {
    backgroundColor: "rgba(146, 143, 155, 0.1)",
    borderColor: "rgba(255,255,255,0.25)",
  },
  // Signup Tab Container Style
  tabContainerSignup: {
    backgroundColor: "rgba(50, 50, 70, 0.6)",
    borderColor: "rgba(100, 100, 150, 0.3)",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  // Different active button colors for Login and Signup
  tabButtonActiveLogin: {
    backgroundColor: "#ffff", // Green for login
  },
  tabButtonActiveSignup: {
    backgroundColor: COLORS.TAB_SIGNUP_ACTIVE, // Blue for signup
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  tabButtonTextActiveLogin: {
    color: "#060606ff",
  },
  tabButtonTextActiveSignup: {
    color: COLORS.TEXT_WHITE,
  },
  tabButtonTextInactive: {
    color: "rgba(255,255,255,0.7)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalClose: {
    fontSize: 24,
    padding: 5,
  },
  optionItem: {
    padding: 18,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
  },
});

export default AuthScreen;