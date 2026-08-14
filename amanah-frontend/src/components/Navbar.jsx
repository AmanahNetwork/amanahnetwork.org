import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../amanahlogo.png'; 

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/register", label: "Register" },
    { to: "/council", label: "Council" },
    { to: "/associates", label: "Associates" },
    { to: "/contact", label: "Contact" },
    { to: "/vision", label: "Vision" },
    { to: "/donate", label: "Donate Portal" },
    { to: "/timeline", label: "Achievements" },
    { to: "/terms", label: "Terms" }
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="relative bg-white border-b border-gray-100 h-24 z-50 flex items-center w-full">
      <div className="w-full max-w-1400px mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between h-full">
        
        {/* LEFT: Logo & Name */}
        <Link to="/" className="flex items-center gap-3 h-full shrink-0">
          <img src={logo} alt="Amanah Network" className="h-16 w-auto py-2 object-contain" />
          <div className="flex flex-col justify-center">
            <span className="text-xl font-black uppercase leading-none text-[#284D3D]">Amanah</span>   
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.2em]">Network</span>      
          </div>
        </Link>

        {/* RIGHT: Desktop Links */}
        <div className="hidden md:flex gap-4 lg:gap-8 uppercase font-bold text-[10px] tracking-[0.2em] text-gray-800 items-center">
          {navLinks.map((link, index) => (
            <Link 
              key={index} 
              to={link.to} 
              className="hover:text-[#C5A059] transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-24 left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-4 uppercase font-bold text-xs shadow-2xl z-40">
          {navLinks.map((link, index) => (
            <Link 
              key={index} 
              to={link.to} 
              onClick={() => setIsOpen(false)} 
              className="border-b border-gray-50 pb-2 hover:text-[#C5A059]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}