import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { AuthShell } from '@components/auth/AuthShell'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Field'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setSent(true)
  }

  return (
    <>
      <Seo title="Reset your password" noIndex />

      <AuthShell
        title={sent ? 'Check your inbox' : 'Reset your password'}
        subtitle={
          sent
            ? `If an account exists for ${email}, a reset link is on its way.`
            : 'Enter the email address on your account and we will send you a reset link over SMTP.'
        }
        footer={
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-brand-600 underline-offset-4 hover:underline dark:text-brand-400"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sign in
          </Link>
        }
      >
        {sent ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <CheckCircle2 className="mx-auto mb-3 size-10 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Reset link sent</p>
            <p className="mt-2 text-sm text-emerald-800/80 dark:text-emerald-300/80">
              The link expires in 60 minutes. Check your spam folder if it has not arrived within a few minutes.
            </p>
            <Button variant="ghost" size="sm" className="mt-4" onClick={() => setSent(false)}>
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              required
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Button type="submit" fullWidth size="lg" loading={loading} iconLeft={Send}>
              Send reset link
            </Button>
          </form>
        )}
      </AuthShell>
    </>
  )
}
