import { Link } from 'react-router-dom';

export default function Vision() {
  return (
    <div className="min-h-screen bg-white text-black font-sans py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl">

        {/* Header: Professional Typography */}
        <header className="mb-24">
          <span className="text-[#C5A059] font-mono tracking-[0.2em] uppercase text-xs mb-6 block">Our Purpose</span>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-10">
            Vision &<br /> Mission.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
            Dismantling barriers to education for underprivileged youth through a transparent, 100% sponsorship model.
          </p>
        </header>

        {/* Mission Statement: High Contrast */}
        <section className="mb-24">
          <h2 className="text-[#284D3D] font-mono text-xs uppercase tracking-[0.2em] mb-8 font-bold">Our Mission</h2>
          {/* Standardized Text Size: lg:xl */}
          <div className="space-y-10 text-lg md:text-xl text-gray-800 leading-relaxed">

            <p>
              Our organizational vision draws its inspiration from timeless calls for truth and justice found across our cultural and civilizational heritage — including the guidance echoed in Surah As-Saff (61:9). We believe that true communal honor, resilience, and progress are only possible when a society is intellectually illuminated and ethically grounded. Moving beyond basic literacy, we are committed to cultivating a vanguard of exceptional young minds. Our goal is to empower these youth to master modern academic, scientific, legal, and governance frameworks — shaping them into principled leaders who act with integrity, champion justice, and contribute meaningfully to national progress and global civilization.
            </p>
          </div>
        </section>

        {/* Strategic Framework: Bold Grid */}
        <section>
          <h2 className="text-[#284D3D] font-mono text-xs uppercase tracking-[0.2em] mb-16 font-bold">Our Vision</h2>

          <div className="grid md:grid-cols-1 gap-16">
            <div className="space-y-8">
              {/* Standardized Text Size: lg:xl */}
              <ul className="space-y-8 text-lg md:text-xl text-gray-700">
                <li className="flex items-start">
                  <span className="mr-4 text-[#C5A059] font-black text-xl">•</span>
                  To bridge the gap between our sublime vision and the harsh ground realities highlighted in national data, the Amanah Network is on a mission to systematically dismantle the financial barriers and critical dropouts that deprives the underprivileged youth.
                </li>
                <li className="flex items-start">
                  <span className="mr-4 text-[#C5A059] font-black text-xl">•</span>
                  Recognizing that partial aid is rarely enough to tackle generational poverty, we provide a complete, 100% sponsorship model that entirely eliminates financial constraints.
                </li>
                <li className="flex items-start">
                  <span className="mr-4 text-[#C5A059] font-black text-xl">•</span>
                  Our mission covers 100% of institutional tuition, all the way from (Class 3rd – 8th).
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Back to Home Action */}
        <footer className="mt-32 pt-12 border-t border-gray-100">
          <Link to="/" className="text-[#C5A059] font-bold uppercase tracking-[0.2em] hover:text-[#284D3D] transition-colors">
            Back to Home
          </Link>
        </footer>

      </div>
    </div>
  );
}