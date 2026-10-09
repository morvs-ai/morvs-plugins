<p align="center"><img src="plugins/morvs/assets/logo-512.png" width="72" alt="MORVS mark" /></p>

<h1 align="center">MORVS for Claude and Codex</h1>

<p align="center">Source-linked US public records for AI agents. Keyless.</p>

<p align="center"><a href="https://morvs.ai/">morvs.ai</a> · <a href="https://morvs.ai/api/">API</a> · <a href="https://api.morvs.ai/openapi.json">OpenAPI</a> · <a href="https://morvs.ai/governance/corrections/">Corrections</a></p>

This plugin connects Claude Code and Codex to the [MORVS](https://morvs.ai/) public-records server and teaches the agent to use it carefully. Ask about a US company's filings, recalls, enforcement actions, contracts, lobbying or lawsuits, screen a counterparty against public sanctions and debarment lists, or find an open dataset — and get answers that cite the record and its primary source.

## Install

**Claude Code**

```
/plugin marketplace add morvs-ai/morvs-plugins
/plugin install morvs@morvs
```

**Codex**

```bash
codex plugin marketplace add morvs-ai/morvs-plugins
codex plugin add morvs@morvs
```

**Claude Desktop and claude.ai** — Settings → Connectors → Add custom connector → `https://api.morvs.ai/mcp`

**Any MCP client** — streamable HTTP at `https://api.morvs.ai/mcp`, no API key.

## What you get

| Part | What it does |
|---|---|
| MCP server `morvs` | 73 read-only tools over SEC, FDA, DOJ, CFPB, OFAC, SAM, HHS OIG, NHTSA, EPA, USPTO, courts, lobbying, FINRA and more |
| Skill `public-records-research` | Resolve an entity, build a dated timeline or dossier, cite each record |
| Skill `compliance-screening` | Sanctions, debarment and complaint checks with coverage caveats and official-list verification |
| Skill `market-signals` | Insider activity, FINRA short data and fails-to-deliver, as dated evidence |
| Skill `dataset-finder` | Pick the right dataset or keyless JSON endpoint and its reuse terms |
| Commands (Claude Code) | `/morvs:entity`, `/morvs:screen`, `/morvs:datasets` |

Try: *"Summarize Pfizer's regulatory record from the last six months"*, *"Screen Acme Corp against public sanctions and debarment lists"*, *"Find an open dataset on federal prison populations."*

## Limits worth knowing

- Several indexes are partial local copies. **No match is not clearance**: verify sanctions, exclusions and debarments on the official lists (OFAC, SAM.gov, HHS OIG) before acting.
- Experimental tools (for example `screen_all`) return indicative scores, not determinations.
- Freshness varies by source; the agent checks `dataset_freshness` and states it.
- Market tools are informational, not investment advice. Nothing here is legal advice.
- Institution-level data only — no personal data.

## Data terms

The plugin files are MIT-licensed. Data reached through the server keeps its source's terms: US federal employee-authored works are generally public domain under 17 U.S.C. § 105; non-federal and SRO material retains its own terms. See [api.morvs.ai/license](https://api.morvs.ai/license). Cite the record URL, the access date and the primary source.

## Development

```bash
node scripts/validate.mjs   # manifests, skills, commands, and every tool name against the live server
```

Built by [MORVS](https://morvs.ai/) (operated by AI Analytics LLC). Report a data error through the [corrections policy](https://morvs.ai/governance/corrections/) or `info@morvs.ai`.
