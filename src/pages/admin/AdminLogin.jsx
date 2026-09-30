import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Lock, LogIn, Mail, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Logo } from '@components/layout/Logo'
import { ThemeToggle } from '@components/layout/ThemeToggle'
import { Button } from '@components/ui/Button'
import { Input, Checkbox } from '@components/ui/Field'
import { useAuth } from '@context/AuthContext'
import { useToast } from '@context/ToastContext'

export default function AdminLogin() {
  const { login, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from ?? '/admin'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.email.trim() || !form.password) {
      toast.warning('Please enter your administrator email and password.')
      return
    }

    setLoading(true)
    try {
      const user = await login({
        email: form.email.trim(),
        password: form.password,
        role: 'admin',
      })

      // Ensure account possesses administrator authorization
      if (user.role !== 'admin') {
        await logout()
        const forbiddenMsg =
          'Access Denied: This portal is reserved for platform administrators. Your account does not have administrative privileges.'
        setError(forbiddenMsg)
        toast.error(forbiddenMsg)
        setLoading(false)
        return
      }

      setLoading(false)
      toast.success(`Welcome back, ${user.name || 'Administrator'}.`)
      navigate(redirectTo)
    } catch (err) {
      setLoading(false)
      const message = err.message || 'Authentication failed. Please verify credentials.'
      setError(message)
      toast.error(message)
    }
  }

  return (
    <>
      <Seo
        title="Admin Sign In | Eventspady Ghana"
        description="Administrative management portal for Eventspady Ghana."
        noIndex
      />

      <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-ink-950 text-white transition-colors duration-300">
        {/* Professional architectural background image with dark overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/images/admin-bg.jpg"
            alt="Eventspady Operations"
            className="size-full object-cover"
          />
          <div
            className="absolute inset-0 bg-ink-950/75 dark:bg-ink-950/85 backdrop-blur-[2px] transition-colors duration-300"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/65 to-ink-950/85 transition-colors duration-300"
            aria-hidden="true"
          />
        </div>

        {/* Top Header */}
        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
          <Logo size="sm" to="/" />

          <div className="flex items-center gap-4 sm:gap-5">
            <Link
              to="/"
              className="text-xs font-semibold text-white/80 transition hover:text-white flex items-center gap-1.5"
            >
              Back to website
              <ArrowRight className="size-3.5" />
            </Link>
            <ThemeToggle variant="switch" />
          </div>
        </header>

        {/* Center Login Card */}
        <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/95 dark:bg-ink-900/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10 transition-colors duration-300">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-3.5 grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200 dark:bg-brand-600/20 dark:text-brand-400 dark:border-brand-500/30">
                  <ShieldCheck className="size-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
                  Administrator Sign In
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-ink-600 dark:text-ink-400">
                  Sign in with your administrator credentials to access the Eventspady control panel.
                </p>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-200">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-rose-500 dark:text-rose-400" />
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-ink-300">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="admin@eventspady.com"
                      autoComplete="username email"
                      className="w-full rounded-xl border border-ink-200 dark:border-white/15 bg-ink-50/80 dark:bg-white/5 px-4 py-2.5 pl-10 text-sm text-ink-900 dark:text-white placeholder-ink-400 dark:placeholder-ink-500 transition focus:border-brand-500 focus:bg-white dark:focus:bg-white/[.08] focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-ink-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-ink-200 dark:border-white/15 bg-ink-50/80 dark:bg-white/5 px-4 py-2.5 pl-10 pr-10 text-sm text-ink-900 dark:text-white placeholder-ink-400 dark:placeholder-ink-500 transition focus:border-brand-500 focus:bg-white dark:focus:bg-white/[.08] focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-ink-700 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <Checkbox
                    label="Remember me"
                    defaultChecked
                    className="text-xs text-ink-700 dark:text-ink-300"
                  />
                  <Link
                    to="/forgot-password"
                    className="font-medium text-brand-600 dark:text-brand-400 transition hover:text-brand-700 dark:hover:text-brand-300 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={loading}
                  iconLeft={LogIn}
                  className="mt-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold"
                >
                  Sign In
                </Button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-ink-300 dark:text-ink-400">
              Not a platform administrator?{' '}
              <Link
                to="/login"
                className="font-semibold text-brand-400 underline-offset-4 hover:underline"
              >
                Sign in to Attendee / Organizer portal
              </Link>
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-6 text-center text-xs text-white/60 dark:text-ink-500">
          <p>© {new Date().getFullYear()} Eventspady Ghana. All rights reserved.</p>
        </footer>
      </div>
    </>
  )
}
