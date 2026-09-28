# Playground Usage Guide

## What it's for

Scratch space for whatever you're actively looking into. Drafts, exploration notes, generated test cases before they're ADO-ready, session-specific files. Gitignored, so nothing commits. Lower trust than feature docs, meant to be messy.

## The shape of a session

Say you're investigating something — a new story, a design review, a bug hunt. The flow in Claude Code:

1. **Create an investigation folder.** `playground/<date-or-ado-id>-<short-slug>/`. Date-prefix when the work doesn't map to a specific ADO item, ID-prefix when it does. Date format `YYYY-MM-DD` so they sort.

2. **Drop in your starting input.** Usually a `notes.md` with whatever you're looking at — story content, your own observations, questions you want to explore. If there's a diagram the architects shared, paste it into the session directly (don't commit it, per the diagrams rule).

3. **Ask for what you need.** Examples:
   - "Generate test cases based on `playground/2026-04-22-apple-signin-review/notes.md`. Context: squad=identity, feature=entraid-mobile-integration."
   - "Help me think through what edge cases this design implies."
   - "Let's work through this."

4. **Claude loads context per the rules.** `_global/`, the specified feature folder, related features from integration points, plus the playground input. Claude generates whatever was asked for and writes it to a file in the same playground folder (not inline in chat), and includes a "Context applied" note listing what was pulled from.

5. **Iterate in the playground file.** Revise, expand, cut. Edit the file directly in your editor, or tell Claude what to change and Claude edits it.

6. **At the end of the session, the graduation step.** Claude reviews what was produced and asks: is anything here durable knowledge that should graduate to feature docs? Edge cases discovered, integration points that weren't documented, patterns worth capturing. Claude proposes specific graduations; user approves, modifies, or declines. Approved ones get edited into the right feature files.

7. **Decide what happens to the folder.** Test cases being kept go to ADO. Durable knowledge already graduated to feature docs. The playground folder itself either gets deleted, archived, or kept around if the investigation is ongoing. Per-investigation call.

## Habits worth keeping

### The playground is allowed to be messy
Don't apply marker rules here, don't worry about polish, don't treat it as a durable record. The value is low friction, not quality.

### Everything important graduates or leaves
Anything to keep long-term either moves to a feature file (durable knowledge) or to ADO (test cases, bugs). If something in playground is neither graduating nor leaving, ask why it's there.

### Don't let playground become the real repo
If almost all work is happening in playground and the feature folders stop growing, the graduation step isn't happening. Periodic check every few weeks — look at what's accumulated in playground, graduate or delete.

### Diagrams stay ephemeral
Paste diagrams into the session, Claude extracts what matters, the extracts either graduate to feature files with source notes or stay in the investigation folder. The image doesn't commit anywhere.

## The two commands used most

- **"Generate test cases in playground folder X using feature Y context"** → produces a file in the playground folder, plus a context-applied note.
- **"Review the playground session and propose graduations"** → lists durable-knowledge candidates for approval into feature files.

Everything else is just the usual context-loading and marker rules doing their job underneath.