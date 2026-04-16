// Fixed task dataset loaded on every demo login.
// Fields match the Task schema exactly.
// userId is injected by the demo route before inserting.

const demoSeed = [
  // Parking Lot — unsorted tasks, sorted: false
  {
    text: "Research competitor onboarding flows",
    importance: "low",
    sorted: false,
  },
  {
    text: "Write Q3 goals doc",
    importance: "medium",
    sorted: false,
  },
  {
    text: "Sketch new dashboard layout",
    importance: "low",
    sorted: false,
  },

  // Top Priorities
  {
    text: "Finish BloomSpace demo mode",
    importance: "high",
    sorted: true,
    sortedCategory: "priorities",
  },
  {
    text: "Review PR from teammate",
    importance: "high",
    sorted: true,
    sortedCategory: "priorities",
  },

  // For Tomorrow
  {
    text: "Write standup notes",
    importance: "medium",
    sorted: true,
    sortedCategory: "tomorrow",
  },
  {
    text: "Schedule check-in with manager",
    importance: "medium",
    sorted: true,
    sortedCategory: "tomorrow",
  },

  // Don't Forget
  {
    text: "Log hours before end of day",
    importance: "high",
    sorted: true,
    sortedCategory: "dontForget",
  },
  {
    text: "Take a proper lunch break",
    importance: "low",
    sorted: true,
    sortedCategory: "dontForget",
  },
];

module.exports = demoSeed;