import React from 'react';
import { Clock, Pause } from 'lucide-react';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { formatSeconds } from '../utils/viewHelpers';

interface TimerBadgeProps {
  secondsLeft?: number;
  turnPaused?: boolean;
  tokens: StyleTokens;
  compact?: boolean;
}

export const TimerBadge: React.FC<TimerBadgeProps> = ({
  secondsLeft,
  turnPaused = false,
  tokens,
  compact = false,
}) => {
  const isUrgent = !turnPaused && secondsLeft !== undefined && secondsLeft <= 8;

  return (
    <div
      data-testid="spy-timer"
      aria-label={
        turnPaused
          ? `Таймер: ${TEXTS.common.paused}`
          : `Осталось времени: ${formatSeconds(secondsLeft)}`
      }
      className={`inline-flex items-center gap-1.5 font-mono tabular-nums font-semibold shrink-0 transition-colors ${
        compact ? 'px-2.5 py-1 text-[13px]' : 'px-3 py-1.5 text-sm'
      } ${tokens.controlRadius} ${
        turnPaused
          ? `${tokens.surfaceMutedBg} ${tokens.textSecondary}`
          : isUrgent
            ? `${tokens.dangerSoftBg} ${tokens.dangerText}`
            : `${tokens.surfaceMutedBg} ${tokens.textPrimary}`
      }`}
    >
      {turnPaused ? (
        <>
          <Pause className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{TEXTS.common.paused}</span>
        </>
      ) : (
        <>
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{formatSeconds(secondsLeft)}</span>
        </>
      )}
    </div>
  );
};
