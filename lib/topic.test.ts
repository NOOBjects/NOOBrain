// Rodar: npm run check:topic
import assert from "node:assert/strict";
import { test } from "node:test";
import { sameTopic, topicKey } from "./topic.ts";

test("mesmo assunto", () => {
  assert.ok(sameTopic("Fernando Pessoa", "Fernando Pessoa poeta"));
  assert.ok(sameTopic("Fernando Pessoa", "o poeta Fernando Pessoa"));
  assert.ok(sameTopic("Fotossíntese", "O que é a fotossíntese"));
  assert.ok(sameTopic("Revolução Francesa", "revolucao francesa"));
  assert.ok(sameTopic("Git básico", "git"));
  assert.ok(sameTopic("Revolução Francesa", "Revolução Francsa")); // erro de digitação
});

test("assuntos diferentes", () => {
  assert.ok(!sameTopic("Juros compostos", "Juros simples"));
  assert.ok(!sameTopic("Fernando Pessoa", "Fernando Pessoa Mensagem"));
  assert.ok(!sameTopic("Revolução Francesa", "Revolução Industrial"));
});

test("chave estável e nunca vazia", () => {
  assert.equal(topicKey("Poeta"), "poeta");
  assert.equal(topicKey("  Juros   Compostos "), topicKey("compostos juros"));
});
