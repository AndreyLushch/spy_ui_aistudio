import React from 'react';
import { motion } from 'motion/react';
import { Check, Eye, EyeOff, FolderLock } from 'lucide-react';
import { SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { TimerBadge } from './TimerBadge';

interface RoleCardProps {
  view: SpyPlayerView;
  tokens: StyleTokens;
  disabled?: boolean;
  onHideCard: () => void;
  onShowCardAgain: () => void;
  onReady: () => void;
}

/**
 * Карта роли на этапе `deal`.
 *
 * КРИТИЧЕСКОЕ ТРЕБОВАНИЕ (разделы 4, 7, 11 ТЗ):
 * У жителя и шпиона абсолютно одинаковые размер, цвет, рамка, таймер и расположение кнопок,
 * чтобы соседи за столом по отсвету или силуэту экрана не могли вычислить шпиона.
 */
export const RoleCard: React.FC<RoleCardProps> = ({
  view,
  tokens,
  disabled = false,
  onHideCard,
  onShowCardAgain,
  onReady,
}) => {
  const { card, cardRevealsLeft, ready } = view.me;
  const totalSec = view.timers.totalSeconds ?? 12;
  const leftSec = view.timers.secondsLeft ?? 0;
  const ratio = totalSec > 0 ? Math.min(1, Math.max(0, leftSec / totalSec)) : 0;
  const readyCount = view.readyCount ?? 0;

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Конверт / досье фиксированной минимальной высоты и единого оформления */}
      <motion.div
        key={card ? 'card-open' : 'card-closed'}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        data-testid="spy-card"
        className={`relative overflow-hidden min-h-[288px] flex flex-col justify-between p-5 ${tokens.cardRadius} ${
          card ? `${tokens.dossierBg} ${tokens.dossierBorder}` : `${tokens.surfaceBg}`
        }`}
      >
        {/* Верхняя плашка досье + таймер */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FolderLock className={`w-4 h-4 shrink-0 ${tokens.dossierStampText}`} aria-hidden="true" />
            <span className={`text-[13px] font-semibold truncate ${tokens.dossierStampText}`}>
              {card ? TEXTS.deal.kicker : TEXTS.deal.cardHiddenTitle}
            </span>
          </div>
          <TimerBadge
            secondsLeft={view.timers.secondsLeft}
            turnPaused={view.timers.turnPaused}
            tokens={tokens}
            compact
          />
        </div>

        {/* Центральное содержимое (одинаковый двухэтажный ритм у жителя и шпиона) */}
        {card ? (
          <div className="my-4 space-y-3.5">
            <div>
              <p className={`text-[13px] font-medium ${tokens.textMuted}`}>
                {card.kind === 'local' ? TEXTS.deal.localLocationLabel : 'Твоя сторона'}
              </p>
              <h2
                className={`mt-1 font-display text-2xl font-bold leading-tight break-words text-balance ${tokens.textPrimary}`}
              >
                {card.kind === 'local' ? card.locationName : TEXTS.deal.spyHeadline}
              </h2>
            </div>

            <div className={`border-t ${tokens.borderSubtle}`} />

            <div>
              <p className={`text-[13px] font-medium ${tokens.textMuted}`}>
                {card.kind === 'local' ? TEXTS.deal.localRoleLabel : 'Ориентировка'}
              </p>
              <p className={`mt-0.5 text-lg font-bold leading-snug break-words ${tokens.textPrimary}`}>
                {card.kind === 'local' ? card.role : 'Локация неизвестна'}
              </p>
            </div>

            <p className={`text-[13px] leading-relaxed ${tokens.textSecondary}`}>
              {card.kind === 'local' ? TEXTS.deal.localSubline : TEXTS.deal.spySubline}
            </p>
          </div>
        ) : (
          <div className="my-6 flex flex-col items-center text-center space-y-2.5 px-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tokens.surfaceMutedBg}`}>
              <EyeOff className={`w-6 h-6 ${tokens.textSecondary}`} aria-hidden="true" />
            </div>
            <h2 className={`font-display text-xl font-bold ${tokens.textPrimary}`}>
              {ready ? TEXTS.deal.youAreReady : TEXTS.deal.cardHiddenTitle}
            </h2>
            <p className={`text-sm leading-relaxed max-w-[28ch] ${tokens.textSecondary}`}>
              {ready
                ? 'Партия начнётся автоматически, как только все нажмут «Готов».'
                : cardRevealsLeft > 0
                  ? TEXTS.deal.cardHiddenHintCanReveal
                  : TEXTS.deal.cardHiddenHintNoReveals}
            </p>
            <p className={`text-[13px] font-semibold tabular-nums pt-1 ${tokens.accentText}`}>
              {TEXTS.deal.readyProgress(readyCount, view.players.length)}
            </p>
          </div>
        )}

        {/* Нижняя полоса прогресса показа + напоминание прикрыть экран */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className={tokens.textMuted}>
              {card ? TEXTS.deal.peekWarning : TEXTS.deal.readyProgress(readyCount, view.players.length)}
            </span>
          </div>
          <div className={`h-1.5 w-full overflow-hidden rounded-full ${tokens.surfaceMutedBg}`}>
            <div
              className={`h-full rounded-full transition-transform duration-300 origin-left ${tokens.dossierProgressFill}`}
              style={{ transform: `scaleX(${ratio})` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Кнопки сразу под большим пальцем */}
      {card ? (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            data-testid="spy-hide-card"
            disabled={disabled}
            onClick={onHideCard}
            className={`min-h-[52px] px-4 inline-flex items-center justify-center gap-2 text-sm font-bold ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} transition-transform disabled:opacity-50`}
          >
            <EyeOff className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{TEXTS.deal.hideCard}</span>
          </button>

          <button
            type="button"
            data-testid="spy-ready"
            disabled={disabled || ready}
            onClick={onReady}
            className={`min-h-[52px] px-4 inline-flex items-center justify-center gap-2 text-sm font-bold ${tokens.primaryBtn} ${tokens.primaryBtnText} ${tokens.controlRadius} transition-transform disabled:opacity-50`}
          >
            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{TEXTS.deal.readyBtn}</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            data-testid="spy-show-card-again"
            disabled={disabled || ready || cardRevealsLeft <= 0}
            onClick={onShowCardAgain}
            className={`min-h-[50px] px-4 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} transition-transform disabled:opacity-45`}
          >
            <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">
              {cardRevealsLeft > 0 ? TEXTS.deal.showCardAgain : TEXTS.deal.noRevealsLeft}
            </span>
          </button>

          <button
            type="button"
            data-testid="spy-ready"
            disabled={disabled || ready}
            onClick={onReady}
            className={`min-h-[52px] px-4 w-full inline-flex items-center justify-center gap-2 text-sm font-bold ${tokens.primaryBtn} ${tokens.primaryBtnText} ${tokens.controlRadius} transition-transform disabled:opacity-55`}
          >
            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">
              {ready ? TEXTS.deal.youAreReady : TEXTS.deal.readyBtn}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
