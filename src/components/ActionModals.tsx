import React, { useState } from 'react';
import { AlertTriangle, Check, Lightbulb, X } from 'lucide-react';
import { SpyCommand, SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { getPlayerNickname, isSpyPerspective } from '../utils/viewHelpers';
import { LocationsGrid } from './LocationsGrid';

export type ActiveActionModal = 'none' | 'name' | 'all_in_warn' | 'all_in_pick' | 'hint';

interface ActionModalsProps {
  modal: ActiveActionModal;
  view: SpyPlayerView;
  tokens: StyleTokens;
  onClose: () => void;
  onProceedAllIn: () => void;
  onSendCommand: (cmd: SpyCommand) => void;
}

export const ActionModals: React.FC<ActionModalsProps> = ({
  modal,
  view,
  tokens,
  onClose,
  onProceedAllIn,
  onSendCommand,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  if (modal === 'none') return null;

  const isSpy = isSpyPerspective(view);
  const suspects = view.players.filter(
    (p) => p.status === 'in' && p.id !== view.me.playerId
  );

  const handleClose = () => {
    setSelectedTargetId(null);
    setSelectedLocationId(null);
    onClose();
  };

  // 1. Окно «Подсказка» (одинаково для всех)
  if (modal === 'hint') {
    const questions = view.me.hint ?? [];
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={TEXTS.modals.hintTitle}
        className="absolute inset-0 z-40 flex flex-col justify-end bg-black/55"
      >
        <div
          className={`max-h-[82%] flex flex-col ${tokens.canvasBg} rounded-t-3xl border-t ${tokens.borderSubtle} shadow-2xl p-4 pb-6 space-y-4`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tokens.accentSoftBg} ${tokens.accentText}`}>
                <Lightbulb className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className={`font-display text-lg font-bold ${tokens.textPrimary}`}>
                  {TEXTS.modals.hintTitle}
                </h2>
                <p className={`text-[13px] ${tokens.textSecondary}`}>
                  {TEXTS.modals.hintSubtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label={TEXTS.common.close}
              className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} shrink-0`}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <ol className="space-y-2.5 overflow-y-auto">
            {questions.map((q, idx) => (
              <li
                key={idx}
                className={`p-3.5 ${tokens.surfaceBg} ${tokens.controlRadius} flex items-start gap-2.5`}
              >
                <span className={`font-mono font-bold text-sm tabular-nums ${tokens.accentText}`}>
                  0{idx + 1}.
                </span>
                <p className={`text-sm font-medium leading-relaxed ${tokens.textPrimary}`}>
                  {q}
                </p>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={handleClose}
            className={`min-h-[50px] w-full font-bold text-sm ${tokens.primaryBtn} ${tokens.primaryBtnText} ${tokens.controlRadius}`}
          >
            {TEXTS.common.gotIt}
          </button>
        </div>
      </div>
    );
  }

  // 2. Предупреждение «Ва-банк» (шаг 1)
  if (modal === 'all_in_warn') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={TEXTS.modals.allInWarningTitle}
        className="absolute inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 p-3"
      >
        <div
          className={`w-full ${tokens.canvasBg} ${tokens.cardRadius} border ${tokens.borderStrong} shadow-2xl p-5 space-y-4`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${tokens.dangerSoftBg} ${tokens.dangerText}`}>
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className={`font-display text-xl font-bold ${tokens.textPrimary}`}>
                {TEXTS.modals.allInWarningTitle}
              </h2>
              <p className={`text-[13px] font-medium ${tokens.dangerText}`}>
                Риск выбывания из партии
              </p>
            </div>
          </div>

          <p className={`text-sm leading-relaxed font-semibold ${tokens.textPrimary}`}>
            {TEXTS.modals.allInWarningBody}
          </p>
          <p className={`text-[13px] leading-relaxed ${tokens.textSecondary}`}>
            {TEXTS.modals.allInLocalExplain}
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className={`min-h-[50px] px-3 font-semibold text-sm ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius}`}
            >
              {TEXTS.common.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                if (isSpy) {
                  onSendCommand({ type: 'SPY_ALL_IN' });
                  handleClose();
                } else {
                  onProceedAllIn();
                }
              }}
              className={`min-h-[50px] px-3 font-bold text-sm ${tokens.riskBtn} ${tokens.riskBtnText} ${tokens.controlRadius}`}
            >
              {TEXTS.common.continueBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Окно «Назвать» для шпиона (выбор локации -> подтверждение)
  if (modal === 'name' && isSpy) {
    const selectedLocName = view.locations.find((l) => l.id === selectedLocationId)?.name;
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={TEXTS.modals.guessTitle}
        className="absolute inset-0 z-40 flex flex-col justify-end bg-black/55"
      >
        <div
          className={`max-h-[86%] flex flex-col ${tokens.canvasBg} rounded-t-3xl border-t ${tokens.borderSubtle} shadow-2xl`}
        >
          <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-black/5 dark:border-white/10">
            <div>
              <h2 className={`font-display text-lg font-bold ${tokens.textPrimary}`}>
                {TEXTS.modals.guessTitle}
              </h2>
              <p className={`text-[13px] leading-snug mt-0.5 ${tokens.textSecondary}`}>
                {TEXTS.modals.guessSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label={TEXTS.common.close}
              className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} shrink-0`}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5">
            <LocationsGrid
              locations={view.locations}
              tokens={tokens}
              selectable
              selectedId={selectedLocationId}
              disabledIds={view.me.guessedLocationIds ?? []}
              onSelect={setSelectedLocationId}
            />
          </div>

          <div className={`p-3.5 border-t ${tokens.borderSubtle} ${tokens.surfaceBg}`}>
            <button
              type="button"
              disabled={!selectedLocationId}
              onClick={() => {
                if (!selectedLocationId) return;
                onSendCommand({ type: 'GUESS_LOCATION', locationId: selectedLocationId });
                handleClose();
              }}
              className={`min-h-[52px] w-full px-4 font-bold text-sm truncate ${tokens.primaryBtn} ${tokens.primaryBtnText} ${tokens.controlRadius} disabled:opacity-45`}
            >
              {selectedLocName ? TEXTS.modals.guessConfirm(selectedLocName) : TEXTS.common.confirm}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Окно «Назвать» или «Ва-банк (шаг 2)» для жителя — выбор подозреваемого
  const isAllInPick = modal === 'all_in_pick';
  const chosenNickname = selectedTargetId
    ? getPlayerNickname(view.players, selectedTargetId)
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAllInPick ? TEXTS.modals.allInPickTargetTitle : TEXTS.modals.accuseTitle}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/55"
    >
      <div
        className={`max-h-[85%] flex flex-col ${tokens.canvasBg} rounded-t-3xl border-t ${tokens.borderSubtle} shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-black/5 dark:border-white/10">
          <div>
            <h2 className={`font-display text-lg font-bold ${tokens.textPrimary}`}>
              {isAllInPick ? TEXTS.modals.allInPickTargetTitle : TEXTS.modals.accuseTitle}
            </h2>
            <p className={`text-[13px] leading-snug mt-0.5 ${tokens.textSecondary}`}>
              {isAllInPick ? TEXTS.modals.allInPickTargetSubtitle : TEXTS.modals.accuseSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={TEXTS.common.close}
            className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} shrink-0`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
          {suspects.map((player) => {
            const selected = selectedTargetId === player.id;
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => setSelectedTargetId(player.id)}
                className={`w-full min-h-[52px] px-3.5 py-2.5 flex items-center justify-between gap-2 text-left transition-transform ${
                  tokens.controlRadius
                } ${
                  selected
                    ? `${tokens.accentSoftBg} ring-2 ring-current ${tokens.accentText}`
                    : `${tokens.surfaceBg} active:scale-[0.99]`
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate ${tokens.textPrimary}`}>
                    {player.nickname}
                  </p>
                  {player.isOffline && (
                    <p className={`text-[13px] ${tokens.textMuted}`}>{TEXTS.common.offlineTag}</p>
                  )}
                </div>
                {selected && <Check className="w-5 h-5 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <div className={`p-3.5 border-t ${tokens.borderSubtle} ${tokens.surfaceBg}`}>
          <button
            type="button"
            disabled={!selectedTargetId}
            onClick={() => {
              if (!selectedTargetId) return;
              if (isAllInPick) {
                onSendCommand({ type: 'ALL_IN_ACCUSE', targetId: selectedTargetId });
              } else {
                onSendCommand({ type: 'ACCUSE', targetId: selectedTargetId });
              }
              handleClose();
            }}
            className={`min-h-[52px] w-full px-4 font-bold text-sm truncate ${
              isAllInPick
                ? `${tokens.riskBtn} ${tokens.riskBtnText}`
                : `${tokens.primaryBtn} ${tokens.primaryBtnText}`
            } ${tokens.controlRadius} disabled:opacity-45`}
          >
            {chosenNickname
              ? isAllInPick
                ? TEXTS.modals.allInConfirmTarget(chosenNickname)
                : TEXTS.modals.accuseConfirm(chosenNickname)
              : TEXTS.common.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
