import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const S = {
  page:     { minHeight: '100vh', background: '#020f18', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
  card:     { background: '#051e2e', border: '1px solid #0e3347', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '2rem', textAlign: 'center' },
  iconWrap: { width: '52px', height: '52px', borderRadius: '14px', background: '#2d0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' },
  logo:     { fontSize: '20px', fontWeight: 700, color: '#00c8b4', marginBottom: '1.5rem', letterSpacing: '-0.5px' },
  heading:  { fontSize: '20px', fontWeight: 600, color: '#e0f5f2', margin: '0 0 0.75rem' },
  subtext:  { fontSize: '13px', color: '#3a7080', lineHeight: 1.6, margin: '0 0 1.5rem' },
  errBox:   { background: '#071520', border: '1px solid #2d0a0a', borderRadius: '8px', padding: '10px 14px', marginBottom: '1.5rem', textAlign: 'left', overflow: 'auto' },
  errText:  { fontSize: '11px', color: '#f87171', fontFamily: 'monospace', margin: 0, wordBreak: 'break-word' },
  actions:  { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  primary:  { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#00c8b4', border: 'none', color: '#020f18', fontSize: '13px', fontWeight: 600, padding: '10px 22px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit' },
  secondary:{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1.5px solid #1e4a5a', color: '#c0e8e4', fontSize: '13px', fontWeight: 500, padding: '9px 22px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' },
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={S.page}>
          <div style={S.card}>
            <div style={S.logo}>CollabFlow</div>
            <div style={S.iconWrap}>
              <AlertTriangle size={24} color="#f87171" />
            </div>
            <h1 style={S.heading}>Something went wrong</h1>
            <p style={S.subtext}>
              An unexpected error occurred. Try reloading the page, or return to the home page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div style={S.errBox}>
                <pre style={S.errText}>{this.state.error.message}</pre>
              </div>
            )}
            <div style={S.actions}>
              <button type="button" onClick={this.handleReload} style={S.primary}>
                <RefreshCw size={16} />
                Reload page
              </button>
              <a href="/" style={S.secondary}>
                <Home size={16} />
                Go home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
