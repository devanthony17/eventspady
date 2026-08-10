import { Seo } from '@components/ui/Seo'
import { LegalPage } from '@components/layout/LegalPage'
import { SITE } from '@lib/constants'

const UPDATED = '2026-06-01T00:00:00.000Z'

const SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    body: [
      'This policy explains what Eventspady collects when you browse events, book tickets or run events as an organizer, why we collect it, and what control you have over it.',
      'We collect the minimum needed to issue and validate a ticket, take a payment and keep your account secure. We do not sell personal data, and we do not share it with advertisers.',
    ],
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: [
      'The data we hold depends on how you use the platform.',
      {
        type: 'list',
        items: [
          'Account details — your name, email address and, if you provide one, a phone number. If you sign in with Google, we receive your name, email address and profile image from Google.',
          'Booking data — the events and ticket types you book, order references, the amount paid and the payment channel used.',
          'Organizer data — your organization name, event listings, payout details and the aggregate sales figures shown in your panel.',
          'Technical data — IP address, browser type and pages visited, used to keep the service secure and to understand which features get used.',
          'Location — only when you explicitly ask us to sort events by distance. It is used for that request and never stored.',
        ],
      },
    ],
  },
  {
    id: 'payment-data',
    title: 'Payment data',
    body: [
      'Card numbers and bank credentials never reach our servers. Payments are processed by Stripe, PayPal, Flutterwave or Razorpay, each of whom handles the card data directly under their own PCI-compliant systems.',
      'We store only what we need to reconcile an order: the amount, the currency, the last four digits where the processor provides them, and the processor transaction reference.',
    ],
  },
  {
    id: 'qr-codes',
    title: 'QR codes and check-in',
    body: [
      'The QR code on your ticket encodes an order reference and a signed token — not your name, email address or any other personal data. Somebody who photographs your ticket learns nothing about you.',
      'When your ticket is scanned we record that it was used, when, and by which scanner device. Organizers see this so they can manage capacity and spot duplicate scans.',
    ],
  },
  {
    id: 'sharing',
    title: 'Who we share data with',
    body: [
      {
        type: 'list',
        items: [
          'Event organizers receive the name and email address of each ticket holder for events they run, so they can manage their guest list and contact attendees about the event itself.',
          'Payment processors receive the data needed to complete your transaction.',
          'Our email provider receives your address so we can send order confirmations, tickets and password resets.',
          'Law enforcement, only where we are legally required to respond to a valid request.',
        ],
      },
      'Organizers are bound by our terms to use attendee data only for the event in question. They may not add you to unrelated marketing lists.',
    ],
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: [
      {
        type: 'list',
        items: [
          'Account data — for as long as your account is open, then deleted within 30 days of a deletion request.',
          'Order and ticket records — seven years, because tax and accounting law requires it.',
          'Technical logs — 90 days.',
          'Marketing preferences — until you change them.',
        ],
      },
    ],
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: [
      'Wherever you are, you can ask us to show you the data we hold about you, correct anything wrong, delete your account, or export your data in a portable format.',
      'You can opt out of marketing email at any time from Settings or the unsubscribe link in any message. Transactional email — your tickets, receipts and password resets — cannot be switched off while your account is open.',
      `To exercise any of these rights, write to ${SITE.email}. We respond within 30 days.`,
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: [
      'We use a small number of cookies and local storage entries: one to keep you signed in, one to remember your theme and language, and one to hold your booking cart between visits.',
      'We do not use third-party advertising cookies or cross-site trackers.',
    ],
  },
  {
    id: 'security',
    title: 'Security',
    body: [
      'Data is encrypted in transit and at rest. Access to production systems is limited to the engineers who need it, protected by hardware-key two-factor authentication and logged.',
      'If a breach ever affects your data, we will tell you and the relevant regulator within 72 hours of becoming aware of it.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: [
      `Questions about this policy, or about your data specifically, go to ${SITE.email} or by post to ${SITE.address}.`,
      'If you are not satisfied with our response, you have the right to complain to your local data protection authority.',
    ],
  },
]

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy policy"
        description="How Eventspady collects, uses, shares and protects your personal data — including payment data, QR codes, retention periods and your rights."
      />

      <LegalPage
        eyebrow="Legal"
        title="Privacy policy"
        description="What we collect, why we collect it, and what you can do about it — in plain language."
        updatedAt={UPDATED}
        sections={SECTIONS}
        breadcrumbs={[{ label: 'Privacy policy' }]}
      />
    </>
  )
}
