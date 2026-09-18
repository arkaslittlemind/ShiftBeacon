// Golden cases for the handover digest, drawn from the hand-written seed notes
// in prisma/seed-data.ts and then frozen here. They are deliberate copies
// rather than imports: a golden set that changes when the seed changes is not
// a golden set, and a regression would hide behind the edit.
//
// Notes appear here as the model actually receives them, scrubbed, which is
// why some carry [name] and [phone] markers.

export type ExpectedFact = {
  label: string;
  // Alternative phrasings; the digest passes if any one of them appears. The
  // model is free to reword, but not to drop the fact.
  anyOf: string[];
};

export type EvalCase = {
  id: string;
  notes: string[];
  expectedFacts: ExpectedFact[];
};

export const EVAL_CASES: EvalCase[] = [
  {
    id: "hoist-fault-logged",
    notes: [
      "Quiet shift overall. The hoist in room 4 is making a grinding noise, logged with maintenance.",
    ],
    expectedFacts: [
      { label: "hoist fault", anyOf: ["hoist"] },
      { label: "which room", anyOf: ["room 4"] },
      { label: "reported onward", anyOf: ["maintenance", "logged", "reported"] },
    ],
  },
  {
    id: "declined-lunch",
    notes: [
      "Two residents declined lunch but both ate well at tea. Kitchen has been made aware.",
    ],
    expectedFacts: [
      { label: "meals declined", anyOf: ["declined lunch", "refused lunch", "lunch"] },
      { label: "kitchen informed", anyOf: ["kitchen"] },
    ],
  },
  {
    id: "missing-remote",
    notes: ["Lounge TV remote missing again, a replacement has been ordered."],
    expectedFacts: [
      { label: "missing remote", anyOf: ["remote"] },
      { label: "replacement ordered", anyOf: ["replacement", "ordered", "reordered"] },
    ],
  },
  {
    id: "intermittent-call-bell",
    notes: [
      "Call bell in room 7 is intermittent. It worked when tested but is flagged for the electrician.",
    ],
    expectedFacts: [
      { label: "call bell fault", anyOf: ["call bell"] },
      { label: "which room", anyOf: ["room 7"] },
      { label: "electrician needed", anyOf: ["electrician"] },
    ],
  },
  {
    id: "sluice-door-lock",
    notes: [
      "Sluice door lock still not fixed, propped safely for now. Please chase maintenance.",
    ],
    expectedFacts: [
      { label: "sluice lock", anyOf: ["sluice"] },
      { label: "still outstanding", anyOf: ["not fixed", "still", "outstanding", "chase"] },
    ],
  },
  {
    id: "agency-induction",
    notes: [
      "Covering for [name] [name], who swapped onto lates this week.",
      "Slow start on breakfast, one agency colleague was unfamiliar with the kitchen. Walked them through it.",
    ],
    expectedFacts: [
      { label: "agency unfamiliarity", anyOf: ["agency"] },
      { label: "breakfast delay", anyOf: ["breakfast", "slow start"] },
    ],
  },
  {
    id: "family-callback",
    notes: [
      "Afternoon family visit went well. They asked for a call back on Monday, number is [phone].",
    ],
    expectedFacts: [
      { label: "family visit", anyOf: ["family", "visit"] },
      { label: "callback owed", anyOf: ["call back", "callback", "monday"] },
    ],
  },
  {
    id: "deflated-mattress",
    notes: [
      "Pressure mattress in room 2 was reading low and had deflated overnight. Swapped for the spare.",
    ],
    expectedFacts: [
      { label: "mattress fault", anyOf: ["mattress"] },
      { label: "which room", anyOf: ["room 2"] },
      { label: "swapped out", anyOf: ["swapped", "replaced", "spare"] },
    ],
  },
  {
    id: "settled-night",
    notes: [
      "Settled night. One resident up twice for the bathroom, assisted without incident.",
    ],
    expectedFacts: [
      { label: "night was settled", anyOf: ["settled", "quiet", "uneventful"] },
      { label: "assistance given", anyOf: ["bathroom", "assisted"] },
    ],
  },
  {
    id: "short-medication-delivery",
    notes: [
      "Traffic on the ring road, clocked in a few minutes late.",
      "Medication delivery arrived one item short. Pharmacy has been contacted, due tomorrow.",
    ],
    expectedFacts: [
      { label: "short delivery", anyOf: ["medication", "meds", "delivery"] },
      { label: "pharmacy chased", anyOf: ["pharmacy"] },
      { label: "expected tomorrow", anyOf: ["tomorrow", "due"] },
    ],
  },
  {
    id: "dressing-handed-over",
    notes: ["Wound dressing due this evening, handed over to the late team."],
    expectedFacts: [
      { label: "dressing due", anyOf: ["dressing"] },
      { label: "handed to lates", anyOf: ["late team", "lates", "handed over"] },
    ],
  },
  {
    id: "fire-alarm-test",
    notes: ["Fire alarm test at 3pm. All residents reassured beforehand, no issues."],
    expectedFacts: [
      { label: "alarm test", anyOf: ["fire alarm", "alarm"] },
      { label: "no issues", anyOf: ["no issues", "without issue", "reassured", "no problems"] },
    ],
  },
  {
    id: "stock-restocked",
    notes: [
      "Running low on incontinence pads in the upstairs store, restocked from the main cupboard.",
    ],
    expectedFacts: [
      { label: "stock low", anyOf: ["pads", "stock", "supplies"] },
      { label: "restocked", anyOf: ["restock", "replenish", "main cupboard"] },
    ],
  },
  {
    id: "new-starters-shadowing",
    notes: [
      "Two new starters shadowing this morning. Both were confident with the hoist by the end.",
    ],
    expectedFacts: [
      { label: "new starters", anyOf: ["new starter", "new staff", "shadow"] },
      { label: "hoist competence", anyOf: ["hoist"] },
    ],
  },
  {
    id: "cold-radiator",
    notes: ["Bathroom radiator on the first floor is cold, reported to the office."],
    expectedFacts: [
      { label: "cold radiator", anyOf: ["radiator"] },
      { label: "reported", anyOf: ["office", "reported"] },
    ],
  },
  {
    id: "late-meds-missing-key",
    notes: [
      "Swapped shifts with [name] [name].",
      "Evening meds ran about 30 minutes late, the second trolley key could not be found.",
    ],
    expectedFacts: [
      { label: "meds late", anyOf: ["meds", "medication"] },
      { label: "missing key", anyOf: ["key"] },
    ],
  },
  {
    id: "low-mood-followup",
    notes: [
      "Resident in room 9 was in low mood today, spent extra time with them. Worth a check tomorrow.",
    ],
    expectedFacts: [
      { label: "low mood", anyOf: ["low mood", "mood", "withdrawn"] },
      { label: "follow-up wanted", anyOf: ["tomorrow", "check", "follow"] },
    ],
  },
  {
    id: "door-sensor-false-alarm",
    notes: ["Settled night apart from a false alarm on the door sensor around 3am."],
    expectedFacts: [
      { label: "false alarm", anyOf: ["false alarm", "door sensor"] },
    ],
  },
  {
    id: "short-staffed-breaks",
    notes: [
      "Handover from nights was thorough, nothing outstanding at the end of the shift.",
      "Short staffed by one on the early. Managed, but breaks ran late.",
    ],
    expectedFacts: [
      { label: "short staffed", anyOf: ["short staffed", "short-staffed", "understaffed", "one down"] },
      { label: "breaks late", anyOf: ["break"] },
    ],
  },
  {
    id: "laundry-and-rota",
    notes: ["Laundry backlog cleared. New rota printed and pinned up in the office."],
    expectedFacts: [
      { label: "laundry cleared", anyOf: ["laundry"] },
      { label: "new rota", anyOf: ["rota"] },
    ],
  },
  {
    id: "gp-review",
    notes: ["Visiting GP reviewed two residents, notes updated in the care files."],
    expectedFacts: [
      { label: "GP visit", anyOf: ["gp", "doctor"] },
      { label: "records updated", anyOf: ["care file", "notes updated", "records"] },
    ],
  },
  {
    id: "water-cooler-leak",
    notes: [
      "Water cooler on the ground floor is leaking. Bucket underneath and maintenance emailed at [email].",
    ],
    expectedFacts: [
      { label: "leak", anyOf: ["leak", "water cooler"] },
      { label: "maintenance emailed", anyOf: ["maintenance", "emailed"] },
    ],
  },
  {
    id: "fall-risk-review",
    notes: [
      "Started early to cover the breakfast round.",
      "A fall risk assessment review was due for one resident, completed with the senior on duty.",
    ],
    expectedFacts: [
      { label: "fall risk review", anyOf: ["fall risk", "risk assessment"] },
      { label: "completed", anyOf: ["complete", "done", "senior"] },
    ],
  },
  {
    id: "unsettled-night-reviewed",
    notes: [
      "One resident unsettled for most of the night, reviewed by the senior on call.",
    ],
    expectedFacts: [
      { label: "unsettled resident", anyOf: ["unsettled", "restless"] },
      { label: "escalated", anyOf: ["senior", "on call", "reviewed"] },
    ],
  },
  {
    id: "full-day-mixed",
    notes: [
      "Calm morning. The hoist from room 4 is back from repair and working.",
      "Quiet afternoon. The activities coordinator ran a music session, well attended.",
      "Water cooler on the ground floor is leaking. Bucket underneath and maintenance emailed at [email].",
    ],
    expectedFacts: [
      { label: "hoist repaired", anyOf: ["hoist"] },
      { label: "music session", anyOf: ["music", "activities"] },
      { label: "leak outstanding", anyOf: ["leak", "water cooler"] },
    ],
  },
];
