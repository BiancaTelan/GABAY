import FAQItem from '../components/FAQItem';

export default function Help() {
  return (
    <div className="max-w-5xl mx-auto p-10 animate-in fade-in duration-500">
      <h1 className="text-4xl lg:text-6xl font-montserrat font-bold text-gabay-blue leading-tight text-center mb-4 mt-5 ">Help Center</h1>
      <p className="font-poppins text-lg mt-6 mb-12 text-center text-gray-600">Here are some answers to common questions about reserving your appointment with GABAY.</p>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-300 overflow-hidden">
        <FAQItem 
          question="How do I book an appointment?" 
          answer="Navigate to the Departments page, select either General or Specialty, fill out the form, and wait for the confirmation in your Inbox." 
        />
        <FAQItem 
          question="What is the difference between the General and Specialty Departments?" 
          answer="General consultations are for common illnesses. Specialty consultations are for treating specific conditions." 
        />
        <FAQItem 
          question="What is a Medical Referral?" 
          answer="A document from a doctor referring you to a specialist. This is a required attachment for Specialty appointments." 
        />
        <FAQItem 
          question="What if I don't have a Hospital Number?" 
          answer="If you are a new patient, GABAY can generate you a hospital number upon Sign Up. Please take note of it since it will be PERMANENT." 
        />
        <FAQItem 
          question="I forgot my Hospital Number. What should I do?" 
          answer="Patients can check their Hospital Number on their Account Page." 
        />
        <FAQItem 
          question="How do I reschedule an appointment reservation?" 
          answer="In your Inbox, you can reschedule by pressing the provided link on your cancelled appointment or by simply filling out a new form." 
        />
        <FAQItem 
          question="Can I book for someone else?" 
          answer="Appointment reservations are tied to the patient's Hospital Number. To maintain accurate records, each patient should have their own account." 
        />
      </div>
    </div>
  );
}