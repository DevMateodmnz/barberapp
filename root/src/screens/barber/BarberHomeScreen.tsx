import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Barbershop } from '../../types/database.types';
import { useAuthStore } from '../../store/authStore';
import { employeeService } from '../../services/supabase/employee.service';
import { Loading } from '../../components/common/Loading';
import { Empty } from '../../components/common/Empty';
import { Button } from '../../components/ui/Button';
import { BarbershopCard } from '../../components/common/BarbershopCard';

export const BarberHomeScreen: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      const data = await employeeService.getBarbershopsByUser(user.id);
      setBarbershops(data);
    } catch (fetchError: any) {
      setError(fetchError.message || 'Failed to load your barbershops');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <Loading fullScreen message="Loading your assigned barbershops..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>Barber Panel</Text>
          <Text style={styles.subtitle}>Welcome, {user?.display_name || user?.email}</Text>
        </View>
        <Button title="Sign Out" variant="outline" onPress={signOut} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={barbershops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
          />
        }
        renderItem={({ item }) => <BarbershopCard barbershop={item} />}
        ListEmptyComponent={
          <Empty
            title="No assignments yet"
            message="You are not assigned to any active barbershop yet."
          />
        }
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  listContent: {
    paddingBottom: 20,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 10,
  },
});
