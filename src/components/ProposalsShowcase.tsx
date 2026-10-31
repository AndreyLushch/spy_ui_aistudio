import React, { useState } from 'react';
import { CheckSquare, EyeOff, FileText, History, Sparkles } from 'lucide-react';

export interface OutOfContractProposal {
  id: string;
  title: string;
  problem: string;
  solution: string;
  contractImpact: string;
}

export const PROPOSALS_LIST: OutOfContractProposal[] = [
  {
    id: 'scratchpad_both_roles',
    title: '1. Вычёркивание локаций пальцем (одинаково для всех)',
    problem:
      'Шпиону трудно держать в голове 14 локаций и отсеивать неподходящие по ответам стола, но отдельный блокнот только у шпиона сразу выдаст его роль соседям.',
    solution:
      'Разрешить тапом зачёркивать карточки в окне «Возможные локации» ВСЕМ игрокам (жителям удобно отмечать места, на которые намекали, шпионам — отсекать лишние). Хранится только в локальном UI-состоянии клиента.',
    contractImpact: 'Изменений контракта не требуется (чистый клиентский UI-стейт на время партии).',
  },
  {
    id: 'panic_shield',
    title: '2. Мгновенная шторка «Прикрыть экран» удержанием или переворотом',
    problem:
      'За тесным столом в баре сосед может случайно заглянуть в телефон в момент раздачи или выбора подозреваемого.',
    solution:
      'Жест удержания двумя пальцами (или событие DeviceOrientation при перевороте экрана вниз) мгновенно закрывает активное окно и скрывает карту роли (`HIDE_CARD`).',
    contractImpact: 'Новых полей не нужно; на раздаче использует существующую команду `{ type: "HIDE_CARD" }`.',
  },
  {
    id: 'spectator_timeline',
    title: '3. Тихая хроника партии для выбывших игроков',
    problem:
      'Рано выбывший участник (например, после неудачного ва-банка в 1 раунде) 10–15 минут просто смотрит на табло.',
    solution:
      'Добавить выбывшим (`me.status === "out"`) компактную ленту событий: кто кого спрашивал, какие обвинения выдвигались и сколько голосов «за» они собрали (без раскрытия ролей до финала).',
    contractImpact:
      'Новое опциональное поле в `SpyPlayerView`: `timeline?: Array<{ round: number; kind: "turn" | "accuse" | "all_in"; actorId: string; targetId?: string; passed?: boolean }>`.',
  },
  {
    id: 'dossier_declassify_finale',
    title: '4. Пошаговое «рассекречивание досье» на финале',
    problem:
      'Мгновенное появление сухой таблицы итогов снижает драматизм кульминации, когда вся компания ждёт ответа, кто же был шпионом.',
    solution:
      'На экране `finished` показывать 2-секундную театральную паузу со штампом «РАССЕКРЕЧЕНО»: сначала открывается настоящая локация, через полсекунды — карточки шпионов, затем таблица очков (с кнопкой пропуска анимации).',
    contractImpact: 'Изменений контракта не требуется — работает целиком на данных `finishedSummary`.',
  },
  {
    id: 'pause_by_host',
    title: '5. Короткая бытовая пауза ведущего («Принесли заказ»)',
    problem:
      'Компании часто играют в баре или кафе: когда официант приносит блюда, таймер 60-секундного хода сгорает впустую.',
    solution:
      'Дать ведущему (`me.isHost`) одну кнопку паузы раунда в меню правил, замораживающую `timers.turnPaused = true` до нажатия «Продолжить».',
    contractImpact:
      'Новая команда в `SpyCommand`: `{ type: "TOGGLE_HOST_PAUSE" }` (использует уже существующий флаг `timers.turnPaused`).',
  },
];

export const ProposalsShowcase: React.FC = () => {
  const [crossedDemo, setCrossedDemo] = useState<string[]>(['Полярная станция', 'Подводная лодка']);
  const [shieldDemo, setShieldDemo] = useState(false);

  const demoLocs = ['Гранд-отель', 'Подводная лодка', 'Коктейльный бар', 'Полярная станция'];

  const toggleCross = (name: string) => {
    setCrossedDemo((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[13px] leading-relaxed text-stone-700 dark:text-stone-200">
        <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
          <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Раздел 9 ТЗ — строго отдельно от основного контракта</span>
        </p>
        <p className="mt-1">
          Основной прототип не использует ни одного лишнего поля сверх раздела 6. Ниже собраны UX-идеи
          для развития продукта и их влияние на протокол.
        </p>
      </div>

      {/* Интерактивное мини-превью идеи №1 и №2 */}
      <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-bold text-stone-900 dark:text-stone-100 inline-flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>Мини-демо: вычёркивание локаций + шторка</span>
          </span>
          <button
            type="button"
            onClick={() => setShieldDemo((v) => !v)}
            className="min-h-[34px] px-2.5 rounded-lg text-[13px] font-semibold bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 inline-flex items-center gap-1"
          >
            <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{shieldDemo ? 'Убрать шторку' : 'Прикрыть'}</span>
          </button>
        </div>

        {shieldDemo ? (
          <div className="h-24 rounded-lg bg-stone-900 text-stone-200 flex items-center justify-center text-[13px] font-semibold">
            Экран скрыт от соседей · нажми, чтобы вернуться
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {demoLocs.map((name) => {
              const crossed = crossedDemo.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleCross(name)}
                  className={`min-h-[42px] px-2.5 py-1.5 rounded-lg text-left text-[13px] font-semibold transition-opacity border ${
                    crossed
                      ? 'line-through opacity-45 bg-stone-200/60 dark:bg-stone-900/50 border-transparent text-stone-500'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Список предложений с влиянием на контракт */}
      <div className="space-y-2.5">
        {PROPOSALS_LIST.map((item) => (
          <article
            key={item.id}
            className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5"
          >
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              {item.id === 'spectator_timeline' ? (
                <History className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              ) : (
                <FileText className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              )}
              <span>{item.title}</span>
            </h3>
            <p className="text-[13px] text-stone-600 dark:text-stone-300 leading-relaxed">
              {item.solution}
            </p>
            <p className="text-[13px] font-mono text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1.5 rounded-lg leading-snug">
              Контракт: {item.contractImpact}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
};
