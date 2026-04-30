import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Barbershop } from '../../types/database.types';
import { useAuthStore } from '../../store/authStore';
import { barbershopService } from '../../services/supabase/barbershop.service';
import { Loading } from '../../components/common/Loading';
import { Empty } from '../../components/common/Empty';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const OwnerHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, signOut } = useAuthStore();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      const data = await barbershopService.getMyBarbershops(user.id);
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
    return <Loading fullScreen message="Loading your barbershops..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>Owner Panel</Text>
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
        ListHeaderComponent={
          <Button
            title="+ Create Barbershop"
            onPress={() => navigation.navigate('CreateBarbershop')}
            style={styles.createButton}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('BarbershopDetails', { barbershopId: item.id })}>
            <Card style={styles.barbershopCard}>
              <Text style={styles.barbershopName}>{item.name}</Text>
              <Text style={styles.barbershopCity}>{item.city}</Text>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Empty title="No barbershops yet" message="Create your first barbershop to get started." />
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
  createButton: {
    marginBottom: 16,
  },
  barbershopCard: {
    marginBottom: 12,
  },
  barbershopName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
  },
  barbershopCity: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
});