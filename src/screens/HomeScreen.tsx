import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { theme } from "../constants/theme";
import { getAllSubscriptions, deleteSubscription } from "../database/db";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { StatsCard } from "../components/StatsCard";
import { ApiKeyModal } from "../components/ApiKeyModal";
import type { Subscription, BillingCycle } from "../types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

export function HomeScreen({ navigation }: Props) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<BillingCycle>("monthly");
    const [showApiModal, setShowApiModal] = useState(false);

    const loadSubscriptions = useCallback(async () => {
        try {
            const data = await getAllSubscriptions();
            setSubscriptions(data);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadSubscriptions();
        }, [loadSubscriptions]),
    );

    async function handleDelete(id: number) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await deleteSubscription(id);
        setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }

    function handleAddPress() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate("AddSubscription");
    }

    function handleEditPress(subscription: Subscription) {
        navigation.navigate("AddSubscription", { subscription });
    }

    function toggleViewMode() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setViewMode((m) => (m === "monthly" ? "yearly" : "monthly"));
    }

    if (loading) {
        return (
            <View style={[styles.root, styles.centered]}>
                <ActivityIndicator color={theme.colors.accent} size="large" />
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Wallet by Tomu</Text>
                        <Text style={styles.title}>Mes abonnements</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => setShowApiModal(true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-outline" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={subscriptions}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                loadSubscriptions();
                            }}
                            tintColor={theme.colors.accent}
                        />
                    }
                    ListHeaderComponent={
                        <StatsCard
                            subscriptions={subscriptions}
                            viewMode={viewMode}
                            onToggleMode={toggleViewMode}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="wallet-outline" size={40} color={theme.colors.textMuted} />
                            </View>
                            <Text style={styles.emptyTitle}>Aucun abonnement</Text>
                            <Text style={styles.emptySubtitle}>
                                Ajoutez votre premier abonnement pour commencer à suivre vos dépenses.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <SubscriptionCard
                            subscription={item}
                            viewMode={viewMode}
                            onPress={() => handleEditPress(item)}
                            onDelete={() => handleDelete(item.id)}
                        />
                    )}
                />
            </SafeAreaView>

            <ApiKeyModal visible={showApiModal} onSaved={() => setShowApiModal(false)} />

            <TouchableOpacity style={styles.fab} onPress={handleAddPress} activeOpacity={0.85}>
                <LinearGradient
                    colors={theme.colors.accentGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
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
    centered: {
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.lg,
    },
    greeting: {
        fontSize: theme.font.sizes.sm,
        color: theme.colors.textSecondary,
        fontWeight: theme.font.weights.medium,
        marginBottom: 2,
    },
    title: {
        fontSize: theme.font.sizes.xxl,
        fontWeight: theme.font.weights.extrabold,
        color: theme.colors.text,
        letterSpacing: -0.5,
    },
    list: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 100,
    },
    empty: {
        alignItems: "center",
        paddingTop: theme.spacing.xxl,
        paddingHorizontal: theme.spacing.xl,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.surface,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
        fontSize: theme.font.sizes.lg,
        fontWeight: theme.font.weights.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
        fontSize: theme.font.sizes.sm,
        color: theme.colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
    },
    fab: {
        position: "absolute",
        bottom: 36,
        right: theme.spacing.lg,
        borderRadius: 30,
        shadowColor: theme.colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 12,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    settingsBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
});
