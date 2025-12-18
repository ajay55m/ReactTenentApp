// InfoRow.js
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { COLORS } from "./constants";

export default function InfoRow({ label, value, onPress, placeholder = "—" }) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      style={[styles.row, onPress && styles.pressable]}
      accessibilityRole={onPress ? "button" : "text"}
      activeOpacity={0.7}
    >
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <View style={styles.right}>
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1} ellipsizeMode="tail">
          {value || placeholder}
        </Text>
        {onPress ? <Text style={styles.chev}>›</Text> : null}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  pressable: {
    // subtle touchable feedback background on Android/iOS disabled for styling control
  },
  label: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 13,
    flex: 0.42,
  },
  right: {
    flex: 0.58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  value: {
    color: COLORS.TEXT_WHITE,
    fontSize: 15,
    textAlign: "right",
  },
  placeholder: {
    color: COLORS.TEXT_MUTED,
    fontStyle: "italic",
  },
  chev: {
    color: COLORS.TEXT_MUTED,
    marginLeft: 8,
    fontSize: 18,
  },
});
