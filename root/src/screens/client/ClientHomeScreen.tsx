import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { Barbershop } from '../../types/database.types';
import { useAuthStore } from '../../store/authStore';
import { barbershopService } from '../../services/supabase/barbershop.service';
import { Loading } from '../../components/common/Loading';
import { Empty } from '../../components/common/Empty';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const ClientHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, signOut } = useAuthStore();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const data = await barbershopService.getAllBarbershops();
      setBarbershops(data);
    } catch (err) {
      console.error('Failed to load barbershops:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) return <Loading fullScreen message="Loading barbershops..." />;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>Discover Barbershops</Text>
          <Text style={styles.subtitle}>Hi, {user?.display_name || user?.email}</Text>
        </View>
        <Button title="Sign Out" variant="outline" onPress={signOut} />
      </View>

      <View style={styles.actionsRow}>
        <Button
          title="Search"
          onPress={() => navigation.navigate('SearchBarbershops')}
          style={styles.actionBtn}
        />
        <Button
          title="My Appointments"
          variant="outline"
          onPress={() => navigation.navigate('MyAppointments')}
          style={styles.actionBtn}
        />
      </View>

      <FlatList
        data={barbershops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} />
        }
        renderItem={({ item }) => (
          <Card style={styles.barbershopCard}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.city}>{item.city}</Text>
            {item.description && <Text style={styles.description}>{item.description}</Text>}
            <Button
              title="View & Book"
              onPress={() => navigation.navigate('BarbershopDetails', { barbershopId: item.id })}
              style={styles.bookBtn}
            />
          </Card>
        )}
        ListEmptyComponent={<Empty title="No barbershops" message="No barbershops available yet." />}
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    fontSize: 13,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  barbershopCard: {
    marginBottom: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
  },
  city: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
  },
  bookBtn: {
    marginTop: 10,
  },
});