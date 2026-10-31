import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Columns2,
  FastForward,
  LayoutGrid,
  Moon,
  Pause,
  Play,
  SlidersHorizontal,
  Smartphone,
  Sun,
  Vibrate,
  X,
} from 'lucide-react';
import { FIXTURE_CATEGORIES, FIXTURES, SpyFixtureItem } from '../fixtures';
import { STYLE_VARIANTS_META, StyleVariant, ThemeMode } from '../theme/tokens';
import { HapticEvent } from '../utils/haptic';
import { SimulatedNetworkState } from './SystemStates';
import { ProposalsShowcase } from './ProposalsShowcase';
import { SpyPlayer } from '../types';

export type FrameWidthOption = 320 | 360 | 390 | 430;

interface DevPanelProps {
  mode: 'live' | 'fixture';
  activeFixtureId: string | null;
  compareRoles: boolean;
  theme: ThemeMode;
  styleVariant: StyleVariant;
  frameWidth: FrameWidthOption;
  showPlatformHeader: boolean;
  networkState: SimulatedNetworkState;
  simulateServerDelay: boolean;
  liveAutoTick: boolean;
  livePlayers: SpyPlayer[];
  liveViewerId: string;
  liveSpyIds: string[];
  lastHaptic: HapticEvent | null;
  onStartLiveParty: (playerCount?: number) => void;
  onSelectFixture: (fixture: SpyFixtureItem) => void;
  onToggleCompareRoles: () => void;
  onSelectLiveViewer: (playerId: string) => void;
  onQuickPerspective: (role: 'local' | 'spy' | 'host' | 'accused' | 'out') => void;
  onToggleAutoTick: () => void;
  onStepTick: (seconds: number) => void;
  onChangeTheme: (theme: ThemeMode) => void;
  onChangeStyleVariant: (style: StyleVariant) => void;
  onChangeFrameWidth: (w: FrameWidthOption) => void;
  onTogglePlatformHeader: () => void;
  onChangeNetworkState: (s: SimulatedNetworkState) => void;
  onToggleServerDelay: () => void;
  onOpenArchitectureGuide: () => void;
}

export const DevPanel: React.FC<DevPanelProps> = ({
  mode,
  activeFixtureId,
  compareRoles,
  theme,
  styleVariant,
  frameWidth,
  showPlatformHeader,
  networkState,
  simulateServerDelay,
  liveAutoTick,
  livePlayers,
  liveViewerId,
  liveSpyIds,
  lastHaptic,
  onStartLiveParty,
  onSelectFixture,
  onToggleCompareRoles,
  onSelectLiveViewer,
  onQuickPerspective,
  onToggleAutoTick,
  onStepTick,
  onChangeTheme,
  onChangeStyleVariant,
  onChangeFrameWidth,
  onTogglePlatformHeader,
  onChangeNetworkState,
  onToggleServerDelay,
  onOpenArchitectureGuide,
}) => {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'proposals'>('controls');

  const panelBody = (
    <div className="flex flex-col h-full text-stone-900 dark:text-stone-100">
      {/* Вкладки панели разработчика */}
      <div className="px-4 pt-3 pb-2.5 border-b border-stone-200 dark:border-stone-800 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-base font-bold">DevPanel · Шпион</span>
          <button
            type="button"
            onClick={onOpenArchitectureGuide}
            className="min-h-[36px] px-2.5 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 text-[13px] font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Карта экранов</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-stone-100 dark:bg-stone-800">
          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`min-h-[36px] px-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
              activeTab === 'controls'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            Управление
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('proposals')}
            className={`min-h-[36px] px-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
              activeTab === 'proposals'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            Предложения (п. 9)
          </button>
        </div>
      </div>

      {/* Содержимое активной вкладки */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'proposals' ? (
          <ProposalsShowcase />
        ) : (
          <>
            {/* 1. Главный переключатель: Сравнить житель / шпион */}
            <section className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-2.5">
              <button
                type="button"
                data-testid="dev-compare-toggle"
                onClick={onToggleCompareRoles}
                className={`min-h-[44px] w-full px-3 rounded-xl text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-colors ${
                  compareRoles
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                }`}
              >
                <Columns2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  {compareRoles
                    ? 'Режим сравнения: 2 телефона рядом (Вкл)'
                    : 'Сравнить житель / шпион (2 телефона)'}
                </span>
              </button>

              {/* Быстрая смена точки зрения */}
              <div className="space-y-1">
                <span className="text-[13px] font-semibold text-stone-600 dark:text-stone-400">
                  Точка зрения:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'local', label: 'Житель' },
                      { id: 'spy', label: 'Шпион' },
                      { id: 'host', label: 'Ведущий' },
                      { id: 'accused', label: 'Обвиняемый' },
                      { id: 'out', label: 'Выбывший' },
                    ] as const
                  ).map((pov) => (
                    <button
                      key={pov.id}
                      type="button"
                      onClick={() => onQuickPerspective(pov.id)}
                      className="min-h-[34px] px-2.5 rounded-lg text-[13px] font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-500"
                    >
                      {pov.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Живая партия на моке */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold">Живая партия на мок-адаптере</span>
                <span className="text-[13px] text-stone-500 dark:text-stone-400">
                  {mode === 'live' ? 'Активна' : 'Выбрана фикстура'}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[3, 6, 8, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => onStartLiveParty(cnt)}
                    className={`min-h-[38px] rounded-lg text-[13px] font-bold tabular-nums border ${
                      mode === 'live' && livePlayers.length === cnt
                        ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 border-transparent'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    {cnt} игр.
                  </button>
                ))}
              </div>

              {mode === 'live' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={onToggleAutoTick}
                      className="flex-1 min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[13px] font-semibold inline-flex items-center justify-center gap-1.5"
                    >
                      {liveAutoTick ? (
                        <>
                          <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Пауза таймера</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Пуск таймера</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onStepTick(1)}
                      className="min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[13px] font-mono font-semibold"
                    >
                      +1с
                    </button>
                    <button
                      type="button"
                      onClick={() => onStepTick(15)}
                      title="Перемотать 15 секунд"
                      className="min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[13px] font-mono font-semibold inline-flex items-center gap-1"
                    >
                      <FastForward className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>+15с</span>
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor="dev-live-player-select"
                      className="block text-[13px] text-stone-600 dark:text-stone-400 mb-1"
                    >
                      Чьими глазами смотрим живую партию:
                    </label>
                    <select
                      id="dev-live-player-select"
                      value={liveViewerId}
                      onChange={(e) => onSelectLiveViewer(e.target.value)}
                      className="w-full min-h-[40px] px-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[13px] font-semibold"
                    >
                      {livePlayers.map((p) => {
                        const roleHint =
                          liveSpyIds.length === 0
                            ? 'в лобби'
                            : liveSpyIds.includes(p.id)
                              ? 'шпион (скрыто в UI)'
                              : 'житель';
                        return (
                          <option key={p.id} value={p.id}>
                            {p.nickname} ({roleHint}
                            {p.isHost ? ', ведущий' : ''}
                            {p.status === 'out' ? ', выбыл' : ''})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}
            </section>

            {/* 3. Готовые фикстуры по фазам */}
            <section className="space-y-1.5">
              <label
                htmlFor="dev-fixture-select"
                className="block text-[13px] font-bold"
              >
                Фикстуры всех экранов и крайних случаев ({FIXTURES.length}):
              </label>
              <select
                id="dev-fixture-select"
                value={activeFixtureId ?? ''}
                onChange={(e) => {
                  const found = FIXTURES.find((f) => f.id === e.target.value);
                  if (found) onSelectFixture(found);
                }}
                className="w-full min-h-[42px] px-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[13px] font-semibold"
              >
                <option value="" disabled>
                  — Выбрать готовую фикстуру —
                </option>
                {FIXTURE_CATEGORIES.map((cat) => (
                  <optgroup key={cat.id} label={cat.label}>
                    {FIXTURES.filter((f) => f.category === cat.id).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </section>

            {/* 4. Тема, 3 варианта стиля и ширина экрана */}
            <section className="space-y-2.5 pt-1 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-bold">Тема оформления</span>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <button
                    type="button"
                    onClick={() => onChangeTheme('light')}
                    className={`min-h-[34px] px-2.5 rounded-md text-[13px] font-semibold inline-flex items-center gap-1 ${
                      theme === 'light'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Светлая</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeTheme('dark')}
                    className={`min-h-[34px] px-2.5 rounded-md text-[13px] font-semibold inline-flex items-center gap-1 ${
                      theme === 'dark'
                        ? 'bg-stone-900 text-stone-100 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Тёмная</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[13px] font-bold">
                  Стилевое направление (3 варианта, п. 7):
                </span>
                <div className="space-y-1.5">
                  {STYLE_VARIANTS_META.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => onChangeStyleVariant(st.id)}
                      className={`w-full min-h-[40px] px-3 py-1.5 rounded-lg border text-left flex items-center justify-between gap-2 text-[13px] ${
                        styleVariant === st.id
                          ? 'border-amber-500 bg-amber-500/10 font-bold'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 font-medium'
                      }`}
                    >
                      <span className="truncate">{st.name}</span>
                      <span className="text-[13px] text-amber-700 dark:text-amber-400 shrink-0">
                        {st.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 hidden lg:block">
                <span className="block text-[13px] font-bold inline-flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ширина экрана телефона:</span>
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {([320, 360, 390, 430] as FrameWidthOption[]).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => onChangeFrameWidth(w)}
                      className={`min-h-[36px] rounded-lg text-[13px] font-mono font-semibold border ${
                        frameWidth === w
                          ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 border-transparent'
                          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      {w}px
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Системные состояния и шапка платформы */}
            <section className="space-y-2 pt-1 border-t border-stone-200 dark:border-stone-800">
              <span className="block text-[13px] font-bold">Платформа и сеть</span>

              <label className="flex items-center justify-between gap-2 text-[13px] py-1 cursor-pointer">
                <span>Показать разметку шапки (56 px)</span>
                <input
                  type="checkbox"
                  checked={showPlatformHeader}
                  onChange={onTogglePlatformHeader}
                  className="w-4 h-4 accent-amber-600"
                />
              </label>

              <label className="flex items-center justify-between gap-2 text-[13px] py-1 cursor-pointer">
                <span>Задержка ответа «Ждём сервер» (450 мс)</span>
                <input
                  type="checkbox"
                  checked={simulateServerDelay}
                  onChange={onToggleServerDelay}
                  className="w-4 h-4 accent-amber-600"
                />
              </label>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(
                  [
                    { id: 'normal', label: 'В сети' },
                    { id: 'reconnecting', label: 'Обрыв' },
                    { id: 'loading', label: 'Загрузка' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => onChangeNetworkState(st.id)}
                    className={`min-h-[36px] rounded-lg text-[13px] font-semibold border ${
                      networkState === st.id
                        ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 border-transparent'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </section>

            {/* 6. Индикатор единой вибрации */}
            <section className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 text-[13px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-stone-600 dark:text-stone-400">
                <Vibrate className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Haptic:</span>
              </span>
              <span className="font-mono truncate text-stone-800 dark:text-stone-200">
                {lastHaptic ? `${lastHaptic.kind} (${lastHaptic.reason})` : 'ожидание события'}
              </span>
            </section>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Мобильная кнопка открытия DevPanel (в пределах верхнего поля 56 px, без горизонтального скролла на 320 px) */}
      <div className="lg:hidden fixed top-2 left-2.5 z-40">
        <button
          type="button"
          aria-label="Открыть панель разработчика"
          onClick={() => setMobileDrawerOpen(true)}
          className="min-h-[40px] px-2.5 rounded-xl bg-stone-900/85 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-md"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Dev</span>
        </button>
      </div>

      {/* Мобильный выезжающий лист DevPanel */}
      {mobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Панель разработчика"
          className="lg:hidden fixed inset-0 z-50 bg-black/60 flex justify-end"
        >
          <div className="w-full max-w-[360px] h-full bg-white dark:bg-stone-950 flex flex-col shadow-2xl">
            <div className="px-4 py-2.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="text-[13px] font-bold text-stone-500">Инструменты прототипа</span>
              <button
                type="button"
                aria-label="Закрыть панель разработчика"
                onClick={() => setMobileDrawerOpen(false)}
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 min-h-0">{panelBody}</div>
          </div>
        </div>
      )}

      {/* Десктопная боковая панель со сворачиванием */}
      <aside
        aria-label="Панель разработчика"
        className={`hidden lg:flex flex-col shrink-0 h-[calc(100dvh-2rem)] rounded-2xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden transition-all ${
          desktopCollapsed ? 'w-[52px]' : 'w-[370px]'
        }`}
      >
        {desktopCollapsed ? (
          <div className="flex flex-col items-center py-3 gap-3">
            <button
              type="button"
              aria-label="Развернуть DevPanel"
              onClick={() => setDesktopCollapsed(false)}
              className="min-h-[40px] min-w-[40px] rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Открыть карту экранов"
              onClick={onOpenArchitectureGuide}
              className="min-h-[40px] min-w-[40px] rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center"
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-0">
            <div className="px-4 py-2 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-stone-500 dark:text-stone-400">
                Стенд проверки UI
              </span>
              <button
                type="button"
                aria-label="Свернуть DevPanel"
                onClick={() => setDesktopCollapsed(true)}
                className="min-h-[34px] px-2 rounded-lg hover:bg-stone-200/70 dark:hover:bg-stone-800 text-[13px] inline-flex items-center gap-1 text-stone-600 dark:text-stone-400"
              >
                <span>Свернуть</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 min-h-0">{panelBody}</div>
          </div>
        )}
      </aside>
    </>
  );
};
