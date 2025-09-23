import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createReservation,
  listReservations,
  Reservation,
} from "@/lib/reservations";

const reservationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Phone number is required"),
  email: z
    .string()
    .email({ message: "Enter a valid email" })
    .optional()
    .or(z.literal("").transform(() => undefined)),
  partySize: z.coerce
    .number({ invalid_type_error: "Party size must be a number" })
    .int()
    .min(1)
    .max(20),
  diningDate: z.string().min(4, "Select a reservation time"),
  notes: z.string().max(600).optional(),
});

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<Reservation[]>> {
  return NextResponse.json(listReservations());
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = reservationSchema.parse(payload);

    const reservationTime = new Date(parsed.diningDate);
    if (Number.isNaN(reservationTime.getTime())) {
      return NextResponse.json(
        { error: "Unable to parse reservation time" },
        { status: 400 }
      );
    }

    const reservation = createReservation({
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email,
      partySize: parsed.partySize,
      diningDate: reservationTime.toISOString(),
      notes: parsed.notes,
      source: "web",
      status: "confirmed",
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Unexpected error creating reservation" },
      { status: 500 }
    );
  }
}