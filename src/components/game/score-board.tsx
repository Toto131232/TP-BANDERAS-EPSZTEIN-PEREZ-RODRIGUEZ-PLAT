import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useGame } from '@/context/game-context';

export function ScoreBoard() {
  const { player, score, resetScore } = useGame();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedView type="backgroundElement" style={styles.info}>
        <ThemedText type="small" themeColor="textSecondary">
          Jugador
        </ThemedText>
        <ThemedText type="smallBold">{player}</ThemedText>
      </ThemedView>
      <ThemedView type="backgroundElement" style={styles.info}>
        <ThemedText type="small" themeColor="textSecondary">
          Puntos
        </ThemedText>
        <ThemedText type="subtitle">{score}</ThemedText>
      </ThemedView>
      <Pressable onPress={resetScore} style={({ pressed }) => pressed && styles.pressed}>
        <ThemedText type="linkPrimary">Reiniciar</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  info: {
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
