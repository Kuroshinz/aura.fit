'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // We import locally to avoid issues during initial load
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.from('system_errors').insert([{
        error_message: error.message,
        error_stack: info.componentStack,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'Server'
      }]).then(() => {
        // Trigger Webhook alert
        fetch('/api/report-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: error.message, stack: info.componentStack })
        }).catch(err => console.error("Failed to report error via API", err))
      })
    }).catch(err => console.error(err))
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-extrabold text-amber-400 mb-2">Đã xảy ra lỗi!</h2>
            <p className="text-slate-400 font-mono text-sm mb-6 max-w-md text-center">
              {this.state.error?.message || 'Đã có lỗi không xác định xảy ra khi tải trang này.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-6 py-3 aura-glass border-amber-400/50 text-amber-300 font-bold rounded-2xl text-xs uppercase tracking-wider hover:bg-amber-400/10 transition-all"
            >
              Thử lại
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
