import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useGame } from '@/context/game-context';

export function Hints() {
  const { current, mode, revealed, requestHint } = useGame();
  if (!current) return null;

  // Modo banderas: "_ r _ _ _ _ _ _ _" con las letras que ya se revelaron.
  const masked = [...current.name]
    .map((ch, i) => (!ch.trim() ? ' ' : revealed.includes(i) ? ch : '_'))
    .join(' ');

  return (
    <ThemedView style={styles.container}>
      {mode === 'flags' && (
        <ThemedText type="code" style={styles.masked}>
          {masked}
        </ThemedText>
      )}
      <Pressable
        onPress={requestHint}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <ThemedText type="smallBold" style={styles.buttonText}>
          {mode === 'flags' ? '💡 Revelar una letra (−2s)' : '💡 Borrar una opción (−2s)'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  masked: {
    fontSize: 18,
    letterSpacing: 1,
    textAlign: 'center',
  },
  button: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#E3A008',
  },
  buttonText: {
    color: '#E3A008',
  },
  pressed: {
    opacity: 0.6,
  },
});
