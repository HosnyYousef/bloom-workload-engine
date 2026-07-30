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
Typical Day and Slow Day should place at most 3. Slow Day should favor lighter
tasks. Changing the selector should now immediately recalculate recommendations.
Tomorrow and Don't Forget should show three subdued items each until See all is
selected. Confirm the renamed Organize Parking Lot action remains clear.

The beta tester feedback box, optional cognitive-load breakdown, and daily
history/calendar search are saved as items 17 through 19. They should not be
built until the core MVP is stable.

Product analytics is saved as item 20 and is required during final web and App
Store launch preparation. The provider will be selected later.

Suggested command after the change:

```bash
cd frontend && npm test
```
