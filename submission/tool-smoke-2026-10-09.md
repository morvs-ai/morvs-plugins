# MORVS live MCP tool smoke — 2026-10-09

Run started: 2026-10-09T23:28:16.274Z. Endpoint: https://api.morvs.ai/mcp. Live tools/list count: 73.
Calls were sequential and started at least 500 ms apart (at most two requests per second). Bytes are UTF-8 response-body bytes. HTTP status, elapsed milliseconds, and MCP content/error state are recorded. A no-match data result is distinct from an MCP error.

Valid-call errors: **0**. Invalid calls without a signaled error: **35**. Largest valid response: **43306 bytes**. Missing examples: **0**.

| Tool | Valid arguments | HTTP | ms | bytes | Error content? | Invalid call | Invalid HTTP | Invalid error? | Invalid message |
|---|---|---:|---:|---:|---|---|---:|---|---|
| search | `{"q":"Pfizer","topic":"sec","limit":2}` | 200 | 211 | 3985 | no | `{}` | 200 | yes | "missing q parameter" |
| dossier | `{"ticker":"PFE"}` | 200 | 562 | 7589 | no | `{"name":{"invalid":true}}` | 200 | no |  |
| company_profile | `{"ticker_or_cik":"PFE"}` | 200 | 178 | 6038 | no | `{}` | 200 | yes | {"code":-32603,"message":"Unknown ticker or CIK"} |
| company_risk_flags | `{"ticker_or_cik":"PFE"}` | 200 | 226 | 1803 | no | `{}` | 200 | yes | {"code":-32603,"message":"Unknown ticker or CIK"} |
| company_insider_pulse | `{"ticker_or_cik":"NVDA","days":90}` | 200 | 159 | 1324 | no | `{}` | 200 | yes | {"code":-32603,"message":"Unknown ticker or CIK"} |
| cluster_buys | `{"days":90,"min_insiders":3}` | 200 | 128 | 11876 | no | `{"days":"not-a-number"}` | 200 | no |  |
| cluster_sells | `{"days":30,"min_insiders":3}` | 200 | 123 | 6673 | no | `{"days":"not-a-number"}` | 200 | no |  |
| upcoming_sales_pressure | `{"days":30,"group_by":"issuer"}` | 200 | 117 | 10868 | no | `{"days":"not-a-number"}` | 200 | no |  |
| news | `{"days":7,"topic":"sec"}` | 200 | 274 | 575 | no | `{"days":"not-a-number"}` | 200 | no |  |
| upcoming_earnings | `{"within_days":90,"form_type":"10-Q"}` | 200 | 151 | 18241 | no | `{"within_days":"not-a-number"}` | 200 | no |  |
| fund_holdings | `{"cik_or_series_id":"0000884394"}` | 200 | 108 | 377 | no | `{}` | 200 | no |  |
| fda_firm_dossier | `{"name":"Pfizer"}` | 200 | 1758 | 29263 | no | `{}` | 200 | no |  |
| drug_label | `{"name":"Lipitor"}` | 200 | 218 | 139 | no | `{}` | 200 | no |  |
| watchlist | `{"tickers":"PFE,NVDA"}` | 200 | 166 | 1336 | no | `{}` | 200 | yes | "missing tickers parameter" |
| cross_vertical_active | `{"days":90,"min_verticals":2,"limit":2}` | 200 | 947 | 1132 | no | `{"days":"not-a-number"}` | 200 | no |  |
| entity_timeline | `{"key":"PFE","days":180,"limit":2}` | 200 | 704 | 3933 | no | `{}` | 200 | yes | "entity not found" |
| entity_material_events | `{"key":"PFE","days":180}` | 200 | 817 | 20850 | no | `{}` | 200 | yes | "entity not found" |
| clinical_trials_recent | `{"sponsor":"Pfizer","limit":2}` | 200 | 139 | 1577 | no | `{"phase":"__invalid_enum__"}` | 200 | no |  |
| lobbying_by_client | `{"client":"Pfizer"}` | 200 | 126 | 250 | no | `{}` | 200 | no |  |
| epa_facilities | `{"owner":"ExxonMobil","limit":2}` | 200 | 188 | 221 | no | `{"owner":{"invalid":true}}` | 200 | no |  |
| patents_recent | `{"assignee":"NVIDIA","limit":2}` | 200 | 97 | 185 | no | `{"assignee":{"invalid":true}}` | 200 | no |  |
| patents_by_assignee | `{"name":"NVIDIA"}` | 200 | 122 | 306 | no | `{}` | 200 | no |  |
| courts_recent | `{"party":"Pfizer","limit":2}` | 200 | 113 | 917 | no | `{"party":{"invalid":true}}` | 200 | no |  |
| courts_by_party | `{"name":"Pfizer"}` | 200 | 154 | 1006 | no | `{}` | 200 | no |  |
| sanctions_check | `{"name":"Pfizer"}` | 200 | 109 | 1708 | no | `{}` | 200 | yes | "name query param required" |
| cfpb_by_company | `{"name":"Wells Fargo"}` | 200 | 116 | 5774 | no | `{}` | 200 | no |  |
| nih_by_org | `{"name":"Stanford University"}` | 200 | 4660 | 9518 | no | `{}` | 200 | no |  |
| nhtsa_by_manufacturer | `{"name":"Ford"}` | 200 | 112 | 11073 | no | `{}` | 200 | no |  |
| doj_by_company | `{"name":"Pfizer"}` | 200 | 126 | 1820 | no | `{}` | 200 | no |  |
| kev_by_vendor | `{"name":"Microsoft"}` | 200 | 155 | 10848 | no | `{}` | 200 | no |  |
| kev_recent | `{"vendor":"Microsoft","limit":2}` | 200 | 109 | 2118 | no | `{"vendor":{"invalid":true}}` | 200 | no |  |
| nsf_by_org | `{"name":"Massachusetts Institute of Technology"}` | 200 | 200 | 13890 | no | `{}` | 200 | no |  |
| screen_all | `{"name":"Pfizer"}` | 200 | 518 | 9526 | no | `{}` | 200 | yes | "one of ?name= / ?ticker= / ?cik= / ?uei= / ?npi= required" |
| lobbying_by_issue | `{"code":"HCR"}` | 200 | 102 | 13721 | no | `{}` | 200 | yes | "issue code must be a 2-4 letter LDA code (e.g. HCR, DEF, TAX)" |
| entity_relationships | `{"key":"PFE"}` | 200 | 117 | 3897 | no | `{}` | 200 | yes | "entity not found or has no SEC CIK" |
| common_owner_rollup | `{"owner_associate_id":"0749192441"}` | 200 | 108 | 1834 | no | `{}` | 200 | yes | "owner_associate_id must be a numeric CMS associate id" |
| influence_chain | `{"name":"Pfizer"}` | 200 | 175 | 3188 | no | `{}` | 200 | yes | "name or UEI required (>=3 chars)" |
| dataset_freshness | `{"status":"FRESH"}` | 200 | 112 | 10393 | no | `{"status":{"invalid":true}}` | 200 | no |  |
| flagged_carriers | `{"state":"TX","limit":2}` | 200 | 341 | 2114 | no | `{"state":{"invalid":true}}` | 200 | no |  |
| adviser_search | `{"q":"Fidelity","limit":2}` | 200 | 134 | 1601 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| advisers_flagged | `{"state":"NY","limit":2}` | 200 | 137 | 1784 | no | `{"state":{"invalid":true}}` | 200 | no |  |
| search_340b | `{"q":"Mayo","limit":2}` | 200 | 123 | 1294 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| pharmacy_340b_clients | `{"pharmacy_id":"1","limit":2}` | 200 | 133 | 1225 | no | `{}` | 200 | yes | "Invalid pharmacy id" |
| bsee_search | `{"q":"Chevron","limit":2}` | 200 | 135 | 1506 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| bsee_worst_operators | `{"limit":2}` | 200 | 133 | 1607 | no | `{"sort":{"invalid":true}}` | 200 | no |  |
| fails_to_deliver_top | `{"limit":2}` | 200 | 134 | 1620 | no | `{"limit":"not-a-number"}` | 200 | no |  |
| fails_to_deliver_search | `{"q":"NVDA","limit":2}` | 200 | 129 | 1541 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| short_volume_most_shorted | `{}` | 200 | 128 | 15308 | no | `"invalid arguments object"` | 200 | yes | {"code":-32602,"message":"tools/call requires a tool name and object arguments"} |
| short_volume_search | `{"q":"NVDA","limit":2}` | 200 | 144 | 1511 | no | `{}` | 200 | yes | "Required ?q= ticker" |
| short_interest_squeeze | `{}` | 200 | 208 | 43306 | no | `"invalid arguments object"` | 200 | yes | {"code":-32602,"message":"tools/call requires a tool name and object arguments"} |
| short_interest_search | `{"q":"NVDA","limit":2}` | 200 | 138 | 1800 | no | `{}` | 200 | yes | "Required ?q= ticker or name" |
| short_squeeze_candidates | `{"min_score":70,"limit":2}` | 200 | 132 | 2403 | no | `{"min_score":"not-a-number"}` | 200 | no |  |
| chemical_accident_search | `{"q":"Dow","limit":2}` | 200 | 167 | 1341 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| chemical_accident_worst | `{"sort":"accidents"}` | 200 | 134 | 7999 | no | `{"sort":{"invalid":true}}` | 200 | no |  |
| csb_investigation_search | `{"q":"BP","limit":2}` | 200 | 122 | 1578 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| trade_remedy_search | `{"q":"steel","limit":2}` | 200 | 207 | 1874 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| fcc_grantee_search | `{"q":"Samsung","limit":2}` | 200 | 136 | 1355 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| broadcast_station_search | `{"q":"WABC","limit":2}` | 200 | 121 | 1443 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| house_price_index_search | `{"q":"Austin","limit":2}` | 200 | 130 | 908 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| crop_insurance_search | `{"q":"Iowa","limit":2}` | 200 | 129 | 1088 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| income_by_zip_search | `{"q":"10001","limit":2}` | 200 | 121 | 915 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| documented_vessel_search | `{"q":"Queen Mary","limit":2}` | 200 | 137 | 1697 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| ag_census_county_search | `{"q":"Travis","limit":2}` | 200 | 120 | 873 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| building_permits_search | `{"q":"Travis","limit":2}` | 200 | 119 | 907 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| fair_market_rent_search | `{"q":"Austin","limit":2}` | 200 | 120 | 1195 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| migration_flows_search | `{"q":"Travis","limit":2}` | 200 | 126 | 913 | no | `{}` | 200 | yes | "Required ?q= search term (min 2 chars)" |
| resolve | `{"ticker":"PFE"}` | 200 | 334 | 2966 | no | `{"q":{"invalid":true}}` | 200 | no |  |
| compare_entities | `{"a":"Pfizer","b":"Merck"}` | 200 | 877 | 10024 | no | `{}` | 200 | yes | "two names required, each at least 3 characters" |
| screen_batch | `{"names":["Pfizer","Merck"]}` | 200 | 1203 | 8224 | no | `{}` | 200 | yes | "body must be a non-empty JSON array of names, or {\"names\":[...]}" |
| debarments_check | `{"name":"Pfizer"}` | 200 | 107 | 1046 | no | `{}` | 200 | yes | "name query param required" |
| doj_recent | `{"q":"Pfizer","limit":2}` | 200 | 118 | 1648 | no | `{"q":{"invalid":true}}` | 200 | no |  |
| nhtsa_recent | `{"manufacturer":"Ford","limit":2}` | 200 | 522 | 2519 | no | `{"manufacturer":{"invalid":true}}` | 200 | no |  |
| fed_enforcement_recent | `{"bank":"Wells Fargo","limit":2}` | 200 | 102 | 1659 | no | `{"bank":{"invalid":true}}` | 200 | no |  |

## Invalid calls accepted or not flagged

- dossier: {"name":{"invalid":true}}; HTTP 200, 1221 bytes.
- cluster_buys: {"days":"not-a-number"}; HTTP 200, 385 bytes.
- cluster_sells: {"days":"not-a-number"}; HTTP 200, 409 bytes.
- upcoming_sales_pressure: {"days":"not-a-number"}; HTTP 200, 423 bytes.
- news: {"days":"not-a-number"}; HTTP 200, 4403 bytes.
- upcoming_earnings: {"within_days":"not-a-number"}; HTTP 200, 386 bytes.
- fund_holdings: {}; HTTP 200, 367 bytes.
- fda_firm_dossier: {}; HTTP 200, 63578 bytes.
- drug_label: {}; HTTP 200, 20892 bytes.
- cross_vertical_active: {"days":"not-a-number"}; HTTP 200, 367 bytes.
- clinical_trials_recent: {"phase":"__invalid_enum__"}; HTTP 200, 219 bytes.
- lobbying_by_client: {}; HTTP 200, 10917 bytes.
- epa_facilities: {"owner":{"invalid":true}}; HTTP 200, 226 bytes.
- patents_recent: {"assignee":{"invalid":true}}; HTTP 200, 194 bytes.
- patents_by_assignee: {}; HTTP 200, 300 bytes.
- courts_recent: {"party":{"invalid":true}}; HTTP 200, 926 bytes.
- courts_by_party: {}; HTTP 200, 11318 bytes.
- cfpb_by_company: {}; HTTP 200, 1050 bytes.
- nih_by_org: {}; HTTP 200, 9757 bytes.
- nhtsa_by_manufacturer: {}; HTTP 200, 10906 bytes.
- doj_by_company: {}; HTTP 200, 28768 bytes.
- kev_by_vendor: {}; HTTP 200, 10763 bytes.
- kev_recent: {"vendor":{"invalid":true}}; HTTP 200, 944 bytes.
- nsf_by_org: {}; HTTP 200, 14411 bytes.
- dataset_freshness: {"status":{"invalid":true}}; HTTP 200, 93235 bytes.
- flagged_carriers: {"state":{"invalid":true}}; HTTP 200, 917 bytes.
- advisers_flagged: {"state":{"invalid":true}}; HTTP 200, 964 bytes.
- bsee_worst_operators: {"sort":{"invalid":true}}; HTTP 200, 21140 bytes.
- fails_to_deliver_top: {"limit":"not-a-number"}; HTTP 200, 43856 bytes.
- short_squeeze_candidates: {"min_score":"not-a-number"}; HTTP 200, 25798 bytes.
- chemical_accident_worst: {"sort":{"invalid":true}}; HTTP 200, 7996 bytes.
- resolve: {"q":{"invalid":true}}; HTTP 200, 1949 bytes.
- doj_recent: {"q":{"invalid":true}}; HTTP 200, 902 bytes.
- nhtsa_recent: {"manufacturer":{"invalid":true}}; HTTP 200, 957 bytes.
- fed_enforcement_recent: {"bank":{"invalid":true}}; HTTP 200, 931 bytes.

A passing transport response does not establish complete coverage or correct source interpretation. Reviewers should verify sampled facts and official-list status independently.

## Earlier same-day run retained for review

The first 73-tool run had 7 valid-call errors and 29 invalid calls accepted. Five valid calls returned the same D1 overload error, one timed out, and one example used a non-real CMS owner ID. The owner example was replaced with a real public CMS organization-owner ID (`0749192441`); its corrected call succeeded. The second full run above had zero valid-call errors. The first run's exact errors are retained below because that earlier failure is relevant to reliability review.

| Tool | Exact earlier valid-call error |
|---|---|
| `nih_by_org` | `TimeoutError: The operation was aborted due to timeout` |
| `nhtsa_by_manufacturer` | `{"code":-32603,"message":"D1_ERROR: D1 DB is overloaded. Requests queued for too long."}` |
| `doj_by_company` | `{"code":-32603,"message":"D1_ERROR: D1 DB is overloaded. Requests queued for too long."}` |
| `kev_by_vendor` | `{"code":-32603,"message":"D1_ERROR: D1 DB is overloaded. Requests queued for too long."}` |
| `kev_recent` | `{"code":-32603,"message":"D1_ERROR: D1 DB is overloaded. Requests queued for too long."}` |
| `nsf_by_org` | `{"code":-32603,"message":"D1_ERROR: D1 DB is overloaded. Requests queued for too long."}` |
| `common_owner_rollup` (initial example) | `"owner_associate_id must be a numeric CMS associate id"` |

The invalid-call results remain a launch concern: 35 of 73 malformed calls in the second run were accepted without a signaled error. Some returned large bodies, such as `dataset_freshness` with a malformed `status` (93,235 bytes in the first run). The live server should provide actionable validation feedback for those shapes before review.
