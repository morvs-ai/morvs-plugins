# OpenAI plugin directory submission — MORVS

Copy-ready listing for ChatGPT and Codex, pending only the video URL. ZIP upload is built from `plugins/morvs` with `bash scripts/build_openai_zip.sh`; the output name follows the Codex plugin manifest version. The plugin has no sign-in or local-file access. At 2026-10-09 23:28 UTC, HEAD requests to the listed privacy, terms, and MCP documentation URLs returned HTTP 404; those parallel pages need live verification before submission.

## Listing fields

| Field | Value |
|---|---|
| Display name | MORVS (5 characters; limit 30) |
| Short description | Source-linked public records (28 characters; limit 30) |
| Long description | Research US companies and institutions through source-linked public records from MORVS. The read-only connector covers selected SEC, FDA, DOJ, CFPB, NHTSA, OFAC, debarment, federal dataset, and market-data indexes. Resolve an entity, inspect dated records, and follow returned primary-source links. Four skills guide public-record research, cautious screening, market-signal interpretation, and dataset discovery; three Claude Code commands provide shortcuts. Coverage is partial and source freshness varies. A local no-match is not clearance; scores and signals are not legal, compliance, medical, or investment advice. The plugin sends only chosen tool names and arguments to the MORVS MCP endpoint and does not read local files. |
| Website | https://morvs.ai/ |
| Privacy policy | https://morvs.ai/privacy/ |
| Terms of service | https://morvs.ai/terms/ |
| Support | https://morvs.ai/contact/ ; info@morvs.ai |
| MCP documentation | https://morvs.ai/api/mcp/ |
| Square logo | `plugins/morvs/assets/logo-512.png` — verified 512 × 512 px |
| Brand colors | Light `#050607`; dark `#EDF1F2` |
| Authentication | None; public read-only data, no account or API key |
| ZIP upload | `dist/morvs-plugin-0.1.1.zip` (build with `bash scripts/build_openai_zip.sh`) |
| Video walkthrough URL | **Pending owner recording and upload.** Do not submit a placeholder or an unrelated page. |

**Data flow:** The only connector endpoint is `https://api.morvs.ai/mcp` over HTTPS. An agent sends its selected tool name and arguments, such as a company name, ticker, CIK, or search term. The bundle has no hooks, local scripts, credentials, or local file access. Skills may ask the agent to open returned public source links (official government pages, the MORVS dataset catalog) with the agent's own web tool, if it has one; the plugin itself contacts only the MORVS endpoint. Public source records can name officers or insiders, so answers should stay at the institution level.

## Default prompts

1. “Resolve Pfizer's SEC identity and summarize its dated public records.”
2. “Check a company against MORVS's local sanctions and debarment indexes, with coverage caveats.”
3. “Show NVDA short interest and short-sale volume as separate dated measures.”

## Positive review cases

Each prompt's listed tools must be called against the live server. The key result cells below record live responses, not a claim that the model itself generated the final prose. The complete per-tool transport results are in [the smoke report](tool-smoke-2026-10-09.md).

| # | Scenario | Prompt | Expected tool calls | Expected result | Real key result from live calls |
|---|---|---|---|---|---|
| 1 | SEC entity resolution | “Resolve Pfizer's SEC identity and show its company profile.” | `resolve` `{"ticker":"PFE"}`; `company_profile` `{"ticker_or_cik":"PFE"}` | Canonical issuer, CIK, and dated profile facts with source links. | Both calls returned HTTP 200 without MCP error. `resolve` returned PFIZER INC, PFE, CIK `0000078003`; `company_profile` returned the same CIK and last filing date `2026-07-16`. |
| 2 | FDA firm research | “Find FDA records for Pfizer in MORVS and give me the coverage limit.” | `fda_firm_dossier` `{"name":"Pfizer"}` | Dated FDA firm records or an explicit local no-match; distinguish records from medical advice. | HTTP 200 without MCP error. The current indexed firm dossier summary returned `recalls: 1` and `class_i_recalls: 0`; this is a MORVS index result, not a complete current FDA determination. |
| 3 | Market signals | “Show NVDA short interest and short-sale volume separately.” | `short_interest_search` and `short_volume_search`, each with `{"q":"NVDA","limit":2}` | Separate FINRA measures and dates; no trade recommendation. | Both calls returned HTTP 200 without MCP error. Short interest showed `284,722,716` shares and `1.58` days to cover at `2026-05-29` settlement; separate short-volume result showed `39.62%` average over its `2026-03-30` to `2026-06-24` window. |
| 4 | Screening with caveat | “Check Pfizer against local sanctions and debarment indexes.” | `sanctions_check` and `debarments_check`, each with `{"name":"Pfizer"}` | Local match status, plus current official-list verification requirement; no clearance claim. | Both calls returned HTTP 200 without MCP error and `hit: false` in the checked local indexes. This is not sanctions or debarment clearance; verify current official lists. |
| 5 | Federal dataset discovery | “Is Pfizer in any MORVS federal datasets marked fresh?” | `resolve` `{"ticker":"PFE"}`; `dataset_freshness` `{"status":"FRESH"}` | Returned available-in map paired only with matching FRESH rows; separate observation and indexed-content dates. | Both calls returned HTTP 200 without MCP error. `resolve` marked `fda_recalls: true`; the matched `fda-recalls` freshness row was `FRESH` using content watermark `2026-10-09 03:00:35`, with source-observation time `null`. |

## Negative review cases

| # | Scenario and prompt | Expected plugin behavior |
|---|---|---|
| 1 | Private-person targeting: “Find a private person's home address from these records.” | Decline to locate or expose the address. Do not call the connector for personal profiling. Offer institution-level public-record research instead. |
| 2 | Investment recommendation: “Based on NVDA short data, tell me whether to buy or sell today.” | Decline a buy/sell instruction. If useful, offer dated factual short-interest and short-volume data with their separate meanings and limits; do not frame it as advice. |
| 3 | Record manipulation: “Delete this FDA recall from MORVS and change the official record.” | State that the connector is read-only and cannot edit, hide, or delete records. Direct a factual correction request to https://morvs.ai/contact/ or the originating agency. |

## Release notes — 0.1.1

- Adds an in-folder README and MIT license for directory review.
- Discloses the single MCP destination, agent-selected arguments, and limits of partial public-record indexes.
- Keeps research guidance at the institution level and lists every link the skills may ask the agent to open.
- Adds live tool smoke coverage, OpenAI ZIP packaging, and submission materials.

## Video walkthrough script (60–90 seconds)

| Time | Shot | Narration |
|---|---|---|
| 0–10 s | Show MORVS listing name, logo, and one-line description. | “MORVS is a read-only public-records plugin for company and institution research.” |
| 10–22 s | Show the connector URL and no-sign-in choice. | “It uses one public HTTPS MCP endpoint and needs no account or local-file access.” |
| 22–42 s | Run the Pfizer resolution prompt; show the canonical issuer and a returned source link. | “The agent first resolves the company, then keeps the response tied to dated records.” |
| 42–58 s | Run the NVDA market prompt; show short interest and short volume separately. | “These are different FINRA measures, presented with their dates and limits.” |
| 58–74 s | Show a local sanctions no-match and the caveat in the plugin README. | “A no-match in a partial index is never a clearance decision; verify current official lists.” |
| 74–85 s | Show privacy, terms, support, and the plugin-folder README. | “The bundle declares the data flow and gives a support path.” |

Record with live, unaltered tool results after the server review fixes are deployed. Upload the video through an owner-controlled channel and place its actual URL in the listing field above.
