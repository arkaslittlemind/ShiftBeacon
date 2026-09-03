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
