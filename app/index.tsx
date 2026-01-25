import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, Text } from "react-native";

import { useThemeStore } from '@/store/theme.store';
import './global.css';

export default function App() {

  const { theme, setTheme } = useThemeStore()

  return (
    <SafeAreaView
      className={`flex-1 dark:bg-gray-900 bg-white justify-center items-center`}
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Pressable
        className="mt-4"
        onPress={() => setTheme("dark")}
      >
        <Text className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} style={{ fontSize: 16, fontWeight: 'bold' }}>
          Theme: {theme}
        </Text>
        <Text className='font-metropolis-bold text-5xl text-secondary dark:text-primary'>Confidence</Text>
      </Pressable>
    </SafeAreaView>
  );
}