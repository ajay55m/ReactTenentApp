// src/GreetingCard.jsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useUser } from "../context/UserContext"; // 👈 adjust path if needed

const SkeletonBox = ({ style }) => (
  <View style={[styles.skeletonBox, style]} />
);

const GreetingCard = ({ loading: loadingProp, name: nameProp, building: buildingProp }) => {
  const { profile, loading: profileLoading } = useUser() || {};

  const loading = typeof loadingProp === "boolean" ? loadingProp : profileLoading;

  const customerName =
    nameProp ||
    profile?.FirstName ||
    "Guest";

  const buildingNameFromContext = profile?.BuildingName || "";
  const unitNameFromContext = profile?.UnitName || "";

  const computedBuilding =
    buildingProp ||
    (buildingNameFromContext
      ? unitNameFromContext
        ? `${buildingNameFromContext} - ${unitNameFromContext}`
        : buildingNameFromContext
      : "—");

  if (loading) {
    return (
      <View style={[styles.greetingCard, styles.skeletonCard]}>
        <SkeletonBox style={{ width: "55%", height: 18, marginBottom: 12 }} />
        <View style={styles.buildingRow}>
          <SkeletonBox
            style={{ width: 32, height: 32, borderRadius: 8, marginRight: 10 }}
          />
          <SkeletonBox
            style={{ width: "35%", height: 14, marginRight: 6 }}
          />
          <SkeletonBox style={{ width: "25%", height: 14 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.greetingCard}>
      <Text style={styles.greetingText}>
        Hi, <Text style={styles.greetingName}>{customerName}</Text>
      </Text>

      <View style={styles.buildingRow}>
        <View style={styles.buildingIconBox}>
          <Image
            source={require("../../assets/images/building.png")}
            style={styles.buildingIcon}
          />
        </View>

        <Text style={styles.buildingLabel}>Building Name :</Text>
        <Text style={styles.buildingValue}> {computedBuilding}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  greetingCard: {
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  skeletonCard: {
    backgroundColor: "#f2f2f2",
    shadowOpacity: 0,
    elevation: 0,
  },
  skeletonBox: {
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
  },
  greetingText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "800",
    marginBottom: 8,
  },
  greetingName: {
    color: "#3b62cc",
    fontWeight: "900",
  },
  buildingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  buildingIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  buildingIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    tintColor: "#343439",
  },
  buildingLabel: {
    fontSize: 14,
    color: "#0e0f12",
    fontWeight: "500",
  },
  buildingValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "900",
    marginLeft: 4,
  },
});

export default GreetingCard;
