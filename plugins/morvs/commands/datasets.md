---
description: Find public datasets and verify their reuse terms
argument-hint: "[topic or dataset name]"
---

Find datasets for $ARGUMENTS using the dataset-finder skill. If the topic is missing, ask for it. Fetch the current [keyless MORVS and Voidly catalog](https://morvs.ai/voidly/datasets.json), inspect matching JSON endpoints and landing pages, and verify dates, source coverage, licenses, and upstream reuse terms. If the question concerns the federal data hub, use `resolve` and `dataset_freshness` where relevant. Return a compact linked table; distinguish dated catalog counts from live endpoint coverage.
