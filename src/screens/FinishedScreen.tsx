import React from 'react';
import { Award, HelpCircle, LogOut, RotateCcw, Trophy } from 'lucide-react';
import { SpyCommand, SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { getPlayerNickname } from '../utils/viewHelpers';
import { LocationIcon } from '../components/LocationIcon';

interface FinishedScreenProps {
  view: SpyPlayerView;
  tokens: StyleTokens;
  pendingCommand?: boolean;
  onSend: (cmd: SpyCommand) => void;
  onOpenRules: () => void;
}

export const FinishedScreen: React.FC<FinishedScreenProps> = ({
  view,
  tokens,
  pendingCommand = false,
  onSend,
  onOpenRules,
}) => {
  const summary = view.finishedSummary;
  if (!summary) return null;

  const localsWon = summary.winner === 'locals';
  const spyNames = summary.spies
    .map((id) => getPlayerNickname(view.players, id))
    .join(', ');

  return (
    <div
      data-testid="spy-phase-finished"
      className="flex-1 flex flex-col min-h-0"
    >
      {/* Верхняя строка */}
      <div className="px-3.5 pb-2 flex items-center justify-between gap-2 shrink-0">
        <span className={`font-display text-lg font-bold ${tokens.textPrimary}`}>
          Итоги партии
        </span>
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

      {/* Прокручиваемый разбор партии */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-4 space-y-3.5">
        {/* Главный блок победителя и настоящей локации */}
        <section className={`${tokens.dossierBg} ${tokens.dossierBorder} ${tokens.cardRadius} p-4 space-y-3.5`}>
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${tokens.accentSoftBg} ${tokens.accentText}`}>
              <Trophy className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className={`font-display text-2xl font-extrabold leading-tight ${tokens.textPrimary}`}>
                {localsWon ? TEXTS.finished.localsWin : TEXTS.finished.spiesWin}
              </h1>
              <p className={`mt-0.5 text-sm ${tokens.textSecondary}`}>
                {TEXTS.finished.reasons[summary.reason]}
              </p>
            </div>
          </div>

          <div className={`border-t ${tokens.borderSubtle}`} />

          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tokens.surfaceMutedBg} ${tokens.textPrimary}`}>
                <LocationIcon icon={summary.location.icon} className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className={`text-[13px] ${tokens.textMuted}`}>
                  {TEXTS.finished.realLocationLabel}
                </p>
                <p className={`text-base font-bold leading-snug break-words ${tokens.textPrimary}`}>
                  {summary.location.name}
                </p>
              </div>
            </div>

            <div>
              <p className={`text-[13px] ${tokens.textMuted}`}>
                {TEXTS.finished.spiesLabel}
              </p>
              <p className={`text-sm font-bold break-words ${tokens.textPrimary}`}>
                {spyNames || '—'}
              </p>
            </div>
          </div>
        </section>

        {/* Таблица мест, ролей и очков */}
        <section className="space-y-2">
          <div className="px-1 space-y-0.5">
            <h2 className={`text-sm font-bold inline-flex items-center gap-1.5 ${tokens.textPrimary}`}>
              <Award className="w-4 h-4" aria-hidden="true" />
              <span>{TEXTS.finished.rolesHeading}</span>
            </h2>
            <p className={`text-[13px] ${tokens.textMuted}`}>
              {TEXTS.finished.pointsFormula}
            </p>
          </div>

          <ul
            data-testid="spy-players"
            className={`${tokens.surfaceBg} ${tokens.cardRadius} overflow-hidden`}
          >
            {summary.places.map((row) => {
              const p = view.players.find((pl) => pl.id === row.playerId);
              if (!p) return null;
              const isMe = p.id === view.me.playerId;
              const isSpyRole = p.reveal?.kind === 'spy';
              const roleLabel = isSpyRole
                ? TEXTS.finished.spyRoleBadge
                : p.reveal?.kind === 'local'
                  ? p.reveal.role
                  : 'Житель';

              return (
                <li
                  key={p.id}
                  data-testid={`spy-player-${p.id}`}
                  className={`px-3.5 py-2.5 flex items-center justify-between gap-2.5 border-b ${tokens.borderSubtle} last:border-b-0 ${
                    isMe ? tokens.accentSoftBg : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className={`font-mono tabular-nums text-sm font-bold w-6 shrink-0 ${tokens.accentText}`}>
                      #{row.place}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-sm font-bold truncate ${tokens.textPrimary}`}>
                          {p.nickname}
                        </span>
                        {isMe && (
                          <span className={`text-[13px] font-medium shrink-0 ${tokens.accentText}`}>
                            · {TEXTS.common.youTag}
                          </span>
                        )}
                      </div>
                      <p className={`text-[13px] leading-snug break-words ${isSpyRole ? tokens.dangerText : tokens.textSecondary}`}>
                        {roleLabel}
                        {p.status === 'out' ? ` · ${TEXTS.common.outTag}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className={`font-mono tabular-nums text-sm font-bold shrink-0 px-2.5 py-1 ${tokens.surfaceMutedBg} ${tokens.controlRadius} ${tokens.textPrimary}`}>
                    +{row.points}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Кнопки ведущего или статус ожидания */}
      <div className={`px-3.5 pt-2.5 pb-3.5 pb-safe border-t ${tokens.borderSubtle} ${tokens.surfaceBg} space-y-2`}>
        {view.me.isHost ? (
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              data-testid="spy-play-again"
              disabled={pendingCommand}
              onClick={() => onSend({ type: 'START_GAME' })}
              className={`min-h-[52px] w-full px-4 inline-flex items-center justify-center gap-2 text-sm font-bold ${tokens.primaryBtn} ${tokens.primaryBtnText} ${tokens.controlRadius}`}
            >
              <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">{TEXTS.finished.playAgain}</span>
            </button>
            <button
              type="button"
              data-testid="spy-leave-game"
              disabled={pendingCommand}
              onClick={() => onSend({ type: 'LEAVE' })}
              className={`min-h-[46px] w-full px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius}`}
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">{TEXTS.finished.chooseAnotherGame}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className={`p-3 text-center text-[13px] font-medium ${tokens.surfaceMutedBg} ${tokens.controlRadius} ${tokens.textSecondary}`}>
              {TEXTS.finished.waitingHostRestart}
            </div>
            <button
              type="button"
              data-testid="spy-leave-game"
              disabled={pendingCommand}
              onClick={() => onSend({ type: 'LEAVE' })}
              className={`min-h-[44px] w-full inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold ${tokens.textSecondary} hover:underline`}
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{TEXTS.finished.chooseAnotherGame}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
