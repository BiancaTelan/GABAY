import caintaBg from '../assets/caintaBg.png';
import gabayLogo from '../assets/gabayLogo.png';
import Button from '../components/button';
import Input from '../components/input';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../authContext'; 
import { emailPattern, namePattern } from '../utils/constants';
import LegalModal from '../components/legalModal';
import toast from 'react-hot-toast';
 

export default function SignUp() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); 
    
    const [formData, setFormData] = useState({
      firstname: '',
      surname: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    
    // NEW: States for the terms checkbox and modal
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      let newErrors = {};
      
      if (!formData.firstname.trim()) {
        newErrors.firstname = "First name is required.";
      } else if (!namePattern.test(formData.firstname)) {
        newErrors.firstname = "Please use only alphabetic characters.";
      }

      if (!formData.surname.trim()) {
        newErrors.surname = "Last name is required.";
      } else if (!namePattern.test(formData.surname)) {
        newErrors.surname = "Please use only alphabetic characters.";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!emailPattern.test(formData.email)) {
        newErrors.email = "Invalid email format.";
      }

      if (!formData.password) {
        newErrors.password = "Password is required.";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters.";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      if (!acceptedTerms) {
        toast.error("You must agree to the Terms of Service & Privacy Policy to register.");
        return;
      }

      try {
        const payload = {
          firstname: formData.firstname.trim(),
          surname: formData.surname.trim(),
          email: formData.email.trim(),
          password: formData.password
        };

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to create account.");
        }

        toast.success("Account successfully created!");
        navigate('/login');

      } catch (error) {
        toast.error(error.message);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden font-poppins">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <img src={caintaBg} alt="Cainta Municipal Hospital" className="w-full h-full object-cover brightness-50" />
          <div className="absolute inset-0 bg-gabay-blue/60 mix-blend-multiply" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-md p-6">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center p-3 mb-4 rotate-3 hover:rotate-0 transition-transform">
                <img src={gabayLogo} alt="GABAY Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl font-montserrat font-bold text-gabay-navy">Create Account</h2>
              <p className="text-sm text-gray-500 mt-1">Join the GABAY portal today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" name="firstname" placeholder="Juan" value={formData.firstname} error={errors.firstname} onChange={(e) => setFormData({...formData, firstname: e.target.value})} required isEditing={true} />
                <Input label="Last Name" name="surname" placeholder="Dela Cruz" value={formData.surname} error={errors.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} required isEditing={true} />
              </div>

              <Input label="Email Address" type="email" name="email" placeholder="juan@example.com" value={formData.email} error={errors.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required isEditing={true} />
              <Input label="Password" type="password" placeholder="Enter your password" value={formData.password} error={errors.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required isEditing={true} />
              <Input label="Confirm Password" type="password" placeholder="Confirm your password" value={formData.confirmPassword} error={errors.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required isEditing={true} />
              
              <div className="flex items-start gap-2 mt-4 px-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-gabay-teal cursor-pointer shrink-0"
                />
                <label htmlFor="terms" className="text-xs font-poppins text-gray-600 leading-snug">
                  I acknowledge that I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setIsLegalModalOpen(true)}
                    className="text-gabay-blue font-bold hover:underline"
                  >
                    Terms of Service & Privacy Policy
                  </button>
                  .
                </label>
              </div>

              <div className="flex justify-center mt-6">
                <Button variant="teal" type="submit" className="w-full">
                  REGISTER ACCOUNT
                </Button>
              </div>
            </form>

            <p className="font-poppins text-center text-sm mt-6 text-gray-600">
              Already have an account? 
              <button 
                type="button"
                onClick={() => navigate('/login')} 
                className="text-gabay-blue font-bold ml-1 hover:underline"
              >
                Log In
              </button>
            </p>
          </div>
        </div>

        <LegalModal 
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          type="privacy" 
        />
      </div>
    );
}