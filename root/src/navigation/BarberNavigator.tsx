import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BarberHomeScreen } from '../screens/barber/BarberHomeScreen';
import { MyAgendaScreen } from '../screens/barber/MyAgendaScreen';

const Stack = createNativeStackNavigator();

export const BarberNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BarberHome" component={BarberHomeScreen} options={{ title: 'My Barbershops' }} />
      <Stack.Screen name="MyAgenda" component={MyAgendaScreen} options={{ title: 'My Agenda' }} />
    </Stack.Navigator>
  );
};