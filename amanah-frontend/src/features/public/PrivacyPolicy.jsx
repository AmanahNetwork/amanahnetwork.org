import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="py-24 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto font-sans text-gray-800 leading-relaxed">
      {/* Header */}
      <header className="mb-16 pb-8 border-b-2 border-black">
        <div className="mb-4">
          <span className="text-[#284D3D] font-mono tracking-[0.2em] uppercase text-xs font-bold">Legal & Governance</span>
          <span className="text-[#C5A059] font-mono tracking-[0.2em] uppercase text-xs font-bold ml-2">/ Policy</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
          <span className="text-[#284D3D]">Privacy</span> <span className="text-[#C5A059]">Policy</span>
        </h1>
        <p className="text-sm font-mono uppercase tracking-widest text-gray-500">
          Last Updated: August 25, 2026 | Version 1.0
        </p>
      </header>

      {/* Intro Box */}
      <div className="bg-gray-50 border-l-4 border-[#284D3D] p-6 md:p-8 mb-12">
        <p className="text-base text-gray-700 leading-relaxed">
          At <strong>Amanah Network</strong>, we are deeply committed to safeguarding the privacy, confidentiality, and data security of our donors, volunteers, beneficiaries, and website visitors. This Privacy Policy details how we collect, handle, protect, and process your personal information when you access our platform or participate in our charitable initiatives.
        </p>
      </div>

      {/* Structured Sections in Full Sentences */}
      <div className="space-y-12 text-gray-700">
        
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            1. Information We Collect
          </h2>
          <p className="leading-relaxed">
            We collect personal information that you voluntarily provide to us when making a donation, contacting our support team, or submitting beneficiary applications. This includes personal identifiers such as your full name, email address, mobile number, and physical mailing address. For financial contributions, payment transactions are handled securely through PCI-DSS compliant payment gateways, ensuring that we never store raw credit card or net banking credentials. In addition, we record beneficiary educational metrics submitted for aid disbursement as well as standard interaction metrics (including IP addresses and browser types) collected automatically for operational security.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            2. How We Use Your Information
          </h2>
          <p className="leading-relaxed">
            All data collected is utilized strictly to advance our charitable objectives and uphold organizational transparency. Specifically, we use your information to process donations, issue Section 80G tax-deductible receipts, communicate updates regarding sponsorship progress and audit reports, evaluate educational funding requests, and maintain platform security while complying with applicable statutory requirements under Indian law.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            3. Data Sharing & Confidentiality
          </h2>
          <p className="leading-relaxed">
            Amanah Network holds your privacy in high regard, and we never sell, rent, or trade your personal information to commercial entities. We share information only with trusted third-party service providers (such as payment processors and email platforms) strictly necessary for transaction fulfillment, when mandated by statutory authorities or court orders, or to protect the legal rights, safety, and security of Amanah Network and its community.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            4. Data Security & Protection
          </h2>
          <p className="leading-relaxed">
            We employ administrative, technical, and physical safeguards designed to protect your personal data against unauthorized access, loss, or alteration. All electronic payment interactions are transmitted over industry-standard Transport Layer Security (TLS/SSL) encrypted protocols.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            5. Cookies & Tracking
          </h2>
          <p className="leading-relaxed">
            Our website uses essential session cookies to facilitate smooth navigation, preserve secure authentication state, and enhance user experience. You can choose to disable cookies via your browser settings, though doing so may limit functionality in certain areas of the site.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            6. Your Rights
          </h2>
          <p className="leading-relaxed">
            You retain the right to request access to the personal data we hold about you, request corrections to inaccurate or incomplete records, or opt out of receiving non-essential organizational communications at any time.
          </p>
        </section>

        {/* Section 7 - Contact & Grievance */}
        <section className="space-y-4 bg-gray-50 border-2 border-black p-6 md:p-8 mt-12">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D]">
            7. Grievance Officer & Contact Information
          </h2>
          <p className="leading-relaxed">
            For any inquiries, concerns, or data access requests regarding this Privacy Policy, please contact our designated Grievance Officer (Legal & Governance Cell, Amanah Network) via email at contact@amanahnetwork.in, phone at 7889381717, or mail at our Registered Entity in India. We aim to acknowledge all privacy inquiries within 3 business days and resolve them within 7 business days of receipt.
          </p>
        </section>

      </div>

      {/* Navigation Footer */}
      <div className="mt-16 pt-8 border-t border-gray-200 flex flex-wrap justify-between items-center text-xs uppercase font-bold tracking-widest gap-4">
        <Link to="/terms" className="text-[#C5A059] hover:text-black transition-colors">
          View Terms & Conditions
        </Link>
        <Link to="/contact" className="text-[#284D3D] hover:text-black transition-colors">
          Contact Support
        </Link>
      </div>
    </div>
  );
}
