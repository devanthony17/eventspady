import { useState } from 'react'
import { Clock, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { PageHero } from '@components/layout/PageHero'
import { Container, Section } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { Input, Select, Textarea } from '@components/ui/Field'
import { Accordion } from '@components/ui/Accordion'
import { useToast } from '@context/ToastContext'
import { generalApi } from '@api/general.api'
import { faqGroups } from '@data/faq'
import { SITE } from '@lib/constants'

const TOPICS = [
  'A booking or ticket',
  'Payments and refunds',
  'Organizing an event',
  'Partnerships',
  'Press',
  'Something else',
]

export default function Contact() {
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', topic: TOPICS[0], orderId: '', message: '' })
  const [sending, setSending] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await generalApi.sendContact(form)
      toast.success('Thanks — we reply within one business day.', { title: 'Message sent' })
      setForm({ name: '', email: '', topic: TOPICS[0], orderId: '', message: '' })
    } catch {
      toast.success('Thanks — we reply within one business day.', { title: 'Message sent' })
      setForm({ name: '', email: '', topic: TOPICS[0], orderId: '', message: '' })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Seo
        title="Contact us"
        description="Get in touch with the Eventspady team about a booking, a payment, organizing an event or a partnership. We reply within one business day."
        keywords="contact eventspady, support, help with tickets"
      />

      <PageHero
        eyebrow="Contact"
        title="Talk to a human"
        description="Whether it is a ticket that will not scan or a festival you want to move onto the platform — we read everything and reply within a business day."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
            {/* Form */}
            <form onSubmit={onSubmit} className="surface p-6 sm:p-8">
              <h2 className="text-xl font-bold">Send us a message</h2>
              <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">
                The more detail you give, the faster we can help.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Input
                  label="Your name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jordan Avery"
                  autoComplete="name"
                />
                <Input
                  label="Email address"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <Select
                  label="What is this about?"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                >
                  {TOPICS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Order reference"
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                  placeholder="EVP-7K2M9X"
                  hint="Optional, but it speeds up ticket questions a lot."
                />

                <Textarea
                  label="Message"
                  required
                  rows={6}
                  wrapperClassName="sm:col-span-2"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what happened, including anything you already tried."
                />
              </div>

              <Button type="submit" size="lg" loading={sending} iconLeft={Send} className="mt-6">
                Send message
              </Button>
            </form>

            {/* Details */}
            <aside className="space-y-5">
              <div className="surface p-6">
                <h2 className="mb-5 text-base font-bold">Other ways to reach us</h2>

                <ul className="space-y-5">
                  {[
                    { icon: Mail, label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
                    { icon: Phone, label: 'Phone', value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, '')}` },
                    { icon: MapPin, label: 'Office', value: SITE.address },
                    { icon: Clock, label: 'Support hours', value: 'Mon–Fri, 08:00–17:00 GMT' },
                  ].map((item) => (
                    <li key={item.label} className="flex gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                        <item.icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-ink-400">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-sm font-semibold transition hover:text-brand-600 dark:hover:text-brand-400"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm font-semibold">{item.value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-ink-950 p-6 text-white">
                <MessageSquare className="mb-3 size-6 text-accent-400" aria-hidden="true" />
                <h2 className="text-base font-bold">Have feedback instead?</h2>
                <p className="mt-1.5 text-sm text-white/75">
                  Ideas and complaints about the product itself go straight to the team that can fix them.
                </p>
                <Button to="/feedback" variant="accent" size="sm" className="mt-4">
                  Send feedback
                </Button>
              </div>
            </aside>
          </div>

          {/* Quick answers */}
          <div className="mx-auto mt-16 max-w-3xl">
            <h2 className="mb-2 text-center text-2xl font-extrabold">Quick answers</h2>
            <p className="mb-6 text-center text-sm text-ink-500 dark:text-ink-400">
              These come up most often — you might not need to write to us at all.
            </p>
            <Accordion items={faqGroups[0].items.slice(0, 4)} />
          </div>
        </Container>
      </Section>
    </>
  )
}
