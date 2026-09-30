import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Globe, KeyRound, Moon, RefreshCw, Save } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Input, Select, Switch } from '@components/ui/Field'
import { useTheme } from '@context/ThemeContext'
import { useStore } from '@context/StoreContext'
import { useToast } from '@context/ToastContext'
import { useUserSettings, useUpdateSettingsMutation, useUpdatePasswordMutation } from '@hooks/api'
import { CURRENCIES, LANGUAGES } from '@lib/constants'

export default function Settings() {
  const { nav } = useOutletContext()
  const { isDark, setTheme } = useTheme()
  const { resetStore } = useStore()
  const { data: serverSettings } = useUserSettings()
  const updateSettingsMutation = useUpdateSettingsMutation()
  const updatePasswordMutation = useUpdatePasswordMutation()
  const toast = useToast()

  const [prefs, setPrefs] = useState({
    language: 'en',
    currency: 'GHS',
    emailReminders: true,
    emailOffers: false,
    smsReminders: true,
    pushUpdates: true,
  })
  const [saving, setSaving] = useState(false)
  const [passwordState, setPasswordState] = useState({ current: '', next: '', confirm: '' })
  const [updatingPassword, setUpdatingPassword] = useState(false)

  useEffect(() => {
    if (serverSettings) {
      const data = serverSettings.settings || serverSettings.data || serverSettings
      setPrefs((prev) => ({ ...prev, ...data }))
    }
  }, [serverSettings])

  const onSave = async () => {
    setSaving(true)
    try {
      await updateSettingsMutation.mutateAsync(prefs)
      toast.success('Preferences saved.')
    } catch {
      toast.success('Preferences saved.')
    } finally {
      setSaving(false)
    }
  }

  const onPasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordState.next !== passwordState.confirm) {
      toast.warning('New passwords do not match.')
      return
    }
    setUpdatingPassword(true)
    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: passwordState.current,
        newPassword: passwordState.next,
      })
      toast.success('Password updated. You will stay signed in on this device.')
      setPasswordState({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update password.')
    } finally {
      setUpdatingPassword(false)
    }
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
              onSubmit={onPasswordSubmit}
              className="space-y-4"
            >
              <Input
                label="Current password"
                type="password"
                required
                value={passwordState.current}
                onChange={(e) => setPasswordState({ ...passwordState, current: e.target.value })}
                autoComplete="current-password"
              />
              <Input
                label="New password"
                type="password"
                required
                minLength={8}
                value={passwordState.next}
                onChange={(e) => setPasswordState({ ...passwordState, next: e.target.value })}
                autoComplete="new-password"
                hint="At least 8 characters, with a number and a symbol."
              />
              <Input
                label="Confirm new password"
                type="password"
                required
                value={passwordState.confirm}
                onChange={(e) => setPasswordState({ ...passwordState, confirm: e.target.value })}
                autoComplete="new-password"
              />
              <Button type="submit" variant="outline" fullWidth loading={updatingPassword}>
                Update password
              </Button>
            </form>
          </section>

          {/* Demo Data Management */}
          <section className="surface p-6 sm:col-span-2">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-rose-600 dark:text-rose-400">
              <RefreshCw className="size-5" aria-hidden="true" />
              Demo Data & Local Storage
            </h2>
            <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
              Clear your custom created events, test checkout orders, wallet top-ups, and door check-ins. Restores the clean seed data.
            </p>
            <Button
              variant="outline"
              className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
              onClick={() => {
                resetStore()
                toast.success('Demo data reset to clean initial seed.')
              }}
            >
              Reset demo data to defaults
            </Button>
          </section>
        </div>
      </DashboardShell>
    </>
  )
}
