import { GameAdapter } from './GameAdapter';
import { LOCATION_PACKS, SAMPLE_HINTS_POOL } from './packsData';
import { SpyCommand, SpyLocation, SpyPhase, SpyPlayer, SpyPlayerView } from '../types';
import {
  ATTENTION_PAUSE_SECONDS,
  TURN_QUESTIONS_SECONDS,
  calculateEstimatedMinutes,
  calculateSpiesCount,
  calculateSupportNeeded,
  isVoteSuccessful,
} from '../utils/viewHelpers';

export const DEFAULT_NICKNAMES_15 = [
  'Оля',
  'Петя',
  'Макс',
  'Аня',
  'Дима',
  'Катя',
  'Тимур',
  'Лена',
  'Сергей',
  'Ника',
  'Илья',
  'Маша',
  'Артём',
  'Соня',
  'Рома',
];

const DEAL_CARD_SECONDS = 12;
const SUPPORT_SECONDS = 18;
const VOTE_SECONDS = 20;
const VOTE_RESULT_SECONDS = 4;
const SPY_ALL_IN_PREP_SECONDS = 3;
const SPY_ALL_IN_CHOOSE_SECONDS = 16;
const MAX_SPY_SILENT_GUESSES = 2;

export interface InternalAccusation {
  stage: 'support' | 'vote';
  kind: 'accuse' | 'all_in';
  accuserId: string;
  targetId: string;
  supportByPlayer: Record<string, boolean>;
  supportNeeded: number;
  voteByPlayer: Record<string, 'spy' | 'not_spy'>;
  eligibleVoterIds: string[];
}

export interface InternalPartyState {
  phase: SpyPhase;
  packId: string;
  rounds: number;
  minRounds: number;
  maxRounds: number;
  players: Array<{
    id: string;
    nickname: string;
    isHost: boolean;
    status: 'in' | 'out';
    isOffline?: boolean;
  }>;
  locations: SpyLocation[];
  realLocationId: string;
  spyIds: string[];
  localRoles: Record<string, string>;

  // Состояние раздачи по игрокам
  cardOpen: Record<string, boolean>;
  cardRevealsLeft: Record<string, number>;
  ready: Record<string, boolean>;

  // Ход и раунды
  round: number;
  activePlayerId?: string;
  playedInCurrentRound: string[];
  turnStep?: 'attention' | 'questions';
  turnSecondsRemaining: number;
  stepSecondsLeft?: number;
  stepTotalSeconds?: number;

  // Кулдауны, попытки, штрафы и подсказки
  guessedLocationsBySpy: Record<string, string[]>;
  guessAvailableFromRound: Record<string, number>;
  penaltyUntilRound: Record<string, number>;
  hintAvailableFromRound: Record<string, number>;
  usedHintIndicesByPlayer: Record<string, number[]>;
  openHintByPlayer: Record<string, string[] | undefined>;

  // Оверлеи спора / ва-банка / результатов / уведомлений
  accusation?: InternalAccusation;
  spyAllIn?: { playerId: string; choosing: boolean };
  voteResult?: {
    text: 'spy_caught' | 'innocent' | 'failed' | 'all_in_out';
    targetId?: string;
    accuserId?: string;
    secondsLeft: number;
  };
  pendingPublicGuessNoticeInSeconds?: number;
  noticesByPlayer: Record<
    string,
    Array<{ id: string; kind: 'failed_guess_public' | 'my_failed_guess' | 'penalty'; round?: number; ttl: number }>
  >;

  // Статистика для подсчёта очков финала
  catchInitiatorCounts: Record<string, number>;
  locationGuesserId?: string;
  finishedReason?: 'all_spies_out' | 'location_guessed' | 'rounds_over' | 'too_few_players';
  finishedWinner?: 'locals' | 'spies';
}

export interface MockAdapterOptions {
  playerCount?: number;
  viewerId?: string;
  autoTick?: boolean;
  autoSimulateBots?: boolean;
  seed?: number;
}

function createSeededRng(seed = 42): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function shuffleWithRng<T>(arr: readonly T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Строит строго изолированный объект `SpyPlayerView` для конкретного участника `viewerId`
 * без утечки ролей остальных игроков, настоящей локации и чужих голосов.
 */
export function buildViewForPlayer(state: InternalPartyState, viewerId: string): SpyPlayerView {
  const mePlayer = state.players.find((p) => p.id === viewerId) ?? state.players[0];
  const actualViewerId = mePlayer.id;
  const isSpy = state.spyIds.includes(actualViewerId);
  const isFinished = state.phase === 'finished';

  const spiesInGame = state.players.filter(
    (p) => p.status === 'in' && state.spyIds.includes(p.id)
  ).length;

  const playersView: SpyPlayer[] = state.players.map((p) => {
    const base: SpyPlayer = {
      id: p.id,
      nickname: p.nickname,
      isHost: p.isHost,
      status: p.status,
      ...(p.isOffline ? { isOffline: true } : {}),
    };
    if (isFinished) {
      if (state.spyIds.includes(p.id)) {
        base.reveal = { kind: 'spy' };
      } else {
        base.reveal = { kind: 'local', role: state.localRoles[p.id] ?? 'Житель' };
      }
    }
    return base;
  });

  const realLoc =
    state.locations.find((l) => l.id === state.realLocationId) ??
    state.locations[0] ?? { id: 'submarine', name: 'Подводная лодка', icon: 'ship' };

  const isCardCurrentlyOpen = state.phase === 'deal' && Boolean(state.cardOpen[actualViewerId]);
  const card = isCardCurrentlyOpen
    ? isSpy
      ? ({ kind: 'spy' } as const)
      : ({
          kind: 'local',
          locationId: realLoc.id,
          locationName: realLoc.name,
          role: state.localRoles[actualViewerId] ?? 'Житель',
        } as const)
    : undefined;

  const activePenaltyUntil =
    state.penaltyUntilRound[actualViewerId] && state.round < state.penaltyUntilRound[actualViewerId]
      ? state.penaltyUntilRound[actualViewerId]
      : undefined;

  const activeGuessFrom =
    isSpy &&
    state.guessAvailableFromRound[actualViewerId] &&
    state.round < state.guessAvailableFromRound[actualViewerId]
      ? state.guessAvailableFromRound[actualViewerId]
      : undefined;

  const activeHintFrom =
    state.hintAvailableFromRound[actualViewerId] &&
    state.round < state.hintAvailableFromRound[actualViewerId]
      ? state.hintAvailableFromRound[actualViewerId]
      : undefined;

  // Вычисление доступности кнопок (`can`)
  const isOut = mePlayer.status === 'out';
  const inTurnPhase = state.phase === 'turn';
  const hasVoteResult = Boolean(state.voteResult);
  const acc = state.accusation;

  const spyTargetedDuringVote =
    isSpy &&
    Boolean(acc && acc.stage === 'vote' && acc.targetId === actualViewerId) &&
    !hasVoteResult;

  const guessedSoFar = state.guessedLocationsBySpy[actualViewerId] ?? [];
  const spyGuessesExhausted = isSpy && guessedSoFar.length >= MAX_SPY_SILENT_GUESSES;

  let canName = false;
  let canAllIn = false;
  let canHint = false;
  let canSupport = false;
  let canVote = false;
  let blockedReason: SpyPlayerView['can']['blockedReason'];

  if (isOut) {
    blockedReason = 'out';
  } else if (inTurnPhase) {
    if (acc) {
      // Во время сбора поддержки
      if (acc.stage === 'support') {
        const alreadySupported = acc.supportByPlayer[actualViewerId] !== undefined;
        if (acc.targetId === actualViewerId) {
          canSupport = false;
          blockedReason = 'not_your_vote';
        } else if (activePenaltyUntil) {
          canSupport = false;
          blockedReason = 'penalty';
        } else {
          canSupport = !alreadySupported;
          blockedReason = 'accusation_in_progress';
        }
      } else if (acc.stage === 'vote') {
        // Во время голосования
        const alreadyVoted = acc.voteByPlayer[actualViewerId] !== undefined;
        if (acc.targetId === actualViewerId) {
          canVote = false;
          // Правило 3.7: пока идёт голосование против шпиона, он может назвать локацию или пойти ва-банк!
          if (spyTargetedDuringVote) {
            canAllIn = true;
            canName = !spyGuessesExhausted && !activeGuessFrom;
            if (!canName) {
              blockedReason = spyGuessesExhausted ? 'no_guesses_left' : 'guess_cooldown';
            }
          } else {
            blockedReason = 'not_your_vote';
          }
        } else {
          canVote = acc.eligibleVoterIds.includes(actualViewerId) && !alreadyVoted;
          blockedReason = 'accusation_in_progress';
        }
      }
    } else if (!hasVoteResult) {
      // Свободный ход без активного обвинения
      if (isSpy) {
        canAllIn = true;
        if (spyGuessesExhausted) {
          canName = false;
          blockedReason = 'no_guesses_left';
        } else if (activeGuessFrom) {
          canName = false;
          blockedReason = 'guess_cooldown';
        } else {
          canName = true;
        }
      } else {
        if (activePenaltyUntil) {
          canName = false;
          canAllIn = false;
          blockedReason = 'penalty';
        } else {
          canName = true;
          canAllIn = true;
        }
      }

      if (activeHintFrom) {
        canHint = false;
        if (!blockedReason) blockedReason = 'hint_cooldown';
      } else {
        canHint = true;
      }
    } else {
      blockedReason = 'accusation_in_progress';
    }
  }

  // Пауза таймера хода (правило 3.7): на паузе во время поддержки/голосования, если обвиняет НЕ активный игрок
  const turnPaused =
    inTurnPhase &&
    Boolean(acc) &&
    acc!.accuserId !== state.activePlayerId;

  const readyCount =
    state.phase === 'deal'
      ? state.players.filter((p) => Boolean(state.ready[p.id])).length
      : undefined;

  const accusationView: SpyPlayerView['accusation'] = acc
    ? {
        stage: acc.stage,
        kind: acc.kind,
        accuserId: acc.accuserId,
        targetId: acc.targetId,
        supporters: Object.values(acc.supportByPlayer).filter(Boolean).length,
        supportNeeded: acc.supportNeeded,
        voted: Object.keys(acc.voteByPlayer).length,
        voters: acc.eligibleVoterIds.length,
        ...(acc.supportByPlayer[actualViewerId] !== undefined
          ? { mySupport: acc.supportByPlayer[actualViewerId] }
          : {}),
        ...(acc.voteByPlayer[actualViewerId] !== undefined
          ? { myVote: acc.voteByPlayer[actualViewerId] }
          : {}),
      }
    : undefined;

  const playerNotices = (state.noticesByPlayer[actualViewerId] ?? []).map(
    ({ id, kind, round }) => ({
      id,
      kind,
      ...(round !== undefined ? { round } : {}),
    })
  );

  let finishedSummary: SpyPlayerView['finishedSummary'];
  if (isFinished && state.finishedWinner && state.finishedReason) {
    const scored = state.players.map((p) => {
      const playerIsSpy = state.spyIds.includes(p.id);
      let pts = 0;
      if (state.finishedWinner === 'spies' && playerIsSpy) pts += 1;
      if (state.finishedWinner === 'locals' && !playerIsSpy) pts += 1;
      if (state.finishedReason === 'location_guessed' && state.locationGuesserId === p.id) {
        pts += 1;
      }
      pts += state.catchInitiatorCounts[p.id] ?? 0;
      return { playerId: p.id, points: pts };
    });

    scored.sort((a, b) => b.points - a.points);
    let currentPlace = 1;
    const places = scored.map((entry, idx) => {
      if (idx > 0 && entry.points < scored[idx - 1].points) {
        currentPlace = idx + 1;
      }
      return {
        playerId: entry.playerId,
        points: entry.points,
        place: currentPlace,
      };
    });

    finishedSummary = {
      winner: state.finishedWinner,
      reason: state.finishedReason,
      location: realLoc,
      spies: [...state.spyIds],
      places,
    };
  }

  return {
    gameId: 'spy',
    phase: state.phase,
    players: playersView,
    spiesTotal: state.spyIds.length > 0 ? state.spyIds.length : calculateSpiesCount(state.players.length),
    spiesInGame: state.phase === 'lobby' ? calculateSpiesCount(state.players.length) : spiesInGame,
    settings: {
      packId: state.packId,
      packs: LOCATION_PACKS.map((p) => ({ id: p.id, name: p.name })),
      rounds: state.rounds,
      minRounds: state.minRounds,
      maxRounds: state.maxRounds,
      estimatedMinutes: calculateEstimatedMinutes(state.rounds, state.players.length),
    },
    locations: state.locations,
    round: state.round,
    ...(state.activePlayerId ? { activePlayerId: state.activePlayerId } : {}),
    timers: {
      ...(state.stepSecondsLeft !== undefined ? { secondsLeft: state.stepSecondsLeft } : {}),
      ...(state.stepTotalSeconds !== undefined ? { totalSeconds: state.stepTotalSeconds } : {}),
      ...(turnPaused ? { turnPaused: true } : {}),
    },
    ...(state.phase === 'turn' && state.turnStep ? { turnStep: state.turnStep } : {}),
    me: {
      playerId: actualViewerId,
      isHost: mePlayer.isHost,
      status: mePlayer.status,
      ...(card ? { card } : {}),
      cardRevealsLeft: state.cardRevealsLeft[actualViewerId] ?? 1,
      ready: Boolean(state.ready[actualViewerId]),
      ...(isSpy && state.phase !== 'lobby'
        ? { guessedLocationIds: [...(state.guessedLocationsBySpy[actualViewerId] ?? [])] }
        : {}),
      ...(activeGuessFrom !== undefined ? { guessAvailableFromRound: activeGuessFrom } : {}),
      ...(activePenaltyUntil !== undefined ? { penaltyUntilRound: activePenaltyUntil } : {}),
      ...(activeHintFrom !== undefined ? { hintAvailableFromRound: activeHintFrom } : {}),
      ...(state.openHintByPlayer[actualViewerId]
        ? { hint: [...state.openHintByPlayer[actualViewerId]!] }
        : {}),
    },
    can: {
      name: canName,
      allIn: canAllIn,
      hint: canHint,
      support: canSupport,
      vote: canVote,
      ...(blockedReason ? { blockedReason } : {}),
    },
    ...(readyCount !== undefined ? { readyCount } : {}),
    ...(accusationView ? { accusation: accusationView } : {}),
    ...(state.spyAllIn ? { spyAllIn: { ...state.spyAllIn } } : {}),
    ...(state.voteResult ? { voteResult: { ...state.voteResult } } : {}),
    ...(playerNotices.length > 0 ? { notices: playerNotices } : {}),
    ...(finishedSummary ? { finishedSummary } : {}),
  };
}

/**
 * Локальная модель партии `MockAdapter` (раздел 6 ТЗ).
 * Реализует `GameAdapter` для выбранного игрока и позволяет создавать синхронные
 * проекции для режима «Сравнить житель/шпион» в один и тот же момент партии.
 */
export class MockAdapter implements GameAdapter {
  private state: InternalPartyState;
  private viewerId: string;
  private listeners = new Set<() => void>();
  private rng: () => number;
  private noticeSeq = 1;
  private timerHandle: ReturnType<typeof setInterval> | null = null;
  private autoSimulateBots: boolean;
  private staticOverrideView: SpyPlayerView | null = null;

  constructor(options: MockAdapterOptions = {}) {
    const count = Math.min(15, Math.max(2, options.playerCount ?? 8));
    this.rng = createSeededRng(options.seed ?? 2026);
    this.autoSimulateBots = options.autoSimulateBots ?? true;
    this.state = this.createInitialLobbyState(count);
    this.viewerId = options.viewerId ?? this.state.players[0].id;

    if (options.autoTick) {
      this.startAutoTick();
    }
  }

  private createInitialLobbyState(playerCount: number): InternalPartyState {
    const players = Array.from({ length: playerCount }, (_, idx) => ({
      id: `p${idx + 1}`,
      nickname: DEFAULT_NICKNAMES_15[idx] ?? `Игрок ${idx + 1}`,
      isHost: idx === 0,
      status: 'in' as const,
    }));

    const pack = LOCATION_PACKS[0];
    return {
      phase: 'lobby',
      packId: pack.id,
      rounds: 4,
      minRounds: 3,
      maxRounds: 8,
      players,
      locations: pack.locations.map(({ id, name, icon }) => ({ id, name, icon })),
      realLocationId: pack.locations[0].id,
      spyIds: [],
      localRoles: {},
      cardOpen: {},
      cardRevealsLeft: {},
      ready: {},
      round: 1,
      playedInCurrentRound: [],
      turnSecondsRemaining: TURN_QUESTIONS_SECONDS,
      guessedLocationsBySpy: {},
      guessAvailableFromRound: {},
      penaltyUntilRound: {},
      hintAvailableFromRound: {},
      usedHintIndicesByPlayer: {},
      openHintByPlayer: {},
      noticesByPlayer: {},
      catchInitiatorCounts: {},
    };
  }

  public getView(): SpyPlayerView {
    if (this.staticOverrideView) {
      return this.staticOverrideView;
    }
    return buildViewForPlayer(this.state, this.viewerId);
  }

  public getViewForPlayer(playerId: string): SpyPlayerView {
    return buildViewForPlayer(this.state, playerId);
  }

  /**
   * Создаёт связанный адаптер для другого участника той же самой живой партии
   * (используется в режиме «Сравнить житель/шпион»).
   */
  public createPerspectiveAdapter(playerId: string): GameAdapter {
    return {
      getView: () => buildViewForPlayer(this.state, playerId),
      subscribe: (cb: () => void) => this.subscribe(cb),
      send: (cmd: SpyCommand) => this.sendForPlayer(playerId, cmd),
    };
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private emit(): void {
    this.listeners.forEach((cb) => cb());
  }

  public setStaticFixture(view: SpyPlayerView | null): void {
    this.staticOverrideView = view;
    this.emit();
  }

  public isStaticMode(): boolean {
    return this.staticOverrideView !== null;
  }

  public getInternalState(): Readonly<InternalPartyState> {
    return this.state;
  }

  public setViewerId(playerId: string): void {
    if (this.state.players.some((p) => p.id === playerId)) {
      this.viewerId = playerId;
      this.staticOverrideView = null;
      this.emit();
    }
  }

  public getViewerId(): string {
    return this.viewerId;
  }

  public findFirstLocalAndSpyIds(): { localId: string; spyId: string } {
    const spyId = this.state.spyIds[0] ?? this.state.players[1]?.id ?? this.state.players[0].id;
    const localId =
      this.state.players.find((p) => !this.state.spyIds.includes(p.id))?.id ??
      this.state.players[0].id;
    return { localId, spyId };
  }

  public setPlayerCount(count: number): void {
    const clamped = Math.min(15, Math.max(2, count));
    const currentPack = this.state.packId;
    const currentRounds = this.state.rounds;
    this.state = this.createInitialLobbyState(clamped);
    this.state.packId = currentPack;
    this.state.rounds = currentRounds;
    const pack = LOCATION_PACKS.find((p) => p.id === currentPack) ?? LOCATION_PACKS[0];
    this.state.locations = pack.locations.map(({ id, name, icon }) => ({ id, name, icon }));
    if (!this.state.players.some((p) => p.id === this.viewerId)) {
      this.viewerId = this.state.players[0].id;
    }
    this.staticOverrideView = null;
    this.emit();
  }

  public setAutoSimulateBots(enabled: boolean): void {
    this.autoSimulateBots = enabled;
  }

  public startAutoTick(): void {
    if (this.timerHandle) return;
    this.timerHandle = setInterval(() => {
      if (!this.staticOverrideView) {
        this.tick(1);
      }
    }, 1000);
  }

  public stopAutoTick(): void {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  public isAutoTickRunning(): boolean {
    return this.timerHandle !== null;
  }

  public togglePlayerOffline(playerId: string): void {
    const p = this.state.players.find((pl) => pl.id === playerId);
    if (!p) return;
    p.isOffline = !p.isOffline;
    this.emit();
  }

  public send(cmd: SpyCommand): void {
    if (this.staticOverrideView) {
      // Если открыта статическая фикстура и пользователь нажимает интерактивную кнопку,
      // переводим фикстуру в реактивное обновление или делегируем в живой движок
      this.applyCommandToStaticFixture(cmd);
      return;
    }
    this.sendForPlayer(this.viewerId, cmd);
  }

  private applyCommandToStaticFixture(cmd: SpyCommand): void {
    if (!this.staticOverrideView) return;
    const v = structuredClone(this.staticOverrideView);

    switch (cmd.type) {
      case 'SET_SETTINGS': {
        if (!v.me.isHost) break;
        if (cmd.packId) v.settings.packId = cmd.packId;
        if (cmd.rounds !== undefined) {
          v.settings.rounds = Math.min(v.settings.maxRounds, Math.max(v.settings.minRounds, cmd.rounds));
        }
        v.settings.estimatedMinutes = calculateEstimatedMinutes(v.settings.rounds, v.players.length);
        break;
      }
      case 'START_GAME': {
        this.staticOverrideView = null;
        if (this.state.phase !== 'lobby') {
          this.state = this.createInitialLobbyState(v.players.length >= 3 ? v.players.length : 8);
        }
        this.sendForPlayer(this.state.players[0].id, { type: 'START_GAME' });
        return;
      }
      case 'HIDE_CARD': {
        delete v.me.card;
        break;
      }
      case 'SHOW_CARD_AGAIN': {
        if (!v.me.card && v.me.cardRevealsLeft > 0) {
          v.me.cardRevealsLeft -= 1;
          const isSpy = Array.isArray(v.me.guessedLocationIds);
          v.me.card = isSpy
            ? { kind: 'spy' }
            : {
                kind: 'local',
                locationId: v.locations[0]?.id ?? 'submarine',
                locationName: v.locations[0]?.name ?? 'Подводная лодка',
                role: 'Штурман',
              };
        }
        break;
      }
      case 'READY': {
        delete v.me.card;
        if (!v.me.ready) {
          v.me.ready = true;
          v.readyCount = Math.min(v.players.length, (v.readyCount ?? 0) + 1);
        }
        break;
      }
      case 'SUPPORT': {
        if (v.accusation && v.can.support) {
          v.accusation.mySupport = cmd.support;
          if (cmd.support) v.accusation.supporters += 1;
          v.can.support = false;
          if (v.accusation.supporters >= v.accusation.supportNeeded) {
            v.accusation.stage = 'vote';
            v.can.vote = v.accusation.targetId !== v.me.playerId;
          }
        }
        break;
      }
      case 'VOTE': {
        if (v.accusation && v.can.vote) {
          v.accusation.myVote = cmd.vote;
          v.accusation.voted = Math.min(v.accusation.voters, v.accusation.voted + 1);
          v.can.vote = false;
        }
        break;
      }
      case 'HINT': {
        if (v.can.hint) {
          v.me.hint = SAMPLE_HINTS_POOL.slice(0, 3);
          v.me.hintAvailableFromRound = v.round + 2;
          v.can.hint = false;
        }
        break;
      }
      case 'ACCUSE': {
        const voters = v.players.filter((p) => p.status === 'in' && p.id !== cmd.targetId).length;
        v.accusation = {
          stage: 'support',
          kind: 'accuse',
          accuserId: v.me.playerId,
          targetId: cmd.targetId,
          supporters: 1,
          supportNeeded: calculateSupportNeeded(voters),
          voted: 0,
          voters,
          mySupport: true,
        };
        v.can.name = false;
        v.can.allIn = false;
        v.can.blockedReason = 'accusation_in_progress';
        break;
      }
      case 'ALL_IN_ACCUSE': {
        const voters = v.players.filter((p) => p.status === 'in' && p.id !== cmd.targetId).length;
        v.accusation = {
          stage: 'vote',
          kind: 'all_in',
          accuserId: v.me.playerId,
          targetId: cmd.targetId,
          supporters: 1,
          supportNeeded: 1,
          voted: 1,
          voters,
          myVote: 'spy',
        };
        v.can.name = false;
        v.can.allIn = false;
        v.can.vote = false;
        v.can.blockedReason = 'accusation_in_progress';
        break;
      }
      case 'SPY_ALL_IN': {
        v.phase = 'spy_guess';
        v.spyAllIn = { playerId: v.me.playerId, choosing: true };
        v.timers = { secondsLeft: SPY_ALL_IN_CHOOSE_SECONDS, totalSeconds: SPY_ALL_IN_CHOOSE_SECONDS };
        break;
      }
      case 'GUESS_LOCATION': {
        const targetLoc = v.locations.find((l) => l.id === cmd.locationId) ?? v.locations[0];
        if (v.phase === 'spy_guess' || cmd.locationId === v.locations[0]?.id) {
          v.phase = 'finished';
          v.finishedSummary = {
            winner: 'spies',
            reason: 'location_guessed',
            location: targetLoc,
            spies: [v.me.playerId],
            places: v.players.map((p, i) => ({
              playerId: p.id,
              points: p.id === v.me.playerId ? 2 : 0,
              place: p.id === v.me.playerId ? 1 : i + 1,
            })),
          };
          v.players = v.players.map((p) => ({
            ...p,
            reveal: p.id === v.me.playerId ? { kind: 'spy' } : { kind: 'local', role: 'Очевидец' },
          }));
        } else {
          v.me.guessedLocationIds = [...(v.me.guessedLocationIds ?? []), cmd.locationId];
          v.me.guessAvailableFromRound = v.round + 2;
          v.can.name = false;
          v.can.blockedReason = 'guess_cooldown';
          v.notices = [{ id: `n_${Date.now()}`, kind: 'my_failed_guess', round: v.round + 2 }];
        }
        break;
      }
      case 'LEAVE': {
        v.phase = 'lobby';
        delete v.accusation;
        delete v.voteResult;
        delete v.finishedSummary;
        break;
      }
    }

    this.staticOverrideView = v;
    this.emit();
  }

  public sendForPlayer(actorId: string, cmd: SpyCommand): void {
    const actor = this.state.players.find((p) => p.id === actorId);
    if (!actor) return;

    switch (cmd.type) {
      case 'SET_SETTINGS': {
        if (this.state.phase !== 'lobby' || !actor.isHost) return;
        if (cmd.packId && LOCATION_PACKS.some((p) => p.id === cmd.packId)) {
          this.state.packId = cmd.packId;
          const pack = LOCATION_PACKS.find((p) => p.id === cmd.packId)!;
          this.state.locations = pack.locations.map(({ id, name, icon }) => ({ id, name, icon }));
        }
        if (cmd.rounds !== undefined) {
          this.state.rounds = Math.min(
            this.state.maxRounds,
            Math.max(this.state.minRounds, Math.round(cmd.rounds))
          );
        }
        this.emit();
        break;
      }

      case 'START_GAME': {
        if (!actor.isHost) return;
        if (this.state.phase === 'finished') {
          const count = this.state.players.length;
          const packId = this.state.packId;
          const rounds = this.state.rounds;
          this.state = this.createInitialLobbyState(count);
          this.state.packId = packId;
          this.state.rounds = rounds;
          const pack = LOCATION_PACKS.find((p) => p.id === packId) ?? LOCATION_PACKS[0];
          this.state.locations = pack.locations.map(({ id, name, icon }) => ({ id, name, icon }));
          this.emit();
          return;
        }
        if (this.state.phase !== 'lobby' || this.state.players.length < 3) return;
        this.startDealPhase();
        this.emit();
        break;
      }

      case 'HIDE_CARD': {
        if (this.state.phase !== 'deal') return;
        this.state.cardOpen[actorId] = false;
        this.emit();
        break;
      }

      case 'SHOW_CARD_AGAIN': {
        if (this.state.phase !== 'deal') return;
        if (this.state.ready[actorId]) return;
        if (this.state.cardOpen[actorId]) return;
        const left = this.state.cardRevealsLeft[actorId] ?? 0;
        if (left <= 0) return;
        this.state.cardRevealsLeft[actorId] = left - 1;
        this.state.cardOpen[actorId] = true;
        this.state.stepSecondsLeft = Math.max(this.state.stepSecondsLeft ?? 8, 8);
        this.emit();
        break;
      }

      case 'READY': {
        if (this.state.phase !== 'deal') return;
        this.state.cardOpen[actorId] = false;
        this.state.ready[actorId] = true;
        if (this.autoSimulateBots) {
          // Боты тоже отмечаются готовыми, чтобы живую партию было удобно тестировать
          for (const p of this.state.players) {
            if (p.id !== actorId) {
              this.state.cardOpen[p.id] = false;
              this.state.ready[p.id] = true;
            }
          }
        }
        if (this.state.players.every((p) => this.state.ready[p.id])) {
          this.beginFirstTurn();
        }
        this.emit();
        break;
      }

      case 'ACCUSE': {
        const view = buildViewForPlayer(this.state, actorId);
        if (!view.can.name || this.state.spyIds.includes(actorId)) return;
        const target = this.state.players.find(
          (p) => p.id === cmd.targetId && p.status === 'in' && p.id !== actorId
        );
        if (!target) return;

        const eligibleVoters = this.state.players
          .filter((p) => p.status === 'in' && p.id !== target.id)
          .map((p) => p.id);
        const supportNeeded = calculateSupportNeeded(eligibleVoters.length);

        const acc: InternalAccusation = {
          stage: 'support',
          kind: 'accuse',
          accuserId: actorId,
          targetId: target.id,
          supportByPlayer: { [actorId]: true },
          supportNeeded,
          voteByPlayer: {},
          eligibleVoterIds: eligibleVoters,
        };
        this.state.accusation = acc;
        this.state.stepSecondsLeft = SUPPORT_SECONDS;
        this.state.stepTotalSeconds = SUPPORT_SECONDS;

        // Если достаточно уже 1 голоса (партия на 3–4 человека), сразу переходим к голосованию
        if (1 >= supportNeeded) {
          this.transitionSupportToVote();
        }
        this.emit();
        break;
      }

      case 'ALL_IN_ACCUSE': {
        const view = buildViewForPlayer(this.state, actorId);
        if (!view.can.allIn || this.state.spyIds.includes(actorId)) return;
        const target = this.state.players.find(
          (p) => p.id === cmd.targetId && p.status === 'in' && p.id !== actorId
        );
        if (!target) return;

        const eligibleVoters = this.state.players
          .filter((p) => p.status === 'in' && p.id !== target.id)
          .map((p) => p.id);

        this.state.accusation = {
          stage: 'vote',
          kind: 'all_in',
          accuserId: actorId,
          targetId: target.id,
          supportByPlayer: { [actorId]: true },
          supportNeeded: 1,
          voteByPlayer: { [actorId]: 'spy' },
          eligibleVoterIds: eligibleVoters,
        };
        this.state.stepSecondsLeft = VOTE_SECONDS;
        this.state.stepTotalSeconds = VOTE_SECONDS;
        this.checkVoteCompletion();
        this.emit();
        break;
      }

      case 'SUPPORT': {
        const acc = this.state.accusation;
        if (!acc || acc.stage !== 'support') return;
        const view = buildViewForPlayer(this.state, actorId);
        if (!view.can.support) return;

        acc.supportByPlayer[actorId] = cmd.support;
        const supportersCount = Object.values(acc.supportByPlayer).filter(Boolean).length;
        if (supportersCount >= acc.supportNeeded) {
          this.transitionSupportToVote();
        } else {
          // Проверяем, остались ли ещё участники, способные поддержать
          const remainingPotentialSupporters = this.state.players.filter((p) => {
            if (p.status !== 'in' || p.id === acc.targetId) return false;
            if (acc.supportByPlayer[p.id] !== undefined) return false;
            const pen = this.state.penaltyUntilRound[p.id];
            if (pen && this.state.round < pen) return false;
            return true;
          }).length;

          if (supportersCount + remainingPotentialSupporters < acc.supportNeeded) {
            this.failSupportStage();
          }
        }
        this.emit();
        break;
      }

      case 'VOTE': {
        const acc = this.state.accusation;
        if (!acc || acc.stage !== 'vote') return;
        const view = buildViewForPlayer(this.state, actorId);
        if (!view.can.vote) return;

        acc.voteByPlayer[actorId] = cmd.vote;
        this.checkVoteCompletion();
        this.emit();
        break;
      }

      case 'SPY_ALL_IN': {
        const view = buildViewForPlayer(this.state, actorId);
        if (!view.can.allIn || !this.state.spyIds.includes(actorId)) return;

        this.state.accusation = undefined;
        this.state.phase = 'spy_guess';
        this.state.spyAllIn = { playerId: actorId, choosing: false };
        this.state.stepSecondsLeft = SPY_ALL_IN_PREP_SECONDS;
        this.state.stepTotalSeconds = SPY_ALL_IN_PREP_SECONDS;
        this.emit();
        break;
      }

      case 'GUESS_LOCATION': {
        if (!this.state.spyIds.includes(actorId)) return;
        const locExists = this.state.locations.some((l) => l.id === cmd.locationId);
        if (!locExists) return;

        // Случай 1: ва-банк шпиона
        if (
          this.state.phase === 'spy_guess' &&
          this.state.spyAllIn?.playerId === actorId &&
          this.state.spyAllIn.choosing
        ) {
          if (cmd.locationId === this.state.realLocationId) {
            this.state.locationGuesserId = actorId;
            this.finishGame('spies', 'location_guessed');
          } else {
            this.eliminatePlayer(actorId);
            this.state.spyAllIn = undefined;
            if (!this.checkEndConditionsAfterElimination()) {
              this.state.phase = 'turn';
              this.resumeTurnTimer();
            }
          }
          this.emit();
          return;
        }

        // Случай 2: тихая попытка шпиона через «Назвать»
        const view = buildViewForPlayer(this.state, actorId);
        if (!view.can.name) return;
        const prevGuesses = this.state.guessedLocationsBySpy[actorId] ?? [];
        if (prevGuesses.includes(cmd.locationId)) return;

        if (cmd.locationId === this.state.realLocationId) {
          this.state.locationGuesserId = actorId;
          this.finishGame('spies', 'location_guessed');
        } else {
          const updated = [...prevGuesses, cmd.locationId];
          this.state.guessedLocationsBySpy[actorId] = updated;
          const hasMoreAttempts = updated.length < MAX_SPY_SILENT_GUESSES;
          const nextRound = hasMoreAttempts ? this.state.round + 2 : undefined;
          if (nextRound) {
            this.state.guessAvailableFromRound[actorId] = nextRound;
          }
          this.pushNotice(actorId, 'my_failed_guess', nextRound);
          // Через несколько секунд всем приходит обезличенное сообщение
          this.state.pendingPublicGuessNoticeInSeconds = 3;
        }
        this.emit();
        break;
      }

      case 'HINT': {
        const view = buildViewForPlayer(this.state, actorId);
        if (!view.can.hint) return;
        const used = this.state.usedHintIndicesByPlayer[actorId] ?? [];
        const availableIndices = SAMPLE_HINTS_POOL.map((_, i) => i).filter(
          (i) => !used.includes(i)
        );
        const pickedIndices = shuffleWithRng(availableIndices, this.rng).slice(0, 3);
        this.state.usedHintIndicesByPlayer[actorId] = [...used, ...pickedIndices];
        this.state.openHintByPlayer[actorId] = pickedIndices.map((idx) => SAMPLE_HINTS_POOL[idx]);
        this.state.hintAvailableFromRound[actorId] = this.state.round + 2;
        this.emit();
        break;
      }

      case 'LEAVE': {
        const count = this.state.players.length;
        this.state = this.createInitialLobbyState(count);
        this.emit();
        break;
      }
    }
  }

  public startDealPhase(): void {
    const pack = LOCATION_PACKS.find((p) => p.id === this.state.packId) ?? LOCATION_PACKS[0];
    const pickedLocations = pack.locations.slice(0, 14);
    const chosenLoc = pickedLocations[Math.floor(this.rng() * pickedLocations.length)];

    const spiesCount = calculateSpiesCount(this.state.players.length);
    const shuffledPlayers = shuffleWithRng(this.state.players, this.rng);
    // Для удобства живого теста делаем так, чтобы первый игрок был жителем, а второй — шпионом (если >= 3)
    const spyIds = shuffledPlayers.slice(0, spiesCount).map((p) => p.id);

    const shuffledRoles = shuffleWithRng(chosenLoc.roles, this.rng);
    const localRoles: Record<string, string> = {};
    let roleIdx = 0;
    for (const p of this.state.players) {
      p.status = 'in';
      if (!spyIds.includes(p.id)) {
        localRoles[p.id] = shuffledRoles[roleIdx % shuffledRoles.length];
        roleIdx += 1;
      }
    }

    const cardOpen: Record<string, boolean> = {};
    const cardRevealsLeft: Record<string, number> = {};
    const ready: Record<string, boolean> = {};
    const guessedLocationsBySpy: Record<string, string[]> = {};

    for (const p of this.state.players) {
      cardOpen[p.id] = true;
      cardRevealsLeft[p.id] = 1;
      ready[p.id] = false;
      if (spyIds.includes(p.id)) {
        guessedLocationsBySpy[p.id] = [];
      }
    }

    this.state = {
      ...this.state,
      phase: 'deal',
      locations: pickedLocations.map(({ id, name, icon }) => ({ id, name, icon })),
      realLocationId: chosenLoc.id,
      spyIds,
      localRoles,
      cardOpen,
      cardRevealsLeft,
      ready,
      round: 1,
      activePlayerId: undefined,
      playedInCurrentRound: [],
      turnStep: undefined,
      turnSecondsRemaining: TURN_QUESTIONS_SECONDS,
      stepSecondsLeft: DEAL_CARD_SECONDS,
      stepTotalSeconds: DEAL_CARD_SECONDS,
      guessedLocationsBySpy,
      guessAvailableFromRound: {},
      penaltyUntilRound: {},
      hintAvailableFromRound: {},
      usedHintIndicesByPlayer: {},
      openHintByPlayer: {},
      accusation: undefined,
      spyAllIn: undefined,
      voteResult: undefined,
      pendingPublicGuessNoticeInSeconds: undefined,
      noticesByPlayer: {},
      catchInitiatorCounts: {},
      locationGuesserId: undefined,
      finishedReason: undefined,
      finishedWinner: undefined,
    };
  }

  private beginFirstTurn(): void {
    const firstActive = this.state.players.find((p) => p.status === 'in');
    if (!firstActive) return;
    this.state.phase = 'turn';
    this.state.round = 1;
    this.state.playedInCurrentRound = [];
    this.startTurnForPlayer(firstActive.id);
  }

  private startTurnForPlayer(playerId: string): void {
    this.state.activePlayerId = playerId;
    this.state.turnStep = 'attention';
    this.state.turnSecondsRemaining = TURN_QUESTIONS_SECONDS;
    this.state.stepSecondsLeft = ATTENTION_PAUSE_SECONDS;
    this.state.stepTotalSeconds = ATTENTION_PAUSE_SECONDS;
  }

  private resumeTurnTimer(): void {
    if (this.state.turnStep === 'attention') {
      this.state.stepSecondsLeft = ATTENTION_PAUSE_SECONDS;
      this.state.stepTotalSeconds = ATTENTION_PAUSE_SECONDS;
    } else {
      this.state.turnStep = 'questions';
      this.state.stepSecondsLeft = Math.max(5, this.state.turnSecondsRemaining);
      this.state.stepTotalSeconds = TURN_QUESTIONS_SECONDS;
    }
  }

  private transitionSupportToVote(): void {
    const acc = this.state.accusation;
    if (!acc) return;
    acc.stage = 'vote';
    this.state.stepSecondsLeft = VOTE_SECONDS;
    this.state.stepTotalSeconds = VOTE_SECONDS;
  }

  private failSupportStage(): void {
    const acc = this.state.accusation;
    if (!acc) return;
    const penalizedUntil = this.state.round + 2;
    for (const [pid, supported] of Object.entries(acc.supportByPlayer)) {
      if (supported) {
        this.state.penaltyUntilRound[pid] = penalizedUntil;
        this.pushNotice(pid, 'penalty', penalizedUntil);
      }
    }
    this.state.voteResult = {
      text: 'failed',
      targetId: acc.targetId,
      accuserId: acc.accuserId,
      secondsLeft: VOTE_RESULT_SECONDS,
    };
    this.state.accusation = undefined;
  }

  private checkVoteCompletion(): void {
    const acc = this.state.accusation;
    if (!acc || acc.stage !== 'vote') return;
    if (Object.keys(acc.voteByPlayer).length < acc.eligibleVoterIds.length) return;
    this.resolveVote();
  }

  private resolveVote(): void {
    const acc = this.state.accusation;
    if (!acc) return;

    const spyVotes = Object.values(acc.voteByPlayer).filter((v) => v === 'spy').length;
    const majority = isVoteSuccessful(spyVotes, acc.eligibleVoterIds.length);
    const targetIsSpy = this.state.spyIds.includes(acc.targetId);

    this.state.accusation = undefined;

    if (acc.kind === 'all_in') {
      if (majority && targetIsSpy) {
        this.eliminatePlayer(acc.targetId);
        this.state.catchInitiatorCounts[acc.accuserId] =
          (this.state.catchInitiatorCounts[acc.accuserId] ?? 0) + 1;
        this.state.voteResult = {
          text: 'spy_caught',
          targetId: acc.targetId,
          accuserId: acc.accuserId,
          secondsLeft: VOTE_RESULT_SECONDS,
        };
      } else {
        this.eliminatePlayer(acc.accuserId);
        this.state.voteResult = {
          text: 'all_in_out',
          targetId: acc.targetId,
          accuserId: acc.accuserId,
          secondsLeft: VOTE_RESULT_SECONDS,
        };
      }
    } else {
      // Обычное обвинение
      if (majority && targetIsSpy) {
        this.eliminatePlayer(acc.targetId);
        this.state.catchInitiatorCounts[acc.accuserId] =
          (this.state.catchInitiatorCounts[acc.accuserId] ?? 0) + 1;
        this.state.voteResult = {
          text: 'spy_caught',
          targetId: acc.targetId,
          accuserId: acc.accuserId,
          secondsLeft: VOTE_RESULT_SECONDS,
        };
      } else if (majority && !targetIsSpy) {
        const penalizedUntil = this.state.round + 2;
        for (const [pid, supported] of Object.entries(acc.supportByPlayer)) {
          if (supported) {
            this.state.penaltyUntilRound[pid] = penalizedUntil;
            this.pushNotice(pid, 'penalty', penalizedUntil);
          }
        }
        this.state.voteResult = {
          text: 'innocent',
          targetId: acc.targetId,
          accuserId: acc.accuserId,
          secondsLeft: VOTE_RESULT_SECONDS,
        };
      } else {
        this.state.voteResult = {
          text: 'failed',
          targetId: acc.targetId,
          accuserId: acc.accuserId,
          secondsLeft: VOTE_RESULT_SECONDS,
        };
      }
    }

    this.state.stepSecondsLeft = VOTE_RESULT_SECONDS;
    this.state.stepTotalSeconds = VOTE_RESULT_SECONDS;
  }

  private eliminatePlayer(playerId: string): void {
    const p = this.state.players.find((pl) => pl.id === playerId);
    if (p) {
      p.status = 'out';
    }
  }

  private checkEndConditionsAfterElimination(): boolean {
    const inPlayers = this.state.players.filter((p) => p.status === 'in');
    const spiesLeft = inPlayers.filter((p) => this.state.spyIds.includes(p.id)).length;

    if (spiesLeft === 0) {
      this.finishGame('locals', 'all_spies_out');
      return true;
    }
    if (inPlayers.length < 3) {
      this.finishGame(spiesLeft > 0 ? 'spies' : 'locals', 'too_few_players');
      return true;
    }
    return false;
  }

  private finishGame(
    winner: 'locals' | 'spies',
    reason: 'all_spies_out' | 'location_guessed' | 'rounds_over' | 'too_few_players'
  ): void {
    this.state.phase = 'finished';
    this.state.finishedWinner = winner;
    this.state.finishedReason = reason;
    this.state.accusation = undefined;
    this.state.spyAllIn = undefined;
    this.state.voteResult = undefined;
    this.state.stepSecondsLeft = undefined;
    this.state.stepTotalSeconds = undefined;
  }

  private pushNotice(
    playerId: string,
    kind: 'failed_guess_public' | 'my_failed_guess' | 'penalty',
    round?: number
  ): void {
    const id = `ntc_${this.noticeSeq++}`;
    const existing = this.state.noticesByPlayer[playerId] ?? [];
    this.state.noticesByPlayer[playerId] = [
      ...existing,
      { id, kind, ...(round !== undefined ? { round } : {}), ttl: 4 },
    ];
  }

  private advanceToNextTurnOrRound(): void {
    if (this.state.activePlayerId && !this.state.playedInCurrentRound.includes(this.state.activePlayerId)) {
      this.state.playedInCurrentRound.push(this.state.activePlayerId);
    }

    const nextInRound = this.state.players.find(
      (p) => p.status === 'in' && !this.state.playedInCurrentRound.includes(p.id)
    );

    if (nextInRound) {
      this.startTurnForPlayer(nextInRound.id);
      return;
    }

    // Круг завершён
    if (this.state.round >= this.state.rounds) {
      const spiesLeft = this.state.players.filter(
        (p) => p.status === 'in' && this.state.spyIds.includes(p.id)
      ).length;
      this.finishGame(spiesLeft > 0 ? 'spies' : 'locals', spiesLeft > 0 ? 'rounds_over' : 'all_spies_out');
      return;
    }

    this.state.round += 1;
    this.state.playedInCurrentRound = [];
    const firstOfNewRound = this.state.players.find((p) => p.status === 'in');
    if (firstOfNewRound) {
      this.startTurnForPlayer(firstOfNewRound.id);
    }
  }

  /**
   * Продвигает серверное время мок-партии на `seconds` секунд.
   */
  public tick(seconds = 1): void {
    for (let s = 0; s < seconds; s += 1) {
      this.tickOneSecond();
    }
    this.emit();
  }

  private tickOneSecond(): void {
    // 1. Уменьшаем TTL уведомлений
    for (const pid of Object.keys(this.state.noticesByPlayer)) {
      this.state.noticesByPlayer[pid] = this.state.noticesByPlayer[pid]
        .map((n) => ({ ...n, ttl: n.ttl - 1 }))
        .filter((n) => n.ttl > 0);
    }

    // 2. Отложенное публичное уведомление о неудачной попытке шпиона (без имени)
    if (this.state.pendingPublicGuessNoticeInSeconds !== undefined) {
      this.state.pendingPublicGuessNoticeInSeconds -= 1;
      if (this.state.pendingPublicGuessNoticeInSeconds <= 0) {
        this.state.pendingPublicGuessNoticeInSeconds = undefined;
        for (const p of this.state.players) {
          this.pushNotice(p.id, 'failed_guess_public');
        }
      }
    }

    // 3. По фазам
    if (this.state.phase === 'deal') {
      if (this.state.stepSecondsLeft !== undefined) {
        this.state.stepSecondsLeft = Math.max(0, this.state.stepSecondsLeft - 1);
        if (this.state.stepSecondsLeft === 0) {
          // Скрываем открытые карты; если все уже посмотрели или истекло время — переходим к ходу
          const anyStillOpen = Object.values(this.state.cardOpen).some(Boolean);
          if (anyStillOpen) {
            for (const p of this.state.players) {
              this.state.cardOpen[p.id] = false;
            }
            this.state.stepSecondsLeft = 10;
            this.state.stepTotalSeconds = 10;
          } else {
            this.beginFirstTurn();
          }
        }
      }
      return;
    }

    if (this.state.phase === 'spy_guess' && this.state.spyAllIn) {
      if (this.state.stepSecondsLeft !== undefined) {
        this.state.stepSecondsLeft = Math.max(0, this.state.stepSecondsLeft - 1);
        if (this.state.stepSecondsLeft === 0) {
          if (!this.state.spyAllIn.choosing) {
            this.state.spyAllIn.choosing = true;
            this.state.stepSecondsLeft = SPY_ALL_IN_CHOOSE_SECONDS;
            this.state.stepTotalSeconds = SPY_ALL_IN_CHOOSE_SECONDS;
          } else {
            // Время выбора шпиона вышло — промах и выбывание
            const spyId = this.state.spyAllIn.playerId;
            this.eliminatePlayer(spyId);
            this.state.spyAllIn = undefined;
            if (!this.checkEndConditionsAfterElimination()) {
              this.state.phase = 'turn';
              this.resumeTurnTimer();
            }
          }
        }
      }
      return;
    }

    if (this.state.phase === 'turn') {
      // Если показывается баннер результата голосования (3–4 с)
      if (this.state.voteResult) {
        this.state.voteResult.secondsLeft = Math.max(0, this.state.voteResult.secondsLeft - 1);
        this.state.stepSecondsLeft = this.state.voteResult.secondsLeft;
        if (this.state.voteResult.secondsLeft === 0) {
          this.state.voteResult = undefined;
          if (this.checkEndConditionsAfterElimination()) return;
          // Если активный игрок выбыл на ва-банке или голосовании — передаём ход
          const active = this.state.players.find((p) => p.id === this.state.activePlayerId);
          if (!active || active.status === 'out') {
            this.advanceToNextTurnOrRound();
          } else if (this.state.turnSecondsRemaining <= 0) {
            this.advanceToNextTurnOrRound();
          } else {
            this.resumeTurnTimer();
          }
        }
        return;
      }

      // Если идёт обвинение (поддержка или голосование)
      if (this.state.accusation) {
        const acc = this.state.accusation;

        // Правило 3.7: если обвиняет САМ активный игрок — его время хода продолжает идти
        if (acc.accuserId === this.state.activePlayerId && this.state.turnStep === 'questions') {
          this.state.turnSecondsRemaining = Math.max(0, this.state.turnSecondsRemaining - 1);
        }

        // Автосимуляция ответов остальных игроков за столом в живом режиме
        if (this.autoSimulateBots) {
          if (acc.stage === 'support') {
            const pendingBot = this.state.players.find(
              (p) =>
                p.id !== this.viewerId &&
                p.status === 'in' &&
                !p.isOffline &&
                p.id !== acc.targetId &&
                acc.supportByPlayer[p.id] === undefined &&
                !(this.state.penaltyUntilRound[p.id] && this.state.round < this.state.penaltyUntilRound[p.id])
            );
            if (pendingBot && this.rng() < 0.55) {
              const botSupports = this.rng() < 0.65;
              this.sendForPlayer(pendingBot.id, { type: 'SUPPORT', support: botSupports });
              return;
            }
          } else if (acc.stage === 'vote') {
            const pendingVoter = this.state.players.find(
              (p) =>
                p.id !== this.viewerId &&
                p.status === 'in' &&
                !p.isOffline &&
                acc.eligibleVoterIds.includes(p.id) &&
                acc.voteByPlayer[p.id] === undefined
            );
            if (pendingVoter && this.rng() < 0.6) {
              const targetIsSpy = this.state.spyIds.includes(acc.targetId);
              const voteSpy = targetIsSpy ? this.rng() < 0.72 : this.rng() < 0.35;
              this.sendForPlayer(pendingVoter.id, { type: 'VOTE', vote: voteSpy ? 'spy' : 'not_spy' });
              return;
            }
          }
        }

        if (this.state.stepSecondsLeft !== undefined) {
          this.state.stepSecondsLeft = Math.max(0, this.state.stepSecondsLeft - 1);
          if (this.state.stepSecondsLeft === 0) {
            if (acc.stage === 'support') {
              this.failSupportStage();
            } else {
              this.resolveVote();
            }
          }
        }
        return;
      }

      // Обычный ход: пауза внимания -> таймер вопросов
      if (this.state.stepSecondsLeft !== undefined) {
        this.state.stepSecondsLeft = Math.max(0, this.state.stepSecondsLeft - 1);
        if (this.state.turnStep === 'questions') {
          this.state.turnSecondsRemaining = this.state.stepSecondsLeft;
        }
        if (this.state.stepSecondsLeft === 0) {
          if (this.state.turnStep === 'attention') {
            this.state.turnStep = 'questions';
            this.state.stepSecondsLeft = this.state.turnSecondsRemaining;
            this.state.stepTotalSeconds = TURN_QUESTIONS_SECONDS;
          } else {
            this.advanceToNextTurnOrRound();
          }
        }
      }
    }
  }
}
