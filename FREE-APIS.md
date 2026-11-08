# Free API — kandidáti pre Fakturio

Zoznam free API **bez API kľúča**, ktoré dávajú zmysel pre SK/CZ fakturačnú appku.
Služby s ApiKey / tokenom (Resend, Brevo, FIO, …) zatiaľ nepoužívame.

## Už napojené (bez kľúča)

| API | Účel | Stav |
|---|---|---|
| [ARES](https://ares.gov.cz/stranky/vyvojar-info) | Lookup CZ firiem podľa IČO | ✅ |
| [RPO](https://rpo.minv.sk/rpo-api-doc.html) | Lookup SK firiem podľa IČO | ✅ |
| [Subjekt.sk](https://api.subjekt.sk/) | DIČ / IČ DPH + FS DPH platiteľ | ✅ enrich + `FS DPH` tlačidlo |
| [ORSF](https://orsf.sk/en/api) | SK search + detail (prefer pred RPO) | ✅ typeahead + lookup |
| [VIES](https://ec.europa.eu/taxation_customs/vies/) | Overenie IČ DPH v EÚ | ✅ tlačidlo pri IČ DPH |
| [Frankfurter](https://api.frankfurter.dev/) (ECB) | Kurzy + historický kurz k dátumu | ✅ hint na faktúre (`?date=`) |
| [ČNB](https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/) | Denné CZK kurzy | ✅ preferované pre CZK páry |
| [ORSR Open Data](https://sluzby.orsr.sk/) | Výpis / dokumenty zo zbierky | ✅ tlačidlo pri IČO |
| IBAN (lokálne SK + [openiban](https://openiban.com/)) | Banka / BIC z IBAN | ✅ blur + tlačidlo |
| [Nominatim](https://nominatim.openstreetmap.org/) (OSM) | Normalizácia adries + PSČ SK/CZ | ✅ (rate limit + cache) |
| [ADISREG](https://adisspr.mfcr.cz/pmd/dokumentace/webove-sluzby-spolehlivost-platcu) | CZ nespolehlivý plátca DPH + účty | ✅ SOAP + tlačidlo (CZ) |
| [ISIR CUZK WS](https://eisir.justice.cz/dalsi-sluzby/) | CZ insolvenčný rejstřík podľa IČO | ✅ SOAP + tlačidlo (CZ) |
| [RegisterUZ / RÚZ](https://registeruz.sk/cruz-public/home/api) | SK účtovné jednotky + závierky | ✅ REST + tlačidlo (SK) |
| Pay by Square (lokálne) | QR platba na PDF | ✅ bez remote API |

## Neskôr (vyžadujú kľúč / token — mimo scope)

| API | Prečo nie teraz |
|---|---|
| Resend / Brevo | ApiKey |
| FIO Banka API | token z internetbankingu |
| FinStat | platené |
| SendGrid / Abstract / IPinfo | ApiKey / free-tier s kľúčom |

## Endpointy v appke

- `GET /api/registry/{country}/{ico}` — ARES / ORSF→RPO
- `GET /api/registry/search?q=` — ORSF fulltext (SK)
- `GET /api/registry/vies?vat=` — VIES
- `GET /api/fx/rates?base=EUR&symbols=CZK,USD&date=yyyy-MM-dd` — ČNB (CZK) / Frankfurter
- `GET /api/integrations/iban?iban=` — banka / BIC
- `GET /api/integrations/fs-vat/{ico}` — FS SK DPH platiteľ
- `GET /api/integrations/address?q=&country=SK` — Nominatim
- `GET /api/integrations/orsr/{ico}` — ORSR výpis + dokumenty
- `GET /api/integrations/adisreg/{dic}` — CZ nespolehlivý plátca + účty
- `GET /api/integrations/isir?ico=` — ISIR insolvenčné konania
- `GET /api/integrations/register-uz?ico=` — RegisterUZ účtovná jednotka
- `GET /api/integrations/postal?code=&country=SK[&city=]` — PSČ validácia SK/CZ

## Poznámky

- Registry / integrácie volať len zo servera, soft-fail pri výpadku.
- Nominatim: max ~1 req/s, User-Agent povinný, výsledok v pamäťovej cache.
- ADISREG / ISIR: SOAP cez named HttpClient, soft-fail pri odstávke (statusCode 2/3, SOAP Fault).
- Licencie: ORSF CC-BY 4.0, RPO/ARES = podmienky MV/ČR, ECB/ČNB kurzy voľné, OSM ODbL, RÚZ / ADISREG / ISIR = oficiálne open služby štátu.
