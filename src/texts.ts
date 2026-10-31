/**
 * Все пользовательские тексты интерфейса на русском языке (раздел 8 ТЗ).
 * Тон: дружеский, на «ты», коротко, с лёгкой шпионской иронией, без лишнего рода.
 */

export const TEXTS = {
  common: {
    gameTitle: 'Шпион',
    gameSubtitle: 'В одной комнате · каждый со своим телефоном',
    rulesBtnLabel: 'Правила игры',
    locationsBtnLabel: 'Возможные локации',
    close: 'Закрыть',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    continueBtn: 'Продолжить',
    gotIt: 'Понятно',
    paused: 'пауза',
    waitingServer: 'Секунду, отправляем ход…',
    reconnecting: 'Переподключаемся…',
    loading: 'Загружаем партию…',
    offlineTag: 'не в сети',
    outTag: 'выбыл',
    hostTag: 'ведущий',
    youTag: 'ты',
    eliminatedBanner: 'Ты выбыл — досматриваешь партию',
    platformHeaderPlaceholder: 'Место под шапку платформы (56 px)',
  },

  lobby: {
    playersHeading: 'Участники в комнате',
    spiesCountLabel: (spies: number) => `Шпионов в партии: ${spies}`,
    spiesRuleHint: '3–8 игроков — 1 шпион · 9–15 игроков — 2 шпиона',
    packLabel: 'Набор локаций',
    roundsLabel: 'Число раундов',
    estimatedTime: (minutes: number) => `≈ ${minutes} мин на партию`,
    startGame: 'Начать игру',
    needMorePlayers: 'Нужно минимум 3 игрока',
    waitingForHost: 'Ждём ведущего',
    waitingHint: 'Ведущий выбирает набор локаций и запускает раздачу',
    leaveRoom: 'Выйти из комнаты',
  },

  deal: {
    kicker: 'Секретное досье',
    peekWarning: 'Прикрой экран от соседей',
    localLocationLabel: 'Локация',
    localRoleLabel: 'Твоя роль',
    spyHeadline: 'Ты — шпион',
    spySubline: 'Локация тебе неизвестна. Слушай вопросы, не выдай себя и вычисли место.',
    localSubline: 'Задавай вопросы так, чтобы свои поняли, а шпион не догадался.',
    hideCard: 'Скрыть',
    cardHiddenTitle: 'Карта скрыта',
    cardHiddenHintCanReveal: 'Забыл роль? Можно подсмотреть ещё один раз.',
    cardHiddenHintNoReveals: 'Повторный просмотр уже использован.',
    showCardAgain: 'Посмотреть ещё раз',
    noRevealsLeft: 'Просмотр использован',
    readyBtn: 'Готов',
    youAreReady: 'Ты готов · ждём остальных',
    readyProgress: (ready: number, total: number) => `Готовы ${ready} из ${total}`,
  },

  turn: {
    roundOf: (round: number, total: number) => `Раунд ${round} из ${total}`,
    spiesInGame: (count: number) => `Шпионов в игре: ${count}`,
    askingNow: (nickname: string) => `Сейчас задаёт вопросы ${nickname}`,
    askingNowShort: (nickname: string) => `Сейчас спрашивает ${nickname}`,
    yourTurnHeadline: 'Твой ход! Спрашивай кого хочешь',
    yourTurnSubline: 'Выбери любого игрока за столом и задай один вопрос вслух.',
    otherTurnSubline: 'Внимательно слушай вопрос и ответ — ищи несостыковки.',
    activeOfflineNote: 'Игрок не в сети — ход перейдёт дальше по таймеру',
    attentionBadge: 'Смена хода',
  },

  actions: {
    name: 'Назвать',
    allIn: 'Ва-банк',
    hint: 'Подсказка',
    shortReasons: {
      accusation_in_progress: 'Идёт спор',
      penalty: (round?: number) => (round ? `До ${round} раунда` : 'Штраф'),
      guess_cooldown: (round?: number) => (round ? `С ${round} раунда` : 'Пауза'),
      no_guesses_left: 'Нет попыток',
      hint_cooldown: (round?: number) => (round ? `С ${round} раунда` : 'Пауза'),
      out: 'Выбыл',
      not_your_vote: 'Ожидание',
    },
    longReasons: {
      accusation_in_progress: 'Пока идёт обвинение или голосование, новые запускать нельзя',
      penalty: (round?: number) =>
        round ? `Штраф до раунда ${round} — обвинения и ва-банк временно закрыты` : 'Штраф за неудачное обвинение',
      guess_cooldown: (round?: number) =>
        round ? `Следующая попытка назвать локацию — в раунде ${round}` : 'Попытка временно недоступна',
      no_guesses_left: 'Попытки назвать локацию закончились (остался только ва-банк)',
      hint_cooldown: (round?: number) =>
        round ? `Следующая подсказка будет доступна с раунда ${round}` : 'Подсказка на перезарядке',
    },
  },

  modals: {
    locationsTitle: 'Возможные локации',
    locationsSubtitle: (count: number) => `${count} мест в этой партии · настоящая локация не помечена`,
    accuseTitle: 'Кого обвинить в шпионаже?',
    accuseSubtitle: 'Нужна поддержка хотя бы 30 % стола. При провале — штраф до конца следующего раунда.',
    accuseConfirm: (nickname: string) => `Обвинить: ${nickname}`,
    guessTitle: 'Назвать локацию',
    guessSubtitle: 'Угадаешь — победа шпионов. Ошибёшься — никто не узнает, кто пробовал, но будет пауза.',
    guessConfirm: (locName: string) => `Угадать: ${locName}`,
    alreadyGuessed: 'уже называлась',
    allInWarningTitle: 'Идёшь ва-банк?',
    allInWarningBody: 'Ошибёшься — выбываешь из партии сразу, без права на вторую попытку.',
    allInLocalExplain: 'Житель запускает мгновенное голосование без сбора поддержки. Шпион открыто называет локацию.',
    allInPickTargetTitle: 'Ва-банк: кто шпион?',
    allInPickTargetSubtitle: 'Стол сразу перейдёт к голосованию. Если это не шпион или голосов не хватит — ты выбываешь.',
    allInConfirmTarget: (nickname: string) => `Ва-банк против: ${nickname}`,
    hintTitle: 'Примеры вопросов',
    hintSubtitle: 'Можешь задать любой из них или придумать свой в том же духе',
  },

  support: {
    badge: 'Сбор поддержки',
    headline: (accuser: string, target: string) => `${accuser} обвиняет: ${target} — шпион`,
    question: 'Поддерживаешь выдвижение на голосование?',
    progress: (supporters: number, needed: number) => `Поддержали ${supporters} из нужных ${needed}`,
    yesBtn: 'Поддерживаю',
    noBtn: 'Не поддерживаю',
    votedYes: 'Ты поддерживаешь обвинение · ждём остальных',
    votedNo: 'Ты против обвинения · ждём остальных',
    targetReadOnly: 'Обсуждают тебя — ждём, наберётся ли поддержка',
    penalizedReadOnly: (round?: number) =>
      round ? `У тебя штраф до раунда ${round} — поддерживать нельзя` : 'У тебя штраф — поддерживать нельзя',
    outReadOnly: 'Ты досматриваешь партию',
  },

  vote: {
    badgeRegular: 'Голосование',
    badgeAllIn: (accuser: string) => `${accuser} идёт ва-банк`,
    headline: (target: string) => `${target} — шпион?`,
    sublineRegular: (accuser: string, target: string) => `Обвинение: ${accuser} → ${target}. Нужно больше половины голосов «Шпион».`,
    sublineAllIn: (accuser: string, target: string) =>
      `Ва-банк: ${accuser} → ${target}. Если обвинение не подтвердится, ${accuser} выбывает.`,
    progress: (voted: number, voters: number) => `Проголосовали ${voted} из ${voters}`,
    spyBtn: 'Шпион',
    notSpyBtn: 'Не шпион',
    myVoteSpy: 'Твой голос: «Шпион» · ждём остальных',
    myVoteNotSpy: 'Твой голос: «Не шпион» · ждём остальных',
    targetNotice: 'Идёт голосование о тебе',
    targetCanActHint: 'Пока голосуют, у тебя ещё есть ход снизу экрана',
    outReadOnly: 'Ты досматриваешь партию',
  },

  voteResult: {
    spy_caught: (target: string) => `Вы правы — ${target} шпион! Выбывает из игры.`,
    innocent: (target: string) => `Вы ошиблись — ${target} не шпион. Обвинители получают штраф.`,
    failed: 'Обвинение не прошло — продолжаем партию.',
    all_in_out: (accuser: string) => `Ва-банк не сыграл: ${accuser} ошибается и выбывает.`,
  },

  spyGuess: {
    badge: 'Ва-банк шпиона',
    publicHeadline: (nickname: string) => `${nickname} идёт ва-банк: объявляет себя шпионом и называет локацию`,
    preparingSubline: 'Внимание за столом — сейчас откроется список локаций…',
    waitingSpySubline: (nickname: string) => `${nickname} выбирает локацию. Угадает — победа шпионов, ошибётся — выбывает.`,
    choosingTitle: 'Выбери настоящую локацию',
    choosingSubtitle: 'Одна попытка: верно — победа шпионов, промах — ты выбываешь.',
  },

  notices: {
    failed_guess_public: 'Была неудачная попытка угадать локацию',
    my_failed_guess: (round?: number) =>
      round ? `Ты ошибся. Следующая попытка — в раунде ${round}` : 'Ты ошибся. Попыток больше не осталось',
    penalty: (round?: number) => (round ? `Штраф до раунда ${round}` : 'Назначен штраф за неудачное обвинение'),
  },

  finished: {
    localsWin: 'Победа жителей!',
    spiesWin: 'Победа шпионов!',
    reasons: {
      all_spies_out: 'Все шпионы вычислены и выбыли',
      location_guessed: 'Шпион разгадал настоящую локацию',
      rounds_over: 'Все раунды сыграны, шпион остался нераскрытым',
      too_few_players: 'За столом осталось меньше трёх игроков',
    },
    realLocationLabel: 'Настоящая локация',
    spiesLabel: 'Кто был шпионом',
    rolesHeading: 'Роли и очки за партию',
    pointsFormula: '+1 победителю · +1 за угаданную локацию · +1 инициатору разоблачения',
    spyRoleBadge: 'Шпион',
    playAgain: 'Играть ещё раз',
    chooseAnotherGame: 'Выбрать другую игру',
    waitingHostRestart: 'Ждём решения ведущего — сыграть ещё или сменить игру',
  },

  rules: {
    title: 'Коротко о правилах',
    sections: [
      {
        heading: '1. Кто есть кто',
        body: '3–8 игроков — 1 шпион, 9–15 игроков — 2 шпиона (друг друга они не знают). Жители видят общую локацию и свою уникальную роль. Шпионы локацию не знают.',
      },
      {
        heading: '2. Как идёт раунд',
        body: 'Все сидят в одной комнате. Активный игрок задаёт вслух вопрос любому участнику. Жители ищут шпиона намёками, шпионы пытаются понять, где все находятся.',
      },
      {
        heading: '3. Кнопка «Назвать»',
        body: 'Житель выдвигает подозреваемого: нужно ≥ 30 % поддержки стола, затем голосование (> 50 % «Шпион»). За ложное обвинение — штраф до конца следующего раунда. Шпион через эту же кнопку тайно пробует угадать локацию (до 2 раз за игру с паузой).',
      },
      {
        heading: '4. Кнопка «Ва-банк»',
        body: 'Высокий риск без права на ошибку! Житель запускает голосование сразу без поддержки, но при промахе выбывает сам. Шпион открыто вскрывается перед столом и называет локацию: угадал — победа, ошибся — выбывает.',
      },
      {
        heading: '5. Одинаковые экраны',
        body: 'Табло, таймер, вибрация и три кнопки у жителей и шпионов выглядят абсолютно одинаково — подглядывать в чужой экран бесполезно, но карту роли всё равно прикрывай.',
      },
    ],
  },
} as const;
