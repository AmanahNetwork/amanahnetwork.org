import { Link } from 'react-router-dom';

export default function Timeline() {
  return (
    <div className="py-24 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto font-sans text-gray-800 leading-relaxed min-h-[75vh]">
      {/* Header */}
      <header className="mb-16 pb-8 border-b-2 border-black">
        <div className="mb-4">
          <span className="text-[#284D3D] font-mono tracking-[0.2em] uppercase text-xs font-bold">Organizational Milestones</span>
          <span className="text-[#C5A059] font-mono tracking-[0.2em] uppercase text-xs font-bold ml-2">/ Achievements</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
          <span className="text-[#284D3D]">Achievements &</span> <span className="text-[#C5A059]">Milestones</span>
        </h1>
        <p className="text-sm font-mono uppercase tracking-widest text-gray-500">
          Documenting the historical progress and foundational declarations of Amanah Network.
        </p>
      </header>

      {/* Timeline Event Card */}
      <div className="space-y-12">
        <div className="bg-gray-50 border-2 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
            <span className="bg-[#284D3D] text-white px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest">
              10th April 2026
            </span>
            <span className="text-[#C5A059] font-mono text-xs font-bold uppercase tracking-widest">
              Founding Declaration
            </span>
          </div>

          <h2 className="text-2xl font-black uppercase tracking-tight text-[#284D3D] mb-6">
            Formal Establishment & Founding Covenant
          </h2>

          <p className="text-base md:text-lg text-gray-800 leading-relaxed">
            On the date of founding, 10th April 2026, the members of Amanah Network — Hozaifa Iqbal, Azmat Parimoo, Rehan Ahmad, Irfan Alam, Shadab Alam, and Shahbaz Alam — convened and formally established the initiative with a sincere intention to serve for the sake of Allah, drawing inspiration from Surah As-Saff (61:9). Grounded in the principle of Amanah: trust, responsibility, and accountability; the founding body unanimously affirmed its commitment to serve with integrity, sincerity, and discipline, and to work toward structured, long-term impact guided by the values and principles set forth in this founding declaration.
          </p>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="mt-20 pt-8 border-t border-gray-200 flex flex-wrap justify-between items-center text-xs uppercase font-bold tracking-widest gap-4">
        <Link to="/vision" className="text-[#C5A059] hover:text-black transition-colors">
          Explore Vision & Mission
        </Link>
        <Link to="/" className="text-[#284D3D] hover:text-black transition-colors">
          Back to Home
        </Link>
      </footer>
    </div>
  );
}