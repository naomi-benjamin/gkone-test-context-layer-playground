#!/usr/bin/env python3
"""Link imported ADO Test Case work items to the stories they test.

Run this AFTER importing a *-ado-import.csv into Azure DevOps. It:
  1. Reads a link manifest (title -> list of story IDs) produced by md_to_ado_csv.py
  2. Looks up each Test Case's newly-assigned ADO work item ID by exact Title match (via WIQL)
  3. Adds a "Tests" (Microsoft.VSTS.Common.TestedBy-Reverse) relation from the Test Case
     to each story ID in the manifest

Auth: reads a Personal Access Token from the AZURE_DEVOPS_PAT environment variable.
Never pass the PAT on the command line or hardcode it here.

Usage:
    export AZURE_DEVOPS_PAT=xxxxx
    python3 link_tests_to_stories.py --org gkco --project GKOne \\
        --manifest plugin-test-cases-ado-import.link-manifest.json \\
        --area-path "GKOne\\Payments" \\
        [--dry-run]
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request

API_VERSION = "7.1"


def ado_request(method, url, pat, body=None):
    token = base64.b64encode(f":{pat}".encode()).decode()
    headers = {
        "Authorization": f"Basic {token}",
        "Content-Type": "application/json-patch+json" if method == "PATCH" else "application/json",
    }
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        msg = e.read().decode()
        raise RuntimeError(f"{method} {url} -> {e.code}: {msg}") from e


def find_work_item_id(org, project, pat, title, area_path=None, tag=None):
    escaped_title = title.replace("'", "''")
    conditions = [
        "[System.WorkItemType] = 'Test Case'",
        f"[System.Title] = '{escaped_title}'",
    ]
    if area_path:
        escaped_area = area_path.replace("'", "''")
        conditions.append(f"[System.AreaPath] = '{escaped_area}'")
    if tag:
        escaped_tag = tag.replace("'", "''")
        conditions.append(f"[System.Tags] CONTAINS '{escaped_tag}'")
    wiql = {
        "query": "SELECT [System.Id] FROM WorkItems WHERE " + " AND ".join(conditions)
    }
    url = f"https://dev.azure.com/{org}/{project}/_apis/wit/wiql?api-version={API_VERSION}"
    result = ado_request("POST", url, pat, wiql)
    ids = [wi["id"] for wi in result.get("workItems", [])]
    return ids


def add_tests_relation(org, project, pat, test_case_id, story_id, dry_run):
    story_url = f"https://dev.azure.com/{org}/{project}/_apis/wit/workItems/{story_id}"
    patch = [{
        "op": "add",
        "path": "/relations/-",
        "value": {
            "rel": "Microsoft.VSTS.Common.TestedBy-Reverse",
            "url": story_url,
            "attributes": {"comment": "Linked via link_tests_to_stories.py"},
        },
    }]
    if dry_run:
        print(f"    [dry-run] would link Test Case {test_case_id} --Tests--> {story_id}")
        return
    url = f"https://dev.azure.com/{org}/{project}/_apis/wit/workItems/{test_case_id}?api-version={API_VERSION}"
    ado_request("PATCH", url, pat, patch)
    print(f"    linked Test Case {test_case_id} --Tests--> {story_id}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--org", required=True, help="Azure DevOps organization name")
    ap.add_argument("--project", required=True, help="Azure DevOps project name")
    ap.add_argument("--manifest", required=True, action="append",
                    help="Link manifest JSON file (repeatable for multiple suites)")
    ap.add_argument("--tag", action="append", default=None,
                    help="Distinguishing tag for the matching --manifest (same position/order), "
                         "e.g. --manifest plugin...json --tag 'Payment Plugin' --manifest qr...json --tag 'Scan to Pay'. "
                         "Strongly recommended whenever suites can share identical test case titles.")
    ap.add_argument("--area-path", default=None,
                    help="Optional System.AreaPath filter to disambiguate duplicate titles")
    ap.add_argument("--pat-env", default="AZURE_DEVOPS_PAT",
                    help="Env var holding the PAT (default: AZURE_DEVOPS_PAT)")
    ap.add_argument("--dry-run", action="store_true",
                    help="Look up matches and print what would be linked, without writing")
    args = ap.parse_args()

    pat = os.environ.get(args.pat_env)
    if not pat:
        print(f"No PAT found in ${args.pat_env}. Set it and re-run:", file=sys.stderr)
        print(f"  export {args.pat_env}=<your PAT>", file=sys.stderr)
        sys.exit(1)

    tags = args.tag or []
    if tags and len(tags) != len(args.manifest):
        print(f"--tag given {len(tags)} time(s) but --manifest given {len(args.manifest)} time(s) — "
              "supply exactly one --tag per --manifest, in the same order, or omit --tag entirely.",
              file=sys.stderr)
        sys.exit(1)
    if not tags:
        print("WARNING: no --tag supplied for any manifest. If two suites can share an identical "
              "test case title (e.g. the same amount-validation wording reused across channels), "
              "the title-only lookup below may match the wrong suite's Test Case. Strongly consider "
              "re-running with --tag per manifest once you've confirmed titles are unique across all "
              "suites in this Area Path.", file=sys.stderr)
        tags = [None] * len(args.manifest)

    linked, not_found, ambiguous, skipped, errors = 0, [], [], 0, []

    for manifest_path, suite_tag in zip(args.manifest, tags):
        with open(manifest_path, "r", encoding="utf-8") as f:
            entries = json.load(f)

        print(f"\n=== {manifest_path} ===")
        for entry in entries:
            title = entry["title"]
            stories = entry.get("stories", [])
            if not stories:
                skipped += 1
                continue

            known_id = entry.get("id")
            if known_id:
                test_case_id = known_id
            else:
                try:
                    ids = find_work_item_id(args.org, args.project, pat, title, args.area_path, suite_tag)
                except RuntimeError as e:
                    errors.append((title, str(e)))
                    print(f"  ERROR looking up: {title}\n    {e}")
                    continue

                if len(ids) == 0:
                    not_found.append(title)
                    print(f"  NOT FOUND (not yet imported?): {title}")
                    continue
                if len(ids) > 1:
                    ambiguous.append((title, ids))
                    print(f"  AMBIGUOUS ({len(ids)} matches, skipped — resolve manually): {title}")
                    continue
                test_case_id = ids[0]
            print(f"  {title[:70]}  (Test Case {test_case_id})")
            for story_id in stories:
                try:
                    add_tests_relation(args.org, args.project, pat, test_case_id, story_id, args.dry_run)
                    linked += 1
                except RuntimeError as e:
                    errors.append((title, str(e)))
                    print(f"    ERROR linking to {story_id}: {e}")

    print("\n=== Summary ===")
    print(f"Links created{'(dry-run)' if args.dry_run else ''}: {linked}")
    print(f"Skipped (no stories to link): {skipped}")
    if not_found:
        print(f"Not found in ADO ({len(not_found)}) — import the CSV first, or title mismatch:")
        for t in not_found:
            print(f"  - {t}")
    if ambiguous:
        print(f"Ambiguous title matches ({len(ambiguous)}) — resolve manually:")
        for t, ids in ambiguous:
            print(f"  - {t}: {ids}")
    if errors:
        print(f"Errors ({len(errors)}):")
        for t, msg in errors:
            print(f"  - {t}: {msg}")


if __name__ == "__main__":
    main()
