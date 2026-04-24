import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BarberHomeScreen } from '../screens/barber/BarberHomeScreen';

const Stack = createNativeStackNavigator();

export const BarberNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BarberHome" component={BarberHomeScreen} options={{ title: 'My Barbershops' }} />
    </Stack.Navigator>
  );
};
