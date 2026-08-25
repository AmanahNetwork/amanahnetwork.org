import { Link } from 'react-router-dom';

export default function Associates() {
  return (
    <div className="py-24 px-6 md:px-12 lg:px-24 min-h-[70vh] flex flex-col justify-between max-w-5xl mx-auto font-sans text-gray-800">
      <div>
        {/* Header */}
        <header className="mb-16">
          <span className="text-[#C5A059] font-mono tracking-[0.2em] uppercase text-xs font-bold mb-4 block">Network</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
            <span className="text-[#284D3D]">Our</span> <span className="text-[#C5A059]">Associates</span>
          </h1>
        </header>

        {/* Content Box */}
        <div className="bg-gray-50 border-2 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-[#284D3D] font-mono text-xs font-bold uppercase tracking-[0.2em] block mb-4">Collaborations & Partnerships</span>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl">
            We are currently in the process of building our network of associates and partner organizations. This section will be updated as new collaborations are formalized.
          </p>
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
            <Link to="/contact" className="inline-block px-8 py-3 bg-[#284D3D] text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors">
              Partner With Us
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-center text-xs uppercase font-bold tracking-widest">
        <Link to="/" className="text-[#C5A059] hover:text-[#284D3D] transition-colors">
          Back to Home
        </Link>
      </footer>
    </div>
  );
}