/**
 * Заглушка тактильного отклика Telegram Mini App (раздел 7 ТЗ).
 *
 * КРИТИЧЕСКОЕ ПРАВИЛО: вибрация вызывается строго на общие события партии
 * (начало своего хода, новое обвинение, итог голосования) одинаково для жителя и шпиона.
 */

export type HapticKind = 'success' | 'warning' | 'light';

export interface HapticEvent {
  id: number;
  kind: HapticKind;
  reason: string;
  timestamp: number;
}

type HapticListener = (event: HapticEvent) => void;

let seq = 0;
const listeners = new Set<HapticListener>();

export function haptic(kind: HapticKind, reason = ''): void {
  seq += 1;
  const event: HapticEvent = {
    id: seq,
    kind,
    reason,
    timestamp: Date.now(),
  };

  // Передаём в Telegram WebApp HapticFeedback, если запущено внутри клиента Telegram
  const tg = (globalThis as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { notificationOccurred?: (t: string) => void; impactOccurred?: (t: string) => void } } } }).Telegram?.WebApp?.HapticFeedback;
  if (tg) {
    if (kind === 'light') {
      tg.impactOccurred?.('light');
    } else {
      tg.notificationOccurred?.(kind);
    }
  } else if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      const pattern = kind === 'light' ? 12 : kind === 'success' ? [15, 30, 15] : [25, 40, 25];
      navigator.vibrate(pattern);
    } catch {
      // Игнорируем ограничения браузера без жеста пользователя
    }
  }

  listeners.forEach((cb) => cb(event));
}

export function subscribeHaptics(cb: HapticListener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
