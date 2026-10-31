import React, { useEffect, useRef, useState } from 'react';
import { SpyCommand, SpyPlayerView } from '../types';
import { StyleVariant, ThemeMode, getTokens } from '../theme/tokens';
import { haptic } from '../utils/haptic';
import { ActiveActionModal, ActionModals } from './ActionModals';
import { LocationsModal } from './LocationsGrid';
import { RulesSheet } from './RulesSheet';
import {
  LoadingScreen,
  PendingServerBanner,
  PlatformSafeSpace,
  ReconnectingBanner,
  SimulatedNetworkState,
} from './SystemStates';
import { LobbyScreen } from '../screens/LobbyScreen';
import { DealScreen } from '../screens/DealScreen';
import { TurnScreen } from '../screens/TurnScreen';
import { SpyGuessScreen } from '../screens/SpyGuessScreen';
import { FinishedScreen } from '../screens/FinishedScreen';

interface PhoneViewportProps {
  view: SpyPlayerView;
  onSend: (cmd: SpyCommand) => void;
  theme: ThemeMode;
  styleVariant: StyleVariant;
  showPlatformHeader?: boolean;
  networkState?: SimulatedNetworkState;
  simulateServerDelayMs?: number;
  labelBadge?: string;
  frameWidthPx?: number | 'fluid';
}

export const PhoneViewport: React.FC<PhoneViewportProps> = ({
  view,
  onSend,
  theme,
  styleVariant,
  showPlatformHeader = false,
  networkState = 'normal',
  simulateServerDelayMs = 0,
  labelBadge,
  frameWidthPx = 'fluid',
}) => {
  const tokens = getTokens(styleVariant, theme);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [actionModal, setActionModal] = useState<ActiveActionModal>('none');
  const [pendingCommand, setPendingCommand] = useState(false);

  // Отслеживание переходов для строго одинакового `haptic()` у жителя и шпиона
  const prevTurnOwnerRef = useRef<string | undefined>(view.activePlayerId);
  const prevAccKeyRef = useRef<string | undefined>(
    view.accusation ? `${view.accusation.accuserId}:${view.accusation.targetId}` : undefined
  );
  const prevVoteResultRef = useRef<string | undefined>(view.voteResult?.text);
  const prevHintKeyRef = useRef<string>(view.me.hint ? view.me.hint.join('|') : '');

  useEffect(() => {
    // 1. Начало своего хода
    if (
      view.phase === 'turn' &&
      view.activePlayerId === view.me.playerId &&
      prevTurnOwnerRef.current !== view.me.playerId
    ) {
      haptic('light', 'Начало своего хода');
    }
    prevTurnOwnerRef.current = view.activePlayerId;

    // 2. Новое обвинение за столом
    const accKey = view.accusation
      ? `${view.accusation.accuserId}:${view.accusation.targetId}`
      : undefined;
    if (accKey && accKey !== prevAccKeyRef.current) {
      haptic('warning', 'Новое обвинение');
    }
    prevAccKeyRef.current = accKey;

    // 3. Итог голосования
    if (view.voteResult?.text && view.voteResult.text !== prevVoteResultRef.current) {
      haptic(
        view.voteResult.text === 'spy_caught' ? 'success' : 'warning',
        'Итог голосования'
      );
    }
    prevVoteResultRef.current = view.voteResult?.text;

    // 4. Автооткрытие окна подсказки при получении новых вопросов с сервера
    const hintKey = view.me.hint ? view.me.hint.join('|') : '';
    if (hintKey && hintKey !== prevHintKeyRef.current) {
      setActionModal('hint');
    }
    prevHintKeyRef.current = hintKey;
  }, [view]);

  // При смене фазы закрываем локальные модалки
  useEffect(() => {
    setActionModal('none');
    setLocationsOpen(false);
  }, [view.phase]);

  const dispatchCommand = (cmd: SpyCommand) => {
    if (pendingCommand || networkState !== 'normal') return;
    if (simulateServerDelayMs > 0) {
      setPendingCommand(true);
      setTimeout(() => {
        setPendingCommand(false);
        onSend(cmd);
      }, simulateServerDelayMs);
    } else {
      onSend(cmd);
    }
  };

  const widthClass =
    frameWidthPx === 'fluid'
      ? 'w-full'
      : frameWidthPx === 320
        ? 'w-[320px]'
        : frameWidthPx === 360
          ? 'w-[360px]'
          : frameWidthPx === 430
            ? 'w-[430px]'
            : 'w-[390px]';

  return (
    <div className="flex flex-col items-center shrink-0 max-w-full">
      {labelBadge && (
        <div className="mb-2 text-[13px] font-semibold text-stone-600 dark:text-stone-300">
          {labelBadge}
        </div>
      )}

      <div
        className={`${widthClass} max-w-full h-[100dvh] lg:h-[780px] lg:max-h-[calc(100dvh-2rem)] relative overflow-hidden flex flex-col ${
          tokens.canvasBg
        } lg:rounded-[34px] lg:border-[6px] lg:border-stone-800 dark:lg:border-stone-700 lg:shadow-2xl ${
          theme === 'dark' ? 'dark' : ''
        }`}
      >
        {/* Безопасное место 56 px под нативную шапку Telegram Mini App */}
        <PlatformSafeSpace showPlaceholderGuide={showPlatformHeader} tokens={tokens} />

        {networkState === 'reconnecting' && <ReconnectingBanner tokens={tokens} />}
        {pendingCommand && <PendingServerBanner tokens={tokens} />}

        {networkState === 'loading' ? (
          <LoadingScreen tokens={tokens} />
        ) : (
          <>
            {view.phase === 'lobby' && (
              <LobbyScreen
                view={view}
                tokens={tokens}
                pendingCommand={pendingCommand}
                onSend={dispatchCommand}
                onOpenLocations={() => setLocationsOpen(true)}
                onOpenRules={() => setRulesOpen(true)}
              />
            )}

            {view.phase === 'deal' && (
              <DealScreen
                view={view}
                tokens={tokens}
                pendingCommand={pendingCommand}
                onSend={dispatchCommand}
                onOpenLocations={() => setLocationsOpen(true)}
                onOpenRules={() => setRulesOpen(true)}
              />
            )}

            {view.phase === 'turn' && (
              <TurnScreen
                view={view}
                tokens={tokens}
                pendingCommand={pendingCommand}
                onSend={dispatchCommand}
                onOpenLocations={() => setLocationsOpen(true)}
                onOpenRules={() => setRulesOpen(true)}
                onPressName={() => setActionModal('name')}
                onPressAllIn={() => setActionModal('all_in_warn')}
                onPressHint={() => {
                  dispatchCommand({ type: 'HINT' });
                  if (view.me.hint && view.me.hint.length > 0) {
                    setActionModal('hint');
                  }
                }}
              />
            )}

            {view.phase === 'spy_guess' && (
              <SpyGuessScreen
                view={view}
                tokens={tokens}
                pendingCommand={pendingCommand}
                onSend={dispatchCommand}
                onOpenRules={() => setRulesOpen(true)}
              />
            )}

            {view.phase === 'finished' && (
              <FinishedScreen
                view={view}
                tokens={tokens}
                pendingCommand={pendingCommand}
                onSend={dispatchCommand}
                onOpenRules={() => setRulesOpen(true)}
              />
            )}

            {/* Модальное окно просмотра всех возможных локаций партии */}
            <LocationsModal
              open={locationsOpen}
              locations={view.locations}
              tokens={tokens}
              onClose={() => setLocationsOpen(false)}
            />

            {/* Модальные окна действий («Назвать», «Ва-банк», «Подсказка») */}
            <ActionModals
              modal={actionModal}
              view={view}
              tokens={tokens}
              onClose={() => setActionModal('none')}
              onProceedAllIn={() => setActionModal('all_in_pick')}
              onSendCommand={dispatchCommand}
            />

            {/* Лист правил «?» */}
            <RulesSheet
              open={rulesOpen}
              tokens={tokens}
              onClose={() => setRulesOpen(false)}
            />
          </>
        )}
      </div>
    </div>
  );
};
