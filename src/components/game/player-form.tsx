import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useGame, type GameMode } from '@/context/game-context';
import { useTheme } from '@/hooks/use-theme';

const MODES: { mode: GameMode; title: string; description: string }[] = [
  { mode: 'flags', title: '🏳️ Banderas', description: 'Escribí a qué país pertenece la bandera' },
  { mode: 'capitals', title: '🏛️ Capitales', description: 'Elegí la capital entre 3 opciones' },
];

export function PlayerForm() {
  const { loading, error, startGame } = useGame();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [mode, setMode] = useState<GameMode>('flags');

  const canStart = name.trim().length > 0 && !loading && !error;

  function start() {
    if (!canStart) return;
    startGame(name, mode);
    router.push('/game');
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={name}
        onChangeText={setName}
        onSubmitEditing={start}
        placeholder="Tu nombre"
        placeholderTextColor={theme.textSecondary}
        maxLength={20}
        style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
      />

      {MODES.map((m) => (
        <Pressable key={m.mode} onPress={() => setMode(m.mode)}>
          <ThemedView
            type={mode === m.mode ? 'backgroundSelected' : 'backgroundElement'}
            style={[styles.mode, mode === m.mode && styles.modeSelected]}>
            <ThemedText type="smallBold">{m.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {m.description}
            </ThemedText>
          </ThemedView>
        </Pressable>
      ))}

      <Pressable
        onPress={start}
        disabled={!canStart}
        style={({ pressed }) => [styles.start, !canStart && styles.disabled, pressed && styles.pressed]}>
        <ThemedText type="smallBold" style={styles.startText}>
          {loading ? 'Cargando países…' : 'Jugar'}
        </ThemedText>
      </Pressable>

      {error && (
        <ThemedText type="small" style={styles.error}>
          Error al cargar los países: {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  input: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    fontSize: 16,
  },
  mode: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeSelected: {
    borderColor: '#3c87f7',
  },
  start: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: '#3c87f7',
  },
  startText: {
    color: '#ffffff',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
  error: {
    color: '#E5484D',
    textAlign: 'center',
  },
});
