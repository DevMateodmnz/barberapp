import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { employeeService } from '../../services/supabase/employee.service';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

interface AddEmployeeScreenProps {
  route: { params: { barbershopId: string } };
  navigation: any;
}

export const AddEmployeeScreen = (props: any) => {
  const { navigation } = props;
  const { barbershopId } = props.route.params;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid email is required';
    if (!displayName.trim()) newErrors.displayName = 'Display name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await employeeService.inviteBarberByEmail(barbershopId, email.trim(), displayName.trim());
      Alert.alert('Success', 'Employee added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen message="Adding employee..." />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Input
            label="Barber Email *"
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Input
            label="Display Name *"
            placeholder="e.g., John Doe"
            value={displayName}
            onChangeText={setDisplayName}
            error={errors.displayName}
          />
          <View style={styles.buttonRow}>
            <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
            <Button title="Add" onPress={handleSubmit} loading={loading} style={styles.button} />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    padding: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});