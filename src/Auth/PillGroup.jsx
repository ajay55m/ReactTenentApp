// PillGroup.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "./constants";

export default function PillGroup({ items = [], onPressItem }) {
  return (
    <View style={styles.wrap}>
      {items.length === 0 ? (
        <TouchableOpacity onPress={() => onPressItem?.(null)} style={styles.emptyPill}>
          <Text style={styles.emptyText}>-- Select Unit --</Text>
        </TouchableOpacity>
      ) : (
        items.map((it, i) => (
          <TouchableOpacity key={String(i)} onPress={() => onPressItem?.(it)} style={styles.pill} activeOpacity={0.7}>
            <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">{it}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginRight: 8,
    minWidth: 56,
    alignItems: "center",
  },
  text: { color: COLORS.TEXT_WHITE, fontSize: 14, fontWeight: "600" },
  emptyPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "transparent",
  },
  emptyText: { color: COLORS.TEXT_MUTED, fontSize: 14 },
});
