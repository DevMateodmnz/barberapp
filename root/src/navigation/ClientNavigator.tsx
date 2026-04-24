import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClientHomeScreen } from '../screens/client/ClientHomeScreen';

const Stack = createNativeStackNavigator();

export const ClientNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ClientHome" component={ClientHomeScreen} options={{ title: 'Barbershops' }} />
    </Stack.Navigator>
  );
};
