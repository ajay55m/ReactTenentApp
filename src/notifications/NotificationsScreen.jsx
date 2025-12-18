// NotificationsScreen.jsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  FlatList, 
  StyleSheet, 
  Image,
  StatusBar,
  TouchableOpacity,
  ScrollView
} from 'react-native';

// 🔹 Local skeleton
const SkeletonBox = ({ style }) => (
  <View style={[styles.skeletonBox, style]} />
);

const ICON_MAP = {
  electricity: require('../../assets/NotificationIcon/electrical-engineering.png'),
  gas: require('../../assets/NotificationIcon/gas.png'),
  contact: require('../../assets/NotificationIcon/contract.png'),
  contract: require('../../assets/NotificationIcon/google-contacts.png'),
  'credit-card': require('../../assets/NotificationIcon/credit-card.png'),
  expired: require('../../assets/NotificationIcon/expired.png'),
  water: require('../../assets/NotificationIcon/water.png'),
};

const sampleNotifications = [
  { id:'1', title:'Electricity Usage Update', text:'Your electricity usage has increased this month.', time:'2 hours ago', iconKey:'electricity', unread:true, period:'today' },
  { id:'2', title:'Water Usage Update', text:'Your water consumption is within normal range this month.', time:'4 hours ago', iconKey:'water', unread:true, period:'today' },
  { id:'3', title:'Gas Supply Status', text:'Scheduled maintenance may affect your gas supply.', time:'2 days ago', iconKey:'gas', unread:true, period:'thisWeek' },
  { id:'4', title:'Contract Approved', text:'Your residential contract has been approved.', time:'2 days ago', iconKey:'contact', unread:false, period:'thisWeek' },
  { id:'5', title:'New Document Uploaded', text:'A new payment receipt has been uploaded.', time:'3 days ago', iconKey:'contract', unread:false, period:'thisWeek' },
  { id:'6', title:'Contract Expiring Soon', text:'Your tenancy contract expires in 45 days.', time:'1 week ago', iconKey:'expired', unread:false, period:'older' },
  { id:'7', title:'Payment Successful', text:'Your recent bill payment was received.', time:'2 weeks ago', iconKey:'credit-card', unread:false, period:'older' },
];

// Group by date section
const groupByPeriod = (notifications) => {
  const grouped = { today: [], thisWeek: [], older: [] };
  notifications.forEach(n => grouped[n.period].push(n));
  return grouped;
};

const buildSectionData = (grouped) => {
  const sections = [];
  if (grouped.today.length) {
    sections.push({ type: 'header', title: 'Today', key: 'today-header' });
    sections.push(...grouped.today.map(n => ({ ...n, type: 'notification' })));
  }
  if (grouped.thisWeek.length) {
    sections.push({ type: 'header', title: 'This Week', key: 'week-header' });
    sections.push(...grouped.thisWeek.map(n => ({ ...n, type: 'notification' })));
  }
  if (grouped.older.length) {
    sections.push({ type: 'header', title: 'Older', key: 'older-header' });
    sections.push(...grouped.older.map(n => ({ ...n, type: 'notification' })));
  }
  return sections;
};

export default function NotificationsScreen() {
  // 🔹 LOCAL loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const grouped = groupByPeriod(sampleNotifications);
  const sections = buildSectionData(grouped);
  const unreadCount = sampleNotifications.filter(n => n.unread).length;

  // 🔹 Skeleton UI
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        {/* Header skeleton */}
        <View style={styles.header}>
          <SkeletonBox style={{ width: 140, height: 20, borderRadius: 8 }} />
          <SkeletonBox style={{ width: 32, height: 24, borderRadius: 12 }} />
        </View>

        <ScrollView contentContainerStyle={styles.listContainer}>
          {/* Section title skeleton */}
          <SkeletonBox
            style={{
              width: 90,
              height: 18,
              borderRadius: 8,
              marginTop: 16,
              marginBottom: 10,
            }}
          />

          {/* Notification skeleton cards */}
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={[styles.notificationCard, styles.skeletonCard]}>
              <View style={styles.iconContainer}>
                <SkeletonBox style={{ width: 40, height: 40, borderRadius: 20 }} />
              </View>

              <View style={styles.notificationContent}>
                <SkeletonBox style={{ width: '70%', height: 14, borderRadius: 6, marginBottom: 6 }} />
                <SkeletonBox style={{ width: '95%', height: 12, borderRadius: 6, marginBottom: 5 }} />
                <SkeletonBox style={{ width: '60%', height: 12, borderRadius: 6, marginBottom: 5 }} />
                <SkeletonBox style={{ width: '30%', height: 10, borderRadius: 5 }} />
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 🔹 Actual content UI
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item) => item.key || item.id}
        renderItem={({ item }) =>
          item.type === 'header'
            ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{item.title}</Text>
              </View>
            )
            : (
              <View style={[
                styles.notificationCard,
                item.unread && styles.notificationCardUnread
              ]}>
                <View style={styles.iconContainer}>
                  <Image source={ICON_MAP[item.iconKey]} style={styles.iconImage} />
                </View>

                <View style={styles.notificationContent}>
                  <Text style={[
                    styles.notificationTitle,
                    item.unread && styles.notificationTitleUnread
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={styles.notificationText}>{item.text}</Text>
                  <Text style={styles.notificationTime}>{item.time}</Text>
                </View>

                {item.unread && <View style={styles.unreadIndicator} />}
              </View>
            )
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: "#F5F5DC",
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: 'rgb(3,10,112)',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },

  sectionHeader: {
    backgroundColor: '#e4e4e4',
    padding: 8,
    borderRadius: 6,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },

  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  notificationCardUnread: {
    backgroundColor: '#E5F2FF',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationTitleUnread: {
    fontWeight: '700',
    color: '#000',
  },
  notificationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
    alignSelf: 'center',
  },

  // 🔹 Skeleton styles
  skeletonBox: {
    backgroundColor: '#E5E7EB',
  },
  skeletonCard: {
    backgroundColor: '#F3F4F6',
    borderLeftColor: '#E5E7EB',
  },
});
