# GK Pay Biz test cases — ADO export & story linking

Covers the three Release 1 suites (`plugin`, `transactions`, `qr-code`): markdown draft →
ADO import CSV → import into ADO → link each Test Case to the story/stories it tests.

## 1. Convert markdown drafts to ADO import CSVs

Done via a reconstructed `md_to_ado_csv.py` (the skill's shipped script was missing from this
installation — see `.claude/skills/ado-csv-exporter/SKILL.md` for the documented spec this follows).
The script itself isn't checked in here; re-run via the `ado-csv-exporter` skill if the CSVs need
regenerating from an edited draft.

Produces, per suite:
- `<suite>-ado-import.csv` — the ADO import file (columns: ID, Work Item Type, Title, Preconditions,
  Postconditions, Test Step, Step Action, Step Expected, Area Path, Assigned To, State, Tags)
- `<suite>-ado-import.link-manifest.json` — title → story ID(s) + confidence + note, used by the
  linking script below. **Not** part of the CSV — ADO's import tool only maps columns to *fields*,
  not work item *relations* (see gotcha #1).

Area Path for all three: `GKOne\Payments`.

## 2. Import each CSV into ADO

Test Plans → the relevant suite → Import Test Cases → upload the CSV → review the field mapping →
Import. Do this once per suite, in any order.

## 3. Link each imported Test Case to its story/stories

```
cd /Users/naomi.silvera/Documents/Repos.nosync/gkone-test-context-layer/playground/gkpay-biz/test-cases
export AZURE_DEVOPS_PAT=<your PAT>   # never pass it as a CLI argument or hardcode it

python3 link_tests_to_stories.py --org GKDigital --project GKOne \
  --manifest plugin-test-cases-ado-import.link-manifest.json --tag "Payment Plugin" \
  --manifest transactions-test-cases-ado-import.link-manifest.json --tag "Merchant Portal" \
  --manifest qr-code-test-cases-ado-import.link-manifest.json --tag "Scan to Pay" \
  --area-path "GKOne\Payments" \
  --dry-run
```

Check the dry-run output, then drop `--dry-run` to actually create the links. Each suite can also
be run on its own (e.g. right after importing just that one suite) — the `--tag` just needs to stay
paired with its matching `--manifest` in the same position.

The script creates a `Microsoft.VSTS.Common.TestedBy-Reverse` relation (shows as **"Tests"** on the
Test Case, **"Tested By"** on the story) from each Test Case to every story ID in its manifest entry.
Entries with an empty `stories` list are skipped — nothing to link, not an error (see gotcha #3).

### Re-running after regenerating a CSV/manifest

If a suite's `.csv` is regenerated (e.g. after a draft edit) and already has known ADO IDs merged
into its manifest (see Plugin's manifest — populated from `Payments_Payment Plugin.csv`, an export
of the already-imported suite), those IDs carry over automatically as long as the manifest is
edited in place rather than fully regenerated from scratch. If titles changed, the `id` fields will
need re-merging — see the one-off script used for Plugin as a template (not checked in; re-derive
from a fresh ADO export + the manifest's `title` field if needed).

## Gotchas found while building this

1. **ADO's bulk CSV/XLSX import maps columns to *fields* only, not work item relations.** An earlier
   version of this pipeline added a `Tests` column directly to the CSV. ADO auto-matched it to
   **"Automated Test Storage"** (a field for automated-test-method references) instead of creating
   any actual link — "Related Work Items" stayed empty post-import. Don't put story IDs in the CSV;
   use the separate linking script instead.
2. **PATCH requests to the ADO work item API need `Content-Type: application/json-patch+json`**,
   not `application/json` — easy to get backwards in a content-type ternary (which is exactly what
   happened the first time; fixed now). A wrong content-type here fails loudly and atomically
   (`400`, nothing written) rather than partially applying, so it's safe to just fix and re-run.
3. **Two suites can share an identical test case title** (e.g. both Plugin and QR Code have a case
   literally titled "Verify that the system blocks payment when the entered amount is below
   $1000" — same amount-validation wording, different channel). Since the linking script looks
   up not-yet-known Test Case IDs by title (via WIQL) scoped only to Area Path, and both suites
   share `GKOne\Payments`, a title-only lookup silently matched the wrong suite's already-imported
   Test Case. Always pass `--tag` (each suite's own distinguishing tag: "Payment Plugin",
   "Merchant Portal", "Scan to Pay") to disambiguate — the script now warns loudly if `--tag` is
   omitted.
4. **Not every test case has a story to link to.** 7 of the 60 cases across all three suites have
   no story at all (e.g. the 3DS challenge has no story anywhere — see
   `paybiz_release_1_requirements.md` open item 1) or test behavior no story explicitly states
   (e.g. cross-merchant access control). These are left with an empty `stories` list in the
   manifest and skipped by the linking script, not guessed at.
