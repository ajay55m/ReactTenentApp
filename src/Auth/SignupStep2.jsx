// SignupStep2.js
import React from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS } from "./constants";
import Captcha from "./Captcha";
import InfoRow from "./InfoRow";
import PillGroup from "./PillGroup";

const SignupStep2 = ({
  signupForm,
  onChange,
  onOpenPicker,
  captchaText,
  captchaKey,
  setCaptchaText,
  captchaInput2,
  setCaptchaInput2,
  onNext,
  onBack,
  refreshCaptcha,
}) => {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor={COLORS.TEXT_MUTED}
          value={signupForm.name}
          onChangeText={(text) => onChange("name", text)}
        />

        {/* READ-ONLY rows - values come from SignupStep1 */}
        <InfoRow label="Type" value={signupForm.userType || "--"} />
        <InfoRow label="Area" value={signupForm.area || "--"} />
        <InfoRow label="Building" value={signupForm.building || "--"} />

        <Text style={[styles.label, { marginTop: 8 }]}>Units</Text>
        {/* Units are still selectable here (tap to open units picker) */}
        <PillGroup
          items={signupForm.units ? (Array.isArray(signupForm.units) ? signupForm.units : [signupForm.units]) : []}
          onPressItem={() => onOpenPicker("units")}
        />

        <Text style={styles.label}>Phone No</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor={COLORS.TEXT_MUTED}
          value={signupForm.phoneNo}
          onChangeText={(text) => onChange("phoneNo", text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email Id</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          placeholderTextColor={COLORS.TEXT_MUTED}
          value={signupForm.emailId}
          onChangeText={(text) => onChange("emailId", text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.separator} />

        <Text style={styles.label}>Enter the CAPTCHA below</Text>

        <View style={styles.captchaRow}>
          <Captcha key={captchaKey} seed={captchaKey} width={290} height={70} length={5} onChange={(actual) => setCaptchaText(actual)} />
          <TouchableOpacity onPress={refreshCaptcha} style={styles.captchaRefresh} accessibilityRole="button" accessibilityLabel="Refresh CAPTCHA">
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Enter CAPTCHA"
          placeholderTextColor={COLORS.TEXT_MUTED}
          value={captchaInput2}
          onChangeText={setCaptchaInput2}
        />

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backTxt}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
            <Text style={styles.nextTxt}>VERIFY</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1, width: "100%" },
  scrollContent: { paddingBottom: 30, paddingHorizontal: 8 },
  label: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: COLORS.TEXT_WHITE,
    marginBottom: 8,
  },
  separator: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 14 },
  captchaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  captchaRefresh: { marginLeft: 12, padding: 6 },
  refreshText: { color: COLORS.BUTTON_PRIMARY, fontSize: 18 },
  buttonsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  backBtn: { backgroundColor: "rgba(255,255,255,0.06)", padding: 12, borderRadius: 10, alignItems: "center", flex: 1, marginRight: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.04)" },
  backTxt: { color: COLORS.TEXT_WHITE, fontSize: 15, fontWeight: "600" },
  nextBtn: { backgroundColor: COLORS.BUTTON_SECONDARY, padding: 12, borderRadius: 10, alignItems: "center", flex: 1 },
  nextTxt: { color: COLORS.TEXT_WHITE, fontSize: 15, fontWeight: "700" },
});

export default SignupStep2;
