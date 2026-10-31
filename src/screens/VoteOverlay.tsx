import React from 'react';
import { CheckCircle2, Clock, Flame, ShieldCheck, UserSearch } from 'lucide-react';
import { SpyCommand, SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { formatSeconds, getPlayerNickname } from '../utils/viewHelpers';

interface VoteOverlayProps {
  view: SpyPlayerView;
  tokens: StyleTokens;
  pendingCommand?: boolean;
  onSend: (cmd: SpyCommand) => void;
}

export const VoteOverlay: React.FC<VoteOverlayProps> = ({
  view,
  tokens,
  pendingCommand = false,
  onSend,
}) => {
  const acc = view.accusation;
  if (!acc || acc.stage !== 'vote') return null;

  const accuserName = getPlayerNickname(view.players, acc.accuserId);
  const targetName = getPlayerNickname(view.players, acc.targetId);
  const isTarget = acc.targetId === view.me.playerId;
  const isOut = view.me.status === 'out';
  const isAllIn = acc.kind === 'all_in';
  const progressRatio = acc.voters > 0 ? Math.min(1, acc.voted / acc.voters) : 0;

  return (
    <section
      data-testid="spy-overlay-vote"
      aria-label="Голосование стола"
      className={`${tokens.surfaceElevatedBg} ${tokens.cardRadius} p-4 space-y-3.5`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 text-[13px] font-bold ${
            isAllIn ? tokens.dangerText : tokens.accentText
          }`}
        >
          {isAllIn && <Flame className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
          <span>
            {isAllIn ? TEXTS.vote.badgeAllIn(accuserName) : TEXTS.vote.badgeRegular}
          </span>
        </span>
        <div className={`flex items-center gap-2 text-[13px] font-semibold tabular-nums ${tokens.textSecondary}`}>
          <span>{TEXTS.vote.progress(acc.voted, acc.voters)}</span>
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
        <h2 className={`font-display text-xl font-bold leading-snug break-words ${tokens.textPrimary}`}>
          {TEXTS.vote.headline(targetName)}
        </h2>
        <p className={`text-[13px] leading-relaxed ${tokens.textSecondary}`}>
          {isAllIn
            ? TEXTS.vote.sublineAllIn(accuserName, targetName)
            : TEXTS.vote.sublineRegular(accuserName, targetName)}
        </p>
      </div>

      {/* Счётчик проголосовавших без раскрытия, кто как голосовал */}
      <div className={`h-2 w-full rounded-full overflow-hidden ${tokens.surfaceMutedBg}`}>
        <div
          className={`h-full rounded-full transition-transform duration-300 origin-left ${tokens.dossierProgressFill}`}
          style={{ transform: `scaleX(${progressRatio})` }}
        />
      </div>

      {view.can.vote ? (
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            data-testid="spy-vote-spy"
            disabled={pendingCommand}
            onClick={() => onSend({ type: 'VOTE', vote: 'spy' })}
            className={`min-h-[54px] px-3 inline-flex items-center justify-center gap-1.5 text-sm font-bold ${tokens.primaryBtn} ${tokens.primaryBtnText} ${tokens.controlRadius} transition-transform disabled:opacity-50`}
          >
            <UserSearch className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{TEXTS.vote.spyBtn}</span>
          </button>

          <button
            type="button"
            data-testid="spy-vote-not-spy"
            disabled={pendingCommand}
            onClick={() => onSend({ type: 'VOTE', vote: 'not_spy' })}
            className={`min-h-[54px] px-3 inline-flex items-center justify-center gap-1.5 text-sm font-bold ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} transition-transform disabled:opacity-50`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{TEXTS.vote.notSpyBtn}</span>
          </button>
        </div>
      ) : (
        <div
          className={`p-3 text-center space-y-1 ${tokens.surfaceMutedBg} ${tokens.controlRadius}`}
        >
          <p className={`text-sm font-bold inline-flex items-center justify-center gap-1.5 ${tokens.textPrimary}`}>
            {acc.myVote && <CheckCircle2 className={`w-4 h-4 shrink-0 ${tokens.accentText}`} aria-hidden="true" />}
            <span>
              {acc.myVote === 'spy'
                ? TEXTS.vote.myVoteSpy
                : acc.myVote === 'not_spy'
                  ? TEXTS.vote.myVoteNotSpy
                  : isTarget
                    ? TEXTS.vote.targetNotice
                    : isOut
                      ? TEXTS.vote.outReadOnly
                      : 'Ждём окончания голосования'}
            </span>
          </p>
          {isTarget && (view.can.name || view.can.allIn) && (
            <p className={`text-[13px] ${tokens.textSecondary}`}>
              {TEXTS.vote.targetCanActHint}
            </p>
          )}
        </div>
      )}
    </section>
  );
};
