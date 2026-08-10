import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react'
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

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const user = await login({ email: form.email, role })
    setLoading(false)
    toast.success(`Welcome back, ${user.name.split(' ')[0]}.`)
    navigate(role === 'organizer' ? '/organizer' : redirectTo)
  }

  const onGoogle = async () => {
    setGoogleLoading(true)
    const user = await loginWithGoogle(role)
    setGoogleLoading(false)
    toast.success(`Signed in as ${user.email}.`)
    navigate(role === 'organizer' ? '/organizer' : redirectTo)
  }

  return (
    <>
      <Seo
        title="Sign in"
        description="Sign in to Eventspady to manage your tickets, wallet and saved events."
        noIndex
      />

      <AuthShell
        title="Welcome back"
        subtitle="Sign in to see your tickets, wallet balance and saved events."
        footer={
          <p className="text-ink-500 dark:text-ink-400">
            New to Eventspady?{' '}
            <Link to="/register" className="font-bold text-brand-600 underline-offset-4 hover:underline dark:text-brand-400">
              Create an account
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
            placeholder="you@example.com"
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
            Sign in
          </Button>
        </form>

        <p className="mt-6 rounded-xl bg-ink-50 px-4 py-3 text-xs text-ink-500 dark:bg-white/[.04] dark:text-ink-400">
          <strong className="font-bold text-ink-700 dark:text-ink-200">Demo mode:</strong> any email and password
          combination signs you in so you can explore the dashboards.
        </p>
      </AuthShell>
    </>
  )
}
