import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { GameProvider } from '@/context/game-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GameProvider>
        <AnimatedSplashOverlay />
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Adiviná la bandera' }} />
          <Stack.Screen name="game" options={{ title: 'Jugando' }} />
        </Stack>
      </GameProvider>
    </ThemeProvider>
  );
}
