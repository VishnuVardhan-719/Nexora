import { Component } from 'react';

/**
 * ErrorBoundary — CO2 / CO4
 * Class-based React Error Boundary that catches exceptions in the component
 * tree below it. Shows a premium dark-themed fallback UI with retry action.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // In production you'd send to an error reporting service here
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error } = this.state;
    const { fallbackLabel = 'component' } = this.props;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
        background: 'rgba(239,68,68,0.04)',
        border: '1px solid rgba(239,68,68,0.18)',
        borderRadius: 16,
        margin: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, fontSize: 22, color: '#f87171',
        }}>
          <i className="fas fa-exclamation-triangle" />
        </div>
        <h3 style={{ margin: '0 0 8px', color: '#f1f5f9', fontSize: '1rem', fontWeight: 700 }}>
          Something went wrong
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.83rem', marginBottom: 8, maxWidth: 320 }}>
          The <strong style={{ color: '#94a3b8' }}>{fallbackLabel}</strong> encountered an unexpected error and couldn't load.
        </p>
        {error?.message && (
          <code style={{
            display: 'block', padding: '8px 14px', marginBottom: 20,
            background: 'rgba(0,0,0,0.3)', borderRadius: 8,
            fontSize: '0.75rem', color: '#f87171',
            maxWidth: 380, wordBreak: 'break-word',
          }}>
            {error.message}
          </code>
        )}
        <button
          onClick={this.handleReset}
          style={{
            padding: '9px 22px', borderRadius: 9,
            background: 'linear-gradient(135deg,#4f8ef7,#7c3aed)',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.85rem',
            transition: 'opacity .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <i className="fas fa-redo" style={{ marginRight: 7 }} />
          Try Again
        </button>
      </div>
    );
  }
}
