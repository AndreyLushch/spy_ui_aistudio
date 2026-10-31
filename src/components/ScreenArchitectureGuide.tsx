import React, { useState } from 'react';
import { Columns2, ExternalLink, LayoutGrid, Palette, X } from 'lucide-react';
import { FIXTURE_CATEGORIES, FIXTURES, FixtureCategory, SpyFixtureItem } from '../fixtures';
import { STYLE_VARIANTS_META, StyleVariant } from '../theme/tokens';

interface ScreenArchitectureGuideProps {
  open: boolean;
  activeFixtureId: string | null;
  activeStyle: StyleVariant;
  onSelectFixture: (fixture: SpyFixtureItem, openComparePair?: boolean) => void;
  onSelectStyleAndFixture: (style: StyleVariant, fixtureId: string) => void;
  onClose: () => void;
}

export const ScreenArchitectureGuide: React.FC<ScreenArchitectureGuideProps> = ({
  open,
  activeFixtureId,
  activeStyle,
  onSelectFixture,
  onSelectStyleAndFixture,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FixtureCategory | 'all'>('all');

  if (!open) return null;

  const visibleFixtures =
    selectedCategory === 'all'
      ? FIXTURES
      : FIXTURES.filter((f) => f.category === selectedCategory);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Карта экранов и состояний интерфейса"
      className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-6xl max-h-[92dvh] flex flex-col rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden text-stone-900 dark:text-stone-100">
        {/* Шапка карты экранов */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 bg-white dark:bg-stone-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <LayoutGrid className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold truncate">
                Карта архитектуры экранов ({FIXTURES.length} состояний)
              </h2>
              <p className="text-[13px] text-stone-600 dark:text-stone-400">
                Нажми на любую карточку, чтобы мгновенно открыть фазу или сравнить пару «житель / шпион»
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть карту экранов"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 inline-flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Блок сравнения 3 стилевых концепций на «раздаче», «ходе» и «голосовании» (Раздел 7 ТЗ) */}
          <section className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <h3 className="font-display text-base font-bold">
                3 стилевых варианта для «Раздачи», «Хода» и «Голосования» (Раздел 7)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {STYLE_VARIANTS_META.map((st) => {
                const isCurrent = activeStyle === st.id;
                return (
                  <div
                    key={st.id}
                    className={`p-3.5 rounded-xl border space-y-2.5 ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-500/5'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-bold">{st.name}</span>
                      <span className="text-[13px] font-semibold text-amber-700 dark:text-amber-400">
                        {st.badge}
                      </span>
                    </div>
                    <p className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed">
                      {st.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectStyleAndFixture(st.id, 'deal_open_local');
                          onClose();
                        }}
                        className="min-h-[36px] px-2.5 rounded-lg text-[13px] font-semibold bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700"
                      >
                        Раздача
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectStyleAndFixture(st.id, 'turn_questions_local');
                          onClose();
                        }}
                        className="min-h-[36px] px-2.5 rounded-lg text-[13px] font-semibold bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700"
                      >
                        Ход
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectStyleAndFixture(st.id, 'vote_voter_local');
                          onClose();
                        }}
                        className="min-h-[36px] px-2.5 rounded-lg text-[13px] font-semibold bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700"
                      >
                        Голосование
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Фильтр по разделам партийного цикла */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`min-h-[38px] px-3 rounded-lg text-[13px] font-semibold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              Все экраны ({FIXTURES.length})
            </button>
            {FIXTURE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[38px] px-3 rounded-lg text-[13px] font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950'
                    : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Сетка карточек экранов */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleFixtures.map((fixture) => {
              const isSelected = activeFixtureId === fixture.id;
              return (
                <div
                  key={fixture.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/5'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-[13px] text-stone-500 dark:text-stone-400">
                      <span className="font-mono">phase: {fixture.view.phase}</span>
                      <span>· {fixture.perspectiveLabel}</span>
                    </div>
                    <h4 className="font-display text-base font-bold leading-snug">
                      {fixture.title}
                    </h4>
                    <p className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed">
                      {fixture.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectFixture(fixture, false);
                        onClose();
                      }}
                      className="flex-1 min-h-[40px] px-3 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-[13px] font-bold inline-flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Открыть</span>
                    </button>

                    {fixture.pairedFixtureId && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectFixture(fixture, true);
                          onClose();
                        }}
                        title="Открыть два телефона рядом: житель и шпион"
                        className="min-h-[40px] px-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[13px] font-semibold inline-flex items-center gap-1 shrink-0"
                      >
                        <Columns2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Пара</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
