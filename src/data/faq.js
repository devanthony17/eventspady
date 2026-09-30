/** General FAQ — mirrors the admin panel's FAQ section, also surfaced in the mobile apps. */
export const faqGroups = [
  {
    id: 'booking',
    title: 'Booking & tickets',
    items: [
      {
        q: 'How do I book a ticket?',
        a: 'Open the event you want to attend, choose your ticket type and quantity, then continue to checkout. You can pay online or, where the organizer allows it, select “Pay at the venue” and settle in cash when you check in.',
      },
      {
        q: 'What ticket types exist?',
        a: 'Four: Free tickets require registration but no payment; Paid tickets are standard priced entries; One Day tickets are valid for a single chosen day of a multi-day event; and All Days tickets cover every day of the event.',
      },
      {
        q: 'Where do I find my ticket after booking?',
        a: 'Your ticket appears immediately in Dashboard → My Tickets with its QR code, and a copy is emailed to you. You can download it as a PDF or add it to your phone at any time.',
      },
      {
        q: 'Can I book more than one ticket at a time?',
        a: 'Yes. Each ticket type has a per-order limit set by the organizer, shown next to the quantity selector. Every attendee in the order receives their own QR code.',
      },
      {
        q: 'Can I transfer my ticket to someone else?',
        a: 'If the organizer has enabled transfers, you will see a Transfer option on the ticket in your dashboard. The original QR code is invalidated and a new one is issued to the recipient.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & refunds',
    items: [
      {
        q: 'Which payment methods can I use?',
        a: 'Online payments run through MTN Mobile Money, Telecel Cash, Paystack, Flutterwave or your Eventspady wallet balance. Most organizers also enable offline payment, where you pay cash while checking in at the venue.',
      },
      {
        q: 'How do coupons work?',
        a: 'Enter the coupon code at checkout. Coupons are issued by the admin or the organizer, apply to specific events, and can discount either a percentage of the order or a flat amount. Each has its own validity window and redemption limit.',
      },
      {
        q: 'Are taxes and fees included in the price shown?',
        a: 'Ticket prices are shown in Ghana cedis excluding tax. VAT, NHIL and GETFund levies are itemised in your order summary before you pay, so you always see the final total first.',
      },
      {
        q: 'How do refunds work?',
        a: 'Refund eligibility is set by the organizer on each event and shown on the event page. Approved refunds return either to the mobile money wallet or card you paid with, or instantly to your Eventspady wallet if you prefer.',
      },
      {
        q: 'What is the Eventspady wallet?',
        a: 'A cedi balance stored on your account. Refunds, credits and MoMo top-ups land there and can be spent on any future booking, either in full or alongside another payment method.',
      },
    ],
  },
  {
    id: 'checkin',
    title: 'Check-in & QR codes',
    items: [
      {
        q: 'How does QR check-in work?',
        a: 'A unique QR code is generated for every ticket as soon as your order is placed. At the door, the organizer scans it with the Eventspady Scanner app, which validates the ticket and marks it as used.',
      },
      {
        q: 'Do I need to print my ticket?',
        a: 'No. Showing the QR code on your phone is enough. A PDF is available if you would rather print it.',
      },
      {
        q: 'What if my QR code will not scan?',
        a: 'Turn your screen brightness up and clean the lens. If it still fails, door staff can look up your order by reference, or by the phone number or email you booked with.',
      },
      {
        q: 'Can the same ticket be scanned twice?',
        a: 'No. Once a ticket is checked in it cannot be reused, and duplicate scan attempts are flagged to the door team — including across multiple scanner devices.',
      },
    ],
  },
  {
    id: 'organizers',
    title: 'For organizers',
    items: [
      {
        q: 'How do I list an event?',
        a: 'Create an organizer account, then use Create Event to add the name, date, time, location and description, upload a cover image, and define your ticket types. You can publish immediately or save a draft.',
      },
      {
        q: 'Can I run online events?',
        a: 'Yes. Choose Online as the event type and add your join details. Attendees receive the link attached to their ticket and by email before the session starts.',
      },
      {
        q: 'How do I manage multi-day schedules?',
        a: 'Add a schedule for each day of your event with its own agenda items. Attendees see the full programme on the event page, and One Day ticket holders can pick which day they are attending.',
      },
      {
        q: 'What commission does the platform take?',
        a: 'The admin sets the commission as either a percentage or a flat cedi amount per booking. Your exact commission and payout figures are itemised on every order, and payouts settle to your bank or MoMo merchant account.',
      },
      {
        q: 'How do I create a coupon?',
        a: 'From Organizer → Coupons, set a code, choose a percentage or flat cedi discount, attach it to a specific event, then set the validity window, minimum order value and redemption limit.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & privacy',
    items: [
      {
        q: 'Can I sign in with Google?',
        a: 'Yes, if the admin has enabled Google Sign-in. Both attendees and organizers can join or sign in using Google OAuth 2.0 from the login screen.',
      },
      {
        q: 'Do I have to verify my account?',
        a: 'The admin decides whether verification is required by email, by SMS, or by both. If verification is on, you will be prompted right after signing up.',
      },
      {
        q: 'How do I report an inappropriate event?',
        a: 'Use the Report button on any event page and pick a reason. Reports go straight to the admin, who reviews them on the Reported Events page and can edit, unpublish, block or delete the listing.',
      },
      {
        q: 'What languages are supported?',
        a: 'The website and both web panels support multiple languages. Alongside English we ship Dagaare, Waali, Sisaali, Twi and French — admins download the base language file, translate it and upload it to add a locale.',
      },
      {
        q: 'How is my data handled?',
        a: 'Only the details needed to issue and validate your ticket are stored, and QR codes carry a signed token rather than your personal data. Our Privacy Policy sets out retention periods and your rights in full.',
      },
    ],
  },
]

export const allFaqs = faqGroups.flatMap((g) => g.items)
