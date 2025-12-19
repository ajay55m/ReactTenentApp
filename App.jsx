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
import Footer from "./src/components/Footer";
import Dashboard from "./src/screens/Dashboard";
import Profile from "./src/screens/Profile";
import RequestMove from "./src/screens/RequestMove";
import MyContract from "./src/screens/MyContract";
import RenewContract from "./src/screens/RenewContract";
import Bill from "./src/screens/BillHistory";
import BillScreen from "./src/screens/BillDue";
import Payment from "./src/screens/Payment";
import PaymentHistory from "./src/screens/PaymentHistory";
import TicketScreen from "./src/screens/RaiseTicket";
import OwnerBuildingSelect from "./src/screens/Owner/OwnerBuildingSelect";
import TenantApprovalPending from "./src/screens/ApprovalPending/TenantApprovalPending";
import TenantRequestCancelled from "./src/screens/ApprovalPending/TenantRequestCancelled";
import NotificationsScreen from "./src/notifications/NotificationsScreen";
import NotificationDropdown from "./src/notifications/NotificationDropdown";
import AuthScreen from "./src/Auth/AuthScreen";
import CloudErrorConnection from "./src/screens/CloudErrorConnection";
import NoInternetConnectionWrapper from "./src/wrappers/NoInternetConnectionWrapper";
import { UserProvider } from "./src/context/UserContext";
import { SessionProvider, useSession } from "./src/context/SessionContext";

const AppContent = () => {
  const { session, saveSession, isReady } = useSession();
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [notifOpen, setNotifOpen] = useState(false);
  const [isCloudDown, setIsCloudDown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications] = useState([]);

  /* ---------------- OWNER BUILDING SELECT ---------------- */
  const handleOwnerBuildingSelect = (building) => {
    saveSession({
      ...session,
      selectedBuilding: building,
    });
    setSelectedPage("dashboard");
  };

  /* ---------------- LOGIN REDIRECT LOGIC - FIXED ---------------- */
  useEffect(() => {
    if (!session) {
      setSelectedPage("dashboard");
      return;
    }

    // FIXED: Check all variations of type IDs to support both raw API data and SessionContext data
    const clientType = Number(
      session.clientTypeId ??
      session.userTypeId ??
      session.ClientTypeid ??
      session.UserTypeId
    );

    console.log("Debug Session:", JSON.stringify(session));

    // 🏢 OWNER (ClientTypeid/UserTypeId = 1)
    if (clientType === 1) {
      const status = Number(session.status);

      // Check for SubmissionStatus in various forms
      const rawSubmissionStatus =
        session.SubmissionStatus ||
        session.submissionStatus ||
        "";

      const submissionStatus = rawSubmissionStatus.toLowerCase();

      // ✅ Approved owner (status = 1)
      if (status === 1) {
        // Check building select logic
        if (!session.selectedBuilding) {
          setSelectedPage("owner-building-select");
          return;
        }
        setSelectedPage("dashboard");
        return;
      } else {
        // ❌ Rejected owner
        if (submissionStatus === "rejected") {
          setSelectedPage("approval-cancelled");
          return;
        } else {
          // ⏳ Pending owner (default if not approved and not rejected)
          setSelectedPage("approval-pending");
          return;
        }
      }
    }

    // 👤 TENANT (ClientTypeid/UserTypeId = 2)
    if (clientType === 2) {
      const status = Number(session.status);

      // Check for SubmissionStatus in various forms
      const rawSubmissionStatus =
        session.SubmissionStatus ||
        session.submissionStatus ||
        "";

      const submissionStatus = rawSubmissionStatus.toLowerCase();

      // ✅ Approved tenant (status = 1) → Dashboard
      if (status === 1) {
        setSelectedPage("dashboard");
        return;
      } else {
        // ❌ Rejected tenant
        if (submissionStatus === "rejected") {
          setSelectedPage("approval-cancelled");
          return;
        } else {
          // ⏳ Pending tenant (default if not approved and not rejected)
          setSelectedPage("approval-pending");
          return;
        }
      }
    }

    // 🔄 Default fallback for any other client type
    setSelectedPage("dashboard");
  }, [session]);

  /* ---------------- FAKE LOADER ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  /* ---------------- SAFE RETURNS ---------------- */
  if (!isReady) return null;

  if (!session) {
    return <AuthScreen onLoginSuccess={saveSession} />;
  }

  if (selectedPage === "owner-building-select") {
    return <OwnerBuildingSelect onSelect={handleOwnerBuildingSelect} />;
  }

  /* ---------------- HANDLERS ---------------- */
  const handleMenuSelect = (key) => {
    if (key === "logout") {
      saveSession(null);
      return;
    }
    setSelectedPage(key);
  };

  const handleHeaderLogout = () => saveSession(null);

  const handleNotificationNavigation = (screenName) => {
    setNotifOpen(false);
    setSelectedPage(screenName);
  };

  const handleRetry = () => setIsCloudDown(false);

  const isApprovalScreen =
    selectedPage === "approval-pending" ||
    selectedPage === "approval-cancelled";

  /* ---------------- CLOUD ERROR ---------------- */
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

  /* ---------------- MAIN UI ---------------- */
  return (
    <NoInternetConnectionWrapper>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

        <View style={styles.root}>
          <View style={styles.mainContent}>
            {!isApprovalScreen && (
              <Header
                onPress={handleMenuSelect}
                onNavigate={handleMenuSelect}
                onToggleNotifications={() => setNotifOpen((v) => !v)}
                unreadCount={notifications.filter((n) => n.unread).length}
                tenantName={session?.clientName || session?.FirstName || "Tenant"}
                tenantAvatar={session?.profileImage}
                onLogout={handleHeaderLogout}
              />
            )}
            {selectedPage === "dashboard" && (
              <Dashboard loading={loading} onPress={handleMenuSelect} />
            )}

            {selectedPage === "approval-pending" && (
              <TenantApprovalPending onBack={() => saveSession(null)} />
            )}

            {selectedPage === "approval-cancelled" && (
              <TenantRequestCancelled
                reason={session?.Reason || session?.reason || "Request rejected"}
                onResubmit={() => setSelectedPage("request-moveout")}
                onBack={() => saveSession(null)}
              />
            )}

            {selectedPage === "profile" && <Profile loading={loading} />}
            {selectedPage === "request-moveout" && <RequestMove loading={loading} />}
            {selectedPage === "Notifications" && <NotificationsScreen loading={loading} />}
            {selectedPage === "my-contract" && <MyContract loading={loading} />}
            {selectedPage === "renew-contract" && <RenewContract loading={loading} />}
            {selectedPage === "bill-history" && <Bill loading={loading} />}
            {selectedPage === "Bill-Due" && <BillScreen loading={loading} />}
            {selectedPage === "payment-history" && <PaymentHistory loading={loading} />}
            {selectedPage === "raise-ticket" && <TicketScreen loading={loading} />}
            {selectedPage === "pay-now" && (
              <Payment onHome={() => setSelectedPage("dashboard")} />
            )}
          </View>

          {!isApprovalScreen && (
            <Footer onPress={handleMenuSelect} selectedPage={selectedPage} />
          )}

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
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  root: { flex: 1, backgroundColor: "#f5f5f5" },
  mainContent: { flex: 1 },
});

export default App;