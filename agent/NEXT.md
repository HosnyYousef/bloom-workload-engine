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

Item 8 is accepted. Begin the separate Parking Lot task-library design: a calm
overlay for finding and managing all parked tasks without crowding the daily
focus view. Write and review its smallest useful scope and acceptance checks
before changing application code.

The beta tester feedback box, optional cognitive-load breakdown, and daily
history/calendar search are saved as items 17 through 19. They should not be
built until the core MVP is stable.

Product analytics is saved as item 20 and is required during final web and App
Store launch preparation. The provider will be selected later.

Username display for normal and Demo accounts, registration confirmation email,
and forgot-password/reset support are saved as item 22. Do not interrupt the
current acceptance test to build them.

Suggested command after the change:

```bash
cd frontend && npm test
```
