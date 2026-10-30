import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('homepage defers data and players; scoped search has complete counts and keyboard return',async({page})=>{
  const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await page.goto('/');await expect(page.locator('.current-issue')).toContainText('४४९');
  expect(requests.filter(u=>/data\/.*json|youtube-nocookie.com\/embed|archive.org\/embed/.test(u))).toEqual([]);
  await page.locator('#globalSearch').fill('issue 448');await page.locator('#globalSearchForm button').first().click();
  await expect(page.locator('#searchResults')).toContainText('448');
  await page.keyboard.press('Escape');await expect(page.locator('#searchDialog')).toBeHidden();await expect(page.locator('#globalSearchForm button').first()).toBeFocused();
  await page.locator('#globalSearch').fill('कन्यादान');await page.locator('[data-scope="media"]').click();
  await expect(page.locator('#searchResults')).toContainText('कन्यादान');await expect(page).toHaveURL(/scope=media/);
  await page.reload();await expect(page.locator('#searchResults')).toContainText('कन्यादान');
  await page.locator('#dialogClear').click();await expect(page).not.toHaveURL(/scope=|q=/);
  expect(errors).toEqual([]);
});
test('permanent routes and Maithili remain available without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
  for(const slug of ['books','issues','stages','theatre','criticism','world-exchange','media','about','accessibility']){
    const r=await page.goto(`http://127.0.0.1:4173/${slug}/`);expect(r.status()).toBe(200);await expect(page.locator('h1')).toBeVisible();
    expect(await page.locator('a[href]').count()).toBeGreaterThan(10);
  }
  await page.goto('http://127.0.0.1:4173/mai/');await expect(page.locator('html')).toHaveAttribute('lang','mai');await expect(page.locator('h1')).toContainText('साहित्य उत्सव');
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);await expect(page.locator('link[hreflang="mai"]')).toHaveCount(1);
  await context.close();
});
test('reflow and automated WCAG checks',async({page})=>{
  await page.goto('/');await page.setViewportSize({width:320,height:800});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('a[href="#issues"]').first().click();await expect(page.locator('#issueGrid .issue-card').first()).toBeVisible();
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});
