import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 text-center dark:bg-surface-dark">
          <div className="card max-w-lg space-y-4 p-6">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-sm text-ink-500 dark:text-ink-300">
              The app hit an unexpected error while rendering. Reload the page, and if it keeps happening, check the
              browser console for the first stack trace.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

