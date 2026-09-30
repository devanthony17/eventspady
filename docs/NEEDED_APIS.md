# Eventspady — Required API Endpoints Specification

This document details all backend API endpoints that are **still needed** to complete full-stack integration with the existing Eventspady web application. 

These endpoints correspond to active user flows, state management handlers in `src/context/StoreContext.jsx`, and UI pages that currently rely on client-side simulation or local mock data because they are missing from the SwaggerHub API definition.

---

## Quick Reference Summary Table

| Category | Method | Endpoint | Access | Frontend Component / Source |
| :--- | :--- | :--- | :--- | :--- |
| **Organizer** | `GET` | `/api/organizer/events/drafts` | Organizer (Verified) | `src/pages/organizer/CreateEvent.jsx`, `MyEvents.jsx` |
| | `DELETE` | `/api/organizer/events/drafts/:id` | Organizer (Verified) | `src/context/StoreContext.jsx` (`deleteDraft`) |
| | `GET` | `/api/organizer/payouts` | Organizer (Verified) | `src/pages/organizer/Overview.jsx` |
| | `GET` | `/api/organizer/events/:id/analytics` | Organizer (Verified) | `src/pages/organizer/Overview.jsx` (`SalesChart`) |
| | `DELETE` | `/api/organizer/scanner/check-in/:ticketCode` | Organizer (Verified) | `src/pages/organizer/Scanner.jsx`, `Guests.jsx` |
| | `POST` | `/api/organizer/gate-violations` | Organizer (Verified) | `src/pages/organizer/Guests.jsx` (`recordGateViolation`) |
| **Attendee** | `GET` | `/api/users/overview` | Authenticated Attendee | `src/pages/dashboard/Overview.jsx` |
| | `GET` | `/api/users/settings` | Authenticated Attendee | `src/pages/dashboard/Settings.jsx` |
| | `PATCH` | `/api/users/settings` | Authenticated Attendee | `src/pages/dashboard/Settings.jsx` |
| | `GET` | `/api/users/wallet/transactions` | Authenticated Attendee | `src/pages/dashboard/WalletPage.jsx` |
| | `POST` | `/api/users/avatar` | Authenticated Attendee | `src/pages/dashboard/Profile.jsx` |
| | `DELETE` | `/api/wishlist` | Authenticated Attendee | `src/pages/dashboard/SavedEvents.jsx` (`clear`) |
| **Admin** | `GET` | `/api/admin/gate-violations` | Admin | `src/pages/admin/UsersManagement.jsx` |
| | `GET` | `/api/admin/users/:id` | Admin | `src/pages/admin/UsersManagement.jsx` |
| | `DELETE` | `/api/admin/users/:id` | Admin | `src/pages/admin/UsersManagement.jsx` |
| | `PATCH` | `/api/admin/users/:id/role` | Admin | `src/pages/admin/UsersManagement.jsx` |
| | `DELETE` | `/api/admin/events/:id` | Admin | `src/pages/admin/EventsManagement.jsx` |
| | `GET` | `/api/admin/orders/:id` | Admin | `src/pages/admin/OrdersManagement.jsx` |
| | `GET` | `/api/admin/orders/export-csv` | Admin | `src/pages/admin/OrdersManagement.jsx` |
| | `PATCH` | `/api/admin/organizers/:id/commission` | Admin | `src/pages/admin/Organizers.jsx`, `Pricing.jsx` |
| **Payments** | `POST` | `/api/payments/paystack/initialize` | Authenticated / Public | `src/pages/Checkout.jsx` |
| | `GET` | `/api/payments/paystack/verify/:reference` | Authenticated / Public | `src/pages/OrderConfirmation.jsx` |
| | `POST` | `/api/payments/flutterwave/initialize` | Authenticated / Public | `src/pages/Checkout.jsx` |
| | `GET` | `/api/payments/flutterwave/verify/:tx_ref` | Authenticated / Public | `src/pages/OrderConfirmation.jsx` |
| **Public** | `GET` | `/api/locations` | Public | `src/context/LocationContext.jsx` |
| | `POST` | `/api/events/:id/report` | Public / Authenticated | `src/components/events/ReportEventModal.jsx` |
| | `POST` | `/api/events/:id/inquiries` | Public / Authenticated | `src/pages/EventDetail.jsx` |
| | `GET` | `/api/events/:id/reviews` | Public | `src/pages/EventDetail.jsx` |
| | `POST` | `/api/events/:id/reviews` | Authenticated (Buyer) | `src/pages/EventDetail.jsx` |
| | `GET` | `/api/faq` | Public | `src/pages/Faq.jsx` |
| | `GET` | `/api/plans` | Public | `src/pages/Pricing.jsx` |

---

## 1. Organizer Portal & Event Lifecycle

### 1.1 `GET /api/organizer/events/drafts`
Fetches all unpublished event drafts created by the authenticated organizer.
- **Access:** Verified Organizer (`Bearer JWT`)
- **Query Parameters:** `page`, `limit`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "draft_dumba_youth_2026",
      "title": "Dumba Youth Cultural Night",
      "step": 2,
      "updatedAt": "2026-09-28T10:15:00.000Z",
      "basics": {
        "title": "Dumba Youth Cultural Night",
        "category": "culture",
        "city": "Wa"
      }
    }
  ]
}
```

### 1.2 `DELETE /api/organizer/events/drafts/:id`
Permanently discards an event draft.
- **Access:** Verified Organizer (`Bearer JWT`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Draft discarded successfully"
}
```

### 1.3 `GET /api/organizer/payouts`
Lists past withdrawal requests, disbursement history, and available payout balance.
- **Access:** Verified Organizer (`Bearer JWT`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "availableBalance": 4250.00,
    "pendingPayout": 1500.00,
    "lifetimeDisbursed": 18200.00,
    "payouts": [
      {
        "id": "PO-2026-0041",
        "amount": 1500.00,
        "fee": 15.00,
        "netAmount": 1485.00,
        "channel": "MTN Mobile Money",
        "destinationNumber": "+233241234567",
        "status": "pending",
        "requestedAt": "2026-09-27T14:30:00.000Z",
        "processedAt": null
      }
    ]
  }
}
```

### 1.4 `GET /api/organizer/events/:id/analytics`
Detailed time-series telemetry and ticket breakdown for a specific event.
- **Access:** Verified Organizer (`Bearer JWT`)
- **Query Parameters:** `range` (`7d` | `30d` | `all`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "eventId": "evt_dumba_2026",
    "grossRevenue": 14200.00,
    "netRevenue": 13348.00,
    "ticketsSold": 340,
    "capacity": 500,
    "checkInRate": "84.2%",
    "timeline": [
      { "date": "2026-09-21", "tickets": 42, "revenue": 1680.00 },
      { "date": "2026-09-22", "tickets": 68, "revenue": 2720.00 }
    ],
    "ticketTierBreakdown": [
      { "tierId": "tkt_regular", "name": "Regular Pass", "sold": 280, "remaining": 120 },
      { "tierId": "tkt_vip", "name": "VIP Royal Pass", "sold": 60, "remaining": 40 }
    ]
  }
}
```

### 1.5 `DELETE /api/organizer/scanner/check-in/:ticketCode` (or Undo Check-in)
Revokes or reverses an accidental check-in scan at the gate.
- **Access:** Verified Organizer / Gate Scanner (`Bearer JWT`)
- **Request Body (optional):**
```json
{
  "eventId": "evt_dumba_2026",
  "reason": "Accidental scan / attendee stepped out briefly"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Ticket check-in revoked. Status reset to pending entrance.",
  "ticketCode": "EP-2026-DUMBA-8819",
  "checkedIn": false
}
```

### 1.6 `POST /api/organizer/gate-violations`
Allows event organizers to report attendee infractions (e.g. no-show on "Pay at the Gate", counterfeit ticket presentation).
- **Access:** Verified Organizer (`Bearer JWT`)
- **Request Body:**
```json
{
  "attendeeEmail": "kwame@example.com",
  "eventId": "evt_dumba_2026",
  "orderId": "ORD-2026-8819",
  "type": "pay_at_gate_no_show",
  "notes": "Reserved 2 regular passes under Pay at the Gate and failed to arrive or pay."
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Gate violation reported to platform safety team."
}
```

---

## 2. Attendee Dashboard & User Settings

### 2.1 `GET /api/users/overview`
Aggregated attendee dashboard metrics.
- **Access:** Authenticated Attendee (`Bearer JWT`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "totalTicketsBooked": 6,
    "upcomingEventsCount": 2,
    "totalSpent": 450.00,
    "walletBalance": 75.00,
    "unreadNotificationsCount": 3,
    "upcomingEvents": [
      {
        "id": "evt_dumba_2026",
        "slug": "wa-dumba-festival-2026",
        "title": "Wa Dumba Festival 2026",
        "date": "2026-10-24T09:00:00.000Z",
        "venue": "Wa Naa's Palace Forecourt",
        "ticketCount": 2
      }
    ]
  }
}
```

### 2.2 `GET /api/users/settings` & `PATCH /api/users/settings`
Retrieves and updates notification, currency, and language preferences.
- **Access:** Authenticated User (`Bearer JWT`)
- **Request Body (`PATCH`):**
```json
{
  "language": "en",
  "currency": "GHS",
  "emailReminders": true,
  "emailOffers": false,
  "smsReminders": true,
  "pushUpdates": true
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "language": "en",
    "currency": "GHS",
    "emailReminders": true,
    "emailOffers": false,
    "smsReminders": true,
    "pushUpdates": true,
    "updatedAt": "2026-09-28T11:00:00.000Z"
  }
}
```

### 2.3 `GET /api/users/wallet/transactions`
Paginated ledger of all wallet transactions (top-ups, event ticket purchases, refunds).
- **Access:** Authenticated User (`Bearer JWT`)
- **Query Parameters:** `page`, `limit`, `type` (`credit` | `debit`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "balance": 75.00,
    "transactions": [
      {
        "id": "tx_topup_881",
        "type": "credit",
        "amount": 100.00,
        "method": "MTN Mobile Money",
        "reference": "MM-REF-992318",
        "description": "Wallet top-up via MTN MoMo",
        "createdAt": "2026-09-25T14:10:00.000Z"
      },
      {
        "id": "tx_booking_992",
        "type": "debit",
        "amount": 25.00,
        "method": "wallet",
        "reference": "ORD-2026-8819",
        "description": "Ticket booking for Wa Tech Summit",
        "createdAt": "2026-09-26T09:30:00.000Z"
      }
    ]
  }
}
```

### 2.4 `POST /api/users/avatar`
Uploads a user avatar image (multipart form-data).
- **Access:** Authenticated User (`Bearer JWT`)
- **Headers:** `Content-Type: multipart/form-data`
- **Request:** `file` (JPEG, PNG, WebP — max 5MB)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.eventspady.com/avatars/usr-gh-001-avatar.webp"
  }
}
```

### 2.5 `DELETE /api/wishlist`
Clears all saved/bookmarked events for the authenticated attendee.
- **Access:** Authenticated Attendee (`Bearer JWT`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "All saved events cleared from wishlist."
}
```

---

## 3. Administration & Governance

### 3.1 `GET /api/admin/gate-violations`
Retrieves all recorded gate violations (strikes, no-shows, ticket fraud) with violation evidence.
- **Access:** Platform Administrator (`Bearer JWT`)
- **Query Parameters:** `search`, `status` (`flagged` | `barred` | `all`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "viol_8819",
      "userId": "usr_kwame_01",
      "name": "Kwame Mensah",
      "email": "kwame@example.com",
      "phone": "+233241234567",
      "strikes": 2,
      "barred": true,
      "violations": [
        {
          "eventId": "evt_dumba_2025",
          "eventTitle": "Wa Dumba Festival 2025",
          "reason": "Pay at the Gate no-show",
          "reportedBy": "Upper West Cultural Guild",
          "date": "2025-10-18T20:00:00.000Z"
        }
      ]
    }
  ]
}
```

### 3.2 `GET /api/admin/users/:id` & `DELETE /api/admin/users/:id`
Inspects complete user records and allows administrative deletion of fraudulent accounts.
- **Access:** Platform Administrator (`Bearer JWT`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "User account permanently removed."
}
```

### 3.3 `PATCH /api/admin/users/:id/role`
Changes a user's role (`attendee` ⇄ `organizer` ⇄ `admin`).
- **Access:** Platform Administrator (`Bearer JWT`)
- **Request Body:**
```json
{
  "role": "organizer",
  "reason": "Manual upgrade requested by verified enterprise customer"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "User role updated to organizer."
}
```

### 3.4 `DELETE /api/admin/events/:id`
Hard deletion of illegal, infringing, or scam events.
- **Access:** Platform Administrator (`Bearer JWT`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Event deleted and expunged from platform."
}
```

### 3.5 `GET /api/admin/orders/export-csv`
Downloads platform-wide transaction ledger as a CSV file.
- **Access:** Platform Administrator (`Bearer JWT`)
- **Response:** `text/csv` stream with `Content-Disposition: attachment; filename="platform-orders-2026.csv"`

### 3.6 `PATCH /api/admin/organizers/:id/commission`
Sets an organizer's custom platform commission percentage.
- **Access:** Platform Administrator (`Bearer JWT`)
- **Request Body:**
```json
{
  "commissionRate": 4.0,
  "tier": "growth",
  "notes": "Negotiated discounted rate for monthly event series"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "organizerId": "wa-naa-cultural",
    "commissionRate": 4.0,
    "tier": "growth"
  }
}
```

---

## 4. Payment Gateways & Alternative Channels

### 4.1 `POST /api/payments/paystack/initialize`
Initializes a transaction for Debit/Credit Card or Apple Pay via Paystack.
- **Access:** Authenticated / Public (Guest Checkout)
- **Request Body:**
```json
{
  "orderId": "ORD-2026-8819",
  "amount": 75.00,
  "email": "customer@example.com",
  "currency": "GHS",
  "callbackUrl": "http://localhost:5173/confirmation?orderId=ORD-2026-8819"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/83901823901",
    "accessCode": "0peioea93012",
    "reference": "PSTK_2026_881902"
  }
}
```

### 4.2 `GET /api/payments/paystack/verify/:reference`
Confirms payment completion from Paystack and returns verified order receipt.
- **Access:** Authenticated / Public
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-2026-8819",
    "status": "paid",
    "amountPaid": 75.00,
    "paidAt": "2026-09-28T12:00:00.000Z"
  }
}
```

---

## 5. Public Content, Discovery & Community

### 5.1 `GET /api/locations`
Returns active Ghanaian event cities with GPS coordinates and regional grouping.
- **Access:** Public
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "id": "Wa", "name": "Wa (Central)", "region": "Upper West", "lat": 10.0606, "lng": -2.5057 },
    { "id": "Jirapa", "name": "Jirapa", "region": "Upper West", "lat": 10.5312, "lng": -2.7050 },
    { "id": "Nandom", "name": "Nandom", "region": "Upper West", "lat": 10.8542, "lng": -2.7667 },
    { "id": "Lawra", "name": "Lawra", "region": "Upper West", "lat": 10.6433, "lng": -2.8167 },
    { "id": "Tamale", "name": "Tamale", "region": "Northern Region", "lat": 9.4008, "lng": -0.8393 }
  ]
}
```

### 5.2 `POST /api/events/:id/report`
Submits a public or attendee report against an event.
- **Access:** Public / Authenticated
- **Request Body:**
```json
{
  "reason": "scam_fraud",
  "details": "Organizer is listing fake artists not appearing on the official bill.",
  "reporterEmail": "concerned@example.com"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Report submitted. Our moderation team will investigate within 24 hours."
}
```

### 5.3 `POST /api/events/:id/inquiries`
Forwards an attendee's inquiry to the organizer without exposing private organizer email.
- **Access:** Public / Authenticated
- **Request Body:**
```json
{
  "name": "Esi Annan",
  "email": "esi@example.com",
  "subject": "Wheelchair Accessibility at VIP Tent",
  "message": "Hi, does the VIP section have ramp access for wheelchairs?"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Your message has been sent to the event organizer."
}
```

### 5.4 `GET /api/events/:id/reviews` & `POST /api/events/:id/reviews`
Event ratings and attendee reviews.
- **Access:** Public (`GET`) / Verified Ticket Buyer (`POST`)
- **Request Body (`POST`):**
```json
{
  "rating": 5,
  "comment": "Incredible sound engineering and fast QR scanner entry at the gate!"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "reviewId": "rev_9921",
    "rating": 5,
    "author": "Kwame M.",
    "createdAt": "2026-09-28T12:00:00.000Z"
  }
}
```

### 5.5 `GET /api/faq`
Returns categorized FAQs for customer support.
- **Access:** Public
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "category": "Tickets & Booking",
      "questions": [
        {
          "question": "How do I receive my tickets?",
          "answer": "Instant SMS and email delivery with QR stubs, and always available in your dashboard."
        }
      ]
    }
  ]
}
```

### 5.6 `GET /api/plans`
Lists organizer platform fee tiers (Starter 6%, Growth 4%, Scale 2.5%).
- **Access:** Public
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "id": "starter", "name": "Starter", "commission": 6.0, "popular": false },
    { "id": "growth", "name": "Growth", "commission": 4.0, "popular": true },
    { "id": "scale", "name": "Scale", "commission": 2.5, "popular": false }
  ]
}
```
