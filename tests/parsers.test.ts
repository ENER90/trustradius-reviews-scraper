import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseProduct, pageUrl, parseReviews, parseProductMeta, isChallenge, summaryPrompt } from '../src/parsers.js';
const html = readFileSync('tests/fixtures/trustradius_slack_p1.html', 'utf8');
const p = parseProduct('https://www.trustradius.com/products/slack/reviews?page=3');
describe('input', () => {
  it('urls & slugs', () => { expect(p.slug).toBe('slack'); expect(parseProduct('hubspot-crm').url).toBe('https://www.trustradius.com/products/hubspot-crm/reviews'); expect(pageUrl(p, 2)).toMatch(/\?page=2$/); });
  it('rejects G2 with a clear message', () => expect(() => parseProduct('https://www.g2.com/products/slack/reviews')).toThrow(/not supported/));
});
describe('parse', () => {
  it('product meta', () => expect(parseProductMeta(html, p, 'n')).toMatchObject({ productName: 'Slack', ratingValue: 9, ratingScale: 10, reviewCount: 10271 }));
  const r = parseReviews(html, p, 'Slack', 'n');
  it('10 reviews', () => expect(r).toHaveLength(10));
  it('fields', () => {
    expect(r[0]).toMatchObject({ reviewId: 'slack-2025-10-23-01-47-47', rating: 8, ratingNormalized5: 4, date: '2025-11-05T19:49:20.867Z', vetted: true, useCases: 'Colleague communication.' });
    expect(r[0].pros.length).toBeGreaterThan(0); expect(r[0].cons.length).toBeGreaterThan(0);
    expect(r.every((x) => x.rating !== null && x.reviewUrl.startsWith('https://www.trustradius.com/reviews/'))).toBe(true);
  });
  it('no reviewer identity by default', () => { expect(JSON.stringify(r)).not.toMatch(/Verified User|reviewerRole/); expect(parseReviews(html, p, 'Slack', 'n', true)[0].reviewerRole).toMatch(/employees/); });
  it('challenge detection', () => { expect(isChallenge('<title>Just a moment...</title>')).toBe(true); expect(isChallenge(html)).toBe(false); });
  it('prompt', () => expect(summaryPrompt('Slack', r)).toMatch(/strict JSON/));
});
