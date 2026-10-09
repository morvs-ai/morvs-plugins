# Claude plugin bundle submission — MORVS

## Source and pairing

| Field | Portal value |
|---|---|
| Repository | `morvs-ai/morvs-plugins` |
| Branch | `main` |
| Plugin folder | `plugins/morvs` |
| Owner | AI Analytics LLC, operating MORVS |
| Compliance contact | info@morvs.ai |
| License | MIT, in `plugins/morvs/LICENSE` |

Submit the plugin bundle alongside the [MORVS connector listing](CLAUDE-CONNECTOR.md). The bundle's `.mcp.json` points only to `https://api.morvs.ai/mcp`. The connector listing must be approved or paired as the portal requires; the repository bundle is not a separate server and does not grant access to additional destinations.

## What reviewers receive

The plugin folder has its own README, the MIT license, one remote MCP connection, four plain-text skills, three Claude Code commands, and logo assets. It has no hooks, local scripts, bundled executable, or credential. Skills guide institution-level research, coverage caveats, citations, and use of the connector. Skills may ask the agent to open returned public source links (official government pages, the MORVS dataset catalog) with the agent's own web tool, if it has one; the bundle itself contacts only the MORVS endpoint.

## Data-handling answers

| Question | Answer |
|---|---|
| Does the plugin read personal data? | It does not read local files, uploaded files, chat history, or private personal data. Public source records returned by the API can contain officer or insider names; the skills direct institution-level summaries and omission of private details. |
| Does the plugin store personal data? | No. The bundle has no storage or persistence. The API's request handling is governed by https://morvs.ai/privacy/. |
| What does it send? | Only the agent-selected MCP tool name and arguments to `https://api.morvs.ai/mcp` over HTTPS. Typical arguments are an organization name, ticker, CIK, or search phrase. |
| Retention | None in the plugin bundle. Do not infer or promise zero server-side logs; see the privacy policy for server retention. |
| Under-18 audience | Not intended for children under 18. It is a public-records research tool for professional and general adult use. |
| Credentials and local access | None. No account, API key, hooks, local scripts, or file access. |
| Privacy, terms, support | https://morvs.ai/privacy/ · https://morvs.ai/terms/ · info@morvs.ai |

The [plugin README](../plugins/morvs/README.md) discloses the connector's data flow and limits. Before submission, confirm the three new public policy/documentation pages are live, review the [tool smoke report](tool-smoke-2026-10-09.md), and align both plugin manifest versions.
