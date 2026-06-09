import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import { theme } from "../constants/theme";
import { getMonthlyPrice, getYearlyPrice } from "../database/db";
import { getNextRenewalDate } from "../utils/renewal";
import type { Subscription, BillingCycle } from "../types";


const SIZE = 160;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 68;
const INNER_R = 42;

function arc(startDeg: number, endDeg: number): string {
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const x1 = CX + R * Math.cos(toRad(startDeg));
    const y1 = CY + R * Math.sin(toRad(startDeg));
    const x2 = CX + R * Math.cos(toRad(endDeg));
    const y2 = CY + R * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
}

interface Props {
    subscriptions: Subscription[];
    viewMode: BillingCycle;
    onToggleMode: () => void;
}

function getNextRenewal(subscriptions: Subscription[]): string | null {
    if (!subscriptions.length) return null;
    const upcoming = subscriptions.map((s) => getNextRenewalDate(s.renewal_date, s.billing_cycle)).sort((a, b) => a.getTime() - b.getTime());
    return upcoming[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export function StatsCard({ subscriptions, viewMode, onToggleMode }: Props) {
    const [showChart, setShowChart] = useState(false);

    const getPrice = (s: Subscription) => (viewMode === "monthly" ? getMonthlyPrice(s.price, s.billing_cycle) : getYearlyPrice(s.price, s.billing_cycle));

    const totalMonthly = subscriptions.reduce((sum, s) => sum + getMonthlyPrice(s.price, s.billing_cycle), 0);
    const totalYearly = subscriptions.reduce((sum, s) => sum + getYearlyPrice(s.price, s.billing_cycle), 0);
    const displayTotal = viewMode === "monthly" ? totalMonthly : totalYearly;
    const nextRenewal = getNextRenewal(subscriptions);
    const [intPart, decPart] = displayTotal.toFixed(2).split(".");

    const items = subscriptions.map((s) => ({
        name: s.name,
        price: getPrice(s),
        color: s.brand_color,
    }));

    const total = items.reduce((s, i) => s + i.price, 0);
    let angle = 0;
    const slices = items.map((item) => {
        const sweep = total > 0 ? (item.price / total) * 360 : 0;
        const slice = { ...item, start: angle, end: angle + sweep };
        angle += sweep;
        return slice;
    });

    return (
        <LinearGradient colors={["#2A1F6E", "#1A1430"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.label}>{viewMode === "monthly" ? "Total mensuel" : "Total annuel"}</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => setShowChart((v) => !v)} style={[styles.iconBtn, showChart && styles.iconBtnActive]} activeOpacity={0.8}>
                        <Ionicons name="pie-chart-outline" size={14} color={showChart ? theme.colors.accent : theme.colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onToggleMode} style={styles.toggleBtn} activeOpacity={0.8}>
                        <Ionicons name="swap-horizontal" size={14} color={theme.colors.text} />
                        <Text style={styles.toggleText}>{viewMode === "monthly" ? "Vue annuelle" : "Vue mensuelle"}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {showChart && subscriptions.length > 0 ? (
                <View style={styles.chartRow}>
                    <View style={styles.svgWrapper}>
                        <Svg width={SIZE} height={SIZE}>
                            {slices.length === 1 ? <Circle cx={CX} cy={CY} r={R} fill={slices[0].color} /> : slices.map((s, i) => <Path key={i} d={arc(s.start, s.end)} fill={s.color} stroke="#1A1430" strokeWidth={2} />)}
                            <Circle cx={CX} cy={CY} r={INNER_R} fill="#1A1430" />
                        </Svg>
                        <View style={styles.centerOverlay} pointerEvents="none">
                            <Text style={styles.centerAmount}>{displayTotal.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}€</Text>
                            <Text style={styles.centerLabel}>/{viewMode === "monthly" ? "mois" : "an"}</Text>
                        </View>
                    </View>

                    <View style={styles.legend}>
                        {slices.map((s, i) => (
                            <View key={i} style={styles.legendRow}>
                                <View style={[styles.dot, { backgroundColor: s.color }]} />
                                <Text style={styles.legendName} numberOfLines={1}>
                                    {s.name}
                                </Text>
                                <Text style={styles.legendValue}>{s.price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}€</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ) : (
                <>
                    <View style={styles.amountRow}>
                        <Text style={styles.currency}>€</Text>
                        <Text style={styles.amount}>{intPart}</Text>
                        <Text style={styles.decimal}>.{decPart}</Text>
                    </View>
                    <View style={styles.footer}>
                        <View style={styles.statChip}>
                            <Ionicons name="layers-outline" size={12} color={theme.colors.accent} />
                            <Text style={styles.statText}>
                                {subscriptions.length} abonnement{subscriptions.length !== 1 ? "s" : ""}
                            </Text>
                        </View>
                        {nextRenewal && (
                            <View style={styles.statChip}>
                                <Ionicons name="calendar-outline" size={12} color={theme.colors.accent} />
                                <Text style={styles.statText}>Prochain : {nextRenewal}</Text>
                            </View>
                        )}
                        {viewMode === "monthly" && (
                            <View style={styles.statChip}>
                                <Ionicons name="trending-up-outline" size={12} color={theme.colors.accent} />
                                <Text style={styles.statText}>{totalYearly.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}€/an</Text>
                            </View>
                        )}
                    </View>
                </>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: "rgba(123, 110, 246, 0.25)",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.font.sizes.sm,
        color: "rgba(255,255,255,0.5)",
        fontWeight: theme.font.weights.medium,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
    iconBtnActive: {
        backgroundColor: "rgba(123, 110, 246, 0.3)",
    },
    toggleBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.radius.full,
    },
    toggleText: {
        fontSize: theme.font.sizes.xs,
        color: theme.colors.text,
        fontWeight: theme.font.weights.medium,
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: theme.spacing.lg,
    },
    currency: {
        fontSize: theme.font.sizes.xl,
        color: "rgba(255,255,255,0.6)",
        fontWeight: theme.font.weights.bold,
        marginTop: 8,
        marginRight: 3,
    },
    amount: {
        fontSize: 52,
        color: theme.colors.white,
        fontWeight: theme.font.weights.extrabold,
        lineHeight: 60,
        letterSpacing: -1,
    },
    decimal: {
        fontSize: theme.font.sizes.xl,
        color: "rgba(255,255,255,0.5)",
        fontWeight: theme.font.weights.bold,
        marginTop: 10,
        marginLeft: 2,
    },
    footer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    statChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(123, 110, 246, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.radius.full,
    },
    statText: {
        fontSize: theme.font.sizes.xs,
        color: "rgba(255,255,255,0.7)",
        fontWeight: theme.font.weights.medium,
    },
    chartRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
    },
    svgWrapper: {
        width: SIZE,
        height: SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    centerOverlay: {
        position: "absolute",
        alignItems: "center",
    },
    centerAmount: {
        fontSize: theme.font.sizes.md,
        fontWeight: theme.font.weights.bold,
        color: theme.colors.white,
    },
    centerLabel: {
        fontSize: theme.font.sizes.xs,
        color: "rgba(255,255,255,0.5)",
        marginTop: 1,
    },
    legend: {
        flex: 1,
        gap: 7,
    },
    legendRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        flexShrink: 0,
    },
    legendName: {
        flex: 1,
        fontSize: theme.font.sizes.xs,
        color: "rgba(255,255,255,0.8)",
        fontWeight: theme.font.weights.medium,
    },
    legendValue: {
        fontSize: theme.font.sizes.xs,
        color: "rgba(255,255,255,0.5)",
    },
});
