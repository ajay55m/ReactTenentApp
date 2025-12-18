export const COLORS = {
  // Background Colors
  CARD_BG_GLASS: "rgba(91, 22, 230, 0.03)",
  CARD_BG_SIGNUP: "rgba(40, 40, 60, 0.95)", // New color for signup (darker gray-blue)
  CARD_BORDER: "rgba(255,255,255,0.7)",
  
  // Text
  TEXT_DARK: "#111827",
  TEXT_MUTED: "#6b7280",
  TEXT_LIGHT: "#e5e7eb",
  TEXT_WHITE: "#ffffff",
  TEXT_FADED: "#9CA3AF",
  
  // Buttons
  BUTTON_BG: "#111827",
  BUTTON_HOVER: "#000000",
  BUTTON_PRIMARY: "#4CAF50", // Green for primary actions
  BUTTON_SECONDARY: "#2196F3", // Blue for secondary
  BUTTON_WARNING: "#FF9800",
  BUTTON_DANGER: "#f44336",
  BUTTON_WHITE: "#FFFFFF",
  
  // Tab Colors
  TAB_LOGIN_ACTIVE: "#4CAF50", // Green for active login tab
  TAB_SIGNUP_ACTIVE: "#2196F3", // Blue for active signup tab
  TAB_INACTIVE: "rgba(255,255,255,0.3)",
  
  // Inputs
  INPUT_BG: "rgba(255,255,255,0.96)",
  INPUT_DISABLED: "rgba(255,255,255,0.8)",
  
  // Status
  SUCCESS: "#10b981",
  ERROR: "#ef4444",
  WARNING: "#f59e0b",
  INFO: "#3b82f6",
};
export const STYLES = {
  // Common
  card: {
    width: "94%",
    maxWidth: 600,
    borderRadius: 28,
    paddingVertical: 25, // Increased padding
    paddingHorizontal: 28,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 35,
    elevation: 15,
  },
  
  // Tabs
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
    borderRadius: 24,
    marginBottom: 25,
    borderWidth: 1,
  },
  
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  
  tabButtonActive: {
    // Note: We'll override this in AuthScreen based on activeTab
  },
  
  tabButtonText: {
    fontSize: 16, // Increased font size
    fontWeight: "700",
  },
  
  tabButtonTextActive: {
    // Note: We'll override this in AuthScreen based on activeTab
  },
  
  // Progress Steps
  progressContainer: {
    backgroundColor: "rgba(17, 9, 9, 0.1)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
  },
  
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  
  stepContainer: {
    alignItems: "center",
    flex: 1,
  },
  
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  
  stepCircleActive: {
    backgroundColor: COLORS.BUTTON_HOVER,
  },
  
  stepNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.TEXT_WHITE,
  },
  
  stepTitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  
  stepTitleActive: {
    color: COLORS.TEXT_WHITE,
    fontWeight: "600",
  },
  
  stepLineContainer: {
    flex: 1,
    height: 1,
    justifyContent: "center",
  },
  
  stepLine: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 2,
  },
  
  stepLineActive: {
    backgroundColor: COLORS.BUTTON_WHITE,
  },
  
  // Common Input Styles
  input: {
    backgroundColor: COLORS.INPUT_BG,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GREY,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: COLORS.TEXT_DARK,
    marginBottom: 5,
  },
  
  selectField: {
    backgroundColor: COLORS.INPUT_BG,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GREY,
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  
  label: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 3,
  },
  
  buttonPrimary: {
    backgroundColor: COLORS.BUTTON_PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  
  buttonSecondary: {
    backgroundColor: COLORS.BUTTON_SECONDARY,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  
  buttonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
};

export const DIMENSIONS = {
  INPUT_HEIGHT: 48,
  BUTTON_HEIGHT: 48,
  LOGO_WIDTH: 170,
  LOGO_HEIGHT: 60,
  CARD_RADIUS: 28,
  INPUT_RADIUS: 24,
  BUTTON_RADIUS: 24,
};