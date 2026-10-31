import React from 'react';
import { Eye, Flame, Lightbulb, Target } from 'lucide-react';
import { SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { getButtonBlockedShortText, getDockStatusLine } from '../utils/viewHelpers';

interface ActionButtonsProps {
  view: SpyPlayerView;
  tokens: StyleTokens;
  pendingCommand?: boolean;
  onPressName: () => void;
  onPressAllIn: () => void;
  onPressHint: () => void;
}

/**
 * Сквозная нижняя панель из трёх кнопок («Назвать», «Ва-банк», «Подсказка»).
 *
 * КРИТИЧЕСКОЕ ПРАВИЛО:
 * Расположение, названия, цвета и подписи у жителя и шпиона выглядят одинаково.
 * Для выбывшего игрока (`me.status === 'out'`) кнопки скрываются и заменяются плашкой наблюдателя.
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  view,
  tokens,
  pendingCommand = false,
  onPressName,
  onPressAllIn,
  onPressHint,
}) => {
  if (view.me.status === 'out') {
    return (
      <div
        data-testid="spy-eliminated-banner"
        className={`px-3.5 py-3 pb-safe border-t ${tokens.borderSubtle} ${tokens.surfaceBg} flex items-center justify-center gap-2 text-sm font-semibold ${tokens.textSecondary}`}
      >
        <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>{TEXTS.common.eliminatedBanner}</span>
      </div>
    );
  }

  const nameBlockedText = getButtonBlockedShortText(view, 'name');
  const allInBlockedText = getButtonBlockedShortText(view, 'allIn');
  const hintBlockedText = getButtonBlockedShortText(view, 'hint');
  const statusLine = getDockStatusLine(view);
  const allThreeBlockedSame =
    !view.can.name &&
    !view.can.allIn &&
    !view.can.hint &&
    nameBlockedText === allInBlockedText &&
    allInBlockedText === hintBlockedText;

  return (
    <div
      className={`px-2.5 pt-2 pb-2.5 pb-safe border-t ${tokens.borderSubtle} ${tokens.surfaceBg} space-y-1.5 shrink-0`}
    >
      {statusLine && (
        <p className={`px-1 text-[13px] leading-snug text-center ${tokens.textSecondary}`}>
          {statusLine}
        </p>
      )}

      <div className="grid grid-cols-3 gap-1.5">
        {/* 1. Назвать */}
        <div className="flex flex-col items-stretch">
          <button
            type="button"
            data-testid="spy-action-name"
            disabled={!view.can.name || pendingCommand}
            onClick={onPressName}
            className={`min-h-[50px] px-1.5 py-1.5 flex flex-col items-center justify-center gap-0.5 font-bold text-[13px] sm:text-sm transition-transform ${
              tokens.controlRadius
            } ${
              view.can.name && !pendingCommand
                ? `${tokens.primaryBtn} ${tokens.primaryBtnText}`
                : `${tokens.surfaceMutedBg} ${tokens.textMuted} opacity-65 cursor-not-allowed`
            }`}
          >
            <Target className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{TEXTS.actions.name}</span>
          </button>
          {nameBlockedText && !allThreeBlockedSame && (
            <span className={`mt-0.5 text-[13px] leading-tight text-center truncate ${tokens.textMuted}`}>
              {nameBlockedText}
            </span>
          )}
        </div>

        {/* 2. Ва-банк */}
        <div className="flex flex-col items-stretch">
          <button
            type="button"
            data-testid="spy-action-all-in"
            disabled={!view.can.allIn || pendingCommand}
            onClick={onPressAllIn}
            className={`min-h-[50px] px-1.5 py-1.5 flex flex-col items-center justify-center gap-0.5 font-bold text-[13px] sm:text-sm transition-transform ${
              tokens.controlRadius
            } ${
              view.can.allIn && !pendingCommand
                ? `${tokens.riskBtn} ${tokens.riskBtnText}`
                : `${tokens.surfaceMutedBg} ${tokens.textMuted} opacity-65 cursor-not-allowed`
            }`}
          >
            <Flame className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{TEXTS.actions.allIn}</span>
          </button>
          {allInBlockedText && !allThreeBlockedSame && (
            <span className={`mt-0.5 text-[13px] leading-tight text-center truncate ${tokens.textMuted}`}>
              {allInBlockedText}
            </span>
          )}
        </div>

        {/* 3. Подсказка */}
        <div className="flex flex-col items-stretch">
          <button
            type="button"
            data-testid="spy-action-hint"
            disabled={!view.can.hint || pendingCommand}
            onClick={onPressHint}
            className={`min-h-[50px] px-1.5 py-1.5 flex flex-col items-center justify-center gap-0.5 font-bold text-[13px] sm:text-sm transition-transform ${
              tokens.controlRadius
            } ${
              view.can.hint && !pendingCommand
                ? `${tokens.secondaryBtn} ${tokens.secondaryBtnText}`
                : `${tokens.surfaceMutedBg} ${tokens.textMuted} opacity-65 cursor-not-allowed`
            }`}
          >
            <Lightbulb className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{TEXTS.actions.hint}</span>
          </button>
          {hintBlockedText && !allThreeBlockedSame && (
            <span className={`mt-0.5 text-[13px] leading-tight text-center truncate ${tokens.textMuted}`}>
              {hintBlockedText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
