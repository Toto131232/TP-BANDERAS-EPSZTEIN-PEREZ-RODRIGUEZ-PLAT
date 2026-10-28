import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { normalize, useGame } from '@/context/game-context';
import { useTheme } from '@/hooks/use-theme';

export function GuessForm() {
  const { mode } = useGame();
  return mode === 'capitals' ? <CapitalOptions /> : <CountryInput />;
}

/** Modo banderas: se escribe el país y se puede elegir de las sugerencias. */
function CountryInput() {
  const { countries, guess } = useGame();
  const theme = useTheme();
  const [text, setText] = useState('');

  const query = normalize(text);
  const suggestions = query
    ? countries.filter((c) => normalize(c.name).includes(query)).slice(0, 5)
    : [];

  function submit(answer: string) {
    if (!answer.trim()) return;
    guess(answer.trim());
    setText('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => submit(text)}
          placeholder="¿De qué país es esta bandera?"
          placeholderTextColor={theme.textSecondary}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="send"
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.backgroundElement },
          ]}
        />
        <Pressable
          onPress={() => submit(text)}
          style={({ pressed }) => [styles.send, pressed && styles.pressed]}>
          <ThemedText type="smallBold" style={styles.sendText}>
            Arriesgar
          </ThemedText>
        </Pressable>
      </View>

      {suggestions.length > 0 && (
        <ThemedView type="backgroundElement" style={styles.suggestions}>
          {suggestions.map((c) => (
            <Pressable
              key={c.name}
              onPress={() => submit(c.name)}
              style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
              <ThemedText type="small">{c.name}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      )}
    </View>
  );
}

/** Modo capitales: 3 opciones, algunas se van borrando con el tiempo o con pistas. */
function CapitalOptions() {
  const { options, removedOptions, guess } = useGame();

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const removed = removedOptions.includes(option);
        return (
          <Pressable
            key={option}
            disabled={removed}
            onPress={() => guess(option)}
            style={({ pressed }) => [pressed && styles.pressed, removed && styles.removed]}>
            <ThemedView type="backgroundElement" style={styles.option}>
              <ThemedText style={removed && styles.removedText}>{option}</ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    fontSize: 16,
  },
  send: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: '#3c87f7',
  },
  sendText: {
    color: '#ffffff',
  },
  suggestions: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.one,
  },
  suggestion: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  option: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  removed: {
    opacity: 0.35,
  },
  removedText: {
    textDecorationLine: 'line-through',
  },
  pressed: {
    opacity: 0.6,
  },
});
