/**
 * PingKu — Lightweight NOC & Server Telemetry Dashboard
 * Copyright (C) 2026 Arjuna Setya Ramadhani.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
 */

import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[PingKu UI Error]', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b0f] text-[#f3f7f8] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-[540px] bg-[#111921] border border-[#233039] rounded-[12px] p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#f29583]/15 border border-[#f29583]/30 flex items-center justify-center text-[#f29583] mx-auto mb-4 text-xl font-bold">
              !
            </div>
            <h1 className="text-[20px] font-bold text-[#f3f7f8] mb-2">Terjadi Gangguan Tampilan</h1>
            <p className="text-[14px] text-[#91a1ac] mb-6 leading-relaxed">
              Aplikasi mengalami kendala saat merender komponen. Coba muat ulang halaman.
            </p>
            {this.state.error && (
              <div className="bg-[#0b1015] border border-[#1f2c35] rounded-[8px] p-3 text-left font-mono text-[12px] text-[#f29583] overflow-auto max-h-[160px] mb-6">
                {this.state.error.toString()}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="bg-[#6ce5b1] hover:bg-[#5ce4bd] text-[#070b0f] font-semibold text-[14px] px-6 py-2.5 rounded-[8px] transition cursor-pointer shadow-md"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
