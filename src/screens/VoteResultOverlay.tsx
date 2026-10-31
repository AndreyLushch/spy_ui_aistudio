import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { getPlayerNickname } from '../utils/viewHelpers';

interface VoteResultOverlayProps {
  view: SpyPlayerView;
  tokens: StyleTokens;
}

export const VoteResultOverlay: React.FC<VoteResultOverlayProps> = ({ view, tokens }) => {
  const res = view.voteResult;
  if (!res) return null;

  const targetName = getPlayerNickname(view.players, res.targetId);
  const accuserName = getPlayerNickname(view.players, res.accuserId);

  const isSuccess = res.text === 'spy_caught';
  const isDanger = res.text === 'innocent' || res.text === 'all_in_out';

  const message =
    res.text === 'spy_caught'
      ? TEXTS.voteResult.spy_caught(targetName)
      : res.text === 'innocent'
        ? TEXTS.voteResult.innocent(targetName)
        : res.text === 'all_in_out'
          ? TEXTS.voteResult.all_in_out(accuserName)
          : TEXTS.voteResult.failed;

  return (
    <section
      data-testid="spy-overlay-vote-result"
      role="status"
      aria-live="polite"
      className={`${tokens.surfaceElevatedBg} ${tokens.cardRadius} p-4 flex items-start gap-3`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isSuccess
            ? `${tokens.successSoftBg} ${tokens.successText}`
            : isDanger
              ? `${tokens.dangerSoftBg} ${tokens.dangerText}`
              : `${tokens.surfaceMutedBg} ${tokens.textSecondary}`
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
        ) : isDanger ? (
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Info className="w-5 h-5" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[13px] font-bold ${tokens.textMuted}`}>Итог голосования</span>
          <span className={`font-mono tabular-nums text-[13px] ${tokens.textMuted}`}>
            {res.secondsLeft} с
          </span>
        </div>
        <p className={`font-display text-base font-bold leading-snug break-words ${tokens.textPrimary}`}>
          {message}
        </p>
      </div>
    </section>
  );
};
