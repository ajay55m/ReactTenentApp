import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';

const TabItem = ({ icon, label, active, onPress }) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress}>
    {typeof icon === 'number' ? (
      <Image
        source={icon}
        style={[
          styles.tabIconImage,
          active && { tintColor: '#2563EB' } // highlight active icon
        ]}
      />
    ) : (
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{icon}</Text>
    )}
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

export default function Footer({ onPress, selectedPage }) {
  const extraBottom = Platform.OS === 'android' ? 28 : 12;

  return (
    <View style={[styles.bottomBar, { paddingBottom: extraBottom }]}>
      {/* Home → dashboard */}
      <TabItem
        label="Home"
        icon={require('../../assets/images/home.png')}
        active={selectedPage === 'dashboard'}
        onPress={() => onPress && onPress('dashboard')}
      />

      {/* Billing → bill-history (SECOND PNG) */}
      <TabItem
        label="Billing"
        icon={require('../../assets/images/invoice.png')}
        active={selectedPage === 'bill-history'}
        onPress={() => onPress && onPress('bill-history')}
      />

      {/* Center FAB → profile */}
      <View style={styles.fabWrapper} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.fab}
          onPress={() => onPress && onPress('profile')}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/images/user (1).png')}
            style={styles.fabIconImage}
          />
        </TouchableOpacity>
      </View>

      {/* Payment → payment-history */}
      <TabItem
        label="Payment"
        icon={require('../../assets/images/credit-card.png')}
        active={selectedPage === 'payment-history'}
        onPress={() => onPress && onPress('payment-history')}
      />

     {/* Ticket */}
      <TabItem
        label="Ticket"
        icon={require('../../assets/images/tickets.png')}
        active={selectedPage === 'raise-ticket'}   // 👈 match App.jsx key
        onPress={() => onPress && onPress('raise-ticket')}
       />

    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    height: 86,
    bottom: 8,
    backgroundColor: '#F5F5DC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabIcon: { fontSize: 20, marginBottom: 4, color: '#6B7280' },
  tabLabel: { fontSize: 12, color: '#6B7280' },
  tabIconImage: {
    width: 22,
    height: 22,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  tabIconActive: { color: '#2563EB' },
  tabLabelActive: { color: '#2563EB', fontWeight: '600' },
  fabIconImage: { width: 26, height: 26, resizeMode: 'contain' },
  fabWrapper: {
    position: 'absolute',
    top: -28,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabIcon: { fontSize: 24, color: '#ffffff' },
});
