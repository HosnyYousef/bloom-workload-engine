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

Restore the database connection: the Atlas hostname in `backend/.env`
no longer resolves (`cluster0.m4qnvex.mongodb.net` is NXDOMAIN). Create
or locate the cluster in MongoDB Atlas and update `MONGODB_URI`.

After that, review the recommendation engine assumptions listed in
`backend/engine/README.md` (deadline horizons, scoring weights, energy
fit matrix) and adjust the constants where they feel wrong.

Suggested command to verify once the URI is fixed:

```bash
cd backend && npm run dev
```
