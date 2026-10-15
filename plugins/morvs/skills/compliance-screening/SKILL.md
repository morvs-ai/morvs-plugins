---
name: compliance-screening
description: This skill should be used when a user asks to screen an organization against public sanctions or debarment records, compare counterparties, or review regulatory and complaint signals with coverage and identity caveats.
---

# Compliance screening

**Lead with this limit:** MORVS screens are research aids with partial, variable coverage. A non-match, low score, or failed experimental tool is not sanctions clearance, compliance approval, or a legal conclusion. Verify identity and current status in the official source before any action.

## Workflow

1. Keep scope to organizations and institution-level facts; do not reproduce personal identifiers, addresses, or complaint narratives containing PII. Resolve legal names and aliases with `resolve` using `{"q":"Organization name"}` or a known ticker or CIK. Record unresolved name collisions.
2. For a single organization, call `sanctions_check` with `{"name":"Exact legal name"}` and `debarments_check` with the same name. The sanctions tool searches a partial local OFAC SDN index by substring, including indexed aliases. Debarments covers local SAM Exclusions and HHS OIG LEIE records. Treat hits as possible matches pending identifier and current official-list review.
3. When broader context is requested, call `screen_all` with `{"name":"Exact legal name"}` if available. It is experimental; its 0–100 score and per-source counts are indicative local-index outputs. For up to 50 names call `screen_batch` with `{"names":["Name A","Name B"]}`. For two entities call `compare_entities` with `{"a":"Name A","b":"Name B"}`. Describe any ranking as a MORVS heuristic, not a determination of risk or wrongdoing.
4. Use `doj_by_company` with `{"name":"Exact legal name"}` to inspect DOJ press-release mentions and `cfpb_by_company` with the same argument to inspect a partial CFPB complaint index. A press mention need not be an enforcement action; a complaint is a consumer report, not a proven violation.
5. Inspect MORVS coverage and call `dataset_freshness` with `{}` for relevant federal hub rows. Verify material hits and negatives against current official [OFAC](https://ofac.treasury.gov/sanctions-list-service), [SAM.gov](https://sam.gov/content/exclusions), [HHS OIG](https://exclusions.oig.hhs.gov/), [DOJ](https://www.justice.gov/news), or [CFPB](https://www.consumerfinance.gov/data-research/consumer-complaints/) records as applicable. Preserve record IDs, dates, list version or access date, and exact source URLs. Say when current official verification was unavailable.
6. Put the caveat before the results, then provide a compact table. Report no-hit only as “no match in the checked local index on the access date.” Avoid accusations and definitive clearance language.

| Checked on | Organization and identifier | Source checked | Local result | Official record/date/URL | Match and coverage limit |
|---|---|---|---|---|---|
| UTC date | Legal name plus verified ID | Agency and dataset | Hit, no local hit, or unavailable | Exact record or list URL | Alias/identity and freshness status |

## Drone screening

For drone makers, components or federal drone purchases, use the two Drone Register tools, which answer from MORVS's published register of US government drone approval, restriction and compliance records (DCMA Blue UAS Cleared List and Framework, FCC UAS Conditional Approvals, FAA Remote ID declarations, and the drone-linked entries of the Section 1260H list, the BIS Entity List and OFAC's NS-CMIC list). Call `drone_company_check` with `{"name":"DJI"}`; names and aliases match regardless of case, punctuation or legal suffix, and substrings are allowed. Each match gives the company page, approved and restricted flags, every designation with its list, action, product, date, source URL and evidence, attached reference records, and federal contract totals once loaded. Call `drone_product_lookup` with `{"q":"Mavic 3"}` to find a model or component across the Blue UAS lists, FCC conditional approvals and FAA declarations; its "context" field restates the current FCC Covered List exemption from the register's own reference records. Companies and agencies only: the register is not a registry of drone owners or pilots.

A non-match is reported exactly as "not found in the Drone Register (covers … as of <date>)". That describes one compiled dataset on one date. It is never clearance, approval or evidence that a company is unrestricted, and an FAA Remote ID declaration is the manufacturer's own statement, not an approval. Quote the "coverage_note" field with the result, and verify any hit or miss at the official lists the response returns in "official_lists": the [DCMA Blue UAS list portal](https://tyrionprod.servicenowservices.com/gsp?id=cleared_list), the [FCC Covered List page](https://www.fcc.gov/supplychain/coveredlist) and its [UAS public notice](https://docs.fcc.gov/public/attachments/DA-25-1086A1.pdf), the [FAA Remote ID declarations](https://uasdoc.faa.gov/listDocs), the [Section 1260H notice](https://www.federalregister.gov/documents/2026/06/10/2026-11571/notice-of-availability-of-designation-of-chinese-military-companies), the [BIS Entity List](https://www.bis.gov/sites/default/files/documents/entity-list.csv) and the [OFAC sanctions list service](https://ofac.treasury.gov/sanctions-list-service). If either tool reports the register as temporarily unavailable, say so; do not treat that as a non-match.

## Worked examples

**One vendor.** For “Screen Microsoft for sanctions and exclusions”, call `resolve` with `{"ticker":"MSFT"}`, `sanctions_check` with `{"name":"Microsoft Corporation"}`, and `debarments_check` with the same name. Confirm any candidate match at current OFAC, SAM.gov, or HHS OIG official records before reporting it. If there is no local hit, report only the local-index result and its coverage limit.

**Two counterparties.** For “Compare Pfizer and Merck”, call `compare_entities` with `{"a":"Pfizer","b":"Merck"}`; then call `sanctions_check` and `debarments_check` separately for each verified legal name. Use `doj_by_company` and `cfpb_by_company` only for relevant context, opening the original records. Explain that the comparison score is a heuristic and that name ambiguity or source lag can change it.
