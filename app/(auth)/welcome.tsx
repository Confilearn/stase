import CustomButton from '@/components/CustomButton'
import { images } from '@/constants'
import { router } from 'expo-router'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Welcome = () => {
    return (
        <SafeAreaView className='flex-1 bg-bg-light dark:bg-bg-dark items-center p-4'>
            <Image source={images.wallet} className="size-[300px] mt-8" resizeMode="contain" />

            <Text className='text-5xl font-metropolis-extrabold text-center text-content-100 dark:text-content-500 mt-16 leading-tight tracking-tighter'>SEND MONEY AND GET PAID WITH EASE</Text>

            <View className="w-full flex gap-4 flex-1 justify-end mb-4">
                <View className='flex-row items-center justify-center gap-2'>
                    <CustomButton title="Log in" style="w-[49%]" onPress={() => router.push("/sign-in")} />
                    <CustomButton title="Register" style="w-[49%]" onPress={() => router.push("/sign-up")} />
                </View>

                <TouchableOpacity className='p-4 bg-bg-light text-secondary rounded-full dark:border-0 border-[0.1px] border-content-100 flex-row items-center justify-center gap-4'>
                    <Image source={images.google} className='size-5' resizeMode='contain' />
                    <Text className='font-metropolis-semibold text-[16px] text-content-200'>Sign in with Google</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Welcome