# Frontend Integration Guide — Centurion Hotel / Mum's Garden Resort Booking

Companion to `backend-schema-api.md`. This document is written for whoever builds the Next.js frontend(s) so they can start against a mocked contract while the backend is built in parallel.

---

## 1. Environment & Base Config

```
NEXT_PUBLIC_API_BASE_URL=https://api.<domain>/api/v1
NEXT_PUBLIC_PROPERTY_SLUG=centurion-hotel        # or mums-garden-resort — set per site build
```

Each property keeps its **own Next.js frontend** (per Section 8 of the brief — distinct visual identity), but both point at the same backend, differentiated only by `propertySlug` baked into that site's env config. No other frontend code should need to know a second property exists.

All requests: `Content-Type: application/json`. Admin/auth requests: `Authorization: Bearer <jwt>`.

---

## 2. Response Contract

Every response follows:
```ts
type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiError = { success: false; error: { code: string; message: string } };
```
Build one shared `apiClient.js`-style fetch wrapper (matching the pattern already used in TurnApp) that:
- Prefixes `NEXT_PUBLIC_API_BASE_URL`
- Injects the JWT if present (guest or admin)
- Throws a typed error object on `success: false` so components can `catch` and branch on `error.code`
- Never lets a raw non-2xx response reach a component un-parsed

---

## 3. Core TypeScript Interfaces (mirror backend response shapes)

```ts
interface Property {
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  checkInTime: string;   // "14:00"
  checkOutTime: string;  // "10:00"
}

interface RoomType {
  id: string;
  slug: string;
  name: string;
  description: string;
  sizeSqm: number;
  bedType: string;
  maxAdults: number;
  maxChildren: number;
  basePrice: number;
  currency: string;
  attributes: { amenities: string[]; [key: string]: unknown };
  images: { url: string; altText: string; isCover: boolean }[];
}

interface AvailabilityResult extends RoomType {
  availableUnits: number;
  resolvedPrice: number; // rate-plan aware, per night
  nights: number;
  subtotal: number;
}

interface Booking {
  bookingCode: string;
  status: 'pending_payment' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show' | 'expired';
  checkInDate: string;
  checkOutDate: string;
  numAdults: number;
  numChildren: number;
  numRooms: number;
  subtotal: number;
  depositRequired: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  cancellationDeadlineAt: string;
  expiresAt: string;
}

interface Payment {
  status: 'initiated' | 'pending' | 'completed' | 'failed' | 'reversed';
  amount: number;
  provider: 'mpesa' | 'cash' | 'card';
  mpesaReceiptNumber?: string;
}
```

---

## 4. Booking Flow (Sequence Frontend Must Implement)

```
1. GET  /properties/:slug/availability?checkIn&checkOut&adults&children
   → render available room types + price

2. Guest picks room type → POST /bookings
   body: { propertySlug, roomTypeId, checkInDate, checkOutDate,
           numAdults, numChildren, numRooms, guestFirstName,
           guestLastName, guestEmail, guestPhone, specialRequests }
   → returns { bookingCode, status: 'pending_payment', depositRequired, expiresAt }

   ⚠️ Start a client-side countdown from `expiresAt` — show the guest a timer
   (e.g. "complete payment within 30:00") since the booking silently expires
   server-side and releases the room if payment isn't completed.

3. Collect payment phone number → POST /payments/mpesa/stkpush
   body: { bookingCode, phoneNumber, amountType: 'deposit' }
   → returns { paymentId, status: 'initiated' }
   UI: show "Check your phone — enter M-Pesa PIN" state immediately.

4. Poll GET /payments/:bookingCode/status every ~3s, max ~60s
   → on status:'completed' → show confirmation, redirect to booking summary
   → on status:'failed' → offer retry (back to step 3)
   → on timeout with no callback → show "still processing" + let guest
     check back via their booking code/email rather than hard-failing

5. Confirmation screen: show bookingCode prominently — this is the guest's
   lookup key for GET /bookings/:bookingCode?email= and for front-desk
   check-in reference.
```

**Do not** implement your own polling backoff beyond a simple fixed interval + max attempts — the backend's `/payments/:bookingCode/status` endpoint is cheap and idempotent, no need to over-engineer this on the frontend.

---

## 5. Guest Account Flow (Optional)

- Booking works fully without an account (`user_id` stays null server-side).
- After a successful booking, offer "Save my details for next time" → triggers `POST /auth/register` prefilled from the booking's guest fields, without re-asking for anything already captured.
- If a guest is logged in when starting a booking, prefill guest fields from `GET /auth/me` but still submit them as plain fields on `POST /bookings` (the backend always stores guest name/email/phone directly on the booking row, even for logged-in users, so front-desk never depends on account state).

---

## 6. Content Pages (Non-Booking)

These are straightforward `GET` + render, no payment involvement:

| Page | Endpoint |
|---|---|
| Room type detail | `/properties/:slug/room-types/:roomTypeSlug` |
| Photo Gallery | `/properties/:slug/gallery?category=rooms\|dining\|events\|exterior` — build the category tab UI now; the brief flagged this page as having **zero existing content**, so there's no legacy markup to migrate, just build clean against this endpoint |
| Offers/Promotions | `/properties/:slug/offers` |
| Meetings & Events / group inquiry forms | `POST /inquiries` with `type: 'events' \| 'group_booking' \| 'general'` — this is a **contact form, not a booking**, don't wire it through the booking/payment flow |

---

## 7. Error Handling UX Notes

Map these backend error codes to specific UI states (don't just show a generic toast for all of them):

| Code | Suggested UI |
|---|---|
| `BOOKING_NOT_AVAILABLE` | "No rooms available for these dates" inline on the search form, not a modal |
| `BOOKING_EXPIRED` | "This booking session expired — please search again" with a fresh search CTA |
| `PAYMENT_FAILED` | Retry button, keep booking code visible, don't force a new booking |
| `CANCELLATION_WINDOW_CLOSED` | Show the actual policy tiers (fetched, not hardcoded) so the guest sees why |
| `VALIDATION_ERROR` | Field-level inline errors — response includes field name in `error.message` |

---

## 8. What NOT to Hardcode in Frontend Code

Given the content-QA issues in the product brief, treat these as **always fetched, never hardcoded** in either frontend codebase, so a data fix on the backend doesn't require a frontend redeploy:

- Room size, bed type, occupancy, price — pull from `room-types` endpoint only.
- Check-in/check-out times — pull from `/properties/:slug` (`checkInTime`/`checkOutTime`), don't repeat "2pm/10am" as static copy anywhere, including in FAQ sections.
- Cancellation policy tiers and deposit percentage — render from `cancellation_policies` data via the booking/rate-plan response, not from static FAQ text.
- Deposit amount — same; the source site currently ships this as a blank template field, don't reintroduce a hardcoded placeholder.

---

## 9. Parallel-Dev Contract Notes

- Backend team should stand up a mock/fixture mode (e.g. seeded dev DB with both properties + a few room types each) so frontend isn't blocked waiting for real content.
- Agree on the `AvailabilityResult` and `Booking` interfaces above as the frozen v1 contract — any backend field rename should be flagged in a shared changelog rather than silently shipped, since both frontends depend on it.
- M-Pesa STK push requires a real phone + Daraja sandbox to test end-to-end; frontend should build the polling UI against a backend "fake success after N seconds" mode first, then swap to sandbox once backend has Daraja wired.
- WhatsApp/n8n is explicitly out of the UI's concern for v1 — no frontend work needed there; it will consume the same API surface later via a service API key, not through this frontend at all.