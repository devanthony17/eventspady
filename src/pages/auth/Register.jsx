import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff, Lock, Mail, MapPin, Phone, User, UserPlus } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { AuthDivider, AuthShell, GoogleButton } from '@components/auth/AuthShell'
import { Button } from '@components/ui/Button'
import { Input, Select, Checkbox } from '@components/ui/Field'
import { useAuth } from '@context/AuthContext'
import { useToast } from '@context/ToastContext'
import { cn } from '@lib/utils'

const ROLES = [
  { id: 'attendee', label: 'I am attending' },
  { id: 'organizer', label: 'I am organizing' },
]

const GHANA_CITIES = [
  { id: 'Wa', label: 'Wa (Upper West Region)' },
  { id: 'Jirapa', label: 'Jirapa (Upper West Region)' },
  { id: 'Nandom', label: 'Nandom (Upper West Region)' },
  { id: 'Lawra', label: 'Lawra (Upper West Region)' },
  { id: 'Tumu', label: 'Tumu (Upper West Region)' },
  { id: 'Tamale', label: 'Tamale (Northern Region)' },
  { id: 'Bolgatanga', label: 'Bolgatanga (Upper East Region)' },
  { id: 'Kumasi', label: 'Kumasi (Ashanti Region)' },
  { id: 'Accra', label: 'Accra (Greater Accra)' },
  { id: 'Other', label: 'Other Region in Ghana' },
]

const ATTENDEE_PERKS = [
  'Direct Mobile Money (MTN MoMo, Telecel Cash) checkout',
  'Instant PDF & digital QR code tickets with zero gate delay',
  'Timely reminders for upcoming festivals, concerts & derbies',
  'Zero booking fees on all free community events',
]

const ORGANIZER_PERKS = [
  'Create, publish and sell tickets in Ghanaian Cedis (GH₵)',
  'Real-time door scanner with sub-second gate validation',
  'Instant attendee analytics and revenue reports',
  'Automatic MoMo USSD payment reconciliation',
]

/** Rough password strength meter — mirrors the API's minimum policy. */
function scorePassword(value) {
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  return Math.min(score, 4)
}

const STRENGTH = [
  { label: 'Too short', tone: 'bg-rose-500' },
  { label: 'Weak', tone: 'bg-rose-500' },
  { label: 'Fair', tone: 'bg-amber-500' },
  { label: 'Good', tone: 'bg-lime-500' },
  { label: 'Strong', tone: 'bg-emerald-500' },
]

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [role, setRole] = useState('attendee')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Wa',
    password: '',
    organizationName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const strength = scorePassword(form.password)

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!accepted) {
      toast.warning('Please accept the terms and privacy policy to continue.')
      return
    }

    if (role === 'organizer' && !form.organizationName.trim()) {
      toast.warning('Please enter your organization name.')
      return
    }

    setLoading(true)
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city,
        role,
        password: form.password,
        organizationName: form.organizationName.trim(),
      })
      setLoading(false)

      toast.success('Account created! Welcome to Eventspady Ghana.', {
        title: 'Welcome aboard',
      })
      if (user?.role === 'organizer') {
        navigate('/organizer')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setLoading(false)
      toast.error(err.response?.data?.message || err.message || 'Registration failed. Please check your details.')
    }
  }

  const onGoogle = async () => {
    setGoogleLoading(true)
    try {
      toast.info('Google Sign-Up is configured with OAuth 2.0. Please enter your registration details below.')
      setGoogleLoading(false)
    } catch (err) {
      setGoogleLoading(false)
      toast.error(err.message || 'Google sign-up failed.')
    }
  }

  return (
    <>
      <Seo
        title={role === 'organizer' ? 'Join as Organizer' : 'Create an account'}
        description="Join Eventspady Ghana to book tickets or manage and sell event tickets with MTN MoMo, Telecel Cash and card."
      />

      <AuthShell
        title={role === 'organizer' ? 'Become an Organizer' : 'Create your account'}
        subtitle={
          role === 'organizer'
            ? 'Sell tickets across Ghana, scan QR codes at the gate, and receive automatic MoMo settlements.'
            : "Free to join. Start booking Ghana's best events in under a minute."
        }
        image={role === 'organizer' ? '/images/events/bugatti-blackfriday.jpg' : '/images/events/all-white-party.jpg'}
        imageAlt={role === 'organizer' ? 'Event organizer hosting crowd in Wa, Ghana' : 'All White Party celebration in Wa, Ghana'}
        badge={role === 'organizer' ? 'Eventspady Organizer Network' : 'Join Eventspady Ghana'}
        headline={
          role === 'organizer'
            ? 'Publish your events, sell out venues, and get paid directly to MoMo'
            : 'Join 24,000+ people celebrating life, sports and culture in Ghana'
        }
        perks={role === 'organizer' ? ORGANIZER_PERKS : ATTENDEE_PERKS}
        quoteIndex={role === 'organizer' ? 1 : 0}
        footer={
          <p className="text-ink-500 dark:text-ink-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 underline-offset-4 hover:underline dark:text-brand-400">
              Sign in
            </Link>
          </p>
        }
      >
        {/* Role switch */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-ink-100 p-1 dark:bg-white/[.06]">
          {ROLES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRole(option.id)}
              className={cn(
                'rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                role === option.id
                  ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-800 dark:text-white'
                  : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-white',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <GoogleButton onClick={onGoogle} loading={googleLoading} label="Sign up with Google" />
        <AuthDivider label="or sign up with email" />

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Full name"
            required
            icon={User}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Kwame Mensah"
            autoComplete="name"
          />

          {role === 'organizer' && (
            <Input
              label="Organization / Brand name"
              required
              icon={Building2}
              value={form.organizationName}
              onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
              placeholder="e.g. Royal Events / Sombo Sound"
              hint="The public organizer name displayed on your event listings."
            />
          )}

          <Input
            label="Email address"
            type="email"
            required
            icon={Mail}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder={role === 'organizer' ? 'contact@myorganization.gh' : 'kwame.mensah@gmail.com'}
            autoComplete="email"
            hint="Tickets, receipts and verification updates are emailed here."
          />

          <Input
            label="Phone number (Ghana)"
            type="tel"
            icon={Phone}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="024 123 4567"
            autoComplete="tel"
            hint="Supports MTN MoMo, Telecel Cash & AirtelTigo."
          />

          <Select
            label="City / Town (Ghana)"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          >
            {GHANA_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>

          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                icon={Lock}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-[2.4rem] grid size-7 place-items-center rounded-lg text-ink-400 transition hover:text-ink-700 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {form.password && (
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-1.5 flex-1 gap-1">
                  {Array.from({ length: 4 }, (_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'flex-1 rounded-full transition-colors',
                        i < strength ? STRENGTH[strength].tone : 'bg-ink-200 dark:bg-white/10',
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-ink-500 dark:text-ink-400">
                  {STRENGTH[strength].label}
                </span>
              </div>
            )}
          </div>

          <Checkbox
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            label="I agree to the terms and privacy policy"
            description="I accept Eventspady's ticketing policies and payment terms in Ghanaian Cedis (GH₵)."
          />

          <Button type="submit" fullWidth size="lg" loading={loading} iconLeft={UserPlus}>
            {role === 'organizer' ? 'Register organizer account' : 'Create account'}
          </Button>
        </form>
      </AuthShell>
    </>
  )
}
