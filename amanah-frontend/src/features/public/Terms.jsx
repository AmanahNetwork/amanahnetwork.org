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
        <p className="text-base text-gray-800 font-medium leading-relaxed">
          Welcome to <strong>Amanah Network</strong>. We are a Section 8 Company registered under the Companies Act, 2013, incorporated with the objective of promoting charitable causes and supporting economically disadvantaged and underprivileged individuals and communities.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          These Terms and Conditions ("Terms") govern your access to and use of our website located at{' '}
          <a href="https://amanahnetwork.in" target="_blank" rel="noopener noreferrer" className="text-[#284D3D] font-bold underline">
            amanahnetwork.in
          </a>
          , including any donations made, services availed, or content accessed through it. By accessing or using this Website, you agree to be bound by these Terms, and if you do not agree, please discontinue use of the Website.
        </p>
      </div>

      {/* Terms Sections in Full Sentences */}
      <div className="space-y-12 text-gray-700">

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            1. About Us
          </h2>
          <p className="leading-relaxed">
            Amanah Network is registered as a Section 8 Company under the Companies Act, 2013. We are also registered under Section 12A and Section 80G of the Income Tax Act, 1961 enabling tax benefits on eligible donations, as well as FCRA registration requirements where applicable for foreign contributions. Our overarching mission is to provide comprehensive educational support to underprivileged individuals across communities.
          </p>
          <div className="bg-gray-50 p-4 border border-gray-200 font-mono text-sm space-y-1 text-gray-800">
            <p><strong>Registered Office:</strong> Still Pending</p>
            <p><strong>Email:</strong> contact@amanahnetwork.in</p>
            <p><strong>Phone:</strong> 7889381717</p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            2. Acceptance of Terms
          </h2>
          <p className="leading-relaxed">
            By using this Website, registering for services, making a donation, or submitting any information to us, you confirm that you are at least 18 years of age or are using the Website under the active supervision of a parent or legal guardian. Furthermore, you affirm that you possess the full legal capacity to enter into a binding agreement and that all information you provide is true, accurate, and complete.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            3. Use of the Website
          </h2>
          <p className="leading-relaxed">
            You agree to use this Website strictly for lawful purposes in accordance with all applicable local, state, national, and international laws. You must not attempt to gain unauthorized access to any part of the Website, servers, or databases, nor transmit any harmful code, viruses, or malicious software. In addition, you agree not to impersonate any person or entity, misrepresent your affiliation, use automated bots or scrapers to extract data without prior written permission, or post any content that is defamatory, obscene, threatening, or infringing on the rights of others. We reserve the right to restrict or terminate your access to the Website immediately if we believe in our sole discretion that you have violated these Terms.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            4. Account Registration and Verification
          </h2>
          <p className="leading-relaxed">
            Where the Website requires you to create an account or verify credentials, you are responsible for maintaining the confidentiality of your login details and ensuring all registration information remains accurate and updated. Email verification may be required to activate certain features, and you are responsible for ensuring that the email address provided is active and accessible. Amanah Network is not liable for any loss or damage arising from unauthorized access resulting from your failure to safeguard your account credentials.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            5. Donations
          </h2>
          <p className="leading-relaxed">
            All donations made through this Website are voluntary and are deployed solely to further the charitable objectives of the Organization. Donations are generally non-refundable once processed, except in verified cases of duplicate transactions or technical errors, which must be reported within 3 business days by contacting us at <a href="mailto:contact@amanahnetwork.in" className="text-[#C5A059] font-bold underline">contact@amanahnetwork.in</a>. Donation receipts and tax exemption certificates under Section 80G will be issued electronically to the email address provided at transaction time. We process all contributions via secure, PCI-compliant third-party payment gateways and do not store raw card or banking credentials. The Organization reserves full right to allocate donated funds toward the programs and operational needs it deems most critical to fulfill its mission, unless a donation is explicitly earmarked for a specific cause and accepted in writing.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            6. Intellectual Property
          </h2>
          <p className="leading-relaxed">
            All content published on this Website — including text, graphics, logos, images, software, and dynamic multimedia — is the exclusive property of Amanah Network or its licensors and is protected under applicable copyright, trademark, and intellectual property statutes. You may not reproduce, distribute, modify, or create derivative works from any website content without our express prior written permission, except for personal, non-commercial viewing.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            7. Third-Party Links
          </h2>
          <p className="leading-relaxed">
            This Website may contain hyperlinked references to third-party portals, payment gateways, or partner organizations. We do not control, endorse, or assume responsibility for the content, privacy policies, or reliability of third-party websites, and accessing any third-party links is done entirely at your own risk.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            8. Disclaimer of Warranties
          </h2>
          <p className="leading-relaxed">
            This Website and all its contents are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. While we strive to maintain high accuracy and operational availability, we make no guarantees regarding the uninterrupted, error-free operation of the Website, the completeness or reliability of posted information, or the guaranteed outcome of any specific program.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            9. Limitation of Liability
          </h2>
          <p className="leading-relaxed">
            To the fullest extent permitted by applicable law, Amanah Network, its trustees, directors, employees, and volunteers shall not be held liable for any direct, indirect, incidental, or consequential damages arising out of your use of or inability to use the Website, your reliance on information provided through our platform, decisions regarding service eligibility, or unauthorized access to your data not caused by our direct gross negligence.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            10. Indemnification
          </h2>
          <p className="leading-relaxed">
            You agree to indemnify, defend, and hold harmless Amanah Network and its representatives from and against any claims, damages, liabilities, costs, or expenses, including reasonable legal fees, resulting from your violation of these Terms or misuse of the Website.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-4 bg-gray-50 border-2 border-black p-6 md:p-8">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D]">
            11. Grievance Redressal
          </h2>
          <p className="leading-relaxed">
            In compliance with the Information Technology Act, 2000, and associated rules, any grievances or complaints regarding the Website or our services may be directed to our designated Grievance Officer (Legal & Governance Cell) via email at contact@amanahnetwork.in, phone at 7889381717, or mail at our Registered Entity in India. We aim to acknowledge all formal grievances within 3 business days and resolve them within 7 business days of receipt.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            12. Privacy
          </h2>
          <p className="leading-relaxed">
            Your use of this Website is additionally governed by our{' '}
            <Link to="/privacy" className="text-[#C5A059] font-bold underline">
              Privacy Policy
            </Link>
            , which details how we collect, handle, and safeguard your personal data submitted for donations, volunteering, or beneficiary applications.
          </p>
        </section>

        {/* Section 13 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            13. Modifications to These Terms
          </h2>
          <p className="leading-relaxed">
            We reserve the right to modify these Terms at any time to reflect operational, legal, or regulatory updates. Revised Terms will be published on this page with an updated revision date, and your continued use of the Website following changes indicates your binding acceptance of the updated Terms.
          </p>
        </section>

        {/* Section 14 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            14. Termination
          </h2>
          <p className="leading-relaxed">
            We reserve the right to suspend or terminate your access to the Website without prior notice if we reasonably determine that you have breached these Terms or engaged in conduct detrimental to the Organization or its community.
          </p>
        </section>

        {/* Section 15 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#284D3D] border-b border-gray-200 pb-2">
            15. Governing Law and Jurisdiction
          </h2>
          <p className="leading-relaxed">
            These Terms shall be governed by and interpreted in accordance with the laws of India. Any legal disputes or proceedings arising from these Terms shall be subject to the exclusive jurisdiction of the courts located at our registered city in India.
          </p>
        </section>

        {/* Section 16 */}
        <section className="space-y-4 bg-[#284D3D] text-white p-6 md:p-8">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#C5A059]">
            16. Contact Us
          </h2>
          <p className="leading-relaxed text-sm font-mono">
            For inquiries regarding our terms, please contact Amanah Network (Registered Office: Still Pending) via email at contact@amanahnetwork.in or phone at 7889381717.
          </p>
        </section>

      </div>

      {/* Navigation Footer */}
      <div className="mt-16 pt-8 border-t border-gray-200 flex flex-wrap justify-between items-center text-xs uppercase font-bold tracking-widest gap-4">
        <Link to="/privacy" className="text-[#C5A059] hover:text-black transition-colors">
          View Privacy Policy
        </Link>
        <Link to="/contact" className="text-[#284D3D] hover:text-black transition-colors">
          Contact Support
        </Link>
      </div>
    </div>
  );
}