import { test } from "node:test";
import assert from "node:assert/strict";
import { foldArticle, judgeCloze } from "./cloze.ts";

test("o artigo antes do espaço sai e a resposta fica só com a palavra", () => {
  const c = foldArticle({ text: "Na bicicleta, o ___ transmite a força dos pedais.", answer: "corrente", accept: [] });
  assert.equal(c.text, "Na bicicleta, ___ transmite a força dos pedais.");
  assert.equal(c.answer, "corrente");
  assert.equal(c.bare, true);
});

test("preposições contraídas passam a preposição simples", () => {
  assert.equal(foldArticle({ text: "É dado pela ___ da roda.", answer: "rotação", accept: [] }).text, "É dado por ___ da roda.");
  assert.equal(foldArticle({ text: "Fica na ___ do quadro.", answer: "parte", accept: [] }).text, "Fica em ___ do quadro.");
});

test("não mexe quando o «a» é preposição de um verbo, nem em frases com dois espaços", () => {
  assert.equal(foldArticle({ text: "Ela começou a ___ cedo.", answer: "pedalar", accept: [] }).text, "Ela começou a ___ cedo.");
  const two = { text: "A ___ e a ___ são amigas.", answer: "x e y", accept: [] };
  assert.deepEqual(foldArticle(two), two);
});

test("aceita com ou sem artigo, sem acentos e com um erro de escrita (quase)", () => {
  const c = { text: "___ transmite.", answer: "corrente", accept: [] };
  assert.equal(judgeCloze(c, "corrente"), "ok");
  assert.equal(judgeCloze(c, "A Corrente!"), "ok");
  assert.equal(judgeCloze(c, "corente"), "near");
  assert.equal(judgeCloze(c, "travão"), "no");
  assert.equal(judgeCloze(c, ""), "no");
  assert.equal(judgeCloze({ ...c, answer: "pé" }, "pe"), "ok");
  assert.equal(judgeCloze({ ...c, answer: "pé" }, "pa"), "no"); // palavras curtas: sem tolerância
});
