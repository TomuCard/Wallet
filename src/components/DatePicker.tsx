import React, { useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

function toHtmlDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function fromHtmlDate(s: string): Date {
  const [y, m, day] = s.split('-').map(Number);
  return new Date(y, m - 1, day);
}

function formatDisplay(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function DatePicker({ value, onChange }: Props) {
  const [showNative, setShowNative] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webWrapper}>
        <Ionicons name="calendar-outline" size={18} color={theme.colors.accent} />
        <Text style={styles.webLabel}>{formatDisplay(value)}</Text>
        <TextInput
          style={styles.webInput}
          value={toHtmlDate(value)}
          onChangeText={(v) => {
            if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
              onChange(fromHtmlDate(v));
            }
          }}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.textMuted}
          maxLength={10}
          keyboardType="default"
        />
      </View>
    );
  }

  // Native
  const DateTimePicker = require('@react-native-community/datetimepicker').default;

  return (
    <View>
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowNative(true)}
      >
        <Ionicons name="calendar-outline" size={18} color={theme.colors.accent} />
        <Text style={styles.dateBtnText}>{formatDisplay(value)}</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
      </TouchableOpacity>

      {showNative && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_: any, date?: Date) => {
            if (Platform.OS === 'android') setShowNative(false);
            if (date) onChange(date);
          }}
          minimumDate={new Date(2020, 0, 1)}
          themeVariant="dark"
        />
      )}
      {showNative && Platform.OS === 'ios' && (
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => setShowNative(false)}
        >
          <Text style={styles.confirmText}>Confirmer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  dateBtnText: {
    flex: 1,
    fontSize: theme.font.sizes.md,
    color: theme.colors.text,
    fontWeight: theme.font.weights.medium,
  },
  confirmBtn: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.md,
    padding: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: theme.colors.accent,
    fontWeight: theme.font.weights.semibold,
    fontSize: theme.font.sizes.md,
  },
  webWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  webLabel: {
    flex: 1,
    fontSize: theme.font.sizes.md,
    color: theme.colors.text,
    fontWeight: theme.font.weights.medium,
  },
  webInput: {
    fontSize: theme.font.sizes.sm,
    color: theme.colors.textSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 110,
  },
});
