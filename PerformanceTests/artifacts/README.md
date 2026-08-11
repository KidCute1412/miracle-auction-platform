# Benchmark artifacts

`runs/` is generated locally and ignored by Git. Each run contains compressed k6 raw output, scenario summaries, seed manifests, invariants, Docker metadata and a human-readable report.

Publish only the selected `report.md`, `summary.json`, `metadata.json` and paired invariant reports under `docs/testing/benchmarks/<revision>/` after a clean three-run suite passes. Keep raw `.json.gz` files outside Git (for example as a release attachment).

`process-split/` is retained as historical evidence only. Its optimized revision was dirty and must not be used as a current performance claim.
