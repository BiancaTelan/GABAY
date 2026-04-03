import { useState } from 'react';
import { Phone, CheckCircle } from 'lucide-react';
import Button from '../components/button';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstname: '',
    surname: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.firstname.trim()) newErrors.firstname = 'First name is required';
    if (!formData.surname.trim()) newErrors.surname = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/patients/contact-us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to send message.");
      }

      // NEW: Clear the form and show the modal instead of the alert
      setFormData({ firstname: '', surname: '', email: '', subject: '', message: '' });
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Contact form error:', error);
      alert(error.message); // Keeping error alerts simple, or you can build an error modal next!
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative max-w-5xl mx-auto px-4 py-12 font-poppins">
      <h1 className="text-4xl lg:text-6xl font-montserrat font-bold text-gabay-blue leading-tight text-center mb-12 mt-5">
        Contact Us
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-center gap-3">
                <Phone size={30} className="text-gabay-blue mt-1" />
                <div>
                  <p className="font-bold text-gabay-navy text-lg">8535-0131</p>
                  <p className="text-gray-700">RESCUE 131 (24/7)</p>
                </div>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
            <div className="flex items-center justify-center gap-3">
              <Phone size={30} className="text-gabay-blue mt-1" />
              <div>
                <p className="font-bold text-gabay-navy text-lg">8696-2605</p>
                <p className="text-gray-700">HOSPITAL</p>
              </div>
            </div>
          </div>
        </div>

      <div className="bg-white rounded-xl shadow-md p-6 relative z-10">
        <h2 className="font-montserrat text-3xl font-semibold text-gabay-teal mb-8 text-center">
          Send us a Message
        </h2>
        <p className="text-gray-600 text-lg mb-8 text-center">
          You can also contact us by using this form:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-m font-bold text-gabay-navy mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="e.g., Juan"
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gabay-teal ${
                  errors.firstname ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.firstname && <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>}
            </div>
            <div>
              <label className="block text-m font-bold text-gabay-navy mb-1">
                Last Name 
              </label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="e.g., Dela Cruz"
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gabay-teal ${
                  errors.surname ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname}</p>}
            </div>
          </div>

          <div>
            <label className="block text-m font-bold text-gabay-navy mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., juandelacruz@gmail.com"
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gabay-teal ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-m font-bold text-gabay-navy mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g., Inquiry about appointment booking"
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gabay-teal ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className="block text-m font-bold text-gabay-navy mb-1">
              Message
            </label>
            <textarea
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write a message"
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gabay-teal ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
          </div>

          <div className="flex justify-center mt-6">
            <Button 
              variant="teal" 
              type="submit" 
              className={`w-48 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'SENDING...' : 'SUBMIT'}
            </Button>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-montserrat text-2xl font-bold text-gabay-navy mb-3">
              Message Sent!
            </h3>
            <p className="font-poppins text-gray-600 text-sm mb-8 leading-relaxed">
              Thank you for reaching out. Your inquiry has been successfully forwarded to the hospital administration. We will get back to you shortly.
            </p>
            <Button 
              variant="teal" 
              onClick={() => setShowSuccessModal(false)} 
              className="w-full"
            >
              DONE
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}