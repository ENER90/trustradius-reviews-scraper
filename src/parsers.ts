import * as cheerio from 'cheerio';

export interface ProductRef { source: 'trustradius'; slug: string; url: string }
/** TrustRadius product URL (any sub-page) or bare slug. */
export function parseProduct(input: string): ProductRef {
  const s = input.trim();
  const m = s.match(/trustradius\.com\/products\/([a-z0-9][a-z0-9-]*)/i);
  const slug = m ? m[1].toLowerCase() : /^[a-z0-9][a-z0-9-]*$/i.test(s) ? s.toLowerCase() : null;
  if (!slug) {
    if (/g2\.com|capterra\.|getapp\.|softwareadvice\./i.test(s)) throw new Error(`"${s}": G2 / Capterra are not supported yet (strong anti-bot). Use the TrustRadius URL of the product, e.g. https://www.trustradius.com/products/slack/reviews`);
    throw new Error(`"${s}" is not a TrustRadius product URL or slug.`);
  }
  return { source: 'trustradius', slug, url: `https://www.trustradius.com/products/${slug}/reviews` };
}
export const pageUrl = (p: ProductRef, page: number) => (page <= 1 ? p.url : `${p.url}?page=${page}`);

export interface ReviewRecord {
  type: 'review'; source: 'trustradius'; productSlug: string; productName: string | null; reviewId: string; reviewUrl: string;
  title: string | null; rating: number | null; ratingScale: 10; ratingNormalized5: number | null; date: string | null;
  reviewSource: string | null; vetted: boolean; useCases: string | null; pros: string[]; cons: string[]; likelihoodToRecommend: string | null;
  otherSections: Record<string, string>; reviewerRole?: string | null; reviewerExperience?: string | null; scrapedAt: string;
}
export interface ProductRecord {
  type: 'product'; source: 'trustradius'; productSlug: string; productName: string | null; url: string;
  ratingValue: number | null; ratingScale: number | null; reviewCount: number | null; description: string | null; scrapedAt: string;
}

const clean = (t: string | undefined | null) => (t ?? '').replace(/\s+/g, ' ').trim() || null;

export function isChallenge(html: string): boolean { return /<title>Just a moment|cf-chl|captcha-delivery/i.test(html.slice(0, 20000)); }

export function parseProductMeta(html: string, p: ProductRef, now: string): ProductRecord {
  const $ = cheerio.load(html);
  let app: any = null;
  $('script[type="application/ld+json"]').each((_, el) => { try { const j = JSON.parse($(el).text()); if (j?.['@type'] === 'SoftwareApplication') app = j; } catch { /* skip */ } });
  const ar = app?.aggregateRating ?? {};
  const n = (v: any) => (v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
  return { type: 'product', source: 'trustradius', productSlug: p.slug, productName: app?.name ?? clean($('h1').first().contents().first().text()), url: p.url,
    ratingValue: n(ar.ratingValue), ratingScale: n(ar.bestRating), reviewCount: n(ar.reviewCount ?? ar.ratingCount), description: clean(app?.description)?.slice(0, 2000) ?? null, scrapedAt: now };
}

export function parseReviews(html: string, p: ProductRef, productName: string | null, now: string, includeReviewer = false): ReviewRecord[] {
  const $ = cheerio.load(html);
  const out: ReviewRecord[] = [];
  $('article').each((_, el) => {
    const a = $(el);
    const link = a.find('header h2 a').attr('href') ?? a.find('a[href^="/reviews/"]').attr('href');
    if (!link || !/^\/reviews\//.test(link)) return;
    const ratingAttr = a.find('[data-testid="stars-container"]').attr('data-rating');
    const rating = ratingAttr ? Number(ratingAttr) : Number((a.text().match(/Rating: (\d+(?:\.\d+)?) out of 10/) ?? [])[1] ?? NaN);
    const sections: Record<string, string> = {}; let pros: string[] = [], cons: string[] = [];
    a.find('[data-testid="content"] h3').each((_, h) => {
      const name = clean($(h).text()); if (!name) return;
      const body = $(h).parent();
      const items = body.find('li').map((_, li) => clean($(li).text())).get().filter(Boolean) as string[];
      if (/^pros$/i.test(name)) pros = items; else if (/^cons$/i.test(name)) cons = items;
      else sections[name] = clean(body.clone().children('h3').remove().end().text()) ?? '';
    });
    const { ['Use Cases and Deployment Scope']: useCases = null, ['Likelihood to Recommend']: ltr = null, ...other } = sections;
    const r: ReviewRecord = {
      type: 'review', source: 'trustradius', productSlug: p.slug, productName, reviewId: link.replace(/^\/reviews\//, '').replace(/[#?].*$/, ''),
      reviewUrl: `https://www.trustradius.com${link.replace(/[#?].*$/, '')}`, title: clean(a.find('header h2').text()),
      rating: Number.isFinite(rating) ? rating : null, ratingScale: 10, ratingNormalized5: Number.isFinite(rating) ? rating / 2 : null,
      date: a.find('header time').attr('datetime') ?? null, reviewSource: clean(a.find('[data-testid="review-source"]').text()),
      vetted: /Vetted Review|Verified/i.test(a.find('[class*="verifications"]').text()), useCases, pros, cons, likelihoodToRecommend: ltr, otherSections: other, scrapedAt: now,
    };
    if (includeReviewer) { // role & company size only, never the reviewer's name
      r.reviewerRole = clean(a.find('[data-testid="byline"] [class*="_job_"]').text());
      r.reviewerExperience = clean(a.find('[class*="authorBadges"]').text());
    }
    out.push(r);
  });
  return out;
}

export function lastPage(html: string): number | null {
  const nums = [...html.matchAll(/\/reviews\?page=(\d+)(?:"|&amp;(?!dimension))/g)].map((m) => Number(m[1]));
  return nums.length ? Math.max(...nums) : null;
}

/** Prompt for the optional AI summary (BYO OpenAI-compatible key). */
export function summaryPrompt(product: string, reviews: ReviewRecord[]): string {
  const lines = reviews.slice(0, 200).map((r) => `- [${r.rating ?? '?'}/10] PROS: ${r.pros.join(' | ')} CONS: ${r.cons.join(' | ')} ${r.likelihoodToRecommend ?? ''}`.slice(0, 800));
  return `Summarize these ${lines.length} user reviews of the software "${product}". Return strict JSON with keys: sentiment ("positive"|"mixed"|"negative"), summary (<=80 words), topPros (array of <=5 short strings), topCons (array of <=5 short strings), commonComplaints (array of <=5), idealFor (<=30 words).\n\n${lines.join('\n')}`;
}
