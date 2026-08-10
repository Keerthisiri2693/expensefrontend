import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import DashboardScreen from "./dashboard";
import ExpenseListScreen from "./expenselist";
import RaiseExpenseScreen from "./raiseexpense";
import ProfileScreen from "./profile";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;

            case "Expenses":
              iconName = "receipt";
              break;

            case "Raise":
              iconName = "add-circle";
              break;

            case "Profile":
              iconName = "person";
              break;
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
      />

      <Tab.Screen
        name="Expenses"
        component={ExpenseListScreen}
      />

      <Tab.Screen
        name="Raise"
        component={RaiseExpenseScreen}
        options={{
          title: "Raise Expense",
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}