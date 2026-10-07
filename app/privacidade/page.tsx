import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT } from "@/lib/legal";

export const metadata: Metadata = { title: "Política de privacidade · NOOBrain" };

export default function Page() {
  return (
    <LegalPage title="Política de privacidade">
      <p>O NOOBrain é uma app para aprender qualquer tema, feita pela NOOBjects. Esta página explica, em linguagem simples, que dados usamos e porquê.</p>

      <h2>A tua conta</h2>
      <p>Para usar o NOOBrain precisas de conta (e de ter pelo menos 13 anos). Guardamos:</p>
      <ul>
        <li>o teu e-mail e a tua palavra-passe (esta fica cifrada; nós nunca a vemos). Se entrares com o Google, a Apple ou o Discord, recebemos o e-mail e os dados básicos de perfil (nome e foto, se os tiveres); nunca recebemos a tua palavra-passe dessas contas, e a Apple pode esconder o teu e-mail verdadeiro;</li>
        <li>o teu progresso, para o poderes continuar em qualquer aparelho.</li>
      </ul>
      <p>Estes dados ficam no Supabase, num servidor em Paris (União Europeia), protegidos de forma a que cada pessoa só aceda aos seus.</p>

      <h2>Perfil público</h2>
      <p>O teu @nome, o nome a mostrar, o avatar, a descrição e as estatísticas (XP, sequência, temas concluídos) ficam num perfil que outras pessoas podem ver. Não uses o teu nome verdadeiro se não quiseres. Podes apagar a conta nas Definições e tudo desaparece.</p>

      <h2>O que sai da app para gerar as lições</h2>
      <ul>
        <li><b>Temas e perguntas ao tutor</b> são enviados a um serviço de inteligência artificial (Groq) para criar trilhas, lições e respostas. O Groq é nosso subcontratante: os dados são processados nos EUA e no Reino Unido e não são usados para treinar modelos. Mesmo assim, não escrevas dados pessoais nos temas nem nas perguntas.</li>
        <li><b>Pesquisas nas wikis</b> (Wikipédia, Wikilivros, Wikiversidade e Wikisource) usam o tema que escreveste para encontrar fontes abertas.</li>
        <li><b>«Reportar erro»</b> guarda o texto que escreveres nesse formulário, ligado à tua conta, e só nós o lemos.</li>
        <li><b>Catálogo partilhado:</b> as trilhas e lições geradas ficam guardadas para servirem a toda a gente. Guardamos o tema e o conteúdo gerado, nunca quem o pediu.</li>
        <li><b>Contadores de uso da IA</b> (quantos pedidos fizeste por dia) são guardados durante 30 dias, para aplicar os limites diários.</li>
      </ul>

      <h2>Ideias</h2>
      <p>As ideias que partilhares no mural, e os teus votos, são públicas e aparecem com o teu @nome e avatar. Podes apagar as tuas ideias enquanto ainda não tiverem resposta, e apagar a conta remove tudo.</p>

      <h2>Ranking</h2>
      <p>O teu nome, avatar e XP da semana aparecem no ranking. Podes sair dele nas Definições a qualquer momento.</p>

      <h2>Lembretes</h2>
      <p>Se ligares os lembretes, guardamos a subscrição do teu aparelho (um endereço técnico do navegador e o teu fuso horário) para te enviar avisos de revisão. Podes desligá-los nas Definições e a subscrição é apagada.</p>

      <h2>Dados técnicos</h2>
      <p>O site é alojado na Vercel (funções em Paris). O teu endereço IP é usado por curtos instantes, em memória, para limitar o número de pedidos por pessoa e evitar abusos. A Vercel pode registar dados técnicos normais de qualquer site (como o endereço IP e o tipo de navegador).</p>

      <h2>Armazenamento no navegador e lembretes</h2>
      <p>Usamos o armazenamento do navegador (localStorage) para guardar o teu progresso e preferências, e uma sessão para o início de sessão. Não usamos cookies de publicidade nem de rastreio. Os lembretes são opcionais e só funcionam se deres permissão ao navegador.</p>

      <h2>O que não fazemos</h2>
      <p>Não vendemos os teus dados, não mostramos anúncios e não criamos perfis comerciais.</p>

      <h2>Os teus direitos</h2>
      <p>Podes pedir acesso, correção ou eliminação dos teus dados, incluindo o apagamento da conta. Escreve para <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. Podes também apresentar queixa à autoridade de proteção de dados do teu país (em Portugal, a CNPD).</p>

      <h2>Crianças</h2>
      <p>A app não se destina a menores de 13 anos. Se tens menos de 13, usa-a só com a ajuda de um adulto responsável.</p>

      <h2>Alterações</h2>
      <p>Se esta política mudar, atualizamos a data no topo da página.</p>
    </LegalPage>
  );
}
