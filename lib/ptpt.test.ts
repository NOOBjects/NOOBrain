import { test } from "node:test";
import assert from "node:assert/strict";
import { ptpt, ptptDeep } from "./ptpt.ts";

test("troca grafias brasileiras e castelhanas", () => {
  assert.equal(ptpt("A excitação de electrones e a transferencia de energia."), "A excitação de eletrões e a transferência de energia.");
  assert.equal(ptpt("O oxigênio é liberado."), "O oxigénio é libertado.");
  assert.equal(ptpt("Um fenômeno econômico e atômico."), "Um fenómeno económico e atómico.");
  assert.equal(ptpt("Elétrons e prótons"), "Eletrões e protões");
});

test("não mexe em palavras certas nem em pedaços de palavras", () => {
  assert.equal(ptpt("A membrana celular e a libertação."), "A membrana celular e a libertação.");
  assert.equal(ptpt("Liberdade e liberal."), "Liberdade e liberal.");
  assert.equal(ptpt("O estômago e o contactar."), "O estômago e o contactar.");
  assert.equal(ptpt("Treme o tremor."), "Treme o tremor.");
});

test("Por que no início de pergunta", () => {
  assert.equal(ptpt("Por que a água é necessária?"), "Porque é que a água é necessária?");
  assert.equal(ptpt("Por que razão a água é necessária?"), "Por que razão a água é necessária?");
  assert.equal(ptpt("Explica. Por que existe?"), "Explica. Porque é que existe?");
});

test("percorre objetos sem mexer em números", () => {
  assert.deepEqual(ptptDeep({ q: "Por que é liberado?", answer: 2, options: ["oxigênio", "água"] }), { q: "Porque é que é libertado?", answer: 2, options: ["oxigénio", "água"] });
});

test("tira \\n e \\t literais", () => {
  assert.equal(ptpt("Olá\\nmundo"), "Olá mundo");
  assert.equal(ptpt("a\\t\\tb"), "a b");
});
