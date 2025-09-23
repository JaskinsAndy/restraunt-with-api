"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { CheckCircle2, Loader2, PhoneCall, Sparkles } from "lucide-react";
import clsx from "clsx";

const formDefaults = {
  name: "",
  phone: "",
  email: "",
  partySize: "2",
  diningDate: "",
  notes: "",
};

type FormStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export function ReservationSection() {
  const [form, setForm] = useState(formDefaults);
  const [formStatus, setFormStatus] = useState<FormStatus>({ state: "idle" });
  const [callPhone, setCallPhone] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [callStatus, setCallStatus] = useState<FormStatus>({ state: "idle" });

  const formHasMessage = formStatus.state === "success" || formStatus.state === "error";
  const formMessage = formHasMessage ? formStatus.message : "";
  const callHasMessage = callStatus.state === "success" || callStatus.state === "error";
  const callMessage = callHasMessage ? callStatus.message : "";

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.diningDate) {
      setFormStatus({ state: "error", message: "Please choose a reservation time." });
      return;
    }

    setFormStatus({ state: "loading" });

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          partySize: Number.parseInt(form.partySize, 10),
          diningDate: new Date(form.diningDate).toISOString(),
          notes: form.notes || undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          typeof payload.error === "string"
            ? payload.error
            : "We were unable to confirm the reservation. Please try again.";
        setFormStatus({ state: "error", message });
        return;
      }

      setForm({ ...formDefaults });
      setFormStatus({
        state: "success",
        message:
          "Your reservation is confirmed. Our team will reach out within the hour with a personal note.",
      });
    } catch (error) {
      console.error("[reservation]", error);
      setFormStatus({
        state: "error",
        message: "We could not reach the reservation desk. Please retry in a moment.",
      });
    }
  };

  const handleCallRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!callPhone.trim()) {
      setCallStatus({
        state: "error",
        message: "Please provide the mobile number we should call.",
      });
      return;
    }

    setCallStatus({ state: "loading" });

    try {
      const response = await fetch("/api/ai-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: callPhone, notes: callNotes || undefined }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          typeof payload.error === "string"
            ? payload.error
            : "We could not initiate the concierge call just now.";
        setCallStatus({ state: "error", message });
        return;
      }

      setCallStatus({
        state: "success",
        message:
          "Our AI concierge is dialing you within the next minute. Please keep your phone nearby.",
      });
    } catch (error) {
      console.error("[ai-call]", error);
      setCallStatus({
        state: "error",
        message: "Something went wrong while contacting our concierge.",
      });
    }
  };

  return (
    <section
      id="reservations"
      className="relative px-6 pb-28 sm:px-12 lg:px-24"
      aria-labelledby="reservations-title"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.12),transparent_65%)]" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 space-y-4 text-center sm:text-left">
          <p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-teal-100">
            Reserve your table
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <h2 id="reservations-title" className="font-heading text-3xl text-white sm:text-4xl">
                Crafted experiences tailored to your evening.
              </h2>
              <p className="max-w-3xl text-base leading-relaxed text-slate-200">
                Choose instant confirmation online or let our AI concierge call you to curate
                the perfect seating, timing, and celebration details.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-200 backdrop-blur">
              <p>+43 6434 111 222 - concierge@gasthausquell.at</p>
              <p className="mt-1 text-teal-100">Available Tuesday to Saturday from 15:00</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 backdrop-blur"
          >
            <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-teal-300/20 blur-3xl" />
            <div className="relative space-y-6">
              <header className="space-y-2">
                <h3 className="font-heading text-2xl text-white">Reserve online</h3>
                <p className="text-sm text-slate-200">
                  Immediate confirmation with a personal follow-up from our maitre d&apos;.
                </p>
              </header>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs uppercase tracking-[0.25em] text-slate-200/80">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Lena Hofbauer"
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-200/70 focus:bg-white/15"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-xs uppercase tracking-[0.25em] text-slate-200/80">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="+43 699 1234567"
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-200/70 focus:bg-white/15"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs uppercase tracking-[0.25em] text-slate-200/80">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-200/70 focus:bg-white/15"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="partySize" className="text-xs uppercase tracking-[0.25em] text-slate-200/80">
                    Party size
                  </label>
                  <input
                    id="partySize"
                    name="partySize"
                    type="number"
                    min={1}
                    max={20}
                    value={form.partySize}
                    onChange={handleChange}
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-200/70 focus:bg-white/15"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="flex flex-col gap-2">
                  <label htmlFor="diningDate" className="text-xs uppercase tracking-[0.25em] text-slate-200/80">
                    Dining time
                  </label>
                  <input
                    id="diningDate"
                    name="diningDate"
                    type="datetime-local"
                    value={form.diningDate}
                    onChange={handleChange}
                    required
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-200/70 focus:bg-white/15"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="notes" className="text-xs uppercase tracking-[0.25em] text-slate-200/80">
                    Notes
                  </label>
                  <input
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Anniversary, allergies, chef&apos;s counter"
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-200/70 focus:bg-white/15"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={formStatus.state === "loading"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:from-teal-300 hover:to-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {formStatus.state === "loading" && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  )}
                  Confirm reservation
                </button>
                {formStatus.state !== "idle" && (
                  <p
                    className={clsx("text-sm", {
                      "text-teal-100": formStatus.state === "success",
                      "text-rose-200": formStatus.state === "error",
                    })}
                  >
                    {formStatus.state === "success" && (
                      <CheckCircle2 className="mr-2 inline h-4 w-4" aria-hidden />
                    )}
                    {formMessage}
                  </p>
                )}
              </div>
            </div>
          </form>

          <div
            id="ai-concierge"
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-900/20 p-8 backdrop-blur"
          >
            <div className="absolute -top-16 right-10 h-32 w-32 rounded-full bg-cyan-400/25 blur-3xl" />
            <div className="absolute -bottom-10 left-12 h-40 w-40 rounded-full bg-teal-300/20 blur-3xl" />
            <div className="relative space-y-8">
              <header className="space-y-2">
                <h3 className="font-heading text-2xl text-white">AI concierge call</h3>
                <p className="text-sm text-slate-200">
                  Our Twilio-powered voice concierge gathers your details conversationally
                  and confirms the reservation live.
                </p>
              </header>
              <ul className="space-y-4">
                {[
                  {
                    icon: PhoneCall,
                    title: "Share your number",
                    description:
                      "Provide the mobile line you would like us to call within the next minute.",
                  },
                  {
                    icon: Sparkles,
                    title: "Conversational flow",
                    description:
                      "The assistant confirms your name, party size, timing, and any special touches.",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Instant summary",
                    description:
                      "The reservation syncs to our host stand with your preferences in moments.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-teal-200">
                      <item.icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <p className="font-heading text-sm text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-200/90">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <form onSubmit={handleCallRequest} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="callPhone" className="text-xs uppercase tracking-[0.25em] text-slate-200/80">
                    Phone number to call
                  </label>
                  <input
                    id="callPhone"
                    name="callPhone"
                    value={callPhone}
                    onChange={(event) => setCallPhone(event.target.value)}
                    placeholder="+43 660 987654"
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-200/70 focus:bg-white/15"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="callNotes" className="text-xs uppercase tracking-[0.25em] text-slate-200/80">
                    Optional notes
                  </label>
                  <textarea
                    id="callNotes"
                    name="callNotes"
                    rows={3}
                    value={callNotes}
                    onChange={(event) => setCallNotes(event.target.value)}
                    placeholder="Birthday toast, terrace seating, language preference"
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-200/70 focus:bg-white/15"
                  />
                </div>
                <button
                  type="submit"
                  disabled={callStatus.state === "loading"}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-200/70 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {callStatus.state === "loading" && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  )}
                  Request a concierge call
                </button>
                {callStatus.state !== "idle" && (
                  <p
                    className={clsx("text-sm", {
                      "text-cyan-100": callStatus.state === "success",
                      "text-rose-200": callStatus.state === "error",
                    })}
                  >
                    {callStatus.state === "success" && (
                      <CheckCircle2 className="mr-2 inline h-4 w-4" aria-hidden />
                    )}
                    {callMessage}
                  </p>
                )}
              </form>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">
                Calls powered by Twilio Voice - Available in English & German
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
