import test from 'node:test';
import assert from 'node:assert/strict';
import { MockAdapter } from './MockAdapter';
import {
  calculateEstimatedMinutes,
  calculateSpiesCount,
  calculateSupportNeeded,
  isSpyPerspective,
  isVoteSuccessful,
} from '../utils/viewHelpers';

test('состав шпионов: 3–8 игроков -> 1 шпион, 9–15 игроков -> 2 шпиона', () => {
  assert.equal(calculateSpiesCount(3), 1);
  assert.equal(calculateSpiesCount(8), 1);
  assert.equal(calculateSpiesCount(9), 2);
  assert.equal(calculateSpiesCount(15), 2);

  const adapter8 = new MockAdapter({ playerCount: 8, autoSimulateBots: false });
  assert.equal(adapter8.getView().spiesTotal, 1);

  const adapter12 = new MockAdapter({ playerCount: 12, autoSimulateBots: false });
  adapter12.send({ type: 'START_GAME' });
  assert.equal(adapter12.getView().spiesTotal, 2);
  assert.equal(adapter12.getView().spiesInGame, 2);
});

test('расчёт времени партии зависит от раундов и числа игроков', () => {
  assert.equal(calculateEstimatedMinutes(4, 8, 4, 56), 32);
  assert.equal(calculateEstimatedMinutes(3, 5, 4, 56), 15);
});

test('раздача: карта открыта только во время просмотра, есть ровно 1 повторный показ, симметрия житель/шпион', () => {
  const adapter = new MockAdapter({ playerCount: 6, autoSimulateBots: false, seed: 101 });
  adapter.send({ type: 'START_GAME' });

  const { localId, spyId } = adapter.findFirstLocalAndSpyIds();
  const localDeal = adapter.getViewForPlayer(localId);
  const spyDeal = adapter.getViewForPlayer(spyId);

  assert.equal(localDeal.phase, 'deal');
  assert.equal(spyDeal.phase, 'deal');
  assert.equal(localDeal.me.card?.kind, 'local');
  assert.equal(spyDeal.me.card?.kind, 'spy');
  assert.equal(localDeal.timers.secondsLeft, spyDeal.timers.secondsLeft);

  // Ни у кого нет reveal на раздаче
  assert.equal(localDeal.players.some((p) => p.reveal !== undefined), false);
  assert.equal(spyDeal.players.some((p) => p.reveal !== undefined), false);

  // Скрываем карту и проверяем отсутствие поля me.card
  adapter.sendForPlayer(localId, { type: 'HIDE_CARD' });
  const afterHide = adapter.getViewForPlayer(localId);
  assert.equal(afterHide.me.card, undefined);
  assert.equal(afterHide.me.cardRevealsLeft, 1);

  // Повторный показ работает ровно 1 раз
  adapter.sendForPlayer(localId, { type: 'SHOW_CARD_AGAIN' });
  assert.equal(adapter.getViewForPlayer(localId).me.card?.kind, 'local');
  assert.equal(adapter.getViewForPlayer(localId).me.cardRevealsLeft, 0);

  adapter.sendForPlayer(localId, { type: 'HIDE_CARD' });
  adapter.sendForPlayer(localId, { type: 'SHOW_CARD_AGAIN' });
  assert.equal(adapter.getViewForPlayer(localId).me.card, undefined);
});

test('ход: экраны жителя и шпиона идентичны по can и табло, а роль не утекает через me.card', () => {
  const adapter = new MockAdapter({ playerCount: 6, autoSimulateBots: false, seed: 202 });
  adapter.send({ type: 'START_GAME' });
  for (const p of adapter.getInternalState().players) {
    adapter.sendForPlayer(p.id, { type: 'READY' });
  }

  const { localId, spyId } = adapter.findFirstLocalAndSpyIds();
  const localTurn = adapter.getViewForPlayer(localId);
  const spyTurn = adapter.getViewForPlayer(spyId);

  assert.equal(localTurn.phase, 'turn');
  assert.equal(localTurn.me.card, undefined);
  assert.equal(spyTurn.me.card, undefined);
  assert.equal(isSpyPerspective(localTurn), false);
  assert.equal(isSpyPerspective(spyTurn), true);
  assert.deepEqual(localTurn.can, spyTurn.can);
});

test('обвинение жителя: порог поддержки 30%, штраф при ложном обвинении невиновного', () => {
  assert.equal(calculateSupportNeeded(7), 3); // ceil(7 * 0.3) = 3
  assert.equal(isVoteSuccessful(4, 7), true);
  assert.equal(isVoteSuccessful(3, 6), false); // нужно строго больше половины

  const adapter = new MockAdapter({ playerCount: 6, autoSimulateBots: false, seed: 303 });
  adapter.send({ type: 'START_GAME' });
  for (const p of adapter.getInternalState().players) {
    adapter.sendForPlayer(p.id, { type: 'READY' });
  }
  adapter.tick(4); // Проходим паузу внимания -> questions

  const state = adapter.getInternalState();
  const locals = state.players.filter((p) => !state.spyIds.includes(p.id)).map((p) => p.id);
  const accuser = locals[0];
  const innocentTarget = locals[1];
  const supporter = locals[2];

  adapter.sendForPlayer(accuser, { type: 'ACCUSE', targetId: innocentTarget });
  // При 6 игроках кроме цели остаётся 5 -> ceil(5 * 0.3) = 2 (обвинитель уже 1, нужен ещё 1)
  assert.equal(adapter.getViewForPlayer(accuser).accusation?.stage, 'support');
  assert.equal(adapter.getViewForPlayer(accuser).accusation?.supportNeeded, 2);

  adapter.sendForPlayer(supporter, { type: 'SUPPORT', support: true });
  assert.equal(adapter.getViewForPlayer(accuser).accusation?.stage, 'vote');

  // Все 5 голосующих ошибочно голосуют «Шпион» против невиновного жителя
  for (const p of state.players) {
    if (p.id !== innocentTarget) {
      adapter.sendForPlayer(p.id, { type: 'VOTE', vote: 'spy' });
    }
  }

  const resView = adapter.getViewForPlayer(accuser);
  assert.equal(resView.voteResult?.text, 'innocent');
  // Невиновный остаётся в игре, а обвинитель и поддержавший получают штраф до раунда 3 (конец следующего раунда)
  assert.equal(resView.players.find((p) => p.id === innocentTarget)?.status, 'in');
  assert.equal(resView.me.penaltyUntilRound, 3);
  assert.equal(adapter.getViewForPlayer(supporter).me.penaltyUntilRound, 3);
});

test('шпион под голосованием сохраняет доступ к «Назвать» и «Ва-банк» и побеждает при верной локации', () => {
  const adapter = new MockAdapter({ playerCount: 5, autoSimulateBots: false, seed: 404 });
  adapter.send({ type: 'START_GAME' });
  for (const p of adapter.getInternalState().players) {
    adapter.sendForPlayer(p.id, { type: 'READY' });
  }
  adapter.tick(4);

  const state = adapter.getInternalState();
  const { localId, spyId } = adapter.findFirstLocalAndSpyIds();
  const anotherLocal = state.players.find((p) => p.id !== localId && p.id !== spyId)!.id;

  adapter.sendForPlayer(localId, { type: 'ACCUSE', targetId: spyId });
  adapter.sendForPlayer(anotherLocal, { type: 'SUPPORT', support: true });

  const spyUnderVote = adapter.getViewForPlayer(spyId);
  assert.equal(spyUnderVote.accusation?.stage, 'vote');
  assert.equal(spyUnderVote.can.name, true);
  assert.equal(spyUnderVote.can.allIn, true);

  // Шпион угадывает настоящую локацию и выигрывает партию (+2 очка: +1 команде, +1 за угаданную локацию)
  adapter.sendForPlayer(spyId, { type: 'GUESS_LOCATION', locationId: state.realLocationId });
  const finished = adapter.getViewForPlayer(spyId);
  assert.equal(finished.phase, 'finished');
  assert.equal(finished.finishedSummary?.winner, 'spies');
  assert.equal(finished.finishedSummary?.reason, 'location_guessed');
  const spyPlace = finished.finishedSummary?.places.find((pl) => pl.playerId === spyId);
  assert.equal(spyPlace?.points, 2);
});
