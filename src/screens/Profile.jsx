import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GreetingCard from "../components/GreetingCard";
import { useSession } from "../context/SessionContext";
import { getApprovedClient } from "../apiConfig";


if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

function DetailRow({
  label,
  value,
  verified = false,
  email = false,
  onEdit,
  isEditing = false,
  editValue,
  onChangeEditValue,
  onEditComplete,
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {isEditing ? (
          <TextInput
            style={[styles.detailValue, styles.kycInput]}
            value={editValue}
            onChangeText={onChangeEditValue}
            onSubmitEditing={onEditComplete}
            onBlur={onEditComplete}
          />
        ) : (
          <>
            <Text
              style={[styles.detailValue, email && styles.emailValue]}
              numberOfLines={email ? 1 : undefined}
              ellipsizeMode={email ? "middle" : "tail"}
            >
              {value}
            </Text>

            {/* Inline Edit icon for KYC fields */}
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                activeOpacity={0.7}
                style={styles.inlineEditBtn}
              >
                <Image
                  source={require("../../assets/images/edit.png")}
                  style={styles.inlineEditIcon}
                />
              </TouchableOpacity>
            )}
          </>
        )}

        {verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedTick}>✓</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function DocumentRow({
  label,
  documentType,
  verified = false,
  hasDocument = false,
  onView,
  onEdit,
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={styles.detailValue}>: {documentType}</Text>

        {/* View / Edit / Upload actions with icons */}
        <View style={styles.docActions}>
          {hasDocument && (
            <>
              <TouchableOpacity
                onPress={onView}
                activeOpacity={0.7}
                style={styles.docIconBtn}
              >
                <Image
                  source={require("../../assets/images/eye.png")}
                  style={styles.docIcon}
                />
              </TouchableOpacity>
              <View style={styles.docActionDivider} />
            </>
          )}
          <TouchableOpacity
            onPress={onEdit}
            activeOpacity={0.7}
            style={styles.docIconBtn}
          >
            <Image
              source={require("../../assets/images/edit.png")}
              style={styles.docIcon}
            />
          </TouchableOpacity>
        </View>

        {verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedTick}>✓</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function CollapsibleSection({ title, isOpen, onPress, children }) {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen, animation]);

  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={[styles.sectionRow, isOpen && styles.sectionRowActive]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.sectionRowText,
            isOpen && styles.sectionRowTextActive,
          ]}
        >
          {title}
        </Text>

        <Animated.Text
          style={[
            styles.sectionRowIcon,
            isOpen && styles.sectionRowIconActive,
            { transform: [{ rotate }] },
          ]}
        >
          ⌃
        </Animated.Text>
      </TouchableOpacity>

      {isOpen && (
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: animation,
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {children}
        </Animated.View>
      )}
    </View>
  );
}

/** 🔹 Simple skeleton box placeholder */
const SkeletonBox = ({ width = "100%", height = 14, style }) => (
  <View style={[styles.skeletonBox, { width, height }, style]} />
);

const Profile = () => {
  const { session } = useSession();
  const clientId = session?.clientId;

  if (!clientId) {
    return null; // or a fallback UI
  }

  const [activeSection, setActiveSection] = useState("applicant");

  // 🔹 API data + loading + error
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // used also for GreetingCard skeleton
  const [error, setError] = useState(null);

  // 🔹 KYC editing state
  const [editingKycField, setEditingKycField] = useState(null);
  const [kycValues, setKycValues] = useState({
    emiratesId: "",
    emiratesIdExp: "",
    passportNo: "",
    passportExp: "",
    ejariNo: "",
    ejariStart: "",
    ejariExpiry: "",
  });

  // 🔹 Document preview + upload modals
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewLabel, setPreviewLabel] = useState("");
  const [uploadVisible, setUploadVisible] = useState(false);
  const [uploadLabel, setUploadLabel] = useState("");

  const toggleSection = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveSection(activeSection === section ? null : section);
  };

  const handleEditKycField = (fieldKey) => {
    setEditingKycField(fieldKey);
  };

  const handleViewDocument = (label, path) => {
    if (!path) {
      Alert.alert("No Document", `${label} is not uploaded yet.`);
      return;
    }
    setPreviewLabel(label);
    setPreviewVisible(true);
  };

  const handleEditSingleDocument = (label) => {
    setUploadLabel(label);
    setUploadVisible(true);
  };

 useEffect(() => {
  const controller = new AbortController();

  if (!clientId) {
    return () => controller.abort();
  }

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ use centralized apiConfig
      const { ok, status, data } = await getApprovedClient(clientId);

      if (!ok) {
        Alert.alert("Error", `API Failed ❌\nStatus: ${status}`);
        throw new Error(`HTTP ${status}`);
      }

      if (data && typeof data === "object") {
        setProfile(data);

        // ✅ initialize editable KYC values
        setKycValues({
          emiratesId: data.EmiratesIdNo || "—",
          emiratesIdExp: formatDate(data.EmiratesIdExpDate),
          passportNo: data.PassportNo || "—",
          passportExp: formatDate(data.PassportExpDate),
          ejariNo: data.EjariNo || "—",
          ejariStart: formatDate(data.EjariStartDate),
          ejariExpiry: data.EjariExpiryDate
            ? formatDate(data.EjariExpiryDate)
            : "-",
        });
      } else {
        setError("No profile data found.");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        Alert.alert(
          "Connection Error",
          err.message || "Something went wrong"
        );
        setError("Failed to load profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();

  return () => controller.abort();
}, [clientId]);


  const p = profile || {};

  const customerName = p.FirstName || "—";
  const moveInDate = formatDate(p.MoveInRequestDate);
  const dob = formatDate(p.DOB);
  const mobile = p.MobileNumber || "—";
  const email = p.EMail || "—";
  const area = p.AreaName || "—";
  const building = p.BuildingName || "—";
  const unit = p.UnitName || "—";

  const sectionData = [
    {
      id: "applicant",
      title: "Applicant Details",
      content: (
        <View style={styles.sectionContent}>
          <DetailRow
            label="Customer Type"
            value={
              p.ClientTypeid === 1
                ? "Owner"
                : p.ClientTypeid === 2
                ? "Tenant"
                : "Unknown"
            }
          />
          <DetailRow label="Move-in Request Date" value={moveInDate} />
          <DetailRow
            label="Unit Type"
            value={p.UnitType === "1" ? "Individual" : p.UnitType || "—"}
          />
          <DetailRow label="Contract Type" value={p.ContractType || "—"} />
          <DetailRow label="Customer Name" value={customerName} />
          <DetailRow label="Gender" value={p.Gender || "—"} />
          <DetailRow label="DOB" value={dob} />
          <DetailRow label="Nationality" value={p.NationalityName || "—"} />
          <DetailRow label="Mobile Number" value={mobile} verified />
          <DetailRow label="Email" value={email} email />
          <DetailRow label="Address" value={p.Address || "—"} />
          <DetailRow label="Country" value={p.CountryName || "—"} />
        </View>
      ),
    },
    {
      id: "kyc",
      title: "Customer KYC Details",
      content: (
        <View style={styles.sectionContent}>
          <DetailRow
            label="Emirates ID"
            value={kycValues.emiratesId}
            isEditing={editingKycField === "emiratesId"}
            editValue={kycValues.emiratesId}
            onChangeEditValue={(text) =>
              setKycValues((prev) => ({ ...prev, emiratesId: text }))
            }
            onEdit={() => handleEditKycField("emiratesId")}
            onEditComplete={() => setEditingKycField(null)}
          />
          <DetailRow
            label="Emirates ID Expiry Date"
            value={kycValues.emiratesIdExp}
            isEditing={editingKycField === "emiratesIdExp"}
            editValue={kycValues.emiratesIdExp}
            onChangeEditValue={(text) =>
              setKycValues((prev) => ({ ...prev, emiratesIdExp: text }))
            }
            onEdit={() => handleEditKycField("emiratesIdExp")}
            onEditComplete={() => setEditingKycField(null)}
          />
          <DetailRow
            label="Passport No"
            value={kycValues.passportNo}
            isEditing={editingKycField === "passportNo"}
            editValue={kycValues.passportNo}
            onChangeEditValue={(text) =>
              setKycValues((prev) => ({ ...prev, passportNo: text }))
            }
            onEdit={() => handleEditKycField("passportNo")}
            onEditComplete={() => setEditingKycField(null)}
          />
          <DetailRow
            label="Passport Expiry Date"
            value={kycValues.passportExp}
            isEditing={editingKycField === "passportExp"}
            editValue={kycValues.passportExp}
            onChangeEditValue={(text) =>
              setKycValues((prev) => ({ ...prev, passportExp: text }))
            }
            onEdit={() => handleEditKycField("passportExp")}
            onEditComplete={() => setEditingKycField(null)}
          />
          <DetailRow
            label="Ejari Contract No"
            value={kycValues.ejariNo}
            isEditing={editingKycField === "ejariNo"}
            editValue={kycValues.ejariNo}
            onChangeEditValue={(text) =>
              setKycValues((prev) => ({ ...prev, ejariNo: text }))
            }
            onEdit={() => handleEditKycField("ejariNo")}
            onEditComplete={() => setEditingKycField(null)}
          />
          <DetailRow
            label="Ejari Start Date"
            value={kycValues.ejariStart}
            isEditing={editingKycField === "ejariStart"}
            editValue={kycValues.ejariStart}
            onChangeEditValue={(text) =>
              setKycValues((prev) => ({ ...prev, ejariStart: text }))
            }
            onEdit={() => handleEditKycField("ejariStart")}
            onEditComplete={() => setEditingKycField(null)}
          />
          <DetailRow
            label="Ejari Expiry Date"
            value={kycValues.ejariExpiry}
            isEditing={editingKycField === "ejariExpiry"}
            editValue={kycValues.ejariExpiry}
            onChangeEditValue={(text) =>
              setKycValues((prev) => ({ ...prev, ejariExpiry: text }))
            }
            onEdit={() => handleEditKycField("ejariExpiry")}
            onEditComplete={() => setEditingKycField(null)}
          />
        </View>
      ),
    },
    {
      id: "property",
      title: "Property Details",
      content: (
        <View style={styles.sectionContent}>
          <DetailRow label="Area" value={area} />
          <DetailRow label="Building" value={building} />
          <DetailRow label="Unit" value={unit} />
          <DetailRow label="Office ID" value={String(p.OfficeID || "")} />
        </View>
      ),
    },
    {
      id: "documents",
      title: "Upload Documents",
      content: (
        <View style={styles.sectionContent}>
          <DocumentRow
            label="Emirates ID"
            documentType={p.EmirateidPath ? "Uploaded" : "Not uploaded"}
            verified={!!p.EmirateidPath}
            hasDocument={!!p.EmirateidPath}
            onView={() => handleViewDocument("Emirates ID", p.EmirateidPath)}
            onEdit={() => handleEditSingleDocument("Emirates ID")}
          />
          <DocumentRow
            label="Passport"
            documentType={p.PassportPath ? "Uploaded" : "Not uploaded"}
            verified={!!p.PassportPath}
            hasDocument={!!p.PassportPath}
            onView={() => handleViewDocument("Passport", p.PassportPath)}
            onEdit={() => handleEditSingleDocument("Passport")}
          />
          <DocumentRow
            label="Ejari"
            documentType={p.EjariPath ? "Uploaded" : "Not uploaded"}
            verified={!!p.EjariPath}
            hasDocument={!!p.EjariPath}
            onView={() => handleViewDocument("Ejari", p.EjariPath)}
            onEdit={() => handleEditSingleDocument("Ejari")}
          />
          <DocumentRow
            label="Trade License"
            documentType={p.TradelicensePath ? "Uploaded" : "Not uploaded"}
            verified={!!p.TradelicensePath}
            hasDocument={!!p.TradelicensePath}
            onView={() =>
              handleViewDocument("Trade License", p.TradelicensePath)
            }
            onEdit={() => handleEditSingleDocument("Trade License")}
          />
        </View>
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <View style={styles.root}>
        <View style={styles.mainContent}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <GreetingCard
              loading={loading}
              name={customerName}
              building={building ? `${building} - ${unit}` : "—"}
            />

            <View style={styles.profileHeader}>
              <Text style={styles.profileHeaderText}>Profile</Text>
            </View>

            {/* Error message if API fails */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Skeleton vs real content */}
            {loading ? (
              <View style={styles.mainCard}>
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionRow}>
                    <SkeletonBox width="40%" height={16} />
                  </View>
                  <View style={styles.sectionContent}>
                    <SkeletonBox width="60%" style={{ marginBottom: 10 }} />
                    <SkeletonBox width="70%" style={{ marginBottom: 10 }} />
                    <SkeletonBox width="50%" style={{ marginBottom: 10 }} />
                    <SkeletonBox width="80%" style={{ marginBottom: 10 }} />
                  </View>
                </View>

                <View style={styles.sectionContainer}>
                  <View style={styles.sectionRow}>
                    <SkeletonBox width="50%" height={16} />
                  </View>
                  <View style={styles.sectionContent}>
                    <SkeletonBox width="70%" style={{ marginBottom: 10 }} />
                    <SkeletonBox width="65%" style={{ marginBottom: 10 }} />
                    <SkeletonBox width="55%" style={{ marginBottom: 10 }} />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.mainCard}>
                {sectionData.map((section) => (
                  <CollapsibleSection
                    key={section.id}
                    title={section.title}
                    isOpen={activeSection === section.id}
                    onPress={() => toggleSection(section.id)}
                  >
                    {section.content}
                  </CollapsibleSection>
                ))}
              </View>
            )}

            <View style={{ height: 120 }} />
          </ScrollView>
        </View>
      </View>

      {/* Document Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{previewLabel} Preview</Text>
            <Image
              source={require("../../assets/images/apple.png")}
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setPreviewVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        visible={uploadVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUploadVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Upload {uploadLabel}</Text>
            <Text style={styles.modalSubtitle}>
              Choose a source to upload from your mobile:
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                Alert.alert(
                  "Upload",
                  `Open camera picker for ${uploadLabel} (hook here).`
                );
                setUploadVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                Alert.alert(
                  "Upload",
                  `Open gallery picker for ${uploadLabel} (hook here).`
                );
                setUploadVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "#e5e7eb" }]}
              onPress={() => setUploadVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: "#111827" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e5e7eb",
  },
  root: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "rgb(255,255,255)",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /* Profile header strip */
  profileHeader: {
    backgroundColor: "#F5F5DC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
     marginBottom: 12,
  },
  profileHeaderText: {
    fontSize: 20,
    fontWeight: "900",
    color: "rgb(3,10,112)",
  },

  /* Main card container */
  mainCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  /* Section container */
  sectionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  /* Section rows */
  sectionRow: {
    backgroundColor: "rgb(245,245,245)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionRowActive: {
    backgroundColor: "rgb(39,0,128)",
  },
  sectionRowText: {
    fontSize: 15,
    color: "rgb(0,0,128)",
    fontWeight: "700",
  },
  sectionRowTextActive: {
    color: "#ffffff",
  },
  sectionRowIcon: {
    fontSize: 18,
    color: "#6b7280",
    fontWeight: "bold",
  },
  sectionRowIconActive: {
    color: "#ffffff",
  },

  /* Content container with animation */
  contentContainer: {
    backgroundColor: "#f8fafc",
  },

  /* Section content */
  sectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  /* Detail rows for content */
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    minHeight: 32,
  },
  detailLabel: {
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    textAlign: "right",
    flexShrink: 1,
  },
  emailValue: {
    maxWidth: "70%",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    flexShrink: 1,
  },

  // KYC inline edit
  inlineEditBtn: {
    marginLeft: 8,
    padding: 4,
  },
  inlineEditIcon: {
    width: 16,
    height: 16,
    tintColor: "#2563EB", // remove if you want original PNG colors
    resizeMode: "contain",
  },
  kycInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 140,
    textAlign: "right",
    backgroundColor: "#ffffff",
  },

  verifiedBadge: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedTick: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },

  // document action buttons
  docActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  docIconBtn: {
    padding: 4,
  },
  docIcon: {
    width: 16,
    height: 16,
    tintColor: "#2563EB",
    resizeMode: "contain",
  },
  docActionDivider: {
    width: 1,
    height: 14,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 6,
  },

  // 🔹 skeleton placeholder style
  skeletonBox: {
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },

  // 🔹 small error box style
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "500",
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "stretch",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default Profile;
