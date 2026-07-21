// Verifikimi end-to-end i aplikacionit të testit — shih SKILL.md për nisjen.
// Para ekzekutimit: dev serveri në portën 5199 me env-t dummy të EmailJS.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = 'http://localhost:5199';
const TOTAL = 8; // numri i pyetjeve — përditësojeni bashkë me src/questions.ts
const SHOTS = (process.env.SHOTS_DIR ?? path.join(os.tmpdir(), 'kontabilist-verify-shots')) + path.sep;
fs.mkdirSync(SHOTS, { recursive: true });

let failures = 0;
function ok(name, cond, extra = '') {
  const line = `${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`;
  console.log(line);
  if (!cond) failures++;
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });

// emailMode: 'ok' kap thirrjet e EmailJS dhe kthen 200; 'fail' i rrëzon të gjitha
async function newSession(viewport = { width: 1280, height: 900 }, emailMode = 'ok') {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.accept());
  const emails = [];
  const failedAttempts = [];
  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  await page.route('https://api.emailjs.com/**', (route) => {
    if (emailMode === 'fail') {
      failedAttempts.push(1);
      return route.abort('failed');
    }
    emails.push(route.request().postDataJSON());
    return route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK' });
  });
  await page.goto(BASE);
  return { ctx, page, emails, failedAttempts, consoleErrors };
}

const unloadGuard = (page) =>
  page.evaluate(() => !window.dispatchEvent(new Event('beforeunload', { cancelable: true })));

async function setRemaining(page, remainingSeconds) {
  await page.evaluate((rem) => {
    const started = new Date(Date.now() - (45 * 60 - rem) * 1000).toISOString();
    localStorage.setItem('kontabilist-test.startedAt', started);
  }, remainingSeconds);
  await page.reload();
}

const timerText = (page) => page.locator('[aria-label="Koha e mbetur"]').innerText();
const absent = async (page, text) => (await page.getByText(text).count()) === 0;

/* ---------------- Scenario A: full flow, email delivery OK ---------------- */
console.log('--- A: full happy flow (EmailJS reachable) ---');
{
  const { ctx, page, emails } = await newSession();
  ok('A intro title', await page.getByRole('heading', { name: 'Kontabilist i Brendshëm' }).isVisible());
  ok('A no unload-guard on intro', !(await unloadGuard(page)));

  await page.getByRole('button', { name: 'Fillo testin' }).click();
  ok('A Q1 progress label', await page.getByText(`Pyetja 1 nga ${TOTAL}`).isVisible());
  ok('A welcome toast on start', await page.locator('[data-sonner-toast]').filter({ hasText: 'Mirë se vini' }).isVisible());
  const t0 = await timerText(page);
  ok('A timer starts at 45:00', /4[45]:\d\d/.test(t0), t0);
  ok('A unload-guard active during test', await unloadGuard(page));

  const progressBox = await page.getByText(`Pyetja 1 nga ${TOTAL}`).boundingBox();
  ok('A question card vertically centered', progressBox.y > 150, `y=${Math.round(progressBox.y)}`);

  await page.getByRole('button', { name: 'Vazhdo' }).click();
  ok('A empty short blocked', await page.getByText('Kjo pyetje është e detyrueshme').isVisible());
  const nameInput = page.locator('input[type="text"]');
  await nameInput.fill('Leona123 Zogiani456');
  ok('A digits stripped from name', (await nameInput.inputValue()) === 'Leona Zogiani', await nameInput.inputValue());
  ok('A autocomplete off', (await nameInput.getAttribute('autocomplete')) === 'off');
  await nameInput.press('Enter');
  ok('A Enter advances short Q1→Q2', await page.getByText(`Pyetja 2 nga ${TOTAL}`).isVisible());

  const countryTrigger = page.getByRole('combobox');
  const phoneInput = page.locator('input[type="tel"]');
  ok('A phone default country Kosova', (await countryTrigger.innerText()).includes('Kosova'));
  await phoneInput.fill('abcdef');
  ok('A letters stripped from phone', (await phoneInput.inputValue()) === '');
  await phoneInput.fill('4412');
  await page.getByRole('button', { name: 'Vazhdo' }).click();
  ok('A short phone blocked (XK 8–9)', await page.getByText('8–9 shifra').isVisible());
  await countryTrigger.click();
  await page.getByRole('option', { name: /Gjermania/ }).click();
  await page.getByRole('button', { name: 'Vazhdo' }).click();
  ok('A German range enforced (7–11)', await page.getByText('7–11 shifra').isVisible());
  await countryTrigger.click();
  await page.getByRole('option', { name: /Kosova/ }).click();
  await phoneInput.fill('044 123 456');
  await phoneInput.press('Enter');
  ok('A valid XK number with leading 0 advances', await page.getByText(`Pyetja 3 nga ${TOTAL}`).isVisible());

  await page.getByRole('button', { name: 'Vazhdo' }).click();
  ok('A checkbox empty blocked', await page.getByText('Kjo pyetje është e detyrueshme').isVisible());
  await page.getByText('Kontabilist i Çertifikuar', { exact: true }).click();
  await page.getByText('Ekspert Tatimor', { exact: true }).click();
  await page.getByRole('button', { name: 'Prapa' }).click();
  ok('A back to Q2 keeps phone', (await page.locator('input[type="tel"]').inputValue()) === '044 123 456');
  await page.getByRole('button', { name: 'Vazhdo' }).click();
  ok('A forward keeps checkbox picks', (await page.locator('[role="checkbox"][aria-checked="true"]').count()) === 2);
  await page.getByRole('button', { name: 'Vazhdo' }).click();

  ok('A Q4 personalized with first name', await page.getByText('Leona, kompania juaj paguan').isVisible());
  const answer4 = 'Pagesa trajtohet si shpenzim i zbritshëm; verifikoj statusin e furnitorit para mbajtjes në burim.';
  await page.locator('textarea').fill(answer4);
  ok('A char count live', await page.getByText(`${answer4.length} karaktere`).isVisible());

  await page.getByRole('button', { name: '+ Shto referencë' }).click();
  await page.locator('input[type="url"]').fill('abc');
  await page.getByRole('button', { name: 'Vazhdo' }).click();
  ok('A invalid reference blocked', await page.getByText('nuk është link i vlefshëm').isVisible());
  await page.locator('input[type="url"]').fill('https://atk-ks.org/ligjet');
  await page.getByRole('button', { name: '+ Shto referencë' }).click();
  await page.locator('input[type="url"]').nth(1).fill('www.arbk.rks-gov.net');

  const [beforeM, beforeS] = (await timerText(page)).split(':').map(Number);
  await page.reload();
  ok('A refresh restores step', await page.getByText(`Pyetja 4 nga ${TOTAL}`).isVisible());
  ok('A refresh restores long answer', (await page.locator('textarea').inputValue()) === answer4);
  ok('A refresh restores references', (await page.locator('input[type="url"]').count()) === 2 &&
    (await page.locator('input[type="url"]').nth(1).inputValue()) === 'www.arbk.rks-gov.net');
  const [afterM, afterS] = (await timerText(page)).split(':').map(Number);
  const delta = beforeM * 60 + beforeS - (afterM * 60 + afterS);
  ok('A timer survives refresh (kept counting)', delta >= 0 && delta < 8, `dropped ${delta}s across reload`);

  for (let q = 5; q <= TOTAL; q++) {
    await page.getByRole('button', { name: 'Vazhdo' }).click();
    ok(`A Q${q} shown`, await page.getByText(`Pyetja ${q} nga ${TOTAL}`).isVisible());
    await page.locator('textarea').fill(`Përgjigje testuese për pyetjen ${q}.`);
  }
  const sendBtn = page.getByRole('button', { name: 'Dërgo testin' });
  ok('A last step shows Dërgo testin', await sendBtn.isVisible());
  await sendBtn.dblclick(); // provë: dy klikime të shpejta nuk dërgojnë dy herë

  await page.getByText('Faleminderit, Leona!').waitFor();
  ok('A 2-week note', await page.getByText('brenda 2 javëve').isVisible());
  ok('A time used shown', await page.getByText('Koha e përdorur:').isVisible());
  ok('A no JSON/file/delivery talk', (await absent(page, /JSON/)) &&
    (await absent(page, /skedar/)) && (await absent(page, /u dërgua/)) &&
    (await absent(page, /Koha përfundoi/)));
  await page.waitForTimeout(400);
  ok('A confetti canvas mounted', (await page.locator('canvas').count()) >= 1);

  ok('A exactly one email despite double click', emails.length === 1, `got ${emails.length}`);
  const e = emails[0];
  const tp = e.template_params;
  ok('A email service/template from env', e.service_id === 'service_test' && e.template_id === 'template_test');
  ok('A email recipients', tp.to_email === 'info@keqyr.com, ulpian.morina@keqyr.com', tp.to_email);
  ok('A email subject has candidate', tp.subject.includes('Leona Zogiani'), tp.subject);
  ok('A email body: candidate + intl phone', tp.body.includes('Kandidati: Leona Zogiani') &&
    tp.body.includes('Telefoni: +383 44123456'));
  ok('A email body: manual submit flag', tp.body.includes('Dërgim automatik (koha skadoi): Jo'));
  ok(`A email body: all ${TOTAL} titles`, [...tp.body.matchAll(/\n\d\. /g)].length === TOTAL);
  ok('A email body: answers + references', tp.body.includes(answer4) &&
    tp.body.includes('Kontabilist i Çertifikuar, Ekspert Tatimor') &&
    tp.body.includes('https://atk-ks.org/ligjet | www.arbk.rks-gov.net') &&
    tp.body.includes(`Përgjigje testuese për pyetjen ${TOTAL}.`));
  fs.writeFileSync(SHOTS + 'email-body.txt', tp.body);

  const cleared = await page.evaluate(() => localStorage.getItem('kontabilist-test.startedAt'));
  ok('A session cleared after successful send', cleared === null);

  await page.getByRole('button', { name: 'Mesatar' }).click();
  await page.getByPlaceholder('Komenti juaj (opsional)').fill('Pyetje të qarta, koha e mjaftueshme.');
  await page.getByRole('button', { name: 'Dërgo vlerësimin' }).click();
  await page.getByText('Faleminderit për vlerësimin!').waitFor();
  ok('A feedback email', emails.length === 2 &&
    emails[1].template_params.body.includes('Vështirësia: 3/5 — Mesatar') &&
    emails[1].template_params.body.includes('Pyetje të qarta, koha e mjaftueshme.') &&
    emails[1].template_params.to_email === 'info@keqyr.com, ulpian.morina@keqyr.com');
  await page.screenshot({ path: SHOTS + 'completion-sent.png', fullPage: true });
  await ctx.close();
}

/* ---------------- Scenario B: reset param, timer states + C1 expiry on load ---------------- */
console.log('--- B: timer states ---');
{
  const { ctx, page, emails } = await newSession();

  // Prova e ?reset: sesioni në mes të testit fshihet dhe kthehet intro-ja
  await page.getByRole('button', { name: 'Fillo testin' }).click();
  await page.locator('input[type="text"]').fill('Sesion Për Fshirje');
  await page.goto(BASE + '/?reset');
  ok('R ?reset returns to intro', await page.getByRole('button', { name: 'Fillo testin' }).isVisible());
  ok('R ?reset clears stored session', (await page.evaluate(() => localStorage.getItem('kontabilist-test.startedAt'))) === null);
  ok('R ?reset stripped from URL', !page.url().includes('reset'), page.url());

  await page.getByRole('button', { name: 'Fillo testin' }).click();

  await setRemaining(page, 10 * 60 + 3);
  let badge = page.locator('[aria-label="Koha e mbetur"]');
  ok('B >10min badge neutral', /bg-slate-100/.test(await badge.getAttribute('class')));
  await page.waitForTimeout(3500);
  ok('B <=10min badge amber', /bg-amber-100/.test(await badge.getAttribute('class')));
  ok('B 10-min toast', await page.locator('[data-sonner-toast]').filter({ hasText: 'Ju kanë mbetur 10 minuta' }).isVisible());

  await setRemaining(page, 4 * 60 + 50);
  badge = page.locator('[aria-label="Koha e mbetur"]');
  const cls = await badge.getAttribute('class');
  ok('B <=5min badge red + pulse', /bg-red-100/.test(cls) && /timer-pulse/.test(cls));

  await setRemaining(page, -60);
  await page.getByText('Faleminderit!').waitFor();
  ok('C1 expired-on-load auto-submits via email', emails.length === 1);
  ok('C1 email flags auto-submit, full time', emails[0].template_params.body.includes('Dërgim automatik (koha skadoi): Po') &&
    emails[0].template_params.body.includes('Koha e përdorur: 45:00'));
  ok('C1 completion shows no delivery/timeout talk', (await absent(page, /Koha përfundoi/)) &&
    (await absent(page, /u dërgua/)) && (await absent(page, /JSON/)));
  ok('C1 session cleared', (await page.evaluate(() => localStorage.getItem('kontabilist-test.startedAt'))) === null);
  await ctx.close();
}

/* ---------------- Scenario C2: live timeout, EmailJS DOWN ---------------- */
console.log('--- C2: timeout with EmailJS failing ---');
{
  const { ctx, page, failedAttempts, consoleErrors } = await newSession({ width: 1280, height: 900 }, 'fail');
  await page.getByRole('button', { name: 'Fillo testin' }).click();
  await page.locator('input[type="text"]').fill('Kandidati Vonuar');
  await setRemaining(page, 4);
  ok('C2 still answering at 0:04', await page.getByText(`Pyetja 1 nga ${TOTAL}`).isVisible());

  await page.getByText('Faleminderit, Kandidati!').waitFor({ timeout: 20000 });
  ok('C2 thank-you shown despite send failure', true);
  ok('C2 retried once (2 attempts)', failedAttempts.length === 2, `attempts=${failedAttempts.length}`);
  ok('C2 no error surfaced to candidate', (await absent(page, /gabim/i)) && (await absent(page, /dështoi/i)));
  ok('C2 answers kept in localStorage', (await page.evaluate(() => localStorage.getItem('kontabilist-test.startedAt'))) !== null);
  ok('C2 error logged to console', consoleErrors.some((t) => t.includes('dështoi')),
    consoleErrors.slice(-2).join(' | '));

  await page.getByRole('button', { name: 'I vështirë', exact: true }).click();
  await page.getByRole('button', { name: 'Dërgo vlerësimin' }).click();
  await page.getByText('Faleminderit për vlerësimin!').waitFor({ timeout: 20000 });
  ok('C2 feedback thanks despite failure', true);
  ok('C2 feedback also retried (4 attempts total)', failedAttempts.length === 4, `attempts=${failedAttempts.length}`);
  await page.screenshot({ path: SHOTS + 'completion-emailfail.png', fullPage: true });
  await ctx.close();
}

/* ---------------- Scenario D: responsive ---------------- */
console.log('--- D: responsive ---');
for (const [w, h] of [[375, 812], [768, 1024]]) {
  const { ctx, page } = await newSession({ width: w, height: h });
  const introScroll = await page.evaluate(() => document.documentElement.scrollWidth);
  await page.getByRole('button', { name: 'Fillo testin' }).click();
  await page.locator('input[type="text"]').fill('Emri Mbiemri');
  await page.locator('input[type="text"]').press('Enter');
  const phoneScroll = await page.evaluate(() => document.documentElement.scrollWidth);
  await page.locator('input[type="tel"]').fill('044 123 456');
  await page.getByRole('button', { name: 'Vazhdo' }).click();
  const qScroll = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(`D no horizontal scroll @${w}px`, introScroll <= w && phoneScroll <= w && qScroll <= w,
     `intro=${introScroll} phone=${phoneScroll} q3=${qScroll}`);
  await page.screenshot({ path: SHOTS + `question-${w}.png`, fullPage: true });
  await ctx.close();
}

await browser.close();
console.log(`Shots + email body: ${SHOTS}`);
console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
