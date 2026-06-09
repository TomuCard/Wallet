import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { setBrandfetchKey } from '../utils/settings';

interface Props {
  visible: boolean;
  onSaved: () => void;
}

export function ApiKeyModal({ visible, onSaved }: Props) {
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!key.trim()) {
      setError('La clé ne peut pas être vide');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await setBrandfetchKey(key.trim());
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modal}>
          {/* Icon */}
          <View style={styles.iconRing}>
            <View style={styles.iconInner}>
              <Ionicons name="color-palette-outline" size={28} color={theme.colors.accent} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Clé Brandfetch</Text>
          <Text style={styles.subtitle}>
            Pour afficher les vraies couleurs des marques, entre ta clé API gratuite.
          </Text>

          {/* Link */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://brandfetch.com')}
            activeOpacity={0.7}
          >
            <Ionicons name="open-outline" size={13} color={theme.colors.accent} />
            <Text style={styles.linkText}>Obtenir une clé gratuite sur brandfetch.com</Text>
          </TouchableOpacity>

          {/* Input */}
          <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
            <Ionicons name="key-outline" size={16} color={theme.colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Colle ta clé ici..."
              placeholderTextColor={theme.colors.textMuted}
              value={key}
              onChangeText={(v) => { setKey(v); setError(''); }}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={false}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.hint}>500 requêtes/mois gratuites · stockée de façon sécurisée sur ton appareil</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.skipBtn} onPress={onSaved} activeOpacity={0.7}>
              <Text style={styles.skipText}>Plus tard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveWrapper}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={theme.colors.accentGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtn}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={17} color="#fff" />
                    <Text style={styles.saveText}>Enregistrer</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  modal: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(123,110,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  iconInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(123,110,246,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.font.sizes.lg,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.font.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
  },
  linkText: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.accent,
    fontWeight: theme.font.weights.medium,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    gap: 10,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: theme.font.sizes.sm,
    color: theme.colors.text,
  },
  errorText: {
    alignSelf: 'flex-start',
    fontSize: theme.font.sizes.xs,
    color: theme.colors.error,
    marginTop: 4,
  },
  hint: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    width: '100%',
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: theme.font.sizes.md,
    fontWeight: theme.font.weights.semibold,
    color: theme.colors.textSecondary,
  },
  saveWrapper: {
    flex: 1,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 14,
  },
  saveText: {
    fontSize: theme.font.sizes.md,
    fontWeight: theme.font.weights.bold,
    color: '#fff',
  },
});
