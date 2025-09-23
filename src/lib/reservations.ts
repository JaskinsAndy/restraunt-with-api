import { randomUUID } from "node:crypto";

export type ReservationSource = "web" | "ai-call";
export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export type Reservation = {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  partySize: number | null;
  diningDate: string | null;
  notes: string | null;
  source: ReservationSource;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
};

type CreateReservationInput = {
  id?: string;
  name?: string | null;
  phone: string;
  email?: string | null;
  partySize?: number | null;
  diningDate?: string | null;
  notes?: string | null;
  source: ReservationSource;
  status?: ReservationStatus;
};

const reservations: Reservation[] = [];

export function createReservation(input: CreateReservationInput): Reservation {
  const now = new Date().toISOString();
  const reservation: Reservation = {
    id: input.id ?? randomUUID(),
    name: input.name?.trim() || null,
    phone: normalizePhone(input.phone),
    email: input.email?.trim() || null,
    partySize: typeof input.partySize === "number" ? input.partySize : null,
    diningDate: input.diningDate ?? null,
    notes: input.notes?.trim() || null,
    source: input.source,
    status: input.status ?? (input.source === "web" ? "confirmed" : "pending"),
    createdAt: now,
    updatedAt: now,
  };

  reservations.unshift(reservation);
  return reservation;
}

export function updateReservation(
  id: string,
  updates: Partial<Omit<Reservation, "id" | "createdAt" | "source">>
): Reservation | null {
  const reservation = reservations.find((entry) => entry.id === id);
  if (!reservation) {
    return null;
  }

  if (typeof updates.name !== "undefined") {
    reservation.name = updates.name?.trim() || null;
  }

  if (typeof updates.phone !== "undefined") {
    reservation.phone = normalizePhone(updates.phone);
  }

  if (typeof updates.email !== "undefined") {
    reservation.email = updates.email?.trim() || null;
  }

  if (typeof updates.partySize !== "undefined") {
    reservation.partySize =
      typeof updates.partySize === "number" ? updates.partySize : null;
  }

  if (typeof updates.diningDate !== "undefined") {
    reservation.diningDate = updates.diningDate ?? null;
  }

  if (typeof updates.notes !== "undefined") {
    reservation.notes = updates.notes?.trim() || null;
  }

  if (typeof updates.status !== "undefined") {
    reservation.status = updates.status;
  }

  reservation.updatedAt = new Date().toISOString();
  return reservation;
}

export function listReservations(): Reservation[] {
  return [...reservations];
}

export function getReservation(id: string): Reservation | undefined {
  return reservations.find((entry) => entry.id === id);
}

function normalizePhone(value: string): string {
  return value.replace(/[^+\d]/g, "");
}