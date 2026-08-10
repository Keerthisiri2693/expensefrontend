import { Stack } from "expo-router";
import { useEffect } from "react";

import {
  ThemeProvider,
} from "../../context/ThemeContext";

import {
  initExpenseCache,
} from "../../database/expenseCache";


export default function RootLayout() {

  useEffect(() => {
    const initializeApp = async () => {
      try {

        await initExpenseCache();

        console.log(
          "✅ APP DATABASE INITIALIZED"
        );

      } catch (error) {

        console.log(
          "❌ APP DATABASE INIT ERROR:",
          error
        );

      }
    };

    initializeApp();

  }, []);


  return (
    <ThemeProvider>

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >

        <Stack.Screen
          name="index"
        />

        <Stack.Screen
          name="loginscreen"
        />

        <Stack.Screen
          name="dashboard"
        />

        <Stack.Screen
          name="raiseExpense"
        />

        <Stack.Screen
          name="expenselist"
        />

        <Stack.Screen
          name="profile"
        />

        <Stack.Screen
          name="reportscreen"
        />

        <Stack.Screen
          name="editProfile"
        />

      </Stack>

    </ThemeProvider>
  );
}