# Backend Considerations

## App-layer validation

- When creating a new allocation for a person-project pair, unhide all existing rows for that pair (`SET isHidden = false WHERE teammateId = X AND projectId = Y`)
- `weekStart` must always be a Monday — validate before writing
- `conversionProbability` must be in increments of 10 (0, 10, 20, ..., 100) — validate before writing
- `conversionProbability` should be cleared (set null) when project status changes away from Pipeline
- Teammate deletion is blocked by Restrict — UI should guide users to set status to Alumni instead
- `fraction` stored as integer percentage points (20 = 20%); UI divides by 100 for display (0.2)

## Query patterns

- **Team page**: `SELECT * FROM teammates ORDER BY status, name`
- **Projects page**: `SELECT * FROM projects ORDER BY status, name` with lead join
- **Project View**: Allocations filtered by date range + `isHidden=false`, grouped by project, with teammate + project joins
- **Teammate View**: Same data grouped by teammate. OVERALL row = sum of fractions per week (computed in API)
- **Over-allocation warning**: Sum fractions per teammate per week; flag if > 100

## Edge cases

- `BillingRate.L1` shares naming with Level convention — keep them conceptually separate in code
- Hiding a teammate from a project bulk-updates all their allocation rows for that project to `isHidden = true`
- Alumni teammates should still appear in allocation views for historical data (filtered by date range)
- Project lead FK uses `onDelete: SetNull` — deleting a teammate clears the lead but doesn't delete the project
- Allocation FK uses `onDelete: Restrict` on teammate — can't hard-delete a teammate with allocations
- Allocation FK uses `onDelete: Cascade` on project — deleting a project removes all its allocations
