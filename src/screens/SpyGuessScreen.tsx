import React, { useState } from 'react';
import { Flame, HelpCircle } from 'lucide-react';
import { SpyCommand, SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { getPlayerNickname } from '../utils/viewHelpers';
import { TimerBadge } from '../components/TimerBadge';
import { LocationsGrid } from '../components/LocationsGrid';
import { PlayersList } from '../components/PlayersList';

interface SpyGuessScreenProps {
  view: SpyPlayerView;
  tokens: StyleTokens;
  pendingCommand?: boolean;
  onSend: (cmd: SpyCommand) => void;
  onOpenRules: () => void;
}

export const SpyGuessScreen: React.FC<SpyGuessScreenProps> = ({
  view,
  tokens,
  pendingCommand = false,
  onSend,
  onOpenRules,
}) => {
  const [selectedLocId, setSelectedLocId] = useState<string | null>(null);
  const spyId = view.spyAllIn?.playerId;
  const spyNickname = getPlayerNickname(view.players, spyId);
  const isMeChoosing = spyId === view.me.playerId && Boolean(view.spyAllIn?.choosing);
  const selectedLocName = view.locations.find((l) => l.id === selectedLocId)?.name;

  return (
    <div
      data-testid="spy-phase-spy_guess"
      className="flex-1 flex flex-col min-h-0"
    >
      {/* Верхняя полоса с таймером отсчёта */}
      <div className="px-3.5 pb-2.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Flame className={`w-5 h-5 shrink-0 ${tokens.dangerText}`} aria-hidden="true" />
          <span className={`font-display text-base font-bold truncate ${tokens.textPrimary}`}>
            {TEXTS.spyGuess.badge}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <TimerBadge
            secondsLeft={view.timers.secondsLeft}
            turnPaused={view.timers.turnPaused}
            tokens={tokens}
          />
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

      {isMeChoosing ? (
        <>
          <div className="px-3.5 pb-2">
            <div className={`${tokens.surfaceBg} ${tokens.cardRadius} p-3.5 space-y-1`}>
              <h1 className={`font-display text-lg font-bold ${tokens.textPrimary}`}>
                {TEXTS.spyGuess.choosingTitle}
              </h1>
              <p className={`text-[13px] ${tokens.textSecondary}`}>
                {TEXTS.spyGuess.choosingSubtitle}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3.5 pb-3">
            <LocationsGrid
              locations={view.locations}
              tokens={tokens}
              selectable
              selectedId={selectedLocId}
              disabledIds={view.me.guessedLocationIds ?? []}
              onSelect={setSelectedLocId}
            />
          </div>

          <div className={`px-3.5 pt-2.5 pb-3.5 pb-safe border-t ${tokens.borderSubtle} ${tokens.surfaceBg}`}>
            <button
              type="button"
              disabled={!selectedLocId || pendingCommand}
              onClick={() => {
                if (!selectedLocId) return;
                onSend({ type: 'GUESS_LOCATION', locationId: selectedLocId });
              }}
              className={`min-h-[52px] w-full px-4 font-bold text-sm truncate ${tokens.primaryBtn} ${tokens.primaryBtnText} ${tokens.controlRadius} disabled:opacity-45`}
            >
              {selectedLocName ? TEXTS.modals.guessConfirm(selectedLocName) : TEXTS.common.confirm}
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-3.5 pb-4 space-y-3.5 flex flex-col justify-center">
          <section className={`${tokens.dossierBg} ${tokens.dossierBorder} ${tokens.cardRadius} p-5 text-center space-y-3`}>
            <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${tokens.dangerSoftBg} ${tokens.dangerText}`}>
              <Flame className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className={`font-display text-xl font-extrabold leading-snug break-words text-balance ${tokens.textPrimary}`}>
              {TEXTS.spyGuess.publicHeadline(spyNickname)}
            </h1>
            <p className={`text-sm leading-relaxed ${tokens.textSecondary}`}>
              {view.spyAllIn?.choosing
                ? TEXTS.spyGuess.waitingSpySubline(spyNickname)
                : TEXTS.spyGuess.preparingSubline}
            </p>
          </section>

          <PlayersList
            players={view.players}
            myPlayerId={view.me.playerId}
            activePlayerId={spyId}
            tokens={tokens}
          />
        </div>
      )}
    </div>
  );
};
