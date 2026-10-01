import { Seo } from '@components/ui/Seo'
import { LegalPage } from '@components/layout/LegalPage'

const UPDATED = '2023-01-01T00:00:00.000Z'

const SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    body: [
      'This Privacy Policy explains how eventspady, as an online ticketing platform, collects, uses, discloses, and protects your personal information when you use our services. We are committed to respecting your privacy and ensuring the security of your personal data. By using our platform, you consent to the practices described in this Privacy Policy.',
    ],
  },
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    body: [
      '1.1 Personal Information: When you use our online ticketing platform, we may collect personal information such as your name, email address, phone number, and payment details. We collect this information when you create an account, purchase tickets, or communicate with us.',
      '1.2 Usage Data: We may also collect non-personal information about your interaction with our platform. This includes your IP address, device information, browser type, and usage patterns. We collect this data through cookies and similar technologies.',
    ],
  },
  {
    id: 'use-of-information',
    title: '2. Use of Information',
    body: [
      '2.1 Provide Services: We use the personal information you provide to deliver the requested services, process ticket purchases, and send you relevant notifications, updates, and confirmations.',
      '2.2 Personalisation: We may use your information to personalise your experience on our platform, such as suggesting relevant events, promotions, or recommendations based on your preferences.',
      '2.3 Communication: We may use your contact information to communicate with you about our services, respond to your inquiries, and provide customer support.',
      '2.4 Improvements and Analytics: We may analyse usage data to improve our platform, develop new features, and optimise user experience. This may involve the use of aggregated and anonymised data.',
      '2.5 Legal Obligations: We may use or disclose your information to comply with applicable laws, regulations, or legal processes.',
    ],
  },
  {
    id: 'data-sharing-and-disclosure',
    title: '3. Data Sharing and Disclosure',
    body: [
      '3.1 Third-Party Service Providers: We may share your personal information with trusted third-party service providers who assist us in delivering our services, such as payment processors, customer support, and marketing partners. These providers are contractually bound to protect your information and can only use it for specified purposes.',
      '3.2 Business Transfers: In the event of a merger, acquisition, or sale of our business assets, your personal information may be transferred to the acquiring entity or third parties involved. We will notify you of any such transfer and ensure the protection of your information.',
      '3.3 Legal Requirements: We may disclose your personal information if required to do so by law or in response to a valid legal request, such as a court order or government inquiry.',
    ],
  },
  {
    id: 'data-security',
    title: '4. Data Security',
    body: [
      'We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no data transmission or storage system is entirely secure. We cannot guarantee the absolute security of your information, and you provide it at your own risk.',
    ],
  },
  {
    id: 'your-choices',
    title: '5. Your Choices',
    body: [
      '5.1 Account Settings: You can update and manage your account information by accessing your account settings on our platform.',
      '5.2 Communications: You can opt-out of receiving promotional emails by following the instructions provided in the email or by contacting us directly. However, we may still send you non-promotional communications regarding your account or transactions.',
      '5.3 Cookies: Most web browsers allow you to manage your cookie preferences. You can usually configure your browser to accept or reject cookies, or to prompt you before accepting them.',
    ],
  },
  {
    id: 'childrens-privacy',
    title: "6. Children's Privacy",
    body: [
      'Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that we have inadvertently collected personal information from a child, we will promptly delete it.',
    ],
  },
  {
    id: 'changes-to-policy',
    title: '7. Changes to the Privacy Policy',
    body: [
      'We may update this Privacy Policy from time to time. The revised policy will be effective upon posting on our platform. We encourage you to review this Privacy Policy periodically to stay informed about our practices.',
    ],
  },
]

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy Policy | Eventspady"
        description="This Privacy Policy explains how eventspady, as an online ticketing platform, collects, uses, discloses, and protects your personal information when you use our services."
      />

      <LegalPage
        eyebrow="Legal"
        title="eventspady privacy policy @2023"
        description="This Privacy Policy explains how eventspady, as an online ticketing platform, collects, uses, discloses, and protects your personal information when you use our services."
        updatedAt={UPDATED}
        sections={SECTIONS}
        breadcrumbs={[{ label: 'Privacy Policy' }]}
      />
    </>
  )
}
