import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, Eye, EyeOff, Lock, LogIn, Mail, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { AuthDivider, AuthShell, GoogleButton } from '@components/auth/AuthShell'
import { Button } from '@components/ui/Button'
import { Input, Checkbox } from '@components/ui/Field'
import { useAuth } from '@context/AuthContext'
import { useToast } from '@context/ToastContext'
import { cn } from '@lib/utils'

const ROLES = [
  { id: 'attendee', label: 'I am attending' },
  { id: 'organizer', label: 'I am organizing' },
]

const ATTENDEE_PERKS = [
  'All your tickets and QR codes in one secure place',
  'Instant Mobile Money (MTN MoMo & Telecel Cash) push',
  'Reminders before every event you book',
  'Save events and follow your favourite organizers',
]

const ORGANIZER_PERKS = [
  'Create, publish and sell tickets in Ghanaian Cedis (GH₵)',
  'Real-time door scanner with sub-second gate validation',
  'Instant attendee analytics and revenue reports',
  'Automatic MoMo USSD payment reconciliation',
]

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from ?? '/dashboard'

  const [role, setRole] = useState('attendee')
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [verificationError, setVerificationError] = useState(null)

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setVerificationError(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.warning('Please enter both your email address and password.')
      return
    }
    setLoading(true)
    setVerificationError(null)
    try {
      const user = await login({ email: form.email, password: form.password, role })
      setLoading(false)
      const firstName = user?.name ? user.name.split(' ')[0] : 'there'
      toast.success(`Welcome back, ${firstName}.`)
      if (user.role === 'admin') {
        navigate('/admin')
      } else if (user.role === 'organizer') {
        navigate('/organizer')
      } else {
        navigate(redirectTo)
      }
    } catch (err) {
      setLoading(false)
      if (err.code === 'ORGANIZER_NOT_VERIFIED') {
        setVerificationError(err.message)
        toast.error('Organizer verification pending')
      } else {
        toast.error(err.message || 'Failed to sign in. Please verify your email and password.')
      }
    }
  }

  const onGoogle = async () => {
    setGoogleLoading(true)
    setVerificationError(null)
    try {
      toast.info('Google Sign-In is configured with OAuth 2.0. Please enter your credentials below.')
      setGoogleLoading(false)
    } catch (err) {
      setGoogleLoading(false)
      toast.error(err.message || 'Google sign-in failed.')
    }
  }

  return (
    <>
      <Seo
        title={role === 'organizer' ? 'Organizer Sign In' : 'Sign in'}
        description="Sign in to Eventspady to manage your tickets, bookings and saved events."
        noIndex
      />

      <AuthShell
        title={role === 'organizer' ? 'Organizer portal' : 'Welcome back'}
        subtitle={
          role === 'organizer'
            ? 'Sign in to access your event command center, sales and check-in scanner.'
            : 'Sign in to see your tickets, upcoming events and saved bookmarks.'
        }
        image={role === 'organizer' ? '/images/events/bugatti-blackfriday.jpg' : '/images/events/miss-dumba.jpg'}
        imageAlt={role === 'organizer' ? 'Organizer event management in Ghana' : 'Miss Dumba pageant in Wa, Ghana'}
        badge={role === 'organizer' ? 'Organizer Command Center' : 'Eventspady Ghana'}
        headline={
          role === 'organizer'
            ? 'Sell out your events and manage admissions across Ghana'
            : 'Join 24,000+ people booking better nights out in Wa'
        }
        perks={role === 'organizer' ? ORGANIZER_PERKS : ATTENDEE_PERKS}
        quoteIndex={role === 'organizer' ? 1 : 3}
        footer={
          <div className="space-y-2">
            <p className="text-ink-500 dark:text-ink-400">
              New to Eventspady?{' '}
              <Link to="/register" className="font-bold text-brand-600 underline-offset-4 hover:underline dark:text-brand-400">
                Create an account
              </Link>
            </p>
            <p className="text-xs text-ink-400">
              Platform administrator?{' '}
              <Link to="/admin/login" className="font-semibold text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-400 underline-offset-4 hover:underline">
                Admin Console gateway →
              </Link>
            </p>
          </div>
        }
      >
        {/* Role switch - Only on Sign In page */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-ink-100 p-1 dark:bg-white/[.06]">
          {ROLES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleRoleChange(option.id)}
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

        {verificationError && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-800 dark:text-amber-300">Organizer Verification Gate</p>
                <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-200/90">{verificationError}</p>
                <p className="pt-1 text-xs text-amber-700/80 dark:text-amber-300/70">
                  Tip: Log in as <strong>Platform Admin</strong> to approve this organizer immediately in the Admin Console.
                </p>
              </div>
            </div>
          </div>
        )}

        <GoogleButton onClick={onGoogle} loading={googleLoading} />
        <AuthDivider />

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            icon={Mail}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder={role === 'organizer' ? 'organizer@eventspady.com' : 'you@example.com'}
            autoComplete="email"
          />

          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                icon={Lock}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
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
          </div>

          <div className="flex items-center justify-between gap-4">
            <Checkbox label="Remember me" defaultChecked />
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-brand-600 underline-offset-4 hover:underline dark:text-brand-400"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} iconLeft={LogIn}>
            {role === 'organizer' ? 'Sign in to organizer dashboard' : 'Sign in'}
          </Button>
        </form>
      </AuthShell>
    </>
  )
}
