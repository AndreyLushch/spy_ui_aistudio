# Шпион — Интерактивный прототип Telegram Mini App (`spy_ui_aistudio`)

Интерактивный UI-прототип социальной игры-дедукции **«Шпион»** для компании от 3 до 15 человек в одном помещении: все фазы партии, наложения, живая модель на `MockAdapter`, режим синхронного сравнения экранов **«житель / шпион»** рядом и карта всех состояний.

## Быстрый старт

```bash
npm install
npm run dev      # запуск dev-сервера на http://localhost:3000
npm run build    # проверка сборки Vite
npm run lint     # строгая проверка типов TypeScript (tsc --noEmit)
npx --yes tsx --test src/api/MockAdapter.test.ts   # запуск модульных тестов правил
```

Поддерживаемые URL-параметры для быстрой отладки:
- `?autostart=1` — сразу запускает раздачу ролей минуя лобби;
- `?fixture=deal_open_local` — открывает конкретную фикстуру;
- `?compare=1` — включает режим двух телефонов рядом («житель / шпион»).

---

## 1. Архитектура и структура репозитория

- `src/types.ts` — **неизменённый контракт данных и команд** (`SpyPlayerView`, `SpyCommand` и связанные типы из раздела 6 ТЗ).
- `src/api/GameAdapter.ts` — интерфейс `GameAdapter { getView, subscribe, send }`.
- `src/api/MockAdapter.ts` — локальная модель партии (раздача, круг ходов с пропуском выбывших, сбор поддержки 30 %, голосование большинства > 50 %, ва-банк обеих сторон, тихие попытки шпиона с кулдауном и отложенным обезличенным уведомлением, штрафы, подсчёт очков финала).
- `src/api/packsData.ts` — 3 тематических пака по 14 локаций и 15 уникальных ролей в каждой + пул неповторяющихся вопросов для «Подсказки».
- `src/fixtures/index.ts` — каталог детерминированных фикстур по всем фазам, ролям, парным моментам и крайним случаям.
- `src/screens/` — чистые экраны по фазам и наложениям:
  - `LobbyScreen.tsx` (`phase: 'lobby'`)
  - `DealScreen.tsx` (`phase: 'deal'`)
  - `TurnScreen.tsx` (`phase: 'turn'`, подшаги `attention` и `questions`)
  - `SupportOverlay.tsx` (`accusation.stage === 'support'`)
  - `VoteOverlay.tsx` (`accusation.stage === 'vote'`, включая `kind === 'all_in'` и доступ шпиона к действиям)
  - `VoteResultOverlay.tsx` (`voteResult` на 3–4 с)
  - `SpyGuessScreen.tsx` (`phase: 'spy_guess'`)
  - `NoticeBanner.tsx` (`notices`)
  - `FinishedScreen.tsx` (`phase: 'finished'`)
- `src/components/` — переиспользуемые компоненты:
  - `RoleCard.tsx`, `Scoreboard.tsx`, `TimerBadge.tsx`, `ActionButtons.tsx`, `LocationsGrid.tsx`, `PlayersList.tsx`, `ActionModals.tsx`, `RulesSheet.tsx`, `SystemStates.tsx`, `PhoneViewport.tsx`, `DevPanel.tsx`, `ScreenArchitectureGuide.tsx`, `ProposalsShowcase.tsx`.
- `src/theme/tokens.ts` — все дизайн-токены в одном месте (светлая/тёмная темы и 3 стилевых направления).
- `src/texts.ts` — все русскоязычные строки и глоссарий.
- `public/fonts/` — локальные кириллические шрифты со свободной лицензией **SIL OFL 1.1** (`Rubik`, `Manrope`, `JetBrains Mono`) вместе с текстами лицензий `OFL-*.txt`.

---

## 2. Карта экранов и фикстур

| Категория | ID фикстуры | Описание состояния | Пара для сравнения |
|---|---|---|---|
| Лобби | `lobby_host` | Ведущий: выбор пака, раундов (−/+), расчёт времени, «Начать игру» | `lobby_guest` |
| Лобби | `lobby_guest` | Обычный участник: настройки на чтение, «Ждём ведущего» | `lobby_host` |
| Раздача | `deal_open_local` | Карта открыта у жителя (Подводная лодка · Кок) | `deal_open_spy` |
| Раздача | `deal_open_spy` | Карта открыта у шпиона (та же рамка, цвет, высота и таймер) | `deal_open_local` |
| Раздача | `deal_hidden_local` | Карта скрыта (`card` отсутствует), доступен 1 повторный показ | `deal_hidden_spy` |
| Раздача | `deal_hidden_spy` | Карта скрыта у шпиона | `deal_hidden_local` |
| Раздача | `deal_ready_exhausted` | Повторный просмотр использован (`cardRevealsLeft: 0`), `ready: true` | — |
| Ход | `turn_attention_other` | Пауза внимания: «Сейчас задаёт вопросы Оля» | `turn_attention_mine` |
| Ход | `turn_attention_mine` | Пауза внимания активного игрока: «Твой ход! Спрашивай кого хочешь» | `turn_attention_other` |
| Ход | `turn_questions_local` | Основной ход глазами жителя | `turn_questions_spy` |
| Ход | `turn_questions_spy` | Основной ход глазами шпиона (экран идентичен 1-в-1) | `turn_questions_local` |
| Ход | `turn_hint_opened` | Открыты 3 вопроса подсказки + кулдаун кнопки | — |
| Ход | `turn_penalized_local` | Оштрафованный житель («Штраф до раунда 4») | `turn_spy_cooldown` |
| Ход | `turn_spy_cooldown` | Шпион на кулдауне тихой попытки («С 4 раунда») | `turn_penalized_local` |
| Спор | `support_voter_local` | Сбор поддержки (≥ 30 %), таймер хода на паузе | `support_voter_spy` |
| Спор | `support_voter_spy` | Сбор поддержки глазами шпиона | `support_voter_local` |
| Спор | `support_target` | Сбор поддержки глазами обвиняемого (только просмотр) | — |
| Голосование | `vote_voter_local` | Голосование «Петя — шпион?» (проголосовали 6 из 9) | `vote_voter_spy` |
| Голосование | `vote_voter_spy` | Голосование глазами шпиона | `vote_voter_local` |
| Голосование | `vote_all_in_banner` | Мгновенное голосование при ва-банке жителя | — |
| Голосование | `vote_target_local` | Обвиняемый житель («Идёт голосование о тебе») | `vote_target_spy` |
| Голосование | `vote_target_spy` | Обвиняемый шпион (доступны «Назвать» и «Ва-банк»!) | `vote_target_local` |
| Итог спора | `vote_result_spy_caught` | Баннер «Вы правы — Петя шпион!» | — |
| Итог спора | `vote_result_innocent` | Баннер «Вы ошиблись — Петя не шпион» + личный штраф | — |
| Итог спора | `vote_result_all_in_out` | Баннер выбывания инициатора неудачного ва-банка | — |
| Ва-банк шпиона | `spy_guess_choosing_spy` | Шпион открыто выбирает локацию по таймеру | `spy_guess_choosing_public` |
| Ва-банк шпиона | `spy_guess_choosing_public` | Остальные видят объявление ва-банка шпиона | `spy_guess_choosing_spy` |
| Уведомления | `notice_public_failed_guess` | Всем (без имени): «Была неудачная попытка угадать локацию» | `notice_spy_personal_failed` |
| Уведомления | `notice_spy_personal_failed` | Лично шпиону: «Ты ошибся. Следующая попытка — в раунде 4» | `notice_public_failed_guess` |
| Финал | `finished_locals_caught` | Победа жителей (`all_spies_out`) | — |
| Финал | `finished_spies_guessed` | Победа шпионов (`location_guessed`) | — |
| Финал | `finished_rounds_over` | Победа шпионов (`rounds_over`) | — |
| Финал | `finished_too_few_players` | Меньше трёх игроков (`too_few_players`) | — |
| Крайние случаи | `lobby_2_players`, `eliminated_spectator`, `edge_active_offline_last_seconds`, `edge_3_players_min`, `edge_15_long_names_deal`, `edge_15_long_names_turn` | 2/3/15 игроков, выбывший, оффлайн активного, длинные имена и локации на 320 px | — |

---

## 3. Дизайн-токены и 3 стилевых направления

Все токены сосредоточены в `src/theme/tokens.ts` и поддерживают `light` и `dark` режимы:

1. **`dossier` — «Досье "Отель Гранд"» (основной доведённый стиль):** тёплая архивная папка цвета слоновой кости (светлая тема) / благородный графитовый сланец (тёмная тема), латунно-янтарный акцент штампа.
2. **`casino` — «Полночь в Монте-Карло» (вариант 2):** клубное сукно и золотистый шампань, мягкие скругления `rounded-3xl`.
3. **`express` — «Дипломатический экспресс» (вариант 3):** строгая телеграфно-билетная типографика, кобальтовый индиго и чёткие углы.

Переключить и сравнить все три направления на экранах «Раздача», «Ход» и «Голосование» можно в `DevPanel` или в окне «Карта экранов».

---

## 4. Пиктограммы и места под иллюстрации локаций

В прототипе используется компонент-заглушка `src/components/LocationIcon.tsx`, сопоставляющий строковый ключ `location.icon` с векторными пиктограммами `lucide-react` (либо отображающий эмодзи/заглушку `MapPin`). Список ключей для последующей отрисовки фирменных мини-иллюстраций:

`ship` (Подводная лодка / База), `rocket` (Орбитальная станция), `hotel` (Гранд-отель), `wine` (Коктейльный бар / Афтепати), `drama` (Драматический театр / Маскарад), `dice` (Казино), `snowflake` (Полярная станция / Ледокол), `clapperboard` (Киностудия), `train` (Ночной экспресс), `landmark` (Центральный банк / Совет директоров), `anchor` (Круизный лайнер / Галеон), `palette` (Музей искусств / Архитектурное бюро), `globe` (Дипломатический приём / Павильон), `mountain` (Горный курорт), `briefcase` (Опенспейс), `laptop` (Коворкинг), `compass` (Тимбилдинг / Раскопки / Маяк), `radio` (Студия прямого эфира), `plane` (Бизнес-зал аэропорта), `dumbbell` (Фитнес-клуб), `car` (Автосалон), `utensils` (Ресторан на крыше), `key` (Квест-рум), `music` (Студия звукозаписи), `sun` (Сафари-лодж), `cloud` (Дирижабль / Воздушные шары), `sparkles` (Обсерватория), `trees` (Храм в джунглях), `shopping-bag` (Восточный базар), `flame` (Вулканологический пост), `shield` (Секретный архив).

---

## 5. Справочник `data-testid`

- Корень фазы: `spy-phase-lobby`, `spy-phase-deal`, `spy-phase-turn`, `spy-phase-spy_guess`, `spy-phase-finished`
- Карта роли и управление раздачей: `spy-card`, `spy-hide-card`, `spy-show-card-again`, `spy-ready`
- Табло и таймер: `spy-scoreboard`, `spy-timer`
- Нижние кнопки действий: `spy-action-name`, `spy-action-all-in`, `spy-action-hint`, `spy-eliminated-banner`
- Списки и элементы: `spy-open-locations`, `spy-locations`, `spy-location-<id>`, `spy-players`, `spy-player-<id>`
- Поддержка и голосование: `spy-overlay-support`, `spy-support-yes`, `spy-support-no`, `spy-overlay-vote`, `spy-vote-spy`, `spy-vote-not-spy`, `spy-overlay-vote-result`
- Лобби, финал и правила: `spy-start-game`, `spy-play-again`, `spy-leave-game`, `spy-rules-button`, `spy-rules-sheet`, `spy-notice`

---

## 6. Предложения сверх контракта (Раздел 9 ТЗ)

Все идеи вынесены отдельно на вкладку **«Предложения (п. 9)»** в `DevPanel` и не затрагивают основной контракт `src/types.ts`:

| Что предлагается | Зачем нужно в компании | Какие поля `SpyPlayerView` или команды `SpyCommand` нужны |
|---|---|---|
| **1. Вычёркивание локаций тапом (для обоих ролей)** | Помогает шпиону сужать круг мест, а жителям — отмечать прозвучавшие намёки, не выдавая роль по поведению в окне локаций | **Изменений не требуется** (локальное клиентское UI-состояние на время партии) |
| **2. Экстренная шторка «Прикрыть экран» жестом / переворотом** | Защищает от случайного взгляда соседа в тесном баре | **Новых полей не требуется**; на этапе `deal` отправляет уже существующую `{ type: 'HIDE_CARD' }` |
| **3. Хроника ходов и голосований для выбывших** | Занимает рано выбывшего игрока и помогает следить за дедукцией стола без раскрытия ролей | Опциональное поле в `SpyPlayerView`: `timeline?: Array<{ round: number; kind: 'turn' \| 'accuse' \| 'all_in'; actorId: string; targetId?: string; passed?: boolean }>` |
| **4. Пошаговая анимация «Рассекречивание досье» на финале** | Усиливает кульминацию при объявлении настоящей локации и списка шпионов | **Изменений не требуется** — строится на существующем `finishedSummary` |
| **5. Бытовая пауза ведущего («Принесли заказ»)** | Не даёт сгореть 60-секундному ходу, когда в баре приносят напитки или еду | Новая команда в `SpyCommand`: `{ type: 'TOGGLE_HOST_PAUSE' }` (использует существующий `timers.turnPaused`) |
