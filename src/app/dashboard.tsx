import React, {
  useCallback,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";



import {
  useTheme,
} from "../../context/ThemeContext";


import {
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

import {
  router,
  useFocusEffect,
} from "expo-router";

import AsyncStorage from
  "@react-native-async-storage/async-storage";


// ============================================================
// API
// ============================================================

const API_BASE_URL = "https://expensebackend-tdxz.onrender.com";

// ============================================================
// TYPES
// ============================================================

type RecentExpense = {
  id: number;
  title: string;
  category?: string;
  amount: number;
  expense_date?: string | null;
  description?: string | null;
  status: string;
  created_at?: string | null;
};


type DashboardResponse = {
  summary: {
    pending: number;
    approved: number;
    rejected: number;
  };

  recent_expenses: RecentExpense[];
};


// ============================================================
// DASHBOARD
// ============================================================

export default function DashboardScreen() {

  // ==========================================================
  // PROFILE
  // ==========================================================

  const [name, setName] =
    useState("User");

  const [employeeId, setEmployeeId] =
    useState("-");

  const [profileImage, setProfileImage] =
    useState<string | null>(null);


  // ==========================================================
  // EXPENSE SUMMARY
  // ==========================================================

  const [pendingCount, setPendingCount] =
    useState(0);

  const [approvedCount, setApprovedCount] =
    useState(0);

  const [rejectedCount, setRejectedCount] =
    useState(0);


  // ==========================================================
  // RECENT EXPENSES
  // ==========================================================

  const [recentExpenses, setRecentExpenses] =
    useState<RecentExpense[]>([]);


  // ==========================================================
  // LOADING
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const {
  darkMode,
  colors,
  } = useTheme();

  // ==========================================================
  // LOAD WHEN SCREEN OPENS / FOCUSES
  // ==========================================================

  useFocusEffect(
    useCallback(() => {

      loadDashboard();

    }, [])
  );


  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadDashboard = async () => {

    try {

      console.log(
        "==================================="
      );

      console.log(
        "📊 LOADING DASHBOARD"
      );

      setLoading(true);


      // ======================================================
      // GET TOKEN
      // ======================================================

      const token =
        await AsyncStorage.getItem(
          "access_token"
        );


      console.log(
        "🔐 TOKEN:",
        token
          ? "FOUND"
          : "NOT FOUND"
      );


      if (!token) {

        console.log(
          "❌ ACCESS TOKEN NOT FOUND"
        );

        router.replace(
          "/loginscreen"
        );

        return;
      }


      // ======================================================
      // LOAD PROFILE
      // ======================================================

      await loadProfile(
        token
      );


      // ======================================================
      // LOAD DASHBOARD DATA
      // ======================================================

      await loadDashboardData(
        token
      );


      console.log(
        "✅ DASHBOARD LOADED"
      );

    } catch (error) {

      console.log(
        "❌ DASHBOARD ERROR:",
        error
      );

    } finally {

      setLoading(false);

      console.log(
        "==================================="
      );

    }
  };


  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  const loadProfile = async (
    token: string
  ) => {

    try {

      console.log(
        "👤 LOADING PROFILE"
      );


      const response =
        await fetch(
          `${API_BASE_URL}/profile`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              Accept:
                "application/json",
            },
          }
        );


      const responseText =
        await response.text();


      console.log(
        "📡 PROFILE STATUS:",
        response.status
      );


      if (!response.ok) {

        console.log(
          "❌ PROFILE RESPONSE:",
          responseText
        );

        throw new Error(
          responseText ||
          "Unable to load profile"
        );
      }


      const data =
        JSON.parse(
          responseText
        );


      console.log(
        "👤 PROFILE:",
        {
          id: data?.id,
          name: data?.name,
          employee_id:
            data?.employee_id,

          hasImage:
            !!data?.profile_image,
        }
      );


      // ======================================================
      // NAME
      // ======================================================

      setName(
        data?.name ||
        "User"
      );


      // ======================================================
      // EMPLOYEE ID
      // ======================================================

      setEmployeeId(
        data?.employee_id ||
        "-"
      );


      // ======================================================
      // PROFILE IMAGE
      //
      // Backend returns Base64 image.
      // No /profile/image/4 URL.
      // ======================================================

      if (
        data?.profile_image &&
        typeof data.profile_image ===
          "string"
      ) {

        const imageUri =
          `data:image/jpeg;base64,${data.profile_image}`;


        console.log(
          "🖼️ PROFILE IMAGE RECEIVED"
        );


        console.log(
          "🖼️ BASE64 LENGTH:",
          data.profile_image.length
        );


        setProfileImage(
          imageUri
        );


        // ====================================================
        // SAVE USER LOCALLY
        // ====================================================

        await AsyncStorage.setItem(
          "user",
          JSON.stringify({
            id: data?.id,
            name: data?.name,
            email: data?.email,
            employee_id:
              data?.employee_id,
            profile_image:
              imageUri,
          })
        );

      } else {

        console.log(
          "🖼️ NO PROFILE IMAGE"
        );

        setProfileImage(
          null
        );


        await AsyncStorage.setItem(
          "user",
          JSON.stringify({
            id: data?.id,
            name: data?.name,
            email: data?.email,
            employee_id:
              data?.employee_id,
            profile_image:
              null,
          })
        );
      }


      console.log(
        "✅ PROFILE LOADED"
      );

    } catch (error) {

      console.log(
        "❌ PROFILE LOAD ERROR:",
        error
      );

      throw error;
    }
  };


  // ==========================================================
  // LOAD EXPENSE DASHBOARD
  // ==========================================================

  const loadDashboardData = async (
    token: string
  ) => {

    try {

      console.log(
        "📊 GET /dashboard"
      );


      const response =
        await fetch(
          `${API_BASE_URL}/dashboard`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              Accept:
                "application/json",
            },
          }
        );


      const responseText =
        await response.text();


      console.log(
        "📡 DASHBOARD STATUS:",
        response.status
      );


      console.log(
        "📦 DASHBOARD RESPONSE:",
        responseText
      );


      if (!response.ok) {

        throw new Error(
          responseText ||
          "Unable to load dashboard"
        );
      }


      const data:
        DashboardResponse =
        JSON.parse(
          responseText
        );


      // ======================================================
      // SUMMARY
      // ======================================================

      const pending =
        Number(
          data?.summary?.pending ||
          0
        );


      const approved =
        Number(
          data?.summary?.approved ||
          0
        );


      const rejected =
        Number(
          data?.summary?.rejected ||
          0
        );


      setPendingCount(
        pending
      );


      setApprovedCount(
        approved
      );


      setRejectedCount(
        rejected
      );


      console.log(
        "⏳ PENDING:",
        pending
      );


      console.log(
        "✅ APPROVED:",
        approved
      );


      console.log(
        "❌ REJECTED:",
        rejected
      );


      // ======================================================
      // RECENT EXPENSES
      // ======================================================

      const expenses =
        Array.isArray(
          data?.recent_expenses
        )
          ? data.recent_expenses
          : [];


      setRecentExpenses(
        expenses
      );


      console.log(
        "📋 RECENT EXPENSE COUNT:",
        expenses.length
      );


      console.log(
        "📋 RECENT EXPENSES:",
        expenses
      );


    } catch (error) {

      console.log(
        "❌ DASHBOARD DATA ERROR:",
        error
      );

      setPendingCount(0);
      setApprovedCount(0);
      setRejectedCount(0);
      setRecentExpenses([]);

      throw error;
    }
  };


  // ==========================================================
  // STATUS COLOR
  // ==========================================================

  const getStatusColor = (
    status: string
  ) => {

    switch (
      status?.toLowerCase()
    ) {

      case "pending":
        return "#F59E0B";

      case "approved":
        return "#10B981";

      case "rejected":
        return "#EF4444";

      default:
        return "#6B7280";
    }
  };


  // ==========================================================
  // STATUS TEXT
  // ==========================================================

  const getStatusText = (
    status: string
  ) => {

    if (!status) {
      return "Unknown";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    );
  };


  // ==========================================================
  // FORMAT AMOUNT
  // ==========================================================

  const formatAmount = (
    amount: number
  ) => {

    return (
      "₹" +
      Number(
        amount || 0
      ).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }
      )
    );
  };


  const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning 👋";
  }

  if (hour >= 12 && hour < 17) {
    return "Good Afternoon 👋";
  }

  if (hour >= 17 && hour < 20) {
    return "Good Evening 👋";
  }

  return "Good Night 🌙";
};

  // ==========================================================
  // UI
  // ==========================================================

  return (

    <View
      style={[
      styles.container,
      {
      backgroundColor:
      colors.background,
      },
      ]}
    >

      <StatusBar
        barStyle="light-content"
        backgroundColor="#2563EB"
      />


      {/* ====================================================
          HEADER
      ==================================================== */}

      <View
        style={[
        styles.header,
        {
         backgroundColor:
         colors.header,
        },
        ]}
      >

        <View style={styles.headerTextContainer}>

        <Text style={styles.greeting}>
          {getGreeting()}
        </Text>

          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {name}
          </Text>


          <Text style={styles.employee}>
            Employee ID : {employeeId}
          </Text>

        </View>


        {/* ==================================================
            PROFILE
        ================================================== */}

        <TouchableOpacity
          style={styles.profile}
          onPress={() =>
            router.push(
              "/profile"
            )
          }
        >

          {profileImage ? (

            <Image
              source={{
                uri: profileImage,
              }}
              style={
                styles.profileImage
              }
              resizeMode="cover"
            />

          ) : (

            <Ionicons
              name="person"
              size={30}
              color="#2563EB"
            />

          )}

        </TouchableOpacity>

      </View>


      {/* ====================================================
          CONTENT
      ==================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >

        {/* ==================================================
            EXPENSE SUMMARY
        ================================================== */}

        <Text
          style={styles.sectionTitle}
        >
          Expense Summary
        </Text>


        {loading ? (

          <View
            style={styles.loadingContainer}
          >

            <ActivityIndicator
              size="small"
              color="#2563EB"
            />

            <Text
              style={styles.loadingText}
            >
              Loading summary...
            </Text>

          </View>

        ) : (

          <View
            style={styles.summaryRow}
          >

            {/* =================================================
                PENDING
            ================================================= */}

            <View
              style={[
                styles.card,
                {
                  backgroundColor:
                    "#FFF7ED",
                },
              ]}
            >

              <MaterialIcons
                name="pending-actions"
                size={35}
                color="#F59E0B"
              />


              <Text
                style={styles.count}
              >
                {pendingCount}
              </Text>


              <Text
                style={styles.label}
              >
                Pending
              </Text>

            </View>


            {/* =================================================
                APPROVED
            ================================================= */}

            <View
              style={[
                styles.card,
                {
                  backgroundColor:
                    "#ECFDF5",
                },
              ]}
            >

              <Ionicons
                name="checkmark-circle"
                size={35}
                color="#10B981"
              />


              <Text
                style={styles.count}
              >
                {approvedCount}
              </Text>


              <Text
                style={styles.label}
              >
                Approved
              </Text>

            </View>


            {/* =================================================
                REJECTED
            ================================================= */}

            <View
              style={[
                styles.card,
                {
                  backgroundColor:
                    "#FEF2F2",
                },
              ]}
            >

              <MaterialIcons
                name="cancel"
                size={35}
                color="#EF4444"
              />


              <Text
                style={styles.count}
              >
                {rejectedCount}
              </Text>


              <Text
                style={styles.label}
              >
                Rejected
              </Text>

            </View>

          </View>

        )}


        {/* ==================================================
            RECENT EXPENSES
        ================================================== */}

        <Text
          style={styles.sectionTitle}
        >
          Recent Expenses
        </Text>


        {loading ? (

          <View
            style={styles.loadingContainer}
          >

            <ActivityIndicator
              size="small"
              color="#2563EB"
            />

            <Text
              style={styles.loadingText}
            >
              Loading expenses...
            </Text>

          </View>

        ) : recentExpenses.length === 0 ? (

          <View
            style={styles.emptyContainer}
          >

            <Ionicons
              name="receipt-outline"
              size={42}
              color="#9CA3AF"
            />


            <Text
              style={styles.emptyTitle}
            >
              No Recent Expenses
            </Text>


            <Text
              style={styles.emptyText}
            >
              Your latest expenses will
              appear here.
            </Text>

          </View>

        ) : (

          recentExpenses.map(
            (expense) => (

              <ExpenseCard
                key={expense.id}
                title={expense.title}
                amount={
                  formatAmount(
                    expense.amount
                  )
                }
                status={
                  getStatusText(
                    expense.status
                  )
                }
                color={
                  getStatusColor(
                    expense.status
                  )
                }
              />

            )
          )

        )}

      </ScrollView>


      {/* ====================================================
          BOTTOM NAVIGATION
      ==================================================== */}
<View style={styles.bottomNav}>

  {/* ==================================================
      HOME
  ================================================== */}

  <TouchableOpacity
    style={styles.navItem}
    onPress={() =>
      router.push("/dashboard")
    }
  >
    <Ionicons
      name="home-outline"
      size={24}
      color="#2563EB"
    />

    <Text
      style={[
        styles.navText,
        {
          color: "#2563EB",
        },
      ]}
    >
      Home
    </Text>
  </TouchableOpacity>


  {/* ==================================================
      EXPENSES
  ================================================== */}

  <TouchableOpacity
    style={styles.navItem}
    onPress={() =>
      router.push("/expenselist")
    }
  >
    <Ionicons
      name="receipt-outline"
      size={24}
      color="#6B7280"
    />

    <Text style={styles.navText}>
      Expenses
    </Text>
  </TouchableOpacity>


  {/* ==================================================
      ADD EXPENSE
  ================================================== */}

  <TouchableOpacity
    style={styles.centerButton}
    onPress={() =>
      router.push("/raiseExpense")
    }
  >
    <Ionicons
      name="add"
      size={34}
      color="#fff"
    />
  </TouchableOpacity>


  {/* ==================================================
      REPORTS
  ================================================== */}

  <TouchableOpacity
    style={styles.navItem}
    onPress={() =>
      router.push("/reportscreen")
    }
  >
    <Ionicons
      name="stats-chart-outline"
      size={24}
      color="#6B7280"
    />

    <Text style={styles.navText}>
      Reports
    </Text>
  </TouchableOpacity>


  {/* ==================================================
      PROFILE
  ================================================== */}

  <TouchableOpacity
    style={styles.navItem}
    onPress={() =>
      router.push("/profile")
    }
  >
    <Ionicons
      name="person-outline"
      size={24}
      color="#6B7280"
    />

    <Text style={styles.navText}>
      Profile
    </Text>
  </TouchableOpacity>

</View>
    </View>
  );
}


// ============================================================
// EXPENSE CARD
// ============================================================

function ExpenseCard({
  title,
  amount,
  status,
  color,
}: {
  title: string;
  amount: string;
  status: string;
  color: string;
}) {

  return (

    <TouchableOpacity
      style={styles.expenseCard}
    >

      <View
        style={styles.expenseInfo}
      >

        <Text
          style={styles.expenseTitle}
          numberOfLines={1}
        >
          {title}
        </Text>


        <Text
          style={styles.expenseAmount}
        >
          {amount}
        </Text>

      </View>


      <View
        style={[
          styles.status,
          {
            backgroundColor:
              color,
          },
        ]}
      >

        <Text
          style={styles.statusText}
        >
          {status}
        </Text>

      </View>

    </TouchableOpacity>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F5F7FB",
    },


    // ========================================================
    // HEADER
    // ========================================================

    header: {
      backgroundColor:
        "#2563EB",

      paddingTop: 55,
      paddingHorizontal: 20,
      paddingBottom: 25,

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
    },


    headerTextContainer: {
      flex: 1,
      marginRight: 15,
    },


    greeting: {
      color: "#E5E7EB",
      fontSize: 16,
    },


    name: {
      color: "#fff",
      fontSize: 28,
      fontWeight: "bold",
      marginTop: 2,
    },


    employee: {
      color: "#DBEAFE",
      marginTop: 4,
      fontSize: 14,
    },


    // ========================================================
    // PROFILE
    // ========================================================

    profile: {
      backgroundColor:
        "#fff",

      width: 58,
      height: 58,

      borderRadius: 29,

      justifyContent:
        "center",

      alignItems:
        "center",

      overflow: "hidden",

      borderWidth: 2,

      borderColor:
        "#FFFFFF",
    },


    profileImage: {
      width: "100%",
      height: "100%",
    },


    // ========================================================
    // SECTION
    // ========================================================

    sectionTitle: {
      fontSize: 20,

      fontWeight: "700",

      marginTop: 20,
      marginBottom: 15,
      marginHorizontal: 20,

      color: "#111827",
    },


    // ========================================================
    // LOADING
    // ========================================================

    loadingContainer: {
      alignItems:
        "center",

      justifyContent:
        "center",

      paddingVertical: 25,
    },


    loadingText: {
      marginTop: 8,

      color: "#6B7280",

      fontSize: 14,
    },


    // ========================================================
    // SUMMARY
    // ========================================================

    summaryRow: {
      flexDirection: "row",

      justifyContent:
        "space-around",

      marginHorizontal: 15,
    },


    card: {
      width: "30%",

      borderRadius: 18,

      alignItems:
        "center",

      paddingVertical: 18,

      elevation: 4,
    },


    count: {
      fontSize: 28,

      fontWeight: "bold",

      marginTop: 10,

      color: "#111827",
    },


    label: {
      color: "#6B7280",

      marginTop: 6,
    },


    // ========================================================
    // EMPTY
    // ========================================================

    emptyContainer: {
      backgroundColor:
        "#FFFFFF",

      marginHorizontal: 20,

      borderRadius: 16,

      paddingVertical: 35,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    emptyTitle: {
      marginTop: 10,

      fontSize: 17,

      fontWeight: "700",

      color: "#374151",
    },


    emptyText: {
      marginTop: 5,

      fontSize: 13,

      color: "#9CA3AF",

      textAlign:
        "center",
    },


    // ========================================================
    // EXPENSE CARD
    // ========================================================

    expenseCard: {
      backgroundColor:
        "#fff",

      marginHorizontal: 20,

      marginBottom: 15,

      borderRadius: 15,

      padding: 18,

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      elevation: 2,
    },


    expenseInfo: {
      flex: 1,

      marginRight: 12,
    },


    expenseTitle: {
      fontSize: 17,

      fontWeight: "600",

      color: "#111827",
    },


    expenseAmount: {
      marginTop: 6,

      color: "#6B7280",

      fontSize: 16,
    },


    status: {
      paddingHorizontal: 12,

      paddingVertical: 6,

      borderRadius: 20,
    },


    statusText: {
      color: "#fff",

      fontWeight: "bold",

      fontSize: 12,
    },


    // ========================================================
    // BOTTOM NAVIGATION
    // ========================================================
bottomNav: {
  position: "absolute",

  left: 16,
  right: 16,
  bottom: 60,

  height: 72,

  backgroundColor: "#FFFFFF",

  borderRadius: 24,

  flexDirection: "row",

  alignItems: "center",

  elevation: 18,

  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 16,

  shadowOffset: {
    width: 0,
    height: 8,
  },
},

navItem: {
  flex: 1,

  alignItems: "center",
  justifyContent: "center",
},

navText: {
  marginTop: 4,

  fontSize: 12,

  color: "#6B7280",

  fontWeight: "600",
},

centerNavItem: {
  flex: 1,

  alignItems: "center",
  justifyContent: "center",
},

centerButton: {
  width: 64,
  height: 64,

  borderRadius: 32,

  backgroundColor: "#2563EB",

  justifyContent: "center",
  alignItems: "center",

  marginTop: -28,

  elevation: 15,

  shadowColor: "#2563EB",
  shadowOpacity: 0.35,
  shadowRadius: 10,

  shadowOffset: {
    width: 0,
    height: 6,
  },
},

  });