import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorProps {
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const Error: React.FC<ErrorProps> = ({
  message,
  onRetry,
  fullScreen = false,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  icon: {
    fontSize: 32,
  },
  message: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 280,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});