import { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface Props {
  domain: string | null;
  size?: number;
}

export function BrandIcon({ domain, size = 48 }: Props) {
  const [error, setError] = useState(false);
  const showLogo = !!domain && !error;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      {showLogo ? (
        <Image
          source={{ uri: `https://www.google.com/s2/favicons?domain=${domain}&sz=128` }}
          style={{ width: size * 0.6, height: size * 0.6 }}
          onError={() => setError(true)}
          resizeMode="contain"
        />
      ) : (
        <Ionicons name="apps-outline" size={size * 0.48} color={theme.colors.textMuted} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
