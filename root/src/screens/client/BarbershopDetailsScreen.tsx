import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { barbershopService } from '../../services/supabase/barbershop.service';
import { serviceService } from '../../services/supabase/service.service';
import { Barbershop, Service } from '../../types/database.types';
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
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const [barbershopData, servicesData] = await Promise.all([
          barbershopService.getBarbershopById(barbershopId),
          serviceService.getServicesByBarbershop(barbershopId),
        ]);
        setBarbershop(barbershopData);
        setServices(servicesData);
      } catch (err: any) {
        setError(err.message || 'Failed to load barbershop');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [barbershopId]);

  if (loading) return <Loading fullScreen message="Loading..." />;
  if (error) return <Error message={error} onRetry={() => navigation.goBack()} fullScreen />;
  if (!barbershop) return null;

  return (
    <View style={styles.container}>
      <Card style={styles.infoCard}>
        <Text style={styles.name}>{barbershop.name}</Text>
        <Text style={styles.city}>{barbershop.city}</Text>
        {barbershop.address && <Text style={styles.info}>Address: {barbershop.address}</Text>}
        {barbershop.phone && <Text style={styles.info}>Phone: {barbershop.phone}</Text>}
        {barbershop.description && <Text style={styles.description}>{barbershop.description}</Text>}
      </Card>

      <Text style={styles.sectionTitle}>Services</Text>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No services available</Text>}
        renderItem={({ item }) => (
          <Card style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.servicePrice}>${(item.price_cents / 100).toFixed(2)}</Text>
            </View>
            {item.description && <Text style={styles.serviceDesc}>{item.description}</Text>}
            <Text style={styles.serviceDuration}>{item.duration_minutes} min</Text>
          </Card>
        )}
      />

      <Button
        title="Book Appointment"
        onPress={() => navigation.navigate('BookAppointment', { barbershopId })}
        style={styles.bookButton}
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
  infoCard: {
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  city: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: '#334155',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 12,
  },
  serviceCard: {
    marginBottom: 10,
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
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 20,
  },
  bookButton: {
    marginTop: 8,
  },
});