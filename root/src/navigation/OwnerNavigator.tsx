import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OwnerHomeScreen } from '../screens/owner/OwnerHomeScreen';
import { CreateBarbershopScreen } from '../screens/owner/CreateBarbershopScreen';
import { EditBarbershopScreen } from '../screens/owner/EditBarbershopScreen';
import { BarbershopDetailsScreen } from '../screens/owner/BarbershopDetailsScreen';
import { ServicesScreen } from '../screens/owner/ServicesScreen';
import { CreateServiceScreen } from '../screens/owner/CreateServiceScreen';
import { EmployeesScreen } from '../screens/owner/EmployeesScreen';
import { AddEmployeeScreen } from '../screens/owner/AddEmployeeScreen';
import { ClientsScreen } from '../screens/owner/ClientsScreen';
import { CreateClientScreen } from '../screens/owner/CreateClientScreen';
import { AgendaScreen } from '../screens/owner/AgendaScreen';

const Stack = createNativeStackNavigator();

export const OwnerNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OwnerHome" component={OwnerHomeScreen} options={{ title: 'My Barbershops' }} />
      <Stack.Screen name="CreateBarbershop" component={CreateBarbershopScreen} options={{ title: 'Create Barbershop' }} />
      <Stack.Screen name="EditBarbershop" component={EditBarbershopScreen} options={{ title: 'Edit Barbershop' }} />
      <Stack.Screen name="BarbershopDetails" component={BarbershopDetailsScreen} options={{ title: 'Barbershop Details' }} />
      <Stack.Screen name="Services" component={ServicesScreen} options={{ title: 'Services' }} />
      <Stack.Screen name="CreateService" component={CreateServiceScreen} options={{ title: 'Add Service' }} />
      <Stack.Screen name="Employees" component={EmployeesScreen} options={{ title: 'Employees' }} />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} options={{ title: 'Add Employee' }} />
      <Stack.Screen name="Clients" component={ClientsScreen} options={{ title: 'Clients' }} />
      <Stack.Screen name="CreateClient" component={CreateClientScreen} options={{ title: 'Add Client' }} />
      <Stack.Screen name="Agenda" component={AgendaScreen} options={{ title: 'Agenda' }} />
    </Stack.Navigator>
  );
};