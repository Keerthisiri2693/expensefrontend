import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  ActivityIndicator,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

// ==========================================================
// TYPES
// ==========================================================

type ThemeColors = {
  background: string;

  card: string;
  cardSecondary: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  border: string;

  input: string;
  inputBorder: string;

  primary: string;
  primaryDark: string;

  success: string;
  warning: string;
  danger: string;

  header: string;
  headerText: string;
  headerSubText: string;

  iconBackground: string;

  shadow: string;
};

type ThemeContextType = {
  darkMode: boolean;

  toggleDarkMode: () => void;

  setDarkMode: (
    value: boolean
  ) => void;

  colors: ThemeColors;
};

// ==========================================================
// CONTEXT
// ==========================================================

const ThemeContext =
  createContext<ThemeContextType | undefined>(
    undefined
  );

// ==========================================================
// LIGHT COLORS
// ==========================================================

const lightColors: ThemeColors = {
  background: "#F4F7FB",

  card: "#FFFFFF",
  cardSecondary: "#F8FAFC",

  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",

  border: "#E5E7EB",

  input: "#FFFFFF",
  inputBorder: "#D1D5DB",

  primary: "#2563EB",
  primaryDark: "#1D4ED8",

  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",

  header: "#2563EB",
  headerText: "#FFFFFF",
  headerSubText: "#DBEAFE",

  iconBackground: "#EFF6FF",

  shadow: "#000000",
};

// ==========================================================
// DARK COLORS
// ==========================================================

const darkColors: ThemeColors = {
  background: "#0F172A",

  card: "#1E293B",
  cardSecondary: "#273449",

  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",

  border: "#334155",

  input: "#1E293B",
  inputBorder: "#475569",

  primary: "#60A5FA",
  primaryDark: "#3B82F6",

  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",

  header: "#1E3A8A",
  headerText: "#FFFFFF",
  headerSubText: "#BFDBFE",

  iconBackground: "#172554",

  shadow: "#000000",
};

// ==========================================================
// PROVIDER
// ==========================================================

export const ThemeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [
    darkMode,
    setDarkModeState,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  // ========================================================
  // LOAD SAVED THEME
  // ========================================================

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved =
          await AsyncStorage.getItem(
            "dark_mode"
          );

        setDarkModeState(
          saved === "true"
        );
      } catch (error) {
        console.log(
          "❌ THEME LOAD ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  // ========================================================
  // SET DARK MODE
  // ========================================================

  const setDarkMode = async (
    value: boolean
  ) => {
    try {
      setDarkModeState(value);

      await AsyncStorage.setItem(
        "dark_mode",
        String(value)
      );
    } catch (error) {
      console.log(
        "❌ THEME SAVE ERROR:",
        error
      );
    }
  };

  // ========================================================
  // TOGGLE DARK MODE
  // ========================================================

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // ========================================================
  // COLORS
  // ========================================================

  const colors = darkMode
    ? darkColors
    : lightColors;

  // ========================================================
  // INITIAL LOADING
  // ========================================================

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor:
            lightColors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color={lightColors.primary}
        />
      </View>
    );
  }

  // ========================================================
  // PROVIDER
  // ========================================================

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        setDarkMode,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// ==========================================================
// HOOK
// ==========================================================

export const useTheme = () => {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
};