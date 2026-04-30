import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { appointmentService } from '../../services/supabase/appointment.service';
import { AppointmentWithDetails } from '../../types/database.types';
import { Loading } from '../../components/common/Loading';
import { Empty } from '../../components/common/Empty';
import { Error } from '../../components/ui/Error';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const MyAppointmentsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      const data = await appointmentService.getClientAppointments(user.id);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (appointmentId: string) => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await appointmentService.cancelAppointment(appointmentId, 'client');
            fetchAppointments();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to cancel');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'completed': return '#6366f1';
      case 'no_show': return '#ef4444';
      case 'canceled_by_owner':
      case 'canceled_by_client': return '#94a3b8';
      default: return '#64748b';
    }
  };

  const canCancel = (status: string) => {
    return status === 'pending' || status === 'confirmed';
  };

  if (loading) return <Loading fullScreen message="Loading..." />;
  if (error) return <Error message={error} onRetry={fetchAppointments} fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Empty title="No appointments" message="You haven't booked any appointments yet." />
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
            <Text style={styles.barbershopName}>Barbershop: {item.barbershop?.name || 'N/A'}</Text>
            <Text style={styles.barberName}>Barber: {item.employee?.display_name || 'N/A'}</Text>
            {item.notes && <Text style={styles.notes}>Notes: {item.notes}</Text>}
            {canCancel(item.status) && (
              <Button
                title="Cancel Appointment"
                variant="danger"
                onPress={() => handleCancel(item.id)}
                style={styles.cancelButton}
              />
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
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  barbershopName: {
    fontSize: 13,
    color: '#334155',
    marginTop: 4,
  },
  barberName: {
    fontSize: 13,
    color: '#64748b',
  },
  notes: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  cancelButton: {
    marginTop: 10,
    minHeight: 40,
  },
});