export type CallFlowStep =
  | "intro"
  | "collectName"
  | "collectPartySize"
  | "collectDateTime"
  | "collectNotes"
  | "confirm"
  | "completed";

export type CallFlowState = {
  callSid: string;
  reservationId: string;
  customerPhone: string;
  lastSpeech?: string;
  name?: string | null;
  partySize?: number | null;
  diningDate?: string | null;
  notes?: string | null;
  step: CallFlowStep;
  lastUpdated: string;
};

const callStates = new Map<string, CallFlowState>();

export function createCallState(
  callSid: string,
  reservationId: string,
  customerPhone: string
): CallFlowState {
  const state: CallFlowState = {
    callSid,
    reservationId,
    customerPhone,
    step: "intro",
    lastUpdated: new Date().toISOString(),
  };

  callStates.set(callSid, state);
  return state;
}

export function getCallState(callSid: string): CallFlowState | undefined {
  return callStates.get(callSid);
}

export function updateCallState(
  callSid: string,
  updates: Partial<CallFlowState>
): CallFlowState | undefined {
  const state = callStates.get(callSid);
  if (!state) {
    return undefined;
  }

  const merged: CallFlowState = {
    ...state,
    ...updates,
    callSid: state.callSid,
    reservationId: state.reservationId,
    customerPhone: state.customerPhone,
    lastUpdated: new Date().toISOString(),
  };

  callStates.set(callSid, merged);
  return merged;
}

export function deleteCallState(callSid: string): void {
  callStates.delete(callSid);
}