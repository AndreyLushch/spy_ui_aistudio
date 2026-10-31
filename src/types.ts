export type SpyPhase = 'lobby' | 'deal' | 'turn' | 'spy_guess' | 'finished';

export interface SpyPlayer {
  id: string;
  nickname: string;
  isHost: boolean;
  status: 'in' | 'out';
  isOffline?: boolean;
  /** только на финале */
  reveal?: { kind: 'spy' } | { kind: 'local'; role: string };
}

export interface SpyLocation {
  id: string;
  name: string;
  /** эмодзи или ключ пиктограммы */
  icon?: string;
}

export type SpyCard = { kind: 'spy' } | { kind: 'local'; locationId: string; locationName: string; role: string };

export interface SpyPlayerView {
  gameId: 'spy';
  phase: SpyPhase;
  players: SpyPlayer[];
  spiesTotal: number;
  spiesInGame: number;
  settings: { packId: string; packs: Array<{ id: string; name: string }>; rounds: number; minRounds: number; maxRounds: number; estimatedMinutes: number };
  /** возможные локации партии (с раздачи) */
  locations: SpyLocation[];
  round: number;
  activePlayerId?: string;
  timers: {
    /** таймер текущего шага: показ карты, пауза внимания, ход, поддержка, голосование, отсчёт ва-банка */
    secondsLeft?: number;
    totalSeconds?: number;
    turnPaused?: boolean;
  };
  /** подшаг хода */
  turnStep?: 'attention' | 'questions';
  me: {
    playerId: string;
    isHost: boolean;
    status: 'in' | 'out';
    /** карта — только пока открыта (раздача и «Посмотреть ещё раз»), иначе нет поля */
    card?: SpyCard;
    cardRevealsLeft: number;
    ready: boolean;
    /** шпион: локации, которые уже называл (для списка), и когда снова можно */
    guessedLocationIds?: string[];
    guessAvailableFromRound?: number;
    penaltyUntilRound?: number;
    hintAvailableFromRound?: number;
    /** открытая подсказка */
    hint?: string[];
  };
  /**
   * Что сейчас можно нажать. Сервер считает с учётом роли, но кнопки у всех одни и те же («Назвать», «Ва-банк»,
   * «Подсказка»); причина недоступности — для подписи под кнопкой.
   */
  can: {
    name: boolean;
    allIn: boolean;
    hint: boolean;
    support: boolean;
    vote: boolean;
    blockedReason?: 'accusation_in_progress' | 'penalty' | 'guess_cooldown' | 'no_guesses_left' | 'hint_cooldown' | 'out' | 'not_your_vote';
  };
  readyCount?: number;
  accusation?: {
    stage: 'support' | 'vote';
    kind: 'accuse' | 'all_in';
    accuserId: string;
    targetId: string;
    supporters: number;
    supportNeeded: number;
    voted: number;
    voters: number;
    mySupport?: boolean;
    myVote?: 'spy' | 'not_spy';
  };
  spyAllIn?: { playerId: string; choosing: boolean };
  voteResult?: { text: 'spy_caught' | 'innocent' | 'failed' | 'all_in_out'; targetId?: string; accuserId?: string; secondsLeft: number };
  notices?: Array<{ id: string; kind: 'failed_guess_public' | 'my_failed_guess' | 'penalty'; round?: number }>;
  finishedSummary?: {
    winner: 'locals' | 'spies';
    reason: 'all_spies_out' | 'location_guessed' | 'rounds_over' | 'too_few_players';
    location: SpyLocation;
    spies: string[];
    places: Array<{ playerId: string; points: number; place: number }>;
  };
}

export type SpyCommand =
  | { type: 'SET_SETTINGS'; packId?: string; rounds?: number }
  | { type: 'START_GAME' }
  | { type: 'HIDE_CARD' }
  | { type: 'SHOW_CARD_AGAIN' }
  | { type: 'READY' }
  | { type: 'ACCUSE'; targetId: string }
  | { type: 'ALL_IN_ACCUSE'; targetId: string }
  | { type: 'SUPPORT'; support: boolean }
  | { type: 'VOTE'; vote: 'spy' | 'not_spy' }
  | { type: 'GUESS_LOCATION'; locationId: string }
  | { type: 'SPY_ALL_IN' }
  | { type: 'HINT' }
  | { type: 'LEAVE' };
