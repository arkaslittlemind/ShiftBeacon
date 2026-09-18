// Hand-written on purpose. These notes are the input the feature 19 handover
// digest summarizes and the fixtures its eval harness scores against, so
// generating them with a model would mean grading a model on its own output.
//
// They are also deliberately synthetic: a few mention a colleague by name, an
// email, or a phone number, because the note scrubber has to have something
// real to catch.

export const SEED_ORGANIZATION = {
  id: "seed-org-riverside",
  name: "Riverside Care Home",
  latitude: 51.5074,
  longitude: -0.1278,
  clockInRadiusMeters: 200,
};

export type SeedUser = {
  key: string;
  auth0UserId: string;
  name: string;
  email: string;
  role: "CARE_WORKER" | "MANAGER";
};

export const SEED_USERS: SeedUser[] = [
  {
    key: "casey",
    auth0UserId: "auth0|seed-care-worker",
    name: "Casey Worker",
    email: "casey.worker@example.com",
    role: "CARE_WORKER",
  },
  {
    key: "morgan",
    auth0UserId: "auth0|seed-manager",
    name: "Morgan Manager",
    email: "morgan.manager@example.com",
    role: "MANAGER",
  },
  {
    key: "ada",
    auth0UserId: "auth0|seed-ada-mensah",
    name: "Ada Mensah",
    email: "ada.mensah@example.com",
    role: "CARE_WORKER",
  },
  {
    key: "tomas",
    auth0UserId: "auth0|seed-tomas-nowak",
    name: "Tomas Nowak",
    email: "tomas.nowak@example.com",
    role: "CARE_WORKER",
  },
  {
    key: "priya",
    auth0UserId: "auth0|seed-priya-raman",
    name: "Priya Raman",
    email: "priya.raman@example.com",
    role: "CARE_WORKER",
  },
  {
    key: "joel",
    auth0UserId: "auth0|seed-joel-baptiste",
    name: "Joel Baptiste",
    email: "joel.baptiste@example.com",
    role: "CARE_WORKER",
  },
  {
    key: "ines",
    auth0UserId: "auth0|seed-ines-ferreira",
    name: "Ines Ferreira",
    email: "ines.ferreira@example.com",
    role: "CARE_WORKER",
  },
  {
    key: "hana",
    auth0UserId: "auth0|seed-hana-yilmaz",
    name: "Hana Yilmaz",
    email: "hana.yilmaz@example.com",
    role: "CARE_WORKER",
  },
];

export type SeedShift = {
  worker: string;
  dayOffset: number;
  startHour: number;
  hours: number;
  clockInNote?: string;
  clockOutNote?: string;
};

export const SEED_SHIFTS: SeedShift[] = [
  {
    worker: "ada",
    dayOffset: 6,
    startHour: 7,
    hours: 8,
    clockInNote: "Arrived to a short handover, night team still finishing the meds round.",
    clockOutNote:
      "Quiet shift overall. The hoist in room 4 is making a grinding noise, logged with maintenance.",
  },
  {
    worker: "tomas",
    dayOffset: 6,
    startHour: 7.5,
    hours: 7.5,
    clockOutNote:
      "Two residents declined lunch but both ate well at tea. Kitchen has been made aware.",
  },
  {
    worker: "priya",
    dayOffset: 6,
    startHour: 14,
    hours: 8,
    clockInNote: "Picking up the late after the early team ran over.",
    clockOutNote: "Lounge TV remote missing again, a replacement has been ordered.",
  },
  {
    worker: "joel",
    dayOffset: 6,
    startHour: 14.5,
    hours: 7,
    clockOutNote:
      "Call bell in room 7 is intermittent. It worked when tested but is flagged for the electrician.",
  },

  {
    worker: "ada",
    dayOffset: 5,
    startHour: 7,
    hours: 8,
    clockOutNote:
      "Sluice door lock still not fixed, propped safely for now. Please chase maintenance.",
  },
  {
    worker: "ines",
    dayOffset: 5,
    startHour: 7.25,
    hours: 8,
    clockInNote: "Covering for Tomas Nowak, who swapped onto lates this week.",
    clockOutNote:
      "Slow start on breakfast, one agency colleague was unfamiliar with the kitchen. Walked them through it.",
  },
  {
    worker: "hana",
    dayOffset: 5,
    startHour: 14,
    hours: 8,
    clockOutNote:
      "Afternoon family visit went well. They asked for a call back on Monday, number is 07700 900312.",
  },
  {
    worker: "joel",
    dayOffset: 5,
    startHour: 14,
    hours: 8,
    clockOutNote:
      "Pressure mattress in room 2 was reading low and had deflated overnight. Swapped for the spare.",
  },
  {
    worker: "priya",
    dayOffset: 5,
    startHour: 22,
    hours: 8,
    clockOutNote: "Settled night. One resident up twice for the bathroom, assisted without incident.",
  },

  {
    worker: "tomas",
    dayOffset: 4,
    startHour: 7,
    hours: 8,
    clockInNote: "Traffic on the ring road, clocked in a few minutes late.",
    clockOutNote:
      "Medication delivery arrived one item short. Pharmacy has been contacted, due tomorrow.",
  },
  {
    worker: "priya",
    dayOffset: 4,
    startHour: 7,
    hours: 8,
    clockOutNote: "Wound dressing due this evening, handed over to the late team.",
  },
  {
    worker: "joel",
    dayOffset: 4,
    startHour: 14,
    hours: 7.5,
    clockOutNote: "Fire alarm test at 3pm. All residents reassured beforehand, no issues.",
  },
  {
    worker: "ines",
    dayOffset: 4,
    startHour: 14,
    hours: 8,
    clockOutNote:
      "Running low on incontinence pads in the upstairs store, restocked from the main cupboard.",
  },

  {
    worker: "ada",
    dayOffset: 3,
    startHour: 7,
    hours: 8,
    clockOutNote:
      "Two new starters shadowing this morning. Both were confident with the hoist by the end.",
  },
  {
    worker: "hana",
    dayOffset: 3,
    startHour: 7.5,
    hours: 7.5,
    clockOutNote: "Bathroom radiator on the first floor is cold, reported to the office.",
  },
  {
    worker: "tomas",
    dayOffset: 3,
    startHour: 14,
    hours: 8,
    clockInNote: "Swapped shifts with Priya Raman.",
    clockOutNote:
      "Evening meds ran about 30 minutes late, the second trolley key could not be found.",
  },
  {
    worker: "joel",
    dayOffset: 3,
    startHour: 14,
    hours: 8,
    clockOutNote:
      "Resident in room 9 was in low mood today, spent extra time with them. Worth a check tomorrow.",
  },
  {
    worker: "ines",
    dayOffset: 3,
    startHour: 22,
    hours: 8,
    clockOutNote: "Settled night apart from a false alarm on the door sensor around 3am.",
  },

  {
    worker: "priya",
    dayOffset: 2,
    startHour: 7,
    hours: 8,
    clockOutNote: "Handover from nights was thorough, nothing outstanding at the end of the shift.",
  },
  {
    worker: "ada",
    dayOffset: 2,
    startHour: 7,
    hours: 7,
    clockOutNote: "Short staffed by one on the early. Managed, but breaks ran late.",
  },
  {
    worker: "hana",
    dayOffset: 2,
    startHour: 14,
    hours: 8,
    clockOutNote: "Laundry backlog cleared. New rota printed and pinned up in the office.",
  },
  {
    worker: "tomas",
    dayOffset: 2,
    startHour: 14.5,
    hours: 7.5,
    clockOutNote: "Visiting GP reviewed two residents, notes updated in the care files.",
  },

  {
    worker: "ada",
    dayOffset: 1,
    startHour: 7,
    hours: 8,
    clockOutNote: "Calm morning. The hoist from room 4 is back from repair and working.",
  },
  {
    worker: "ines",
    dayOffset: 1,
    startHour: 7,
    hours: 8,
    clockInNote: "Started early to cover the breakfast round.",
    clockOutNote:
      "A fall risk assessment review was due for one resident, completed with the senior on duty.",
  },
  {
    worker: "joel",
    dayOffset: 1,
    startHour: 14,
    hours: 8,
    clockOutNote:
      "Water cooler on the ground floor is leaking. Bucket underneath and maintenance emailed at facilities@example.com.",
  },
  {
    worker: "hana",
    dayOffset: 1,
    startHour: 14,
    hours: 8,
    clockOutNote: "Quiet afternoon. The activities coordinator ran a music session, well attended.",
  },
  {
    worker: "priya",
    dayOffset: 1,
    startHour: 22,
    hours: 8,
    clockOutNote: "One resident unsettled for most of the night, reviewed by the senior on call.",
  },
];

// Started a few hours ago rather than at a fixed clock time, so the manager
// staff table always has someone on shift no matter when the seed is run.
export const SEED_ACTIVE_SHIFTS = [
  { worker: "tomas", hoursAgo: 5, clockInNote: "On for the early, handover received from nights." },
  { worker: "hana", hoursAgo: 2, clockInNote: undefined },
];
