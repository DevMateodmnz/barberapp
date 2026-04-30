import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { employeeService } from '../../services/supabase/employee.service';
import { appointmentService } from '../../services/supabase/appointment.service';
import { Employee, AppointmentWithDetails } from '../../types/database.types';
import { Loading } from '../../components/common/Loading';
import { Empty } from '../../components/common/Empty';
import { Error } from '../../components/ui/Error';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const MyAgendaScreen: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);

      const employees = await employeeService.getBarbershopsByUser(user.id);
      if (employees.length === 0) {
        setAppointments([]);
        return;
      }

      const allAppointments: AppointmentWithDetails[] = [];
      for (const barbershop of employees) {
        const empRecords = await employeeService.getEmployeesByBarbershop(barbershop.id);
        const myEmp = empRecords.find((e: Employee) => e.user_id === user.id);
        if (myEmp) {
          const appts = await appointmentService.getAppointmentsByEmployee(myEmp.id);
          allAppointments.push(...appts);
        }
      }

      allAppointments.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
      setAppointments(allAppointments);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleComplete = async (appointmentId: string) => {
    try {
      await appointmentService.completeAppointment(appointmentId);
      fetchAppointments();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to complete appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'completed': return '#6366f1';
      case 'no_show': return '#ef4444';
      default: return '#64748b';
    }
  };

  if (loading) return <Loading fullScreen message="Loading your agenda..." />;
  if (error) return <Error message={error} onRetry={fetchAppointments} fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Empty title="No appointments" message="You don't have any appointments scheduled." />
        }
        renderItem={({ item }) => (
          <Card style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <Text style={styles.appointmentTime}>
                {format(new Date(item.starts_at), 'MMM d, yyyy h:mm a')}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
              </View>
            </View>
            <Text style={styles.serviceName}>{item.service?.name || 'Service'}</Text>
            <Text style={styles.clientName}>Client: {item.client?.name || 'N/A'}</Text>
            {item.notes && <Text style={styles.notes}>Notes: {item.notes}</Text>}
            {item.status !== 'completed' && item.status !== 'canceled_by_owner' && item.status !== 'canceled_by_client' && (
              <View style={styles.actions}>
                <Button
                  title="Complete"
                  onPress={() => handleComplete(item.id)}
                  style={styles.completeBtn}
                />
              </View>
            )}
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
  appointmentCard: {
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563eb',
  },
  clientName: {
    fontSize: 13,
    color: '#334155',
    marginTop: 4,
  },
  notes: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  completeBtn: {
    minHeight: 36,
  },
});