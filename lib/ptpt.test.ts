import { test } from "node:test";
import assert from "node:assert/strict";
import { brMarkers, brMarkersDeep, ptpt, ptptDeep } from "./ptpt.ts";

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

test("mantém \\n dentro de código", () => {
  assert.equal(ptpt("Usa `\\n` para mudar de linha.\\nFim"), "Usa `\\n` para mudar de linha. Fim");
});

test("vocabulário novo", () => {
  assert.equal(ptpt("Café da manhã com suco e sorvete numa xícara."), "Pequeno-almoço com sumo e gelado numa chávena.");
  assert.equal(ptpt("O aluguel e o goleiro."), "O aluguer e o guarda-redes.");
  assert.equal(ptpt("A câmera e as câmeras."), "A câmara e as câmaras.");
  assert.equal(ptpt("Fazer o cadastro e cadastrar. Deletar o ficheiro."), "Fazer o registo e registar. Apagar o ficheiro.");
  assert.equal(ptpt("Planejar o planejamento planejado."), "Planear o planeamento planeado.");
  assert.equal(ptpt("Nível Intermediário."), "Nível Intermédio.");
});

test("ô/ê antes de m/n e vogal passam a ó/é", () => {
  assert.equal(ptpt("gênero, tênue, gêmeo, Amazônia, anônimo, cômodo, abdômen, Vênus, eletrônico"), "género, ténue, gémeo, Amazónia, anónimo, cómodo, abdómen, Vénus, eletrónico");
});

test("exceções do acento: estômago, fêmea, têm, vêm, ênfase, pôr, pôde, avô, pêndulo", () => {
  const t = "O estômago e a fêmea. Eles têm e vêm. Ênfase, pôr, pôde, avô, pêndulo.";
  assert.equal(ptpt(t), t);
});

test("gerúndio depois de estar, ficar, continuar e andar", () => {
  assert.equal(ptpt("Você está fazendo"), "Você está a fazer");
  assert.equal(ptpt("Estou aprendendo e estás comendo."), "Estou a aprender e estás a comer.");
  assert.equal(ptpt("Ela continua dormindo e fica esperando."), "Ela continua a dormir e fica a esperar.");
  assert.equal(ptpt("Eles andam correndo; estava indo embora."), "Eles andam a correr; estava a ir embora.");
  assert.equal(ptpt("Está andando e está sendo feito."), "Está a andar e está a ser feito.");
});

test("não são gerúndios", () => {
  const t = "Quando chegou o comando, o bando estava lindo e tremendo de frio? Está brando. O dividendo e o adendo estão horrendo.";
  assert.equal(ptpt(t), t);
});

test("brMarkers só deteta", () => {
  assert.deepEqual(brMarkers("Estás a aprender no ecrã do telemóvel."), []);
  assert.deepEqual(brMarkers("Você já viu? A gente vai."), ["você", "a gente"]);
  assert.deepEqual(brMarkers("Na tela do computador."), ["tela"]);
  assert.deepEqual(brMarkers("Liga o celular: o app mostra uma mensagem."), ["celular"]);
  assert.deepEqual(brMarkers("A membrana celular protege."), []);
  assert.deepEqual(brMarkers("Ele está fazendo."), ["está fazendo"]);
  assert.deepEqual(brMarkersDeep({ q: "Quando?", o: ["Você sabe", "ok"] }), ["você"]);
});
