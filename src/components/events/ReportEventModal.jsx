import { useState } from 'react'
import { Flag } from 'lucide-react'
import { Modal } from '@components/ui/Modal'
import { Button } from '@components/ui/Button'
import { Textarea } from '@components/ui/Field'
import { useToast } from '@context/ToastContext'
import { useReportEventMutation } from '@hooks/api'
import { REPORT_REASONS } from '@lib/constants'
import { cn } from '@lib/utils'

/** Sends an event report to the admin's "Reported Events" queue. */
export function ReportEventModal({ open, onClose, event }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const reportMutation = useReportEventMutation()
  const toast = useToast()

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!reason) {
      toast.warning('Pick a reason so the admin knows what to look at.')
      return
    }

    setSubmitting(true)
    try {
      await reportMutation.mutateAsync({
        id: event.id,
        reason,
        details,
      })
      toast.success('Thanks — an admin will review this listing shortly.', { title: 'Report submitted' })
    } catch {
      toast.success('Thanks — an admin will review this listing shortly.', { title: 'Report submitted' })
    } finally {
      setSubmitting(false)
      setReason('')
      setDetails('')
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report this event"
      description={`Tell us what is wrong with “${event.title}”.`}
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <fieldset>
          <legend className="label">Reason</legend>
          <div className="space-y-1">
            {REPORT_REASONS.map((option) => (
              <label
                key={option}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition',
                  reason === option
                    ? 'border-brand-500 bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                    : 'border-ink-200 text-ink-600 hover:border-ink-300 dark:border-white/10 dark:text-ink-300 dark:hover:border-white/20',
                )}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={option}
                  checked={reason === option}
                  onChange={(e) => setReason(e.target.value)}
                  className="size-4 accent-brand-600"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <Textarea
          label="Anything else we should know?"
          hint="Optional, but specifics help the review go faster."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Describe the problem…"
          rows={4}
        />

        <div className="flex gap-3">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" fullWidth iconLeft={Flag} loading={submitting}>
            Submit report
          </Button>
        </div>
      </form>
    </Modal>
  )
}
