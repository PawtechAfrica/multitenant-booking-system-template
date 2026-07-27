# Hospitality Booking Backend — Schema & API Specification

**Service:** Shared booking/payments backend for Straight Group properties
**Properties served (v1):** Centurion Hotel, Mum's Garden Resort
**Stack:** Node.js + Express, Sequelize ORM, PostgreSQL (own instance, no Supabase)
**Payments:** M-Pesa Daraja (STK Push) — cards/Pesapal/Flutterwave deferred
**Channels:** REST API (web frontend) + reserved API-key auth path for future n8n/WhatsApp automation

---

## 1. Architecture Decision

**One backend, one database, one set of Sequelize models — properties differentiated by `property_id`, not by separate schemas or databases.**

Rationale: Centurion Hotel and Mum's Garden Resort have different room specs (different sizes, bed types, amenity sets, pricing structures), but forcing that into separate databases would mean maintaining two migration histories, two connection pools, and duplicated business logic for booking/payment flows that are otherwise identical. Instead:

- Every tenant-scoped table carries a `property_id` FK.
- Room-type-specific fields that vary in shape between properties (e.g. Centurion's "City View / Rain Shower" amenity tags vs. whatever Mum's Garden uses) live in a `JSONB attributes` column rather than as fixed columns. Core bookable fields (price, occupancy, bed count) stay as real typed columns since they're used in filtering/sorting queries.
- All list/query endpoints are property-scoped by slug or ID — a request for Centurion's room types can never leak Mum's Garden rows, enforced at the query layer (a `scopePropery(propertyId)` Sequelize default scope on every tenant model).
- If down the line the two properties diverge so much that this becomes awkward (e.g. wildly different booking rules), splitting into separate schemas is a straightforward migration since the FK boundary is already clean.

---

## 2. Entity-Relationship Overview

```
properties
  └─< room_types >─< room_type_images
  └─< rooms (physical, belongs to a room_type)
  └─< rate_plans >─< cancellation_policies
  └─< bookings >─< booking_rooms >─ rooms
        └─< payments >─< refunds
  └─< offers
  └─< gallery_items
  └─< inquiries  (events/group/general contact form submissions)
  └─< staff_users (admin/manager per property)

users (guests, cross-property, optional account)
  └─< bookings (nullable FK — guest checkout allowed)

notifications_log (generic, polymorphic on booking_id)
audit_log (generic, polymorphic)
```

---

## 3. Table Definitions

### 3.1 `properties`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| slug | STRING, unique | `centurion-hotel`, `mums-garden-resort` |
| name | STRING | |
| timezone | STRING | default `Africa/Nairobi` |
| currency | STRING(3) | default `KES` |
| contact_email | STRING | |
| contact_phone | STRING | |
| address | TEXT | |
| check_in_time | TIME | e.g. `14:00` — single source of truth, resolves the brief's 2pm/14:00–19:00 contradiction |
| check_out_time | TIME | e.g. `10:00` |
| is_active | BOOLEAN | |
| created_at / updated_at | TIMESTAMP | |

### 3.2 `room_types`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| property_id | UUID FK → properties | |
| slug | STRING | unique per property |
| name | STRING | "Deluxe Room", "Standard Room" |
| description | TEXT | |
| size_sqm | DECIMAL | typed column — used for display/sort |
| bed_type | ENUM | `single, twin, double, queen, king, bunk` |
| max_adults | INTEGER | |
| max_children | INTEGER | |
| total_units | INTEGER | how many physical rooms of this type exist |
| base_price | DECIMAL(10,2) | per-night, before rate plan overrides |
| currency | STRING(3) | |
| attributes | JSONB | free-form per-property specs: `{"amenities": ["City View","Rain Shower","TV+VOD","WiFi"]}` |
| is_active | BOOLEAN | |
| created_at / updated_at | | |

*Unique constraint on `(property_id, slug)`.*

### 3.3 `room_type_images`
`id, room_type_id FK, url, alt_text, sort_order, is_cover BOOLEAN`

### 3.4 `rooms` (physical inventory)
`id, property_id FK, room_type_id FK, room_number STRING, floor STRING, status ENUM(active, maintenance, out_of_service)`

Used for admin room assignment at check-in and for maintenance blocking; booking availability math (Section 5) primarily uses `room_types.total_units` minus overlapping bookings, not this table, so front-desk can assign a specific physical room without that being a hard dependency for the booking engine.

### 3.5 `cancellation_policies`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| property_id | UUID FK | |
| name | STRING | |
| tiers | JSONB | `[{"days_before": 15, "refund_pct": 100}, {"days_before": 14, "refund_pct": 50}, {"hours_before": 48, "refund_pct": 0}]` |
| deposit_pct | DECIMAL | e.g. 30 (%) — **flagged as a client-confirm field, currently blank in the source site; do not hardcode a number, require it be set per property before go-live** |
| is_default | BOOLEAN | |

### 3.6 `rate_plans` (optional pricing/cancellation override layer)
`id, property_id FK, room_type_id FK, name, price_override DECIMAL, cancellation_policy_id FK, valid_from DATE, valid_to DATE, is_active BOOLEAN`

If no rate plan is active for a date range, booking falls back to `room_types.base_price` + `cancellation_policies` where `is_default = true`.

### 3.7 `users` (guest accounts — optional, cross-property)
`id, email UNIQUE, phone, password_hash NULLABLE, first_name, last_name, role ENUM(guest, staff, admin, superadmin), property_id NULLABLE FK (set only for staff/admin, scopes them to one property), email_verified_at, created_at`

- `password_hash` nullable because guest-checkout bookings don't require an account.
- `role = guest` rows always have `property_id = NULL` (guests aren't scoped to one property).
- `role = staff/admin` rows require `property_id` (a Centurion admin can't see Mum's Garden bookings). `superadmin` has `property_id = NULL` and bypasses scoping (Straight Group ops level).

### 3.8 `bookings`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| booking_code | STRING(10), unique | human-readable, e.g. `CH-4F82A1` — used for guest lookup + front-desk reconciliation |
| property_id | FK | |
| room_type_id | FK | |
| rate_plan_id | FK NULLABLE | |
| user_id | FK NULLABLE | null = guest checkout |
| guest_first_name, guest_last_name, guest_email, guest_phone | STRING | always captured even if `user_id` set, so front desk never depends on a live account |
| check_in_date, check_out_date | DATE | |
| num_adults, num_children | INTEGER | |
| num_rooms | INTEGER | default 1 |
| special_requests | TEXT | |
| status | ENUM | `pending_payment, confirmed, checked_in, checked_out, cancelled, no_show, expired` |
| subtotal | DECIMAL(10,2) | nights × price × rooms |
| deposit_required | DECIMAL(10,2) | snapshot at booking time from cancellation_policy.deposit_pct |
| amount_paid | DECIMAL(10,2) | sum of completed payments |
| balance_due | DECIMAL(10,2) | computed, kept as column for fast admin queries |
| currency | STRING(3) | |
| cancellation_deadline_at | TIMESTAMP | computed from policy tiers, used to gate free-cancellation UI |
| source | ENUM | `web, whatsapp, admin_manual, phone` — reserved so future n8n/WhatsApp bookings are distinguishable in reporting |
| expires_at | TIMESTAMP | `pending_payment` bookings auto-expire (e.g. 30 min) to release held inventory |
| created_at / updated_at | | |

### 3.9 `booking_rooms` (join table — supports multi-room bookings, and post-hoc physical assignment)
`id, booking_id FK, room_id FK NULLABLE (assigned at/near check-in), room_type_id FK, sequence INTEGER`

### 3.10 `payments`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| booking_id | FK | |
| provider | ENUM | `mpesa, cash, card` (card reserved, not wired in v1) |
| type | ENUM | `deposit, balance, full` |
| amount | DECIMAL(10,2) | |
| currency | STRING(3) | |
| status | ENUM | `initiated, pending, completed, failed, reversed` |
| provider_reference | STRING | M-Pesa `CheckoutRequestID` |
| mpesa_receipt_number | STRING NULLABLE | populated from callback on success |
| phone_number | STRING | the paying MSISDN |
| raw_callback | JSONB | full Daraja callback payload, stored for audit/debugging |
| initiated_at, completed_at | TIMESTAMP | |

### 3.11 `refunds`
`id, booking_id FK, payment_id FK, amount, reason, status ENUM(requested, processing, completed, rejected), processed_by FK→users, created_at`

### 3.12 `offers` (structured content, per brief Section 10)
`id, property_id FK, title, description, discount_type ENUM(percentage, fixed_amount), discount_value DECIMAL, valid_from, valid_to, image_url, terms TEXT, is_active BOOLEAN`

### 3.13 `gallery_items`
`id, property_id FK, category ENUM(rooms, dining, events, exterior), image_url, caption, sort_order`

### 3.14 `inquiries` (non-booking contact/events/group forms)
`id, property_id FK, type ENUM(general, group_booking, events, meetings), name, email, phone, message, party_size NULLABLE, preferred_date NULLABLE, status ENUM(new, contacted, closed), created_at`

### 3.15 `notifications_log`
`id, booking_id FK, channel ENUM(email, sms, whatsapp), template, status ENUM(queued, sent, failed), sent_at, payload JSONB`

*The `whatsapp` channel value and this table's shape exist now specifically so the n8n workflow (Phase 2) can write/read against the same log without a schema change.*

### 3.16 `audit_log`
`id, actor_user_id FK NULLABLE, action STRING, entity_type STRING, entity_id UUID, changes JSONB, created_at`

### 3.17 `event_types` (editable content for the Meetings & Events page)
`id, property_id FK, title, description, image_url, icon STRING NULLABLE, sort_order INTEGER, is_active BOOLEAN`

Covers the promotional cards the brief lists under Meetings & Events (private dinners, cocktail parties, baby/bridal showers, birthday parties, corporate/board meetings, team training) — these are **content cards, not scheduled/dated events**. Admin can add/edit/reorder/retire them without a code deploy. Actual enquiries against these come through `inquiries` (3.14), not a new booking flow.

### 3.18 `media_assets` (shared upload registry)
`id, property_id FK, url, original_filename, mime_type, size_bytes, uploaded_by FK→users, created_at`

A single upload endpoint (Section 6.4) writes here and returns a URL; `gallery_items`, `room_type_images`, `offers.image_url`, and `event_types.image_url` all just store the resulting URL. Keeps file-handling logic in one place instead of duplicated per content type.

---

## 4. Sequelize Model File Layout

```
/models
  index.js
  property.js
  roomType.js
  roomTypeImage.js
  room.js
  cancellationPolicy.js
  ratePlan.js
  user.js
  booking.js
  bookingRoom.js
  payment.js
  refund.js
  offer.js
  galleryItem.js
  inquiry.js
  notificationLog.js
  auditLog.js
/migrations   -- one timestamped file per table, in the order above
/seeders
  001-properties.js        -- seeds Centurion Hotel + Mum's Garden Resort rows
  002-default-cancellation-policies.js
```

Every tenant-scoped model gets a default scope:
```js
RoomType.addScope('defaultScope', {}, { override: true });
// applied per-request via:
RoomType.scope({ method: ['byProperty', propertyId] })
```
Enforce this in a shared Express middleware (`resolveProperty`) that reads `:propertySlug` from the route, looks up the `properties` row once, and attaches `req.property` for all downstream controllers/queries — this is the single choke point that prevents cross-property data leaks, so it should be unit-tested directly.

---

## 5. Availability Logic

Availability for a `room_type` over `[checkIn, checkOut)` is **not** stored — it's computed:

```
available_units = room_types.total_units
  - COUNT(bookings WHERE room_type_id = X
      AND status IN ('confirmed','pending_payment','checked_in')
      AND check_in_date < :checkOut AND check_out_date > :checkIn)
```

`pending_payment` bookings count against availability until `expires_at` passes (handled by a scheduled job — see Section 8) — this prevents two guests both getting STK push prompts for the last room.

---

## 6. API Endpoints

Base path: `/api/v1`. All property-scoped public routes are nested under `/properties/:propertySlug/...`.

### 6.1 Public — Content & Availability
| Method | Path | Purpose |
|---|---|---|
| GET | `/properties/:propertySlug` | Property info (contact, check-in/out times, currency) |
| GET | `/properties/:propertySlug/room-types` | List room types with images, base price, amenities |
| GET | `/properties/:propertySlug/room-types/:slug` | Single room type detail |
| GET | `/properties/:propertySlug/availability?checkIn=&checkOut=&adults=&children=` | Returns each room type with `available_units`, resolved price (rate plan aware), and whether it fits the party size |
| GET | `/properties/:propertySlug/offers` | Active offers |
| GET | `/properties/:propertySlug/gallery?category=` | Gallery items |
| GET | `/properties/:propertySlug/event-types` | Meetings & Events content cards |
| POST | `/inquiries` | Submit contact/group/events form (body includes `propertySlug`) |

### 6.2 Public — Booking & Payment
| Method | Path | Purpose |
|---|---|---|
| POST | `/bookings` | Create booking → returns `booking_code`, status `pending_payment`, `deposit_required` |
| GET | `/bookings/:bookingCode?email=` | Guest lookup (requires email or phone match — no public listing) |
| POST | `/bookings/:bookingCode/cancel` | Guest-initiated cancellation, enforces `cancellation_deadline_at` |
| POST | `/payments/mpesa/stkpush` | Body: `{ bookingCode, phoneNumber, amountType: 'deposit'\|'balance'\|'full' }` → triggers Daraja STK push, creates `payments` row `status=initiated` |
| POST | `/payments/mpesa/callback` | **Daraja → server webhook only**, not called by frontend. Updates `payments.status`, recalculates `bookings.amount_paid/balance_due`, flips booking to `confirmed` once deposit threshold met |
| GET | `/payments/:bookingCode/status` | Frontend polls this after STK push (2–3s interval) until `completed`/`failed` |

### 6.3 Auth (optional guest accounts)
| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | |
| POST | `/auth/login` | Returns JWT |
| GET | `/auth/me` | |
| GET | `/auth/me/bookings` | Logged-in guest's booking history |

### 6.4 Admin Panel API (JWT, staff/admin/superadmin roles, property-scoped)

All admin routes sit under `/admin` and require a JWT from `/admin/auth/login`. The `resolveProperty` middleware (Section 4) still applies — a Centurion admin's token is scoped to `property_id = <centurion>` and every query is filtered accordingly; only `superadmin` (Straight Group ops) can pass an explicit `?propertyId=` to cross properties, e.g. for group-wide reporting.

**Role permissions** (enforced in a shared `requireRole()` middleware, not per-controller ad hoc):
| Role | Can do |
|---|---|
| `staff` | View/manage bookings (confirm, check-in, check-out, assign room), view payments, view calendar, submit manual bookings, view/respond to inquiries |
| `admin` | Everything `staff` can, plus full CRUD on room types, rooms, rate plans, cancellation policies, offers, gallery, event-types, property settings, and refunds |
| `superadmin` | Everything `admin` can, across all properties, plus managing staff/admin accounts |

#### Auth
| Method | Path | Purpose |
|---|---|---|
| POST | `/admin/auth/login` | Returns JWT + role + `propertyId` |
| GET | `/admin/auth/me` | |

#### Bookings & Front Desk
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/bookings?status=&from=&to=&search=` | `search` matches guest name/email/phone/bookingCode |
| GET | `/admin/bookings/:id` | |
| PATCH | `/admin/bookings/:id/status` | body: `{ status }` — confirm / check-in / check-out / cancel / no-show |
| POST | `/admin/bookings/:id/assign-room` | body: `{ roomId }` |
| POST | `/admin/bookings/manual` | Walk-in/phone booking, staff-entered, `source='admin_manual'`; same body shape as public `POST /bookings` plus `paymentCollected: 'cash'\|'mpesa'\|'none'` |
| GET | `/admin/calendar?month=&roomTypeId=` | Booking calendar feed |
| GET | `/admin/payments?bookingId=&status=` | |
| POST | `/admin/payments/:id/refund` | body: `{ amount, reason }` → creates `refunds` row, `status='requested'` |
| PATCH | `/admin/refunds/:id/status` | body: `{ status }` — mark processed once actually paid out |

#### Room Types
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/room-types` | includes inactive rows (public endpoint hides them) |
| POST | `/admin/room-types` | body: `{ name, slug, description, sizeSqm, bedType, maxAdults, maxChildren, totalUnits, basePrice, currency, attributes }` |
| GET | `/admin/room-types/:id` | |
| PATCH | `/admin/room-types/:id` | partial update, same fields as POST |
| DELETE | `/admin/room-types/:id` | soft delete → `is_active=false` (never hard-deletes a room type with existing bookings) |
| POST | `/admin/room-types/:id/images` | multipart upload → also writes a `media_assets` row, returns image record |
| PATCH | `/admin/room-types/:id/images/:imageId` | body: `{ sortOrder, isCover, altText }` |
| DELETE | `/admin/room-types/:id/images/:imageId` | |

#### Physical Rooms
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/rooms?roomTypeId=&status=` | |
| POST | `/admin/rooms` | body: `{ roomTypeId, roomNumber, floor }` |
| PATCH | `/admin/rooms/:id` | |
| PATCH | `/admin/rooms/:id/status` | body: `{ status: 'active'\|'maintenance'\|'out_of_service' }` |
| DELETE | `/admin/rooms/:id` | |

#### Rate Plans & Cancellation Policies
| Method | Path | Purpose |
|---|---|---|
| GET / POST | `/admin/rate-plans` | |
| PATCH / DELETE | `/admin/rate-plans/:id` | |
| GET / POST | `/admin/cancellation-policies` | body includes `tiers` array and `depositPct` |
| PATCH / DELETE | `/admin/cancellation-policies/:id` | |
| PATCH | `/admin/cancellation-policies/:id/set-default` | flips `is_default`, unsets it on the previous default in the same transaction |

#### Gallery
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/gallery?category=` | |
| POST | `/admin/gallery` | multipart upload: `{ category, caption }` + file → writes `media_assets` + `gallery_items` |
| PATCH | `/admin/gallery/:id` | body: `{ caption, category, sortOrder }` |
| PATCH | `/admin/gallery/reorder` | body: `{ items: [{ id, sortOrder }] }` — bulk drag-and-drop reorder in one call |
| DELETE | `/admin/gallery/:id` | |

#### Meetings & Events Content
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/event-types` | includes inactive |
| POST | `/admin/event-types` | body: `{ title, description, imageFile/imageUrl, icon, sortOrder }` |
| PATCH | `/admin/event-types/:id` | |
| DELETE | `/admin/event-types/:id` | soft delete → `is_active=false` |
| PATCH | `/admin/event-types/reorder` | same bulk-reorder pattern as gallery |

#### Offers / Promotions
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/offers` | includes expired/inactive |
| POST | `/admin/offers` | body: `{ title, description, discountType, discountValue, validFrom, validTo, imageFile/imageUrl, terms }` |
| PATCH | `/admin/offers/:id` | |
| DELETE | `/admin/offers/:id` | |

#### Inquiries (contact / group booking / events / meetings forms)
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/inquiries?type=&status=` | |
| GET | `/admin/inquiries/:id` | |
| PATCH | `/admin/inquiries/:id/status` | body: `{ status: 'new'\|'contacted'\|'closed' }` |

#### Property Settings
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/property` | own property's settings |
| PATCH | `/admin/property` | body: `{ contactEmail, contactPhone, address, checkInTime, checkOutTime }` — this is the single place that fixes the brief's check-in/out contradiction; front-desk-facing copy should never be hardcoded elsewhere once this exists |

#### Staff Accounts (`superadmin` only)
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/staff?propertyId=` | |
| POST | `/admin/staff` | body: `{ email, firstName, lastName, role: 'staff'\|'admin', propertyId }` — sends invite/reset-password email rather than returning a raw password |
| PATCH | `/admin/staff/:id` | change role/property assignment |
| DELETE | `/admin/staff/:id` | deactivate, don't hard-delete (keeps `audit_log`/`refunds.processed_by` FK integrity) |

#### Reports
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/reports/occupancy?from=&to=` | per-room-type occupancy % over the range |
| GET | `/admin/reports/revenue?from=&to=` | booked revenue vs. collected payments, split by room type |

#### Shared Upload Endpoint
| Method | Path | Purpose |
|---|---|---|
| POST | `/admin/media/upload` | Generic multipart upload → writes `media_assets`, returns `{ id, url }`. Room-type images, gallery, offers, and event-types all use this under the hood rather than each having bespoke file-handling logic. |

**List endpoint conventions** (apply uniformly across all admin CRUD above, not just where shown): pagination via `?page=&pageSize=` (default `pageSize=20`), sort via `?sort=field:asc|desc`, and every list response includes `meta: { total, page, pageSize }`.

### 6.5 Reserved — Service/n8n integration (Phase 2, stub now)
| Method | Path | Purpose |
|---|---|---|
| — | `/integrations/whatsapp/webhook` | Reserved route, not implemented in v1. Wire once n8n WhatsApp workflow is designed. |
| — | API-key auth middleware (`X-Api-Key` header, separate from JWT) | Build this in v1 so n8n can call the same public availability/booking/payment endpoints without needing a guest JWT flow. Keep the key scoped per-property in a `service_api_keys` table (not detailed above — small addition when Phase 2 starts). |

---

## 7. Standard Response & Error Shape

```json
// success
{ "success": true, "data": { ... }, "meta": { "page": 1 } }

// error
{ "success": false, "error": { "code": "BOOKING_NOT_AVAILABLE", "message": "No rooms of this type available for the selected dates." } }
```

Error codes worth standardizing early (frontend will switch on these): `VALIDATION_ERROR`, `ROOM_TYPE_NOT_FOUND`, `BOOKING_NOT_AVAILABLE`, `BOOKING_NOT_FOUND`, `BOOKING_EXPIRED`, `PAYMENT_FAILED`, `CANCELLATION_WINDOW_CLOSED`, `UNAUTHORIZED`, `FORBIDDEN_PROPERTY_SCOPE`.

---

## 8. Background Jobs Needed

- **Expire stale bookings:** every 1–2 min, flip `pending_payment` bookings past `expires_at` to `expired`, freeing inventory.
- **Daraja STK timeout handling:** if no callback within Daraja's window, mark `payments.status='failed'` and prompt retry.
- **Booking confirmation notifications:** on `confirmed`, enqueue email (+ SMS if configured) via `notifications_log`.
- **Cancellation deadline reminder (optional, nice-to-have):** notify guests approaching their free-cancellation cutoff.

A simple `node-cron` in-process job is enough for v1; move to a real queue only if volume demands it.

---

## 9. Open Items Requiring Client Sign-Off Before Launch (carried from product brief)

These affect real data going into `cancellation_policies` and `room_types` rows, not the schema shape itself:

1. Confirmed room specs (size/bed/occupancy/price) per room type, per property.
2. One official check-in/check-out time per property (drives `properties.check_in_time/check_out_time`).
3. `cancellation_policies.deposit_pct` — currently blank in source content, must not launch with a placeholder value.
4. Whether card payments get added in a later phase (schema already has `payments.provider = 'card'` reserved, no code path yet).