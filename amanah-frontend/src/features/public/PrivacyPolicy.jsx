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
          At <strong>Amanah Network</strong>, we are committed to protecting the privacy, confidentiality, and security of our donors, volunteers, beneficiaries, and website visitors. This Privacy Policy details how we collect, use, safeguard, and manage your personal data when you access our website or engage with our programs.
        </p>
      </div>

      {/* Structured Sections */}
      <div className="space-y-12 text-gray-700">
        
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            1. Information We Collect
          </h2>
          <p className="leading-relaxed">
            We collect information that you voluntarily provide to us when making a donation, contacting our team, or submitting beneficiary applications. This may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-mono text-sm text-gray-600">
            <li>Personal Identifiers: Full Name, Email Address, Mobile Number, Mailing Address.</li>
            <li>Financial Data: Payment confirmation details processed securely via PCI-DSS compliant payment gateways (we do not store raw credit card or net banking credentials).</li>
            <li>Beneficiary & Sponsorship Metrics: Educational records and verification metrics submitted for aid disbursement.</li>
            <li>Technical Information: IP address, browser type, and interaction logs collected automatically for operational security.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            2. How We Use Your Information
          </h2>
          <p className="leading-relaxed">
            The data collected is utilized solely to advance our charitable objectives and maintain organizational transparency:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-mono text-sm text-gray-600">
            <li>Processing donations and issuing Section 80G tax-deductible donation receipts.</li>
            <li>Communicating updates regarding sponsorship programs, educational impact, and audit reports.</li>
            <li>Evaluating and processing educational funding allocation requests.</li>
            <li>Ensuring technical security and compliance with legal obligations under Indian law.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            3. Data Sharing & Confidentiality
          </h2>
          <p className="leading-relaxed">
            Amanah Network respects your privacy. We do not sell, rent, or trade your personal information to commercial third parties. Information may only be shared under the following conditions:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-mono text-sm text-gray-600">
            <li>With trusted third-party service providers (such as payment gateways and email services) strictly for transaction fulfillment.</li>
            <li>When required by statutory regulators, law enforcement agencies, or Indian court orders.</li>
            <li>To protect the legal rights, safety, and operational security of Amanah Network and its beneficiaries.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            4. Data Security & Protection
          </h2>
          <p className="leading-relaxed">
            We implement administrative, technical, and physical security measures to safeguard your personal data against unauthorized access, loss, or alteration. All electronic payment transactions are encrypted using Industry Standard Transport Layer Security (TLS/SSL).
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            5. Cookies & Tracking
          </h2>
          <p className="leading-relaxed">
            Our website uses essential session cookies to enable smooth site navigation, maintain secure session context, and improve user experience. You can choose to disable cookies through your browser settings, though certain functional features of the site may be affected.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            6. Your Rights
          </h2>
          <p className="leading-relaxed">
            You have the right to request access to the personal data we hold about you, request corrections to inaccurate records, or opt out of receiving non-transactional communications from us at any time.
          </p>
        </section>

        {/* Section 7 - Contact & Grievance */}
        <section className="space-y-4 bg-gray-50 border-2 border-black p-6 md:p-8 mt-12">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D]">
            7. Grievance Officer & Contact Information
          </h2>
          <p className="leading-relaxed">
            For any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our designated Grievance Officer:
          </p>
          <div className="font-mono text-sm space-y-2 text-gray-800">
            <p><strong>Organization:</strong> Amanah Network</p>
            <p><strong>Grievance Officer:</strong> Legal & Governance Cell</p>
            <p><strong>Email:</strong> contact@amanahnetwork.in</p>
            <p><strong>Phone:</strong> 7889381717</p>
            <p><strong>Address:</strong> Registered Entity, India</p>
          </div>
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
