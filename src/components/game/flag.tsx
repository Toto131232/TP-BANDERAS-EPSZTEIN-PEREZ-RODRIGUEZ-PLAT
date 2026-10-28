import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useGame } from '@/context/game-context';

export function Flag() {
  const { current, mode } = useGame();
  if (!current) return null;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Image
        source={{ uri: current.flag }}
        style={styles.flag}
        contentFit="contain"
        transition={200}
        accessibilityLabel="Bandera a adivinar"
      />
      {mode === 'capitals' && (
        <ThemedText type="smallBold" style={styles.caption}>
          {current.name}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  flag: {
    width: '100%',
    aspectRatio: 3 / 2,
    maxHeight: 220,
  },
  caption: {
    textAlign: 'center',
  },
});
