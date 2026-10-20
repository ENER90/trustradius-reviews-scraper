import { Actor, log } from 'apify';
import { runAiInsights } from './ai.js';
import { PlaywrightCrawler } from 'crawlee';
import { parseProduct, pageUrl, parseReviews, parseProductMeta, isChallenge, summaryPrompt, ProductRef, ReviewRecord } from './parsers.js';

interface Input {
  startUrls?: ({ url: string } | string)[]; products?: string[]; maxReviewsPerProduct?: number; includeProductInfo?: boolean; includeReviewerInfo?: boolean;
  aiSummary?: boolean; aiProvider?: 'openai' | 'gemini'; aiLanguage?: string; aiApiKey?: string; aiBaseUrl?: string; aiModel?: string; proxyConfiguration?: any;
}
await Actor.init();
const input = (await Actor.getInput<Input>()) ?? {};
const max = input.maxReviewsPerProduct ?? 50;
const now = new Date().toISOString();
const raw = [...(input.startUrls ?? []).map((u) => (typeof u === 'string' ? u : u.url)), ...(input.products ?? [])];
const products: ProductRef[] = [];
for (const r of raw) { try { const p = parseProduct(r); if (!products.some((x) => x.slug === p.slug)) products.push(p); } catch (e) { log.error((e as Error).message); } }
if (!products.length) throw new Error('Input error: add at least one TrustRadius product URL or slug (e.g. "slack").');
const wantAi = !!(input.aiSummary && input.aiApiKey);
if (input.aiSummary && !input.aiApiKey) log.warning('aiSummary=true but no aiApiKey: skipping AI summaries.');

const proxyConfiguration = await Actor.createProxyConfiguration(input.proxyConfiguration ?? { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'], apifyProxyCountry: 'US' });
const got = new Map<string, ReviewRecord[]>();
const names = new Map<string, string | null>();
const seen = new Set<string>();

const crawler = new PlaywrightCrawler({
  proxyConfiguration, maxRequestRetries: 5, navigationTimeoutSecs: 90, requestHandlerTimeoutSecs: 180, maxConcurrency: 3,
  sessionPoolOptions: { blockedStatusCodes: [], sessionOptions: { maxUsageCount: 30 } },
  browserPoolOptions: { useFingerprints: true },
  launchContext: { launchOptions: { args: ['--disable-blink-features=AutomationControlled'] } },
  preNavigationHooks: [async ({ page }) => { await page.route('**/*', (r) => (['image', 'media', 'font', 'stylesheet'].includes(r.request().resourceType()) || /googletagmanager|google-analytics|doubleclick|fullstory|hotjar|livechat|cookielaw|segment|bing|facebook|linkedin/.test(r.request().url()) ? r.abort() : r.continue())); }],
  async requestHandler({ page, request, session, crawler: c }) {
    const p = request.userData.product as ProductRef; const n = request.userData.page as number;
    // Cloudflare JS challenge solves itself in a real browser; wait for the reviews or give up and rotate session.
    await page.waitForSelector('article', { timeout: 30000 }).catch(() => {});
    let html = await page.content();
    for (let k = 0; k < 6 && isChallenge(html); k++) { await page.waitForTimeout(5000); html = await page.content(); }
    if (isChallenge(html)) { session?.retire(); throw new Error(`Anti-bot challenge not passed on ${request.url}`); }
    if (!page.url().includes(`/products/${p.slug}`) || /^TrustRadius: Software Reviews, Software Comparisons/i.test(await page.title())) { log.error(`${p.slug}: product not found on TrustRadius (redirected to ${page.url()}). Check the slug.`); return; }
    if (n === 1) {
      const meta = parseProductMeta(html, p, now); names.set(p.slug, meta.productName);
      if (!meta.productName && !html.includes('<article')) { log.error(`${p.slug}: product page not found on TrustRadius.`); return; }
      if (input.includeProductInfo ?? true) await Actor.pushData(meta);
    }
    const all = parseReviews(html, p, names.get(p.slug) ?? null, now, input.includeReviewerInfo ?? false).filter((r) => !seen.has(r.reviewId));
    const have = got.get(p.slug) ?? [];
    const take = all.slice(0, Math.max(0, max - have.length));
    take.forEach((r) => seen.add(r.reviewId));
    if (take.length) await Actor.pushData(take, 'review');
    got.set(p.slug, [...have, ...take]);
    log.info(`${p.slug}: page ${n}, ${have.length + take.length}/${max} reviews`);
    if (!all.length && request.retryCount < 2) { session?.retire(); throw new Error(`No reviews rendered on ${request.url}, retrying with a new session`); }
    if (n === 1 && !all.length) await Actor.setValue(`debug-${p.slug}`, html, { contentType: "text/html" });
    if (n === 1 && !all.length) log.warning(`${p.slug}: no reviews found (check the slug at trustradius.com/products/<slug>/reviews).`);
    if (all.length && have.length + take.length < max) await c.addRequests([{ url: pageUrl(p, n + 1), userData: { product: p, page: n + 1 } }]);
  },
  failedRequestHandler({ request }, e) { log.error(`Gave up on ${request.url}: ${e.message}`); },
});
await crawler.run(products.map((p) => ({ url: pageUrl(p, 1), userData: { product: p, page: 1 } })));

const useGemini = wantAi && (input.aiProvider === 'gemini' || input.aiApiKey!.startsWith('AIza'));
if (useGemini) await runAiInsights({ aiInsights: true, aiProvider: 'gemini', aiApiKey: input.aiApiKey, aiModel: input.aiModel === 'gpt-4o-mini' ? undefined : input.aiModel, aiLanguage: input.aiLanguage }, 'trustradius');
else if (wantAi) {
  for (const p of products) {
    const reviews = got.get(p.slug) ?? []; if (reviews.length < 3) continue;
    try {
      const r = await fetch(`${(input.aiBaseUrl ?? 'https://api.openai.com/v1').replace(/\/$/, '')}/chat/completions`, { method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${input.aiApiKey}` },
        body: JSON.stringify({ model: input.aiModel ?? 'gpt-4o-mini', temperature: 0.2, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: summaryPrompt(names.get(p.slug) ?? p.slug, reviews) }] }) });
      const j: any = await r.json();
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${j?.error?.message ?? 'unknown'}`);
      const parsed = JSON.parse(j.choices[0].message.content);
      await Actor.pushData({ type: 'ai-summary', source: 'trustradius', productSlug: p.slug, productName: names.get(p.slug) ?? null, reviewsAnalyzed: reviews.length, ...parsed, scrapedAt: now }); // not charged (beta)
      log.info(`${p.slug}: AI summary saved.`);
    } catch (e) { log.error(`${p.slug}: AI summary failed (${(e as Error).message}). Not charged.`); }
  }
}
const total = [...got.values()].reduce((a, b) => a + b.length, 0);
await Actor.setValue('OUTPUT', { products: products.map((p) => ({ slug: p.slug, reviews: got.get(p.slug)?.length ?? 0 })), totalReviews: total });
if (!total) await Actor.fail('No reviews were scraped. See log.'); else await Actor.exit(`Scraped ${total} reviews from ${products.length} product(s).`);
