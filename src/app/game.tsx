import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { FeedbackMessage } from '@/components/game/feedback-message';
import { Flag } from '@/components/game/flag';
import { GuessForm } from '@/components/game/guess-form';
import { Hints } from '@/components/game/hints';
import { Leaderboard } from '@/components/game/leaderboard';
import { ScoreBoard } from '@/components/game/score-board';
import { Timer } from '@/components/game/timer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useGame } from '@/context/game-context';

export default function GameScreen() {
  const { player, nextCountry, endGame } = useGame();

  // Sin jugador (ej. recarga directa en /game) se vuelve al inicio.
  if (!player) return <Redirect href="/" />;

  function finish() {
    endGame();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScoreBoard />
        <Timer />
        <Flag />
        <Hints />
        <GuessForm />
        <FeedbackMessage />

        <ThemedView style={styles.actions}>
          <Pressable onPress={nextCountry}>
            <ThemedText type="linkPrimary">Saltar país</ThemedText>
          </Pressable>
          <Pressable onPress={finish}>
            <ThemedText type="link" themeColor="textSecondary">
              Terminar partida
            </ThemedText>
          </Pressable>
        </ThemedView>

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
    alignItems: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
});
