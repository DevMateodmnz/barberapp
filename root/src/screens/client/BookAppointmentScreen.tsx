import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { employeeService } from '../../services/supabase/employee.service';
import { serviceService } from '../../services/supabase/service.service';
import { clientService } from '../../services/supabase/client.service';
import { appointmentService } from '../../services/supabase/appointment.service';
import { Employee, Service } from '../../types/database.types';
import { Loading } from '../../components/common/Loading';
import { Error } from '../../components/ui/Error';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';

interface BookAppointmentScreenProps {
  route: { params: { barbershopId: string } };
  navigation: any;
}

export const BookAppointmentScreen = (props: any) => {
  const { navigation } = props;
  const { barbershopId } = props.route.params;
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedService, setSelectedService] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [empData, svcData] = await Promise.all([
        employeeService.getEmployeesByBarbershop(barbershopId),
        serviceService.getServicesByBarbershop(barbershopId),
      ]);
      setEmployees(empData);
      setServices(svcData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validate = () => {
    if (!selectedService) { Alert.alert('Error', 'Please select a service'); return false; }
    if (!selectedEmployee) { Alert.alert('Error', 'Please select a barber'); return false; }
    if (!clientName.trim()) { Alert.alert('Error', 'Please enter your name'); return false; }
    if (!date.trim()) { Alert.alert('Error', 'Please enter date (YYYY-MM-DD)'); return false; }
    if (!time.trim()) { Alert.alert('Error', 'Please enter time (HH:MM)'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;

    setSubmitting(true);
    try {
      const startsAt = new Date(`${date}T${time}:00`);
      if (isNaN(startsAt.getTime())) {
        Alert.alert('Error', 'Invalid date or time format');
        return;
      }

      const client = await clientService.findOrCreateClient(barbershopId, {
        barbershop_id: barbershopId,
        name: clientName.trim(),
        phone: clientPhone.trim() || undefined,
      });

      await appointmentService.createAppointment({
        barbershop_id: barbershopId,
        service_id: selectedService,
        employee_id: selectedEmployee,
        client_id: client.id,
        starts_at: startsAt.toISOString(),
      });

      Alert.alert('Success', 'Appointment booked!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading fullScreen message="Loading..." />;
  if (error) return <Error message={error} onRetry={fetchData} fullScreen />;

  const serviceOptions = services.map((s) => ({
    label: `${s.name} - $${(s.price_cents / 100).toFixed(2)} (${s.duration_minutes}min)`,
    value: s.id,
  }));

  const employeeOptions = employees.map((e) => ({
    label: e.display_name,
    value: e.id,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Select
          label="Service *"
          placeholder="Select a service"
          options={serviceOptions}
          value={selectedService}
          onSelect={setSelectedService}
        />
        <Select
          label="Barber *"
          placeholder="Select a barber"
          options={employeeOptions}
          value={selectedEmployee}
          onSelect={setSelectedEmployee}
        />
        <Input
          label="Your Name *"
          placeholder="Enter your name"
          value={clientName}
          onChangeText={setClientName}
        />
        <Input
          label="Phone"
          placeholder="Optional phone number"
          value={clientPhone}
          onChangeText={setClientPhone}
          keyboardType="phone-pad"
        />
        <Input
          label="Date *"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />
        <Input
          label="Time *"
          placeholder="HH:MM (24-hour)"
          value={time}
          onChangeText={setTime}
        />
        <Button
          title="Book Appointment"
          onPress={handleSubmit}
          loading={submitting}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 16,
  },
});