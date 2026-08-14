import hozaifaImg from '../../assets/hozaifa.png'; // Adjust path based on your folder structure
import azmatImg from '../../assets/azmat.jpeg';
import irfanImg from '../../assets/irfan.png';
import shadabImg from '../../assets/shadab.jpeg';
import rehanImg from '../../assets/rehan.png';
import shahbazImg from '../../assets/shahbaz.jpg';
export default function Council() {
  const members = [
    {
      name: "Hozaifa Iqbal",
      role: "Founding Amir & CEO",
      image: hozaifaImg,
      objectPos: "object-[center_30%]",
      bio: "Oversees strategic direction, governance, and educational initiatives. Dedicated to creating a transparent, scalable platform for long-term community development."
    },
    {
      name: "Azmat Parimoo",
      role: "Chief Technology Officer (CTO) & Chief Financial Officer (CFO)​",
      image: azmatImg,
      objectPos: "object-[center_30%]",
      bio: "Architects the technological infrastructure and financial systems. Ensures rigorous digital scalability, contribution transparency, and operational integrity for all assets."
    },
    {
      name: "Md Irfan Alam",
      role: "Chief Operating Officer (COO)",
      image: irfanImg,
      objectPos: "object-[center_30%]",
      bio: "Leads operational strategy and organizational growth. Focused on fostering innovation, enhancing efficiency, and cultivating a high-impact collaborative environment."
    },
    {
      name: "Shadab Alam",
      role: "Head of Outreach",
      image: shadabImg,
      objectPos: "object-[center_30%]",
      bio: "Leads partnerships and stakeholder engagement. Works to expand organizational reach and strengthen awareness of our mission among students and institutions."
    },
    {
      name: "Rehan Ahmad",
      role: "Marketing & PR Head",
      image: rehanImg,
      objectPos: "object-[center_30%]",
      bio: "Directs communication and public relations efforts. Committed to strengthening organizational visibility, credibility, and meaningful community connection."
    },
    {
      name: "Shahbaz Alam",
      role: "Director of Compliance & Social Welfare",
      image: shahbazImg,
      objectPos: "object-center",
      bio: "Ensures ethical operational practices and rigorous governance. Upholds organizational discipline and manages welfare-oriented community support mechanisms."
    }
  ];

  return (
    <div className="py-24 px-6 md:px-12 lg:px-24">
      <header className="mb-16">
        <span className="text-[#284D3D] font-mono tracking-[0.2em] uppercase text-xs mb-4 block">Leadership</span>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
          <span className="text-[#284D3D]">Executive</span> 
          <span className="text-[#C5A059] ml-3">Council.</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((m, index) => (
          <div key={index} className="border-2 border-black p-6 group hover:border-[#284D3D] transition-colors duration-300">
            {/* Image Container */}
            <div className="w-full aspect-[3/4] mb-6 overflow-hidden border-b-2 border-black bg-gray-100">
              <img 
                src={m.image} 
                alt={m.name} 
                className={`w-full h-full object-cover ${m.objectPos}`}
              />
            </div>
            
            <h3 className="text-xl font-black uppercase tracking-tighter mb-1">{m.name}</h3>
            <p className="text-[#C5A059] font-bold text-xs uppercase tracking-widest mb-4">{m.role}</p>
            <p className="text-gray-600 text-sm leading-relaxed">{m.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}