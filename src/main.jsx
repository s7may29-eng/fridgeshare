import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {})
  if ('caches' in window) caches.keys().then(ks => ks.forEach(k => caches.delete(k))).catch(() => {})
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('App render error:', error, info) }
  hardReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const rs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(rs.map(r => r.unregister()))
      }
      if ('caches' in window) {
        const ks = await caches.keys()
        await Promise.all(ks.map(k => caches.delete(k)))
      }
    } catch (_) {}
    location.reload()
  }
  render() {
    if (!this.state.error) return this.props.children
    const dev = !import.meta.env.PROD
    return (
      <div style={{ minHeight: '100dvh', background: '#fafaf9', padding: 24, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: '#0a0a0a', letterSpacing: '-0.01em' }}>
        <div style={{ maxWidth: 480, margin: '40px auto', background: '#fff', borderRadius: 14, border: '1px solid #e7e5e4', padding: 24 }}>
          <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>エラーが発生しました</div>
          <div style={{ color: '#737373', fontSize: 13.5, marginBottom: 16, lineHeight: 1.55 }}>画面の読み込み中に問題が発生しました。下のボタンからキャッシュを削除して再読み込みしてください。</div>
          {dev && (
            <pre style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12, fontSize: 11, lineHeight: 1.5, overflow: 'auto', maxHeight: 240, color: '#991b1b', marginBottom: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
          <button onClick={this.hardReload} style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 20px', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>キャッシュを削除して再読み込み</button>
          <button onClick={() => this.setState({ error: null })} style={{ background: 'transparent', color: '#737373', border: '1px solid #e7e5e4', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: '100%', marginTop: 8, fontFamily: 'inherit' }}>そのまま続ける</button>
        </div>
      </div>
    )
  }
}

window.addEventListener('error', (e) => { console.error('window error:', e.error || e.message) })
window.addEventListener('unhandledrejection', (e) => { console.error('unhandled rejection:', e.reason) })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
