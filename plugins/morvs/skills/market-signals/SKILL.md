---
name: market-signals
description: This skill should be used when a user asks about a public company's insider activity, FINRA short interest or short-sale volume, SEC fails to deliver, or a possible squeeze signal with dated source evidence.
---

# Market signals

Treat all signal rankings as research leads, not trading recommendations or proof of manipulation. FINRA short-sale volume is not short interest; a fail to deliver is not by itself evidence of naked shorting. Form 4 records executed transactions; Form 144 records proposed sales.

## Workflow

1. Confirm the issuer and ticker with `resolve`, for example `{"ticker":"NVDA"}`. Check share classes and security identifiers before joining datasets.
2. For insider activity, call `company_insider_pulse` with `{"ticker_or_cik":"NVDA","days":90}`. Use `cluster_buys` with `{"days":90,"min_insiders":3}` or `cluster_sells` with `{"days":30,"min_insiders":4}` for discovery; then inspect the underlying filings for the named issuer. Distinguish transaction code, transaction date, filing date, executed trades, and planned sales. Summarize at issuer level without repeating individuals' personal details.
3. For FINRA, call `short_interest_search` with `{"q":"NVDA"}` for settlement-date short positions and days to cover. Call `short_volume_search` with `{"q":"NVDA"}` for the separate rolling short-sale volume series. Do not add or equate the two measures. Respect [FINRA source terms](https://www.finra.org/terms-of-use).
4. Call `fails_to_deliver_search` with `{"q":"NVDA"}` for SEC fail balances and days with fails. Do not sum daily outstanding balances into a claim of unique unsettled shares without a valid method.
5. If asked for candidates, call `short_squeeze_candidates` with `{"min_score":70,"limit":20}` or `short_interest_squeeze` with `{}`. The MORVS pressure score combines inputs with a heuristic. Verify each candidate's ticker, settlement date, data window, liquidity, corporate actions, and source rows before interpretation.
6. Call `dataset_freshness` with `{}` and match relevant dataset rows. State the latest available FINRA settlement, trading, SEC reporting, and MORVS observation dates separately. Cite exact SEC filings and data records when supplied; if only an aggregate endpoint is returned, label it an aggregate and link it.

| Source date or window | Issuer/security | Measure or event | Value and units | Primary record URL | Interpretation limit |
|---|---|---|---|---|---|
| Settlement, trade, or filing date | Ticker and identifier | Exact metric or filing | As returned, no invented precision | Link to record | Lag, coverage, and metric caveat |

## Worked examples

**One ticker's short-selling picture.** For “What is happening with NVDA shorting?”, call `resolve` with `{"ticker":"NVDA"}`, `short_interest_search` with `{"q":"NVDA"}`, `short_volume_search` with `{"q":"NVDA"}`, and `fails_to_deliver_search` with `{"q":"NVDA"}`. Report each source's date and units in separate rows. Do not interpret a high short-volume percentage as a high open short position.

**Insider and squeeze discovery.** For “Find recent insider buys and possible squeeze candidates”, call `cluster_buys` with `{"days":90,"min_insiders":3}` and `short_squeeze_candidates` with `{"min_score":70,"limit":20}`. For any overlapping ticker, call `company_insider_pulse` with that ticker and `short_interest_search` plus `fails_to_deliver_search` with the same ticker. Cite the underlying filings and source windows; call it a screened lead, not a buy signal.
