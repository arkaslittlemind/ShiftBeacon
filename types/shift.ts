// Notes reach the AI digest prompt verbatim, so an unbounded one could stall
// or exhaust the digest for the whole organization. Lives here rather than
// beside the schemas so client components can use it without importing zod.
export const NOTE_MAX_LENGTH = 1000;

export type ShiftResponse = {
  id: string;
  clockInAt: string;
  clockInLatitude: number;
  clockInLongitude: number;
  clockInNote: string | null;
  clockOutAt: string | null;
  clockOutLatitude: number | null;
  clockOutLongitude: number | null;
  clockOutNote: string | null;
};

export type ShiftsResponse = {
  activeShift: ShiftResponse | null;
  history: ShiftResponse[];
};

export type ClockInInput = {
  latitude: number;
  longitude: number;
  note?: string;
};

export type ClockOutInput = {
  latitude?: number;
  longitude?: number;
  note?: string;
};
