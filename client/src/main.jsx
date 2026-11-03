import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// If anything ever crashes while rendering, show a message instead of a blank page.
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error('CricketSaathi crashed:', error); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: '48px 24px', color: '#e6efe6', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <p style={{ opacity: 0.75 }}>{String(this.state.error?.message || this.state.error)}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 18px', borderRadius: 8, border: 0, cursor: 'pointer' }}>Reload</button>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
