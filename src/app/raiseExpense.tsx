import React, { useState,useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";


import {
  useTheme,
} from "../../context/ThemeContext";
import {
  useLocalSearchParams,
} from "expo-router";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  createExpense as createExpenseApi,
  uploadReceipt, uploadCameraReceipt
} from "../../service/api";

import { router } from "expo-router";


export default function RaiseExpenseScreen() {

  // ============================================================
  // FORM
  // ============================================================

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] =
  useState(false);
 const [receiptPath, setReceiptPath] = useState<string | null>(null);
  const [expenseId, setExpenseId] = useState<number | null>(null);

  const { id } =
  useLocalSearchParams<{
    id?: string;
  }>();

 

   const {
    darkMode,
    colors,
    } = useTheme();


  const API_BASE_URL = "https://expensebackend-tdxz.onrender.com";

  // ============================================================
  // RECEIPT
  // ============================================================

  const [fileName, setFileName] = useState("");

  
  const [receiptUri, setReceiptUri] = useState("");


  //
  const [uploadedReceiptPath, setUploadedReceiptPath] =
    useState("");


  const [uploadingReceipt, setUploadingReceipt] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const isEditMode = !!id;

    useEffect(() => {

  if (!id) {
    return;
  }

  loadExpenseForEdit(
    String(id)
  );

}, [id]);


const convertDateToApiFormat = (date: string) => {
  if (!date) return "";

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // DD/MM/YYYY → YYYY-MM-DD
  const parts = date.split("/");

  if (parts.length === 3) {
    const [day, month, year] = parts;

    return `${year}-${month.padStart(
      2,
      "0"
    )}-${day.padStart(2, "0")}`;
  }

  return date;
};



const loadExpenseForEdit = async (
  expenseId: string
) => {
  try {
    setLoading(true);

    console.log(
      "✏️ EDIT EXPENSE ID:",
      expenseId
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

    const response = await fetch(
      `${API_BASE_URL}/expenses/${expenseId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result =
      await response.json();

    console.log(
      "📥 EDIT EXPENSE:",
      result
    );

    if (!response.ok) {
      throw new Error(
        result?.detail ||
          result?.message ||
          "Unable to load expense."
      );
    }

    const expense =
      result?.expense ||
      result?.data ||
      result;

    // ==========================================
    // FILL FORM
    // ==========================================

    setTitle(
      expense.title || ""
    );

    setCategory(
      expense.category || ""
    );

    setAmount(
      String(
        expense.amount ?? ""
      )
    );

    setDescription(
      expense.description || ""
    );

    // ==========================================
    // DATE
    // ==========================================

    if (expense.expense_date) {
      const date = new Date(
        expense.expense_date
      );

      const day = String(
        date.getDate()
      ).padStart(2, "0");

      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");

      const year =
        date.getFullYear();

      setExpenseDate(
        `${day}/${month}/${year}`
      );
    }

  } catch (error: any) {
    console.log(
      "❌ LOAD EDIT ERROR:",
      error
    );

    Alert.alert(
      "Error",
      error?.message ||
        "Unable to load expense."
    );

  } finally {
    setLoading(false);
  }
};
  // ============================================================
  // CHOOSE FILE
  // ============================================================

const chooseFile = async () => {
  try {
    console.log("📂 OPENING DOCUMENT PICKER...");

    const result =
      await DocumentPicker.getDocumentAsync({
        type: [
          "image/*",
          "application/pdf",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

    if (result.canceled) {
      console.log("📂 FILE PICKER CANCELLED");
      return;
    }

    const asset = result.assets[0];

    const name =
      asset.name ||
      `receipt_${Date.now()}`;

    const mimeType =
      asset.mimeType ||
      (
        name.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : "image/jpeg"
      );

    console.log(
      "📄 FILE NAME:",
      name
    );

    console.log(
      "📄 LOCAL FILE URI:",
      asset.uri
    );

    console.log(
      "📄 MIME TYPE:",
      mimeType
    );

    // =====================================================
    // SAVE LOCAL DETAILS
    // =====================================================

    setFileName(name);

    setReceiptUri(asset.uri);

    setUploadedReceiptPath("");

    // =====================================================
    // START UPLOAD
    // =====================================================

    setUploadingReceipt(true);

    Alert.alert(
      "Uploading Receipt",
      "Please wait while the receipt is uploaded."
    );

    try {
      const upload =
        await uploadReceipt(
          asset.uri,
          name,
          mimeType
        );

      console.log(
        "✅ RECEIPT UPLOAD SUCCESS:",
        upload
      );

      if (
        !upload ||
        !upload.receipt_path
      ) {
        throw new Error(
          "Server did not return receipt path."
        );
      }

      setUploadedReceiptPath(
        upload.receipt_path
      );

      console.log(
        "🔗 SERVER RECEIPT PATH:",
        upload.receipt_path
      );

      Alert.alert(
        "Success",
        "Receipt uploaded successfully."
      );

    } catch (error: any) {

      console.log(
        "❌ RECEIPT UPLOAD FAILED:",
        error
      );

      setFileName("");
      setReceiptUri("");
      setUploadedReceiptPath("");

      Alert.alert(
        "Upload Failed",
        error?.message ||
          "Unable to upload receipt."
      );

    } finally {
      setUploadingReceipt(false);
    }

  } catch (error: any) {

    console.log(
      "❌ FILE PICKER ERROR:",
      error
    );

    setUploadingReceipt(false);

    Alert.alert(
      "Error",
      error?.message ||
        "Unable to select receipt."
    );
  }
};

  // ============================================================
  // SCAN RECEIPT
  // ============================================================

const scanReceipt = async () => {
  try {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission",
        "Camera permission is required."
      );
      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    console.log(
      "📸 CAMERA RECEIPT URI:",
      asset.uri
    );

    const name =
      asset.fileName ||
      `receipt_${Date.now()}.jpg`;

    const mimeType =
      asset.mimeType ||
      "image/jpeg";

    console.log(
      "📄 CAMERA FILE NAME:",
      name
    );

    console.log(
      "📄 CAMERA MIME TYPE:",
      mimeType
    );

    setFileName(name);
    setReceiptUri(asset.uri);
    setUploadedReceiptPath("");

    setUploadingReceipt(true);

    try {
      console.log(
        "📤 CAMERA UPLOAD START"
      );

      const upload =
        await uploadCameraReceipt(
          asset.uri,
          name,
          mimeType
        );

      console.log(
        "✅ CAMERA RECEIPT UPLOAD:",
        upload
      );

      if (
        !upload ||
        !upload.receipt_path
      ) {
        throw new Error(
          "Server did not return receipt path."
        );
      }

      setUploadedReceiptPath(
        upload.receipt_path
      );

      console.log(
        "🔗 SERVER RECEIPT PATH:",
        upload.receipt_path
      );

      Alert.alert(
        "Success",
        "Receipt uploaded successfully."
      );

    } catch (error: any) {
      console.log(
        "❌ CAMERA UPLOAD ERROR:",
        error
      );

      setFileName("");
      setReceiptUri("");
      setUploadedReceiptPath("");

      Alert.alert(
        "Upload Failed",
        error?.message ||
          "Unable to upload receipt."
      );

    } finally {
      setUploadingReceipt(false);
    }

  } catch (error: any) {
    console.log(
      "❌ CAMERA ERROR:",
      error
    );

    setUploadingReceipt(false);

    Alert.alert(
      "Error",
      error?.message ||
        "Unable to capture receipt."
    );
  }
};

  // ============================================================
  // SUBMIT EXPENSE
  // ============================================================


  const submitExpense = async () => {
  try {
    setLoading(true);

    const token =
      await AsyncStorage.getItem(
        "access_token"
      );

    if (!token) {
      throw new Error(
        "Login token not found."
      );
    }

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!title.trim()) {
      Alert.alert(
        "Validation",
        "Please enter expense title."
      );
      return;
    }

    if (!category) {
      Alert.alert(
        "Validation",
        "Please select a category."
      );
      return;
    }

    if (!amount || Number(amount) <= 0) {
      Alert.alert(
        "Validation",
        "Please enter a valid amount."
      );
      return;
    }

    // ==========================================
    // PAYLOAD
    // ==========================================

    const apiExpenseDate =
  convertDateToApiFormat(expenseDate);

console.log(
  "📅 DISPLAY DATE:",
  expenseDate
);

console.log(
  "📅 API DATE:",
  apiExpenseDate
);

const expenseData = {
  title: title.trim(),
  category: category.trim(),
  amount: Number(amount),
  expense_date: apiExpenseDate,
  description:
    description?.trim() || undefined,
  receipt_path:
    receiptPath || undefined,
};

    console.log(
      "📦 EXPENSE DATA:",
      expenseData
    );

    // ==========================================
    // EDIT → PUT
    // ==========================================

    if (id) {
      console.log(
        "✏️ UPDATING EXPENSE:",
        String(id)
      );

      const response = await fetch(
        `${API_BASE_URL}/expenses/${String(id)}`,
        {
          method: "PUT",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            expenseData
          ),
        }
      );

      const result =
        await response.json();

      console.log(
        "📥 UPDATE RESPONSE:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.detail ||
            result?.message ||
            "Unable to update expense."
        );
      }

      Alert.alert(
        "Success",
        "Expense updated successfully.",
        [
          {
            text: "OK",
            // Expo Router:
            onPress: () => router.back(),
          },
        ]
      );

      return;
    }

    // ==========================================
    // CREATE → POST
    // ==========================================

    console.log(
      "🆕 CREATING EXPENSE"
    );

    const response = await fetch(
      `${API_BASE_URL}/expenses`,
      {
        method: "POST",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify(
          expenseData
        ),
      }
    );

    const result =
      await response.json();

    console.log(
      "📥 CREATE RESPONSE:",
      result
    );

    if (!response.ok) {
      throw new Error(
        result?.detail ||
          result?.message ||
          "Unable to submit expense."
      );
    }

    Alert.alert(
      "Success",
      "Expense submitted successfully.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );

  } catch (error: any) {
    console.log(
      "❌ SUBMIT EXPENSE ERROR:",
      error
    );

    Alert.alert(
      "Error",
      error?.message ||
        "Unable to save expense."
    );

  } finally {
    setLoading(false);
  }
};

  // ============================================================
  // UI
  // ============================================================

  return (
<SafeAreaView
  style={[
    styles.container,
    {
      backgroundColor: colors.background,
    },
  ]}
  edges={["bottom"]}
>

       

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
        style={[
        styles.header,
        {
         backgroundColor: colors.header,
        },
        ]}
        >
          

        <View
              style={{
                flex: 1,
                marginLeft: 16,
              }}
            >

             <Text style={styles.headerTitle}>
  {isEditMode
    ? "Edit Expense"
    : "Raise Expense"}
</Text>

              <Text
                style={
                  styles.headerSubtitle
                }
              >
                Submit a new expense request
              </Text>

            </View>

          

        </View>


        {/* ====================================================
            TITLE
        ==================================================== */}

        <Text
          style={styles.label}
        >
          Expense Title
        </Text>


        <TextInput
          style={styles.input}
          placeholder="Enter title"
          value={title}
          onChangeText={setTitle}
          editable={
            !loading &&
            !uploadingReceipt
          }
        />


        {/* ====================================================
            CATEGORY
        ==================================================== */}

        <Text
          style={styles.label}
        >
          Category
        </Text>


        <TextInput
          style={styles.input}
          placeholder="Travel / Food / Hotel"
          value={category}
          onChangeText={setCategory}
          editable={
            !loading &&
            !uploadingReceipt
          }
        />


        {/* ====================================================
            AMOUNT
        ==================================================== */}

        <Text
          style={styles.label}
        >
          Amount
        </Text>


        <TextInput
          style={styles.input}
          placeholder="₹0.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          editable={
            !loading &&
            !uploadingReceipt
          }
        />


        {/* ====================================================
            DATE
        ==================================================== */}

        <Text
          style={styles.label}
        >
          Expense Date
        </Text>


    <TouchableOpacity
  activeOpacity={0.8}
  disabled={
    loading ||
    uploadingReceipt
  }
  onPress={() => {
    setShowDatePicker(true);
  }}
>
  <View style={styles.dateInputWrapper}>

    <TextInput
      style={styles.input}
      placeholder="DD/MM/YYYY"
      placeholderTextColor="#9CA3AF"
      value={expenseDate}
      editable={false}
      pointerEvents="none"
    />

    <Ionicons
      name="calendar-outline"
      size={21}
      color="#6B7280"
      style={styles.dateIcon}
    />

  </View>
</TouchableOpacity>

{showDatePicker && (
  <DateTimePicker
    value={
      expenseDate
        ? (() => {
            const [
              day,
              month,
              year,
            ] =
              expenseDate.split("/");

            return new Date(
              Number(year),
              Number(month) - 1,
              Number(day)
            );
          })()
        : new Date()
    }
    mode="date"
    display="default"
    maximumDate={new Date()}
    onChange={(
      event,
      selectedDate
    ) => {

      setShowDatePicker(false);

      if (
        event.type === "dismissed" ||
        !selectedDate
      ) {
        return;
      }

      const day =
        String(
          selectedDate.getDate()
        ).padStart(2, "0");

      const month =
        String(
          selectedDate.getMonth() + 1
        ).padStart(2, "0");

      const year =
        selectedDate.getFullYear();

      setExpenseDate(
        `${day}/${month}/${year}`
      );
    }}
  />
)}


{showDatePicker && (
  <DateTimePicker
    value={
      expenseDate
        ? new Date(expenseDate)
        : new Date()
    }
    mode="date"
    display="default"
    maximumDate={new Date()}
    onChange={(
      event,
      selectedDate
    ) => {

      setShowDatePicker(false);

      if (
        event.type === "dismissed" ||
        !selectedDate
      ) {
        return;
      }

      const day =
        String(
          selectedDate.getDate()
        ).padStart(2, "0");

      const month =
        String(
          selectedDate.getMonth() + 1
        ).padStart(2, "0");

      const year =
        selectedDate.getFullYear();

      const formattedDate =
        `${day}/${month}/${year}`;

      setExpenseDate(
        formattedDate
      );
    }}
  />
)}


        {/* ====================================================
            DESCRIPTION
        ==================================================== */}

        <Text
          style={styles.label}
        >
          Description
        </Text>


        <TextInput
          style={[
            styles.input,
            styles.textArea,
          ]}
          multiline
          numberOfLines={5}
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          editable={
            !loading &&
            !uploadingReceipt
          }
        />


        {/* ====================================================
            RECEIPT
        ==================================================== */}

        <Text
          style={styles.label}
        >
          Receipt
        </Text>


        <View
          style={styles.receiptCard}
        >

          <MaterialCommunityIcons
            name="receipt-text"
            size={45}
            color="#2563EB"
          />


          <Text
            style={
              styles.receiptTitle
            }
          >
            Upload Receipt
          </Text>


          <Text
            style={
              styles.receiptSub
            }
          >
            PDF, JPG or PNG
          </Text>


          {/* ==================================================
              CHOOSE FILE
          ================================================== */}

          <TouchableOpacity
            style={
              styles.uploadButton
            }
            onPress={chooseFile}
            disabled={
              loading ||
              uploadingReceipt
            }
          >

            {uploadingReceipt ? (

              <ActivityIndicator
                color="#FFFFFF"
              />

            ) : (

              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.uploadText
                  }
                >
                  Choose File
                </Text>
              </>

            )}

          </TouchableOpacity>


          {/* ==================================================
              CAMERA
          ================================================== */}

          <TouchableOpacity
            style={
              styles.scanButton
            }
            onPress={scanReceipt}
            disabled={
              loading ||
              uploadingReceipt
            }
          >

            <MaterialCommunityIcons
              name="camera-outline"
              size={20}
              color="#2563EB"
            />

            <Text
              style={
                styles.scanText
              }
            >
              Scan Receipt
            </Text>

          </TouchableOpacity>


          {/* ==================================================
              FILE NAME
          ================================================== */}

          {fileName !== "" && (

            <Text
              style={
                styles.fileName
              }
              numberOfLines={2}
            >
              📄 {fileName}
            </Text>

          )}


          {/* ==================================================
              UPLOAD SUCCESS
          ================================================== */}

          {uploadedReceiptPath !== "" && (

            <View
              style={
                styles.uploadedContainer
              }
            >

              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#16A34A"
              />

              <Text
                style={
                  styles.uploadedText
                }
              >
                Receipt uploaded successfully
              </Text>

            </View>

          )}

        </View>


        {/* ====================================================
            SUBMIT
        ==================================================== */}
         

         <TouchableOpacity
  style={[
    styles.submitButton,
    (loading || uploadingReceipt) &&
      styles.submitDisabled,
  ]}
  onPress={submitExpense}
  disabled={loading || uploadingReceipt}
>
  {loading || uploadingReceipt ? (
    <>
      <ActivityIndicator color="#FFFFFF" />

      <Text style={styles.submitText}>
        {uploadingReceipt
          ? "Uploading Receipt..."
          : id
          ? "Updating..."
          : "Submitting..."}
      </Text>
    </>
  ) : (
    <>
      <MaterialCommunityIcons
        name={
          id
            ? "content-save-edit"
            : "send"
        }
        size={22}
        color="#FFFFFF"
      />

      <Text style={styles.submitText}>
        {id
          ? "Update Expense"
          : "Submit Expense"}
      </Text>
    </>
  )}
</TouchableOpacity>

      </ScrollView>

    </SafeAreaView>

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

      paddingTop: 50,

      paddingBottom: 24,

      paddingHorizontal: 20,

      borderBottomLeftRadius:
        25,

      borderBottomRightRadius:
        25,
    },


    headerTitle: {
      color: "#FFFFFF",

      fontSize: 26,

      fontWeight: "bold",
    },


    headerSubtitle: {
      color:
        "rgba(255,255,255,0.8)",

      fontSize: 14,

      marginTop: 5,
    },

    backButton: {
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



    // ========================================================
    // LABEL
    // ========================================================

    label: {
      marginLeft: 15,

      fontSize: 15,

      fontWeight: "600",

      color: "#374151",

      marginBottom: 10,

      marginTop: 10,
    },


    // ========================================================
    // INPUT
    // ========================================================

    input: {
      height: 56,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      marginLeft: 15,

      marginRight: 15,

      paddingHorizontal: 18,

      fontSize: 15,

      color: "#111827",

      marginBottom: 5,
    },


    textArea: {
      height: 120,

      textAlignVertical:
        "top",

      paddingTop: 15,
    },


    // ========================================================
    // RECEIPT CARD
    // ========================================================

    receiptCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 26,

      borderWidth: 2,

      borderStyle: "dashed",

      borderColor:
        "#BFDBFE",

      marginHorizontal: 20,

      marginBottom: 20,

      paddingVertical: 30,

      paddingHorizontal: 20,

      alignItems:
        "center",

      elevation: 6,

      shadowColor: "#000",

      shadowOpacity: 0.06,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,

        height: 5,
      },
    },


    receiptTitle: {
      fontSize: 18,

      fontWeight: "700",

      color: "#111827",

      marginTop: 10,
    },


    receiptSub: {
      marginTop: 5,

      marginBottom: 20,

      fontSize: 13,

      color: "#6B7280",

      textAlign: "center",
    },


    // ========================================================
    // UPLOAD BUTTON
    // ========================================================

    uploadButton: {
      width: "100%",

      height: 54,

      backgroundColor:
        "#2563EB",

      borderRadius: 16,

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginTop: 18,
    },


    uploadText: {
      color: "#FFFFFF",

      fontSize: 15,

      fontWeight: "700",

      marginLeft: 8,
    },


    // ========================================================
    // SCAN BUTTON
    // ========================================================

    scanButton: {
      width: "100%",

      height: 54,

      marginTop: 14,

      borderRadius: 16,

      backgroundColor:
        "#EFF6FF",

      borderWidth: 1,

      borderColor:
        "#2563EB",

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",
    },


    scanText: {
      color: "#2563EB",

      fontSize: 15,

      fontWeight: "700",

      marginLeft: 8,
    },


    // ========================================================
    // FILE NAME
    // ========================================================

    fileName: {
      marginTop: 15,

      color: "#16A34A",

      fontSize: 14,

      fontWeight: "600",

      textAlign: "center",
    },


    // ========================================================
    // UPLOADED STATUS
    // ========================================================

    uploadedContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop: 12,

      paddingHorizontal: 14,

      paddingVertical: 9,

      borderRadius: 12,

      backgroundColor:
        "#F0FDF4",
    },


    uploadedText: {
      marginLeft: 7,

      color: "#16A34A",

      fontSize: 13,

      fontWeight: "700",
    },


    // ========================================================
    // SUBMIT
    // ========================================================

    submitButton: {
      height: 60,

      marginHorizontal: 20,

      marginBottom: 35,

      borderRadius: 18,

      backgroundColor:
        "#2563EB",

      justifyContent:
        "center",

      alignItems:
        "center",

      flexDirection:
        "row",

      elevation: 8,

      shadowColor:
        "#2563EB",

      shadowOpacity:
        0.35,

      shadowRadius:
        12,

      shadowOffset: {
        width: 0,

        height: 6,
      },
    },


    submitDisabled: {
      opacity: 0.7,
    },


    submitText: {
      color: "#FFFFFF",

      fontSize: 17,

      fontWeight: "800",

      marginLeft: 10,
    },


  dateInputWrapper: {
  position: "relative",
  justifyContent: "center",
},


dateIcon: {
  position: "absolute",
  right: 30,
},
  });