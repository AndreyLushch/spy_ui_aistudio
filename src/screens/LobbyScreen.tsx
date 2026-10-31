import React from 'react';
import { Clock, HelpCircle, LogOut, Map, Minus, Play, Plus, ShieldAlert, Users } from 'lucide-react';
import { SpyCommand, SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { PlayersList } from '../components/PlayersList';

interface LobbyScreenProps {
  view: SpyPlayerView;
  tokens: StyleTokens;
  pendingCommand?: boolean;
  onSend: (cmd: SpyCommand) => void;
  onOpenLocations: () => void;
  onOpenRules: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  view,
  tokens,
  pendingCommand = false,
  onSend,
  onOpenLocations,
  onOpenRules,
}) => {
  const { settings, players, me, spiesTotal } = view;
  const canStart = me.isHost && players.length >= 3 && !pendingCommand;
  const currentPackName =
    settings.packs.find((p) => p.id === settings.packId)?.name ?? settings.packs[0]?.name ?? '';

  return (
    <div
      data-testid="spy-phase-lobby"
      className="flex-1 flex flex-col min-h-0"
    >
      {/* Шапка лобби */}
      <div className="px-3.5 pb-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className={`font-display text-2xl font-extrabold tracking-tight ${tokens.textPrimary}`}>
            {TEXTS.common.gameTitle}
          </h1>
          <p className={`text-[13px] truncate ${tokens.textSecondary}`}>
            {TEXTS.common.gameSubtitle}
          </p>
        </div>

        <button
          type="button"
          data-testid="spy-rules-button"
          onClick={onOpenRules}
          aria-label={TEXTS.common.rulesBtnLabel}
          className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} shrink-0`}
        >
          <HelpCircle className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Прокручиваемое тело лобби */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-4 space-y-3.5">
        {/* Блок параметров партии */}
        <section className={`${tokens.surfaceBg} ${tokens.cardRadius} p-3.5 space-y-3.5`}>
          {/* Состав и ориентировочное время */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm font-bold">
              <ShieldAlert className={`w-4 h-4 shrink-0 ${tokens.accentText}`} aria-hidden="true" />
              <span className={tokens.textPrimary}>{TEXTS.lobby.spiesCountLabel(spiesTotal)}</span>
            </div>
            <div className={`inline-flex items-center gap-1 text-[13px] font-semibold tabular-nums ${tokens.textSecondary}`}>
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{TEXTS.lobby.estimatedTime(settings.estimatedMinutes)}</span>
            </div>
          </div>

          <p className={`text-[13px] leading-snug ${tokens.textMuted}`}>
            {TEXTS.lobby.spiesRuleHint}
          </p>

          <div className={`border-t ${tokens.borderSubtle}`} />

          {/* Набор локаций */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="spy-pack-select"
                className={`text-[13px] font-semibold ${tokens.textSecondary}`}
              >
                {TEXTS.lobby.packLabel}
              </label>
              <button
                type="button"
                data-testid="spy-open-locations"
                onClick={onOpenLocations}
                className={`min-h-[36px] px-2 inline-flex items-center gap-1 text-[13px] font-semibold underline underline-offset-4 ${tokens.accentText}`}
              >
                <Map className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Смотреть ({view.locations.length})</span>
              </button>
            </div>

            {me.isHost ? (
              <select
                id="spy-pack-select"
                value={settings.packId}
                disabled={pendingCommand}
                onChange={(e) => onSend({ type: 'SET_SETTINGS', packId: e.target.value })}
                className={`w-full min-h-[46px] px-3 text-sm font-semibold ${tokens.surfaceMutedBg} ${tokens.textPrimary} ${tokens.controlRadius} border ${tokens.borderSubtle} focus:outline-none focus:ring-2`}
              >
                {settings.packs.map((pack) => (
                  <option key={pack.id} value={pack.id}>
                    {pack.name}
                  </option>
                ))}
              </select>
            ) : (
              <div
                id="spy-pack-select"
                className={`w-full min-h-[44px] px-3 flex items-center text-sm font-semibold ${tokens.surfaceMutedBg} ${tokens.textPrimary} ${tokens.controlRadius}`}
              >
                {currentPackName}
              </div>
            )}
          </div>

          {/* Число раундов */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-sm font-semibold ${tokens.textPrimary}`}>
                {TEXTS.lobby.roundsLabel}
              </p>
              <p className={`text-[13px] ${tokens.textMuted}`}>
                От {settings.minRounds} до {settings.maxRounds} кругов по столу
              </p>
            </div>

            {me.isHost ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  aria-label="Уменьшить число раундов"
                  disabled={pendingCommand || settings.rounds <= settings.minRounds}
                  onClick={() => onSend({ type: 'SET_SETTINGS', rounds: settings.rounds - 1 })}
                  className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} disabled:opacity-40`}
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <span
                  className={`w-8 text-center font-display text-lg font-bold tabular-nums ${tokens.textPrimary}`}
                >
                  {settings.rounds}
                </span>
                <button
                  type="button"
                  aria-label="Увеличить число раундов"
                  disabled={pendingCommand || settings.rounds >= settings.maxRounds}
                  onClick={() => onSend({ type: 'SET_SETTINGS', rounds: settings.rounds + 1 })}
                  className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} disabled:opacity-40`}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <span className={`font-display text-lg font-bold tabular-nums px-3 py-1.5 ${tokens.surfaceMutedBg} ${tokens.controlRadius}`}>
                {settings.rounds}
              </span>
            )}
          </div>
        </section>

        {/* Список участников */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className={`text-sm font-bold inline-flex items-center gap-1.5 ${tokens.textPrimary}`}>
              <Users className="w-4 h-4" aria-hidden="true" />
              <span>{TEXTS.lobby.playersHeading}</span>
            </h2>
            <span className={`text-[13px] font-mono tabular-nums font-semibold ${tokens.textSecondary}`}>
              {players.length} / 15
            </span>
          </div>

          <PlayersList
            players={players}
            myPlayerId={me.playerId}
            showHostBadge
            tokens={tokens}
          />
        </section>
      </div>

      {/* Нижняя панель старта / ожидания */}
      <div className={`px-3.5 pt-2.5 pb-3.5 pb-safe border-t ${tokens.borderSubtle} ${tokens.surfaceBg} space-y-2`}>
        {me.isHost ? (
          <>
            <button
              type="button"
              data-testid="spy-start-game"
              disabled={!canStart}
              onClick={() => onSend({ type: 'START_GAME' })}
              className={`min-h-[52px] w-full px-4 inline-flex items-center justify-center gap-2 text-base font-bold transition-transform ${
                tokens.controlRadius
              } ${
                canStart
                  ? `${tokens.primaryBtn} ${tokens.primaryBtnText}`
                  : `${tokens.surfaceMutedBg} ${tokens.textMuted} opacity-65 cursor-not-allowed`
              }`}
            >
              <Play className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">
                {players.length < 3 ? TEXTS.lobby.needMorePlayers : TEXTS.lobby.startGame}
              </span>
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <div
              className={`min-h-[50px] px-4 flex flex-col items-center justify-center text-center ${tokens.surfaceMutedBg} ${tokens.controlRadius}`}
            >
              <span className={`text-sm font-bold ${tokens.textPrimary}`}>
                {TEXTS.lobby.waitingForHost}
              </span>
              <span className={`text-[13px] ${tokens.textMuted}`}>
                {TEXTS.lobby.waitingHint}
              </span>
            </div>
            <button
              type="button"
              data-testid="spy-leave-game"
              onClick={() => onSend({ type: 'LEAVE' })}
              className={`min-h-[44px] w-full inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold ${tokens.textSecondary} hover:underline`}
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{TEXTS.lobby.leaveRoom}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
