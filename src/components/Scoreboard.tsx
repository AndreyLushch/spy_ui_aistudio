import React from 'react';
import { HelpCircle, Map, WifiOff } from 'lucide-react';
import { SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { getPlayerNickname } from '../utils/viewHelpers';
import { TimerBadge } from './TimerBadge';

interface ScoreboardProps {
  view: SpyPlayerView;
  tokens: StyleTokens;
  onOpenLocations: () => void;
  onOpenRules: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  view,
  tokens,
  onOpenLocations,
  onOpenRules,
}) => {
  const activePlayer = view.players.find((p) => p.id === view.activePlayerId);
  const activeName = getPlayerNickname(view.players, view.activePlayerId);
  const isMyTurn = view.activePlayerId === view.me.playerId;

  return (
    <section
      data-testid="spy-scoreboard"
      aria-label="Табло раунда и текущего хода"
      className={`${tokens.surfaceBg} ${tokens.cardRadius} p-3 space-y-2.5`}
    >
      {/* Верхняя строка: метаданные раунда и шпионов (чистый текст с разделителем) + кнопки локаций и правил */}
      <div className="flex items-center justify-between gap-2">
        <div className={`flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] font-medium ${tokens.textSecondary} min-w-0`}>
          <span className="font-semibold whitespace-nowrap">
            {TEXTS.turn.roundOf(view.round, view.settings.rounds)}
          </span>
          <span aria-hidden="true" className={tokens.textMuted}>·</span>
          <span className="whitespace-nowrap tabular-nums">
            {TEXTS.turn.spiesInGame(view.spiesInGame)}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            data-testid="spy-open-locations"
            onClick={onOpenLocations}
            aria-label={TEXTS.common.locationsBtnLabel}
            className={`min-h-[44px] px-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} transition-transform whitespace-nowrap shrink-0`}
          >
            <Map className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Локации</span>
          </button>

          <button
            type="button"
            data-testid="spy-rules-button"
            onClick={onOpenRules}
            aria-label={TEXTS.common.rulesBtnLabel}
            className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} transition-transform shrink-0`}
          >
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Разделитель */}
      <div className={`border-t ${tokens.borderSubtle}`} />

      {/* Главная строка чтения за секунду: кто спрашивает + таймер */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <p
            title={isMyTurn ? 'Твой ход — задавай вопрос' : TEXTS.turn.askingNowShort(activeName)}
            className={`font-display text-base font-bold leading-snug line-clamp-2 hyphens-auto break-words ${
              isMyTurn ? tokens.accentText : tokens.textPrimary
            }`}
          >
            {isMyTurn ? 'Твой ход — задавай вопрос' : TEXTS.turn.askingNowShort(activeName)}
          </p>
          {activePlayer?.isOffline && (
            <p className={`mt-0.5 inline-flex items-center gap-1 text-[13px] ${tokens.dangerText}`}>
              <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{TEXTS.turn.activeOfflineNote}</span>
            </p>
          )}
        </div>

        <TimerBadge
          secondsLeft={view.timers.secondsLeft}
          turnPaused={view.timers.turnPaused}
          tokens={tokens}
        />
      </div>
    </section>
  );
};
