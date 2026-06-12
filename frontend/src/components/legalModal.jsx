import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function LegalModal({ isOpen, onClose, type }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = {
    privacy: {
      title: 'Privacy Policy',
      text: (
        <>
          <p>This Privacy Policy explains how the GABAY research team collects, uses, discloses, and safeguards your personal information when you use the GABAY web‑based schedule reservation system. By using the platform, you consent to the data practices described in this policy, which are derived from the research study informed consent form.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Information We Collect</h3>
          <p>We may collect personal information that you voluntarily provide when registering or using the platform, including:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Full name</li>
            <li>Hospital number</li>
            <li>Email address and contact number</li>
            <li>Address</li>
            <li>Appointment details</li>
            <li>System logs and usage data for evaluation</li>
          </ul>

          <h3 className="font-semibold text-gabay-teal mt-4">How We Use Your Information</h3>
          <p>Your information is used solely for:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Processing appointment requests and approvals</li>
            <li>Evaluating the usability, security, and effectiveness of the platform as part of the capstone research study</li>
            <li>Communicating appointment status and reminders</li>
            <li>Anonymizing data for academic analysis and reporting</li>
          </ul>
          <p>The research team does not sell, rent, or trade your personal information.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Data Sharing and Disclosure</h3>
          <p>Access to raw research data is strictly restricted to the lead researchers and the Hospital Administrator. Other hospital staff and participants can only view information relevant to their system roles through Role‑Based Access Control. Individual participants will never be identified in any published report or summary.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Data Security</h3>
          <p>We implement appropriate technical and organizational measures to protect your data:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li><strong>Encryption:</strong> Sensitive digital files are encrypted.</li>
            <li><strong>Access Control:</strong> Role‑Based Access Control ensures users see only necessary information.</li>
            <li><strong>Secure Storage:</strong> Survey responses and system logs are stored in a secure MySQL database. Documents are kept in an encrypted directory on a secure server. Signed consent forms and paper surveys are stored in a locked filing cabinet in a restricted‑access location.</li>
          </ul>

          <h3 className="font-semibold text-gabay-teal mt-4">Data Retention and Destruction</h3>
          <p>Your personal data will be retained for the duration of the capstone project – until final defense and institutional approval. After successful completion, all digital records will be permanently wiped from the database and cloud storage. All physical documents, including consent forms, will be destroyed using a cross‑cut shredder to prevent data recovery.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Your Rights and Choices</h3>
          <p>As a participant, you have the following rights:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li><strong>Voluntary Participation:</strong> You may decline or withdraw at any time without providing a reason, and it will not affect your patient or staff status.</li>
            <li><strong>Withdraw Your Data:</strong> You may request withdrawal of your data up until it is anonymized and aggregated for analysis. After aggregation, withdrawal is no longer possible because data will no longer be linked to an identifiable individual. To withdraw, contact the lead researcher using the information below.</li>
            <li><strong>Access and Correction:</strong> You may request access to or correction of your personal information by contacting the research team.</li>
          </ul>

          <h3 className="font-semibold text-gabay-teal mt-4">Changes to This Privacy Policy</h3>
          <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Continued use of the platform after changes constitutes acceptance of the revised policy.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Contact Information</h3>
          <p>If you have questions about this Privacy Policy, the research study, or wish to withdraw your data, please contact the PUP Research Ethics Committee at (02) 5335‑1787 local 235 for questions regarding your rights as a research participant.</p>

          <p className="mt-4">By using GABAY, you acknowledge that you have read and understood this Privacy Policy and voluntarily consent to the collection, use, and retention of your personal data as described.</p>
        </>
      ),
    },
    terms: {
      title: 'Terms of Service',
      text: (
        <>
          <p>Welcome to GABAY – a web‑based schedule reservation system for outpatient services in Cainta Municipal Hospital. By using this platform, you agree to the following terms and conditions, which are derived from the research study informed consent form.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Purpose of the Study</h3>
          <p>GABAY is a research project conducted by third‑year Diploma in IT students from the Polytechnic University of the Philippines. The system aims to digitize outpatient appointment booking, reduce waiting times, and evaluate the platform’s usability, security, and effectiveness. Your participation helps fulfill a capstone requirement.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Eligibility and User Accounts</h3>
          <p>You must be a resident of Cainta, Rizal, and a user of the hospital’s outpatient services, or an administrative staff member employed at the Cainta Municipal Hospital Outpatient Department. You agree to provide accurate information and keep your login credentials confidential.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">How the Platform Works</h3>
          <p>Patients submit appointment requests through the portal. Staff review, verify, and approve/cancel requests via an administrative dashboard. Approval notifications are sent to patients. A fail‑safe manual queuing system is available to avoid disruption of actual medical consultations.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Data Privacy and Confidentiality</h3>
          <p>We collect personal information such as name, hospital number, contact details, etc. solely for processing appointments and evaluating the platform. All research data is anonymized during analysis. Access is restricted to lead researchers and the Hospital Administrator using Role‑Based Access Control and encryption. Digital records are permanently wiped after project completion; physical documents are shredded.</p>
          <p>Individual participants will not be identified in any published report. You have the right to request withdrawal of your data before anonymization.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Voluntary Participation and Withdrawal</h3>
          <p>Your use of GABAY is entirely voluntary. You may decline or withdraw at any time without providing a reason, and it will not affect your patient or staff status nor any healthcare services you receive. To withdraw your data, contact the lead researcher before data anonymization.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Risks and Disclaimers</h3>
          <p>Possible risks include minor cognitive load or frustration for users with limited digital experience, minimal mobile data costs, and a low risk of data exposure. Technical issues may cause delays; the hospital can revert to manual queuing without affecting your consultation. The platform does not provide medical advice, and appointment approval is at the hospital’s discretion.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Costs and Remuneration</h3>
          <p>Accessing the platform on your personal device may incur minimal mobile data charges. You may use a dedicated research device or hospital terminal at no cost. No monetary or material compensation is provided for participation.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">User Obligations</h3>
          <p>You agree not to use the platform for unlawful purposes, attempt unauthorized access, upload false information, or interfere with its operation. You are responsible for all activities under your account.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Intellectual Property</h3>
          <p>All content, design, and code of GABAY are owned by the research team and PUP. You may not copy, modify, distribute, or reverse engineer any part without written permission.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Limitation of Liability</h3>
          <p>To the fullest extent permitted by law, the researchers, PUP, and Cainta Municipal Hospital are not liable for indirect, incidental, or consequential damages arising from your use of the platform, including data loss, delays, or inability to book an appointment.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Changes to Terms</h3>
          <p>We may update these Terms from time to time. Continued use after changes are posted constitutes acceptance of the revised Terms.</p>

          <h3 className="font-semibold text-gabay-teal mt-4">Governing Law and Contact</h3>
          <p>These Terms are governed by the laws of the Republic of the Philippines. For questions, to withdraw data, or to report concerns, contact the PUP Research Ethics Committee at (02) 5335‑1787 local 235 for questions about your rights as a research participant.</p>

          <p className="mt-4">By using GABAY, you acknowledge that you have read, understood, and voluntarily agree to these Terms of Service and consent to the collection and processing of your personal data as described.</p>
        </>
      ),
    },
  };

  const current = content[type];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="font-montserrat text-2xl font-bold text-gabay-blue text-center flex-1">{current.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-2 text-gray-700">{current.text}</div>
      </div>
    </div>
  );
}