import React from 'react';
import { Loader2, WifiOff } from 'lucide-react';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';

export type SimulatedNetworkState = 'normal' | 'reconnecting' | 'loading';

interface PlatformSafeSpaceProps {
  showPlaceholderGuide: boolean;
  tokens: StyleTokens;
}

/**
 * Раздел 5 и 11 ТЗ:
 * Шапку Telegram / платформы НЕ рисуем — оставляем сверху ~56 px безопасного отступа.
 * В DevPanel можно включить пунктирную разметку этого поля, чтобы убедиться в вёрстке.
 */
export const PlatformSafeSpace: React.FC<PlatformSafeSpaceProps> = ({
  showPlaceholderGuide,
  tokens,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`h-[56px] shrink-0 pt-safe flex items-center justify-center px-3 select-none ${
        showPlaceholderGuide
          ? `border-b border-dashed ${tokens.borderStrong} ${tokens.surfaceMutedBg}/60`
          : ''
      }`}
    >
      {showPlaceholderGuide && (
        <span className={`text-[13px] font-mono ${tokens.textMuted}`}>
          {TEXTS.common.platformHeaderPlaceholder}
        </span>
      )}
    </div>
  );
};

interface ReconnectingBannerProps {
  tokens: StyleTokens;
}

export const ReconnectingBanner: React.FC<ReconnectingBannerProps> = ({ tokens }) => (
  <div
    role="status"
    aria-live="polite"
    className={`mx-3 mb-2 px-3 py-2 ${tokens.controlRadius} ${tokens.dangerSoftBg} ${tokens.dangerText} flex items-center justify-center gap-2 text-[13px] font-semibold`}
  >
    <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
    <span>{TEXTS.common.reconnecting}</span>
  </div>
);

interface PendingServerBannerProps {
  tokens: StyleTokens;
}

export const PendingServerBanner: React.FC<PendingServerBannerProps> = ({ tokens }) => (
  <div
    role="status"
    aria-live="polite"
    className={`mx-3 mb-2 px-3 py-1.5 ${tokens.controlRadius} ${tokens.accentSoftBg} ${tokens.accentText} flex items-center justify-center gap-2 text-[13px] font-semibold`}
  >
    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />
    <span>{TEXTS.common.waitingServer}</span>
  </div>
);

interface LoadingScreenProps {
  tokens: StyleTokens;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ tokens }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
    <Loader2 className={`w-8 h-8 animate-spin ${tokens.accentText}`} aria-hidden="true" />
    <p className={`text-base font-semibold ${tokens.textPrimary}`}>{TEXTS.common.loading}</p>
  </div>
);
