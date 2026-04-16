// Fixed task dataset that gets loaded on every demo login.
// Edit this to control what recruiters see when they first land in the app.

const demoSeed = [
  // Parking Lot — ideas and backlog items
  {
    title: "Research competitor onboarding flows",
    column: "parkingLot",
    priority: "low",
    energyLevel: "low",
  },
  {
    title: "Write Q3 goals doc",
    column: "parkingLot",
    priority: "medium",
    energyLevel: "medium",
  },
  {
    title: "Sketch new dashboard layout",
    column: "parkingLot",
    priority: "low",
    energyLevel: "high",
  },

  // Top Priorities — high focus work for today
  {
    title: "Finish BloomSpace demo mode",
    column: "topPriorities",
    priority: "high",
    energyLevel: "high",
  },
  {
    title: "Review PR from teammate",
    column: "topPriorities",
    priority: "high",
    energyLevel: "medium",
  },

  // For Tomorrow — planned but not urgent
  {
    title: "Write standup notes",
    column: "forTomorrow",
    priority: "medium",
    energyLevel: "low",
  },
  {
    title: "Schedule check-in with manager",
    column: "forTomorrow",
    priority: "medium",
    energyLevel: "low",
  },

  // Don't Forget — reminders and recurring tasks
  {
    title: "Log hours before end of day",
    column: "dontForget",
    priority: "high",
    energyLevel: "low",
  },
  {
    title: "Take a proper lunch break",
    column: "dontForget",
    priority: "low",
    energyLevel: "low",
  },
];

module.exports = demoSeed;