import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { barbershopService } from '../../services/supabase/barbershop.service';
import { Barbershop } from '../../types/database.types';
import { Loading } from '../../components/common/Loading';
import { Error } from '../../components/ui/Error';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface BarbershopDetailsScreenProps {
  route: { params: { barbershopId: string } };
  navigation: any;
}

export const BarbershopDetailsScreen = (props: any) => {
  const { navigation } = props;
  const { barbershopId } = props.route.params;
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBarbershop = async () => {
      try {
        setError(null);
        const data = await barbershopService.getBarbershopById(barbershopId);
        setBarbershop(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load barbershop');
      } finally {
        setLoading(false);
      }
    };
    loadBarbershop();
  }, [barbershopId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Barbershop',
      'Are you sure? This will deactivate the barbershop.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await barbershopService.deleteBarbershop(barbershopId);
              navigation.navigate('OwnerHome');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete barbershop');
            }
          },
        },
      ]
    );
  };

  if (loading) return <Loading fullScreen message="Loading..." />;
  if (error) return <Error message={error} onRetry={() => navigation.goBack()} fullScreen />;
  if (!barbershop) return null;

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.name}>{barbershop.name}</Text>
        <Text style={styles.city}>{barbershop.city}</Text>
        {barbershop.address && <Text style={styles.info}>Address: {barbershop.address}</Text>}
        {barbershop.phone && <Text style={styles.info}>Phone: {barbershop.phone}</Text>}
        {barbershop.description && <Text style={styles.description}>{barbershop.description}</Text>}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Edit"
          onPress={() => navigation.navigate('EditBarbershop', { barbershopId })}
          style={styles.actionButton}
        />
        <Button
          title="Services"
          variant="outline"
          onPress={() => navigation.navigate('Services', { barbershopId })}
          style={styles.actionButton}
        />
        <Button
          title="Employees"
          variant="outline"
          onPress={() => navigation.navigate('Employees', { barbershopId })}
          style={styles.actionButton}
        />
        <Button
          title="Clients"
          variant="outline"
          onPress={() => navigation.navigate('Clients', { barbershopId })}
          style={styles.actionButton}
        />
        <Button
          title="Agenda"
          variant="outline"
          onPress={() => navigation.navigate('Agenda', { barbershopId })}
          style={styles.actionButton}
        />
        <Button
          title="Delete"
          variant="danger"
          onPress={handleDelete}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  city: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    marginTop: 8,
  },
  actions: {
    gap: 10,
  },
  actionButton: {
    marginBottom: 0,
  },
});