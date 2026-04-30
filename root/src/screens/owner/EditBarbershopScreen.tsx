import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { barbershopService } from '../../services/supabase/barbershop.service';
import { Barbershop } from '../../types/database.types';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

interface EditBarbershopScreenProps {
  route: { params: { barbershopId: string } };
  navigation: any;
}

export const EditBarbershopScreen = (props: any) => {
  const { route, navigation } = props;
  const { barbershopId } = route.params;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadBarbershop = async () => {
      try {
        const data = await barbershopService.getBarbershopById(barbershopId);
        setName(data.name || '');
        setCity(data.city || '');
        setAddress(data.address || '');
        setPhone(data.phone || '');
        setDescription(data.description || '');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load barbershop');
      } finally {
        setFetching(false);
      }
    };
    loadBarbershop();
  }, [barbershopId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await barbershopService.updateBarbershop(barbershopId, {
        name: name.trim(),
        city: city.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        description: description.trim() || undefined,
      });
      Alert.alert('Success', 'Barbershop updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update barbershop');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loading fullScreen message="Loading barbershop..." />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Input
            label="Barbershop Name *"
            placeholder="e.g., Classic Cuts"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
          <Input
            label="City *"
            placeholder="e.g., Buenos Aires"
            value={city}
            onChangeText={setCity}
            error={errors.city}
          />
          <Input
            label="Address"
            placeholder="Optional address"
            value={address}
            onChangeText={setAddress}
          />
          <Input
            label="Phone"
            placeholder="Optional phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Input
            label="Description"
            placeholder="Brief description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View style={styles.buttonRow}>
            <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
            <Button title="Save" onPress={handleSubmit} loading={loading} style={styles.button} />
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