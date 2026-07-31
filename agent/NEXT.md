# /agent/NEXT.md

## Next Task

Work on the first unchecked item in STATUS.md.

## Rules

Before coding:

1. Read GOAL.md
2. Read STATUS.md
3. Read RULES.md
4. Identify the next unfinished task
5. Only work on that task

After coding:

1. Explain what changed
2. Update STATUS.md
3. Update this NEXT.md file
4. Suggest the next terminal command

## Current Next Step

Manually test item 8 with at least eight new tasks. Select an energy mode before
running Turn into tasks: Early Start should place at most 4 in Top Priorities;
Typical Day should place at most 3 and Slow Day exactly 1 when tasks exist. Slow Day should favor lighter
tasks. Changing the selector should now immediately recalculate recommendations.
Tomorrow and Don't Forget should show three subdued items each until See all is
selected. Confirm the renamed Organize Parking Lot action remains clear.

Current focused check: Tomorrow should contain three next-up tasks whenever at
least three tasks remain after Top Priorities. Due-soon tasks must appear before
later filler tasks. Parking Lot library work is intentionally separate.

Tomorrow and Don't Forget collapse memory is accepted. Confirm that a manually
chosen Typical task remains selected after switching away and back, then repeat
for Slow Day. While dragging, confirm only one task title follows the pointer,
the destination section glows, the insertion line matches the final persisted
position, and a refresh preserves that order.

After these checks pass, begin the separate Parking Lot task-library design:
an overlay for finding and managing all parked tasks without crowding the daily
focus view.

The beta tester feedback box, optional cognitive-load breakdown, and daily
history/calendar search are saved as items 17 through 19. They should not be
built until the core MVP is stable.

Product analytics is saved as item 20 and is required during final web and App
Store launch preparation. The provider will be selected later.

Suggested command after the change:

```bash
cd frontend && npm test
```
