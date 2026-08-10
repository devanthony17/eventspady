import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Globe, KeyRound, Moon, Save } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Input, Select, Switch } from '@components/ui/Field'
import { useTheme } from '@context/ThemeContext'
import { useToast } from '@context/ToastContext'
import { CURRENCIES, LANGUAGES } from '@lib/constants'

export default function Settings() {
  const { nav } = useOutletContext()
  const { isDark, setTheme } = useTheme()
  const toast = useToast()

  const [prefs, setPrefs] = useState({
    language: 'en',
    currency: 'USD',
    emailReminders: true,
    emailOffers: false,
    smsReminders: true,
    pushUpdates: true,
  })
  const [saving, setSaving] = useState(false)

  const onSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast.success('Preferences saved.')
  }

  return (
    <>
      <Seo title="Settings" noIndex />

      <DashboardShell
        nav={nav}
        title="Settings"
        description="Language, currency, notifications and security."
        actions={
          <Button size="sm" loading={saving} onClick={onSave} iconLeft={Save}>
            Save
          </Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Preferences */}
          <section className="surface p-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
              <Globe className="size-5 text-brand-500" aria-hidden="true" />
              Regional
            </h2>

            <div className="space-y-4">
              <Select
                label="Language"
                value={prefs.language}
                onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
                hint="Applies to the website, your tickets and emails."
              >
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.flag} {language.label}
                  </option>
                ))}
              </Select>

              <Select
                label="Display currency"
                value={prefs.currency}
                onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
                hint="Prices are converted for display; you are charged in the event's currency."
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </option>
                ))}
              </Select>
            </div>
          </section>

          {/* Appearance */}
          <section className="surface p-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
              <Moon className="size-5 text-brand-500" aria-hidden="true" />
              Appearance
            </h2>

            <Switch
              checked={isDark}
              onChange={(next) => setTheme(next ? 'dark' : 'light')}
              label="Dark mode"
              description="Follows your system setting until you choose here."
            />
          </section>

          {/* Notifications */}
          <section className="surface p-6">
            <h2 className="mb-5 text-lg font-bold">Notifications</h2>

            <div className="space-y-5">
              {[
                { key: 'emailReminders', label: 'Event reminders by email', description: 'A nudge 24 hours before doors open.' },
                { key: 'emailOffers', label: 'Offers and coupons', description: 'Occasional discounts from organizers you follow.' },
                { key: 'smsReminders', label: 'SMS reminders', description: 'Only for events happening within 24 hours.' },
                { key: 'pushUpdates', label: 'Push notifications', description: 'Schedule changes and cancellations.' },
              ].map((item) => (
                <Switch
                  key={item.key}
                  checked={prefs[item.key]}
                  onChange={(next) => setPrefs({ ...prefs, [item.key]: next })}
                  label={item.label}
                  description={item.description}
                />
              ))}
            </div>
          </section>

          {/* Security */}
          <section className="surface p-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
              <KeyRound className="size-5 text-brand-500" aria-hidden="true" />
              Password
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                toast.success('Password updated. You will stay signed in on this device.')
                e.target.reset()
              }}
              className="space-y-4"
            >
              <Input label="Current password" type="password" required autoComplete="current-password" />
              <Input
                label="New password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                hint="At least 8 characters, with a number and a symbol."
              />
              <Input label="Confirm new password" type="password" required autoComplete="new-password" />
              <Button type="submit" variant="outline" fullWidth>
                Update password
              </Button>
            </form>
          </section>
        </div>
      </DashboardShell>
    </>
  )
}
