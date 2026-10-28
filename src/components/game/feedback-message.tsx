import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useGame } from '@/context/game-context';

const COLORS = {
  correct: '#2EA44F',
  wrong: '#E5484D',
  timeout: '#E3A008',
};

export function FeedbackMessage() {
  const { feedback } = useGame();

  return (
    <ThemedText
      type="smallBold"
      style={[styles.text, feedback && { color: COLORS[feedback.type] }]}>
      {feedback?.message ?? ' '}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    minHeight: 20,
  },
});
