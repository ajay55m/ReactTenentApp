import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Platform,
  StatusBar,
  PanResponder,
  Dimensions,
} from "react-native";

export default function NotificationDropdown({
  open,
  onClose,
  onNavigate, // function(screenName, params)
  initialNotifications = [],
  onMarkAllRead,
  topOffset = 72,
}) {
  const [notifications, setNotifications] = useState([
    { 
      id: '1', 
      title: 'Electricity Usage Update', 
      text: 'Your electricity usage has increased this month.', 
      time: '2 hours ago',
      iconKey: 'electricity',
      unread: true
    },
    { 
      id: '2', 
      title: 'Water Usage Update', 
      text: 'Your water consumption is within normal range this month.', 
      time: '4 hours ago',
      iconKey: 'water',
      unread: true
    },
    { 
      id: '3', 
      title: 'Gas Supply Status', 
      text: 'Scheduled maintenance may affect your gas supply.', 
      time: 'Yesterday',
      iconKey: 'gas',
      unread: true
    }
  ]);
  const [swipingId, setSwipingId] = useState(null);
  const anim = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open, anim]);

  const dropdownTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 0],
  });
  const dropdownOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    if (typeof onMarkAllRead === "function") onMarkAllRead();
  };

  const handleAccept = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (onNavigate) onNavigate("Requests", { id });
  };

  const handleDecline = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationPress = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    if (onNavigate) onNavigate("NotificationDetail", { id: item.id });
    onClose && onClose();
  };

  // Swipe-dismiss helper
  const handleSwipeDismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  // Show first 3 notifications in dropdown
  const dropdownNotifications = useMemo(
    () => notifications.slice(0, 3),
    [notifications]
  );

  const hasDropdownNotifications = dropdownNotifications.length > 0;
  const hasMoreNotifications = notifications.length > 3;

  const ICON_MAP = {
    electricity: require('../../assets/NotificationIcon/electrical-engineering.png'),
    gas: require('../../assets/NotificationIcon/gas.png'),
    contact: require('../../assets/NotificationIcon/contract.png'),
    contract: require('../../assets/NotificationIcon/google-contacts.png'),
    'credit-card': require('../../assets/NotificationIcon/credit-card.png'),
    expired: require('../../assets/NotificationIcon/expired.png'),
    water: require('../../assets/NotificationIcon/water.png'),
  };

  const SimpleIcon = ({ icon, color, bgColor, iconKey, iconImage }) => {
    let mapped = iconKey && ICON_MAP[iconKey];
    
    if (iconImage) {
      return (
        <View style={[localStyles.iconWrapper, { backgroundColor: bgColor || '#E0F2FE' }]}>
          <Image source={iconImage} style={localStyles.iconImage} />
        </View>
      );
    }

    if (!mapped && icon && ICON_MAP[icon]) {
      mapped = ICON_MAP[icon];
    }

    if (mapped) {
      return (
        <View style={[localStyles.iconWrapper, { backgroundColor: bgColor || '#E0F2FE' }]}>
          <Image source={mapped} style={localStyles.iconImage} />
        </View>
      );
    }

    return (
      <View style={[localStyles.iconWrapper, { backgroundColor: bgColor || '#E0F2FE' }]}> 
        <Text style={[localStyles.iconText, { color: color || '#0EA5E9' }]}>
          {icon || '🔔'}
        </Text>
      </View>
    );
  };

  // 🔹 Swipeable Notification Component (swipe BOTH sides + smoother feel)
  const SwipeableNotification = ({ item }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const { width: screenWidth } = Dimensions.get('window');
    const MAX_SWIPE = screenWidth * 0.5;
    const SWIPE_THRESHOLD = 60; // pixels, either direction

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // Only respond to horizontal swipes; allow smooth vertical scrolling
          return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 1.5);
        },
        onPanResponderMove: (_, gestureState) => {
          // Allow swipe both left (-) and right (+)
          const clampedDX = Math.max(-MAX_SWIPE, Math.min(gestureState.dx, MAX_SWIPE));
          translateX.setValue(clampedDX);

          // Fade out based on distance
          const fadeOpacity = 1 - Math.min(Math.abs(clampedDX) / MAX_SWIPE, 0.9);
          opacity.setValue(fadeOpacity);
        },
        onPanResponderRelease: (_, gestureState) => {
          const { dx } = gestureState;
          if (Math.abs(dx) > SWIPE_THRESHOLD) {
            // Dismiss in the direction of the swipe
            const direction = dx > 0 ? 1 : -1;
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: direction * screenWidth,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => handleSwipeDismiss(item.id));
          } else {
            // Snap back
            Animated.parallel([
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
              }),
              Animated.spring(opacity, {
                toValue: 1,
                useNativeDriver: true,
              }),
            ]).start();
          }
          setSwipingId(null);
        },
        onPanResponderTerminate: () => {
          // Gesture cancelled → snap back
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
          setSwipingId(null);
        },
        onPanResponderGrant: () => {
          setSwipingId(item.id);
        },
      })
    ).current;

    return (
      <Animated.View
        style={[
          localStyles.notificationCard,
          {
            backgroundColor: item.bgColor || "#E5F2FF",
            borderLeftColor: item.accentColor || "#3B82F6",
            transform: [{ translateX }],
            opacity,
          },
          item.unread && localStyles.notificationCardUnread,
        ]}
        {...panResponder.panHandlers}
      >
        <SimpleIcon
          icon={item.icon}
          color={item.iconColor}
          bgColor={item.iconBgColor}
          iconKey={item.iconKey || item.type}
          iconImage={item.iconImage}
        />

        <TouchableOpacity
          style={localStyles.notificationBody}
          onPress={() => !swipingId && handleNotificationPress(item)}
          activeOpacity={0.9}
          disabled={!!swipingId}
        >
          <Text style={localStyles.notificationTitle}>
            {item.title || "Notification title"}
          </Text>
          <Text style={localStyles.notificationText}>{item.text || ""}</Text>
          <Text style={localStyles.notificationTime}>{item.time || ""}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderNotification = ({ item }) => (
    <SwipeableNotification item={item} />
  );

  const handleViewAllNotifications = () => {
    onClose && onClose();
    if (onNavigate) {
      onNavigate("NotificationsScreen");
    }
  };

  return (
    <>
      {open && (
        <TouchableWithoutFeedback onPress={onClose}>
          <View
            style={[
              localStyles.overlay,
              {
                top:
                  topOffset +
                  (Platform.OS === "android" ? StatusBar.currentHeight || 24 : 20),
              },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[
          localStyles.dropdown,
          {
            transform: [{ translateY: dropdownTranslate }],
            opacity: dropdownOpacity,
            top: topOffset,
          },
        ]}
      >
        <View style={localStyles.containerCard}>
          {/* Header */}
          <View style={localStyles.headerCard}>
            <Text style={localStyles.headerTitle}>Notifications</Text>

            {hasDropdownNotifications && unreadCount > 0 ? (
              <View style={localStyles.headerRightContainer}>
                <TouchableOpacity onPress={markAllRead} activeOpacity={0.8}>
                  <Text style={localStyles.headerRightText}>
                    Mark all as read
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
                  <Text style={localStyles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
                <Text style={localStyles.closeText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>

          {hasDropdownNotifications ? (
            <FlatList
              data={dropdownNotifications}
              keyExtractor={(i) => i.id}
              renderItem={renderNotification}
              contentContainerStyle={localStyles.listContent}
              showsVerticalScrollIndicator={false}  // smoother / cleaner
              scrollEnabled={true}
            />
          ) : (
            <View style={localStyles.emptyState}>
              <Text style={localStyles.emptyTitle}>No notifications</Text>
              <Text style={localStyles.emptyText}>
                You're all up to date.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              localStyles.viewAll,
              !hasDropdownNotifications && { opacity: 0.6 },
            ]}
            onPress={handleViewAllNotifications}
            activeOpacity={0.9}
            disabled={!hasDropdownNotifications}
          >
            <Text style={localStyles.viewAllText}>
              {hasMoreNotifications 
                ? `View all ${notifications.length} notifications` 
                : "View all notifications"
              }
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const localStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 1900,
  },
  dropdown: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 2000,
  },
  containerCard: {
    marginHorizontal: 12,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
    paddingBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 12,
    maxHeight: 340, // 🔹 reduced bar size
  },
  headerCard: {
    backgroundColor: "#F5F5DC",
    paddingHorizontal: 16,
    paddingVertical: 10, // 🔹 slightly smaller
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#F3F4F6",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18, // 🔹 slightly smaller
    fontWeight: "900",
    color: "rgb(3,10,112)",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerRightText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0EA5E9",
  },
  closeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
    minHeight: 160,
  },
  notificationCard: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,          // 🔹 reduced height
    borderRadius: 14,
    borderLeftWidth: 3,           // 🔹 thinner bar
    marginBottom: 10,
    minHeight: 70,                // 🔹 slightly smaller
  },
  notificationCardUnread: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  iconWrapper: {
    width: 32,                    // 🔹 smaller icon
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconText: {
    fontSize: 18,
  },
  iconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  notificationBody: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  notificationText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
  },
  viewAll: {
    paddingVertical: 10,
    alignItems: "center",
    borderTopColor: "#F3F4F6",
    borderTopWidth: 1,
    marginTop: 2,
  },
  viewAllText: {
    color: "#0EA5E9",
    fontWeight: "700",
    fontSize: 14,
  },
});
