import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import NetInfo from
  "@react-native-community/netinfo";

import {
  router,
} from "expo-router";

import {
  getExpenses,
} from "../../service/api";

import {
  useTheme,
} from "../../context/ThemeContext";

import {
  cacheExpenses,
  getCachedExpenses,
} from "../../database/expenseCache";


// ============================================================
// TYPES
// ============================================================

interface Expense {
  id: number | string;

  title: string;

  category: string;

  amount: number | string;

  status?: string;

  expense_date?: string;

  date?: string;

  description?: string;

  receipt_path?: string;

  created_at?: string;

  updated_at?: string;
}


// ============================================================
// SCREEN
// ============================================================

export default function ExpenseListScreen() {

  const {
    darkMode,
    colors,
  } = useTheme();


  // ==========================================================
  // EXPENSE STATE
  // ==========================================================

  const [
    expenses,
    setExpenses,
  ] = useState<Expense[]>([]);


  const [
    filteredExpenses,
    setFilteredExpenses,
  ] = useState<Expense[]>([]);


  const [
    search,
    setSearch,
  ] = useState("");


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);


  // ==========================================================
  // NETWORK
  // ==========================================================

  const [
    isOnline,
    setIsOnline,
  ] = useState(true);


  // ==========================================================
  // PAGINATION
  // ==========================================================

  const PAGE_SIZE = 10;


  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  const [
    hasMore,
    setHasMore,
  ] = useState(true);


  // ==========================================================
  // API BASE URL
  // ==========================================================

  const API_BASE_URL =
    "http://192.168.1.7:8000";


  // ==========================================================
  // PAGINATED DATA
  // ==========================================================

  const paginatedExpenses =
    filteredExpenses.slice(
      0,
      currentPage * PAGE_SIZE
    );


  // ==========================================================
  // NETWORK MONITOR
  // ==========================================================

  useEffect(() => {

    const unsubscribe =
      NetInfo.addEventListener(
        (state) => {

          const online =
            state.isConnected === true &&
            state.isInternetReachable !== false;


          setIsOnline(
            online
          );


          console.log(
            online
              ? "🌐 NETWORK: ONLINE"
              : "📴 NETWORK: OFFLINE"
          );

        }
      );


    return unsubscribe;

  }, []);


  // ==========================================================
  // LOAD EXPENSES
  // ==========================================================

  const loadExpenses = async (
    showLoading = true
  ) => {

    try {

      if (showLoading) {
        setLoading(true);
      }


      console.log(
        "🚀 LOADING EXPENSES"
      );


      // ======================================================
      // GET STORED USER
      // ======================================================

      const userString =
        await AsyncStorage.getItem(
          "user"
        );


      console.log(
        "📦 STORED USER:",
        userString
      );


      if (!userString) {

        Alert.alert(
          "Login Required",
          "Please login again.",
          [
            {
              text: "OK",

              onPress: () =>
                router.replace(
                  "/loginscreen"
                ),
            },
          ]
        );

        return;
      }


      let user: any;


      try {

        user =
          JSON.parse(
            userString
          );

      } catch {

        await AsyncStorage.removeItem(
          "user"
        );


        Alert.alert(
          "Error",
          "Invalid user information. Please login again."
        );

        return;
      }


      if (!user?.id) {

        Alert.alert(
          "Error",
          "User ID not found. Please login again."
        );

        return;
      }


      const userId =
        Number(user.id);


      console.log(
        "🆔 USER ID:",
        userId
      );


      // ======================================================
      // CHECK NETWORK
      // ======================================================

      const network =
        await NetInfo.fetch();


      const online =
        network.isConnected === true &&
        network.isInternetReachable !== false;


      setIsOnline(
        online
      );


      // ======================================================
      // OFFLINE → SQLITE CACHE
      // ======================================================

      if (!online) {

        console.log(
          "📴 OFFLINE - LOADING CACHED EXPENSES"
        );


        const cached =
          await getCachedExpenses();


        const cachedExpenses =
          cached as Expense[];


        console.log(
          "📦 CACHED EXPENSE COUNT:",
          cachedExpenses.length
        );


        setExpenses(
          cachedExpenses
        );


        setFilteredExpenses(
          cachedExpenses
        );


        // Reset pagination

        setCurrentPage(
          1
        );


        setHasMore(
          cachedExpenses.length >
          PAGE_SIZE
        );


        return;
      }


      // ======================================================
      // ONLINE → API
      // ======================================================

      console.log(
        "🌐 ONLINE - LOADING FROM API"
      );


      const response =
        await getExpenses(
          userId
        );


      console.log(
        "📦 EXPENSE API DATA:",
        response
      );


      // ======================================================
      // HANDLE API RESPONSE
      // ======================================================

      let expenseData:
        Expense[] = [];


      if (
        Array.isArray(
          response
        )
      ) {

        expenseData =
          response;

      } else if (
        Array.isArray(
          response?.data
        )
      ) {

        expenseData =
          response.data;

      } else if (
        Array.isArray(
          response?.expenses
        )
      ) {

        expenseData =
          response.expenses;

      } else {

        console.log(
          "⚠️ NO EXPENSE ARRAY FOUND"
        );

      }


      console.log(
        "📋 EXPENSE COUNT:",
        expenseData.length
      );


      // ======================================================
      // UPDATE SCREEN
      // ======================================================

      setExpenses(
        expenseData
      );


      setFilteredExpenses(
        expenseData
      );


      // ======================================================
      // RESET PAGINATION
      // ======================================================

      setCurrentPage(
        1
      );


      setHasMore(
        expenseData.length >
        PAGE_SIZE
      );


      // ======================================================
      // SAVE API DATA TO SQLITE
      // ======================================================

      if (
        expenseData.length > 0
      ) {

        await cacheExpenses(
          expenseData
        );


        console.log(
          "💾 EXPENSES SAVED TO SQLITE CACHE"
        );

      }


    } catch (error: any) {

      console.log(
        "❌ LOAD EXPENSE ERROR:",
        error
      );


      // ======================================================
      // API FAILED → CACHE FALLBACK
      // ======================================================

      console.log(
        "📦 API FAILED - TRYING CACHE"
      );


      try {

        const cached =
          await getCachedExpenses();


        const cachedExpenses =
          cached as Expense[];


        if (
          cachedExpenses.length > 0
        ) {

          setExpenses(
            cachedExpenses
          );


          setFilteredExpenses(
            cachedExpenses
          );


          setCurrentPage(
            1
          );


          setHasMore(
            cachedExpenses.length >
            PAGE_SIZE
          );


          setIsOnline(
            false
          );


          console.log(
            "✅ CACHE FALLBACK SUCCESS:",
            cachedExpenses.length
          );


        } else {

          Alert.alert(
            "Unable to Load",
            error?.message ||
              "Unable to load expenses."
          );

        }

      } catch (
        cacheError
      ) {

        console.log(
          "❌ CACHE FALLBACK ERROR:",
          cacheError
        );


        Alert.alert(
          "Error",
          "Unable to load expenses."
        );

      }

    } finally {

      setLoading(
        false
      );


      setRefreshing(
        false
      );

    }

  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadExpenses();

  }, []);


  // ==========================================================
  // SEARCH
  // ==========================================================

  useEffect(() => {

    const keyword =
      search
        .trim()
        .toLowerCase();


    let filtered:
      Expense[];


    // ========================================================
    // NO SEARCH
    // ========================================================

    if (!keyword) {

      filtered =
        expenses;

    } else {

      // ======================================================
      // SEARCH
      // ======================================================

      filtered =
        expenses.filter(
          (item) => {

            const title =
              item.title
                ?.toLowerCase() ||
              "";


            const category =
              item.category
                ?.toLowerCase() ||
              "";


            const status =
              item.status
                ?.toLowerCase() ||
              "";


            return (
              title.includes(
                keyword
              ) ||

              category.includes(
                keyword
              ) ||

              status.includes(
                keyword
              )
            );

          }
        );

    }


    setFilteredExpenses(
      filtered
    );


    // ========================================================
    // RESET PAGINATION
    // ========================================================

    setCurrentPage(
      1
    );


    setHasMore(
      filtered.length >
      PAGE_SIZE
    );

  }, [
    search,
    expenses,
  ]);


  // ==========================================================
  // LOAD MORE
  // ==========================================================

  const loadMoreExpenses =
    () => {

      // Already loading

      if (
        loadingMore
      ) {
        return;
      }


      // Nothing more

      if (
        !hasMore
      ) {
        return;
      }


      const nextPage =
        currentPage + 1;


      const nextItemCount =
        nextPage *
        PAGE_SIZE;


      // If all records are already displayed

      if (
        nextItemCount >=
        filteredExpenses.length
      ) {

        setCurrentPage(
          nextPage
        );


        setHasMore(
          false
        );


        return;
      }


      setLoadingMore(
        true
      );


      console.log(
        "📄 LOADING PAGE:",
        nextPage
      );


      // Small delay for smooth UI

      setTimeout(() => {

        setCurrentPage(
          nextPage
        );


        setHasMore(
          nextItemCount <
          filteredExpenses.length
        );


        setLoadingMore(
          false
        );


        console.log(
          "✅ PAGE LOADED:",
          nextPage
        );

      }, 300);

    };


  // ==========================================================
  // PULL TO REFRESH
  // ==========================================================

  const onRefresh =
    useCallback(
      async () => {

        setRefreshing(
          true
        );


        setCurrentPage(
          1
        );


        setHasMore(
          true
        );


        await loadExpenses(
          false
        );

      },
      []
    );


  // ==========================================================
  // DELETE EXPENSE
  // ==========================================================

  const handleDeleteExpense = (
    item: Expense
  ) => {

    // ========================================================
    // OFFLINE
    // ========================================================

    if (!isOnline) {

      Alert.alert(
        "Offline",
        "You cannot delete an expense while offline. Please connect to the internet and try again."
      );


      return;
    }


    Alert.alert(
      "Delete Expense",

      `Are you sure you want to delete "${item.title}"?`,

      [
        {
          text: "Cancel",

          style: "cancel",
        },

        {
          text: "Delete",

          style: "destructive",

          onPress:
            async () => {

              try {

                setLoading(
                  true
                );


                const token =
                  await AsyncStorage.getItem(
                    "access_token"
                  );


                if (!token) {

                  throw new Error(
                    "Login token not found."
                  );

                }


                const response =
                  await fetch(
                    `${API_BASE_URL}/expenses/${item.id}`,

                    {
                      method:
                        "DELETE",

                      headers: {
                        Accept:
                          "application/json",

                        Authorization:
                          `Bearer ${token}`,
                      },
                    }
                  );


                const responseText =
                  await response.text();


                let result:
                  any = {};


                try {

                  result =
                    JSON.parse(
                      responseText
                    );

                } catch {

                  // Empty response allowed

                }


                if (
                  !response.ok
                ) {

                  throw new Error(
                    result?.detail ||
                    result?.message ||
                    "Unable to delete expense."
                  );

                }


                // =================================================
                // REMOVE FROM SCREEN
                // =================================================

                setExpenses(
                  (
                    previous
                  ) =>
                    previous.filter(
                      (
                        expense
                      ) =>
                        String(
                          expense.id
                        ) !==
                        String(
                          item.id
                        )
                    )
                );


                Alert.alert(
                  "Deleted",
                  "Expense deleted successfully."
                );


                // =================================================
                // RELOAD CACHE
                // =================================================

                await loadExpenses(
                  false
                );


              } catch (
                error: any
              ) {

                console.log(
                  "❌ DELETE ERROR:",
                  error
                );


                Alert.alert(
                  "Delete Error",
                  error?.message ||
                    "Unable to delete expense."
                );


              } finally {

                setLoading(
                  false
                );

              }

            },
        },
      ]
    );

  };


  // ==========================================================
  // FORMAT AMOUNT
  // ==========================================================

  const formatAmount = (
    amount:
      number | string
  ) => {

    const value =
      Number(
        amount
      );


    if (
      isNaN(
        value
      )
    ) {

      return `₹${amount}`;

    }


    return `₹${value.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      }
    )}`;

  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (
    date?: string
  ) => {

    if (!date) {
      return "";
    }


    const parsed =
      new Date(
        date
      );


    if (
      isNaN(
        parsed.getTime()
      )
    ) {

      return date;

    }


    return parsed.toLocaleDateString(
      "en-IN",
      {
        day:
          "2-digit",

        month:
          "short",

        year:
          "numeric",
      }
    );

  };


  // ==========================================================
  // STATUS COLOR
  // ==========================================================

  const getStatusColor = (
    status?: string
  ) => {

    switch (
      status?.toLowerCase()
    ) {

      case "approved":
        return "#10B981";


      case "rejected":
        return "#EF4444";


      case "pending":
        return "#F59E0B";


      default:
        return "#64748B";

    }

  };


  // ==========================================================
  // RENDER EXPENSE
  // ==========================================================

  const renderItem = ({
    item,
  }: {
    item: Expense;
  }) => {

    const status =
      item.status ||
      "Pending";


    const date =
      item.expense_date ||
      item.date;


    return (

      <View
        style={[
          styles.card,

          {
            backgroundColor:
              colors.card,

            borderColor:
              colors.border,
          },
        ]}
      >

        {/* ====================================================
            EXPENSE CONTENT
        ==================================================== */}

        <TouchableOpacity
          activeOpacity={
            0.8
          }

          onPress={() =>
            router.push({
              pathname:
                "/expenseDetails",

              params: {
                id:
                  String(
                    item.id
                  ),
              },
            })
          }
        >

          <View
            style={
              styles.row
            }
          >

            {/* =================================================
                LEFT
            ================================================= */}

            <View
              style={
                styles.leftContent
              }
            >

              <Text
                style={[
                  styles.title,

                  {
                    color:
                      colors.text,
                  },
                ]}

                numberOfLines={
                  1
                }
              >
                {
                  item.title
                }
              </Text>


              <Text
                style={[
                  styles.category,

                  {
                    color:
                      colors.textSecondary,
                  },
                ]}

                numberOfLines={
                  1
                }
              >
                {
                  item.category
                }
              </Text>


              <Text
                style={[
                  styles.date,

                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                {
                  formatDate(
                    date
                  )
                }
              </Text>

            </View>


            {/* =================================================
                RIGHT
            ================================================= */}

            <View
              style={
                styles.rightContent
              }
            >

              <Text
                style={[
                  styles.amount,

                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {
                  formatAmount(
                    item.amount
                  )
                }
              </Text>


              <View
                style={[
                  styles.status,

                  {
                    backgroundColor:
                      getStatusColor(
                        status
                      ),
                  },
                ]}
              >

                <Text
                  style={
                    styles.statusText
                  }
                >
                  {
                    status
                  }
                </Text>

              </View>

            </View>

          </View>

        </TouchableOpacity>


        {/* ====================================================
            ACTION BUTTONS
        ==================================================== */}

        <View
          style={[
            styles.actionRow,

            {
              borderTopColor:
                colors.border,
            },
          ]}
        >

          {/* =================================================
              VIEW
          ================================================= */}

          <TouchableOpacity
            style={[
              styles.actionButton,

              {
                backgroundColor:
                  colors.iconBackground,

                borderColor:
                  colors.primary,
              },
            ]}

            onPress={() =>
              router.push({
                pathname:
                  "/expenseDetails",

                params: {
                  id:
                    String(
                      item.id
                    ),
                },
              })
            }
          >

            <Ionicons
              name={
                "eye-outline"
              }

              size={
                17
              }

              color={
                colors.primary
              }
            />


            <Text
              style={[
                styles.actionText,

                {
                  color:
                    colors.primary,
                },
              ]}
            >
              View
            </Text>

          </TouchableOpacity>


          {/* =================================================
              EDIT
          ================================================= */}

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.editButton,
            ]}

            onPress={() =>
              router.push({
                pathname:
                  "/raiseExpense",

                params: {
                  id:
                    String(
                      item.id
                    ),
                },
              })
            }
          >

            <Ionicons
              name={
                "create-outline"
              }

              size={
                17
              }

              color={
                "#F59E0B"
              }
            />


            <Text
              style={[
                styles.actionText,

                {
                  color:
                    "#D97706",
                },
              ]}
            >
              Edit
            </Text>

          </TouchableOpacity>


          {/* =================================================
              DELETE
          ================================================= */}

          <TouchableOpacity
            style={[
              styles.actionButton,

              styles.deleteButton,

              !isOnline &&
                styles.disabledButton,
            ]}

            onPress={() =>
              handleDeleteExpense(
                item
              )
            }
          >

            <Ionicons
              name={
                "trash-outline"
              }

              size={
                17
              }

              color={
                !isOnline
                  ? "#94A3B8"
                  : "#EF4444"
              }
            />


            <Text
              style={[
                styles.actionText,

                {
                  color:
                    !isOnline
                      ? "#94A3B8"
                      : "#DC2626",
                },
              ]}
            >
              Delete
            </Text>

          </TouchableOpacity>

        </View>

      </View>

    );

  };


  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {

    return (

      <View
        style={[
          styles.loadingContainer,

          {
            backgroundColor:
              colors.background,
          },
        ]}
      >

        <ActivityIndicator
          size={
            "large"
          }

          color={
            colors.primary
          }
        />


        <Text
          style={[
            styles.loadingText,

            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Loading expenses...
        </Text>

      </View>

    );

  }


  // ==========================================================
  // MAIN UI
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

        <Text
          style={[
            styles.headerTitle,

            {
              color:
                colors.headerText,
            },
          ]}
        >
          Expense List
        </Text>


        <Text
          style={[
            styles.headerSubtitle,

            {
              color:
                colors.headerSubText,
            },
          ]}
        >
          Track your submitted expenses
        </Text>

      </View>


      {/* ====================================================
          OFFLINE BANNER
      ==================================================== */}

      {!isOnline && (

        <View
          style={[
            styles.offlineBanner,

            {
              backgroundColor:
                darkMode
                  ? "#422006"
                  : "#FEF3C7",
            },
          ]}
        >

          <Ionicons
            name={
              "cloud-offline-outline"
            }

            size={
              18
            }

            color={
              darkMode
                ? "#FBBF24"
                : "#92400E"
            }
          />


          <Text
            style={[
              styles.offlineText,

              {
                color:
                  darkMode
                    ? "#FBBF24"
                    : "#92400E",
              },
            ]}
          >
            Offline • Showing cached expenses
          </Text>

        </View>

      )}


      {/* ====================================================
          SEARCH
      ==================================================== */}

      <View
        style={[
          styles.searchBox,

          {
            backgroundColor:
              colors.input,

            borderColor:
              colors.inputBorder,
          },
        ]}
      >

        <Ionicons
          name={
            "search"
          }

          size={
            20
          }

          color={
            colors.textSecondary
          }
        />


        <TextInput
          placeholder={
            "Search expenses..."
          }

          placeholderTextColor={
            colors.textMuted
          }

          style={[
            styles.input,

            {
              color:
                colors.text,
            },
          ]}

          value={
            search
          }

          onChangeText={
            setSearch
          }
        />


        {search.length >
          0 && (

          <TouchableOpacity
            onPress={() =>
              setSearch(
                ""
              )
            }
          >

            <Ionicons
              name={
                "close-circle"
              }

              size={
                20
              }

              color={
                colors.textMuted
              }
            />

          </TouchableOpacity>

        )}

      </View>


      {/* ====================================================
          PAGINATION INFO
      ==================================================== */}

      {paginatedExpenses.length >
        0 && (

        <View
          style={
            styles.paginationInfo
          }
        >

          <Text
            style={[
              styles.paginationInfoText,

              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Showing{" "}
            {
              paginatedExpenses.length
            }{" "}
            of{" "}
            {
              filteredExpenses.length
            }{" "}
            expenses
          </Text>

        </View>

      )}


      {/* ====================================================
          EXPENSE LIST
      ==================================================== */}

      <FlatList
        data={
          paginatedExpenses
        }

        renderItem={
          renderItem
        }

        keyExtractor={
          (item) =>
            String(
              item.id
            )
        }

        showsVerticalScrollIndicator={
          false
        }


        // ====================================================
        // INFINITE SCROLL
        // ====================================================

        onEndReached={
          loadMoreExpenses
        }

        onEndReachedThreshold={
          0.5
        }


        contentContainerStyle={
          paginatedExpenses.length ===
          0
            ? styles.emptyContainer
            : styles.listContent
        }


        // ====================================================
        // PULL TO REFRESH
        // ====================================================

        refreshControl={

          <RefreshControl
            refreshing={
              refreshing
            }

            onRefresh={
              onRefresh
            }

            colors={[
              colors.primary,
            ]}

            tintColor={
              colors.primary
            }
          />

        }


        // ====================================================
        // PAGINATION FOOTER
        // ====================================================

        ListFooterComponent={

          loadingMore ? (

            <View
              style={
                styles.paginationLoader
              }
            >

              <ActivityIndicator
                size={
                  "small"
                }

                color={
                  colors.primary
                }
              />


              <Text
                style={[
                  styles.paginationText,

                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                Loading more expenses...
              </Text>

            </View>

          ) : hasMore ? null : (

            paginatedExpenses.length >
              0 ? (

              <View
                style={
                  styles.endOfList
                }
              >

                <Text
                  style={[
                    styles.endOfListText,

                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  No more expenses
                </Text>

              </View>

            ) : null

          )

        }


        // ====================================================
        // EMPTY STATE
        // ====================================================

        ListEmptyComponent={

          <View
            style={
              styles.emptyBox
            }
          >

            <Ionicons
              name={
                "receipt-outline"
              }

              size={
                60
              }

              color={
                colors.textMuted
              }
            />


            <Text
              style={[
                styles.emptyTitle,

                {
                  color:
                    colors.text,
                },
              ]}
            >
              No Expenses Found
            </Text>


            <Text
              style={[
                styles.emptyText,

                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {
                search
                  ? "Try a different search."
                  : !isOnline
                    ? "No cached expenses available."
                    : "You haven't submitted any expenses yet."
              }
            </Text>

          </View>

        }

      />


      {/* ====================================================
          ADD BUTTON
      ==================================================== */}

      <TouchableOpacity
        style={[
          styles.floatingButton,

          {
            backgroundColor:
              colors.primary,
          },
        ]}

        activeOpacity={
          0.8
        }

        onPress={() =>
          router.push(
            "/raiseExpense"
          )
        }
      >

        <Ionicons
          name={
            "add"
          }

          size={
            34
          }

          color={
            "#FFFFFF"
          }
        />

      </TouchableOpacity>

    </View>

  );

}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
    },


    // ========================================================
    // HEADER
    // ========================================================

    header: {
      paddingTop: 55,
      paddingBottom: 24,
      paddingHorizontal: 20,

      borderBottomLeftRadius:
        25,

      borderBottomRightRadius:
        25,
    },


    headerTitle: {
      fontSize: 26,
      fontWeight: "bold",
    },


    headerSubtitle: {
      fontSize: 14,
      marginTop: 5,
    },


    // ========================================================
    // OFFLINE
    // ========================================================

    offlineBanner: {
      marginHorizontal: 20,
      marginTop: 12,

      paddingVertical: 10,
      paddingHorizontal: 14,

      borderRadius: 12,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    offlineText: {
      marginLeft: 7,

      fontSize: 13,

      fontWeight:
        "600",
    },


    // ========================================================
    // SEARCH
    // ========================================================

    searchBox: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginHorizontal: 20,

      marginTop: 18,

      marginBottom: 5,

      paddingHorizontal: 15,

      borderRadius: 12,

      borderWidth: 1,

      elevation: 3,

      shadowColor:
        "#000000",

      shadowOpacity:
        0.05,

      shadowRadius:
        5,

      shadowOffset: {
        width: 0,
        height: 2,
      },
    },


    input: {
      flex: 1,

      padding: 14,

      fontSize: 16,
    },


    // ========================================================
    // PAGINATION INFO
    // ========================================================

    paginationInfo: {
      marginHorizontal: 20,

      marginBottom: 5,

      paddingHorizontal: 2,
    },


    paginationInfoText: {
      fontSize: 12,

      fontWeight:
        "500",
    },


    paginationLoader: {
      paddingVertical: 20,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    paginationText: {
      marginTop: 8,

      fontSize: 13,
    },


    endOfList: {
      paddingVertical: 20,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    endOfListText: {
      fontSize: 13,
    },


    // ========================================================
    // LIST
    // ========================================================

    listContent: {
      paddingTop: 5,

      paddingBottom: 110,
    },


    // ========================================================
    // CARD
    // ========================================================

    card: {
      marginHorizontal: 20,

      marginBottom: 15,

      borderRadius: 15,

      padding: 18,

      borderWidth: 1,

      elevation: 3,

      shadowColor:
        "#000000",

      shadowOpacity:
        0.05,

      shadowRadius:
        6,

      shadowOffset: {
        width: 0,
        height: 3,
      },
    },


    row: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",
    },


    leftContent: {
      flex: 1,

      paddingRight: 15,
    },


    rightContent: {
      alignItems:
        "flex-end",
    },


    title: {
      fontSize: 18,

      fontWeight:
        "bold",
    },


    category: {
      marginTop: 6,
    },


    date: {
      marginTop: 6,
    },


    amount: {
      fontSize: 18,

      fontWeight:
        "bold",
    },


    status: {
      marginTop: 10,

      paddingHorizontal: 12,

      paddingVertical: 5,

      borderRadius: 20,
    },


    statusText: {
      color:
        "#FFFFFF",

      fontWeight:
        "600",

      fontSize: 12,
    },


    // ========================================================
    // ACTIONS
    // ========================================================

    actionRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,

      marginTop: 14,

      paddingTop: 12,

      borderTopWidth: 1,
    },


    actionButton: {
      flex: 1,

      height: 40,

      borderRadius: 10,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 6,

      borderWidth: 1,
    },


    actionText: {
      fontSize: 13,

      fontWeight:
        "600",
    },


    editButton: {
      backgroundColor:
        "#FFFBEB",

      borderColor:
        "#FDE68A",
    },


    deleteButton: {
      backgroundColor:
        "#FEF2F2",

      borderColor:
        "#FECACA",
    },


    disabledButton: {
      opacity:
        0.6,
    },


    // ========================================================
    // LOADING
    // ========================================================

    loadingContainer: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",
    },


    loadingText: {
      marginTop: 12,

      fontSize: 15,
    },


    // ========================================================
    // EMPTY
    // ========================================================

    emptyContainer: {
      flexGrow: 1,

      justifyContent:
        "center",

      paddingBottom: 80,
    },


    emptyBox: {
      alignItems:
        "center",

      paddingHorizontal: 30,
    },


    emptyTitle: {
      marginTop: 15,

      fontSize: 20,

      fontWeight:
        "700",
    },


    emptyText: {
      marginTop: 8,

      fontSize: 14,

      textAlign:
        "center",
    },


    // ========================================================
    // FLOATING BUTTON
    // ========================================================

    floatingButton: {
      position:
        "absolute",

      right: 22,

      bottom: 60,

      width: 62,

      height: 62,

      borderRadius: 31,

      justifyContent:
        "center",

      alignItems:
        "center",

      elevation: 8,

      shadowColor:
        "#000000",

      shadowOpacity:
        0.25,

      shadowRadius:
        8,

      shadowOffset: {
        width: 0,

        height: 4,
      },
    },

  });