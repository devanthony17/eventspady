import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Phone, User, UserPlus } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { AuthDivider, AuthShell, GoogleButton } from '@components/auth/AuthShell'
import { Button } from '@components/ui/Button'
import { Input, Checkbox } from '@components/ui/Field'
import { useAuth } from '@context/AuthContext'
import { useToast } from '@context/ToastContext'
import { cn } from '@lib/utils'

const ROLES = [
  { id: 'attendee', label: 'Attend events', description: 'Book tickets and manage them in one place' },
  { id: 'organizer', label: 'Host events', description: 'List events, sell tickets and check guests in' },
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
  const { register, loginWithGoogle } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [role, setRole] = useState('attendee')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
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

    setLoading(true)
    await register({ name: form.name, email: form.email, role })
    setLoading(false)

    toast.success('Account created. Check your inbox to verify your email address.', {
      title: 'Welcome to Eventspady',
    })
    navigate(role === 'organizer' ? '/organizer' : '/dashboard')
  }

  const onGoogle = async () => {
    setGoogleLoading(true)
    await loginWithGoogle(role)
    setGoogleLoading(false)
    navigate(role === 'organizer' ? '/organizer' : '/dashboard')
  }

  return (
    <>
      <Seo
        title="Create an account"
        description="Join Eventspady to book tickets or start selling them. Free to sign up."
      />

      <AuthShell
        title="Create your account"
        subtitle="Free to join. Start booking in under a minute."
        footer={
          <p className="text-ink-500 dark:text-ink-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 underline-offset-4 hover:underline dark:text-brand-400">
              Sign in
            </Link>
          </p>
        }
      >
        {/* Role picker */}
        <fieldset className="mb-6">
          <legend className="label">What brings you here?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {ROLES.map((option) => (
              <label
                key={option.id}
                className={cn(
                  'cursor-pointer rounded-2xl border p-4 transition',
                  role === option.id
                    ? 'border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10'
                    : 'border-ink-200 hover:border-ink-300 dark:border-white/10 dark:hover:border-white/20',
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.id}
                  checked={role === option.id}
                  onChange={() => setRole(option.id)}
                  className="sr-only"
                />
                <span className="block text-sm font-bold">{option.label}</span>
                <span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">{option.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <GoogleButton onClick={onGoogle} loading={googleLoading} label="Sign up with Google" />
        <AuthDivider label="or sign up with email" />

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label={role === 'organizer' ? 'Organization name' : 'Full name'}
            required
            icon={User}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={role === 'organizer' ? 'Nova Collective' : 'Jordan Avery'}
            autoComplete="name"
          />

          <Input
            label="Email address"
            type="email"
            required
            icon={Mail}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            autoComplete="email"
            hint="We send a verification link here."
          />

          <Input
            label="Phone number"
            type="tel"
            icon={Phone}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 (415) 555-0188"
            autoComplete="tel"
            hint="Optional unless SMS verification is required."
          />

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
            label="I agree to the terms"
            description="I have read the terms of service and privacy policy."
          />

          <Button type="submit" fullWidth size="lg" loading={loading} iconLeft={UserPlus}>
            Create account
          </Button>
        </form>
      </AuthShell>
    </>
  )
}
