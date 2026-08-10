import { useState } from 'react'
import { Bug, Heart, Lightbulb, Send, Star, ThumbsUp } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { PageHero } from '@components/layout/PageHero'
import { Container, Section } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { Input, Textarea, Checkbox } from '@components/ui/Field'
import { useAuth } from '@context/AuthContext'
import { useToast } from '@context/ToastContext'
import { cn } from '@lib/utils'

const TYPES = [
  { id: 'praise', label: 'Something you love', icon: Heart, tone: 'from-rose-500 to-pink-700' },
  { id: 'idea', label: 'An idea', icon: Lightbulb, tone: 'from-amber-500 to-orange-700' },
  { id: 'bug', label: 'Something broken', icon: Bug, tone: 'from-slate-500 to-slate-800' },
]

export default function Feedback() {
  const { user } = useAuth()
  const toast = useToast()

  const [type, setType] = useState('idea')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', message: '' })
  const [contactMe, setContactMe] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    await new Promise((r) => setTimeout(r, 900))
    setSending(false)
    setSent(true)
    toast.success('Your feedback went straight to the team. Thank you.')
  }

  return (
    <>
      <Seo
        title="Send feedback"
        description="Tell the Eventspady team what is working, what is missing and what is broken. Every piece of feedback reaches the people who can act on it."
        keywords="eventspady feedback, feature request, report a bug"
      />

      <PageHero
        eyebrow="Feedback"
        title="Tell us what would make this better"
        description="Feedback goes to the admin team and straight into our planning. We read every submission — including the blunt ones."
        breadcrumbs={[{ label: 'Feedback' }]}
      />

      <Section>
        <Container size="narrow">
          {sent ? (
            <div className="surface p-10 text-center">
              <span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <ThumbsUp className="size-8" aria-hidden="true" />
              </span>
              <h2 className="text-2xl font-extrabold">Thank you — that is genuinely useful</h2>
              <p className="mx-auto mt-3 max-w-md text-pretty text-ink-500 dark:text-ink-300">
                Your feedback is with the team. If you asked us to follow up, you will hear from us within a
                few days.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button
                  onClick={() => {
                    setSent(false)
                    setForm({ ...form, message: '' })
                    setRating(0)
                  }}
                  variant="outline"
                >
                  Send more feedback
                </Button>
                <Button to="/events">Back to events</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="surface p-6 sm:p-9">
              {/* Type */}
              <fieldset className="mb-7">
                <legend className="label">What kind of feedback is this?</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {TYPES.map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border p-5 text-center transition',
                        type === option.id
                          ? 'border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10'
                          : 'border-ink-200 hover:border-ink-300 dark:border-white/10 dark:hover:border-white/20',
                      )}
                    >
                      <input
                        type="radio"
                        name="feedback-type"
                        checked={type === option.id}
                        onChange={() => setType(option.id)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          'grid size-11 place-items-center rounded-xl bg-gradient-to-br text-white',
                          option.tone,
                        )}
                      >
                        <option.icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-bold">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Rating */}
              <fieldset className="mb-7">
                <legend className="label">How would you rate Eventspady overall?</legend>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }, (_, i) => {
                    const value = i + 1
                    const filled = value <= (hovered || rating)

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        onMouseEnter={() => setHovered(value)}
                        onMouseLeave={() => setHovered(0)}
                        aria-label={`Rate ${value} out of 5`}
                        aria-pressed={rating === value}
                        className="rounded-lg p-1 transition hover:scale-110"
                      >
                        <Star
                          className={cn('size-8 transition', filled ? 'text-amber-400' : 'text-ink-200 dark:text-white/15')}
                          fill={filled ? 'currentColor' : 'none'}
                        />
                      </button>
                    )
                  })}
                  {rating > 0 && (
                    <span className="ml-2 text-sm font-semibold text-ink-500 dark:text-ink-400">
                      {['Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating - 1]}
                    </span>
                  )}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Optional"
                  autoComplete="name"
                />
                <Input
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Optional — only if you want a reply"
                  autoComplete="email"
                />

                <Textarea
                  label="Your feedback"
                  required
                  rows={6}
                  wrapperClassName="sm:col-span-2"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={
                    type === 'bug'
                      ? 'What did you do, what did you expect, and what happened instead?'
                      : type === 'idea'
                        ? 'What would you like to be able to do that you cannot today?'
                        : 'What is working well for you?'
                  }
                />
              </div>

              <Checkbox
                checked={contactMe}
                onChange={(e) => setContactMe(e.target.checked)}
                label="You can contact me about this"
                description="We will only get in touch if we need more detail or have shipped a fix."
                className="mt-5"
              />

              <Button type="submit" size="lg" loading={sending} iconLeft={Send} className="mt-7">
                Send feedback
              </Button>
            </form>
          )}
        </Container>
      </Section>
    </>
  )
}
