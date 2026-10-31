import { SpyPlayer, SpyPlayerView } from '../types';
import { TEXTS } from '../texts';

export const ATTENTION_PAUSE_SECONDS = 4;
export const TURN_QUESTIONS_SECONDS = 56;

/**
 * Определяет, открывать ли шпионские модальные окна ПОСЛЕ нажатия «Назвать» / «Ва-банк».
 * Пока карта открыта — смотрим `me.card.kind === 'spy'`; когда карта скрыта (`me.card` отсутствует),
 * сервер передаёт шпиону массив `me.guessedLocationIds` (изначально `[]`), а у жителя этого поля нет.
 */
export function isSpyPerspective(view: SpyPlayerView): boolean {
  if (view.me.card) {
    return view.me.card.kind === 'spy';
  }
  return Array.isArray(view.me.guessedLocationIds);
}

export function getPlayerNickname(players: SpyPlayer[], playerId?: string): string {
  if (!playerId) return 'Игрок';
  return players.find((p) => p.id === playerId)?.nickname ?? 'Игрок';
}

export function calculateSpiesCount(playerCount: number): 1 | 2 {
  return playerCount >= 9 ? 2 : 1;
}

export function calculateEstimatedMinutes(
  rounds: number,
  playerCount: number,
  attentionSeconds = ATTENTION_PAUSE_SECONDS,
  turnSeconds = TURN_QUESTIONS_SECONDS
): number {
  const safePlayers = Math.max(3, playerCount);
  const totalSeconds = rounds * safePlayers * (attentionSeconds + turnSeconds);
  return Math.max(1, Math.round(totalSeconds / 60));
}

export function calculateSupportNeeded(inPlayersBesidesTarget: number): number {
  return Math.max(1, Math.ceil(inPlayersBesidesTarget * 0.3));
}

export function isVoteSuccessful(spyVotes: number, totalVoters: number): boolean {
  if (totalVoters <= 0) return false;
  return spyVotes > totalVoters / 2;
}

export function getButtonBlockedShortText(
  view: SpyPlayerView,
  button: 'name' | 'allIn' | 'hint'
): string | null {
  const { can, me, round, accusation } = view;

  if (me.status === 'out') return TEXTS.actions.shortReasons.out;

  if (button === 'name' && !can.name) {
    if (accusation) return TEXTS.actions.shortReasons.accusation_in_progress;
    if (me.penaltyUntilRound && round < me.penaltyUntilRound) {
      return TEXTS.actions.shortReasons.penalty(me.penaltyUntilRound);
    }
    if (me.guessAvailableFromRound && round < me.guessAvailableFromRound) {
      return TEXTS.actions.shortReasons.guess_cooldown(me.guessAvailableFromRound);
    }
    if (can.blockedReason === 'no_guesses_left') {
      return TEXTS.actions.shortReasons.no_guesses_left;
    }
    if (can.blockedReason === 'penalty') {
      return TEXTS.actions.shortReasons.penalty(me.penaltyUntilRound);
    }
    if (can.blockedReason === 'guess_cooldown') {
      return TEXTS.actions.shortReasons.guess_cooldown(me.guessAvailableFromRound);
    }
    if (can.blockedReason === 'accusation_in_progress') {
      return TEXTS.actions.shortReasons.accusation_in_progress;
    }
    return 'Пауза';
  }

  if (button === 'allIn' && !can.allIn) {
    if (accusation) return TEXTS.actions.shortReasons.accusation_in_progress;
    if (me.penaltyUntilRound && round < me.penaltyUntilRound) {
      return TEXTS.actions.shortReasons.penalty(me.penaltyUntilRound);
    }
    if (can.blockedReason === 'penalty') {
      return TEXTS.actions.shortReasons.penalty(me.penaltyUntilRound);
    }
    return 'Пауза';
  }

  if (button === 'hint' && !can.hint) {
    if (me.hintAvailableFromRound && round < me.hintAvailableFromRound) {
      return TEXTS.actions.shortReasons.hint_cooldown(me.hintAvailableFromRound);
    }
    if (accusation) return TEXTS.actions.shortReasons.accusation_in_progress;
    if (can.blockedReason === 'hint_cooldown') {
      return TEXTS.actions.shortReasons.hint_cooldown(me.hintAvailableFromRound);
    }
    return 'Пауза';
  }

  return null;
}

export function getDockStatusLine(view: SpyPlayerView): string | null {
  const { can, me, round, accusation } = view;
  if (me.status === 'out') return null;

  if (me.penaltyUntilRound && round < me.penaltyUntilRound) {
    return TEXTS.actions.longReasons.penalty(me.penaltyUntilRound);
  }
  if (accusation && !can.name && !can.allIn) {
    return TEXTS.actions.longReasons.accusation_in_progress;
  }
  if (!can.name && can.blockedReason === 'no_guesses_left') {
    return TEXTS.actions.longReasons.no_guesses_left;
  }
  if (!can.name && me.guessAvailableFromRound && round < me.guessAvailableFromRound) {
    return TEXTS.actions.longReasons.guess_cooldown(me.guessAvailableFromRound);
  }
  if (!can.hint && me.hintAvailableFromRound && round < me.hintAvailableFromRound && can.name && can.allIn) {
    return TEXTS.actions.longReasons.hint_cooldown(me.hintAvailableFromRound);
  }
  return null;
}

export function formatSeconds(seconds?: number): string {
  if (seconds === undefined || seconds === null) return '0:00';
  const clamped = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
