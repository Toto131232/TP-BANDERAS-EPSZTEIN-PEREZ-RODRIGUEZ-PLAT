import { ScrollView, StyleSheet } from 'react-native';

import { Leaderboard } from '@/components/game/leaderboard';
import { PlayerForm } from '@/components/game/player-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText type="subtitle" style={styles.title}>
          🌍 ¿De dónde es?
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.title}>
          +10 por acierto, +1 por cada segundo que sobre, −1 por error.
        </ThemedText>
        <PlayerForm />
        <Leaderboard />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
  },
});
