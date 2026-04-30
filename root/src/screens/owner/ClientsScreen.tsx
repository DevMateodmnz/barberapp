import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { clientService } from '../../services/supabase/client.service';
import { Client } from '../../types/database.types';
import { Loading } from '../../components/common/Loading';
import { Empty } from '../../components/common/Empty';
import { Error } from '../../components/ui/Error';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface ClientsScreenProps {
  route: { params: { barbershopId: string } };
  navigation: any;
}

export const ClientsScreen = (props: any) => {
  const { navigation } = props;
  const { barbershopId } = props.route.params;
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setError(null);
      const data = await clientService.getClientsByBarbershop(barbershopId);
      setClients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async (clientId: string) => {
    Alert.alert('Delete Client', 'Are you sure you want to delete this client?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await clientService.deleteClient(clientId);
            fetchClients();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete client');
          }
        },
      },
    ]);
  };

  if (loading) return <Loading fullScreen message="Loading clients..." />;
  if (error) return <Error message={error} onRetry={fetchClients} fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Button
            title="Add Client"
            onPress={() => navigation.navigate('CreateClient', { barbershopId })}
            style={styles.addButton}
          />
        }
        ListEmptyComponent={<Empty title="No clients yet" message="Add your first client." />}
        renderItem={({ item }) => (
          <Card style={styles.clientCard}>
            <View style={styles.clientHeader}>
              <Text style={styles.clientName}>{item.name}</Text>
            </View>
            {item.phone && <Text style={styles.clientInfo}>Phone: {item.phone}</Text>}
            {item.email && <Text style={styles.clientInfo}>Email: {item.email}</Text>}
            {item.notes && <Text style={styles.clientNotes}>{item.notes}</Text>}
            <View style={styles.clientActions}>
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
  clientCard: {
    marginBottom: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  clientInfo: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  clientNotes: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  clientActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    minHeight: 36,
  },
});