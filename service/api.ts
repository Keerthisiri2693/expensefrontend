import AsyncStorage from "@react-native-async-storage/async-storage";


import * as FileSystem from "expo-file-system/legacy";

import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";








const API_BASE_URL = "http://192.168.1.7:8000";

// ============================================================
// LOGIN
// ============================================================

export const loginUser = async (
  email: string,
  password: string
) => {
  try {
    console.log(
      "🔵 Login API:",
      `${API_BASE_URL}/login`
    );

    const response = await fetch(
      `${API_BASE_URL}/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      }
    );

    console.log("🟢 RESPONSE RECEIVED");
    console.log(
      "📡 HTTP STATUS:",
      response.status
    );

    const data = await response.json();

    console.log(
      "📦 RESPONSE DATA:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.detail ||
        data.message ||
        "Invalid email or password"
      );
    }

    return data;

  } catch (error: any) {

    console.log(
      "❌ LOGIN API ERROR:",
      error
    );

    throw new Error(
      error?.message ||
      "Unable to connect to server"
    );
  }
};


// ============================================================
// REGISTER
// ============================================================

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  employee_id: string
) => {
  try {

    console.log(
      "🔵 Register API:",
      `${API_BASE_URL}/register`
    );

    const response = await fetch(
      `${API_BASE_URL}/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
          employee_id: employee_id.trim(),
        }),
      }
    );

    console.log(
      "📡 REGISTER STATUS:",
      response.status
    );

    const data = await response.json();

    console.log(
      "📦 REGISTER RESPONSE:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.detail ||
        data.message ||
        "Registration failed"
      );
    }

    return data;

  } catch (error: any) {

    console.log(
      "❌ REGISTER API ERROR:",
      error
    );

    throw new Error(
      error?.message ||
      "Unable to connect to server"
    );
  }
};


// ============================================================
// CREATE EXPENSE
// ============================================================



export const createExpense = async (
  userId: number,
  expense: {
    title: string;
    category: string;
    amount: number;
    expense_date: string;
    description?: string;
    receipt_path?: string;
  }
) => {
  try {
    console.log(
      "🔵 CREATE EXPENSE API:",
      `${API_BASE_URL}/expenses`
    );

    const token =
      await AsyncStorage.getItem("access_token");

    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again."
      );
    }

    console.log("👤 User ID:", userId);

    console.log(
      "📎 Receipt Path:",
      expense.receipt_path
    );

    const requestBody = {
      title: expense.title.trim(),

      category: expense.category.trim(),

      amount: expense.amount,

      expense_date: expense.expense_date,

      description:
        expense.description?.trim() || null,

      receipt_path:
        expense.receipt_path || null,
    };

    console.log(
      "📤 REQUEST BODY:",
      requestBody
    );

    const response = await fetch(
      `${API_BASE_URL}/expenses?user_id=${userId}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify(
          requestBody
        ),
      }
    );

    console.log(
      "📡 EXPENSE STATUS:",
      response.status
    );

    const data =
      await response.json();

    console.log(
      "📦 EXPENSE RESPONSE:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.detail ||
        data.message ||
        "Failed to create expense"
      );
    }

    return data;

  } catch (error: any) {

    console.log(
      "❌ CREATE EXPENSE ERROR:",
      error
    );

    throw new Error(
      error?.message ||
      "Unable to connect to server"
    );
  }
};

// ============================================================
// GET EXPENSES
// ============================================================

export const getExpenses = async (
  userId: number
) => {
  try {
    console.log(
      "🔵 GET EXPENSES API:",
      `${API_BASE_URL}/expenses`
    );

    console.log(
      "👤 User ID:",
      userId
    );

    // =========================
    // GET TOKEN
    // =========================

    const token =
      await AsyncStorage.getItem(
        "access_token"
      );

    console.log(
      "🔑 TOKEN EXISTS:",
      !!token
    );

    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again."
      );
    }

    // =========================
    // API REQUEST
    // =========================

    const response = await fetch(
      `${API_BASE_URL}/expenses?user_id=${userId}`,
      {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      "📡 GET EXPENSES STATUS:",
      response.status
    );

    const data =
      await response.json();

    console.log(
      "📦 GET EXPENSES RESPONSE:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.detail ||
        data.message ||
        "Failed to load expenses"
      );
    }

    return data;

  } catch (error: any) {

    console.log(
      "❌ GET EXPENSES ERROR:",
      error
    );

    throw new Error(
      error?.message ||
        "Unable to load expenses"
    );
  }
};

// ============================================================
// GET SINGLE EXPENSE
// ============================================================

export const getExpenseById = async (
  expenseId: number
) => {
  try {
    console.log(
      "🔵 GET EXPENSE API:",
      `${API_BASE_URL}/expenses/${expenseId}`
    );

    // ========================================================
    // GET TOKEN
    // ========================================================

    const token =
      await AsyncStorage.getItem(
        "access_token"
      );

    console.log(
      "🎫 TOKEN EXISTS:",
      !!token
    );

    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again."
      );
    }

    // ========================================================
    // API REQUEST
    // ========================================================

    const response = await fetch(
      `${API_BASE_URL}/expenses/${expenseId}`,
      {
        method: "GET",

        headers: {
          "Content-Type": "application/json",

          // IMPORTANT
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      "📡 EXPENSE DETAILS STATUS:",
      response.status
    );

    const data =
      await response.json();

    console.log(
      "📦 EXPENSE DETAILS:",
      data
    );

    // ========================================================
    // ERROR
    // ========================================================

    if (!response.ok) {

      if (response.status === 401) {

        throw new Error(
          "Session expired. Please login again."
        );
      }

      throw new Error(
        data.detail ||
        data.message ||
        "Failed to load expense"
      );
    }

    return data;

  } catch (error: any) {

    console.log(
      "❌ GET EXPENSE ERROR:",
      error
    );

    throw new Error(
      error?.message ||
      "Unable to load expense"
    );
  }
};

// ============================================================
// DELETE EXPENSE
// ============================================================

export const deleteExpense = async (
  expenseId: number,
  userId: number
) => {

  try {

    console.log(
      "🔵 DELETE EXPENSE:",
      expenseId
    );

    const response = await fetch(
      `${API_BASE_URL}/expenses/${expenseId}?user_id=${userId}`,
      {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    console.log(
      "📦 DELETE RESPONSE:",
      data
    );

    if (!response.ok) {

      throw new Error(
        data.detail ||
        data.message ||
        "Failed to delete expense"
      );
    }

    return data;

  } catch (error: any) {

    console.log(
      "❌ DELETE EXPENSE ERROR:",
      error
    );

    throw new Error(
      error?.message ||
      "Unable to connect to server"
    );
  }
};





// ============================================================
// UPLOAD RECEIPT
// ============================================================


export const uploadReceipt = async (
  uri: string,
  fileName: string,
  mimeType: string,
) => {
  try {
    console.log("📤 UPLOAD RECEIPT START");
    console.log("📎 Original URI:", uri);
    console.log("📄 File Name:", fileName);
    console.log("📄 MIME TYPE:", mimeType);

    // =====================================================
    // TOKEN
    // =====================================================

    const token =
      await AsyncStorage.getItem("access_token");

    console.log(
      "🔐 Token available:",
      token ? "YES" : "NO"
    );

    if (!token) {
      throw new Error(
        "Login token not found. Please login again."
      );
    }

    // =====================================================
    // READ LOCAL FILE
    // =====================================================

    console.log(
      "📖 Reading selected file..."
    );

    const localResponse =
      await fetch(uri);

    console.log(
      "📖 Local file response:",
      localResponse.status
    );

    if (!localResponse.ok) {
      throw new Error(
        `Unable to read selected file: ${localResponse.status}`
      );
    }

    const originalBlob =
      await localResponse.blob();

    console.log(
      "📦 ORIGINAL BLOB SIZE:",
      originalBlob.size
    );

    console.log(
      "📦 ORIGINAL BLOB TYPE:",
      originalBlob.type
    );

    if (!originalBlob.size) {
      throw new Error(
        "Selected file is empty."
      );
    }

    // =====================================================
    // FORCE MIME TYPE
    // =====================================================

    const uploadBlob = new Blob(
      [originalBlob],
      {
        type: mimeType,
      }
    );

    console.log(
      "📦 UPLOAD BLOB SIZE:",
      uploadBlob.size
    );

    console.log(
      "📦 UPLOAD BLOB TYPE:",
      uploadBlob.type
    );

    // =====================================================
    // FORMDATA
    // =====================================================

    const formData = new FormData();

    formData.append(
      "file",
      uploadBlob,
      fileName
    );

    console.log(
      "📦 FormData created"
    );

    console.log(
      "📡 Uploading directly to FastAPI..."
    );

    // =====================================================
    // FASTAPI
    // =====================================================

    const response =
      await expoFetch(
        "http://192.168.1.7:8000/expenses/upload-receipt",
        {
          method: "POST",

          headers: {
            Accept: "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );

    console.log(
      "📥 UPLOAD STATUS:",
      response.status
    );

    const responseText =
      await response.text();

    console.log(
      "📥 UPLOAD RESPONSE:",
      responseText
    );

    let result;

    try {
      result =
        JSON.parse(responseText);
    } catch {
      throw new Error(
        `Invalid server response: ${responseText}`
      );
    }

    // =====================================================
    // HTTP ERROR
    // =====================================================

    if (!response.ok) {
      throw new Error(
        result?.detail ||
        result?.message ||
        `Upload failed: ${response.status}`
      );
    }

    // =====================================================
    // API ERROR
    // =====================================================

    if (!result.success) {
      throw new Error(
        result.message ||
        "Receipt upload failed."
      );
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    console.log(
      "===================================="
    );

    console.log(
      "✅ RECEIPT UPLOAD SUCCESS"
    );

    console.log(
      "📄 Server Filename:",
      result.filename
    );

    console.log(
      "🔗 Receipt Path:",
      result.receipt_path
    );

    console.log(
      "===================================="
    );

    return result;

  } catch (error: any) {

    console.log(
      "❌ UPLOAD RECEIPT ERROR:",
      error
    );

    throw error;
  }
};


export const uploadCameraReceipt = async (
  uri: string,
  fileName: string,
  mimeType: string,
) => {
  try {
    console.log(
      "📤 UPLOAD CAMERA RECEIPT START"
    );

    console.log(
      "📎 Camera URI:",
      uri
    );

    console.log(
      "📄 File Name:",
      fileName
    );

    console.log(
      "📄 MIME TYPE:",
      mimeType
    );

    const token =
      await AsyncStorage.getItem(
        "access_token"
      );

    console.log(
      "🔐 Token available:",
      token ? "YES" : "NO"
    );

    if (!token) {
      throw new Error(
        "Login token not found. Please login again."
      );
    }

    console.log(
      "📡 Uploading camera image..."
    );

    const response =
      await FileSystem.uploadAsync(
        "http://192.168.1.7:8000/expenses/upload-receipt",
        uri,
        {
          httpMethod: "POST",

          uploadType:
            FileSystem.FileSystemUploadType
              .MULTIPART,

          fieldName: "file",

          mimeType: mimeType,

          headers: {
            Accept: "application/json",

            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    console.log(
      "📥 CAMERA UPLOAD STATUS:",
      response.status
    );

    console.log(
      "📥 CAMERA UPLOAD RESPONSE:",
      response.body
    );

    let result;

    try {
      result =
        JSON.parse(response.body);
    } catch {
      throw new Error(
        "Invalid server response."
      );
    }

    if (
      response.status < 200 ||
      response.status >= 300
    ) {
      throw new Error(
        result?.detail ||
        result?.message ||
        `Upload failed: ${response.status}`
      );
    }

    if (!result.success) {
      throw new Error(
        result.message ||
          "Camera receipt upload failed."
      );
    }

    console.log(
      "✅ CAMERA UPLOAD SUCCESS"
    );

    return result;

  } catch (error: any) {
    console.log(
      "❌ UPLOAD CAMERA RECEIPT ERROR:",
      error
    );

    throw error;
  }
};



// reportscreen

export const getReportSummary = async (
  period: string
) => {
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
    `http://192.168.1.7:8000/reports/summary?period=${encodeURIComponent(
      period
    )}`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",

        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  const text =
    await response.text();

  let result;

  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid server response: ${text}`
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.detail ||
      "Unable to load report."
    );
  }

  return result;
};




// ============================================================
// GET PROFILE
// ============================================================

export const getProfile = async () => {
  try {

    const token =
      await AsyncStorage.getItem(
        "access_token"
      );

    if (!token) {
      throw new Error(
        "Login token not found. Please login again."
      );
    }

    console.log(
      "👤 GET PROFILE"
    );

    const response =
      await fetch(
        `${API_BASE_URL}/profile`,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const text =
      await response.text();

    console.log(
      "📥 PROFILE STATUS:",
      response.status
    );

    console.log(
      "📥 PROFILE RESPONSE:",
      text
    );

    let result;

    try {
      result =
        JSON.parse(text);
    } catch {
      throw new Error(
        `Invalid server response: ${text}`
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.detail ||
        result?.message ||
        "Unable to load profile."
      );
    }

    return result;

  } catch (error: any) {

    console.log(
      "❌ GET PROFILE ERROR:",
      error
    );

    throw error;
  }
};


// ============================================================
// UPDATE PROFILE
// ============================================================

export const updateProfile = async (
  name: string
) => {

  try {

    const token =
      await AsyncStorage.getItem(
        "access_token"
      );

    if (!token) {
      throw new Error(
        "Login token not found. Please login again."
      );
    }

    console.log(
      "✏️ UPDATE PROFILE"
    );

    console.log(
      "👤 NAME:",
      name
    );


    const response =
      await fetch(
        `${API_BASE_URL}/profile`,
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

          body: JSON.stringify({
            name:
              name.trim(),
          }),
        }
      );


    const text =
      await response.text();

    console.log(
      "📥 UPDATE PROFILE STATUS:",
      response.status
    );

    console.log(
      "📥 UPDATE PROFILE RESPONSE:",
      text
    );


    let result;

    try {

      result =
        JSON.parse(text);

    } catch {

      throw new Error(
        `Invalid server response: ${text}`
      );
    }


    if (!response.ok) {

      throw new Error(
        result?.detail ||
        result?.message ||
        "Unable to update profile."
      );
    }


    return result;

  } catch (error: any) {

    console.log(
      "❌ UPDATE PROFILE ERROR:",
      error
    );

    throw error;
  }
};