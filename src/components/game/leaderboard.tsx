import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useGame, type GameMode } from '@/context/game-context';

const MODE_LABELS: Record<GameMode, string> = {
  flags: 'Banderas',
  capitals: 'Capitales',
};

export function Leaderboard() {
  const { leaderboard, clearLeaderboard } = useGame();
  const [tab, setTab] = useState<GameMode>('flags');

  const rows = leaderboard
    .filter((e) => e.mode === tab)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="smallBold">🏆 Ranking</ThemedText>
        <View style={styles.tabs}>
          {(Object.keys(MODE_LABELS) as GameMode[]).map((m) => (
            <Pressable key={m} onPress={() => setTab(m)}>
              <ThemedView
                type={tab === m ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.tab}>
                <ThemedText type="small" themeColor={tab === m ? 'text' : 'textSecondary'}>
                  {MODE_LABELS[m]}
                </ThemedText>
              </ThemedView>
            </Pressable>
          ))}
        </View>
      </View>

      {rows.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Todavía no hay puntajes en este modo.
        </ThemedText>
      ) : (
        rows.map((entry, i) => (
          <View key={entry.name} style={styles.row}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.position}>
              {i + 1}.
            </ThemedText>
            <ThemedText type="small" style={styles.name}>
              {entry.name}
            </ThemedText>
            <ThemedText type="smallBold">{entry.score}</ThemedText>
          </View>
        ))
      )}

      {leaderboard.length > 0 && (
        <Pressable onPress={clearLeaderboard} style={styles.clear}>
          <ThemedText type="small" themeColor="textSecondary">
            Borrar ranking
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  tab: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  position: {
    width: 24,
  },
  name: {
    flex: 1,
  },
  clear: {
    alignSelf: 'flex-end',
  },
});
