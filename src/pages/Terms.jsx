import { Seo } from '@components/ui/Seo'
import { LegalPage } from '@components/layout/LegalPage'
import { COMMISSION, SITE } from '@lib/constants'

const UPDATED = '2026-06-01T00:00:00.000Z'

const SECTIONS = [
  {
    id: 'acceptance',
    title: 'Acceptance of terms',
    body: [
      'By creating an account, booking a ticket or publishing an event on Eventspady, you agree to these terms. If you are agreeing on behalf of an organization, you confirm you have authority to bind it.',
      'We may update these terms as the platform changes. Material changes are announced by email at least 14 days before they take effect.',
    ],
  },
  {
    id: 'accounts',
    title: 'Your account',
    body: [
      'You are responsible for the accuracy of the information on your account and for keeping your credentials secure. Tell us immediately if you believe someone else has access to it.',
      'Depending on the platform settings, we may require you to verify your email address, your phone number or both before you can book or publish.',
      'You must be at least 16 to hold an account, and old enough to attend any age-restricted event you book.',
    ],
  },
  {
    id: 'tickets',
    title: 'Buying tickets',
    body: [
      'A booking is a contract between you and the event organizer. Eventspady provides the platform, processes the payment and issues the ticket, but the organizer runs the event.',
      {
        type: 'list',
        items: [
          'Ticket prices are shown excluding tax. Applicable taxes and service fees are itemised before you pay.',
          'Each ticket carries a unique QR code and is valid for one entry unless the organizer states otherwise.',
          'Per-order limits are set by the organizer and shown next to each ticket type.',
          'Reselling tickets above face value through unauthorised channels may result in them being voided.',
        ],
      },
    ],
  },
  {
    id: 'refunds',
    title: 'Refunds and cancellations',
    body: [
      'Refund eligibility is set by the organizer on each event and shown on the event page before you book. Read it — it varies.',
      'If an organizer cancels an event, all ticket holders are refunded in full automatically, either to the original payment method or to their Eventspady wallet.',
      'Where an event is materially changed — a different date, city or venue — you may request a full refund within 14 days of being notified.',
      'Booking fees are refunded whenever the ticket price is refunded.',
    ],
  },
  {
    id: 'organizers',
    title: 'Organizer obligations',
    body: [
      'If you publish an event, you are responsible for delivering it as described, holding any licences or permits required, and complying with the law where it takes place.',
      {
        type: 'list',
        items: [
          'Listings must be accurate. Misleading titles, images or descriptions may be edited, unpublished or removed by an admin.',
          'You must honour valid tickets, including comps you issued yourself.',
          'Attendee data may be used only for the event it relates to — never for unrelated marketing.',
          'You must handle refund requests in line with the policy you published.',
        ],
      },
    ],
  },
  {
    id: 'fees',
    title: 'Commission and payouts',
    body: [
      `The platform charges commission on paid tickets — currently ${COMMISSION.value}${COMMISSION.type === 'percentage' ? '%' : ' flat'} per booking on the default plan. Free tickets carry no commission.`,
      'Payment processors charge their own fees, billed separately by them.',
      'Payouts are released after an event completes, less commission and any refunds issued. We may hold a payout where a dispute, chargeback or fraud investigation is open.',
    ],
  },
  {
    id: 'conduct',
    title: 'Acceptable use',
    body: [
      'You may not use Eventspady to list or promote anything illegal, to defraud attendees, to harass anyone, or to attack the platform itself.',
      'Attendees can report a listing from any event page. Reports go to an admin who may edit, unpublish, block or delete it.',
      'We may suspend or terminate accounts that repeatedly breach these terms, and will refund affected ticket holders where an event is removed.',
    ],
  },
  {
    id: 'liability',
    title: 'Liability',
    body: [
      'Eventspady is not the organizer. We are not liable for what happens at an event, for injuries or losses at a venue, or for an organizer failing to deliver what they promised.',
      'Our total liability to you for any claim relating to the platform is limited to the amount you paid us in the twelve months before the claim arose.',
      'Nothing in these terms limits liability for death, personal injury caused by negligence, or fraud.',
    ],
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    body: [
      'These terms are governed by the laws of the State of California, and the courts of San Francisco County have exclusive jurisdiction over any dispute.',
      'This does not remove any protection you have under the mandatory consumer law of the country where you live.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    body: [`Questions about these terms go to ${SITE.email}, or by post to ${SITE.address}.`],
  },
]

export default function Terms() {
  return (
    <>
      <Seo
        title="Terms of service"
        description="The terms governing use of Eventspady — accounts, buying tickets, refunds, organizer obligations, commission, payouts and liability."
      />

      <LegalPage
        eyebrow="Legal"
        title="Terms of service"
        description="The agreement between you, event organizers and Eventspady."
        updatedAt={UPDATED}
        sections={SECTIONS}
        breadcrumbs={[{ label: 'Terms of service' }]}
      />
    </>
  )
}
