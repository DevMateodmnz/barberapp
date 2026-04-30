import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { serviceService } from '../../services/supabase/service.service';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

interface CreateServiceScreenProps {
  route: { params: { barbershopId: string } };
  navigation: any;
}

export const CreateServiceScreen = (props: any) => {
  const { navigation } = props;
  const { barbershopId } = props.route.params;
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Service name is required';
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      newErrors.duration = 'Valid duration is required';
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = 'Valid price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await serviceService.createService({
        barbershop_id: barbershopId,
        name: name.trim(),
        description: description.trim() || undefined,
        duration_minutes: Number(duration),
        price_cents: Math.round(Number(price) * 100),
      });
      Alert.alert('Success', 'Service created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen message="Creating service..." />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Input
            label="Service Name *"
            placeholder="e.g., Haircut"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
          <Input
            label="Description"
            placeholder="Optional description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Input
            label="Duration (minutes) *"
            placeholder="e.g., 30"
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            error={errors.duration}
          />
          <Input
            label="Price *"
            placeholder="e.g., 25.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            error={errors.price}
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