import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'amanah_cookie_consent';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    functional: false
  });

  useEffect(() => {
    // Check existing consent
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay for smooth entrance
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.analytics === 'boolean') {
          setPreferences({
            essential: true,
            analytics: parsed.analytics,
            functional: parsed.functional ?? false
          });
        }
      } catch {
        setShowBanner(true);
      }
    }

    // Global listener to re-open settings from footer or policy pages
    const handleOpenSettings = () => {
      setShowModal(true);
      setShowBanner(false);
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
  }, []);

  const saveConsent = (prefs) => {
    const data = {
      ...prefs,
      essential: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setPreferences(prefs);
    setShowBanner(false);
    setShowModal(false);

    window.dispatchEvent(new CustomEvent('amanah-consent-updated', { detail: data }));
  };

  const handleAcceptAll = () => {
    saveConsent({ essential: true, analytics: true, functional: true });
  };

  const handleRejectNonEssential = () => {
    saveConsent({ essential: true, analytics: false, functional: false });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Banner */}
      {showBanner && !showModal && (
        <aside
          role="region"
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 lg:max-w-4xl lg:left-auto lg:right-8 z-50 animate-fade-in"
        >
          <div className="bg-[#1e382d] text-white p-6 md:p-7 rounded-2xl shadow-2xl border border-[#C5A059]/40 backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#C5A059]"></span>
                  <h3 className="text-base font-bold tracking-wide uppercase text-[#C5A059] font-mono">
                    Privacy & Cookie Preferences
                  </h3>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">
                  We use strictly necessary cookies to ensure secure authentication, session resilience, and fraud prevention. With your consent, we also use non-essential analytics cookies to evaluate aid impact and optimize platform security.
                </p>
                <div className="pt-1">
                  <Link
                    to="/privacy"
                    className="text-xs font-semibold text-[#C5A059] hover:underline underline-offset-4 tracking-wide"
                  >
                    Read our full Privacy Policy →
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#C5A059] hover:bg-[#b08e4d] text-black rounded-lg transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#1e382d]"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-black/40 hover:bg-black/60 text-white rounded-lg border border-gray-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBanner(false);
                    setShowModal(true);
                  }}
                  className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-300 hover:text-white underline underline-offset-4 focus:outline-none"
                >
                  Customize
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Preferences Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white text-gray-900 rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
              <div>
                <span className="text-[#284D3D] font-mono tracking-widest text-xs font-bold uppercase">
                  Amanah Network Governance
                </span>
                <h2 id="cookie-modal-title" className="text-2xl font-black uppercase text-gray-900">
                  Cookie Settings
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 text-xl font-bold rounded-lg focus:outline-none"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Manage your cookie preferences. Essential cookies are required for fundamental governance, security, and administrative features and cannot be deactivated.
            </p>

            <div className="space-y-4 divide-y divide-gray-100">
              {/* Essential Cookies */}
              <div className="pt-3 first:pt-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                      1. Strictly Necessary Cookies
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Required for session verification, CSRF defense, and secure cryptographic ledger access.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#284D3D]/10 text-[#284D3D] px-3 py-1 rounded-full shrink-0">
                    Always Active
                  </span>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                      2. Analytics & Performance
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Helps us understand platform usage to optimize aid verification and donor experiences.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#284D3D]"></div>
                  </label>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                      3. Functional & UI Preferences
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Retains accessibility choices and UI state across platform interactions.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, functional: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#284D3D]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Reject All Non-Essential
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-6 py-2 text-xs font-bold uppercase tracking-wider bg-[#284D3D] hover:bg-[#1e382d] text-white rounded-lg transition-colors shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
