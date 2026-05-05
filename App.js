import React from 'react';
import { AuthProvider } from './src/app/providers/AuthProvider';
import RootNavigator from './src/app/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}