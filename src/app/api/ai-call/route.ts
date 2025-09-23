import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { createCallState, updateCallState } from "@/lib/call-flow";
import { createReservation } from "@/lib/reservations";

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )
    : null;

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!twilioClient) {
    return NextResponse.json(
      {
        error:
          "Twilio client not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.",
      },
      { status: 500 }
    );
  }

  const restaurantNumber = process.env.TWILIO_PHONE_NUMBER;
  const baseUrl = process.env.PUBLIC_BASE_URL;

  if (!restaurantNumber) {
    return NextResponse.json(
      { error: "Missing TWILIO_PHONE_NUMBER environment variable." },
      { status: 500 }
    );
  }

  if (!baseUrl) {
    return NextResponse.json(
      {
        error:
          "Missing PUBLIC_BASE_URL. Set it to the publicly accessible URL of this deployment.",
      },
      { status: 500 }
    );
  }

  try {
    const payload = await request.json();
    const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
    const notes =
      typeof payload.notes === "string" && payload.notes.trim().length > 0
        ? payload.notes.trim()
        : undefined;

    if (!phone) {
      return NextResponse.json(
        { error: "Customer phone number is required" },
        { status: 400 }
      );
    }

    const reservationId = randomUUID();

    const reservation = createReservation({
      id: reservationId,
      phone,
      notes,
      source: "ai-call",
      status: "pending",
    });

    const voiceUrl = `${baseUrl.replace(/\/$/, "")}/api/voice-script?reservationId=${reservationId}`;

    const call = await twilioClient.calls.create({
      to: phone,
      from: restaurantNumber,
      url: voiceUrl,
      machineDetection: "Enable",
    });

    const state = createCallState(call.sid, reservationId, phone);
    if (notes) {
      updateCallState(call.sid, { notes });
    }

    return NextResponse.json({
      callSid: call.sid,
      reservation,
      state,
    });
  } catch (error) {
    console.error("[AI-CALL] Failed to initiate call", error);
    return NextResponse.json(
      { error: "Failed to start AI concierge call" },
      { status: 500 }
    );
  }
}