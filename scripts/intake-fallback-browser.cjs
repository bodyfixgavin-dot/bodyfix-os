// Repeatable UI checks; uses the runner's Playwright, no database/customer credentials.
// BASE_URL defaults to the locally built app. All API writes are intercepted.
const { chromium, webkit } = require('playwright');
const safari = process.env.BROWSER === 'webkit';
const assert = require('node:assert/strict');
const base = process.env.BASE_URL || 'http://localhost:3000';
const officialLine = 'https://line.me/R/ti/p/@359gzxzi';
(async () => {
  const browser = safari ? await webkit.launch({ headless: true }) : await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    for (const mode of ['disconnected', '503', 'timeout', 'malformed', 'manual-copy', 'retry-success', 'success', 'validation']) {
      const context = await browser.newContext({ viewport: { width: 393, height: 852 }, ...(safari ? { isMobile: true, hasTouch: true } : { permissions: ['clipboard-read', 'clipboard-write'] }) });
      const page = await context.newPage();
      const requests = [];
      let saved = false;
      if (mode === 'manual-copy') await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) } });
        document.execCommand = () => false;
      });
      // Options must not be required for offline completion.
      await page.route('**/api/intake/options', route => route.abort('internetdisconnected'));
      await page.route('**/api/intake', async route => {
        requests.push(route.request().postDataJSON());
        if (mode === 'timeout') return; // Client abort must unlock after its bounded wait.
        if (mode === 'disconnected') return route.abort('internetdisconnected');
        if (mode === 'malformed') return route.fulfill({ status: 502, contentType: 'text/html', body: 'upstream unavailable' });
        if (mode === 'success' || mode === 'retry-success' && requests.length > 1) {
          saved = true;
          return route.fulfill({ status: 201, json: { stored: true, ok: true, reference: 'fictional-test-receipt' } });
        }
        return route.fulfill({ status: 503, json: { stored: false } });
      });
      await page.goto(base + '/intake');
      await page.getByRole('radio', { name: '第一次預約', exact: true }).check();
      await page.locator('#name').fill('虛構離線測試');
      await page.getByRole('radio', { name: 'LINE', exact: true }).check();
      await page.locator('#contact').fill('PRIVATE_CONTACT');
      await page.getByRole('radio', { name: '生日', exact: true }).check();
      await page.getByLabel('出生年', { exact: true }).selectOption('1990');
      await page.getByLabel('出生月', { exact: true }).selectOption('10');
      await page.getByLabel('出生日', { exact: true }).selectOption('10');
      await page.locator('#height').fill('175');
      await page.locator('#weight').fill('75');
      await page.locator('#occupation').fill('測試工程師');
      await page.getByRole('checkbox', { name: '長時間坐著', exact: true }).check();
      await page.getByRole('radio', { name: '每週 1–2 次', exact: true }).check();
      await page.getByRole('checkbox', { name: '跑步', exact: true }).check();
      await page.locator('input[name=service][value=body-reset]').check();
      await page.getByRole('checkbox', { name: '單純想放鬆', exact: true }).check();
      await page.getByRole('checkbox', { name: '肩頸', exact: true }).check();
      await page.locator('#notes').fill('PRIVATE_NOTES');
      await page.locator('#date').fill('2026-12-15');
      await page.getByRole('radio', { name: '14:00', exact: true }).check();
      await page.locator('input[name=place]').last().check();
      if (mode !== 'validation') {
        await page.getByRole('radio', { name: '有需要事前告知的狀況', exact: true }).check();
        await page.locator('#safetyNote').fill('PRIVATE_HEALTH');
      }
      await page.locator('#noTouch').fill('PRIVATE_BOUNDARY');
      await page.locator('input[name=privacyConsent]').check();
      await page.locator('input[name=serviceConsent]').check();
      await page.getByRole('button', { name: '完成問卷並產生摘要', exact: true }).click();
      if (mode === 'validation') {
        await page.getByText('請確認近期健康狀況', { exact: true }).waitFor();
        assert.equal(requests.length, 0);
        assert.equal(await page.locator('#name').inputValue(), '虛構離線測試');
      } else {
        await page.getByRole('heading', { name: mode === 'success' ? '預約資料已儲存' : '問卷已填寫完成', exact: true }).waitFor({ timeout: 16000 });
        const summary = await page.getByLabel('問卷純文字摘要', { exact: true }).inputValue();
        for (const value of ['虛構離線測試', '天秤座', '175 cm', '75 kg', '測試工程師', '長時間坐著', '跑步', '單純想放鬆', '肩頸', '2,200', '2026-12-15', '14:00']) assert.ok(summary.includes(value), value);
        for (const secret of ['1990-10-10', 'PRIVATE_CONTACT', 'PRIVATE_NOTES', 'PRIVATE_HEALTH', 'PRIVATE_BOUNDARY']) assert.ok(!summary.includes(secret), secret);
        assert.equal(await page.getByRole('link', { name: '開啟 BodyFix 官方 LINE' }).getAttribute('href'), officialLine);
        assert.equal(await page.locator('body').evaluate(el => el.scrollWidth <= innerWidth), true);
        await page.getByRole('button', { name: '一鍵複製問卷內容' }).click();
        if (mode === 'manual-copy') {
          await page.getByText('無法自動複製，請長按下方純文字摘要，選取並複製。', { exact: true }).waitFor();
          assert.equal(await page.getByLabel('問卷純文字摘要', { exact: true }).evaluate(el => el.selectionEnd - el.selectionStart), summary.length);
        } else {
          await page.getByText('已複製問卷內容，請開啟官方 LINE，貼上並傳送給 Gavin。', { exact: true }).waitFor();
          if (!safari) assert.equal(await page.evaluate(() => navigator.clipboard.readText()), summary);
        }
        if (mode === 'retry-success') {
          await page.getByRole('button', { name: '重試儲存（可稍後再試）' }).click();
          await page.getByRole('heading', { name: '預約資料已儲存' }).waitFor();
          assert.deepEqual(requests[0], requests[1]);
          assert.equal(saved, true);
        }
        await page.getByRole('button', { name: '返回查看／修改問卷' }).click();
        for (const [id, value] of [['name', '虛構離線測試'], ['notes', 'PRIVATE_NOTES'], ['safetyNote', 'PRIVATE_HEALTH'], ['noTouch', 'PRIVATE_BOUNDARY']]) assert.equal(await page.locator('#' + id).inputValue(), value);
        assert.equal(await page.getByLabel('出生年', { exact: true }).inputValue(), '1990');
      }
      console.log('PASS', safari ? 'webkit' : 'chromium', mode);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
