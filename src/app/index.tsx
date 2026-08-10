import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";

import {
  router,
} from "expo-router";

import NetInfo from "@react-native-community/netinfo";

import {
  useTheme,
} from "../../context/ThemeContext";


export default function SplashScreen() {

  const {
    colors,
    darkMode,
  } = useTheme();

  const [
    checkingNetwork,
    setCheckingNetwork,
  ] = useState(true);

  const [
    isOnline,
    setIsOnline,
  ] = useState(true);


  // ==========================================================
  // CHECK NETWORK
  // ==========================================================

  useEffect(() => {

    let mounted = true;

    const checkNetwork = async () => {

      try {

        const state =
          await NetInfo.fetch();

        const online =
          state.isConnected === true &&
          state.isInternetReachable !== false;

        if (mounted) {

          setIsOnline(online);

          console.log(
            online
              ? "🌐 NETWORK: ONLINE"
              : "📴 NETWORK: OFFLINE"
          );

        }

      } catch (error) {

        console.log(
          "❌ NETWORK CHECK ERROR:",
          error
        );

        if (mounted) {
          setIsOnline(false);
        }

      } finally {

        if (mounted) {
          setCheckingNetwork(false);
        }

      }
    };


    checkNetwork();


    return () => {
      mounted = false;
    };

  }, []);


  // ==========================================================
  // SPLASH TIMER
  // ==========================================================

  useEffect(() => {

    const timer =
      setTimeout(() => {

        console.log(
          "🚀 SPLASH COMPLETE"
        );

        console.log(
          isOnline
            ? "🌐 Continuing in ONLINE mode"
            : "📴 Continuing in OFFLINE mode"
        );

        router.replace(
          "/loginscreen"
        );

      }, 3000);


    return () => {
      clearTimeout(timer);
    };

  }, [isOnline]);


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.primary,
        },
      ]}
    >

      <Image
        source={require(
          "../../assets/images/icon.png"
        )}
        style={styles.logo}
      />


      <Text
        style={[
          styles.title,
          {
            color: "#FFFFFF",
          },
        ]}
      >
        Expense Manager
      </Text>


      <Text
        style={[
          styles.subtitle,
          {
            color: darkMode
              ? "#CBD5E1"
              : "#E5E7EB",
          },
        ]}
      >
        Track • Manage • Approve Expenses
      </Text>


      {/* =====================================================
          NETWORK STATUS
      ===================================================== */}

      <View
        style={styles.networkContainer}
      >

        {checkingNetwork ? (

          <>
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

            <Text
              style={styles.networkText}
            >
              Checking connection...
            </Text>
          </>

        ) : (

          <Text
            style={styles.networkText}
          >
            {isOnline
              ? "🌐 Online"
              : "📴 Offline mode"}
          </Text>

        )}

      </View>

    </View>

  );
}


// ==========================================================
// STYLES
// ==========================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,

    justifyContent:
      "center",

    alignItems:
      "center",
  },


  logo: {
    width: 120,

    height: 120,

    resizeMode:
      "contain",

    marginBottom: 20,
  },


  title: {
    fontSize: 32,

    fontWeight:
      "bold",
  },


  subtitle: {
    marginTop: 10,

    fontSize: 16,
  },


  networkContainer: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 25,

    minHeight: 25,
  },


  networkText: {
    color: "#FFFFFF",

    fontSize: 14,

    fontWeight: "600",

    marginLeft: 8,
  },

});