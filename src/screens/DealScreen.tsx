import React from 'react';
import { HelpCircle, Map } from 'lucide-react';
import { SpyCommand, SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { RoleCard } from '../components/RoleCard';

interface DealScreenProps {
  view: SpyPlayerView;
  tokens: StyleTokens;
  pendingCommand?: boolean;
  onSend: (cmd: SpyCommand) => void;
  onOpenLocations: () => void;
  onOpenRules: () => void;
}

export const DealScreen: React.FC<DealScreenProps> = ({
  view,
  tokens,
  pendingCommand = false,
  onSend,
  onOpenLocations,
  onOpenRules,
}) => {
  return (
    <div
      data-testid="spy-phase-deal"
      className="flex-1 flex flex-col min-h-0 px-3.5 pb-4 pb-safe"
    >
      {/* Верхняя полоса раздачи (одинаковая для жителя и шпиона) */}
      <div className="flex items-center justify-between gap-2 pb-3">
        <div className="min-w-0">
          <h1 className={`font-display text-lg font-bold truncate ${tokens.textPrimary}`}>
            Раздача ролей
          </h1>
          <p className={`text-[13px] ${tokens.textSecondary}`}>
            {TEXTS.turn.spiesInGame(view.spiesInGame)} · {view.players.length} за столом
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            data-testid="spy-open-locations"
            onClick={onOpenLocations}
            aria-label={TEXTS.common.locationsBtnLabel}
            className={`min-h-[44px] px-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius}`}
          >
            <Map className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Локации</span>
          </button>

          <button
            type="button"
            data-testid="spy-rules-button"
            onClick={onOpenRules}
            aria-label={TEXTS.common.rulesBtnLabel}
            className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius}`}
          >
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Центрированная карта роли с кнопками сразу под пальцем */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto py-1">
        <RoleCard
          view={view}
          tokens={tokens}
          disabled={pendingCommand}
          onHideCard={() => onSend({ type: 'HIDE_CARD' })}
          onShowCardAgain={() => onSend({ type: 'SHOW_CARD_AGAIN' })}
          onReady={() => onSend({ type: 'READY' })}
        />
      </div>
    </div>
  );
};
