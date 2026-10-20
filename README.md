# TrustRadius Reviews Scraper (B2B software reviews)

[![Apify Store](https://img.shields.io/badge/Apify%20Store-live-0F62FE?logo=apify&logoColor=white)](https://apify.com/ener90/software-reviews-scraper)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Crawlee](https://img.shields.io/badge/Crawlee-3-FF4785)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Scrapes B2B software reviews from TrustRadius (rating, pros, cons, use cases, likelihood to recommend, date) plus product-level rating, with an optional bring-your-own-key AI summary. No reviewer names.

▶️ **Run it on the Apify Store:** https://apify.com/ener90/software-reviews-scraper

## Tech stack
TypeScript, Node.js 22, Crawlee (PlaywrightCrawler), Playwright, Cheerio, Apify SDK, Vitest.

## Architecture
```
src/
  parsers.ts   # pure, unit-tested parsing/transform logic (no I/O)
  main.ts      # Actor entry: input validation, crawling, retries, output
.actor/        # Apify Actor config: input/output/dataset schemas, Dockerfile, Store README
tests/         # Vitest unit tests + real HTML/JSON fixtures
```
- `parsers.ts`: Cheerio parsers for review cards and JSON-LD product metadata, anti-bot challenge detection, AI prompt builder.
- `main.ts`: Crawlee `PlaywrightCrawler` (real Chrome, fingerprints, residential proxy) that waits out Cloudflare, blocks heavy resources to cut proxy cost, rotates sessions and paginates.

Design principles: **reliability first** (session rotation, retries, block detection, clear error messages), **privacy by default** (no personal data is collected), **low cost** (small memory footprint, resource blocking, pay-per-event pricing).

## Run locally
```bash
npm install
npm test            # 8 unit tests (Vitest)
npm run build
# put an input in storage/key_value_stores/default/INPUT.json, then:
npm start           # or: apify run
```
Deploy: `apify login && apify push`.

## Input / output
See [`.actor/input_schema.json`](.actor/input_schema.json), [`.actor/dataset_schema.json`](.actor/dataset_schema.json) and the full user docs in [`.actor/STORE_README.md`](.actor/STORE_README.md) (English & Spanish).

## Legal & privacy
Collects only publicly available data and deliberately drops personal identifiers. Users are responsible for complying with the target site's terms and applicable law.

## License
MIT © René Del Valle Rodríguez
