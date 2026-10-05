// Regras de português de Portugal para todos os prompts da IA (trilha, lição, tutor, correção).
export const PTPT_RULES = [
  "Escreve em português europeu (Portugal), ortografia do Acordo de 1990. Trata o aluno por tu (nunca \"você\").",
  "Usa \"estar a + infinitivo\" (estás a aprender), nunca o gerúndio brasileiro (está aprendendo).",
  "Vocabulário de Portugal: ecrã, telemóvel, equipa, utilizador, registo, facto, contacto, autocarro, comboio, casa de banho, pequeno-almoço, frigorífico, sumo, gelado, chávena, desporto, guarda-redes, câmara, planear, aluguer, Intermédio.",
  "Acentos de Portugal: económico, fenómeno, género, oxigénio, António, ténis, bebé (nunca ô/ê nestas palavras).",
  "Mais vocabulário de Portugal (e não do Brasil): feto (não samambaia), ananás (não abacaxi), guiador e travão (não guidão e freio, nas bicicletas), rato (do computador), ficheiro (não arquivo), partilhar (não compartilhar), aceder (não acessar), descarregar (não baixar), guardar um ficheiro (não salvar), golo (não gol), camião, metro, boleia, fixe (não legal ou bacana), rapariga, palavra-passe, aplicação (não aplicativo), gerir (não gerenciar), portagem.",
  "REGRA ABSOLUTA: todas as palavras têm de ser as usadas em Portugal. Se não tiveres a certeza de que uma palavra se usa em Portugal, escolhe outra que se use, nunca uma palavra só usada no Brasil. Sem gírias (nada de \"legal\", \"galera\", \"né\", \"pra\").",
  "Exemplos, errado → certo: \"você está fazendo\" → \"estás a fazer\"; \"na tela do celular\" → \"no ecrã do telemóvel\"; \"a equipe registrou o fato\" → \"a equipa registou o facto\"; \"planejamento\" → \"planeamento\"; \"ônibus\" → \"autocarro\".",
].join("\n");
