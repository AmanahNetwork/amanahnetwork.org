import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    document.title = '404 - Record Not Located | Amanah Network';
  }, []);

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-white text-black font-sans py-16 md:py-24 px-6 md:px-12 lg:px-24 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full">
        {/* Formal Header Badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-block w-2.5 h-2.5 bg-[#C5A059] animate-pulse" />
          <span className="text-[#284D3D] font-mono tracking-[0.25em] uppercase text-xs font-bold">
            Protocol Notice
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-[#C5A059] font-mono tracking-[0.25em] uppercase text-xs font-bold">
            Error Code 404
          </span>
        </div>

        {/* Primary Typography */}
        <h1 className="text-6xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-6">
          <span className="text-[#284D3D] block">404</span>
          <span className="text-[#C5A059]">Unlocated.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-700 font-medium max-w-2xl leading-relaxed mb-10">
          The institutional document, ledger address, or directory path you requested does not exist within the Amanah Network registry.
        </p>

        {/* Formal Diagnostic Panel */}
        <div className="border-2 border-black p-6 md:p-8 bg-gray-50/70 mb-12 max-w-2xl shadow-[6px_6px_0px_0px_#284D3D]">
          <div className="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] font-bold text-gray-500">
              Diagnostic Log & System Metadata
            </span>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 font-mono text-[10px] font-bold uppercase tracking-wider">
              HTTP 404: Not Found
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs text-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-gray-500 uppercase tracking-wider">Attempted Target URI:</span>
              <span className="font-bold text-[#284D3D] break-all bg-white px-2 py-1 border border-gray-200">
                {location.pathname || '/unknown'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-gray-500 uppercase tracking-wider">Clearance Status:</span>
              <span className="font-semibold text-gray-700">UNRESOLVED ROUTE</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-gray-500 uppercase tracking-wider">System State:</span>
              <span className="text-gray-600">OPERATION HALTED // NO PAYLOAD DISPATCHED</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-16">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-[#284D3D] transition-all duration-300 shadow-md"
          >
            ← Return to Home Directory
          </Link>
          <Link
            to="/donate"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#C5A059] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#284D3D] transition-all duration-300 shadow-md"
          >
            Access Donate Portal →
          </Link>
          <Link
            to="/timeline"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-black text-black font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all duration-300"
          >
            Audit Transparency Ledger
          </Link>
        </div>

        {/* Official Directory Index */}
        <div className="pt-10 border-t border-gray-200">
          <span className="text-gray-400 font-mono tracking-[0.2em] uppercase text-[11px] font-bold block mb-6">
            Official Directory Index
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold uppercase tracking-wider">
            <Link
              to="/vision"
              className="p-4 border border-gray-200 hover:border-[#C5A059] hover:bg-amber-50/30 transition group flex flex-col justify-between"
            >
              <span className="text-gray-400 font-mono text-[10px] mb-2">DIR / 01</span>
              <span className="group-hover:text-[#C5A059] transition">Vision & Mission →</span>
            </Link>
            <Link
              to="/council"
              className="p-4 border border-gray-200 hover:border-[#C5A059] hover:bg-amber-50/30 transition group flex flex-col justify-between"
            >
              <span className="text-gray-400 font-mono text-[10px] mb-2">DIR / 02</span>
              <span className="group-hover:text-[#C5A059] transition">Governance Council →</span>
            </Link>
            <Link
              to="/associates"
              className="p-4 border border-gray-200 hover:border-[#C5A059] hover:bg-amber-50/30 transition group flex flex-col justify-between"
            >
              <span className="text-gray-400 font-mono text-[10px] mb-2">DIR / 03</span>
              <span className="group-hover:text-[#C5A059] transition">Institutional Associates →</span>
            </Link>
            <Link
              to="/contact"
              className="p-4 border border-gray-200 hover:border-[#C5A059] hover:bg-amber-50/30 transition group flex flex-col justify-between"
            >
              <span className="text-gray-400 font-mono text-[10px] mb-2">DIR / 04</span>
              <span className="group-hover:text-[#C5A059] transition">Direct Inquiries →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Formal Footer Disclaimer */}
      <footer className="max-w-4xl mx-auto w-full pt-12 mt-12 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[11px] font-mono text-gray-400 uppercase tracking-widest">
        <span>Amanah Network Governance & Verification System</span>
        <span>Secured Architecture</span>
      </footer>
    </div>
  );
}
