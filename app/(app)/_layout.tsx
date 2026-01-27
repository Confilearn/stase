import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'

const AppLayout = () => {

    const { isSignedIn } = useAuth()

    if (!isSignedIn) {
        return <Redirect href={'/(auth)/welcome'} />
    }

    return (
        <Stack screenOptions={{ headerShown: false }} />
    )
}

export default AppLayout