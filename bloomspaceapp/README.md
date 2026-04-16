# BloomSpace

A full-stack MERN productivity app built for people with executive function challenges. ADHD, anxiety, or anyone who struggles with the gap between knowing what to do and actually starting.

Most productivity tools assume the user already knows how to prioritize. BloomSpace doesn't. It's designed around the idea that the first step is just getting everything out of your head.

---

## The Problem

Standard to-do apps create a second job: organizing the list. For people with executive dysfunction, that overhead is often the reason nothing gets done.

BloomSpace removes that friction. You dump tasks into a Parking Lot, no structure required, and the app organizes them using an AI layer that reads importance, deadlines, and energy cost, then distributes tasks across Today, Tomorrow, and Don't Forget.

---

## Tech Stack

Built on the MERN stack:

- **MongoDB** for flexible, schema-light task and user storage
- **Express** for a clean REST API with protected routes
- **React** with Vite and Tailwind CSS for a fast, component-driven frontend
- **Node.js** as the runtime tying it together

Additional: Recharts for data visualization, JWT for stateless auth, Claude API for task organization logic.

---

## Architecture Decisions

**Why a Parking Lot instead of a traditional inbox?**
The metaphor matters. An inbox implies something needs to be processed now. A parking lot is low-stakes. Things sit there until you're ready. That framing reduces the activation energy for users who freeze when facing a task list.

**Why JWT over sessions?**
BloomSpace is stateless by design. JWT keeps the frontend decoupled from the backend, which matters for future mobile or extension builds.

**Why MongoDB over a relational DB?**
Task structure varies per user and evolves fast in early development. A flexible document model meant iterating on the schema without migrations slowing things down.

**Why Recharts?**
Lightweight, composable, and integrates cleanly with React state. The StatsCards component needed to reflect live data without a separate data layer. Recharts made that straightforward.

---

## Features

- **Parking Lot** — brain dump interface with importance, deadline, hours, and goal tagging
- **AI Organize** — one-click task distribution powered by Claude API
- **Top Priorities** — auto-populated from high-importance Parking Lot tasks
- **For Tomorrow** — intentional next-day planning
- **Don't Forget** — persistent reminders that survive daily resets
- **Energy Mode** — Early Start / Typical Day / Slow Day filters task visibility by cognitive load
- **StatsCards** — live dashboard showing completion rate, task distribution, and goal progress
- **SMART Goals** — goal-setting flow with structured prompts and progress tracking

---

## What I Learned

Building BloomSpace taught me more about product thinking than any tutorial. The hardest problems weren't technical. They were questions like: what does "done" mean for someone who never marks things done? How do you design for a user who will abandon the app the moment it asks too much of them?

Those questions shaped every UI decision, from the one-click organize button to the way tasks move between sections without requiring the user to drag anything.

---

## Running Locally

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

Requires a `.env` file in `/backend` with:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
CLAUDE_API_KEY=your_api_key
PORT=5001
```

---

## Status

Actively in development. Core task management and AI organization are complete. Currently building out the SMART goals flow and preparing for a public beta.

---

Built by [Yousef Hosny](https://github.com/HosnyYousef), a systems thinker turned software engineer who builds tools he actually needs.
