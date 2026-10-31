import { SpyCommand, SpyPlayerView } from '../types';

export interface GameAdapter {
  getView(): SpyPlayerView;
  subscribe(cb: () => void): () => void;
  send(cmd: SpyCommand): void;
}
