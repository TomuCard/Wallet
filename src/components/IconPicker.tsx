import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface LogoResult {
  name: string;
  domain: string;
}

interface Props {
  selectedDomain: string | null;
  onSelect: (domain: string, name: string) => void;
}

export function IconPicker({ selectedDomain, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LogoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query.trim())}`
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une marque..."
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.grid} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : query.trim() === '' ? (
          <View style={styles.centered}>
            <Text style={styles.hint}>Tape le nom d'une marque</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.hint}>Aucun résultat</Text>
          </View>
        ) : (
          <View style={styles.gridInner}>
            {results.map((item) => {
              const isSelected = selectedDomain === item.domain;
              return (
                <TouchableOpacity
                  key={item.domain}
                  onPress={() => onSelect(item.domain, item.name)}
                  style={styles.item}
                  activeOpacity={0.75}
                >
                  <View style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}>
                    <Image
                      source={{
                        uri: `https://www.google.com/s2/favicons?domain=${item.domain}&sz=128`,
                      }}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.label, isSelected && styles.labelSelected]} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.font.sizes.md,
    color: theme.colors.text,
    paddingVertical: 0,
  },
  grid: {
    maxHeight: 240,
  },
  gridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.sm,
    gap: 4,
  },
  item: {
    width: '20%',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  iconWrapperSelected: {
    borderColor: theme.colors.accent,
  },
  logo: {
    width: 30,
    height: 30,
  },
  checkBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  label: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: theme.font.weights.medium,
    paddingHorizontal: 2,
  },
  labelSelected: {
    color: theme.colors.text,
  },
  centered: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sizes.sm,
  },
});
