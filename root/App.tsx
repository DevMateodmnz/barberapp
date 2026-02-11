import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from './src/store/authStore';
import { Loading } from './src/components/common/Loading';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './src/components/ui/Button';

const Stack = createNativeStackNavigator();

export default function App() {
  const { user, loading, initialized, initialize, signOut } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!initialized || loading) {
    return <Loading fullScreen message="Initializing..." />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#f8fafc' },
          }}
        >
          {!user ? (
            // Auth Stack
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen}
                options={{
                  presentation: 'modal',
                }}
              />
            </>
          ) : (
            // Authenticated Stack - Placeholder Home Screen
            <Stack.Screen name="Home">
              {() => (
                <View style={styles.homeContainer}>
                  <Text style={styles.emoji}>🎉</Text>
                  <Text style={styles.welcomeTitle}>
                    Welcome, {user.display_name}!
                  </Text>
                  <Text style={styles.roleText}>
                    Role: {user.role.toUpperCase()}
                  </Text>
                  <Text style={styles.subtitle}>
                    Your app is working!
                  </Text>
                  
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>✅ What's Working:</Text>
                    <Text style={styles.infoText}>• Database connected</Text>
                    <Text style={styles.infoText}>• Authentication working</Text>
                    <Text style={styles.infoText}>• User profile loaded</Text>
                    <Text style={styles.infoText}>• Ready to build features!</Text>
                  </View>

                  <View style={styles.nextSteps}>
                    <Text style={styles.nextStepsTitle}>🚀 Next Steps:</Text>
                    <Text style={styles.nextStepsText}>
                      {user.role === 'owner' && 
                        '1. Build Owner screens (create barbershop, services, etc.)\n2. Manage employees and appointments'}
                      {user.role === 'barber' && 
                        '1. Build Barber screens (view agenda)\n2. Manage your appointments'}
                      {user.role === 'client' && 
                        '1. Build Client screens (search barbershops)\n2. Book appointments'}
                    </Text>
                  </View>

                  <Button
                    title="Sign Out"
                    variant="outline"
                    onPress={signOut}
                    style={styles.signOutButton}
                  />
                </View>
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  nextSteps: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  nextStepsText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  signOutButton: {
    minWidth: 150,
  },
});
