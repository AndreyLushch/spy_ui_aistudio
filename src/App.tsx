import React, { useEffect, useMemo, useState } from 'react';
import { MockAdapter } from './api/MockAdapter';
import { FIXTURES, SpyFixtureItem, getFixtureById } from './fixtures';
import { StyleVariant, ThemeMode } from './theme/tokens';
import { HapticEvent, subscribeHaptics } from './utils/haptic';
import { PhoneViewport } from './components/PhoneViewport';
import { DevPanel, FrameWidthOption } from './components/DevPanel';
import { ScreenArchitectureGuide } from './components/ScreenArchitectureGuide';
import { SimulatedNetworkState } from './components/SystemStates';
import { SpyCommand, SpyPlayerView } from './types';

function readInitialUrlParams() {
  if (typeof window === 'undefined') {
    return { fixtureId: null, compare: false, autostart: false };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    fixtureId: params.get('fixture'),
    compare: params.get('compare') === '1',
    autostart: params.get('autostart') === '1',
  };
}

export function App() {
  const initialParams = useMemo(() => readInitialUrlParams(), []);

  const adapter = useMemo(() => {
    const inst = new MockAdapter({
      playerCount: 8,
      autoTick: true,
      autoSimulateBots: true,
    });
    if (initialParams.fixtureId) {
      const found = getFixtureById(initialParams.fixtureId);
      if (found) {
        inst.setStaticFixture(found.view);
      }
    } else if (initialParams.autostart) {
      inst.send({ type: 'START_GAME' });
    }
    return inst;
  }, [initialParams]);

  const [, setRenderTick] = useState(0);
  const [activeFixtureId, setActiveFixtureId] = useState<string | null>(
    initialParams.fixtureId && getFixtureById(initialParams.fixtureId)
      ? initialParams.fixtureId
      : null
  );
  const [compareRoles, setCompareRoles] = useState<boolean>(initialParams.compare);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [styleVariant, setStyleVariant] = useState<StyleVariant>('dossier');
  const [frameWidth, setFrameWidth] = useState<FrameWidthOption>(390);
  const [showPlatformHeader, setShowPlatformHeader] = useState<boolean>(false);
  const [networkState, setNetworkState] = useState<SimulatedNetworkState>('normal');
  const [simulateServerDelay, setSimulateServerDelay] = useState<boolean>(false);
  const [guideOpen, setGuideOpen] = useState<boolean>(false);
  const [lastHaptic, setLastHaptic] = useState<HapticEvent | null>(null);
  const [isDesktopViewport, setIsDesktopViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  // Локальная копия парной фикстуры для второго телефона в режиме статического сравнения
  const [secondaryStaticView, setSecondaryStaticView] = useState<SpyPlayerView | null>(() => {
    if (initialParams.fixtureId) {
      const f = getFixtureById(initialParams.fixtureId);
      if (f?.pairedFixtureId) {
        return getFixtureById(f.pairedFixtureId)?.view ?? null;
      }
    }
    return null;
  });

  useEffect(() => {
    const unsubAdapter = adapter.subscribe(() => {
      setRenderTick((n) => n + 1);
    });
    const unsubHaptic = subscribeHaptics((ev) => {
      setLastHaptic(ev);
    });
    const handleResize = () => {
      setIsDesktopViewport(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      unsubAdapter();
      unsubHaptic();
      window.removeEventListener('resize', handleResize);
      adapter.stopAutoTick();
    };
  }, [adapter]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const isStatic = adapter.isStaticMode();
  const internalState = adapter.getInternalState();
  const primaryView = adapter.getView();

  // Синхронизируем атрибут фазы на body для удобной инспекции
  useEffect(() => {
    document.body.dataset.state = primaryView.phase;
  }, [primaryView.phase]);

  // Вычисляем два синхронных вида для режима «Сравнить житель / шпион»
  const { leftCompare, rightCompare } = useMemo(() => {
    if (!compareRoles) {
      return { leftCompare: null, rightCompare: null };
    }

    if (isStatic && activeFixtureId) {
      const currentFix = getFixtureById(activeFixtureId);
      const pairedFix = currentFix?.pairedFixtureId
        ? getFixtureById(currentFix.pairedFixtureId)
        : undefined;
      return {
        leftCompare: {
          label: `${currentFix?.perspectiveLabel ?? 'Экран 1'} (${currentFix?.title ?? ''})`,
          view: primaryView,
          onSend: (cmd: SpyCommand) => adapter.send(cmd),
        },
        rightCompare: {
          label: pairedFix
            ? `${pairedFix.perspectiveLabel} (${pairedFix.title})`
            : 'Второй участник (та же фаза)',
          view: secondaryStaticView ?? pairedFix?.view ?? primaryView,
          onSend: (cmd: SpyCommand) => {
            // Позволяем кликать и во втором телефоне на статической паре
            if (!pairedFix && !secondaryStaticView) {
              adapter.send(cmd);
              return;
            }
            const tempAdapter = new MockAdapter({ autoTick: false });
            tempAdapter.setStaticFixture(secondaryStaticView ?? pairedFix!.view);
            tempAdapter.send(cmd);
            setSecondaryStaticView(tempAdapter.getView());
          },
        },
      };
    }

    // Живая партия: если ещё в лобби — автоматически запускаем раздачу, чтобы сравнить жителя и шпиона!
    const { localId, spyId } = adapter.findFirstLocalAndSpyIds();
    const localAdapter = adapter.createPerspectiveAdapter(localId);
    const spyAdapter = adapter.createPerspectiveAdapter(spyId);
    const localName =
      internalState.players.find((p) => p.id === localId)?.nickname ?? 'Житель';
    const spyName =
      internalState.players.find((p) => p.id === spyId)?.nickname ?? 'Шпион';

    return {
      leftCompare: {
        label: `Житель · ${localName}`,
        view: localAdapter.getView(),
        onSend: (cmd: SpyCommand) => localAdapter.send(cmd),
      },
      rightCompare: {
        label: `Шпион · ${spyName}`,
        view: spyAdapter.getView(),
        onSend: (cmd: SpyCommand) => spyAdapter.send(cmd),
      },
    };
  }, [
    compareRoles,
    isStatic,
    activeFixtureId,
    primaryView,
    secondaryStaticView,
    adapter,
    internalState,
  ]);

  const handleSelectFixture = (fixture: SpyFixtureItem, openComparePair = false) => {
    setActiveFixtureId(fixture.id);
    adapter.setStaticFixture(fixture.view);
    const paired = fixture.pairedFixtureId ? getFixtureById(fixture.pairedFixtureId) : undefined;
    setSecondaryStaticView(paired?.view ?? null);
    if (openComparePair) {
      setCompareRoles(true);
    }
  };

  const handleStartLiveParty = (playerCount?: number) => {
    setActiveFixtureId(null);
    setSecondaryStaticView(null);
    if (playerCount !== undefined) {
      adapter.setPlayerCount(playerCount);
    } else {
      adapter.setStaticFixture(null);
    }
    adapter.startAutoTick();
  };

  const handleToggleCompare = () => {
    if (!compareRoles && !isStatic && internalState.phase === 'lobby') {
      // Чтобы сразу увидеть реальное сравнение карт жителя и шпиона, переводим лобби к раздаче
      adapter.sendForPlayer(internalState.players[0].id, { type: 'START_GAME' });
    }
    setCompareRoles((prev) => !prev);
  };

  const handleQuickPerspective = (role: 'local' | 'spy' | 'host' | 'accused' | 'out') => {
    if (!isStatic && internalState.phase !== 'lobby') {
      const { localId, spyId } = adapter.findFirstLocalAndSpyIds();
      if (role === 'local') {
        adapter.setViewerId(localId);
        return;
      }
      if (role === 'spy') {
        adapter.setViewerId(spyId);
        return;
      }
      if (role === 'host') {
        const host = internalState.players.find((p) => p.isHost);
        if (host) adapter.setViewerId(host.id);
        return;
      }
      if (role === 'accused' && internalState.accusation) {
        adapter.setViewerId(internalState.accusation.targetId);
        return;
      }
      if (role === 'out') {
        const outPlayer = internalState.players.find((p) => p.status === 'out');
        if (outPlayer) {
          adapter.setViewerId(outPlayer.id);
          return;
        }
      }
    }

    // Иначе подбираем показательную фикстуру для выбранной точки зрения
    const targetFixtureId =
      role === 'local'
        ? 'turn_questions_local'
        : role === 'spy'
          ? 'turn_questions_spy'
          : role === 'host'
            ? 'lobby_host'
            : role === 'accused'
              ? 'vote_target_spy'
              : 'eliminated_spectator';

    const fix = getFixtureById(targetFixtureId) ?? FIXTURES[0];
    handleSelectFixture(fix);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-stone-200/80 dark:bg-[#090A0D] text-stone-900 dark:text-stone-100 flex items-center justify-center lg:p-4 overflow-x-hidden">
      <div className="w-full max-w-[1400px] flex flex-col lg:flex-row items-center lg:items-center justify-center gap-5">
        {/* Основная сцена телефонов */}
        <main className="w-full lg:flex-1 flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-6 min-w-0">
          {compareRoles && leftCompare && rightCompare ? (
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 overflow-x-auto py-1">
              <PhoneViewport
                view={leftCompare.view}
                onSend={leftCompare.onSend}
                theme={theme}
                styleVariant={styleVariant}
                showPlatformHeader={showPlatformHeader}
                networkState={networkState}
                simulateServerDelayMs={simulateServerDelay ? 450 : 0}
                labelBadge={leftCompare.label}
                frameWidthPx={isDesktopViewport ? 360 : 'fluid'}
              />
              <PhoneViewport
                view={rightCompare.view}
                onSend={rightCompare.onSend}
                theme={theme}
                styleVariant={styleVariant}
                showPlatformHeader={showPlatformHeader}
                networkState={networkState}
                simulateServerDelayMs={simulateServerDelay ? 450 : 0}
                labelBadge={rightCompare.label}
                frameWidthPx={isDesktopViewport ? 360 : 'fluid'}
              />
            </div>
          ) : (
            <PhoneViewport
              view={primaryView}
              onSend={(cmd) => adapter.send(cmd)}
              theme={theme}
              styleVariant={styleVariant}
              showPlatformHeader={showPlatformHeader}
              networkState={networkState}
              simulateServerDelayMs={simulateServerDelay ? 450 : 0}
              frameWidthPx={isDesktopViewport ? frameWidth : 'fluid'}
            />
          )}
        </main>

        {/* Сворачиваемая панель разработчика */}
        <DevPanel
          mode={isStatic ? 'fixture' : 'live'}
          activeFixtureId={activeFixtureId}
          compareRoles={compareRoles}
          theme={theme}
          styleVariant={styleVariant}
          frameWidth={frameWidth}
          showPlatformHeader={showPlatformHeader}
          networkState={networkState}
          simulateServerDelay={simulateServerDelay}
          liveAutoTick={adapter.isAutoTickRunning()}
          livePlayers={internalState.players}
          liveViewerId={adapter.getViewerId()}
          liveSpyIds={internalState.spyIds}
          lastHaptic={lastHaptic}
          onStartLiveParty={handleStartLiveParty}
          onSelectFixture={(f) => handleSelectFixture(f, false)}
          onToggleCompareRoles={handleToggleCompare}
          onSelectLiveViewer={(pid) => adapter.setViewerId(pid)}
          onQuickPerspective={handleQuickPerspective}
          onToggleAutoTick={() => {
            if (adapter.isAutoTickRunning()) {
              adapter.stopAutoTick();
            } else {
              adapter.startAutoTick();
            }
            setRenderTick((n) => n + 1);
          }}
          onStepTick={(sec) => adapter.tick(sec)}
          onChangeTheme={setTheme}
          onChangeStyleVariant={setStyleVariant}
          onChangeFrameWidth={setFrameWidth}
          onTogglePlatformHeader={() => setShowPlatformHeader((v) => !v)}
          onChangeNetworkState={setNetworkState}
          onToggleServerDelay={() => setSimulateServerDelay((v) => !v)}
          onOpenArchitectureGuide={() => setGuideOpen(true)}
        />
      </div>

      {/* Интерактивная карта архитектуры экранов */}
      <ScreenArchitectureGuide
        open={guideOpen}
        activeFixtureId={activeFixtureId}
        activeStyle={styleVariant}
        onSelectFixture={handleSelectFixture}
        onSelectStyleAndFixture={(st, fixId) => {
          setStyleVariant(st);
          const f = getFixtureById(fixId);
          if (f) handleSelectFixture(f, true);
        }}
        onClose={() => setGuideOpen(false)}
      />
    </div>
  );
}

export default App;
