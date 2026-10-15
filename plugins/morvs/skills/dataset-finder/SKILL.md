---
name: dataset-finder
description: This skill should be used when a user asks to find a MORVS or Voidly public dataset, identify a keyless JSON endpoint, check dataset dates and coverage, or understand source attribution and reuse terms.
---

# Dataset finder

The public [MORVS and Voidly dataset catalog](https://morvs.ai/voidly/datasets.json) is a static, keyless JSON document. Fetch it when answering; do not rely on a remembered entry or count. It is distinct from MORVS's federal data hub and its MCP tools.

## Workflow

1. Fetch the catalog through an available read-only HTTPS tool, such as Claude Code WebFetch or Codex web.run. Search entries by topic, name, ID, and description. Do not invent a catalog search MCP tool; none appears in the 2026-10-15 live 75-tool list.
2. For each relevant entry, record the landing page, JSON endpoint, extra endpoints, description, counts, build date or observed-at time, and stated license or rights. Follow the entry's endpoint and source/provenance links before claiming current coverage. A catalog count is a dated observation, not a live promise.
3. Read license and rights at both catalog and entry level. For entries derived from third-party material, follow upstream terms; a compilation license does not automatically cover raw source data. State attribution and commercial-reuse limits only when verified at the linked terms.
4. For a federal data hub source found through an entity, call `resolve` with a ticker, CIK, or name to inspect the available-in map, then call `dataset_freshness` with `{}` for source-specific cadence, last successful observation, and indexed-content watermark. Do not apply that freshness result to the static catalog entries unless the dataset is actually represented in the returned row.
5. One catalog dataset also has MCP tools: the [Drone Register](https://morvs.ai/voidly/drone-register/) (endpoint `https://morvs.ai/drone-register/index.json`) is queried by `drone_company_check` with `{"name":"Company name"}` and `drone_product_lookup` with `{"q":"Model or component"}`, both read from that published file. Prefer them over fetching the whole file for a single company or model; a non-match there is "not found in the Drone Register", never clearance.
6. Return only institution-level or aggregate facts. Avoid PII, unsupported accusations, or treating data absence as evidence of no activity.

| Dataset | Best use | Landing / JSON endpoint | Data date and coverage | Rights / upstream terms | Checked on |
|---|---|---|---|---|---|
| Catalog name | Plain-language use | Both clickable links | Explicit date semantics and gaps | Exact catalog or source terms | Access date |

## Worked examples

**Banned-books data.** For “Find a reusable banned-books JSON source”, use WebFetch or web.run to fetch [the catalog](https://morvs.ai/voidly/datasets.json), select its Verboten entry, and open its listed landing page and endpoint. Read the entry's license and source links. Report the current endpoint, its date/coverage, and the stated terms with citations; do not copy a remembered catalog count as live coverage. No MORVS MCP catalog tool is needed.

**Company-linked federal dataset.** For “Which MORVS federal datasets mention Pfizer?”, call `resolve` with `{"ticker":"PFE"}`. Use its available-in map and links to choose datasets, then call `dataset_freshness` with `{}` and match returned dataset rows. If the user also wants a static Voidly dataset, fetch [the separate catalog](https://morvs.ai/voidly/datasets.json) and check that entry's own endpoint and rights. Keep the two coverage systems separate.
