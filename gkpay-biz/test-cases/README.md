# GK Pay Biz test cases — ADO export & story linking

Covers the four Release 1 suites (`plugin`, `transactions`, `qr-code`, `payment-link`): markdown draft →
ADO import CSV → import into ADO → link each Test Case to the story/stories it tests.

The tooling itself (both scripts, PAT setup, full usage docs, and the gotchas found building them)
now lives centrally at **[`scripts/README.md`](../../../scripts/README.md)** — this file only covers
what's specific to these three suites.

## Files in this folder

- `<suite>-draft.md` — the markdown test cases (source of truth; edit here first)
- `<suite>-ado-import.csv` — generated from the draft via `scripts/md_to_ado_csv.py`
- `<suite>-story-map.json` — hand-built per-case story mapping (test case number → story ID(s) +
  confidence + note), built by reading `paybiz_release_1_requirements.md` and matching each case to
  the story whose AC it actually validates. Nothing generates this file automatically — see
  `scripts/README.md`'s note on `--story-map`.
- `<suite>-ado-import.link-manifest.json` — title → story ID(s), generated alongside the CSV, with
  real ADO work item IDs merged in once each suite is imported (see `scripts/README.md`'s "Speeding
  up re-runs" section for the merge snippet)
- `Payments_<Suite>.csv` — ADO's own export of each already-imported suite; the source for the real
  IDs merged into the manifests above

Area Path for all four: `GKOne\Payments`. Tags used to disambiguate same-titled cases across
suites: `"Payment Plugin"`, `"Merchant Portal"`, `"Scan to Pay"`, `"Payment Link"`.

## Running the linker for these three suites

```
cd /Users/naomi.silvera/Documents/Repos.nosync/gkone-test-context-layer/playground/gkpay-biz/test-cases
export AZURE_DEVOPS_PAT=<your PAT>   # see scripts/README.md for how to create one

python3 ../../../scripts/link_tests_to_stories.py --org GKDigital --project GKOne \
  --manifest plugin-test-cases-ado-import.link-manifest.json --tag "Payment Plugin" \
  --manifest transactions-test-cases-ado-import.link-manifest.json --tag "Merchant Portal" \
  --manifest qr-code-test-cases-ado-import.link-manifest.json --tag "Scan to Pay" \
  --manifest payment-link-ado-import.link-manifest.json --tag "Payment Link" \
  --area-path "GKOne\Payments" \
  --dry-run
```

Check the dry-run output, then drop `--dry-run` to actually create the links. Each suite can also be
run on its own right after importing just that one suite.

## Status

- **Plugin**: imported (IDs 37967–37996), manifest has real IDs merged, linked. **Stale as of 2026-10-15** — the draft was renumbered (30 → 32 cases) when the 3DS gap was resolved with real AC (new TC25–27, old TC25/26 replaced, everything after shifted). The imported ADO Test Cases, CSV, story-map, and manifest still reflect the old 30-case numbering — re-run `md_to_ado_csv.py` and re-import/re-link before trusting this suite's ADO state.
- **QR Code**: imported (IDs 37998–38016), manifest has real IDs merged, dry-run checked.
- **Transactions**: imported (IDs 38019–38029), manifest has real IDs merged, dry-run checked.
- **Payment Link**: imported (IDs 38639–38671), manifest has real IDs merged (all 33 matched cleanly), dry-run not yet run. 1 case unlinked by design (TC28, confirms Apple/Google Pay absence — no story to link to), 2 at medium confidence (TC18/19, expiry nonsense-combo gap) — worth a glance before linking.
