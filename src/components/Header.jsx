// Header.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SidebarMenu from './SidebarMenu';

export default function Header({
  onPress,
  onNavigate,
  showMenu = true,
  unreadCount = 0,
  onToggleNotifications,
  onLogout,
  tenantName = 'Tenant',
  tenantAvatar,
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    setShowProfileMenu(false);
    onLogout?.();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {/* ───────── TOP BAR ───────── */}
        <View style={styles.topBar}>
          {showMenu ? (
            <SidebarMenu onSelect={onPress} onNavigate={onNavigate} />
          ) : (
            <View style={{ width: 40 }} />
          )}

          <View style={styles.logoBox}>
            <Image
              source={require('../../assets/images/sglobal-icon.jpg')}
              style={styles.logoImage}
            />
          </View>

          {/* RIGHT ACTIONS */}
          <View style={styles.rightActions}>
            {/* 🔔 Notifications */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onToggleNotifications}
            >
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
              <Image
                source={require('../../assets/images/notification.png')}
                style={styles.topIconImage}
              />
            </TouchableOpacity>

            {/* 👤 Avatar */}
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => setShowProfileMenu(true)}
            >
              <Image
                source={
                  tenantAvatar
                    ? { uri: tenantAvatar }
                    : require('../../assets/images/serprofile.png')
                }
                style={styles.avatarImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ───────── OVERLAY + DROPDOWN ───────── */}
        {showProfileMenu && (
          <>
            {/* Background overlay */}
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setShowProfileMenu(false)}
            />

            {/* Profile dropdown */}
            <View style={styles.profileMenu}>
              <Image
                source={
                  tenantAvatar
                    ? { uri: tenantAvatar }
                    : require('../../assets/images/serprofile.png')
                }
                style={styles.profileAvatar}
              />

              <Text style={styles.profileName}>{tenantName}</Text>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                  <Image
    source={require('../../assets/images/logout.png')}
    style={styles.logoutIcon}
  />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ───────────────── STYLES ───────────────── */

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    zIndex: 50,
  },

  headerContainer: {
    position: 'relative',
    zIndex: 50,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 64,
    borderBottomColor: '#F3F4F6',
    borderBottomWidth: 1,
  },

  logoBox: {
    alignItems: 'center',
  },

  logoImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },

  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    padding: 8,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  topIconImage: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    tintColor: '#374151',
  },

  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  avatarButton: {
    padding: 4,
    marginLeft: 4,
  },

  avatarImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  /* ───────── OVERLAY ───────── */
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: 98,
  },
 profileMenu: {
  position: 'absolute',
  top: 68,
  right: 10,
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  paddingVertical: 8,
  paddingHorizontal: 10,
  minWidth:100,
  alignItems: 'center',
  alignSelf: 'flex-start',   // ✅ KEY LINE
  elevation: 8,
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  zIndex: 99,
},
 profileAvatar: {
  width: 28,
  height: 28,
  borderRadius: 14,
  marginBottom: 6,
},

  profileName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },

  divider: {
  height: 1,
  backgroundColor: '#E5E7EB',
  marginVertical: 8,
},

  logoutButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 6,
},

 logoutIcon: {
  width: 16,
  height: 16,
  marginRight: 6,
},

logoutText: {
  color: '#EF4444',
  fontSize: 12,
  fontWeight: '600',
},

});
