import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClientHomeScreen } from '../screens/client/ClientHomeScreen';
import { SearchBarbershopsScreen } from '../screens/client/SearchBarbershopsScreen';
import { BarbershopDetailsScreen } from '../screens/client/BarbershopDetailsScreen';
import { BookAppointmentScreen } from '../screens/client/BookAppointmentScreen';
import { MyAppointmentsScreen } from '../screens/client/MyAppointmentsScreen';

const Stack = createNativeStackNavigator();

export const ClientNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ClientHome" component={ClientHomeScreen} options={{ title: 'Discover' }} />
      <Stack.Screen name="SearchBarbershops" component={SearchBarbershopsScreen} options={{ title: 'Search' }} />
      <Stack.Screen name="BarbershopDetails" component={BarbershopDetailsScreen} options={{ title: 'Details' }} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} options={{ title: 'Book' }} />
      <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} options={{ title: 'My Appointments' }} />
    </Stack.Navigator>
  );
};