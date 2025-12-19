import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Animated,
} from "react-native";

const MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: require("../../assets/images/home (1).png") },

  { key: "profile", label: "Profile", icon: require("../../assets/images/account.png") },

  { key: "request-moveout", label: "Request Moveout", icon: require("../../assets/images/delivery-truck.png") },

  {
    key: "contract",
    label: "Contract",
    icon: require("../../assets/images/deal.png"),
    hasDropdown: true,
    subItems: [
      { key: "my-contract", label: "My Contract", icon: require("../../assets/images/contract.png") },
      { key: "renew-contract", label: "Renew Contract", icon: require("../../assets/images/contract-agreement.png") },
    ],
  },

  {
    key: "bills",
    label: "Bills",
    icon: require("../../assets/images/bill.png"),
    hasDropdown: true,
    subItems: [

      {
        key: "bill-history",
        label: "Bill History",
        icon: require("../../assets/images/verify-paid.png"),
      },
    ],
  },

  // 🔥 You requested this MUST remain as a separate parent item (kept!)
  { key: "payment-history", label: "Payment History", icon: require("../../assets/images/invoice.png") },

  { key: "raise-ticket", label: "Raise Ticket", icon: require("../../assets/images/tickets.png") },

  { key: "logout", label: "Logout", icon: require("../../assets/images/logout.png") },
];


export default function SidebarMenu({ onSelect, onNavigate }) {
  const [visible, setVisible] = useState(false);
  const [activeKey, setActiveKey] = useState("dashboard");
  const [expandedItems, setExpandedItems] = useState({});
  const [animation] = useState(new Animated.Value(0));

  // 🔹 Skeleton state + timer ref
  const [showSkeleton, setShowSkeleton] = useState(false);
  const skeletonTimerRef = useRef(null);

  const open = () => {
    setVisible(true);
    setShowSkeleton(true);

    if (skeletonTimerRef.current) {
      clearTimeout(skeletonTimerRef.current);
      skeletonTimerRef.current = null;
    }

    skeletonTimerRef.current = setTimeout(() => {
      setShowSkeleton(false);
      skeletonTimerRef.current = null;
    }, 500);
  };

  const close = () => {
    setVisible(false);
    setShowSkeleton(false);
    if (skeletonTimerRef.current) {
      clearTimeout(skeletonTimerRef.current);
      skeletonTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (skeletonTimerRef.current) {
        clearTimeout(skeletonTimerRef.current);
        skeletonTimerRef.current = null;
      }
    };
  }, []);

  const toggleExpand = (itemKey) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));

    Animated.timing(animation, {
      toValue: expandedItems[itemKey] ? 0 : 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleItem = (item) => {
    if (item.hasDropdown && item.subItems) {
      toggleExpand(item.key);
      return;
    }

    setActiveKey(item.key);
    close();
    onSelect?.(item.key);
    onNavigate?.(item.key);
  };

  const handleSubItem = (subItem, parentItem) => {
    setActiveKey(subItem.key);
    close();
    onSelect?.(subItem.key);
    onNavigate?.(subItem.key);
  };

  const MenuItem = ({ item }) => {
    const isActive = item.key === activeKey;
    const isExpanded = expandedItems[item.key];
    const hasSubItems = item.hasDropdown && item.subItems;

    const rotateAnim = animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    return (
      <View>
        <TouchableOpacity
          onPress={() => handleItem(item)}
          style={[styles.menuItem, isActive && styles.activeMenuItem]}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.iconCircle, isActive && styles.iconCircleActive]}>
              <Image source={item.icon} style={styles.menuIconImage} />
            </View>

            <Text
              style={[
                styles.menuLabel,
                isActive && styles.activeMenuLabel,
              ]}
            >
              {item.label}
            </Text>

            {hasSubItems && (
              <Animated.Text
                style={[styles.dropdownIcon, { transform: [{ rotate: rotateAnim }] }]}
              >
                ▼
              </Animated.Text>
            )}
          </View>
        </TouchableOpacity>

        {hasSubItems && isExpanded && (
          <View style={styles.subItemsContainer}>
            {item.subItems.map((subItem) => {
              const isSubActive = subItem.key === activeKey;
              return (
                <TouchableOpacity
                  key={subItem.key}
                  onPress={() => handleSubItem(subItem, item)}
                  style={[
                    styles.subMenuItem,
                    isSubActive && styles.activeSubMenuItem,
                  ]}
                >
                  <View style={styles.subMenuItemContent}>
                    <View
                      style={[
                        styles.subIconCircle,
                        isSubActive && styles.subIconCircleActive,
                      ]}
                    >
                      {subItem.icon && (
                        <Image
                          source={subItem.icon}
                          style={styles.subMenuIconImage}
                        />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.subMenuLabel,
                        isSubActive && styles.activeSubMenuLabel,
                      ]}
                    >
                      {subItem.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  // 🔹 Skeleton menu list
  const SkeletonMenu = () => (
    <View style={styles.skeletonList}>
      {Array.from({ length: 7 }).map((_, idx) => (
        <View key={idx} style={styles.skeletonRow}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonTextBar} />
        </View>
      ))}
    </View>
  );

  return (
    <>
      <TouchableOpacity style={styles.iconButton} onPress={open}>
        <Text style={styles.topIcon}>☰</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.backdrop}>
          <Pressable style={styles.backdropTouch} onPress={close} />

          <View style={styles.sidebarContainer}>
            <View style={styles.header}>
              <View style={styles.logoCard}>
                <Image
                  source={require("../../assets/images/sglobal-logo.jpg")}
                  style={styles.headerLogoImage}
                />
              </View>
            </View>

            {showSkeleton ? (
              <SkeletonMenu />
            ) : (
              <ScrollView style={styles.scrollContent}>
                {MENU_ITEMS.map((item) => (
                  <MenuItem key={item.key} item={item} />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
  },
  topIcon: {
    fontSize: 26,
    marginLeft: 10,
    color: "#374151",
  },

  backdrop: {
    flex: 1,
    flexDirection: "row-reverse",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backdropTouch: {
    flex: 1,
  },

  sidebarContainer: {
    width: 280,
    height: "100%",
    backgroundColor: "#F5F5DC",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#F5F5DC",
  },
  logoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  headerLogoImage: {
    width: "100%",
    height: 90,
    resizeMode: "contain",
  },

  scrollContent: {
    flex: 1,
  },

  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  activeMenuItem: {
    backgroundColor: "#F5F5DC",
    borderRightWidth: 4,
    borderRightColor: "#3B82F6",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFDF3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconCircleActive: {
    borderColor: "#2563EB",
  },
  menuIconImage: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },

  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: "#4B5563",
    fontWeight: "500",
  },
  activeMenuLabel: {
    color: "#2563EB",
    fontWeight: "700",
  },
  dropdownIcon: {
    fontSize: 11,
    color: "#9CA3AF",
  },

  subItemsContainer: {
    backgroundColor: "#F5F5DC",
    borderLeftWidth: 2,
    borderLeftColor: "#E5E7EB",
    marginLeft: 16,
  },
  subMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  activeSubMenuItem: {
    backgroundColor: "#EFF6FF",
    borderRightWidth: 3,
    borderRightColor: "#3B82F6",
  },
  subMenuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
  },
  subIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  subIconCircleActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  subMenuIconImage: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  subMenuLabel: {
    flex: 1,
    fontSize: 14,
    color: "#09090aff",
    fontWeight: "400",
  },
  activeSubMenuLabel: {
    color: "#2563EB",
    fontWeight: "600",
  },

  /* 🔹 Skeleton styles for menu */
  skeletonList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  skeletonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
  },
  skeletonTextBar: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
});
