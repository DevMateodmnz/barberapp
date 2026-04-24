import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/database.types';

type AuthNavigation = {
  goBack: () => void;
};

interface RegisterScreenProps {
  navigation: AuthNavigation;
}

const roles: UserRole[] = ['owner', 'barber', 'client'];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const { signUp, loading, error, setError } = useAuthStore();

  const onSubmit = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setError('Name, email and password are required');
      return;
    }

    try {
      await signUp(email, password, role, displayName.trim());
      navigation.goBack();
    } catch {
      // Error is handled in store
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          placeholder="Display name"
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.roleLabel}>Role</Text>
        <View style={styles.roleRow}>
          {roles.map((item) => (
            <Pressable
              key={item}
              onPress={() => setRole(item)}
              style={[styles.roleChip, role === item && styles.roleChipActive]}
            >
              <Text style={[styles.roleText, role === item && styles.roleTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Create Account" onPress={onSubmit} loading={loading} />
        <Button
          title="Back to login"
          variant="outline"
          onPress={navigation.goBack}
          style={styles.backBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  roleChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  roleText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#1d4ed8',
  },
  error: {
    color: '#b91c1c',
    marginBottom: 10,
    fontSize: 13,
  },
  backBtn: {
    marginTop: 10,
  },
});
