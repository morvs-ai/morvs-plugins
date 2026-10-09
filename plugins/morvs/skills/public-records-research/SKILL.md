---
name: public-records-research
description: This skill should be used when a user asks to research a company in public records, assemble an entity timeline, inspect a cross-source dossier, or find material events with dated source citations.
---

# Public records research

Build a source-linked, institution-level account from MORVS public datasets. Treat a name match as a lead until an identifier and underlying record support it.

## Workflow

1. Define the organization, jurisdiction, period, and question. Avoid collecting or repeating personal identifiers, residential addresses, or other PII. Report institution-level facts.
2. Call `resolve` with exactly one known identifier when possible: `{"ticker":"PFE"}`, `{"cik":"0000078003"}`, or `{"q":"Pfizer"}`. Inspect canonical name, aliases, identifiers, available sources, and source links. Disambiguate similar names before proceeding.
3. Select the narrowest useful tool:
   - `entity_timeline` with `{"key":"PFE","days":180,"limit":100}` for a dated cross-source event sequence. The key accepts ticker, CIK, UEI, LEI, DUNS, or numeric entity ID; maximum days is 730.
   - `entity_material_events` with `{"key":"PFE","days":180}` for the high-signal subset. Its importance threshold is a MORVS selection rule, not an official finding.
   - `dossier` with `{"ticker":"PFE"}` or `{"name":"Pfizer"}` for the cross-topic overview.
   - `company_profile` with `{"ticker_or_cik":"PFE"}` for an SEC-filing company profile. Do not use its absence to infer that a private organization has no records.
4. Check the returned period, per-source coverage, record dates, and source links. Call `dataset_freshness` with `{}` if using a federal hub dataset and match its row to the dataset; distinguish source-observation time from indexed-content watermark. Mark unknown or stale coverage plainly. A missing hit is not evidence of no activity.
5. Open the primary record URL for material claims when available. Distinguish a filing, complaint, press release, recall, contract, and agency finding. State only what the source establishes. Never turn a mention, allegation, or automated flag into an accusation.
6. Return a short answer followed by a record table. Give access date and source date; omit a claim when no verifiable record URL is available.

| Event or fact date | Institution-level finding | Dataset and source | Record ID | Primary record URL | Coverage or freshness |
|---|---|---|---|---|---|
| Use the record's date | State only the supported fact | Name the agency and MORVS index | If supplied | Link to the exact record | State the source window and any gap |

## Worked examples

**A public company's recent regulatory history.** For “What happened at Pfizer over the last six months?”, call `resolve` with `{"ticker":"PFE"}`, then `entity_timeline` with `{"key":"PFE","days":180,"limit":100}` and `entity_material_events` with `{"key":"PFE","days":180}`. Use `company_profile` with `{"ticker_or_cik":"PFE"}` only if financial and SEC context matters. Reconcile duplicates by record ID and date; cite each original filing or agency record. Do not infer misconduct from a high importance score.

**An ambiguous organization name.** For “Research Acme Health”, call `resolve` with `{"q":"Acme Health"}`. Present candidate organizations and identifiers if more than one appears. After a verified match, call `dossier` with the exact organization name and `entity_timeline` with its returned identifier. If no identifier resolves, give only clearly attributed search leads and say the match is unconfirmed.
