import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { parseDate } from "chrono-node";
import {
  createCallState,
  deleteCallState,
  getCallState,
  updateCallState,
} from "@/lib/call-flow";
import { getReservation, updateReservation } from "@/lib/reservations";

const { VoiceResponse } = twilio.twiml;

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const reservationId = requestUrl.searchParams.get("reservationId");
  const step = requestUrl.searchParams.get("step") ?? "intro";

  if (!reservationId) {
    return xmlResponse(buildError("Reservation reference missing."));
  }

  const formData = await request.formData();
  const callSid = formData.get("CallSid")?.toString();
  const callerNumber = formData.get("To")?.toString() ?? "";
  const speechResult = formData.get("SpeechResult")?.toString().trim();

  if (!callSid) {
    return xmlResponse(buildError("Call session not recognised."));
  }

  let state = getCallState(callSid);
  if (!state) {
    state = createCallState(callSid, reservationId, callerNumber);
  }

  const forwardStep = (nextStep: string) => {
    const url = new URL(requestUrl.origin + requestUrl.pathname);
    url.searchParams.set("reservationId", reservationId);
    url.searchParams.set("step", nextStep);
    return url.toString();
  };

  switch (step) {
    case "intro": {
      updateCallState(callSid, { step: "collectName" });
      const response = new VoiceResponse();
      const gather = response.gather({
        input: ["speech"],
        action: forwardStep("collectName"),
        method: "POST",
        speechTimeout: "auto",
        timeout: 6,
      });
      gather.say(
        "Gruss Gott and welcome to Gasthaus Quell. May I have the name for the reservation?"
      );
      return xmlResponse(response);
    }

    case "collectName": {
      if (!speechResult) {
        return xmlResponse(
          retry("I did not catch the name, please say it once more.", forwardStep("collectName"))
        );
      }

      const cleanedName = normaliseName(speechResult);
      updateCallState(callSid, {
        name: cleanedName,
        step: "collectPartySize",
        lastSpeech: speechResult,
      });

      const response = new VoiceResponse();
      const gather = response.gather({
        input: ["speech"],
        action: forwardStep("collectPartySize"),
        method: "POST",
        speechTimeout: "auto",
        timeout: 6,
      });
      gather.say(
        `Danke, ${cleanedName}. For how many guests shall we set the table?`
      );
      return xmlResponse(response);
    }

    case "collectPartySize": {
      if (!speechResult) {
        return xmlResponse(
          retry("Please tell me the number of guests joining you.", forwardStep("collectPartySize"))
        );
      }

      const partySize = extractPartySize(speechResult);
      if (!partySize) {
        return xmlResponse(
          retry(
            "I did not understand the party size. Please say a number, such as two or four guests.",
            forwardStep("collectPartySize")
          )
        );
      }

      updateCallState(callSid, {
        partySize,
        step: "collectDateTime",
        lastSpeech: speechResult,
      });

      const response = new VoiceResponse();
      const gather = response.gather({
        input: ["speech"],
        action: forwardStep("collectDateTime"),
        method: "POST",
        speechTimeout: "auto",
        timeout: 7,
      });
      gather.say(
        "Wonderful. Please share the date and time you wish to dine, for example this Friday at seven in the evening."
      );
      return xmlResponse(response);
    }

    case "collectDateTime": {
      if (!speechResult) {
        return xmlResponse(
          retry("Kindly mention the date and time you would like to visit.", forwardStep("collectDateTime"))
        );
      }

      const parsedDate = parseDate(speechResult, new Date(), {
        forwardDate: true,
      });

      if (!parsedDate) {
        return xmlResponse(
          retry(
            "I was unable to understand the time. Please restate the date and time, such as Saturday the twenty sixth at seven thirty.",
            forwardStep("collectDateTime")
          )
        );
      }

      updateCallState(callSid, {
        diningDate: parsedDate.toISOString(),
        step: "collectNotes",
        lastSpeech: speechResult,
      });

      const response = new VoiceResponse();
      const gather = response.gather({
        input: ["speech"],
        action: forwardStep("collectNotes"),
        method: "POST",
        speechTimeout: "auto",
        timeout: 5,
      });
      gather.say(
        "Do you have any dietary notes or celebration details we should prepare for? You may say none if there are no special requests."
      );
      return xmlResponse(response);
    }

    case "collectNotes": {
      const notes = normaliseNotes(speechResult ?? "");
      updateCallState(callSid, {
        notes,
        step: "confirm",
        lastSpeech: speechResult ?? undefined,
      });

      const response = new VoiceResponse();
      const gather = response.gather({
        input: ["speech"],
        action: forwardStep("confirm"),
        method: "POST",
        speechTimeout: "auto",
        timeout: 5,
      });
      const confirmationPrompt = buildConfirmationPrompt(reservationId, callSid);
      gather.say(confirmationPrompt.prompt);
      return xmlResponse(response);
    }

    case "confirm": {
      const confirmation = speechResult?.toLowerCase() ?? "";
      if (!/confirm|yes|ja|passt|correct|stimmt/.test(confirmation)) {
        return xmlResponse(
          retry("Please say confirm or yes so we can finalise your reservation.", forwardStep("confirm"))
        );
      }

      const latestState = getCallState(callSid);
      if (!latestState) {
        return xmlResponse(buildError("Reservation details were lost."));
      }

      updateReservation(latestState.reservationId, {
        name: latestState.name ?? null,
        partySize: latestState.partySize ?? null,
        diningDate: latestState.diningDate ?? null,
        notes: latestState.notes ?? null,
        status: "confirmed",
      });
      updateCallState(callSid, { step: "completed" });

      const response = new VoiceResponse();
      const spokenDate = latestState.diningDate
        ? formatForSpeech(new Date(latestState.diningDate))
        : "your preferred time";
      const guestCount = latestState.partySize
        ? `${latestState.partySize} guests`
        : "your party";

      response.say(
        `Wunderbar. ${latestState.name ?? "Dear guest"}, your reservation for ${guestCount} on ${spokenDate} is confirmed.`
      );

      if (latestState.notes) {
        response.say(`We have noted: ${latestState.notes}.`);
      }

      response.say(
        "If you need adjustments, please call us at any time. We look forward to welcoming you to Gasthaus Quell. Auf Wiedersehen!"
      );
      response.hangup();

      deleteCallState(callSid);

      return xmlResponse(response);
    }

    default:
      return xmlResponse(buildError("Unrecognised conversation step."));
  }
}

export async function GET() {
  const response = new VoiceResponse();
  response.say(
    "Please place the call again so we may complete your reservation."
  );
  response.hangup();
  return xmlResponse(response);
}

function xmlResponse(response: twilio.twiml.VoiceResponse) {
  return new NextResponse(response.toString(), {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}

function buildError(message: string) {
  const response = new VoiceResponse();
  response.say(message);
  response.hangup();
  return response;
}

function retry(message: string, actionUrl: string) {
  const response = new VoiceResponse();
  const gather = response.gather({
    input: ["speech"],
    action: actionUrl,
    method: "POST",
    speechTimeout: "auto",
    timeout: 6,
  });
  gather.say(message);
  return response;
}

function normaliseName(name: string) {
  const cleaned = name.replace(/[^a-zA-Z\\s'-]/g, " ").replace(/\s+/g, " ").trim();
  return cleaned
    .split(" ")
    .map((segment) =>
      segment.length > 0
        ? segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
        : ""
    )
    .join(" ");
}

function extractPartySize(input: string): number | null {
  const numeric = input.match(/\d+/);
  if (numeric) {
    const value = Number.parseInt(numeric[0], 10);
    if (Number.isFinite(value) && value > 0 && value <= 20) {
      return value;
    }
  }

  const words: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
  };

  const lowered = input.toLowerCase();
  for (const [word, value] of Object.entries(words)) {
    if (lowered.includes(word)) {
      return value;
    }
  }

  return null;
}

function normaliseNotes(notes: string) {
  if (!notes) {
    return null;
  }

  const lowered = notes.toLowerCase();
  if (["no", "none", "no notes", "no special requests"].some((entry) => lowered.includes(entry))) {
    return null;
  }

  return notes;
}

function buildConfirmationPrompt(reservationId: string, callSid: string) {
  const state = getCallState(callSid);
  const reservation = reservationId ? getReservation(reservationId) : undefined;
  const name = state?.name ?? reservation?.name ?? "your party";
  const guests = state?.partySize ?? reservation?.partySize ?? 2;
  const dateSpeech = state?.diningDate
    ? formatForSpeech(new Date(state.diningDate))
    : "your selected time";

  return {
    prompt: `${name}, please say confirm to finalise your reservation for ${guests} guests on ${dateSpeech}.`,
  };
}

function formatForSpeech(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Vienna",
  }).format(date);
}


