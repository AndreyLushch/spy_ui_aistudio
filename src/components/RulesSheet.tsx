import React from 'react';
import { BookOpen, X } from 'lucide-react';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';

interface RulesSheetProps {
  open: boolean;
  tokens: StyleTokens;
  onClose: () => void;
}

export const RulesSheet: React.FC<RulesSheetProps> = ({ open, tokens, onClose }) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={TEXTS.rules.title}
      data-testid="spy-rules-sheet"
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/55"
    >
      <div
        className={`max-h-[86%] flex flex-col ${tokens.canvasBg} rounded-t-3xl border-t ${tokens.borderSubtle} shadow-2xl`}
      >
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className={`w-5 h-5 ${tokens.accentText}`} aria-hidden="true" />
            <h2 className={`font-display text-lg font-bold ${tokens.textPrimary}`}>
              {TEXTS.rules.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={TEXTS.common.close}
            className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius}`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pb-6">
          {TEXTS.rules.sections.map((sec) => (
            <section
              key={sec.heading}
              className={`p-3.5 ${tokens.surfaceBg} ${tokens.controlRadius} space-y-1`}
            >
              <h3 className={`text-sm font-bold ${tokens.textPrimary}`}>{sec.heading}</h3>
              <p className={`text-[13px] leading-relaxed ${tokens.textSecondary}`}>{sec.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
