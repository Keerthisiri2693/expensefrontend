import { useState } from "react";

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
  ScrollView,
} from "react-native";

import { router } from "expo-router";

import {
  registerUser as registerApi,
} from "../../service/api";



import {
  useTheme,
} from "../../context/ThemeContext";


export default function RegisterScreen() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);


  // ==========================================================
  // REGISTER
  // ==========================================================

  const registerUser = async () => {

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!name.trim()) {
      Alert.alert(
        "Validation",
        "Please enter your name"
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        "Validation",
        "Please enter your email"
      );
      return;
    }

    if (!employeeId.trim()) {
      Alert.alert(
        "Validation",
        "Please enter your employee ID"
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

    if (password.length < 6) {
      Alert.alert(
        "Validation",
        "Password must be at least 6 characters"
      );
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert(
        "Validation",
        "Please confirm your password"
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Validation",
        "Passwords do not match"
      );
      return;
    }


    try {

      setLoading(true);

      console.log("=================================");
      console.log("🔵 REGISTER START");
      console.log("👤 Name:", name.trim());
      console.log("📧 Email:", email.trim());
      console.log("🆔 Employee ID:", employeeId.trim());
      console.log("=================================");


      // ------------------------------------------------------
      // CALL API
      // ------------------------------------------------------

      const data = await registerApi(
        name.trim(),
        email.trim(),
        password,
        employeeId.trim()
      );


      console.log("✅ REGISTER SUCCESS");
      console.log("📦 Register Data:", data);


      // ------------------------------------------------------
      // SUCCESS MESSAGE
      // ------------------------------------------------------

      Alert.alert(
        "Registration Successful",
        "Your account has been created successfully.",
        [
          {
            text: "Login",
            onPress: () => {
              router.replace("/loginscreen");
            },
          },
        ]
      );

    } catch (error: any) {

      console.log(
        "❌ REGISTER FAILED:",
        error
      );

      Alert.alert(
        "Registration Failed",
        error?.message ||
          "Unable to create your account."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.content}>

          {/* TITLE */}

          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Register to start managing your expenses
          </Text>


          {/* NAME */}

          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!loading}
          />


          {/* EMAIL */}

          <Text style={styles.label}>
            Email Address
          </Text>

          <TextInput
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            editable={!loading}
          />


          {/* EMPLOYEE ID */}

          <Text style={styles.label}>
            Employee ID
          </Text>

          <TextInput
            placeholder="Enter employee ID"
            autoCapitalize="characters"
            value={employeeId}
            onChangeText={setEmployeeId}
            style={styles.input}
            editable={!loading}
          />


          {/* PASSWORD */}

          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            placeholder="Enter password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            editable={!loading}
          />


          {/* CONFIRM PASSWORD */}

          <Text style={styles.label}>
            Confirm Password
          </Text>

          <TextInput
            placeholder="Confirm password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            editable={!loading}
          />


          {/* REGISTER BUTTON */}

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={registerUser}
            disabled={loading}
            activeOpacity={0.8}
          >

            {loading ? (

              <ActivityIndicator color="#fff" />

            ) : (

              <Text style={styles.buttonText}>
                Create Account
              </Text>

            )}

          </TouchableOpacity>


          {/* LOGIN */}

          <View style={styles.loginContainer}>

            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.replace("/loginscreen")}
              disabled={loading}
            >

              <Text style={styles.loginLink}>
                Login
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },

  content: {
    width: "100%",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563EB",
    textAlign: "center",
    marginBottom: 5,
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    fontSize: 15,
    marginTop: 10,
    marginBottom: 30,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    color: "#111",
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
    minHeight: 52,
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  loginText: {
    color: "#666",
    fontSize: 15,
  },

  loginLink: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 5,
  },

});