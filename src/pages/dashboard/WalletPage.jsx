import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, Plus, Wallet } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { Input } from '@components/ui/Field'
import { Badge } from '@components/ui/Badge'
import { useAuth } from '@context/AuthContext'
import { useToast } from '@context/ToastContext'
import { walletTransactions } from '@data/account'
import { PAYMENT_METHODS } from '@lib/constants'
import { cn, formatCurrency, formatDate } from '@lib/utils'

const QUICK_AMOUNTS = [25, 50, 100, 250]

export default function WalletPage() {
  const { nav } = useOutletContext()
  const { user, updateProfile } = useAuth()
  const toast = useToast()

  const [topUpOpen, setTopUpOpen] = useState(false)
  const [amount, setAmount] = useState('50')
  const [method, setMethod] = useState('stripe')
  const [loading, setLoading] = useState(false)

  const balance = user?.walletBalance ?? 0
  const credited = walletTransactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const spent = walletTransactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0)

  const onTopUp = async (e) => {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) {
      toast.warning('Enter an amount greater than zero.')
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    updateProfile({ walletBalance: Math.round((balance + value) * 100) / 100 })
    setLoading(false)
    setTopUpOpen(false)
    toast.success(`${formatCurrency(value)} added to your wallet.`)
  }

  return (
    <>
      <Seo title="Wallet" noIndex />

      <DashboardShell
        nav={nav}
        title="Wallet"
        description="Your stored balance, top-ups and refunds. Spend it on any booking."
        actions={
          <Button size="sm" iconLeft={Plus} onClick={() => setTopUpOpen(true)}>
            Top up
          </Button>
        }
      >
        {/* Balance card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-ink-950 p-7 text-white sm:p-9">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-white/70">
                <Wallet className="size-4" aria-hidden="true" />
                Available balance
              </p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">{formatCurrency(balance)}</p>
              <p className="mt-2 text-sm text-white/60">Usable on any event, alongside any other method.</p>
            </div>

            <dl className="grid grid-cols-2 gap-6 text-right sm:text-left">
              <div>
                <dd className="text-xl font-extrabold">{formatCurrency(credited)}</dd>
                <dt className="text-xs text-white/55">Total credited</dt>
              </div>
              <div>
                <dd className="text-xl font-extrabold">{formatCurrency(spent)}</dd>
                <dt className="text-xs text-white/55">Total spent</dt>
              </div>
            </dl>
          </div>
        </div>

        {/* Transactions */}
        <section className="surface mt-6 overflow-hidden">
          <header className="flex items-center justify-between border-b border-ink-200/70 p-5 dark:border-white/10">
            <h2 className="text-lg font-bold">Transactions</h2>
            <Badge tone="neutral" size="sm">
              {walletTransactions.length} entries
            </Badge>
          </header>

          <ul className="divide-y divide-ink-200/70 dark:divide-white/10">
            {walletTransactions.map((transaction) => {
              const isCredit = transaction.type === 'credit'
              const Icon = isCredit ? ArrowDownLeft : ArrowUpRight

              return (
                <li key={transaction.id} className="flex items-center gap-4 p-5">
                  <span
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-xl',
                      isCredit
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                        : 'bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-300',
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{transaction.label}</p>
                    <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
                      {formatDate(transaction.at, { month: 'long' })}
                    </p>
                  </div>

                  <span
                    className={cn(
                      'shrink-0 text-sm font-extrabold',
                      isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-900 dark:text-white',
                    )}
                  >
                    {isCredit ? '+' : '−'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </DashboardShell>

      {/* Top-up dialog */}
      <Modal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        title="Top up your wallet"
        description="Funds are available immediately after payment."
      >
        <form onSubmit={onTopUp} className="space-y-5">
          <div>
            <p className="label">Choose an amount</p>
            <div className="mb-3 grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(String(value))}
                  className={cn(
                    'rounded-xl border py-2.5 text-sm font-bold transition',
                    Number(amount) === value
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                      : 'border-ink-200 text-ink-600 hover:border-ink-300 dark:border-white/10 dark:text-ink-300',
                  )}
                >
                  ${value}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min="1"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Custom amount"
              aria-label="Custom top-up amount"
            />
          </div>

          <div>
            <p className="label">Pay with</p>
            <div className="space-y-2">
              {PAYMENT_METHODS.filter((m) => m.mode === 'online' && m.id !== 'wallet').map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition',
                    method === option.id
                      ? 'border-brand-600 bg-brand-50 font-semibold dark:border-brand-500 dark:bg-brand-500/10'
                      : 'border-ink-200 hover:border-ink-300 dark:border-white/10',
                  )}
                >
                  <input
                    type="radio"
                    name="topup-method"
                    checked={method === option.id}
                    onChange={() => setMethod(option.id)}
                    className="size-4 accent-brand-600"
                  />
                  <span className="flex-1">{option.label}</span>
                  <span className="text-xs text-ink-400">{option.blurb}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" fullWidth onClick={() => setTopUpOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={loading}>
              Add {formatCurrency(Number(amount) || 0)}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
