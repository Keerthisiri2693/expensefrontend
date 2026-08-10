import {
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
} from "expo-router";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import {
  useTheme,
} from "../../context/ThemeContext";


import { useFocusEffect } from "expo-router";
import { useCallback } from "react";


// =========================================================
// PROFILE SCREEN
// =========================================================

export default function ProfileScreen() {

  // =======================================================
  // USER
  // =======================================================

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [employeeId, setEmployeeId] =
    useState("");

  // =======================================================
  // PROFILE IMAGE
  // =======================================================

  const [profileImage, setProfileImage] =
    useState<string | null>(null);


  // =======================================================
  // LOADING
  // =======================================================

  const [loading, setLoading] =
    useState(true);


  // =======================================================
  // GLOBAL THEME
  // =======================================================

  const {
    darkMode,
    toggleDarkMode,
    colors,
  } = useTheme();


  // =======================================================
  // API
  // =======================================================

  const API_BASE_URL =
    "http://192.168.1.7:8000";


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useFocusEffect(
  useCallback(() => {
    loadUser();
  }, [])
);


  // =======================================================
  // LOAD USER
  // =======================================================

  const loadUser =
    async () => {

      try {

        console.log(
          "👤 LOADING PROFILE"
        );


        // =================================================
        // TOKEN
        // =================================================

        const token =
          await AsyncStorage.getItem(
            "access_token"
          );


        if (!token) {

          Alert.alert(
            "Session Expired",
            "Please login again."
          );


          router.replace(
            "/loginscreen"
          );


          return;
        }


        // =================================================
        // API
        // =================================================

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


        // =================================================
        // HTTP ERROR
        // =================================================

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


        // =================================================
        // JSON
        // =================================================

        const data =
          JSON.parse(
            responseText
          );


        console.log(
          "👤 PROFILE:",
          {
            id:
              data.id,

            name:
              data.name,

            email:
              data.email,

            employee_id:
              data.employee_id,

            hasImage:
              !!data.profile_image,
          }
        );


        // =================================================
        // USER DETAILS
        // =================================================

        setName(
          data?.name ||
          "User"
        );


        setEmail(
          data?.email ||
          "-"
        );


        setEmployeeId(
          data?.employee_id ||
          "-"
        );


        // =================================================
        // PROFILE IMAGE
        // =================================================

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


          // =============================================
          // SAVE USER LOCALLY
          // =============================================

          await AsyncStorage.setItem(
            "user",
            JSON.stringify({
              id:
                data.id,

              name:
                data.name,

              email:
                data.email,

              employee_id:
                data.employee_id,

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
              id:
                data.id,

              name:
                data.name,

              email:
                data.email,

              employee_id:
                data.employee_id,

              profile_image:
                null,
            })
          );

        }


        console.log(
          "✅ PROFILE LOADED"
        );


      } catch (
        error: any
      ) {

        console.log(
          "❌ PROFILE LOAD ERROR:",
          error
        );


        Alert.alert(
          "Error",
          error?.message ||
          "Unable to load profile."
        );


      } finally {

        setLoading(
          false
        );

      }

    };


  // =======================================================
  // LOGOUT
  // =======================================================

  const logout =
    () => {

      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",

        [

          {
            text: "Cancel",
            style: "cancel",
          },


          {
            text: "Logout",

            style:
              "destructive",

            onPress:
              performLogout,
          },

        ]
      );

    };


  // =======================================================
  // PERFORM LOGOUT
  // =======================================================

  const performLogout =
    async () => {

      try {

        console.log(
          "🚪 LOGOUT START"
        );


        // ===============================================
        // REMOVE LOGIN SESSION
        // ===============================================

        await AsyncStorage.removeItem(
          "access_token"
        );


        await AsyncStorage.removeItem(
          "isLoggedIn"
        );


        await AsyncStorage.removeItem(
          "user"
        );


        // ===============================================
        // REMOVE BIOMETRIC LOGIN
        // ===============================================

        await AsyncStorage.removeItem(
          "biometric_enabled"
        );


        console.log(
          "✅ LOGOUT SUCCESS"
        );


        router.replace(
          "/loginscreen"
        );


      } catch (
        error
      ) {

        console.log(
          "❌ LOGOUT ERROR:",
          error
        );


        Alert.alert(
          "Logout Error",
          "Unable to logout."
        );

      }

    };


  // =======================================================
  // ABOUT APP
  // =======================================================

  const showAboutApp =
    () => {

      Alert.alert(
        "About App",

        "Expense Management App\n\n" +
        "Version 1.0.0\n\n" +
        "Manage your expenses, submit receipts and track your expense reports easily.",

        [
          {
            text: "OK",
          },
        ]
      );

    };


  // =======================================================
  // LOADING
  // =======================================================

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
          size="large"
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
          Loading profile...
        </Text>

      </View>

    );

  }


  // =======================================================
  // PROFILE UI
  // =======================================================

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

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

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
            style={
              styles.headerTitle
            }
          >
            Profile
          </Text>

        </View>


        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          {/* AVATAR */}

          <View
            style={
              styles.avatarContainer
            }
          >

            <View
              style={[
                styles.avatar,
                {
                  backgroundColor:
                    darkMode
                      ? "#172554"
                      : "#EFF6FF",
                },
              ]}
            >

              {profileImage ? (

                <Image
                  source={{
                    uri:
                      profileImage,
                  }}

                  style={
                    styles.avatarImage
                  }

                  resizeMode="cover"
                />

              ) : (

                <Ionicons
                  name="person"
                  size={58}
                  color={
                    colors.primary
                  }
                />

              )}

            </View>

          </View>


          {/* NAME */}

          <Text
            style={[
              styles.name,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {name}
          </Text>


          {/* ROLE */}

          <Text
            style={[
              styles.role,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Employee
          </Text>


          {/* EMAIL */}

          <View
            style={
              styles.emailRow
            }
          >

            <Ionicons
              name="mail-outline"
              size={18}
              color={
                colors.textSecondary
              }
            />


            <Text
              style={[
                styles.email,
                {
                  color:
                    colors.textSecondary,
                },
              ]}

              numberOfLines={1}
            >
              {email}
            </Text>

          </View>


          {/* EMPLOYEE ID */}

          {employeeId &&
            employeeId !== "-" && (

              <View
                style={
                  styles.employeeRow
                }
              >

                <Ionicons
                  name="id-card-outline"
                  size={18}
                  color={
                    colors.textSecondary
                  }
                />


                <Text
                  style={[
                    styles.employeeText,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  Employee ID:{" "}
                  {employeeId}
                </Text>

              </View>

            )}


          {/* EDIT PROFILE */}

          <TouchableOpacity
            style={[
              styles.editButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}

            activeOpacity={0.8}

            onPress={() =>
              router.push(
                "/editProfile"
              )
            }
          >

            <Ionicons
              name="create-outline"
              size={18}
              color="#FFFFFF"
            />


            <Text
              style={
                styles.editText
              }
            >
              Edit Profile
            </Text>

          </TouchableOpacity>

        </View>


        {/* =================================================
            SETTINGS CARD
        ================================================= */}

        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          {/* ===============================================
              DARK MODE
          =============================================== */}

          <View
            style={
              styles.settingRow
            }
          >

            <View
              style={
                styles.settingLeft
              }
            >

              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor:
                      darkMode
                        ? "#312E81"
                        : "#EEF2FF",
                  },
                ]}
              >

                <Ionicons
                  name={
                    darkMode
                      ? "moon"
                      : "moon-outline"
                  }

                  size={21}

                  color={
                    darkMode
                      ? "#A5B4FC"
                      : "#4F46E5"
                  }
                />

              </View>


              <View
                style={
                  styles.settingInfo
                }
              >

                <Text
                  style={[
                    styles.settingTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Dark Mode
                </Text>


                <Text
                  style={[
                    styles.settingSubtitle,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  Use dark theme
                </Text>

              </View>

            </View>


            {/* SWITCH */}

            <TouchableOpacity
              activeOpacity={0.8}

              onPress={
                toggleDarkMode
              }

              style={[
                styles.switch,
                {
                  backgroundColor:
                    darkMode
                      ? colors.primary
                      : "#D1D5DB",
                },
              ]}
            >

              <View
                style={[
                  styles.switchThumb,

                  darkMode &&
                    styles.switchThumbActive,
                ]}
              />

            </TouchableOpacity>

          </View>


          {/* DIVIDER */}

          <View
            style={[
              styles.settingDivider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* ===============================================
              ABOUT APP
          =============================================== */}

          <TouchableOpacity
            style={
              styles.settingRow
            }

            activeOpacity={0.7}

            onPress={
              showAboutApp
            }
          >

            <View
              style={
                styles.settingLeft
              }
            >

              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor:
                      darkMode
                        ? "#064E3B"
                        : "#ECFDF5",
                  },
                ]}
              >

                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={
                    darkMode
                      ? "#6EE7B7"
                      : "#059669"
                  }
                />

              </View>


              <View
                style={
                  styles.settingInfo
                }
              >

                <Text
                  style={[
                    styles.settingTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  About App
                </Text>


                <Text
                  style={[
                    styles.settingSubtitle,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  Version 1.0.0
                </Text>

              </View>

            </View>


            <Ionicons
              name="chevron-forward"
              size={21}
              color={
                colors.textMuted
              }
            />

          </TouchableOpacity>

        </View>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <TouchableOpacity
          style={
            styles.logoutButton
          }

          activeOpacity={0.8}

          onPress={
            logout
          }
        >

          <Ionicons
            name="log-out-outline"
            size={24}
            color="#FFFFFF"
          />


          <Text
            style={
              styles.logoutText
            }
          >
            Logout
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </View>

  );

}


// =========================================================
// STYLES
// =========================================================

const styles =
  StyleSheet.create({

    // =====================================================
    // CONTAINER
    // =====================================================

    container: {
      flex: 1,
    },


    // =====================================================
    // LOADING
    // =====================================================

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


    // =====================================================
    // HEADER
    // =====================================================

    header: {
      paddingTop: 55,

      paddingBottom: 70,

      paddingHorizontal: 20,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      borderBottomLeftRadius:
        35,

      borderBottomRightRadius:
        35,

      elevation: 10,
    },

    headerTitle: {
      color: "#FFFFFF",

      fontSize: 24,

      fontWeight:
        "700",
    },


    // =====================================================
    // PROFILE CARD
    // =====================================================

    profileCard: {
      marginHorizontal: 20,

      marginTop: -45,

      borderRadius: 22,

      alignItems:
        "center",

      paddingHorizontal: 20,

      paddingVertical: 25,

      borderWidth: 1,

      elevation: 6,

      shadowColor:
        "#000000",

      shadowOpacity:
        0.08,

      shadowRadius:
        8,

      shadowOffset: {
        width: 0,
        height: 4,
      },
    },


    // =====================================================
    // AVATAR
    // =====================================================

    avatarContainer: {
      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom: 15,
    },

    avatar: {
      width: 120,

      height: 120,

      borderRadius: 60,

      justifyContent:
        "center",

      alignItems:
        "center",

      overflow:
        "hidden",
    },

    avatarImage: {
      width: 120,

      height: 120,

      borderRadius: 60,

      borderWidth: 4,

      borderColor:
        "#FFFFFF",
    },


    // =====================================================
    // PROFILE TEXT
    // =====================================================

    name: {
      fontSize: 24,

      fontWeight:
        "700",
    },

    role: {
      marginTop: 5,

      fontSize: 16,
    },

    emailRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop: 10,

      maxWidth:
        "90%",
    },

    email: {
      marginLeft: 6,

      fontSize: 15,

      fontWeight:
        "500",

      flexShrink: 1,
    },

    employeeRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop: 8,
    },

    employeeText: {
      marginLeft: 6,

      fontSize: 13,

      fontWeight:
        "500",
    },


    // =====================================================
    // EDIT BUTTON
    // =====================================================

    editButton: {
      marginTop: 18,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal: 24,

      paddingVertical: 10,

      borderRadius: 25,
    },

    editText: {
      color: "#FFFFFF",

      fontWeight:
        "700",

      fontSize: 15,

      marginLeft: 6,
    },


    // =====================================================
    // SETTINGS
    // =====================================================

    settingsCard: {
      marginHorizontal: 20,

      marginTop: 20,

      borderRadius: 20,

      paddingHorizontal: 18,

      borderWidth: 1,

      elevation: 3,

      shadowColor:
        "#000000",

      shadowOpacity:
        0.05,

      shadowRadius:
        8,

      shadowOffset: {
        width: 0,
        height: 3,
      },
    },

    settingRow: {
      minHeight: 72,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    settingLeft: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,
    },

    settingIcon: {
      width: 44,

      height: 44,

      borderRadius: 13,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    settingInfo: {
      marginLeft: 13,

      flex: 1,
    },

    settingTitle: {
      fontSize: 15,

      fontWeight:
        "700",
    },

    settingSubtitle: {
      fontSize: 12,

      marginTop: 3,
    },

    settingDivider: {
      height: 1,
    },


    // =====================================================
    // DARK MODE SWITCH
    // =====================================================

    switch: {
      width: 48,

      height: 28,

      borderRadius: 20,

      justifyContent:
        "center",

      paddingHorizontal: 3,
    },

    switchThumb: {
      width: 22,

      height: 22,

      borderRadius: 11,

      backgroundColor:
        "#FFFFFF",

      shadowColor:
        "#000000",

      shadowOpacity:
        0.15,

      shadowRadius: 3,

      shadowOffset: {
        width: 0,
        height: 1,
      },

      elevation: 2,
    },

    switchThumbActive: {
      alignSelf:
        "flex-end",
    },


    // =====================================================
    // LOGOUT
    // =====================================================

    logoutButton: {
      marginHorizontal: 20,

      marginTop: 25,

      backgroundColor:
        "#EF4444",

      borderRadius: 15,

      paddingVertical: 16,

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      elevation: 3,
    },

    logoutText: {
      color: "#FFFFFF",

      fontSize: 18,

      fontWeight:
        "700",

      marginLeft: 8,
    },

  });