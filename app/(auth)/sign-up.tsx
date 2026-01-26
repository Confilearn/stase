import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { useThemeStore } from '@/store/theme.store';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignUp = () => {
    const colorScheme = useColorScheme()
    const { setTheme } = useThemeStore()

    return (
        <SafeAreaView className='flex-1 bg-bg-light dark:bg-bg-dark p-4 relative'>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    className="h-full"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View className='flex-row gap-5 mt-4 items-center'>
                        <Link href={"/welcome"}>
                            <SimpleLineIcons name="arrow-left" size={20} color={colorScheme === "dark" ? "white" : "black"} />
                        </Link>
                        <Text onPress={() => setTheme("system")} className='text-2xl font-metropolis-semibold text-content-100 dark:text-content-500'>Create Account</Text>
                    </View>

                    <View className="w-full flex gap-12 mt-12">
                        <CustomInput label={"First Name"} />
                        <CustomInput label={"Last Name"} error="This is an error" />
                        <CustomInput label={"Username"} />
                        <CustomInput label={"Email"} keyboardType={"email-address"} />
                        <CustomInput label={"Password"} secureTextEntry={true} />
                    </View>

                    <View style={{ flex: 1 }} />

                    <CustomButton title="Get Started" style="mt-8" />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default SignUp