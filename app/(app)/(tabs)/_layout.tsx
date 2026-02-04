import { Tabs } from "expo-router";
import { View, useColorScheme } from "react-native";
import { Home2, Card, Convert, TransactionMinus } from "iconsax-react-native";

interface TabBarIconProps {
  title: string;
  focused: boolean;
}

const TabBarIcon = ({ title, focused }: TabBarIconProps) => {
  const colorScheme = useColorScheme();
  const iconConfig = {
    home: Home2,
    convert: Convert,
    history: TransactionMinus,
    card: Card,
  };

  const IconComponent = iconConfig[title as keyof typeof iconConfig];

  if (!IconComponent) {
    return null;
  }

  const focusedColor = colorScheme === "light" ? "#0E0F0C" : "#FFFFFF";

  return (
    <View className="pt-4 pb-2 px-4">
      <IconComponent
        size="30"
        fontWeight="900"
        color={focused ? focusedColor : "#6A6C6A"}
      />
    </View>
  );
};

const TabLayout = () => {
  const colorScheme = useColorScheme();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#0E0F0C",
            borderTopWidth: 0.3,
            borderTopColor: colorScheme === "light" ? "#E5E7EB" : "#2D2D2D",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon title="home" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="convert"
          options={{
            title: "Convert",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon title="convert" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon title="history" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="card"
          options={{
            title: "Card",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon title="card" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabLayout;
