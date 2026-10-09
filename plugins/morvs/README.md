# MORVS public-records plugin

MORVS gives Claude and Codex a read-only way to research public records about US companies and institutions. It is operated by AI Analytics LLC. The bundle contains one MCP connection, four skills (public-records research, compliance screening, market signals, and dataset finding), and three Claude Code commands (`/morvs:entity`, `/morvs:screen`, and `/morvs:datasets`). The skills guide how to interpret source dates, identifiers, and coverage; they do not run code themselves.

## What it connects to

- **The plugin's own connection:** one MCP server, **https://api.morvs.ai/mcp**, over HTTPS. When the agent calls a MORVS tool, the server receives the tool name and the arguments the agent chooses (for example a company name, ticker, CIK or search term) and returns indexed public-record data. Search queries are logged without IP addresses as usage statistics; see the privacy policy.
- **Links the skills may ask the agent to open:** the public MORVS dataset catalog (https://morvs.ai/voidly/datasets.json) and the official government pages that hold the primary record (for example ofac.treasury.gov, sam.gov, exclusions.oig.hhs.gov, sec.gov). The agent opens these only with its own web tool, if it has one and you allow it; the plugin itself sends nothing to them.
- **Nothing else:** no hooks, no local scripts, no credentials or API keys, no access to your local files, and no telemetry from the plugin itself.

MORVS indexes are partial and freshness varies by source. A no-match result is **not clearance**, and an automated score is not a legal, compliance, medical, or investment determination. Confirm material findings and any sanctions or exclusions against current official records before acting. Some public filings contain names of company officers; keep answers at the institution level and avoid private personal details.

Plugin files are licensed under [MIT](LICENSE). Source data keeps its own terms. See the [MORVS privacy policy](https://morvs.ai/privacy/), [terms](https://morvs.ai/terms/), [MCP documentation](https://morvs.ai/api/mcp/), and [support](https://morvs.ai/contact/), or email [info@morvs.ai](mailto:info@morvs.ai).
