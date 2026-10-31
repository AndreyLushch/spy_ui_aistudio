import React from 'react';
import { motion } from 'motion/react';
import { Mic, Users, WifiOff } from 'lucide-react';
import { SpyCommand, SpyPlayerView } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { getPlayerNickname } from '../utils/viewHelpers';
import { Scoreboard } from '../components/Scoreboard';
import { PlayersList } from '../components/PlayersList';
import { ActionButtons } from '../components/ActionButtons';
import { NoticeBanner } from './NoticeBanner';
import { SupportOverlay } from './SupportOverlay';
import { VoteOverlay } from './VoteOverlay';
import { VoteResultOverlay } from './VoteResultOverlay';

interface TurnScreenProps {
  view: SpyPlayerView;
  tokens: StyleTokens;
  pendingCommand?: boolean;
  onSend: (cmd: SpyCommand) => void;
  onOpenLocations: () => void;
  onOpenRules: () => void;
  onPressName: () => void;
  onPressAllIn: () => void;
  onPressHint: () => void;
}

export const TurnScreen: React.FC<TurnScreenProps> = ({
  view,
  tokens,
  pendingCommand = false,
  onSend,
  onOpenLocations,
  onOpenRules,
  onPressName,
  onPressAllIn,
  onPressHint,
}) => {
  const isAttentionPause =
    view.turnStep === 'attention' && !view.accusation && !view.voteResult;
  const activeName = getPlayerNickname(view.players, view.activePlayerId);
  const isMyTurn = view.activePlayerId === view.me.playerId;
  const activePlayer = view.players.find((p) => p.id === view.activePlayerId);

  return (
    <div
      data-testid="spy-phase-turn"
      className="flex-1 flex flex-col min-h-0"
    >
      {/* Табло раунда и хода */}
      <div className="px-3.5 pb-2.5 shrink-0">
        <Scoreboard
          view={view}
          tokens={tokens}
          onOpenLocations={onOpenLocations}
          onOpenRules={onOpenRules}
        />
      </div>

      {/* Центральная зона: пауза внимания ИЛИ ход/оверлеи + список стола */}
      {isAttentionPause ? (
        <div className="flex-1 flex flex-col justify-center px-3.5 pb-4 overflow-y-auto">
          <motion.section
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`${tokens.dossierBg} ${tokens.dossierBorder} ${tokens.cardRadius} p-6 text-center space-y-3`}
          >
            <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${tokens.accentSoftBg} ${tokens.accentText}`}>
              <Mic className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className={`text-[13px] font-bold ${tokens.dossierStampText}`}>
              {TEXTS.turn.attentionBadge} · {TEXTS.turn.roundOf(view.round, view.settings.rounds)}
            </p>
            <h1 className={`font-display text-2xl font-extrabold leading-tight break-words text-balance ${tokens.textPrimary}`}>
              {isMyTurn ? TEXTS.turn.yourTurnHeadline : TEXTS.turn.askingNow(activeName)}
            </h1>
            <p className={`text-sm leading-relaxed ${tokens.textSecondary}`}>
              {isMyTurn ? TEXTS.turn.yourTurnSubline : TEXTS.turn.otherTurnSubline}
            </p>
            {activePlayer?.isOffline && (
              <p className={`pt-1 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold ${tokens.dangerText}`}>
                <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{TEXTS.turn.activeOfflineNote}</span>
              </p>
            )}
          </motion.section>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3.5 pb-4 space-y-3">
          <NoticeBanner notices={view.notices} tokens={tokens} />

          {view.voteResult && <VoteResultOverlay view={view} tokens={tokens} />}

          {!view.voteResult && view.accusation?.stage === 'support' && (
            <SupportOverlay
              view={view}
              tokens={tokens}
              pendingCommand={pendingCommand}
              onSend={onSend}
            />
          )}

          {!view.voteResult && view.accusation?.stage === 'vote' && (
            <VoteOverlay
              view={view}
              tokens={tokens}
              pendingCommand={pendingCommand}
              onSend={onSend}
            />
          )}

          <section className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <h2 className={`text-[13px] font-bold inline-flex items-center gap-1.5 ${tokens.textSecondary}`}>
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                <span>За столом</span>
              </h2>
              <span className={`text-[13px] tabular-nums ${tokens.textMuted}`}>
                В игре: {view.players.filter((p) => p.status === 'in').length} из {view.players.length}
              </span>
            </div>

            <PlayersList
              players={view.players}
              myPlayerId={view.me.playerId}
              activePlayerId={view.activePlayerId}
              tokens={tokens}
            />
          </section>
        </div>
      )}

      {/* Нижние три кнопки под большим пальцем (всегда на своём месте, в том числе под голосованием) */}
      <ActionButtons
        view={view}
        tokens={tokens}
        pendingCommand={pendingCommand}
        onPressName={onPressName}
        onPressAllIn={onPressAllIn}
        onPressHint={onPressHint}
      />
    </div>
  );
};
