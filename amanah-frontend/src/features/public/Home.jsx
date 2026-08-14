import { Link } from 'react-router-dom';
import logo from '../../amanahlogo.png';

const caseStudy1 = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600";
const caseStudy2 = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600";
const caseStudy3 = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600";
const post1 = "https://images.unsplash.com/photo-1587440871875-191322ee64b0?q=80&w=600";
export default function Home() {
  return (
    <div className="bg-white text-black font-sans">
      
      {/* SECTION 1: HERO */}
      <section className="py-32 px-6 md:px-12 lg:px-24">
        <h1 className="  text-[#284D3D] text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
          ELEVATING<br />
          <span className="text-[#C5A059]">TRANSPARENCY</span><br />
          GOVERNANCE.
        </h1>
        <p className="max-w-xl text-lg md:text-xl text-gray-600 mb-12 leading-relaxed">
          The Amanah Network utilizes blockchain technology to create a decentralised, 100% transparent educational sponsorship platform for underprivileged Muslim youth.
        </p>
        <Link to="/vision" className="inline-block px-10 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-all duration-300">
          Explore Vision & Mission
        </Link>
      </section>

      {/* SECTION 2: THE CONTEXT */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-gray-50">
       <strong> <span className="text-[#284D3D] font-mono text-xs uppercase tracking-[0.2em] mb-6 block">The Context</span></strong>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.95] mb-16">Bypassing<br />The Status Quo.</h2>
        <div className="grid md:grid-cols-2 gap-16 text-gray-700 text-lg">
          <p>Recognizing that partial aid is rarely enough to tackle generational poverty, we systematically dismantle the financial barriers and critical dropouts that deprive underprivileged youth, covering 100% of institutional tuition from Class 3rd – 8th.</p>
          <p>Traditional aid distribution often lacks accountability. We address this using a structured operational framework for donations, student verification, and impact tracking, ensuring donor confidence.</p>
        </div>
      </section>

      {/* SECTION 3: IMPACT AREAS */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.95]">Our<br />Impact Areas.</h2>
          <Link to="/Timeline" className="text-[#C5A059] font-bold uppercase tracking-widest border-b-2 border-[#C5A059] pb-1 hover:text-black hover:border-black transition-all">View All Programs →</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { img: caseStudy1, title: 'Tuition Sponsorship', desc: '100% complete sponsorship.' },
            { img: caseStudy2, title: 'Resource Provision', desc: 'Books, uniforms, and learning resources.' },
            { img: caseStudy3, title: 'Mentorship Access', desc: 'Guidance and career mapping.' },
            { img: post1, title: 'Digital Platform', desc: 'Impact management.' },
          ].map((item, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="aspect-square overflow-hidden mb-4 bg-gray-100">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p className="text-[#284D3D] text-[10px] uppercase font-bold tracking-widest mb-2">{item.desc}</p>
              <h3 className="text-xl font-bold uppercase tracking-tight">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: PRINCIPLE */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#0A0A0A] text-white">
        <p className="text-[#C5A059] font-mono text-sm uppercase tracking-widest mb-6">Our Principle:</p>
        <blockquote className="max-w-3xl text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.95] mb-12">
          "EDUCATE TO REVOLUTIONIZE."
        </blockquote>
        <Link to="/contact" className="inline-block px-8 py-3 border border-white text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          Get Involved
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="py-24 px-6 md:px-12 lg:px-24 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-sm uppercase tracking-widest font-bold">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="Amanah Network Logo" className="h-12 w-auto object-contain" />
              <h4 className="font-black uppercase tracking-widest leading-tight">
                <span className="text-[#284D3D]">Amanah</span><br />
                <span className="text-[#C5A059]">Network</span>
              </h4> 
            </div>
            <p className="text-gray-500 normal-case font-normal leading-relaxed">Dismantling barriers and critical dropouts that deprive underprivileged youth.</p>
          </div>
          <div>
            <h5 className="mb-6 text-gray-400">Governance</h5>
            <div className="flex flex-col gap-4">
             <Link to="/donate" className="hover:text-[#C5A059] transition">Donate Portal</Link>
              <Link to="/terms" className="hover:text-[#C5A059] transition">Audit Terms</Link>
              <Link to="/timeline" className="hover:text-[#C5A059] transition">Achievements</Link>
            </div>
          </div>
          <div>
            <h5 className="mb-6 text-gray-400">Resources</h5>
            <div className="flex flex-col gap-4">
              <Link to="/register" className="hover:text-[#C5A059] transition">Register</Link>
              <Link to="/contact" className="hover:text-[#C5A059] transition">Contact</Link>
            </div>
          </div>
          <div>
            <h5 className="mb-6 text-gray-400">About</h5>
            <Link to="/vision" className="hover:text-[#C5A059] transition">Our Vision</Link>
            <div className="mt-4"></div>
            <Link to="/council" className="hover:text-[#C5A059] transition">Council</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
           /*   <Link to="/request-aid" className="hover:text-[#C5A059] transition">Request Aid</Link> */
