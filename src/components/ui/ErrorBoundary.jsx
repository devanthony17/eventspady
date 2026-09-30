import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@components/ui/Button'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-ink-950 dark:text-white">
            Something went wrong
          </h2>
          <p className="mt-2 max-w-md text-sm text-ink-500 dark:text-ink-400">
            We encountered an unexpected error while loading this page. You can try refreshing the page or head back to the events catalog.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              iconLeft={RefreshCw}
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
            >
              Reload page
            </Button>
            <Button to="/events" size="sm" iconLeft={Home}>
              Browse events
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
