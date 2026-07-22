# Architecture and Product Decisions

Use this lightweight log for durable decisions. Add a new numbered entry instead of rewriting history; mark superseded decisions clearly.

## Decision 001 — GitHub is the source of truth

**Status:** Accepted  
**Context:** Exchanging complete ZIP archives causes divergent copies and makes collaboration difficult.  
**Decision:** After the initial repository import, all changes are tracked through Git commits and branches. ZIP files are only bootstrap or recovery artifacts.  
**Consequences:** New work should begin from the latest repository state. Meaningful changes should be committed in reviewable units.

## Decision 002 — Use a 14-week pre-race analysis window

**Status:** Accepted  
**Context:** Most training builds are approximately 12 weeks. The former 18-week window included too much unrelated training.  
**Decision:** Use 12 build weeks plus 2 lead-in weeks. The window includes its first day and excludes race day.  
**Consequences:** Historical cycle metrics are comparable using a tighter window. Changing this rule requires recalculation, tests, and a new decision entry.

## Decision 003 — Pin Next.js to a stable version

**Status:** Accepted  
**Context:** The generated project referenced Next.js 16.3.0 before it was stable in the user's environment.  
**Decision:** Pin Next.js to `16.2.11` rather than using a range.  
**Consequences:** Dependency upgrades are intentional and should be tested before merging.

## Decision 004 — Keep analytics pure and tested

**Status:** Accepted  
**Context:** Analytics are the product's core intellectual property and must evolve without silently changing unrelated results.  
**Decision:** Place calculation logic in framework-independent TypeScript modules under `analytics/`, with unit tests for boundaries, assumptions, and known examples.  
**Consequences:** UI components consume analytics outputs but do not own formulas. New formulas require tests.

## Decision 005 — Begin with versioned files, not a database

**Status:** Accepted  
**Context:** The initial app is personal, read-heavy, and deployed as a static-friendly Next.js project.  
**Decision:** Store curated and derived data in versioned JSON files until editing, authentication, or scale creates a clear database requirement.  
**Consequences:** Data changes are inspectable in Git. A later database migration should preserve provenance and reproducibility.
