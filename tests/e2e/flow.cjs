// Percurso completo: Explorar → trilha → lição inteira → resultado → Perfil, Definições, Admin. Tira capturas.
// Uso: node tests/e2e/flow.cjs <prefixo> [dark] [largura]   (capturas em tests/e2e/out/)
const fs = require('fs');
const { launch, session, BASE } = require('./lib.cjs');
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
const tag = process.argv[2] || 'f';
const dark = process.argv[3] === 'dark';
const W = Number(process.argv[4] || 390);
(async () => {
  const b = await launch();
  const { p } = await session(b, { dark, w: W, h: W > 600 ? 900 : 844, progress: 'p-empty' });
  const hide = () => p.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
  let n = 0;
  const shot = async (name, full = false) => { await hide(); await p.waitForTimeout(500); await p.screenshot({ path: `${__dirname}/out/${tag}-${String(++n).padStart(2, '0')}-${name}.png`, fullPage: full }); };
  await shot('home', true);
  await p.goto(BASE + '/?v=explorar', { waitUntil: 'networkidle' });
  await shot('explore', true);
  await p.locator('.cats button', { hasText: 'Ciências' }).click();
  await shot('explore-cat');
  await p.locator('.topic-row', { hasText: 'Fotossíntese' }).getByRole('button').click();
  await p.waitForTimeout(600);
  await shot('trail', true);
  await p.locator('.node.cur').click();
  await p.waitForTimeout(1500);
  await shot('warmup');
  await p.locator('.opt').nth(1).click();
  await shot('warmup-fb');
  await p.locator('.feedback .btn').click();
  for (let i = 0; i < 4; i++) { const c = p.getByRole('button', { name: 'Continuar' }); if (await c.count()) await c.click(); }
  await shot('learn', true);
  await p.getByRole('button', { name: /vamos memorizar/i }).click();
  await shot('deck');
  for (let i = 0; i < 3; i++) {
    await p.locator('.card3d').click();
    await p.waitForTimeout(600);
    if (i === 0) await shot('deck-flip');
    await p.locator('.rate .btn').nth(2).click();
  }
  await shot('deck-end');
  await p.getByRole('button', { name: /Ir para o teste/ }).click();
  for (let guard = 0; guard < 14; guard++) {
    await p.waitForTimeout(300);
    if (await p.locator('.result').count()) break;
    const fb = p.locator('.feedback .btn');
    if (await fb.count()) { await fb.click(); continue; }
    const kind = await p.locator('.quiz form .eyebrow').first().innerText().catch(() => '');
    if (await p.locator('.match').count()) {
      await shot('match');
      const terms = p.locator('.match-terms .chip');
      const k = await terms.count();
      for (let t = 0; t < k; t++) {
        const term = await terms.nth(t).innerText();
        await terms.nth(t).click();
        // a definição do termo "Termo um" é "Definição curta do termo um."
        const word = term.toLowerCase().replace('termo ', '');
        await p.locator('.opts.one .opt', { hasText: `termo ${word}` }).click();
        await p.waitForTimeout(150);
      }
      await p.waitForTimeout(300);
      await shot('match-done');
      continue;
    }
    if (await p.locator('.ord').count()) {
      await shot('order');
      const want = ['Primeiro passo', 'Segundo passo', 'Terceiro passo', 'Quarto passo'];
      for (let pos = 0; pos < want.length; pos++) {
        for (let g = 0; g < 4; g++) {
          const texts = await p.locator('.ord .ord-t').allInnerTexts();
          const at = texts.indexOf(want[pos]);
          if (at <= pos) break;
          await p.locator('.ord li').nth(at).locator('.grip').focus();
          await p.keyboard.press('ArrowUp');
        }
      }
      await p.getByRole('button', { name: 'Verificar' }).click();
      await shot('order-fb');
      continue;
    }
    if (await p.locator('input.field').count() && /completa/i.test(kind)) {
      await shot('cloze');
      await p.locator('.quiz input.field').fill('ATP e NADPH');
      await p.getByRole('button', { name: 'Verificar' }).click();
      await shot('cloze-fb');
      continue;
    }
    if (await p.locator('.quiz textarea').count()) {
      await p.locator('.quiz textarea').fill('Porque a causa explica o efeito.');
      await p.getByRole('button', { name: 'Verificar' }).click();
      await p.waitForTimeout(1500);
      await shot('short-fb');
      continue;
    }
    const q = await p.locator('.quiz h2.q').innerText();
    const idx = q.includes('número um') ? 1 : q.includes('dois') ? 0 : 2;
    await p.locator('.quiz .opt').nth(idx).click();
    await p.getByRole('button', { name: 'Verificar' }).click();
    if (guard === 0) await shot('mc-fb');
  }
  await p.waitForTimeout(1200);
  await shot('result');
  const dlg = p.locator('dialog[open]');
  if (await dlg.count()) { await shot('badge'); await dlg.getByRole('button').click(); }
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await shot('trail-after', true);
  await p.goto(BASE + '/?v=perfil', { waitUntil: 'networkidle' });
  await shot('profile', true);
  await p.goto(BASE + '/?v=definicoes', { waitUntil: 'networkidle' });
  await shot('settings', true);
  await p.goto(BASE + '/?v=admin', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  await shot('admin', true);
  await b.close();
})().catch((e) => { console.error('FALHOU', e.message.slice(0, 500)); process.exit(1); });
