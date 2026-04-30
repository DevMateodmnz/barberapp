import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { barbershopService } from '../../services/supabase/barbershop.service';
import { serviceService } from '../../services/supabase/service.service';
import { Service } from '../../types/database.types';
import { Loading } from '../../components/common/Loading';
import { Empty } from '../../components/common/Empty';
import { Error } from '../../components/ui/Error';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Text } from 'react-native';

interface ServicesScreenProps {
  route: { params: { barbershopId: string } };
  navigation: any;
}

export const ServicesScreen = (props: any) => {
  const { navigation } = props;
  const { barbershopId } = props.route.params;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setError(null);
      const data = await serviceService.getServicesByBarbershop(barbershopId);
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDelete = async (serviceId: string) => {
    Alert.alert('Delete Service', 'Are you sure you want to delete this service?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await serviceService.deleteService(serviceId);
            fetchServices();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete service');
          }
        },
      },
    ]);
  };

  if (loading) return <Loading fullScreen message="Loading services..." />;
  if (error) return <Error message={error} onRetry={fetchServices} fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Button
            title="Add New Service"
            onPress={() => navigation.navigate('CreateService', { barbershopId })}
            style={styles.addButton}
          />
        }
        ListEmptyComponent={<Empty title="No services yet" message="Add your first service to get started." />}
        renderItem={({ item }) => (
          <Card style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.servicePrice}>${(item.price_cents / 100).toFixed(2)}</Text>
            </View>
            {item.description && <Text style={styles.serviceDesc}>{item.description}</Text>}
            <Text style={styles.serviceDuration}>{item.duration_minutes} min</Text>
            <View style={styles.serviceActions}>
              <Button
                title="Delete"
                variant="danger"
                onPress={() => handleDelete(item.id)}
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
  serviceCard: {
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  serviceDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  serviceDuration: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  serviceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    minHeight: 36,
  },
});