import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider } from './src/views/providers/AuthProvider';
import { UserTypeProvider } from './src/views/providers/UserTypeProvider';
import RootNavigator from './src/views/navigation/RootNavigator';

export default function App() {
    return ( 
        <SafeAreaProvider >
            <NavigationContainer>
                <AuthProvider>
                    <UserTypeProvider>
                        <RootNavigator />
                    </UserTypeProvider>
                </AuthProvider>
            </NavigationContainer>
        </SafeAreaProvider >
    );
}