import { Tabs } from "expo-router";
import {
  QrCode,
  LayoutDashboard,
  Store,
  BarChart3,
  Settings,
  Scan,
} from "lucide-react-native";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1877F2",
        tabBarInactiveTintColor: "#8D949E",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E4E6EB",
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTitleStyle: {
          fontWeight: "600",
          color: "#050505",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Painel",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="businesses"
        options={{
          title: "Negócios",
          tabBarIcon: ({ color, size }) => (
            <Store size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner-tab"
        options={{
          title: "Escanear",
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.scanButton,
                focused && styles.scanButtonActive,
              ]}
            >
              <Scan size={24} color="#FFFFFF" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/scanner");
          },
        }}
      />
      <Tabs.Screen
        name="qr-codes"
        options={{
          title: "QR Codes",
          tabBarIcon: ({ color, size }) => (
            <QrCode size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Config",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1877F2",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -8,
    shadowColor: "#1877F2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonActive: {
    backgroundColor: "#166FE5",
  },
});
