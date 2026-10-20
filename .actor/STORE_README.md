# TrustRadius Reviews Scraper (Software Reviews)

> **Source: TrustRadius only.** G2 and Capterra are currently **not supported**. / **Fuente: solo TrustRadius.** G2 y Capterra **no están soportados** por ahora.

**Pricing:** US$0.003 per review (US$3 per 1,000). Product rows and the beta AI summary are free. / **Precio:** US$0,003 por reseña; las filas de producto y el resumen IA (beta) no se cobran.

🇬🇧 [English](#english) · 🇪🇸 [Español](#español)

## English

Scrape **B2B software reviews from TrustRadius**. For each review you get the rating (/10 and /5), pros, cons, use cases, likelihood to recommend, date, source (e.g. *Incentivized*), vetted flag and URL. You also get a product row (overall rating, review count) and an optional **AI summary** per product (sentiment, top pros and cons, common complaints). Reliability first: it runs a real browser over a residential proxy, retries automatically and rotates sessions on anti-bot pages. **Reviewer names are never collected.**

**Use cases**
- Competitive research and battlecards: what users love or hate about competitors.
- Product and market research: frequent complaints and feature gaps.
- Feeding reviews to an AI agent or a RAG pipeline.

**Input example**
```json
{ "products": ["slack", "hubspot-crm"], "maxReviewsPerProduct": 100, "aiSummary": false }
```
You can use either `startUrls` with TrustRadius product URLs or `products` with slugs (the part after `/products/`).

**Output example (review)**
```json
{ "type": "review", "productName": "Slack", "rating": 8, "ratingNormalized5": 4, "date": "2025-11-05T19:49:20.867Z",
  "pros": ["Direct communication with teams…"], "cons": ["Group chats limited to nine people…"],
  "useCases": "Colleague communication.", "likelihoodToRecommend": "…", "reviewSource": "Incentivized", "vetted": true,
  "reviewUrl": "https://www.trustradius.com/reviews/slack-2025-10-23-01-47-47" }
```

**AI summary (optional):** set `aiSummary: true` and supply your own OpenAI-compatible key (`aiApiKey`). OpenAI, OpenRouter, xAI and Groq all work through `aiBaseUrl`. You get one `ai-summary` row per product.

**Integrations:** the Apify API (`run-sync-get-dataset-items`), n8n, Make and Zapier (official Apify node or app), and the [Apify MCP server](https://mcp.apify.com) for Claude, ChatGPT or Cursor ("summarize the latest TrustRadius reviews of HubSpot CRM"). Export to JSON, CSV or Excel.

**FAQ**
- *G2 / Capterra?* Not yet. Both use strong anti-bot protection (DataDome and Cloudflare Turnstile), and we only ship sources that work reliably. They're on the roadmap.
- *How many reviews per page?* 10, newest first. Set `maxReviewsPerProduct`.
- *Personal data?* No names. Reviewer role and company size are opt-in (`includeReviewerInfo`).
- *Legal?* Only public review content is collected. Check TrustRadius's terms and your local law for your use case.

## Español

Extrae **reseñas de software B2B desde TrustRadius**. Cada reseña trae la nota (/10 y /5), pros, contras, casos de uso, probabilidad de recomendar, fecha, origen (por ejemplo *Incentivized*), si está verificada y la URL. Además entrega una fila por producto (nota general y número de reseñas) y, opcionalmente, un **resumen con IA** por producto (sentimiento, principales pros y contras, quejas frecuentes). Está pensado para ser confiable: usa un navegador real con proxy residencial, reintenta solo y cambia de sesión cuando aparece una página antibot. **No guarda nombres de quienes escriben las reseñas.**

**Casos de uso:** análisis de la competencia, investigación de producto (quejas frecuentes y funciones que faltan) y alimentar agentes de IA o pipelines RAG.

**Entrada:** `products` con slugs (por ejemplo `slack`) o `startUrls` con URLs de TrustRadius, y `maxReviewsPerProduct`. Para el resumen con IA, `aiSummary` y tu propia clave (`aiApiKey`). El rol y el tamaño de empresa del autor van solo si activas `includeReviewerInfo`.

**Integraciones:** API de Apify, n8n, Make, Zapier y el servidor MCP de Apify (Claude, ChatGPT, Cursor). Exporta a JSON, CSV o Excel.

**Preguntas frecuentes**
- *¿G2 y Capterra?* Todavía no, por su antibot fuerte (DataDome y Cloudflare Turnstile). Están en el roadmap.
- *¿Datos personales?* No se guardan nombres.
- *¿Es legal?* Solo se extrae contenido público de las reseñas. Revisa los términos de TrustRadius y las leyes de tu país para tu caso.

## 🧩 API & integrations quick start

**cURL (sync, returns items)**
```bash
curl -X POST "https://api.apify.com/v2/acts/ener90~software-reviews-scraper/run-sync-get-dataset-items?token=YOUR_APIFY_TOKEN" \
  -H "Content-Type: application/json" -d '{"products":["slack"],"maxReviewsPerProduct":50}'
```

**Node.js**
```js
import { ApifyClient } from 'apify-client';
const client = new ApifyClient({ token: process.env.APIFY_TOKEN });
const run = await client.actor('ener90/software-reviews-scraper').call({"products":["slack"],"maxReviewsPerProduct":50});
const { items } = await client.dataset(run.defaultDatasetId).listItems();
```

**Python**
```python
from apify_client import ApifyClient
client = ApifyClient("YOUR_APIFY_TOKEN")
run = client.actor("ener90/software-reviews-scraper").call(run_input={"products":["slack"],"maxReviewsPerProduct":50})
items = client.dataset(run["defaultDatasetId"]).list_items().items
```

- **Google Sheets:** add the *Google Sheets* integration to a saved Task, or use `=IMPORTDATA("https://api.apify.com/v2/datasets/<DATASET_ID>/items?format=csv&clean=1")`.
- **n8n / Make / Zapier:** use the official Apify node or app: *Run Actor* (`ener90/software-reviews-scraper`) → *Get dataset items*.
- **Webhooks:** on a Task, add an integration *Run succeeded* → your URL (gets `defaultDatasetId`).
- **AI agents (MCP):** `https://mcp.apify.com?actors=ener90/software-reviews-scraper` works in Claude, ChatGPT, Cursor or any MCP client.
- **Free plan:** works on Apify's free tier; usage is billed per result (see Pricing). Start with small limits to try it out.

## 📝 Changelog
- 0.1 (2026-10-20): first public release (TrustRadius). G2/Capterra not supported yet. AI summary in beta (free).

Issues or ideas? Open an issue in the **Issues** tab and we usually reply within 24 h.
