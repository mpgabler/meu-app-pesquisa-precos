import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
}) {
  return (
    <MaterialCommunityIcons size={28} style={{ marginBottom: -3 }} {...props} />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = "#27ae60"; // Verde Hortifruti

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: useClientOnlyValue(false, true),
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Coletar",
          headerTitle: "Nova Coleta",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="basket-plus" color={color} />
          ),
          // O bloco headerRight foi removido daqui
        }}
      />

      <Tabs.Screen
        name="two"
        options={{
          title: "Histórico",
          headerTitle: "Relatório Diário",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="table-eye" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
