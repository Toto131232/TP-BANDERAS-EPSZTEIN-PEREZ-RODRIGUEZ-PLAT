import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ROUND_SECONDS, useGame } from '@/context/game-context';

export function Timer() {
  const { timeLeft } = useGame();
  const ratio = timeLeft / ROUND_SECONDS;
  const color = ratio > 0.5 ? '#2EA44F' : ratio > 0.2 ? '#E3A008' : '#E5484D';

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" style={[styles.seconds, { color }]}>
        {timeLeft}s
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.track}>
        <View style={[styles.bar, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  seconds: {
    width: 36,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 5,
  },
});
