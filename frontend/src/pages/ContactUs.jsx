import { useState } from 'react';
import { Phone, MapPin, Send } from 'lucide-react';
import Button from '../components/button';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    console.log('Form submitted:', formData);
    alert('Your message has been sent. We will get back to you soon.');
    setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 font-poppins">
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

      <div className="bg-white rounded-xl shadow-md p-6">
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
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g., Juan"
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gabay-teal ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-m font-bold text-gabay-navy mb-1">
                Last Name 
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g., Dela Cruz"
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gabay-teal ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
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
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
          </div>

          <div className="flex justify-center">
            <Button variant="teal" type="submit" className="w-48">
              SUBMIT
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}