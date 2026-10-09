# Claude MCP connector submission — MORVS

Prepared for the developer portal. The listing describes the remote MCP server, separate from the [Claude plugin bundle](CLAUDE-PLUGIN.md). Portal publication and account attestations are for AI Analytics LLC to complete. At 2026-10-09 23:28 UTC, HEAD requests to the privacy, terms, and MCP documentation URLs returned HTTP 404; those pages are being built in parallel and must return usable content before submission.

## Connection URL

`https://api.morvs.ai/mcp` — public Streamable HTTP MCP over HTTPS.

## Listing

| Field | Portal value |
|---|---|
| Server name | MORVS |
| Slug | `morvs` |
| One-liner | Research source-linked US public records for companies and institutions. |
| Description | MORVS provides read-only tools for institution-level research across indexed US public records, including company filings, recalls, enforcement releases, sanctions and debarment lists, federal datasets, and market-structure data. Resolve an entity, inspect dated results, and follow returned record and primary-source links. Coverage and freshness differ by source; a local no-match is not clearance. Automated scores are research aids, not legal, compliance, medical, or investment advice. No account or API key is required. |
| Categories | Research; Data & analytics |
| Documentation URL | https://morvs.ai/api/mcp/ |
| Privacy URL | https://morvs.ai/privacy/ |
| Support contact | info@morvs.ai |
| Icon file | `plugins/morvs/assets/logo-512.png` |

## Use cases

- Resolve a public company's SEC identity and inspect source-linked filings and recent events.
- Review FDA and NHTSA recall records by firm or manufacturer, with record dates and coverage limits.
- Research sanctions, exclusions, and debarments as possible local-index matches, with current official-list verification required before action.
- Compare dated market signals without treating short volume as short interest or an indicator as trading advice.
- Identify federal hub datasets for an entity and check source-observation and indexed-content dates.

**Prerequisites:** None. No user account, API key, OAuth flow, or sample-data account is required; the test entities below are public. **Actions:** Read data only. The server has no record-modification, payment, or outbound-message tool.

## Company

| Field | Portal value |
|---|---|
| Legal company | AI Analytics LLC |
| Operating brand | MORVS |
| Website | https://morvs.ai/ |
| Contact and compliance email | info@morvs.ai |
| Support site | https://morvs.ai/contact/ |

## Authentication

**None — public data.** Select “No sign in.” No OAuth client, API key, shared credential, or request header is needed.

## Data handling

The connector calls MORVS's own API, which indexes public government and related public regulatory records. The agent sends only the selected tool name and arguments (for example, a company name, ticker, CIK, or search term) to `https://api.morvs.ai/mcp`. The connector does not ask for local files, chat history, or credentials and has no write tools. It does not provide patient records or personal health data. Public filings may name officers or insiders; the plugin guides institution-level answers and omission of private personal details. It serves no advertisements, sponsored content, or paid placement. The linked privacy policy should describe server-side handling and retention; the plugin bundle itself has no persistence.

## Test and launch: reviewer instructions

No account is needed. Connect to the URL, inspect `tools/list`, and use these prompts. Each example calls only public, read-only tools. A result can contain a dated no-match or incomplete local coverage; that is not an API error or clearance.

| Prompt | Expected tool(s) | Expected behavior |
|---|---|---|
| “Resolve Pfizer's SEC identity and show its company profile.” | `resolve` with `{"ticker":"PFE"}`; `company_profile` with `{"ticker_or_cik":"PFE"}` | Returns a canonical issuer and dated profile facts with source links. |
| “Show FDA records for Pfizer as a firm.” | `fda_firm_dossier` with `{"name":"Pfizer"}` | Returns dated FDA firm records with coverage and source limits. |
| “What do current MORVS FINRA short-interest records show for NVDA?” | `short_interest_search` with `{"q":"NVDA","limit":2}` | Returns a dated short-interest lookup; does not recommend a trade. |
| “Check Pfizer against the local sanctions and debarment indexes.” | `sanctions_check` and `debarments_check`, each with `{"name":"Pfizer"}` | Returns local-index match status and states that current official-list verification is required. |
| “Is Pfizer in any MORVS federal datasets marked fresh?” | `resolve` with `{"ticker":"PFE"}`; `dataset_freshness` with `{"status":"FRESH"}` | Returns the entity's available-in map and matching FRESH rows, keeping observation and content dates distinct. |

Review `submission/tool-smoke-2026-10-09.md` for measured HTTP status, latency, response bytes, and exact failures across every live tool. At 2026-10-09 23:30 UTC, all 73 live tools had a title, `readOnlyHint: true`, and `destructiveHint: false`. In a separate read-only check, `search_340b` returned `https://api.morvs.ai/340b/CAH201309-00` as a record URL, but that URL returned HTTP 404 at 2026-10-09 23:28 UTC; correct the returned link before reviewer use. Launch remains subject to invalid-input error fixes, reliable tool responses, and live privacy/docs/terms pages.

## Compliance acknowledgements (the portal's seven)

The portal asks for seven acknowledgements. How MORVS meets each, per the [Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy) and [Directory Terms](https://support.claude.com/en/articles/13145338-anthropic-software-directory-terms):

1. **Directory guidelines:** read-only public-records research; every tool has a title and `readOnlyHint: true`; tool names are under 64 characters; invalid arguments return actionable errors.
2. **First-party API usage:** the server is MORVS's own API on MORVS's own domain (api.morvs.ai), operated by AI Analytics LLC; it serves MORVS's own index of public records.
3. **Financial transactions:** no tool moves money, crypto or any other asset; market tools return published FINRA/SEC data only.
4. **AI media generation:** no tool generates images, video or audio.
5. **Prompt injection:** tool descriptions say what each tool does and give no instructions about Claude's behaviour, other tools or external sources.
6. **Conversation data collection:** the server receives only the tool arguments Claude sends; it never asks for chat history, memory or files. Search queries are logged without IP addresses as usage statistics, as the privacy policy states.
7. **Public documentation:** https://morvs.ai/api/mcp/ (connection, every tool), https://morvs.ai/privacy/, https://morvs.ai/terms/.
