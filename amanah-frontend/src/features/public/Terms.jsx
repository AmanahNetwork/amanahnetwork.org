import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="py-24 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto font-sans text-gray-800 leading-relaxed">
      {/* Page Header */}
      <header className="mb-16 pb-8 border-b-2 border-black">
        <div className="mb-4">
          <span className="text-[#284D3D] font-mono tracking-[0.2em] uppercase text-xs font-bold">Amanah Governance</span>
          <span className="text-[#C5A059] font-mono tracking-[0.2em] uppercase text-xs font-bold ml-2">/ Audit & Legal</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
          <span className="text-[#284D3D]">Terms &</span> <span className="text-[#C5A059]">Conditions</span>
        </h1>
        <p className="text-sm font-mono uppercase tracking-widest text-gray-500">
          Last Updated: August 25, 2026 | Document ID: AMN-TC-2026
        </p>
      </header>

      {/* Preamble / Welcome Box */}
      <div className="bg-gray-50 border-l-4 border-[#C5A059] p-6 md:p-8 mb-12 space-y-4">
        <p className="text-base text-gray-800 font-medium">
          Welcome to <strong>Amanah Network</strong>. We are a Section 8 Company registered under the Companies Act, 2013, incorporated with the objective of promoting charitable cause, support of economically disadvantaged and underprivileged individuals and communities.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          These Terms and Conditions ("Terms") govern your access to and use of our website located at{' '}
          <a href="https://amanahnetwork.in" target="_blank" rel="noopener noreferrer" className="text-[#284D3D] font-bold underline">
            amanahnetwork.in
          </a>
          , including any donations made, services availed, or content accessed through it. By accessing or using this Website, you agree to be bound by these Terms. If you do not agree, please discontinue use of the Website.
        </p>
      </div>

      {/* Terms Sections */}
      <div className="space-y-12 text-gray-700">

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            1. About Us
          </h2>
          <p>
            Amanah Network is registered as a Section 8 Company under the Companies Act, 2013. We are also registered under Section 12A / 80G of the Income Tax Act, 1961 enabling tax benefits on eligible donations, and FCRA registration requirements where applicable for foreign contributions.
          </p>
          <div className="bg-gray-50 p-4 border border-gray-200 font-mono text-sm space-y-1 text-gray-800">
            <p><strong>Registered Office:</strong> Still Pending</p>
            <p><strong>Email:</strong> contact@amanahnetwork.in</p>
            <p><strong>Phone:</strong> 7889381717</p>
          </div>
          <p className="font-semibold text-[#284D3D]">
            Our mission is to provide educational support to underprivileged individuals.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            2. Acceptance of Terms
          </h2>
          <p>By using this Website, registering for services, making a donation, or submitting any information to us, you confirm that:</p>
          <ul className="list-disc pl-6 space-y-2 font-mono text-sm text-gray-600">
            <li>You are at least 18 years of age, or are using the Website under the supervision of a parent or legal guardian.</li>
            <li>You have the legal capacity to enter into a binding agreement.</li>
            <li>All information you provide is true, accurate, and complete.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            3. Use of the Website
          </h2>
          <p>You agree to use this Website only for lawful purposes. You must not:</p>
          <ul className="list-disc pl-6 space-y-2 font-mono text-sm text-gray-600">
            <li>Use the Website in any way that violates applicable local, state, national, or international law.</li>
            <li>Attempt to gain unauthorized access to any part of the Website, servers, or databases.</li>
            <li>Transmit any harmful code, viruses, or malicious software.</li>
            <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
            <li>Use automated means (bots, scrapers) to access or extract data from the Website without written permission.</li>
            <li>Post or transmit content that is defamatory, obscene, threatening, or infringes on the rights of others.</li>
          </ul>
          <p className="text-sm font-semibold text-gray-800">
            We reserve the right to restrict or terminate your access to the Website if we believe, in our sole discretion, that you have violated these Terms.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            4. Account Registration and Verification
          </h2>
          <p>If the Website requires you to create an account (for donors, volunteers):</p>
          <ul className="list-disc pl-6 space-y-2 font-mono text-sm text-gray-600">
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You agree to provide accurate registration information and to keep it updated.</li>
            <li>Email verification may be required to activate certain features. You are responsible for ensuring the email address provided is accurate and accessible.</li>
            <li>We are not liable for any loss arising from unauthorized use of your account due to your failure to safeguard your credentials.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            5. Donations
          </h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-700">
            <li>All donations made through this Website are voluntary and are used solely to further the charitable objectives of the Organization.</li>
            <li>
              Donations, once made, are generally <strong>non-refundable</strong>, except in cases of duplicate transactions, technical payment errors, or as otherwise required by law. Refund requests must be raised within 3 business days of the transaction by contacting us at <a href="mailto:contact@amanahnetwork.in" className="text-[#C5A059] font-bold underline">contact@amanahnetwork.in</a>.
            </li>
            <li>Donation receipts, including tax exemption certificates (where applicable under Section 80G), will be issued to the email address or address provided at the time of donation.</li>
            <li>We use third-party payment gateways to process donations. We do not store your card or banking credentials; such information is handled directly by our secure, PCI-compliant payment processor.</li>
            <li>The Organization reserves the right to allocate donated funds toward the programs and operational needs it deems most necessary to fulfil its charitable mission, unless a donation is explicitly earmarked for a specific purpose and accepted as such in writing.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            6. Intellectual Property
          </h2>
          <p>
            All content on this Website — including text, graphics, logos, images, videos, and software — is the property of Amanah Network or its licensors and is protected under applicable copyright, trademark, and intellectual property laws.
          </p>
          <p>
            You may not reproduce, distribute, modify, or create derivative works from any content on this Website without our prior written consent, except for personal, non-commercial use or as permitted by law.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            7. Third-Party Links
          </h2>
          <p>
            This Website may contain links to third-party websites (e.g., payment gateways, social media, partner organizations). We do not control and are not responsible for the content, privacy practices, or reliability of any third-party websites. Accessing such links is at your own risk.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            8. Disclaimer of Warranties
          </h2>
          <p>This Website and its content are provided on an "as is" and "as available" basis. While we strive for accuracy, we make no warranties, express or implied, regarding:</p>
          <ul className="list-disc pl-6 space-y-2 font-mono text-sm text-gray-600">
            <li>The completeness, reliability, or accuracy of information on the Website.</li>
            <li>Uninterrupted or error-free operation of the Website.</li>
            <li>The outcome or continuation of any program.</li>
          </ul>
        </section>

        {/* Section 9 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            9. Limitation of Liability
          </h2>
          <p>To the fullest extent permitted by law, Amanah Network, its trustees, directors, employees, and volunteers shall not be liable for any direct, indirect, incidental, or consequential damages arising from:</p>
          <ul className="list-disc pl-6 space-y-2 font-mono text-sm text-gray-600">
            <li>Your use of, or inability to use, the Website.</li>
            <li>Reliance on any information provided through the Website.</li>
            <li>Any decision regarding eligibility, approval, or denial of Services.</li>
            <li>Unauthorized access to or alteration of your data, to the extent not caused by our negligence.</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            10. Indemnification
          </h2>
          <p>
            You agree to indemnify and hold harmless Amanah Network and its representatives from any claims, damages, or expenses (including legal fees) arising from your violation of these Terms or misuse of the Website.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-4 bg-gray-50 border-2 border-black p-6 md:p-8">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D]">
            11. Grievance Redressal
          </h2>
          <p>
            In accordance with the Information Technology Act, 2000, and the rules made thereunder, any grievances or complaints regarding this Website or our services may be addressed to our Grievance Officer:
          </p>
          <div className="font-mono text-sm space-y-1 text-gray-800">
            <p><strong>Grievance Officer:</strong> Legal & Governance Cell</p>
            <p><strong>Email:</strong> contact@amanahnetwork.in</p>
            <p><strong>Phone:</strong> 7889381717</p>
            <p><strong>Address:</strong> Registered Entity, India</p>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-500">
            We aim to acknowledge grievances within 3 business days and resolve them within 7 business days of receipt.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            12. Privacy
          </h2>
          <p>
            Your use of this Website is also governed by our{' '}
            <Link to="/privacy" className="text-[#C5A059] font-bold underline">
              Privacy Policy
            </Link>
            , which explains how we collect, use, and protect your personal information, including data submitted for donations, volunteering, or beneficiary applications.
          </p>
        </section>

        {/* Section 13 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            13. Modifications to These Terms
          </h2>
          <p>
            We may update these Terms from time to time to reflect changes in our operations, legal requirements, or services. The updated Terms will be posted on this page with a revised "Last Updated" date. Continued use of the Website after changes are posted constitutes acceptance of the revised Terms.
          </p>
        </section>

        {/* Section 14 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            14. Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate your access to the Website, without prior notice, if we believe you have violated these Terms or engaged in conduct harmful to the Organization or other users.
          </p>
        </section>

        {/* Section 15 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            15. Governing Law and Jurisdiction
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts at the registered city in India.
          </p>
        </section>

        {/* Section 16 */}
        <section className="space-y-4 bg-[#284D3D] text-white p-6 md:p-8">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#C5A059]">
            16. Contact Us
          </h2>
          <div className="font-mono text-sm space-y-1">
            <p className="font-bold text-base">Amanah Network</p>
            <p><strong>Registered Address:</strong> Still Pending</p>
            <p><strong>Email:</strong> contact@amanahnetwork.in</p>
            <p><strong>Phone:</strong> 7889381717</p>
          </div>
        </section>

      </div>

      {/* Navigation Footer */}
      <div className="mt-16 pt-8 border-t border-gray-200 flex flex-wrap justify-between items-center text-xs uppercase font-bold tracking-widest gap-4">
        <Link to="/privacy" className="text-[#C5A059] hover:text-black transition-colors">
          View Privacy Policy
        </Link>
        <Link to="/contact" className="text-[#284D3D] hover:text-black transition-colors">
          Contact Governance Team
        </Link>
      </div>
    </div>
  );
}