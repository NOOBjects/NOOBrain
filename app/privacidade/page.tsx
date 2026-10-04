import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT } from "@/lib/legal";

export const metadata: Metadata = { title: "Política de privacidade · NOOBrain" };

export default function Page() {
  return (
    <LegalPage title="Política de privacidade">
      <p>O NOOBrain é uma app para aprender qualquer tema, feita pela NOOBjects. Esta página explica, em linguagem simples, que dados usamos e porquê.</p>

      <h2>Sem conta</h2>
      <p>Podes usar a app sem criar conta. Nesse caso, o teu progresso (trilhas, cartões, XP e sequência de dias) fica guardado apenas no teu navegador e não é enviado para nós.</p>

      <h2>Com conta</h2>
      <p>Se criares conta, guardamos:</p>
      <ul>
        <li>o teu e-mail e a tua palavra-passe (esta fica cifrada; nós nunca a vemos). Se entrares com o Google, recebemos o e-mail e os dados básicos de perfil;</li>
        <li>o teu progresso, para o poderes continuar em qualquer aparelho.</li>
      </ul>
      <p>Estes dados ficam no Supabase, num servidor em Paris (União Europeia), protegidos de forma a que cada pessoa só aceda aos seus.</p>

      <h2>O que sai da app para gerar as lições</h2>
      <ul>
        <li><b>Temas e perguntas ao tutor</b> são enviados a um serviço de inteligência artificial (Google Gemini) para criar trilhas, lições e respostas. No plano gratuito, a Google pode usar esse conteúdo para melhorar os seus serviços. Por isso, não escrevas dados pessoais nos temas nem nas perguntas.</li>
        <li><b>Pesquisas nas wikis</b> (Wikipédia, Wikilivros, Wikiversidade e Wikisource) usam o tema que escreveste para encontrar fontes abertas.</li>
        <li><b>«Reportar erro»</b> envia-nos o texto que escreveres nesse formulário, sem o teu nome.</li>
      </ul>

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
