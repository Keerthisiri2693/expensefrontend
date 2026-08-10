import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  router,
} from "expo-router";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import * as LocalAuthentication from
  "expo-local-authentication";

import {
  useTheme,
} from "../../context/ThemeContext";

import * as IntentLauncher from "expo-intent-launcher";

import * as SecureStore from
  "expo-secure-store";

import {
  loginUser as loginApi,
} from "../../service/api";


// ============================================================
// SECURE STORAGE KEYS
// ============================================================

const TOKEN_KEY =
  "access_token";

const BIOMETRIC_ENABLED_KEY =
  "biometric_enabled";


// ============================================================
// LOGIN SCREEN
// ============================================================

export default function LoginScreen() {

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    biometricLoading,
    setBiometricLoading,
  ] = useState(false);


   const {
    darkMode,
    colors,
    } = useTheme();


  // ==========================================================
  // CHECK BIOMETRIC LOGIN
  // ==========================================================

  useEffect(() => {

    checkBiometricLogin();

  }, []);


  // ==========================================================
  // CHECK BIOMETRIC
  // ==========================================================

const checkBiometricLogin = async () => {
  try {
    console.log("🔐 CHECKING AUTO BIOMETRIC LOGIN");

    // ====================================================
    // CHECK WHETHER USER ENABLED BIOMETRIC LOGIN
    // ====================================================

    const enabled =
      await AsyncStorage.getItem(
        BIOMETRIC_ENABLED_KEY
      );

    console.log(
      "🔐 BIOMETRIC ENABLED:",
      enabled
    );

    // User has not enabled biometric login
    if (enabled !== "true") {
      console.log(
        "ℹ️ BIOMETRIC LOGIN NOT ENABLED"
      );

      return;
    }

    // ====================================================
    // CHECK SECURE TOKEN
    // ====================================================

    const token =
      await SecureStore.getItemAsync(
        TOKEN_KEY
      );

    console.log(
      "🔐 SECURE TOKEN:",
      token ? "AVAILABLE" : "NOT FOUND"
    );

    if (!token) {
      console.log(
        "ℹ️ NO SECURE TOKEN - NORMAL LOGIN REQUIRED"
      );

      return;
    }

    // ====================================================
    // CHECK USER
    // ====================================================

    const user =
      await AsyncStorage.getItem("user");

    if (!user) {
      console.log(
        "ℹ️ SAVED USER NOT FOUND"
      );

      return;
    }

    // ====================================================
    // CHECK HARDWARE
    // ====================================================

    const hardware =
      await LocalAuthentication.hasHardwareAsync();

    if (!hardware) {
      console.log(
        "❌ BIOMETRIC HARDWARE NOT AVAILABLE"
      );

      return;
    }

    // ====================================================
    // CHECK ENROLLED
    // ====================================================

    const enrolled =
      await LocalAuthentication.isEnrolledAsync();

    if (!enrolled) {
      console.log(
        "❌ BIOMETRIC NOT ENROLLED"
      );

      return;
    }

    // ====================================================
    // AUTOMATIC BIOMETRIC LOGIN
    // ====================================================

    console.log(
      "🔐 STARTING AUTO BIOMETRIC LOGIN..."
    );

    await biometricLogin();

  } catch (error) {

    console.log(
      "❌ AUTO BIOMETRIC CHECK ERROR:",
      error
    );

  }
};

  // ==========================================================
  // ENABLE BIOMETRIC
  // ==========================================================

 const enableBiometricLogin = async () => {
  try {
    console.log(
      "🔐 CHECKING BIOMETRIC SUPPORT"
    );

    // ====================================================
    // HARDWARE
    // ====================================================

    const hasHardware =
      await LocalAuthentication.hasHardwareAsync();

    console.log(
      "🔐 BIOMETRIC HARDWARE:",
      hasHardware
    );

    if (!hasHardware) {
      Alert.alert(
        "Not Available",
        "This device does not support fingerprint or face authentication."
      );

      return false;
    }

    // ====================================================
    // SUPPORTED BIOMETRIC TYPES
    // ====================================================

    const supportedTypes =
      await LocalAuthentication
        .supportedAuthenticationTypesAsync();

    console.log(
      "🔐 SUPPORTED BIOMETRICS:",
      supportedTypes
    );

    // ====================================================
    // ENROLLED
    // ====================================================

    const enrolled =
      await LocalAuthentication.isEnrolledAsync();

    console.log(
      "🔐 BIOMETRIC ENROLLED:",
      enrolled
    );

    if (!enrolled) {
      Alert.alert(
        "Biometric Not Set Up",
        "Please set up a fingerprint or face lock in your phone settings first.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },

          {
            text: "Open Settings",
            onPress: async () => {
              try {
                console.log(
                  "⚙️ OPENING SECURITY SETTINGS..."
                );

                await IntentLauncher.startActivityAsync(
                  IntentLauncher.ActivityAction
                    .SECURITY_SETTINGS
                );

              } catch (error) {
                console.log(
                  "❌ UNABLE TO OPEN SETTINGS:",
                  error
                );

                Alert.alert(
                  "Settings",
                  "Please open your phone's Security settings manually and set up fingerprint or face authentication."
                );
              }
            },
          },
        ]
      );

      return false;
    }

    // ====================================================
    // TEST AUTHENTICATION
    // ====================================================

    console.log(
      "🔐 STARTING BIOMETRIC TEST..."
    );

    const result =
      await LocalAuthentication.authenticateAsync({
        promptMessage:
          "Enable Biometric Login",

        promptDescription:
          "Confirm your identity to enable biometric login",

        cancelLabel:
          "Cancel",

        disableDeviceFallback:
          false,
      });

    console.log(
      "🔐 ENABLE BIOMETRIC RESULT:",
      result
    );

    if (!result.success) {
      console.log(
        "❌ BIOMETRIC ENABLE CANCELLED"
      );

      return false;
    }

    // ====================================================
    // GET CURRENT TOKEN
    // ====================================================

    const token =
      await AsyncStorage.getItem(
        "access_token"
      );

    console.log(
      "🔐 ACCESS TOKEN:",
      token
        ? "AVAILABLE"
        : "NOT FOUND"
    );

    if (!token) {
      Alert.alert(
        "Error",
        "Login token not found. Please login again."
      );

      return false;
    }

    // ====================================================
    // SAVE TOKEN SECURELY
    // ====================================================

    await SecureStore.setItemAsync(
      TOKEN_KEY,
      token
    );

    console.log(
      "🔐 TOKEN SAVED TO SECURE STORE"
    );

    // ====================================================
    // ENABLE FLAG
    // ====================================================

    await AsyncStorage.setItem(
      BIOMETRIC_ENABLED_KEY,
      "true"
    );

    console.log(
      "✅ BIOMETRIC LOGIN ENABLED"
    );

    Alert.alert(
      "Success",
      "Biometric login has been enabled."
    );

    return true;

  } catch (error: any) {

    console.log(
      "❌ ENABLE BIOMETRIC ERROR:",
      error
    );

    Alert.alert(
      "Biometric Error",
      error?.message ||
        "Unable to enable biometric login."
    );

    return false;
  }
};

  // ==========================================================
  // NORMAL LOGIN
  // ==========================================================

  const loginUser =
    async () => {

      // ======================================================
      // VALIDATION
      // ======================================================

      if (!email.trim()) {

        Alert.alert(
          "Validation",
          "Please enter your email"
        );

        return;
      }


      if (!password.trim()) {

        Alert.alert(
          "Validation",
          "Please enter your password"
        );

        return;
      }


      try {

        setLoading(true);


        console.log(
          "🔵 LOGIN START"
        );


        console.log(
          "📧 Email:",
          email.trim()
        );


        // ====================================================
        // API
        // ====================================================

        console.log(
          "📡 Calling login API..."
        );


        const data =
          await loginApi(
            email.trim(),
            password
          );


        console.log(
          "🟢 API RESPONSE RECEIVED"
        );


        console.log(
          "📦 Login Data:",
          data
        );


        // ====================================================
        // CHECK USER
        // ====================================================

        if (!data?.user) {

          console.log(
            "❌ USER DATA NOT RETURNED"
          );


          Alert.alert(
            "Login Error",
            "User information was not returned by the server."
          );


          return;
        }


        // ====================================================
        // SAVE USER
        // ====================================================

        await AsyncStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );


        console.log(
          "💾 USER SAVED:",
          data.user
        );


        // ====================================================
        // SAVE TOKEN - ASYNC STORAGE
        // ====================================================

        if (
          data.access_token
        ) {

          await AsyncStorage.setItem(
            "access_token",
            data.access_token
          );


          console.log(
            "💾 TOKEN SAVED TO ASYNC STORAGE"
          );


          // ==================================================
          // SAVE TOKEN SECURELY
          // ==================================================

          await SecureStore.setItemAsync(
            TOKEN_KEY,
            data.access_token
          );


          console.log(
            "🔐 TOKEN SAVED TO SECURE STORE"
          );

        }


        // ====================================================
        // LOGIN STATUS
        // ====================================================

        await AsyncStorage.setItem(
          "isLoggedIn",
          "true"
        );


        // ====================================================
        // VERIFY USER
        // ====================================================

        const savedUser =
          await AsyncStorage.getItem(
            "user"
          );


        console.log(
          "🔎 SAVED USER:",
          savedUser
        );


        if (!savedUser) {

          throw new Error(
            "Failed to save user information."
          );

        }


        // ====================================================
        // BIOMETRIC OFFER
        // ====================================================

        let biometricEnabled =
          false;


        try {

          const hardware =
            await LocalAuthentication.hasHardwareAsync();


          const enrolled =
            await LocalAuthentication.isEnrolledAsync();


          if (
            hardware &&
            enrolled
          ) {

            const alreadyEnabled =
              await AsyncStorage.getItem(
                BIOMETRIC_ENABLED_KEY
              );


            if (
              alreadyEnabled !== "true"
            ) {

              Alert.alert(
                "Enable Biometric Login?",
                "Use your fingerprint or face next time instead of entering your password.",
                [
                  {
                    text: "Not Now",
                    style: "cancel",

                    onPress: () => {

                      console.log(
                        "ℹ️ BIOMETRIC SKIPPED"
                      );

                      router.replace(
                        "/dashboard"
                      );

                    },
                  },

                  {
                    text: "Enable",

                    onPress:
                      async () => {

                        biometricEnabled =
                          await enableBiometricLogin();

                        console.log(
                          "🔐 BIOMETRIC ENABLE RESULT:",
                          biometricEnabled
                        );


                        router.replace(
                          "/dashboard"
                        );

                      },
                  },
                ]
              );


              return;
            }

          }

        } catch (
          biometricError
        ) {

          console.log(
            "⚠️ BIOMETRIC CHECK ERROR:",
            biometricError
          );

        }


        // ====================================================
        // DASHBOARD
        // ====================================================

        console.log(
          "➡️ GOING TO DASHBOARD"
        );


        router.replace(
          "/dashboard"
        );


      } catch (
        error: any
      ) {

        console.log(
          "❌ LOGIN FAILED:",
          error
        );


        console.log(
          "❌ ERROR MESSAGE:",
          error?.message
        );


        Alert.alert(
          "Login Failed",
          error?.message ||
            "Unable to login. Please check your email and password."
        );


      } finally {

        setLoading(false);

      }

    };


  // ==========================================================
  // MANUAL BIOMETRIC BUTTON
  // ==========================================================

  const biometricLogin =
    async () => {

      try {

        setBiometricLoading(
          true
        );


        // ====================================================
        // CHECK HARDWARE
        // ====================================================

        const hardware =
          await LocalAuthentication.hasHardwareAsync();


        if (!hardware) {

          Alert.alert(
            "Not Available",
            "Biometric authentication is not supported on this device."
          );

          return;
        }


        // ====================================================
        // CHECK ENROLLED
        // ====================================================

        const enrolled =
          await LocalAuthentication.isEnrolledAsync();


        if (!enrolled) {

          Alert.alert(
            "Not Set Up",
            "Please set up fingerprint or face authentication in your phone settings."
          );

          return;
        }


        // ====================================================
        // TOKEN
        // ====================================================

        const token =
          await SecureStore.getItemAsync(
            TOKEN_KEY
          );


        if (!token) {

          Alert.alert(
            "Login Required",
            "Please login with your email and password first."
          );

          return;
        }


        // ====================================================
        // AUTHENTICATE
        // ====================================================

        const result =
          await LocalAuthentication.authenticateAsync(
            {
              promptMessage:
                "Login to Expense Manager",

              promptDescription:
                "Authenticate to continue",

              cancelLabel:
                "Cancel",

              disableDeviceFallback:
                false,
            }
          );


        if (!result.success) {

          console.log(
            "❌ BIOMETRIC LOGIN FAILED:",
            result.error
          );

          return;
        }


        // ====================================================
        // USER
        // ====================================================

        const savedUser =
          await AsyncStorage.getItem(
            "user"
          );


        if (!savedUser) {

          Alert.alert(
            "Login Required",
            "Please login again."
          );

          return;
        }


        await AsyncStorage.setItem(
          "isLoggedIn",
          "true"
        );


        console.log(
          "✅ BIOMETRIC LOGIN SUCCESS"
        );


        router.replace(
          "/dashboard"
        );


      } catch (error: any) {

        console.log(
          "❌ BIOMETRIC LOGIN ERROR:",
          error
        );


        Alert.alert(
          "Biometric Login Failed",
          error?.message ||
            "Unable to login using biometrics."
        );

      } finally {

        setBiometricLoading(
          false
        );

      }

    };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <KeyboardAvoidingView
      style={
        styles.container
      }

      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >

      {/* ====================================================
          TITLE
      ==================================================== */}

      <Text
        style={styles.title}
      >
        Expense Manager
      </Text>


      <Text
        style={styles.subtitle}
      >
        Login to continue
      </Text>


      {/* ====================================================
          EMAIL
      ==================================================== */}

      <Text
        style={styles.label}
      >
        Email Address
      </Text>


      <TextInput
        placeholder="Enter your email"

        keyboardType="email-address"

        autoCapitalize="none"

        autoCorrect={false}

        value={email}

        onChangeText={
          setEmail
        }

        style={
          styles.input
        }

        editable={
          !loading &&
          !biometricLoading
        }
      />


      {/* ====================================================
          PASSWORD
      ==================================================== */}

      <Text
        style={styles.label}
      >
        Password
      </Text>


      <TextInput
        placeholder="Enter your password"

        secureTextEntry

        value={password}

        onChangeText={
          setPassword
        }

        style={
          styles.input
        }

        editable={
          !loading &&
          !biometricLoading
        }
      />


      {/* ====================================================
          LOGIN BUTTON
      ==================================================== */}

      <TouchableOpacity
        style={[
          styles.button,

          loading &&
            styles.buttonDisabled,
        ]}

        onPress={
          loginUser
        }

        disabled={
          loading ||
          biometricLoading
        }

        activeOpacity={0.8}
      >

        {loading ? (

          <ActivityIndicator
            color="#fff"
          />

        ) : (

          <Text
            style={
              styles.buttonText
            }
          >
            Login
          </Text>

        )}

      </TouchableOpacity>


      {/* ====================================================
          BIOMETRIC BUTTON
      ==================================================== */}

      <TouchableOpacity
        style={
          styles.biometricButton
        }

        onPress={
          biometricLogin
        }

        disabled={
          loading ||
          biometricLoading
        }

        activeOpacity={0.8}
      >

        {biometricLoading ? (

          <ActivityIndicator
            color="#2563EB"
          />

        ) : (

          <Text
            style={
              styles.biometricIcon
            }
          >
            🔐
          </Text>

        )}


        <Text
          style={
            styles.biometricText
          }
        >
          Login with Fingerprint / Face
        </Text>

      </TouchableOpacity>


      {/* ====================================================
          REGISTER
      ==================================================== */}

      <View
        style={
          styles.registerContainer
        }
      >

        <Text
          style={
            styles.registerText
          }
        >
          Don't have an account?
        </Text>


        <TouchableOpacity
          onPress={() =>
            router.push(
              "/register"
            )
          }

          disabled={
            loading ||
            biometricLoading
          }
        >

          <Text
            style={
              styles.registerLink
            }
          >
            Create Account
          </Text>

        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>

  );

}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,

      justifyContent:
        "center",

      padding: 25,

      backgroundColor:
        "#F5F7FA",
    },


    title: {
      fontSize: 32,

      fontWeight:
        "bold",

      color:
        "#2563EB",

      textAlign:
        "center",

      marginBottom: 5,
    },


    subtitle: {
      textAlign:
        "center",

      color:
        "#666",

      fontSize: 16,

      marginTop: 10,

      marginBottom: 40,
    },


    label: {
      fontSize: 14,

      fontWeight:
        "600",

      color:
        "#333",

      marginBottom: 8,
    },


    input: {
      backgroundColor:
        "#fff",

      borderRadius: 10,

      padding: 15,

      marginBottom: 18,

      borderWidth: 1,

      borderColor:
        "#ddd",

      fontSize: 16,

      color:
        "#111",
    },


    button: {
      backgroundColor:
        "#2563EB",

      padding: 16,

      borderRadius: 10,

      alignItems:
        "center",

      marginTop: 10,

      minHeight: 52,

      justifyContent:
        "center",
    },


    buttonDisabled: {
      opacity: 0.7,
    },


    buttonText: {
      color:
        "#fff",

      fontSize: 18,

      fontWeight:
        "600",
    },


    biometricButton: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#2563EB",

      borderRadius: 10,

      padding: 14,

      marginTop: 14,

      minHeight: 52,
    },


    biometricIcon: {
      fontSize: 20,

      marginRight: 8,
    },


    biometricText: {
      color:
        "#2563EB",

      fontSize: 16,

      fontWeight:
        "700",
    },


    registerContainer: {
      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginTop: 25,
    },


    registerText: {
      color:
        "#666",

      fontSize: 15,
    },


    registerLink: {
      color:
        "#2563EB",

      fontSize: 15,

      fontWeight:
        "700",

      marginLeft: 5,
    },

  });