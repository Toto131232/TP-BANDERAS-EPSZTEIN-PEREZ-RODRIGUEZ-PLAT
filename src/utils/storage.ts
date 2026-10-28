/**
 * Persistencia mínima: en web usa localStorage. En nativo (sin localStorage)
 * cae a memoria; para persistir en el teléfono se puede cambiar por AsyncStorage.
 */
const memory = new Map<string, string>();

function webStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = webStorage()?.getItem(key) ?? memory.get(key) ?? null;
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown) {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try {
    webStorage()?.setItem(key, raw);
  } catch {
    // Sin acceso a storage (modo privado, etc.): queda en memoria.
  }
}
