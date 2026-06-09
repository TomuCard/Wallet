import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { theme } from '../constants/theme';
import { BrandIcon } from './BrandIcon';
import { getMonthlyPrice, getYearlyPrice } from '../database/db';
import { getNextRenewalDate, daysUntil } from '../utils/renewal';
import type { Subscription, BillingCycle } from '../types';

const SWIPE_THRESHOLD = -72;
const SWIPE_MAX = -100;

interface Props {
  subscription: Subscription;
  viewMode: BillingCycle;
  onPress: () => void;
  onDelete: () => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function SubscriptionCard({ subscription, viewMode, onPress, onDelete }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState(false);

  const cardBg = translateX.interpolate({
    inputRange: [SWIPE_MAX, 0],
    outputRange: [theme.colors.error, theme.colors.surface],
    extrapolate: 'clamp',
  });

  const trashOpacity = translateX.interpolate({
    inputRange: [SWIPE_MAX, SWIPE_THRESHOLD, 0],
    outputRange: [1, 0.6, 0],
    extrapolate: 'clamp',
  });

  const springBack = () =>
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
      tension: 60,
      friction: 8,
    }).start();

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.5 && dx < 0,
      onPanResponderMove: (_, { dx }) => {
        translateX.setValue(Math.max(dx, SWIPE_MAX));
      },
      onPanResponderRelease: (_, { dx }) => {
        springBack();
        if (dx < SWIPE_THRESHOLD) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setShowModal(true);
        }
      },
      onPanResponderTerminate: () => springBack(),
    }),
  ).current;

  const nextRenewal = getNextRenewalDate(subscription.renewal_date, subscription.billing_cycle);
  const days = daysUntil(nextRenewal);

  const displayPrice =
    viewMode === 'monthly'
      ? getMonthlyPrice(subscription.price, subscription.billing_cycle)
      : getYearlyPrice(subscription.price, subscription.billing_cycle);

  const isUrgent = days <= 7;
  const renewalColor = isUrgent ? theme.colors.warning : theme.colors.textMuted;
  const renewalLabel =
    days === 0 ? "Aujourd'hui" : days === 1 ? 'Demain' : `Dans ${days}j`;

  return (
    <>
      <View style={styles.wrapper}>
        <Animated.View style={[styles.deleteHint, { opacity: trashOpacity }]}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </Animated.View>

        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.card, { backgroundColor: cardBg, transform: [{ translateX }] }]}
        >
          <TouchableOpacity style={styles.inner} onPress={onPress} activeOpacity={0.75}>
            <View style={styles.left}>
              <BrandIcon domain={subscription.brand_id} size={46} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{subscription.name}</Text>
                <View style={styles.renewalRow}>
                  <View style={[styles.renewalDot, { backgroundColor: renewalColor }]} />
                  <Text style={[styles.renewalText, { color: renewalColor }]}>{renewalLabel}</Text>
                  <Text style={styles.renewalDate}> · {formatDate(nextRenewal)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.price}>
                {displayPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
              </Text>
              <Text style={styles.cycle}>{viewMode === 'monthly' ? '/mois' : '/an'}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Modal visible={showModal} transparent animationType="fade" statusBarTranslucent>
        <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            {/* Icon */}
            <View style={styles.iconRing}>
              <View style={styles.iconInner}>
                <Ionicons name="trash-outline" size={28} color={theme.colors.error} />
              </View>
            </View>

            {/* Text */}
            <Text style={styles.modalTitle}>Supprimer l'abonnement</Text>
            <Text style={styles.modalSub}>
              Voulez-vous vraiment supprimer{'\n'}
              <Text style={styles.modalName}>"{subscription.name}"</Text>
              {' '}?
            </Text>
            <Text style={styles.modalWarn}>Cette action est irréversible.</Text>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteWrapper}
                onPress={() => {
                  setShowModal(false);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  onDelete();
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#FF4D6D', '#C9184A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={16} color="#fff" />
                  <Text style={styles.deleteText}>Supprimer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.sm,
    position: 'relative',
  },
  deleteHint: {
    position: 'absolute',
    right: theme.spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.font.sizes.md,
    fontWeight: theme.font.weights.semibold,
    color: theme.colors.text,
    marginBottom: 3,
  },
  renewalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  renewalDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  renewalText: {
    fontSize: theme.font.sizes.xs,
    fontWeight: theme.font.weights.medium,
  },
  renewalDate: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.textMuted,
  },
  priceBlock: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  price: {
    fontSize: theme.font.sizes.lg,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.text,
  },
  cycle: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.textSecondary,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    backgroundColor: 'rgba(255,77,109,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  iconInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,77,109,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: theme.font.sizes.lg,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: theme.font.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalName: {
    color: theme.colors.text,
    fontWeight: theme.font.weights.semibold,
  },
  modalWarn: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: 6,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: theme.font.sizes.md,
    fontWeight: theme.font.weights.semibold,
    color: theme.colors.textSecondary,
  },
  deleteWrapper: {
    flex: 1,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 14,
  },
  deleteText: {
    fontSize: theme.font.sizes.md,
    fontWeight: theme.font.weights.bold,
    color: '#fff',
  },
});
