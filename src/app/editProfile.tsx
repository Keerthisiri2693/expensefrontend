import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
} from "expo-router";

import { File } from "expo-file-system";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import * as ImagePicker from
  "expo-image-picker";

import * as ImageManipulator from
  "expo-image-manipulator";


import {
  useTheme,
} from "../../context/ThemeContext";


export default function EditProfileScreen() {

  // =====================================================
  // STATE
  // =====================================================

  

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [employeeId, setEmployeeId] =
    useState("");

  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  
   const {
    darkMode,
    colors,
    } = useTheme();


    const API_BASE_URL = "http://192.168.1.7:8000";


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {

    loadProfile();

  }, []);


  const loadProfile = async () => {

    try {

      console.log(
        "👤 LOADING PROFILE"
      );


      const savedUser =
        await AsyncStorage.getItem(
          "user"
        );


      if (!savedUser) {

        Alert.alert(
          "Session Expired",
          "Please login again."
        );

        router.replace("/loginscreen");

        return;
      }


      const user =
        JSON.parse(savedUser);


      console.log(
        "👤 SAVED USER:",
        user
      );


      setName(
        user?.name || ""
      );


      setEmail(
        user?.email || ""
      );


      setEmployeeId(
        user?.employee_id || ""
      );


      // =================================================
      // LOAD PROFILE IMAGE
      // =================================================

      const savedImage =
        await AsyncStorage.getItem(
          "profile_image"
        );


      if (savedImage) {

        console.log(
          "🖼️ SAVED PROFILE IMAGE:",
          savedImage
        );

        setProfileImage(
          savedImage
        );

      } else {

        console.log(
          "🖼️ NO PROFILE IMAGE"
        );

      }


    } catch (error) {

      console.log(
        "❌ PROFILE LOAD ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to load profile."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // CHANGE PROFILE IMAGE
  // =====================================================

  const changeProfileImage = () => {

    Alert.alert(
      "Profile Photo",
      "Choose an option",
      [

        {
          text: "Camera",
          onPress: openCamera,
        },

        {
          text: "Gallery",
          onPress: openGallery,
        },

        ...(profileImage
          ? [
              {
                text: "Remove Photo",
                style: "destructive" as const,
                onPress:
                  removeProfileImage,
              },
            ]
          : []),

        {
          text: "Cancel",
          style: "cancel",
        },

      ]
    );

  };


  // =====================================================
  // CAMERA
  // =====================================================

  const openCamera = async () => {

    try {

      console.log(
        "📷 OPENING CAMERA"
      );


      const permission =
        await ImagePicker
          .requestCameraPermissionsAsync();


      if (!permission.granted) {

        Alert.alert(
          "Permission Required",
          "Camera permission is required to take a profile photo."
        );

        return;
      }


      const result =
        await ImagePicker.launchCameraAsync({

          mediaTypes: ["images"],

          allowsEditing: true,

          aspect: [1, 1],

          quality: 0.7,

        });


      if (result.canceled) {

        console.log(
          "📷 CAMERA CANCELLED"
        );

        return;
      }


      const asset =
        result.assets[0];


      console.log(
        "📷 CAMERA IMAGE:",
        asset.uri
      );


      await compressAndSaveImage(
        asset.uri
      );


    } catch (error) {

      console.log(
        "❌ CAMERA ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to take profile photo."
      );

    }

  };


  // =====================================================
  // GALLERY
  // =====================================================

  const openGallery = async () => {

    try {

      console.log(
        "🖼️ OPENING GALLERY"
      );


      const permission =
        await ImagePicker
          .requestMediaLibraryPermissionsAsync();


      if (!permission.granted) {

        Alert.alert(
          "Permission Required",
          "Photo library permission is required."
        );

        return;
      }


      const result =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes: ["images"],

          allowsEditing: true,

          aspect: [1, 1],

          quality: 0.7,

        });


      if (result.canceled) {

        console.log(
          "🖼️ GALLERY CANCELLED"
        );

        return;
      }


      const asset =
        result.assets[0];


      console.log(
        "🖼️ SELECTED IMAGE:",
        asset.uri
      );


      await compressAndSaveImage(
        asset.uri
      );


    } catch (error) {

      console.log(
        "❌ GALLERY ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to select profile photo."
      );

    }

  };


  // =====================================================
  // COMPRESS + SAVE IMAGE
  // =====================================================

const compressAndSaveImage = async (uri: string) => {
  try {
    console.log("🗜️ COMPRESSING PROFILE IMAGE");
    console.log("📁 ORIGINAL URI:", uri);

    // =====================================================
    // COMPRESS IMAGE
    // =====================================================

    const compressed =
      await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: 600,
            },
          },
        ],
        {
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

    console.log(
      "✅ COMPRESSED IMAGE:",
      compressed.uri
    );

    // =====================================================
    // GET TOKEN
    // =====================================================

    const token =
      await AsyncStorage.getItem(
        "access_token"
      );

    if (!token) {
      Alert.alert(
        "Session Expired",
        "Please login again."
      );

      router.replace("/loginscreen");
      return;
    }

    // =====================================================
    // CREATE FILE FROM URI
    // =====================================================

    const file = new File(
      compressed.uri
    );

    console.log(
      "📁 FILE URI:",
      file.uri
    );

    // =====================================================
    // CHECK FILE
    // =====================================================

    const exists = file.exists;

    console.log(
      "📁 FILE EXISTS:",
      exists
    );

    if (!exists) {
      throw new Error(
        "Compressed image file does not exist."
      );
    }

    console.log(
      "📏 FILE SIZE:",
      file.size
    );

    // =====================================================
    // CREATE FORMDATA
    // =====================================================

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    console.log(
      "📤 UPLOADING PROFILE IMAGE"
    );

    // =====================================================
    // UPLOAD
    // =====================================================

    const response =
      await fetch(
        `${API_BASE_URL}/profile/image`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            Accept:
              "application/json",
          },

          body: formData,
        }
      );

    console.log(
      "📡 IMAGE UPLOAD STATUS:",
      response.status
    );

    const responseText =
      await response.text();

    console.log(
      "📦 IMAGE UPLOAD RESPONSE:",
      responseText
    );

    let data: any = {};

    try {
      data =
        JSON.parse(responseText);
    } catch {
      console.log(
        "⚠️ RESPONSE IS NOT JSON"
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        `Image upload failed: ${response.status}`
      );
    }

    // =====================================================
    // UPDATE UI
    // =====================================================

    setProfileImage(
      compressed.uri
    );

    // =====================================================
    // LOCAL CACHE
    // =====================================================

    await AsyncStorage.setItem(
      "profile_image",
      compressed.uri
    );

    // =====================================================
    // UPDATE LOCAL USER
    // =====================================================

    const savedUser =
      await AsyncStorage.getItem(
        "user"
      );

    if (savedUser) {
      const user =
        JSON.parse(savedUser);

      user.profile_image =
        true;

      await AsyncStorage.setItem(
        "user",
        JSON.stringify(user)
      );
    }

    console.log(
      "✅ PROFILE IMAGE SAVED TO DATABASE"
    );

    Alert.alert(
      "Success",
      "Profile photo updated successfully."
    );

  } catch (error: any) {

    console.log(
      "❌ PROFILE IMAGE UPLOAD ERROR:",
      error
    );

    Alert.alert(
      "Error",
      error?.message ||
      "Unable to save profile photo."
    );
  }
};

  // =====================================================
  // REMOVE PROFILE IMAGE
  // =====================================================

  const removeProfileImage = async () => {

    try {

      await AsyncStorage.removeItem(
        "profile_image"
      );


      setProfileImage(
        null
      );


      console.log(
        "🗑️ PROFILE IMAGE REMOVED"
      );


    } catch (error) {

      console.log(
        "❌ REMOVE IMAGE ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to remove profile photo."
      );

    }

  };


  // =====================================================
  // SAVE PROFILE
  // =====================================================

 const saveProfile = async () => {
  try {
    // ======================================================
    // VALIDATION
    // ======================================================

    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert(
        "Validation",
        "Please enter your name."
      );
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert(
        "Validation",
        "Name must contain at least 2 characters."
      );
      return;
    }

    setSaving(true);

    console.log("💾 SAVING PROFILE");
    console.log("📝 NEW NAME:", trimmedName);

    // ======================================================
    // GET TOKEN
    // ======================================================

    const token =
      await AsyncStorage.getItem(
        "access_token"
      );

    if (!token) {
      Alert.alert(
        "Session Expired",
        "Please login again."
      );

      router.replace("/loginscreen");
      return;
    }

    // ======================================================
    // UPDATE DATABASE
    // ======================================================

    console.log(
      "📤 PUT /profile"
    );

    const response = await fetch(
      `${API_BASE_URL}/profile`,
      {
        method: "PUT",

        headers: {
          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        body: JSON.stringify({
          name: trimmedName,
        }),
      }
    );

    console.log(
      "📡 UPDATE PROFILE STATUS:",
      response.status
    );

    const data =
      await response.json();

    console.log(
      "📦 UPDATE PROFILE RESPONSE:",
      data
    );

    // ======================================================
    // API ERROR
    // ======================================================

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        "Unable to update profile."
      );
    }

    // ======================================================
    // UPDATE UI FROM DATABASE RESPONSE
    // ======================================================

    setName(
      data?.name || trimmedName
    );

    setEmail(
      data?.email || email
    );

    setEmployeeId(
      data?.employee_id || employeeId
    );

    // ======================================================
    // UPDATE LOCAL USER
    // ======================================================

    const updatedUser = {
      id: data?.id,
      name: data?.name,
      email: data?.email,
      employee_id: data?.employee_id,
      profile_image:
        data?.profile_image ?? null,
    };

    await AsyncStorage.setItem(
      "user",
      JSON.stringify(
        updatedUser
      )
    );

    console.log(
      "✅ PROFILE SAVED:",
      updatedUser
    );

    // ======================================================
    // SUCCESS
    // ======================================================

    Alert.alert(
      "Success",
      "Profile updated successfully.",
      [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]
    );

  } catch (error: any) {

    console.log(
      "❌ SAVE PROFILE ERROR:",
      error
    );

    Alert.alert(
      "Error",
      error?.message ||
      "Unable to update profile."
    );

  } finally {

    setSaving(false);

  }
};

  // =====================================================
  // LOADING
  // =====================================================

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
          Loading profile...
        </Text>

      </View>

    );

  }


  // =====================================================
  // UI
  // =====================================================

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
          style={styles.headerTitle}
        >
          Edit Profile
        </Text>


      




      </View>


      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* =================================================
            PROFILE PHOTO
        ================================================= */}

        <View
          style={
            styles.avatarContainer
          }
        >

          <TouchableOpacity
            style={styles.avatar}
            onPress={
              changeProfileImage
            }
            disabled={saving}
            activeOpacity={0.8}
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
              />

            ) : (

              <Ionicons
                name="person"
                size={42}
                color="#2563EB"
              />

            )}

          </TouchableOpacity>


          {/* CAMERA BUTTON */}

          <TouchableOpacity
            style={
              styles.cameraButton
            }
            onPress={
              changeProfileImage
            }
            disabled={saving}
            activeOpacity={0.8}
          >

            <Ionicons
              name="camera"
              size={18}
              color="#FFFFFF"
            />

          </TouchableOpacity>


          <Text
            style={
              styles.profileTitle
            }
          >
            My Profile
          </Text>


          <Text
            style={
              styles.profileSubtitle
            }
          >
            Tap the photo to change
          </Text>

        </View>


        {/* =================================================
            NAME
        ================================================= */}

        <View
          style={
            styles.fieldContainer
          }
        >

          <Text
            style={styles.label}
          >
            Name
          </Text>


          <View
            style={
              styles.inputContainer
            }
          >

            <Ionicons
              name="person-outline"
              size={20}
              color="#64748B"
            />


            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={
                setName
              }
              editable={!saving}
            />

          </View>

        </View>


        {/* =================================================
            EMAIL
        ================================================= */}

        <View
          style={
            styles.fieldContainer
          }
        >

          <Text
            style={styles.label}
          >
            Email Address
          </Text>


          <View
            style={[
              styles.inputContainer,
              styles.disabledInput,
            ]}
          >

            <Ionicons
              name="mail-outline"
              size={20}
              color="#64748B"
            />


            <TextInput
              style={[
                styles.input,
                styles.disabledText,
              ]}
              value={email}
              editable={false}
            />


            <Ionicons
              name="lock-closed-outline"
              size={17}
              color="#94A3B8"
            />

          </View>


          <Text
            style={
              styles.helperText
            }
          >
            Email cannot be changed.
          </Text>

        </View>


        {/* =================================================
            EMPLOYEE ID
        ================================================= */}

        <View
          style={
            styles.fieldContainer
          }
        >

          <Text
            style={styles.label}
          >
            Employee ID
          </Text>


          <View
            style={[
              styles.inputContainer,
              styles.disabledInput,
            ]}
          >

            <Ionicons
              name="id-card-outline"
              size={20}
              color="#64748B"
            />


            <TextInput
              style={[
                styles.input,
                styles.disabledText,
              ]}
              value={employeeId}
              editable={false}
            />


            <Ionicons
              name="lock-closed-outline"
              size={17}
              color="#94A3B8"
            />

          </View>


          <Text
            style={
              styles.helperText
            }
          >
            Employee ID cannot be changed.
          </Text>

        </View>


        {/* =================================================
            SAVE BUTTON
        ================================================= */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            saving &&
              styles.buttonDisabled,
          ]}
          onPress={
            saveProfile
          }
          disabled={saving}
          activeOpacity={0.8}
        >

          {saving ? (

            <ActivityIndicator
              color="#FFFFFF"
            />

          ) : (

            <>

              <Ionicons
                name="save-outline"
                size={21}
                color="#FFFFFF"
              />


              <Text
                style={
                  styles.saveButtonText
                }
              >
                Update Profile
              </Text>

            </>

          )}

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

    container: {
      flex: 1,
      backgroundColor:
        "#F5F7FA",
    },


    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      backgroundColor:
        "#F5F7FA",
    },


    loadingText: {
      marginTop: 12,
      fontSize: 15,
      color: "#64748B",
    },


    // =====================================================
    // HEADER
    // =====================================================

  



 
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




  

    // =====================================================
    // CONTENT
    // =====================================================

    content: {
      padding: 20,
      paddingBottom: 40,
    },


    // =====================================================
    // PROFILE PHOTO
    // =====================================================

    avatarContainer: {
      alignItems: "center",
      marginBottom: 28,
    },


    avatar: {
      width: 100,
      height: 100,

      borderRadius: 50,

      backgroundColor:
        "#DBEAFE",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginBottom: 12,

      overflow: "hidden",

      borderWidth: 3,

      borderColor:
        "#FFFFFF",

      elevation: 4,
    },


    avatarImage: {
      width: "100%",
      height: "100%",

      borderRadius: 50,
    },


    cameraButton: {
      position: "absolute",

      bottom: 47,

      marginLeft: 70,

      width: 36,
      height: 36,

      borderRadius: 18,

      backgroundColor:
        "#2563EB",

      justifyContent:
        "center",

      alignItems:
        "center",

      borderWidth: 2,

      borderColor:
        "#FFFFFF",

      elevation: 5,
    },


    profileTitle: {
      fontSize: 21,

      fontWeight: "700",

      color: "#111827",
    },


    profileSubtitle: {
      marginTop: 5,

      fontSize: 14,

      color: "#64748B",
    },


    // =====================================================
    // FIELDS
    // =====================================================

    fieldContainer: {
      marginBottom: 20,
    },


    label: {
      fontSize: 14,

      fontWeight: "600",

      color: "#374151",

      marginBottom: 8,
    },


    inputContainer: {
      height: 54,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      borderRadius: 12,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal: 15,
    },


    disabledInput: {
      backgroundColor:
        "#F1F5F9",
    },


    input: {
      flex: 1,

      marginLeft: 11,

      fontSize: 16,

      color: "#111827",
    },


    disabledText: {
      color: "#64748B",
    },


    helperText: {
      fontSize: 12,

      color: "#94A3B8",

      marginTop: 5,

      marginLeft: 3,
    },


    // =====================================================
    // SAVE
    // =====================================================

    saveButton: {
      height: 54,

      borderRadius: 12,

      backgroundColor:
        "#2563EB",

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginTop: 8,
    },


    saveButtonText: {
      color: "#FFFFFF",

      fontSize: 17,

      fontWeight: "700",

      marginLeft: 9,
    },


    buttonDisabled: {
      opacity: 0.7,
    },


    

  });