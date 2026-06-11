import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { addSubscription, updateSubscription } from '../database/db';
import { IconPicker } from '../components/IconPicker';
import { getDominantColor } from '../utils/color';
import { DatePicker } from '../components/DatePicker';
import type { SubscriptionFormData, BillingCycle } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList, Subscription } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddSubscription'>;
  route: RouteProp<RootStackParamList, 'AddSubscription'>;
};

const today = new Date();
today.setHours(0, 0, 0, 0);

function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function AddSubscriptionScreen({ navigation, route }: Props) {
  const editingSub: Subscription | undefined = route.params?.subscription;
  const isEditing = !!editingSub;

  const [form, setForm] = useState<SubscriptionFormData>({
    name: editingSub?.name ?? '',
    price: editingSub?.price?.toString() ?? '',
    billing_cycle: editingSub?.billing_cycle ?? 'monthly',
    renewal_date: editingSub ? new Date(editingSub.renewal_date) : today,
    brand_id: editingSub?.brand_id ?? null,
    brand_color: editingSub?.brand_color ?? theme.colors.accent,
  });

  const nameAutoFilled = useRef(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Le nom est requis';
    const p = parseFloat(form.price.replace(',', '.'));
    if (!form.price || isNaN(p) || p <= 0) e.price = 'Prix invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const price = parseFloat(form.price.replace(',', '.'));
    const payload = {
      name: form.name.trim(),
      price,
      billing_cycle: form.billing_cycle,
      renewal_date: toIsoDate(form.renewal_date),
      brand_id: form.brand_id,
      brand_color: form.brand_color,
    };

    try {
      if (isEditing) {
        await updateSubscription(editingSub!.id, payload);
      } else {
        await addSubscription(payload);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Modifier' : 'Nouvel abonnement'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* Icon picker */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Icône</Text>
              <IconPicker
                selectedDomain={form.brand_id}
                onSelect={(domain, brandName) => {
                  const shouldUpdate = nameAutoFilled.current || form.name.trim() === '';
                  nameAutoFilled.current = true;
                  setForm((f) => ({
                    ...f,
                    brand_id: domain,
                    name: shouldUpdate ? brandName : f.name,
                  }));
                  getDominantColor(domain)
                    .then((color) => setForm((f) => ({ ...f, brand_color: color })))
                    .catch(() => {});
                }}
              />
            </View>

            {/* Name */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Nom</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="ex. Netflix, Gym, VPN..."
                placeholderTextColor={theme.colors.textMuted}
                value={form.name}
                onChangeText={(v) => {
                  nameAutoFilled.current = false;
                  setForm((f) => ({ ...f, name: v }));
                  if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
                }}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Price + cycle */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Prix</Text>
              <View style={styles.priceRow}>
                <View style={[styles.priceInputWrapper, errors.price && styles.inputError]}>
                  <Text style={styles.currencySymbol}>€</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.textMuted}
                    value={form.price}
                    onChangeText={(v) => {
                      setForm((f) => ({ ...f, price: v }));
                      if (errors.price) setErrors((e) => ({ ...e, price: undefined }));
                    }}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
                <View style={styles.cycleToggle}>
                  <TouchableOpacity
                    style={[styles.cycleBtn, form.billing_cycle === 'monthly' && styles.cycleBtnActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setForm((f) => ({ ...f, billing_cycle: 'monthly' }));
                    }}
                  >
                    <Text style={[styles.cycleBtnText, form.billing_cycle === 'monthly' && styles.cycleBtnTextActive]}>
                      /mois
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cycleBtn, form.billing_cycle === 'yearly' && styles.cycleBtnActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setForm((f) => ({ ...f, billing_cycle: 'yearly' }));
                    }}
                  >
                    <Text style={[styles.cycleBtnText, form.billing_cycle === 'yearly' && styles.cycleBtnTextActive]}>
                      /an
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>

            {/* Renewal date */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Date de renouvellement</Text>
              <DatePicker
                value={form.renewal_date}
                onChange={(date) => setForm((f) => ({ ...f, renewal_date: date }))}
              />
            </View>
          </ScrollView>

          {/* Save button */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85} style={styles.saveWrapper}>
              <LinearGradient
                colors={theme.colors.accentGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtn}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name={isEditing ? 'checkmark-circle' : 'add-circle'} size={20} color="#fff" />
                    <Text style={styles.saveBtnText}>
                      {isEditing ? 'Enregistrer les modifications' : "Ajouter l'abonnement"}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.font.sizes.lg,
    fontWeight: theme.font.weights.semibold,
    color: theme.colors.text,
  },
  content: {
    paddingVertical: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.font.sizes.xs,
    fontWeight: theme.font.weights.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
  },
  iconPickerWrapper: {
    marginHorizontal: -theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingVertical: 4,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    fontSize: theme.font.sizes.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.error,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  currencySymbol: {
    fontSize: theme.font.sizes.lg,
    fontWeight: theme.font.weights.semibold,
    color: theme.colors.textSecondary,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: theme.font.sizes.md,
    color: theme.colors.text,
  },
  cycleToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cycleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
  },
  cycleBtnActive: {
    backgroundColor: theme.colors.accent,
  },
  cycleBtnText: {
    fontSize: theme.font.sizes.sm,
    fontWeight: theme.font.weights.medium,
    color: theme.colors.textSecondary,
  },
  cycleBtnTextActive: {
    color: theme.colors.white,
  },
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
  dateConfirmBtn: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.md,
    padding: 12,
    alignItems: 'center',
  },
  dateConfirmText: {
    color: theme.colors.accent,
    fontWeight: theme.font.weights.semibold,
    fontSize: theme.font.sizes.md,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveWrapper: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: theme.radius.lg,
  },
  saveBtnText: {
    fontSize: theme.font.sizes.md,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.white,
  },
});
