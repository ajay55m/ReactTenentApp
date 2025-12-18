// App.jsx
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";

import Header from "./src/components/Header";
import Dashboard from "./src/screens/Dashboard";
import Footer from "./src/components/Footer";
import Profile from "./src/screens/Profile";
import RequestMove from "./src/screens/RequestMove";
import NoInternetConnectionWrapper from "./src/wrappers/NoInternetConnectionWrapper";
import NotificationsScreen from "./src/notifications/NotificationsScreen";
import NotificationDropdown from "./src/notifications/NotificationDropdown";
import CloudErrorConnection from "./src/screens/CloudErrorConnection";
import MyContract from "./src/screens/MyContract";
import RenewContract from "./src/screens/RenewContract";
import Bill from "./src/screens/BillHistory";
import Payment from "./src/screens/Payment";
import PaymentHistory from "./src/screens/PaymentHistory";
import RaiseTicket from "./src/screens/RaiseTicket";
import LoginScreen from "./src/Auth/LoginScreen";
import AuthScreen from "./src/Auth/AuthScreen";
import BillScreen from "./src/screens/BillDue";
import { UserProvider } from "./src/context/UserContext";
import { SessionProvider, useSession } from "./src/context/SessionContext";
import TenantApprovalPending from "./src/screens/ApprovalPending/TenantApprovalPending";
import TenantRequestCancelled from "./src/screens/ApprovalPending/TenantRequestCancelled";


const AppContent = () => {
  const { session, saveSession, isReady } = useSession();

  // ⏳ Wait until we load session from storage
  if (!isReady) {
    return null; // or a splash / loader component
  }

  if (!session) {
  return <AuthScreen onLoginSuccess={saveSession} />;
}

  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [notifOpen, setNotifOpen] = useState(false);
  const [isCloudDown, setIsCloudDown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (
    session?.clientTypeId === 2 &&     // Tenant
    session?.isApproved === false
  ) {
    setSelectedPage("approval-pending");
  }
}, [session]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const [notifications] = useState([
    // ... your notifications
  ]);

 const handleMenuSelect = (key) => {
  if (key === "logout") {
    saveSession(null);   // ✅ this now clears memory + AsyncStorage
    return;
  }

  setSelectedPage(key);
};
const handleHeaderLogout = () => {
  saveSession(null); // ✅ clears session + AsyncStorage
};

  const handleNotificationNavigation = (screenName, params) => {
    setNotifOpen(false);

    if (screenName === "NotificationsScreen") {
      setSelectedPage("Notifications");
    } else if (screenName === "NotificationDetail") {
      setSelectedPage("NotificationDetail");
    } else {
      setSelectedPage(screenName);
    }
  };

  const handleRetry = () => {
    setIsCloudDown(false);
  };

  if (isCloudDown) {
    return (
      <CloudErrorConnection
        onPress={handleMenuSelect}
        onNavigate={handleMenuSelect}
        onToggleNotifications={() => setNotifOpen((v) => !v)}
        unreadCount={notifications.filter((n) => n.unread).length}
        onRetry={handleRetry}
        loading={loading}
      />
    );
  }

  return (
    <NoInternetConnectionWrapper>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

        <View style={styles.root}>
          <View style={styles.mainContent}>
           <Header
            onPress={handleMenuSelect}
            onNavigate={handleMenuSelect}
            onToggleNotifications={() => setNotifOpen((v) => !v)}
            unreadCount={notifications.filter((n) => n.unread).length}
            tenantName={session?.clientName || "Tenant"}
            tenantAvatar={session?.profileImage}
            onLogout={handleHeaderLogout}
            />
            {selectedPage === "dashboard" && (
              <Dashboard loading={loading} onPress={handleMenuSelect} />
            )}
            {selectedPage === "approval-pending" && (
            <TenantRequestCancelled />
            )}
            {selectedPage === "profile" && <Profile loading={loading} />}
            {selectedPage === "request-moveout" && (
              <RequestMove loading={loading} />
            )}
            {selectedPage === "Notifications" && (
              <NotificationsScreen loading={loading} />
            )}
            {selectedPage === "my-contract" && (
              <MyContract loading={loading} />
            )}
            {selectedPage === "renew-contract" && (
              <RenewContract loading={loading} />
            )}
            {selectedPage === "bill-history" && 
            <Bill loading={loading} />}
             {selectedPage === "Bill-Due" && 
            <BillScreen loading={loading} />}
            {selectedPage === "payment-history" && (
              <PaymentHistory loading={loading} />
            )}
            {selectedPage === "raise-ticket" && (
              <RaiseTicket loading={loading} />
            )}
            {selectedPage === "pay-now" && (
              <Payment onHome={() => setSelectedPage("dashboard")} />
            )}
          </View>

          <Footer onPress={handleMenuSelect} selectedPage={selectedPage} />

          <NotificationDropdown
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            onNavigate={handleNotificationNavigation}
            initialNotifications={notifications}
            topOffset={
              (Platform.OS === "android"
                ? StatusBar.currentHeight || 24
                : 20) + 72
            }
          />
        </View>
      </SafeAreaView>
    </NoInternetConnectionWrapper>
  );
};


const App = () => (
<SessionProvider>
  <UserProvider>
    <AppContent />
  </UserProvider>
</SessionProvider>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  root: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  mainContent: {
    flex: 1,
  },
  testButton: {
    backgroundColor: "#EF4444",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default App;
