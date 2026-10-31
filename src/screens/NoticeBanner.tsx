import React from 'react';
import { AlertCircle, Radio } from 'lucide-react';
import { SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';

interface NoticeBannerProps {
  notices?: SpyPlayerView['notices'];
  tokens: StyleTokens;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ notices, tokens }) => {
  if (!notices || notices.length === 0) return null;

  return (
    <div className="space-y-2" data-testid="spy-notice">
      {notices.map((n) => {
        const isPublic = n.kind === 'failed_guess_public';
        const text =
          n.kind === 'failed_guess_public'
            ? TEXTS.notices.failed_guess_public
            : n.kind === 'my_failed_guess'
              ? TEXTS.notices.my_failed_guess(n.round)
              : TEXTS.notices.penalty(n.round);

        return (
          <div
            key={n.id}
            role="status"
            aria-live="polite"
            className={`p-3 ${tokens.controlRadius} flex items-start gap-2.5 ${
              isPublic
                ? `${tokens.accentSoftBg} ${tokens.accentText}`
                : `${tokens.dangerSoftBg} ${tokens.dangerText}`
            }`}
          >
            {isPublic ? (
              <Radio className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            )}
            <p className="text-sm font-semibold leading-snug">{text}</p>
          </div>
        );
      })}
    </div>
  );
};
