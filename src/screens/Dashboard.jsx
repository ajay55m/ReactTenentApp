import React, { useEffect, useState  } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import UserCard from "../components/User";
import { getCustomerDashboard } from "../apiConfig";
import { useSession } from "../context/SessionContext";


const GLASS_BORDER = 'rgba(255,255,255,0.75)';
const GLASS_BG_WHITE = 'rgba(255,255,255,0.96)';
const GLASS_BG_COLORED = 'rgba(255,255,255,0.4)';

const OVERVIEW_FILTERS = [
  { key: 'this-year', label: 'This Year' },
  { key: 'last-year', label: 'Last Year' },
  { key: 'last-3-months', label: 'Last 3 Months' },
];

const COLOR_MAP = {
  success: '#D7F5DE',
  info: '#E5D7FF',
  purple: '#FFD6EA',
  warning: '#FFE3C2',
};

const StatCard = ({ label, value, percent, description, colorCss, icon, onPress }) => {
  const color = COLOR_MAP[colorCss] || '#E5D7FF';
  return (
    <TouchableOpacity
      style={[
        styles.statCard,
        {
          backgroundColor: color,
          shadowColor: color,
          borderColor: GLASS_BORDER,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.statRow}>
        <View style={styles.statIconBox}>
          <Text style={styles.statIcon}>{icon}</Text>
        </View>

        <View style={styles.statTextBox}>
          <Text style={styles.statValueText}>{value}</Text>
          <Text style={styles.statLabelText}>{label.replace(/<br\/>.*<\/a>/, '')}</Text>
          {description && <Text style={styles.statDescription}>{description}</Text>}
          {percent && <Text style={styles.statPercent}>{percent}%</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// simple skeleton block
const SkeletonBox = ({ style }) => (
  <View style={[styles.skeletonBase, style]} />
);

function DashboardSkeleton() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Reminder skeleton */}
      <View style={[styles.reminderCard, styles.skeletonCard]}>
        <View style={{ flex: 1 }}>
          <SkeletonBox style={{ width: '40%', height: 16, marginBottom: 8 }} />
          <SkeletonBox style={{ width: '80%', height: 12 }} />
        </View>
        <SkeletonBox style={{ width: 80, height: 32, borderRadius: 20 }} />
      </View>

      {/* User card skeleton */}
      <View style={[styles.userCard, styles.skeletonCard]}>
        <View style={styles.skeletonAvatar} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SkeletonBox style={{ width: '60%', height: 14, marginBottom: 6 }} />
          <SkeletonBox style={{ width: '80%', height: 12 }} />
        </View>
        <SkeletonBox style={{ width: 32, height: 32, borderRadius: 16 }} />
      </View>

      {/* Stat cards skeleton (2 x 2 grid) */}
      <View style={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={[styles.statCard, styles.skeletonCard]}>
            <View style={styles.statRow}>
              <View style={[styles.statIconBox, styles.skeletonCard]} />
              <View style={{ flex: 1 }}>
                <SkeletonBox style={{ width: '30%', height: 18, marginBottom: 6 }} />
                <SkeletonBox style={{ width: '70%', height: 12 }} />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Consumption skeleton */}
      <View style={[styles.consumptionCard, styles.skeletonCard]}>
        <View style={{ flex: 1 }}>
          <SkeletonBox style={{ width: '30%', height: 12, marginBottom: 6 }} />
          <SkeletonBox style={{ width: '50%', height: 18, marginBottom: 6 }} />
          <SkeletonBox style={{ width: '25%', height: 10 }} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <SkeletonBox style={{ width: 100, height: 18, borderRadius: 16, marginBottom: 6 }} />
          <SkeletonBox style={{ width: 2, height: 20, marginBottom: 6 }} />
          <SkeletonBox style={{ width: 100, height: 10 }} />
        </View>
      </View>

      {/* Overview skeleton */}
      <View style={[styles.overviewCard, styles.skeletonCard]}>
        <View style={styles.overviewHeader}>
          <SkeletonBox style={{ width: '30%', height: 16 }} />
          <SkeletonBox style={{ width: 60, height: 14 }} />
        </View>

        <View style={styles.amountsRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.amountItem}>
              <SkeletonBox style={{ width: '50%', height: 12, marginBottom: 6 }} />
              <SkeletonBox style={{ width: '70%', height: 16 }} />
            </View>
          ))}
        </View>

        <View style={styles.chartArea}>
          <View style={[styles.graphicBackground, styles.skeletonCard]}>
            <View style={styles.chartContainer}>
              <View style={styles.chartBars}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <View key={i} style={styles.chartBarWrapper}>
                    <SkeletonBox style={{ width: 12, height: 60, borderRadius: 6, marginBottom: 4 }} />
                    <SkeletonBox style={{ width: 18, height: 10 }} />
                  </View>
                ))}
              </View>

              <View style={styles.statusIndicators}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <View key={i} style={styles.statusItem}>
                    <SkeletonBox style={{ width: 8, height: 8, borderRadius: 4 }} />
                    <SkeletonBox style={{ width: 40, height: 10 }} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

export default function Dashboard({ onPress }) {
  const { session } = useSession();
  const loginKey = session?.loginKey;

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [overviewFilter, setOverviewFilter] = React.useState('this-year');

  const handlePress = (label) => {
    if (label === 'Pay Now') {
      onPress && onPress('payment-history');
      return;
    }
    onPress && onPress(label);
  };
  useEffect(() => {
  if (!loginKey) {
    console.warn("⚠️ Dashboard skipped: loginKey missing");
    return;
  }

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const res = await getCustomerDashboard(loginKey);

      if (!res.ok) {
        console.error("Dashboard API error:", res.status, res.data);
        Alert.alert("Error", "Dashboard API failed");
        return;
      }

      setStats(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, [loginKey]);

  const handleStatPress = (stat) => {
    Alert.alert('Stat Pressed', `You pressed: ${stat.Type}`);
  };

  const handleCopyLink = () => {
    Alert.alert('Copied', 'Profile link copied (placeholder)');
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Reminder */}
      <View style={styles.glassWrapper}>
        <View style={styles.reminderCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.reminderTitle}>Reminder!</Text>
            <Text style={styles.reminderText}>
              Time to pay your security deposit
            </Text>
          </View>

          <TouchableOpacity
            style={styles.payNowBtn}
            onPress={() => onPress("pay-now")}
          >
            <Text style={styles.payNowText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User card – single card */}
      <View style={{ marginBottom: 10 }}>
        <UserCard onPressCopy={handleCopyLink} />
      </View>

<View style={{ marginVertical: 12 }}>
  <TouchableOpacity
    style={styles.button}
    onPress={() => onPress && onPress("approval-pending")}
  >
    <Text style={styles.text}>Go to Approval Pending</Text>
  </TouchableOpacity>
</View>


      {/* Stat cards */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.Type}
            value={stat.Value}
            percent={stat.PerCent}
            description={stat.Description}
            colorCss={stat.ColorCss}
            icon={stat.Icon}
            onPress={() => handleStatPress(stat)}
          />
        ))}
      </View>

      {/* Consumption card */}
      <View style={styles.glassWrapper}>
        <View style={styles.consumptionCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.consumptionTitle}>Consumption</Text>
            <Text style={styles.consumptionValue}>890.98 KWH</Text>
            <Text style={styles.consumptionSubtitle}>This month</Text>
          </View>

          <View style={styles.gaugeWrapper}>
            <View style={styles.gaugeBar}>
              <View style={[styles.gaugeSegment, { backgroundColor: '#F97373' }]} />
              <View style={[styles.gaugeSegment, { backgroundColor: '#FACC15' }]} />
              <View style={[styles.gaugeSegment, { backgroundColor: '#4ADE80' }]} />
            </View>
            <View style={styles.gaugeNeedle} />
            <View style={styles.gaugeLabels}>
              <Text style={styles.gaugeLabel}>Low</Text>
              <Text style={styles.gaugeLabel}>Med</Text>
              <Text style={styles.gaugeLabel}>High</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Overview card with filter */}
      <View style={styles.glassWrapper}>
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Overview</Text>

            <View style={styles.overviewFilterRow}>
              {OVERVIEW_FILTERS.map((f) => {
                const isActive = overviewFilter === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => setOverviewFilter(f.key)}
                    style={[
                      styles.overviewFilterPill,
                      isActive && styles.overviewFilterPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.overviewFilterText,
                        isActive && styles.overviewFilterTextActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.amountsRow}>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Paid</Text>
              <Text style={styles.amountValue}>$ 1,000</Text>
            </View>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Unpaid</Text>
              <Text style={styles.amountValue}>$ 1,000</Text>
            </View>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Overdue</Text>
              <Text style={styles.amountValue}>$ 1,000</Text>
            </View>
          </View>

          <View style={styles.chartArea}>
            <View style={styles.graphicBackground}>
              <View style={styles.circleDecoration1} />
              <View style={styles.circleDecoration2} />
              <View style={styles.circleDecoration3} />

              <View style={styles.chartContainer}>
                <View style={styles.chartBars}>
                  {[10, 20, 30, 40, 50, 60, 80, 90].map((height, index) => (
                    <View key={index} style={styles.chartBarWrapper}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height,
                            backgroundColor:
                              height >= 60
                                ? '#4ADE80'
                                : height >= 30
                                ? '#FACC15'
                                : '#F97373',
                          },
                        ]}
                      />
                      <Text style={styles.chartBarLabel}>{height}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.statusIndicators}>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: '#4ADE80' }]} />
                    <Text style={styles.statusText}>Paid</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: '#FACC15' }]} />
                    <Text style={styles.statusText}>Unpaid</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: '#F97373' }]} />
                    <Text style={styles.statusText}>Overdue</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* NEW: Documents + Payment Summary section */}
      {/* Onboard & Contract Documents */}
      <View style={styles.glassWrapper}>
        <View style={styles.docsCard}>
          <Text style={styles.sectionTitle}>Onboard Documents</Text>

          <View style={styles.docRow}>
            <Text style={styles.docStatusIcon}>✔</Text>
            <Text style={styles.docName}>Passport</Text>
            <Text style={styles.docStatusText}>Verified</Text>
          </View>
          <View style={styles.docRow}>
            <Text style={styles.docStatusIcon}>✔</Text>
            <Text style={styles.docName}>Emirates Id</Text>
            <Text style={styles.docStatusText}>Verified</Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
            Contract Documents
          </Text>

          <View style={styles.docRow}>
            <Text style={styles.docStatusIcon}>✔</Text>
            <Text style={styles.docName}>Tenancy Contract</Text>
            <Text style={styles.docStatusText}>Verified</Text>
          </View>
          <View style={styles.docRow}>
            <Text style={styles.docStatusIcon}>✔</Text>
            <Text style={styles.docName}>Emirates Id</Text>
            <Text style={styles.docStatusText}>Verified</Text>
          </View>
        </View>
      </View>

      {/* Payment Summary */}
      <View style={styles.glassWrapper}>
        <View style={styles.paymentSummaryCard}>
          <View style={styles.paymentSummaryHeader}>
            <Text style={styles.paymentSummaryTitle}>Payment Summary</Text>
            <TouchableOpacity onPress={() => onPress && onPress('payment-history')}>
              <Text style={styles.viewMoreText}>View More</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentTableHeaderRow}>
            {['No', 'Bill No', 'Bill Date', 'Bill Amount', 'Bill Type', 'Action'].map(
              (h) => (
                <Text key={h} style={styles.paymentTableHeaderText}>
                  {h}
                </Text>
              ),
            )}
          </View>

          <View style={styles.noBillsRow}>
            <Text style={styles.noBillsText}>No bills found</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // common glass + shadow wrapper
  glassWrapper: {
    borderRadius: 18,
    backgroundColor: GLASS_BG_WHITE,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: 0,
    marginBottom: 16,
    shadowColor: 'rgba(15,23,42,0.22)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },

  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4CC',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  reminderText: { fontSize: 14, color: '#92400E' },
  payNowBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
  },
  payNowText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
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
  linkIcon: { fontSize: 16 },
  linkIconImage: { width: 18, height: 18, resizeMode: 'contain' },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.26,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
  },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statIcon: { fontSize: 22 },
  statIconImage: { width: 22, height: 22, resizeMode: 'contain' },
  statTextBox: { flex: 1 },
  statValueText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  statLabelText: { fontSize: 13, color: '#4B5563' },
  statDescription: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  statPercent: { fontSize: 12, color: '#059669', fontWeight: '600', marginTop: 2 },

  consumptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },
  consumptionTitle: { fontSize: 14, color: '#4B5563', marginBottom: 4 },
  consumptionValue: { fontSize: 20, fontWeight: '700', color: '#1D4ED8', marginBottom: 4 },
  consumptionSubtitle: { fontSize: 12, color: '#6B7280' },
  gaugeWrapper: { alignItems: 'center' },
  gaugeBar: {
    flexDirection: 'row',
    width: 100,
    height: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
  },
  gaugeSegment: { flex: 1 },
  gaugeNeedle: { width: 2, height: 20, backgroundColor: '#EF4444', marginTop: 2 },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 100,
    marginTop: 4,
  },
  gaugeLabel: { fontSize: 10, color: '#6B7280' },

  overviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 2,
  },
  overviewTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },

  overviewFilterRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  overviewFilterPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  overviewFilterPillActive: {
    backgroundColor: '#2563EB',
  },
  overviewFilterText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  overviewFilterTextActive: {
    color: '#FFFFFF',
  },

  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    zIndex: 2,
  },
  amountItem: {
    alignItems: 'center',
    flex: 1,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  chartArea: {
    alignItems: 'center',
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },

  graphicBackground: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    position: 'relative',
    minHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(209,213,219,0.7)',
    shadowColor: 'rgba(15,23,42,0.18)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },

  circleDecoration1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  circleDecoration2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  circleDecoration3: {
    position: 'absolute',
    top: '50%',
    right: '20%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(249, 115, 115, 0.08)',
  },

  chartContainer: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },

  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },

  chartBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },

  chartBar: {
    width: 12,
    borderRadius: 6,
    marginBottom: 4,
    minHeight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  chartBarLabel: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
  },

  statusIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },

  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },

  // NEW: Documents + Payment summary styles
  docsCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  docStatusIcon: {
    width: 20,
    textAlign: 'center',
    color: '#10B981',
    fontSize: 14,
    marginRight: 8,
  },
  docName: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  docStatusText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },

  paymentSummaryCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
  },
  paymentSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewMoreText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  paymentTableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  paymentTableHeaderText: {
    flex: 1,
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  noBillsRow: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
   button: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 12,
    borderRadius: 8,
  },
  text: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  noBillsText: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  // Skeleton
  skeletonBase: {
    backgroundColor: '#E5E7EB',
  },
  skeletonCard: {
    backgroundColor: '#F3F4F6',
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 0,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
});
