// Rodar: npm run check:merge
import assert from "node:assert/strict";
import { test } from "node:test";
import { isBlank, merge, sameProgress } from "./merge.ts";
import type { State, Trail } from "./types.ts";

const trail = (id: string, key: string, done: number, example = false): Trail =>
  ({ id, topic: key, key, level: "", concepts: [], sources: [], example, done });
const state = (p: Partial<State>): State =>
  ({ trails: [trail("ex", "exemplo", 0, true)], active: "ex", xp: 0, streak: 0, lastDay: null, cards: {}, updatedAt: 0, ...p });

test("estado novo está em branco; com XP já não", () => {
  assert.equal(isBlank(state({})), true);
  assert.equal(isBlank(state({ xp: 10 })), false);
  assert.equal(isBlank(state({ trails: [trail("a", "pessoa", 0)] })), false);
});

test("ordem das chaves e hora da mudança não contam como diferença", () => {
  const a = state({ xp: 5, cards: { x: { box: 1, due: 1 }, y: { box: 2, due: 2 } }, updatedAt: 1 });
  const b = state({ xp: 5, cards: { y: { box: 2, due: 2 }, x: { box: 1, due: 1 } }, updatedAt: 9 });
  assert.equal(sameProgress(a, b), true);
  assert.equal(sameProgress(a, state({ xp: 6 })), false);
});

test("juntar fica com o mais avançado de cada lado", () => {
  const local = state({ trails: [trail("l2", "roma", 1), trail("l1", "pessoa", 3)], active: "l1", xp: 40, streak: 1, lastDay: "2026-10-03", cards: { c: { box: 3, due: 0 } } });
  const conta = state({ trails: [trail("r1", "pessoa", 1)], active: "r1", xp: 90, streak: 4, lastDay: "2026-10-04", cards: { c: { box: 1, due: 0 }, d: { box: 0, due: 0 } } });
  const m = merge(local, conta);
  assert.deepEqual(m.trails.map((t) => `${t.key}:${t.done}`).sort(), ["pessoa:3", "roma:1"]);
  assert.equal(m.active, "l1"); // a trilha aberta na conta (r1) foi substituída pela local, mais avançada
  assert.equal(m.xp, 90);
  assert.equal(m.streak, 4);
  assert.equal(m.lastDay, "2026-10-04");
  assert.deepEqual(m.cards, { c: { box: 3, due: 0 }, d: { box: 0, due: 0 } });
});
