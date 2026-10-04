import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT } from "@/lib/legal";

export const metadata: Metadata = { title: "Termos de serviço · NOOBrain" };

export default function Page() {
  return (
    <LegalPage title="Termos de serviço">
      <p>Ao usares o NOOBrain, da NOOBjects, aceitas estes termos. São curtos de propósito.</p>

      <h2>O serviço</h2>
      <p>O NOOBrain cria trilhas de aprendizagem, lições, cartões e testes sobre o tema que escolheres. É gratuito e está em desenvolvimento: funcionalidades podem mudar, falhar ou deixar de existir.</p>

      <h2>Conteúdo gerado por IA</h2>
      <p>As lições e as respostas do tutor são geradas por inteligência artificial a partir de fontes abertas e podem conter erros ou estar desatualizadas. Confirma sempre informação importante. O NOOBrain não substitui aconselhamento médico, jurídico, financeiro ou profissional.</p>

      <h2>Fontes abertas</h2>
      <p>As fontes indicadas pertencem aos seus autores e são partilhadas sob licenças abertas (por exemplo, Creative Commons), de acordo com as regras de cada site de origem.</p>

      <h2>A tua conta</h2>
      <p>Para usar o NOOBrain precisas de ter pelo menos 13 anos.</p>
      <p>A conta é opcional. Mantém a tua palavra-passe em segredo, porque és responsável pelo que acontece na tua conta. Podes pedir o apagamento a qualquer momento (ver a <Link href="/privacidade">política de privacidade</Link>).</p>

      <h2>Uso aceitável</h2>
      <p>Não uses o NOOBrain para atividades ilegais, para prejudicar outras pessoas, para tentar aceder a contas ou sistemas que não são teus, ou para sobrecarregar o serviço com pedidos automáticos. Podemos limitar ou suspender o acesso a quem o fizer.</p>

      <h2>Disponibilidade e responsabilidade</h2>
      <p>O serviço é fornecido «como está», sem garantia de funcionamento contínuo nem de que o conteúdo esteja correto. Na medida permitida pela lei, a NOOBjects não se responsabiliza por perdas resultantes do uso do NOOBrain. Isto não afasta direitos que a lei te dá como consumidor.</p>

      <h2>Alterações</h2>
      <p>Podemos atualizar estes termos. A data no topo mostra a última versão e, se continuares a usar a app, entendemos que aceitas a nova.</p>

      <h2>Contacto</h2>
      <p>Dúvidas? Escreve para <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </LegalPage>
  );
}
