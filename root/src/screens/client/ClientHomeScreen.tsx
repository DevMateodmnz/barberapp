import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Barbershop } from '../../types/database.types';
import { useAuthStore } from '../../store/authStore';
import { barbershopService } from '../../services/supabase/barbershop.service';
import { Loading } from '../../components/common/Loading';
import { Empty } from '../../components/common/Empty';
import { Button } from '../../components/ui/Button';
import { BarbershopCard } from '../../components/common/BarbershopCard';

export const ClientHomeScreen: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const data = await barbershopService.getAllBarbershops();
      setBarbershops(data);
    } catch (fetchError: any) {
      setError(fetchError.message || 'Failed to load barbershops');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const search = useCallback(async () => {
    if (!query.trim()) {
      fetchAll();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await barbershopService.searchByCity(query.trim());
      setBarbershops(data);
    } catch (fetchError: any) {
      setError(fetchError.message || 'Failed to search barbershops');
    } finally {
      setLoading(false);
    }
  }, [fetchAll, query]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return <Loading fullScreen message="Loading barbershops..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>Discover Barbershops</Text>
          <Text style={styles.subtitle}>Hi, {user?.display_name || user?.email}</Text>
        </View>
        <Button title="Sign Out" variant="outline" onPress={signOut} />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search by city..."
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
        <Button title="Search" onPress={search} />
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
              fetchAll();
            }}
          />
        }
        renderItem={({ item }) => <BarbershopCard barbershop={item} />}
        ListEmptyComponent={
          <Empty title="No barbershops found" message="Try another city or refresh the list." />
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
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 10,
  },
});
