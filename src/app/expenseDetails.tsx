import {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";

import * as Sharing from "expo-sharing";

import {
  File,
  Paths,
} from "expo-file-system";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import {
  getExpenseById,
} from "../../service/api";


import {
  useTheme,
} from "../../context/ThemeContext";


// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL =
  "https://expensebackend-tdxz.onrender.com";


// ============================================================
// TYPES
// ============================================================

interface Expense {

  id: number | string;

  user_id?: number;

  title: string;

  category: string;

  amount: number | string;

  expense_date?: string;

  status?: string;

  description?: string;

  receipt_path?: string;

  manager_remarks?: string;

  remarks?: string;
}


// ============================================================
// SCREEN
// ============================================================

export default function ExpenseDetailsScreen() {


   const {
    darkMode,
    colors,
    } = useTheme();

  const {
    id,
  } = useLocalSearchParams<{
    id: string;
  }>();


  const [
    expense,
    setExpense,
  ] = useState<Expense | null>(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  // ============================================================
  // LOAD EXPENSE
  // ============================================================

  const loadExpense = async () => {

    try {

      setLoading(true);

      console.log(
        "🚀 LOAD EXPENSE DETAILS"
      );

      console.log(
        "🆔 Expense ID:",
        id
      );


      // ========================================================
      // CHECK ID
      // ========================================================

      if (!id) {

        Alert.alert(
          "Error",
          "Expense ID not found."
        );

        return;
      }


      // ========================================================
      // GET USER
      // ========================================================

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
                  "/login"
                ),
            },
          ]
        );

        return;
      }


      const user =
        JSON.parse(userString);


      console.log(
        "👤 USER:",
        user
      );


      if (!user?.id) {

        Alert.alert(
          "Error",
          "User ID not found."
        );

        return;
      }


      // ========================================================
      // API
      // ========================================================

      const response =
        await getExpenseById(
          Number(id)
        );


      console.log(
        "📦 EXPENSE DETAILS RESPONSE:",
        response
      );


      // ========================================================
      // GET DATA
      // ========================================================

      let expenseData:
        Expense | null = null;


      if (
        response?.data
      ) {

        expenseData =
          response.data;

      } else if (
        response?.expense
      ) {

        expenseData =
          response.expense;

      } else {

        expenseData =
          response;
      }


      if (!expenseData) {

        Alert.alert(
          "Not Found",
          "Expense not found."
        );

        return;
      }


      console.log(
        "📎 RECEIPT PATH:",
        expenseData.receipt_path
      );


      setExpense(
        expenseData
      );


    } catch (error: any) {

      console.log(
        "❌ LOAD EXPENSE DETAILS ERROR:",
        error
      );


      Alert.alert(
        "Error",
        error?.message ||
          "Unable to load expense details."
      );


    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // LOAD ON SCREEN
  // ============================================================

  useEffect(() => {

    loadExpense();

  }, [id]);


  // ============================================================
  // FORMAT AMOUNT
  // ============================================================

  const formatAmount = (
    amount?: number | string
  ) => {

    const value =
      Number(amount);


    if (
      isNaN(value)
    ) {

      return `₹${amount ?? 0}`;

    }


    return `₹${value.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,

        maximumFractionDigits: 2,
      }
    )}`;

  };


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    date?: string
  ) => {

    if (!date) {

      return "-";

    }


    const parsed =
      new Date(date);


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
        day: "2-digit",

        month: "short",

        year: "numeric",
      }
    );

  };


  // ============================================================
  // STATUS COLOR
  // ============================================================

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


      case "paid":

        return "#16A34A";


      case "pending":

        return "#F59E0B";


      default:

        return "#64748B";

    }

  };


  // ============================================================
  // CHECK RECEIPT TYPE
  // ============================================================

  const isImageReceipt = (
    path?: string
  ) => {

    if (!path) {

      return false;

    }


    return /\.(jpg|jpeg|png|webp)$/i.test(
      path
    );

  };


  const isPdfReceipt = (
    path?: string
  ) => {

    if (!path) {

      return false;

    }


    return /\.pdf$/i.test(
      path
    );

  };


  // ============================================================
  // OPEN RECEIPT
  // ============================================================

  const openReceipt = async () => {

    try {

      // ========================================================
      // CHECK RECEIPT
      // ========================================================

      if (!expense?.receipt_path) {

        Alert.alert(
          "Receipt",
          "No receipt attached."
        );

        return;
      }


      const receiptPath =
        expense.receipt_path.trim();


      console.log(
        "📎 RECEIPT PATH:",
        receiptPath
      );


      // ========================================================
      // DETERMINE TYPE
      // ========================================================

      const isPdf =
        isPdfReceipt(
          receiptPath
        );


      console.log(
        "📄 IS PDF:",
        isPdf
      );


      // ========================================================
      // LOCAL FILE
      // ========================================================

      if (
        receiptPath.startsWith(
          "file://"
        )
      ) {

        console.log(
          "📂 LOCAL RECEIPT:"
        );


        const available =
          await Sharing.isAvailableAsync();


        if (!available) {

          Alert.alert(
            "Unavailable",
            "File sharing is not available on this device."
          );

          return;
        }


        await Sharing.shareAsync(
          receiptPath,
          {
            mimeType:
              isPdf
                ? "application/pdf"
                : "image/*",

            dialogTitle:
              isPdf
                ? "Open PDF Receipt"
                : "Open Receipt",

            UTI:
              isPdf
                ? "com.adobe.pdf"
                : "public.image",
          }
        );


        return;
      }


      // ========================================================
      // BUILD SERVER URL
      // ========================================================

      const receiptUrl =
        receiptPath.startsWith(
          "http://"
        ) ||
        receiptPath.startsWith(
          "https://"
        )
          ? receiptPath
          : `${API_BASE_URL}${receiptPath}`;


      console.log(
        "🌐 RECEIPT URL:",
        receiptUrl
      );


      // ========================================================
      // FILE NAME
      // ========================================================

      let fileName =
        receiptPath
          .split("/")
          .pop();


      if (!fileName) {

        fileName =
          `receipt_${Date.now()}${
            isPdf
              ? ".pdf"
              : ".jpg"
          }`;

      }


      console.log(
        "📄 FILE NAME:",
        fileName
      );


      // ========================================================
      // DOWNLOAD DIRECTORY
      // ========================================================

      console.log(
        "📥 DOWNLOADING RECEIPT..."
      );


      Alert.alert(
        "Opening Receipt",
        "Downloading receipt..."
      );


      // ========================================================
      // LOCAL DESTINATION
      // ========================================================

      const destination =
        new File(
          Paths.cache,
          fileName
        );


      // ========================================================
      // DOWNLOAD
      // ========================================================

      const downloadedFile =
        await File.downloadFileAsync(
          receiptUrl,
          destination,
          {
            idempotent: true,
          }
        );


      console.log(
        "✅ DOWNLOAD COMPLETE"
      );


      console.log(
        "📁 LOCAL FILE:",
        downloadedFile.uri
      );


      console.log(
        "📦 FILE EXISTS:",
        downloadedFile.exists
      );


      // ========================================================
      // VERIFY
      // ========================================================

      if (
        !downloadedFile.exists
      ) {

        throw new Error(
          "Downloaded receipt file does not exist."
        );

      }


      // ========================================================
      // CHECK SHARING
      // ========================================================

      const available =
        await Sharing.isAvailableAsync();


      console.log(
        "📱 SHARING AVAILABLE:",
        available
      );


      if (!available) {

        throw new Error(
          "No application is available to open this receipt."
        );

      }


      // ========================================================
      // OPEN FILE
      // ========================================================

      console.log(
        "📂 OPENING LOCAL FILE..."
      );


      await Sharing.shareAsync(
        downloadedFile.uri,
        {
          mimeType:
            isPdf
              ? "application/pdf"
              : "image/*",

          dialogTitle:
            isPdf
              ? "Open PDF Receipt"
              : "Open Receipt",

          UTI:
            isPdf
              ? "com.adobe.pdf"
              : "public.image",
        }
      );


      console.log(
        "✅ RECEIPT OPENED"
      );


    } catch (error: any) {

      console.log(
        "❌ OPEN RECEIPT ERROR:",
        error
      );


      Alert.alert(
        "Unable to Open Receipt",
        error?.message ||
          "Unable to open the receipt."
      );

    }

  };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading expense...
        </Text>

      </View>

    );

  }


  // ============================================================
  // NOT FOUND
  // ============================================================

  if (!expense) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <Ionicons
          name="receipt-outline"
          size={60}
          color="#CBD5E1"
        />


        <Text
          style={
            styles.notFoundTitle
          }
        >
          Expense Not Found
        </Text>


        <TouchableOpacity
          style={
            styles.backButtonLarge
          }

          onPress={() =>
            router.back()
          }
        >

          <Text
            style={
              styles.backButtonText
            }
          >
            Go Back
          </Text>

        </TouchableOpacity>

      </View>

    );

  }


  const status =
    expense.status ||
    "Pending";


  // ============================================================
  // MAIN UI
  // ============================================================

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

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.header,
          },
        ]}
      >

      


        <Text
          style={
            styles.headerTitle
          }
        >
          Expense Details
        </Text>


        <View
          style={{
            width: 42,
          }}
        />

      </View>


      {/* ======================================================
          CONTENT
      ====================================================== */}

      <ScrollView
        contentContainerStyle={
          styles.content
        }

        showsVerticalScrollIndicator={
          false
        }
      >

        {/* ====================================================
            BASIC DETAILS
        ==================================================== */}

        <View
          style={styles.card}
        >

          <Text
            style={styles.title}
          >
            {expense.title}
          </Text>


          <View
            style={styles.row}
          >

            <Text
              style={styles.label}
            >
              Category
            </Text>

            <Text
              style={styles.value}
            >
              {expense.category}
            </Text>

          </View>


          <View
            style={styles.row}
          >

            <Text
              style={styles.label}
            >
              Amount
            </Text>

            <Text
              style={[
                styles.value,
                styles.amount,
              ]}
            >
              {formatAmount(
                expense.amount
              )}
            </Text>

          </View>


          <View
            style={styles.row}
          >

            <Text
              style={styles.label}
            >
              Expense Date
            </Text>

            <Text
              style={styles.value}
            >
              {formatDate(
                expense.expense_date
              )}
            </Text>

          </View>


          <View
            style={styles.row}
          >

            <Text
              style={styles.label}
            >
              Status
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
                {status}
              </Text>

            </View>

          </View>

        </View>


        {/* ====================================================
            DESCRIPTION
        ==================================================== */}

        <View
          style={styles.card}
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Description
          </Text>


          <Text
            style={
              styles.description
            }
          >
            {expense.description ||
              "No description provided."}
          </Text>

        </View>


        {/* ====================================================
            RECEIPT
        ==================================================== */}

        <View
          style={styles.card}
        >

          <View
            style={styles.receiptHeader}
          >

            <View
              style={styles.receiptTitleRow}
            >

              <View
                style={styles.receiptIcon}
              >

                <Ionicons
                  name="receipt-outline"
                  size={22}
                  color="#2563EB"
                />

              </View>


              <View>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Receipt
                </Text>

                <Text
                  style={
                    styles.receiptSubTitle
                  }
                >
                  Attached expense document
                </Text>

              </View>

            </View>

          </View>


          {expense.receipt_path ? (

            <View>

              {/* =================================================
                  IMAGE RECEIPT
              ================================================= */}

              {isImageReceipt(
                expense.receipt_path
              ) ? (

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={
                    openReceipt
                  }
                >

                  <Image
                    source={{
                      uri:
                        expense.receipt_path.startsWith(
                          "http"
                        )
                          ? expense.receipt_path
                          : `${API_BASE_URL}${expense.receipt_path}`,
                    }}

                    style={
                      styles.receiptImage
                    }

                    resizeMode="contain"
                  />

                  <View
                    style={
                      styles.tapToOpen
                    }
                  >

                    <Ionicons
                      name="expand-outline"
                      size={18}
                      color="#2563EB"
                    />

                    <Text
                      style={
                        styles.tapToOpenText
                      }
                    >
                      Tap to open
                    </Text>

                  </View>

                </TouchableOpacity>

              ) : (

                /* =================================================
                   PDF / OTHER DOCUMENT
                ================================================= */

                <View
                  style={
                    styles.pdfContainer
                  }
                >

                  <View
                    style={
                      styles.pdfIcon
                    }
                  >

                    <Ionicons
                      name={
                        isPdfReceipt(
                          expense.receipt_path
                        )
                          ? "document-text"
                          : "document-attach"
                      }
                      size={45}
                      color="#DC2626"
                    />

                  </View>


                  <Text
                    style={
                      styles.pdfTitle
                    }
                  >
                    {isPdfReceipt(
                      expense.receipt_path
                    )
                      ? "PDF Receipt"
                      : "Receipt Document"}
                  </Text>


                  <Text
                    style={
                      styles.pdfDescription
                    }
                  >
                    Your receipt is attached
                    {"\n"}
                    to this expense.
                  </Text>


                  <TouchableOpacity
                    style={
                      styles.openReceiptButton
                    }

                    activeOpacity={0.8}

                    onPress={
                      openReceipt
                    }
                  >

                    <Ionicons
                      name="open-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.openReceiptText
                      }
                    >
                      Open Receipt
                    </Text>

                  </TouchableOpacity>

                </View>

              )}

            </View>

          ) : (

            /* =================================================
               NO RECEIPT
            ================================================= */

            <View
              style={
                styles.noReceipt
              }
            >

              <View
                style={
                  styles.noReceiptIcon
                }
              >

                <Ionicons
                  name="receipt-outline"
                  size={40}
                  color="#94A3B8"
                />

              </View>


              <Text
                style={
                  styles.noReceiptTitle
                }
              >
                No Receipt Attached
              </Text>


              <Text
                style={
                  styles.noReceiptText
                }
              >
                No receipt was uploaded
                {"\n"}
                for this expense.
              </Text>

            </View>

          )}

        </View>


        {/* ====================================================
            MANAGER REMARKS
        ==================================================== */}

        <View
          style={styles.card}
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Manager Remarks
          </Text>


          <Text
            style={
              styles.remarks
            }
          >
            {expense.manager_remarks ||
              expense.remarks ||
              "Waiting for manager approval."}
          </Text>

        </View>


      </ScrollView>

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
      backgroundColor:
        "#F4F7FB",
    },


    // ========================================================
    // HEADER
    // ========================================================

    header: {
      backgroundColor:
        "#2563EB",

      paddingTop: 55,

      paddingBottom: 20,

      paddingHorizontal: 20,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      borderBottomLeftRadius:
        25,

      borderBottomRightRadius:
        25,
    },


    headerBack: {
      width: 42,

      height: 42,

      borderRadius: 21,

      backgroundColor:
        "rgba(255,255,255,0.15)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },


    headerTitle: {
      color: "#FFFFFF",

      fontSize: 22,

      fontWeight: "bold",
    },


    // ========================================================
    // CONTENT
    // ========================================================

    content: {
      padding: 20,

      paddingBottom: 40,
    },


    // ========================================================
    // CARD
    // ========================================================

    card: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 18,

      padding: 18,

      marginBottom: 18,

      elevation: 3,

      shadowColor: "#000",

      shadowOpacity: 0.05,

      shadowRadius: 6,

      shadowOffset: {
        width: 0,

        height: 3,
      },
    },


    // ========================================================
    // BASIC DETAILS
    // ========================================================

    title: {
      fontSize: 22,

      fontWeight: "bold",

      color: "#111827",

      marginBottom: 20,
    },


    row: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom: 15,
    },


    label: {
      color: "#6B7280",

      fontSize: 16,
    },


    value: {
      fontWeight: "600",

      fontSize: 16,

      color: "#111827",

      maxWidth: "60%",

      textAlign: "right",
    },


    amount: {
      color: "#2563EB",

      fontWeight: "800",
    },


    // ========================================================
    // STATUS
    // ========================================================

    status: {
      paddingHorizontal: 12,

      paddingVertical: 5,

      borderRadius: 20,
    },


    statusText: {
      color: "#FFFFFF",

      fontWeight: "bold",

      fontSize: 12,
    },


    // ========================================================
    // SECTIONS
    // ========================================================

    sectionTitle: {
      fontSize: 18,

      fontWeight: "bold",

      color: "#111827",

      marginBottom: 4,
    },


    description: {
      color: "#4B5563",

      lineHeight: 22,

      fontSize: 15,
    },


    // ========================================================
    // RECEIPT HEADER
    // ========================================================

    receiptHeader: {
      marginBottom: 15,
    },


    receiptTitleRow: {
      flexDirection: "row",

      alignItems: "center",
    },


    receiptIcon: {
      width: 44,

      height: 44,

      borderRadius: 12,

      backgroundColor:
        "#EFF6FF",

      justifyContent: "center",

      alignItems: "center",

      marginRight: 12,
    },


    receiptSubTitle: {
      color: "#94A3B8",

      fontSize: 12,

      marginTop: 2,
    },


    // ========================================================
    // IMAGE RECEIPT
    // ========================================================

    receiptImage: {
      width: "100%",

      height: 300,

      borderRadius: 14,

      backgroundColor:
        "#F8FAFC",

      borderWidth: 1,

      borderColor:
        "#E2E8F0",
    },


    tapToOpen: {
      height: 42,

      marginTop: 8,

      borderRadius: 10,

      backgroundColor:
        "#EFF6FF",

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",
    },


    tapToOpenText: {
      color: "#2563EB",

      fontSize: 14,

      fontWeight: "700",

      marginLeft: 6,
    },


    // ========================================================
    // PDF RECEIPT
    // ========================================================

    pdfContainer: {
      minHeight: 230,

      borderRadius: 16,

      backgroundColor:
        "#F8FAFC",

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      justifyContent:
        "center",

      alignItems:
        "center",

      padding: 20,
    },


    pdfIcon: {
      width: 80,

      height: 80,

      borderRadius: 20,

      backgroundColor:
        "#FEF2F2",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginBottom: 12,
    },


    pdfTitle: {
      fontSize: 17,

      fontWeight: "800",

      color: "#111827",

      marginBottom: 5,
    },


    pdfDescription: {
      fontSize: 13,

      color: "#64748B",

      textAlign: "center",

      marginBottom: 18,
    },


    openReceiptButton: {
      height: 48,

      paddingHorizontal: 22,

      borderRadius: 12,

      backgroundColor:
        "#2563EB",

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",
    },


    openReceiptText: {
      color: "#FFFFFF",

      fontSize: 15,

      fontWeight: "700",

      marginLeft: 8,
    },


    // ========================================================
    // NO RECEIPT
    // ========================================================

    noReceipt: {
      minHeight: 180,

      borderRadius: 16,

      backgroundColor:
        "#F8FAFC",

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      justifyContent:
        "center",

      alignItems:
        "center",

      padding: 20,
    },


    noReceiptIcon: {
      width: 70,

      height: 70,

      borderRadius: 35,

      backgroundColor:
        "#F1F5F9",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginBottom: 12,
    },


    noReceiptTitle: {
      fontSize: 16,

      fontWeight: "700",

      color: "#475569",

      marginBottom: 5,
    },


    noReceiptText: {
      color: "#94A3B8",

      fontSize: 13,

      textAlign: "center",
    },


    // ========================================================
    // REMARKS
    // ========================================================

    remarks: {
      color: "#374151",

      lineHeight: 22,

      fontSize: 15,
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

      backgroundColor:
        "#F4F7FB",

      padding: 30,
    },


    loadingText: {
      marginTop: 12,

      color: "#64748B",

      fontSize: 15,
    },


    // ========================================================
    // NOT FOUND
    // ========================================================

    notFoundTitle: {
      marginTop: 15,

      fontSize: 20,

      fontWeight: "700",

      color: "#111827",
    },


    backButtonLarge: {
      marginTop: 20,

      backgroundColor:
        "#2563EB",

      paddingHorizontal: 25,

      paddingVertical: 12,

      borderRadius: 10,
    },


    backButtonText: {
      color: "#FFFFFF",

      fontWeight: "700",

      fontSize: 15,
    },

  });