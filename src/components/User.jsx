// src/User.jsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../context/UserContext';

const SkeletonBox = ({ style }) => (
  <View style={[styles.skeletonBox, style]} />
);

export default function UserCard({
  name: nameProp,                   // optional override from parent
  building: buildingProp,          // optional override from parent
  initials: initialsProp,
  onPressCopy,
  loading: loadingProp,            // parent can still force loading if needed
}) {
  const { profile, loading: profileLoading } = useUser() || {};

  // Decide which loading flag to use
  const loading =
    typeof loadingProp === 'boolean' ? loadingProp : profileLoading;

  // ---------- Name from backend (same idea as GreetingCard) ----------
  const customerName =
    nameProp ||
    profile?.FirstName ||          // from API
    'Guest';

  // ---------- Building string from backend (same idea as GreetingCard) ----------
  const buildingNameFromContext = profile?.BuildingName || '';
  const unitNameFromContext = profile?.UnitName || '';

  const computedBuilding =
    buildingProp ||
    (buildingNameFromContext
      ? unitNameFromContext
        ? `${buildingNameFromContext} - ${unitNameFromContext}`
        : buildingNameFromContext
      : '—');

  // ---------- Initials from customerName ----------
  const computedInitials = customerName
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const initials = initialsProp || computedInitials;

  // ---------- Skeleton state ----------
  if (loading) {
    return (
      <View style={[styles.userCard, styles.skeletonCard]}>
        {/* Avatar skeleton */}
        <SkeletonBox style={styles.skeletonAvatar} />

        {/* Text skeletons */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SkeletonBox style={{ width: '60%', height: 16, marginBottom: 6 }} />
          <SkeletonBox style={{ width: '80%', height: 14 }} />
        </View>

        {/* Button skeleton */}
        <SkeletonBox style={styles.skeletonButton} />
      </View>
    );
  }

  // ---------- Normal state ----------
  return (
    <View style={styles.userCard}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.statusIndicator} />
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.userName}>{customerName}</Text>
        <Text style={styles.userBuilding}>{computedBuilding}</Text>
      </View>

      <TouchableOpacity style={styles.linkBtn} onPress={onPressCopy}>
        <Image
          source={require('../../assets/images/link.png')}
          style={styles.linkIconImage}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    height: 80,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },

  // skeleton base
  skeletonCard: {
    backgroundColor: '#F3F4F6',
    elevation: 0,
  },
  skeletonBox: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  skeletonButton: {
    width: 40,
    height: 24,
    borderRadius: 12,
  },

  avatarContainer: { position: 'relative' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  userBuilding: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  linkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  linkIconImage: { width: 18, height: 18, resizeMode: 'contain' },
});