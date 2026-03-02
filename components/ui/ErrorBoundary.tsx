'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="card border-red-200 bg-red-50 text-center py-8 px-4">
          <div className="text-3xl mb-3">😕</div>
          <p className="font-semibold text-gray-800 text-sm">Something went wrong</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">The AI feature had an issue. Try refreshing.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-secondary text-sm py-2 px-4"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
