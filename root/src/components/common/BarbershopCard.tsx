import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Barbershop } from '../../types/database.types';

interface BarbershopCardProps {
  barbershop: Barbershop;
}

export const BarbershopCard: React.FC<BarbershopCardProps> = ({ barbershop }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{barbershop.name}</Text>
      <Text style={styles.city}>{barbershop.city}</Text>
      {barbershop.address ? <Text style={styles.meta}>Address: {barbershop.address}</Text> : null}
      {barbershop.phone ? <Text style={styles.meta}>Phone: {barbershop.phone}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  city: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    color: '#64748b',
  },
});
