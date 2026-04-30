import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { Barbershop } from '../../types/database.types';
import { barbershopService } from '../../services/supabase/barbershop.service';
import { Loading } from '../../components/common/Loading';
import { Empty } from '../../components/common/Empty';
import { Error } from '../../components/ui/Error';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface SearchBarbershopsScreenProps {
  navigation: any;
}

export const SearchBarbershopsScreen = (props: any) => {
  const { navigation } = props;
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
    } catch (err: any) {
      setError(err.message || 'Failed to load barbershops');
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
    } catch (err: any) {
      setError(err.message || 'Failed to search barbershops');
    } finally {
      setLoading(false);
    }
  }, [query, fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) return <Loading fullScreen message="Loading barbershops..." />;

  return (
    <View style={styles.container}>
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
        renderItem={({ item }) => (
          <Card style={styles.barbershopCard}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.city}>{item.city}</Text>
            {item.description && <Text style={styles.description}>{item.description}</Text>}
            <Button
              title="View Details"
              variant="outline"
              onPress={() => navigation.navigate('BarbershopDetails', { barbershopId: item.id })}
              style={styles.detailsBtn}
            />
          </Card>
        )}
        ListEmptyComponent={
          <Empty title="No barbershops found" message="Try another city or refresh." />
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
  searchRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  detailsBtn: {
    marginTop: 10,
    minHeight: 40,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 10,
  },
});