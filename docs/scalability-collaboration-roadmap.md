# Scalability And Collaboration Roadmap

This roadmap is intentionally conservative.

It prioritizes changes that improve maintainability and team safety without risking Preview, CMS compatibility, or ecommerce behavior.

## Do Now

- Standardize repeated client bootstrapping through shared helpers instead of copy-pasted inline patterns
- Keep structure docs current when files move so new contributors can navigate the repo quickly
- Reduce misleading operational cues that conflict with dashboard-managed Cloudflare Pages workflows

## Do Soon

- Replace `any` and `Record<string, any>` in shared boundaries with domain types
- Add `zod` validation for external inputs and outputs:
  - request bodies
  - Sanity payload normalization inputs
  - Flutterwave responses and webhook payloads
- Add focused tests for:
  - cart calculations
  - checkout quote/initialize flows
  - webhook verification
  - product sync behavior

## Do Later

- Split large block files that still mix CMS mapping and client behavior
- Group growing `src/lib` logic by domain when the helper count makes top-level navigation noisy
- Add lint/format enforcement in CI once the current code shape is stable enough to avoid churn-heavy rollout

## Guardrails

- Preserve documented compatibility paths in [`docs/compatibility-inventory.md`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/docs/compatibility-inventory.md)
- Prefer extraction and normalization over behavioral redesign
- Verify safe refactors with `tsc` and `build`
