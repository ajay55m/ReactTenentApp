import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../../context/SessionContext";
import { getOwnerBuildings } from "../../apiConfig";

const OwnerBuildingSelect = ({ onSelect }) => {
  const { session, saveSession } = useSession();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch buildings on mount
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const loginKey = session?.loginKey;
        if (!loginKey) {
          Alert.alert("Error", "Session invalid. Please login again.");
          return;
        }

        const res = await getOwnerBuildings(loginKey);
        if (res.ok && res.data) {
          setBuildings(res.data);
        } else {
          Alert.alert("Error", "Failed to load buildings.");
        }
      } catch (err) {
        console.error("Fetch buildings error:", err);
        Alert.alert("Error", "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, [session]);

  const handleLogout = () => {
    saveSession(null);
  };

  const renderBuildingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.buildingCard}
      onPress={() => onSelect(item)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>🏢</Text>
      </View>
      <View style={styles.buildingInfo}>
        <Text style={styles.buildingName}>{item.Name || item.BuildingName}</Text>
        <Text style={styles.buildingAddress}>{item.Address || "No address"}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Building</Text>
          <Text style={styles.headerSubtitle}>
            Choose a building to manage
          </Text>
        </View>

        {/* List */}
        {loading ? (
          <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={buildings}
            keyExtractor={(item) => String(item.Id || item.BuildingId)}
            renderItem={renderBuildingItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No buildings found.</Text>
            }
          />
        )}

        {/* Logout Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OwnerBuildingSelect;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  listContent: {
    padding: 16,
  },
  buildingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  buildingInfo: {
    flex: 1,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  buildingAddress: {
    fontSize: 13,
    color: "#6B7280",
  },
  arrow: {
    fontSize: 24,
    color: "#9CA3AF",
    fontWeight: "300",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#6B7280",
    fontSize: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  logoutButton: {
    backgroundColor: "#EFF6FF",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  logoutText: {
    textAlign: "center",
    color: "#1E3A8A",
    fontSize: 15,
    fontWeight: "600",
  },
});
