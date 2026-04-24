import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EmptyProps {
  title: string;
  message: string;
}

export const Empty: React.FC<EmptyProps> = ({ title, message }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
  },
  title: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  message: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});
