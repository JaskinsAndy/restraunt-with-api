# Gasthaus Quell

Gasthaus Quell is a modern Next.js experience inspired by Aceternity UI patterns. It showcases an alpine fine dining room located in Bad Gastein, Austria and includes:

- A hero, experience, and menu layout built with Tailwind CSS v4.
- Ten curated dishes rendered from structured data.
- A dual reservation flow: instant web confirmation plus an AI concierge phone call powered by Twilio.

## Tech stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4 (CSS-first configuration)
- Aceternity-inspired UI primitives (glassmorphism, aurora gradients)
- Twilio Voice API for outbound AI concierge calls
- chrono-node and in-memory modules for natural language parsing and storage

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to explore the site.

### Linting

```bash
npm run lint
```

## Environment variables

Create an `.env.local` file with the following keys when you are ready to wire Twilio:

```
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+43XXXXXXXXX
PUBLIC_BASE_URL=https://your-public-domain.com
```

- `PUBLIC_BASE_URL` must be reachable by Twilio (e.g., Vercel deployment, tunnel, or public server). The AI voice flow calls back to `${PUBLIC_BASE_URL}/api/voice-script`.
- Keep `.env.local` out of version control.

## AI concierge call flow

1. Guests submit their phone number inside the "AI concierge" panel.
2. `/api/ai-call` validates the environment, creates a pending reservation, and triggers a Twilio outbound call.
3. Twilio hits `/api/voice-script`, which delivers a multi-step conversational flow:
   - Collects name, party size, desired date/time, and notes using speech recognition.
   - Parses natural language date/time with `chrono-node` (assumes Europe/Vienna timezone).
   - Waits for the guest to say "confirm" (English or German synonyms) before finalising.
4. Collected data is merged into the in-memory reservation store and surfaced through `/api/reservations`.

> **Note:** In-memory storage resets whenever the server restarts. Replace `src/lib/reservations.ts` with a database implementation when persistence is required.

## Local testing tips

- Without Twilio credentials the concierge call form will show a descriptive error response.
- You can inspect captured reservations at `GET /api/reservations` while the dev server is running.
- For Twilio webhook testing in development, expose your local server with a tunnel (e.g., `ngrok`) and set `PUBLIC_BASE_URL` to the tunnel URL.

## Deployment checklist

1. Provide the four environment variables above to your hosting platform.
2. Ensure your domain uses HTTPS (Twilio requires TLS for webhooks).
3. Configure Twilio Voice to allow calls to the countries you expect (Austria for production).
4. Optionally record conversations or plug in a live CRM by extending the handlers in `src/lib`.

Enjoy crafting memorable evenings at Gasthaus Quell!