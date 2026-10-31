import React from 'react';
import { Crown, Mic, UserX, WifiOff } from 'lucide-react';
import { SpyPlayer } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';

interface PlayersListProps {
  players: SpyPlayer[];
  myPlayerId: string;
  activePlayerId?: string;
  showHostBadge?: boolean;
  tokens: StyleTokens;
}

export const PlayersList: React.FC<PlayersListProps> = ({
  players,
  myPlayerId,
  activePlayerId,
  showHostBadge = false,
  tokens,
}) => {
  return (
    <ul
      data-testid="spy-players"
      aria-label="Список игроков"
      className={`${tokens.surfaceBg} ${tokens.cardRadius} overflow-hidden`}
    >
      {players.map((player, index) => {
        const isMe = player.id === myPlayerId;
        const isActive = player.id === activePlayerId && player.status === 'in';
        const isOut = player.status === 'out';

        return (
          <li
            key={player.id}
            data-testid={`spy-player-${player.id}`}
            className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 min-h-[46px] border-b ${tokens.borderSubtle} last:border-b-0 ${
              isActive ? tokens.accentSoftBg : ''
            } ${isOut ? 'opacity-55' : ''}`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span
                className={`font-mono tabular-nums text-[13px] w-5 shrink-0 ${tokens.textMuted}`}
              >
                {index + 1}.
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`text-sm font-semibold truncate ${
                      isOut ? 'line-through' : ''
                    } ${tokens.textPrimary}`}
                    title={player.nickname}
                  >
                    {player.nickname}
                  </span>

                  {isMe && (
                    <span className={`text-[13px] font-medium shrink-0 ${tokens.accentText}`}>
                      · {TEXTS.common.youTag}
                    </span>
                  )}
                </div>

                {(showHostBadge && player.isHost) || player.isOffline ? (
                  <div className={`flex flex-wrap items-center gap-1.5 text-[13px] ${tokens.textMuted}`}>
                    {showHostBadge && player.isHost && (
                      <span className="inline-flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{TEXTS.common.hostTag}</span>
                      </span>
                    )}
                    {showHostBadge && player.isHost && player.isOffline && (
                      <span aria-hidden="true">·</span>
                    )}
                    {player.isOffline && (
                      <span className={`inline-flex items-center gap-1 ${tokens.dangerText}`}>
                        <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{TEXTS.common.offlineTag}</span>
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-[13px] font-medium">
              {isOut ? (
                <span className={`inline-flex items-center gap-1 ${tokens.textMuted}`}>
                  <UserX className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{TEXTS.common.outTag}</span>
                </span>
              ) : isActive ? (
                <span className={`inline-flex items-center gap-1 font-semibold ${tokens.accentText}`}>
                  <Mic className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>ходит</span>
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
