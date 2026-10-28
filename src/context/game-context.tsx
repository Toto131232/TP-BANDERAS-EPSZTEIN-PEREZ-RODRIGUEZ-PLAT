import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { loadJSON, saveJSON } from '@/utils/storage';

const FLAGS_URL = 'https://countriesnow.space/api/v0.1/countries/flag/images';
const CAPITALS_URL = 'https://countriesnow.space/api/v0.1/countries/capital';
const LEADERBOARD_KEY = 'tp-banderas:leaderboard';

export const ROUND_SECONDS = 15;
const HINT_COST_SECONDS = 2;
const REMOVE_OPTION_EVERY = 5;
const CORRECT_POINTS = 10;
const WRONG_POINTS = -1;

export type GameMode = 'flags' | 'capitals';

export type Country = {
  name: string;
  flag: string;
  iso2: string;
  capital: string | null;
};

export type LeaderboardEntry = {
  name: string;
  mode: GameMode;
  score: number;
};

export type Feedback = { type: 'correct' | 'wrong' | 'timeout'; message: string } | null;

type GameContextValue = {
  countries: Country[];
  loading: boolean;
  error: string | null;

  mode: GameMode;
  player: string | null;
  current: Country | null;
  score: number;
  timeLeft: number;
  feedback: Feedback;

  /** Índices de letras del nombre del país ya reveladas (modo banderas). */
  revealed: number[];
  /** Opciones de capital de la ronda actual y las que ya se borraron (modo capitales). */
  options: string[];
  removedOptions: string[];

  leaderboard: LeaderboardEntry[];

  startGame: (name: string, mode: GameMode) => void;
  endGame: () => void;
  guess: (answer: string) => boolean;
  nextCountry: () => void;
  requestHint: () => void;
  resetScore: () => void;
  clearLeaderboard: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

/** Minúsculas y sin acentos, para comparar respuestas escritas a mano. */
export function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<GameMode>('flags');
  const [player, setPlayer] = useState<string | null>(null);
  const [current, setCurrent] = useState<Country | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [revealed, setRevealed] = useState<number[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [removedOptions, setRemovedOptions] = useState<string[]>([]);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Al montar: traer países (+ capitales) y el ranking guardado.
  useEffect(() => {
    let cancelled = false;

    async function fetchCountries() {
      try {
        const [flagsRes, capitalsRes] = await Promise.all([fetch(FLAGS_URL), fetch(CAPITALS_URL)]);
        const flagsJson = await flagsRes.json();
        // Si falla la API de capitales, el modo banderas igual funciona.
        const capitalsJson = capitalsRes.ok ? await capitalsRes.json().catch(() => null) : null;

        const capitalByIso = new Map<string, string>();
        for (const c of capitalsJson?.data ?? []) {
          if (c.capital) capitalByIso.set(c.iso2 ?? c.name, c.capital);
        }

        const list: Country[] = (flagsJson.data ?? [])
          .filter((c: any) => c.name && c.flag)
          .map((c: any) => ({
            name: c.name,
            flag: c.flag,
            iso2: c.iso2,
            capital: capitalByIso.get(c.iso2) ?? capitalByIso.get(c.name) ?? null,
          }));

        if (cancelled) return;
        if (list.length === 0) throw new Error('La API no devolvió países');
        setCountries(list);
        setCurrent(randomItem(list));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudieron cargar los países');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLeaderboard(loadJSON<LeaderboardEntry[]>(LEADERBOARD_KEY, []));
    fetchCountries();
    return () => {
      cancelled = true;
    };
  }, []);

  const playable = (list: Country[], m: GameMode) =>
    m === 'capitals' ? list.filter((c) => c.capital) : list;

  function startRound(m: GameMode = mode) {
    const pool = playable(countries, m);
    if (pool.length === 0) return;

    // Evita repetir el mismo país dos veces seguidas.
    const next = randomItem(pool.length > 1 ? pool.filter((c) => c.name !== current?.name) : pool);
    setCurrent(next);
    setTimeLeft(ROUND_SECONDS);
    setElapsed(0);
    setRevealed([]);
    setRemovedOptions([]);

    if (m === 'capitals' && next.capital) {
      const distractors = shuffle(
        [...new Set(pool.map((c) => c.capital!).filter((cap) => cap !== next.capital))],
      ).slice(0, 2);
      setOptions(shuffle([next.capital, ...distractors]));
    } else {
      setOptions([]);
    }
  }

  const playing = player !== null && current !== null;

  // Timer: un tick por segundo mientras haya partida.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTimeLeft((t) => Math.max(t - 1, 0));
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [playing, current]);

  // Se acabó el tiempo: cuenta como error y pasa a otro país.
  useEffect(() => {
    if (!playing || timeLeft > 0) return;
    setScore((s) => s + WRONG_POINTS);
    setFeedback({ type: 'timeout', message: `¡Tiempo! Era ${answerFor(current!)}` });
    startRound();
  }, [timeLeft, playing]);

  // Modo capitales: cada 5 segundos se borra una opción incorrecta.
  useEffect(() => {
    if (!playing || mode !== 'capitals' || elapsed === 0 || elapsed % REMOVE_OPTION_EVERY !== 0) return;
    removeWrongOption();
  }, [elapsed]);

  // Ranking: guarda el mejor puntaje de cada jugador por modo, en vivo.
  useEffect(() => {
    if (!player) return;
    setLeaderboard((prev) => {
      const existing = prev.find((e) => e.name === player && e.mode === mode);
      if (existing && existing.score >= score) return prev;
      const next = existing
        ? prev.map((e) => (e === existing ? { ...e, score } : e))
        : [...prev, { name: player, mode, score }];
      saveJSON(LEADERBOARD_KEY, next);
      return next;
    });
  }, [score, player, mode]);

  function answerFor(country: Country) {
    return mode === 'capitals' ? `${country.capital} (${country.name})` : country.name;
  }

  function removeWrongOption() {
    if (!current) return;
    setRemovedOptions((removed) => {
      const candidates = options.filter((o) => o !== current.capital && !removed.includes(o));
      // Siempre quedan al menos 2 opciones para que siga habiendo que elegir.
      if (candidates.length <= 1) return removed;
      return [...removed, randomItem(candidates)];
    });
  }

  function startGame(name: string, m: GameMode) {
    setPlayer(name.trim());
    setMode(m);
    setScore(0);
    setFeedback(null);
    startRound(m);
  }

  function endGame() {
    setPlayer(null);
    setFeedback(null);
  }

  function guess(answer: string) {
    if (!current) return false;
    const expected = mode === 'capitals' ? current.capital ?? '' : current.name;

    if (normalize(answer) === normalize(expected)) {
      const bonus = timeLeft;
      setScore((s) => s + CORRECT_POINTS + bonus);
      setFeedback({ type: 'correct', message: `¡Correcto! +${CORRECT_POINTS} y +${bonus} por tiempo` });
      startRound();
      return true;
    }

    setScore((s) => s + WRONG_POINTS);
    setFeedback({ type: 'wrong', message: `"${answer}" no es correcto (${WRONG_POINTS})` });
    if (mode === 'capitals') setRemovedOptions((removed) => [...removed, answer]);
    return false;
  }

  function nextCountry() {
    setFeedback(null);
    startRound();
  }

  function requestHint() {
    if (!current || timeLeft <= 0) return;

    if (mode === 'capitals') {
      removeWrongOption();
    } else {
      const hidden = [...current.name]
        .map((ch, i) => (ch.trim() && !revealed.includes(i) ? i : -1))
        .filter((i) => i >= 0);
      if (hidden.length === 0) return;
      setRevealed([...revealed, randomItem(hidden)]);
    }
    setTimeLeft((t) => Math.max(t - HINT_COST_SECONDS, 0));
  }

  function resetScore() {
    setScore(0);
    setFeedback(null);
  }

  function clearLeaderboard() {
    setLeaderboard([]);
    saveJSON(LEADERBOARD_KEY, []);
  }

  return (
    <GameContext.Provider
      value={{
        countries,
        loading,
        error,
        mode,
        player,
        current,
        score,
        timeLeft,
        feedback,
        revealed,
        options,
        removedOptions,
        leaderboard,
        startGame,
        endGame,
        guess,
        nextCountry,
        requestHint,
        resetScore,
        clearLeaderboard,
      }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de <GameProvider>');
  return ctx;
}
