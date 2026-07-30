# Frontend Integration Guide — Where the Backend Stands

This documents everything built so far, how to call it, and where it differs from the original spec.
Pair this with the `admin-test-console.html` tool to click through every endpoint before wiring up a
real frontend.

---

## How to use the test console

1. Open `admin-test-console.html` directly in a browser (no server needed for the tool itself — it just
   makes `fetch()` calls to your running backend).
2. Set **Base URL** to your local server, e.g. `http://localhost:3000/api/v1`.
3. Set **Property Slug** — this auto-fills any `{propertySlug}` path parameter.
4. Pick **Auth → Login** from the sidebar, edit the body to a real seeded account (e.g.
   `admin@centurion.test` / `Password123!`), hit **Send Request** — the Access/Refresh Token fields at
   the top populate automatically and every subsequent authenticated request uses them.
5. The chip next to the tokens decodes the JWT so you can see `role`, `propertyId`, and expiry at a
   glance without a second request.
6. For `superadmin` calls that need to target a specific property, fill in the `propertyId` query field
   that appears for any admin-scoped endpoint — leave it blank for `staff`/`admin` tokens, since those
   are locked server-side regardless of what you type there.
7. Tokens live only in the page's memory — refreshing the browser clears them, log in again.

---

## Base URL & response shape

```
{{baseUrl}} = http://localhost:3000/api/v1   (or your deployed URL)
```

Every response follows one of two shapes:
```json
// success
{ "success": true, "data": { ... }, "meta": { "total": 42, "page": 1, "pageSize": 20 } }

// error
{ "success": false, "error": { "code": "BOOKING_NOT_AVAILABLE", "message": "..." } }
```
`meta` only appears on paginated list endpoints.

---

## Auth flow

| Endpoint | Notes |
|---|---|
| `POST /auth/register` | Guests only — always creates `role: "guest"`. Staff/admin accounts can't self-register. |
| `POST /auth/login` | Shared across all roles — same endpoint for guest, staff, admin, superadmin. Response includes `accessToken` + `refreshToken`. |
| `POST /auth/refresh` | Body: `{ "refreshToken": "..." }`. Rotates the token — the old refresh token is revoked and a new pair is issued. Store the new one, discard the old. |
| `POST /auth/logout` | Body: `{ "refreshToken": "..." }`. Revokes that token server-side. |
| `GET /auth/me` | Requires `Authorization: Bearer <accessToken>`. |

**Every authenticated request** needs the header:
```
Authorization: Bearer <accessToken>
```
Access tokens expire in 15 minutes by default — call `/auth/refresh` when you get a `401 UNAUTHORIZED`
and retry.

---

## Property scoping — the one thing every frontend integration needs to understand

- **Public routes** are nested under `/properties/:propertySlug/...` — the slug in the URL determines
  which property's data comes back. No auth needed.
- **Admin routes** are flat, e.g. `/admin/room-types` — there's no slug in the URL. Instead, the
  logged-in user's token determines the property:
  - `staff`/`admin` tokens are locked to one property (baked into the JWT at login) — you cannot
    override this from the frontend, any `?propertyId=` you send is ignored for these roles.
  - `superadmin` tokens have no property of their own — **every** admin request from a superadmin
    session must include `?propertyId=<uuid>`, or it 400s.

Practical implication for the admin frontend: if you're building a single admin panel that both
property managers and Straight Group ops use, you'll want a property switcher in the UI that's only
shown/enabled for `superadmin` sessions (check the decoded JWT's `role`) — for everyone else, there's
nothing to switch.

---

## Endpoint inventory (everything built so far)

### Public (guest-facing site)
| Method | Path |
|---|---|
| GET | `/properties/:propertySlug` |
| GET | `/properties/:propertySlug/room-types` |
| GET | `/properties/:propertySlug/room-types/:roomTypeSlug` |
| GET | `/properties/:propertySlug/availability?checkIn=&checkOut=&adults=&children=` |
| GET | `/properties/:propertySlug/offers` |
| GET | `/properties/:propertySlug/event-types` |
| GET | `/properties/:propertySlug/gallery?category=` |
| POST | `/bookings` |
| GET | `/bookings/:bookingCode?email=` |
| POST | `/bookings/:bookingCode/cancel` |
| POST | `/payments/mpesa/stkpush` |
| GET | `/payments/:bookingCode/status` |
| POST | `/inquiries` |
| POST | `/auth/register` |
| POST | `/auth/login` |
| POST | `/auth/refresh` |
| POST | `/auth/logout` |
| GET | `/auth/me` |

### Admin (staff / admin / superadmin, role-gated per table below)
| Method | Path |
|---|---|
| GET, PATCH | `/admin/property` |
| GET, POST | `/admin/room-types` |
| GET, PATCH, DELETE | `/admin/room-types/:id` |
| POST, PATCH, DELETE | `/admin/room-types/:id/images(/:imageId)` |
| GET | `/admin/bookings` |
| GET | `/admin/bookings/:id` |
| PATCH | `/admin/bookings/:id/status` |
| POST | `/admin/bookings/:id/assign-room` |
| POST | `/admin/bookings/manual` |
| GET | `/admin/payments` |
| POST | `/admin/payments/:id/refund` |
| PATCH | `/admin/refunds/:id/status` |
| POST, GET, PATCH, DELETE | `/admin/staff` (**superadmin only**) |
| GET, POST, PATCH, DELETE | `/admin/cancellation-policies` |
| PATCH | `/admin/cancellation-policies/:id/set-default` |
| GET, POST, PATCH, DELETE | `/admin/rate-plans` |
| GET, POST, PATCH, DELETE | `/admin/offers` |
| GET, POST, PATCH, DELETE | `/admin/event-types` |
| PATCH | `/admin/event-types/reorder` |
| GET | `/admin/inquiries` |
| GET | `/admin/inquiries/:id` |
| PATCH | `/admin/inquiries/:id/status` |
| GET, POST, PATCH, DELETE | `/admin/rooms` (physical rooms) |
| PATCH | `/admin/rooms/:id/status` |
| GET | `/admin/reports/occupancy?from=&to=` |
| GET | `/admin/reports/revenue?from=&to=` |
| POST | `/admin/media/upload` (multipart, field name `file`) |
| GET, POST, PATCH, DELETE | `/admin/gallery` |
| PATCH | `/admin/gallery/reorder` |

**Role gating summary:** `staff` can view bookings/payments/inquiries and take manual bookings, plus
view (not edit) room types/offers/etc. `admin` adds full CRUD on content and pricing, plus refunds.
`superadmin`-only: staff account management. Reports are `admin`+ only.

---

## Known differences from the original spec (things to double check before you build against them)

1. **Booking code prefix** is derived automatically from the property slug's initials (e.g.
   `mums-garden-resort` → `MG-xxxxxx`, `centurion-hotel` → `CH-xxxxxx`) rather than a fixed lookup table
   — confirm this still reads right if you add a third property later with a colliding prefix.
2. **Inquiry `type` enum** is `general | group_bookings | events | meetings` (note: **`group_bookings`**,
   plural — the original spec doc said `group_booking`, singular). Match this exact spelling in any
   frontend form/dropdown.
3. **No `cancellation_policy_id` column on `bookings`** — a booking stores the *computed*
   `depositRequired` and `cancellationDeadlineAt` at creation time, but not which policy produced them.
   Fine for guest-facing display, but if you build an admin report that needs "which policy applied to
   this booking," that data isn't there yet.
4. **Physical room double-booking isn't checked.** Assigning Room 101 to two overlapping bookings will
   currently succeed — only room-*type* capacity (the number that actually gates availability) is
   enforced. Front desk needs to eyeball this for now if you're building that screen.
5. **Daraja STK timeout isn't handled yet.** If Safaricom never sends a callback (network issue, guest's
   phone off, etc.), a payment stays `pending` indefinitely — there's no timeout sweep yet. Build your
   payment-status polling UI to handle "still pending after 90 seconds" as an explicit state (offer a
   retry), rather than assuming it'll always resolve to `completed`/`failed`.
6. **No notifications sent yet.** The `notifications_log` table exists in the schema but nothing writes
   to it — booking confirmations aren't emailed/SMS'd. Don't build a frontend flow that assumes the
   guest gets an email; tell them their confirmation on-screen instead.
7. **Refund flow allows skipping `processing`.** You can go straight from `requested` → `completed` in
   one call — `processing` exists as an optional intermediate state, not an enforced one.
8. **Card payments are not wired up.** `payments.provider` accepts `card` in the schema, but there's no
   endpoint/flow for it — M-Pesa is the only live payment method. Don't show a "pay by card" button yet.
9. **Cancellation deposit percentage is currently a seeded placeholder (30%)** — flagged since the
   original brief left this blank pending client sign-off. Don't hardcode "30%" anywhere in frontend
   copy; always read `depositRequired` from the actual booking/availability response.
10. **No WhatsApp/n8n integration** — deliberately deferred (Phase 2 per the original spec). The
    `source` field on bookings already accepts `whatsapp` as a value and `notifications_log` already
    accepts a `whatsapp` channel, so the schema is ready, but nothing calls it yet.

---

## Suggested order to build the real frontend against this

1. **Property + room types + availability** — static-ish content, easiest to get pixel-perfect first.
2. **Booking creation + M-Pesa flow** — the critical path; test the "still pending" and "failed" states
   explicitly, not just the happy path.
3. **Guest booking lookup/cancel** — simple, self-contained.
4. **Offers / gallery / event-types / inquiries** — marketing content, no interdependencies.
5. **Admin panel** — bookings list/detail first (front desk's daily driver), then content management,
   then reports last (least urgent, purely internal).

If anything in this list doesn't match what you see when you actually hit the endpoints with the test
console, that's the console's job to catch before it becomes a frontend bug — flag it and we'll fix
whichever side is wrong.
