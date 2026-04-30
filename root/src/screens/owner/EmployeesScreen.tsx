import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { employeeService } from '../../services/supabase/employee.service';
import { Employee } from '../../types/database.types';
import { Loading } from '../../components/common/Loading';
import { Empty } from '../../components/common/Empty';
import { Error } from '../../components/ui/Error';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface EmployeesScreenProps {
  route: { params: { barbershopId: string } };
  navigation: any;
}

export const EmployeesScreen = (props: any) => {
  const { navigation } = props;
  const { barbershopId } = props.route.params;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setError(null);
      const data = await employeeService.getEmployeesByBarbershop(barbershopId);
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleRemove = async (employeeId: string) => {
    Alert.alert('Remove Employee', 'Are you sure you want to remove this employee?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await employeeService.removeEmployee(employeeId);
            fetchEmployees();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to remove employee');
          }
        },
      },
    ]);
  };

  if (loading) return <Loading fullScreen message="Loading employees..." />;
  if (error) return <Error message={error} onRetry={fetchEmployees} fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Button
            title="Add Employee"
            onPress={() => navigation.navigate('AddEmployee', { barbershopId })}
            style={styles.addButton}
          />
        }
        ListEmptyComponent={<Empty title="No employees yet" message="Add barbers to your team." />}
        renderItem={({ item }) => (
          <Card style={styles.employeeCard}>
            <View style={styles.employeeHeader}>
              <Text style={styles.employeeName}>{item.display_name}</Text>
            </View>
            <View style={styles.employeeActions}>
              <Button
                title="Remove"
                variant="danger"
                onPress={() => handleRemove(item.id)}
                style={styles.actionButton}
              />
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  addButton: {
    marginBottom: 16,
  },
  employeeCard: {
    marginBottom: 12,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  employeeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    minHeight: 36,
  },
});