import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { clientService } from '../../services/supabase/client.service';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

interface CreateClientScreenProps {
  route: { params: { barbershopId: string } };
  navigation: any;
}

export const CreateClientScreen = (props: any) => {
  const { navigation } = props;
  const { barbershopId } = props.route.params;
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await clientService.createClient({
        barbershop_id: barbershopId,
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', 'Client created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen message="Creating client..." />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Input
            label="Client Name *"
            placeholder="e.g., John Doe"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
          <Input
            label="Phone"
            placeholder="Optional phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Input
            label="Email"
            placeholder="Optional email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Notes"
            placeholder="Optional notes about this client"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <View style={styles.buttonRow}>
            <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
            <Button title="Create" onPress={handleSubmit} loading={loading} style={styles.button} />
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