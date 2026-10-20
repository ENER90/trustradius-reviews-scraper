# TrustRadius Reviews Scraper (Software Reviews)

> **Source: TrustRadius only.** G2 and Capterra are currently **not supported**. / **Fuente: solo TrustRadius.** G2 y Capterra **no están soportados** por ahora.

**Pricing:** US$0.0015 per review (US$1.50 per 1,000). Product rows and the beta AI summary are free. / **Precio:** US$0,0015 por reseña (US$1,50 por 1.000); las filas de producto y el resumen IA (beta) no se cobran.

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

## 🤖 AI insights (optional) / Análisis con IA (opcional)

Turn on **AI insights** and paste your own **Gemini** key (free tier at [aistudio.google.com](https://aistudio.google.com/apikey)) or your **OpenAI** key. After scraping, the Actor adds one row per product with **sentiment %, top pros and cons, recurring complaints, feature requests, notable quotes and an executive summary**, so you get the main findings from 1,000 reviews in about a minute. **AI add-on price: US$0.0002 per review analyzed (US$0.20 per 1,000), event `review-analyzed`, effective 20 Oct 2026. Only charged when AI insights are on.** The AI tokens are billed by your own provider. It's off by default.

Activa **AI insights** y pega tu key de **Gemini** o de **OpenAI**. Al terminar, el actor agrega una fila por producto con el **% de sentimiento, los pros y contras principales, las quejas que se repiten, lo que piden los clientes y un resumen ejecutivo**. Precio del add-on: US$0,0002 por reseña analizada (US$0,20 por 1.000), vigente desde el 20 oct 2026; solo se cobra si activas el análisis con IA. Los tokens de IA los cobra tu proveedor. Viene desactivado por defecto.

## ❓ FAQ

**Is there a TrustRadius API?**
TrustRadius has no public reviews API. This scraper works as an unofficial TrustRadius API: export reviews to JSON, CSV, Excel or Google Sheets.

**Is it legal?**
It only collects publicly visible review content and never reviewer names. Check the terms that apply to your use case.

**¿Funciona en español?**
Sí. El soporte es en español y el output se puede exportar a Excel.

## 🔗 More scrapers by ener90 / Más scrapers de ener90

- [Mercado Libre Reviews & Questions Scraper](https://apify.com/ener90/mercadolibre-reviews-questions) – opiniones y preguntas de Mercado Libre
- [Mercado Libre Price Tracker](https://apify.com/ener90/mercadolibre-seller-price-monitor) – monitor de precios de tiendas oficiales de Mercado Libre
- [Walmart Reviews Scraper](https://apify.com/ener90/walmart-products-reviews) – reseñas y productos de Walmart
- [Product Hunt Scraper](https://apify.com/ener90/product-hunt-launches) – lanzamientos diarios de Product Hunt
- Chile Real Estate Scraper (Portal Inmobiliario + TocToc) (`ener90/chile-real-estate-scraper`, coming soon / próximamente) – propiedades en venta y arriendo en Chile
- AI Review Insights (`ener90/ai-review-insights`, coming soon / próximamente) – análisis de reseñas con IA

Need a custom scraper or a different site? Open an issue in the **Issues** tab. / ¿Necesitas un scraper a medida? Escríbeme en la pestaña **Issues** (soporte en español).

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
