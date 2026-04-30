import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onSelect: (value: string) => void;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Select...',
  options,
  value,
  onSelect,
  error,
}) => {
  const [visible, setVisible] = useState(false);
  const selected = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.selector, error ? styles.selectorError : undefined]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.placeholder, selected && styles.selected]}>
          {selected?.label || placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>{label || 'Select Option'}</Text>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  option.value === value && styles.optionSelected,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  setVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    option.value === value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  selector: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorError: {
    borderColor: '#dc2626',
  },
  placeholder: {
    fontSize: 15,
    color: '#94a3b8',
  },
  selected: {
    color: '#0f172a',
  },
  arrow: {
    fontSize: 10,
    color: '#64748b',
  },
  error: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxHeight: '60%',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 15,
    color: '#334155',
  },
  optionTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
});