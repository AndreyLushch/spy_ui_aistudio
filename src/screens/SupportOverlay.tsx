import React from 'react';
import { Clock, ThumbsDown, ThumbsUp, Users } from 'lucide-react';
import { SpyCommand, SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { formatSeconds, getPlayerNickname } from '../utils/viewHelpers';

interface SupportOverlayProps {
  view: SpyPlayerView;
  tokens: StyleTokens;
  pendingCommand?: boolean;
  onSend: (cmd: SpyCommand) => void;
}

export const SupportOverlay: React.FC<SupportOverlayProps> = ({
  view,
  tokens,
  pendingCommand = false,
  onSend,
}) => {
  const acc = view.accusation;
  if (!acc || acc.stage !== 'support') return null;

  const accuserName = getPlayerNickname(view.players, acc.accuserId);
  const targetName = getPlayerNickname(view.players, acc.targetId);
  const isTarget = acc.targetId === view.me.playerId;
  const isOut = view.me.status === 'out';
  const isPenalized = Boolean(view.me.penaltyUntilRound && view.round < view.me.penaltyUntilRound);
  const progressRatio =
    acc.supportNeeded > 0 ? Math.min(1, acc.supporters / acc.supportNeeded) : 0;

  return (
    <section
      data-testid="spy-overlay-support"
      aria-label="Сбор поддержки обвинения"
      className={`${tokens.surfaceElevatedBg} ${tokens.cardRadius} p-4 space-y-3.5`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`text-[13px] font-bold ${tokens.accentText}`}>
          {TEXTS.support.badge}
        </span>
        <div className={`flex items-center gap-2 text-[13px] font-semibold tabular-nums ${tokens.textSecondary}`}>
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{TEXTS.support.progress(acc.supporters, acc.supportNeeded)}</span>
          </span>
          {view.timers.secondsLeft !== undefined && (
            <>
              <span aria-hidden="true" className={tokens.textMuted}>·</span>
              <span className="inline-flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{formatSeconds(view.timers.secondsLeft)}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <h2 className={`font-display text-lg font-bold leading-snug break-words ${tokens.textPrimary}`}>
          {TEXTS.support.headline(accuserName, targetName)}
        </h2>
        <p className={`text-sm ${tokens.textSecondary}`}>{TEXTS.support.question}</p>
      </div>

      {/* Индикатор прогресса без раскрытия имён поддержавших */}
      <div className={`h-2 w-full rounded-full overflow-hidden ${tokens.surfaceMutedBg}`}>
        <div
          className={`h-full rounded-full transition-transform duration-300 origin-left ${tokens.dossierProgressFill}`}
          style={{ transform: `scaleX(${progressRatio})` }}
        />
      </div>

      {view.can.support ? (
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            data-testid="spy-support-yes"
            disabled={pendingCommand}
            onClick={() => onSend({ type: 'SUPPORT', support: true })}
            className={`min-h-[52px] px-3 inline-flex items-center justify-center gap-1.5 text-sm font-bold ${tokens.primaryBtn} ${tokens.primaryBtnText} ${tokens.controlRadius} transition-transform disabled:opacity-50`}
          >
            <ThumbsUp className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{TEXTS.support.yesBtn}</span>
          </button>

          <button
            type="button"
            data-testid="spy-support-no"
            disabled={pendingCommand}
            onClick={() => onSend({ type: 'SUPPORT', support: false })}
            className={`min-h-[52px] px-3 inline-flex items-center justify-center gap-1.5 text-sm font-bold ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} transition-transform disabled:opacity-50`}
          >
            <ThumbsDown className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{TEXTS.support.noBtn}</span>
          </button>
        </div>
      ) : (
        <div
          className={`p-3 text-center text-sm font-semibold ${tokens.surfaceMutedBg} ${tokens.controlRadius} ${tokens.textSecondary}`}
        >
          {acc.mySupport === true
            ? TEXTS.support.votedYes
            : acc.mySupport === false
              ? TEXTS.support.votedNo
              : isTarget
                ? TEXTS.support.targetReadOnly
                : isOut
                  ? TEXTS.support.outReadOnly
                  : isPenalized
                    ? TEXTS.support.penalizedReadOnly(view.me.penaltyUntilRound)
                    : 'Ожидаем завершения сбора поддержки'}
        </div>
      )}
    </section>
  );
};
