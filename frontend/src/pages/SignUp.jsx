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
import { getApiErrorMessage, parseJsonResponse, showValidationError } from '../utils/apiError';

export default function SignUp({ onCompleteSignUp }) {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstname: '',
    middlename: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
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

    if (formData.middlename.trim() && !namePattern.test(formData.middlename)) {
      newErrors.middlename = "Please use only alphabetic characters.";
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
        newErrors.password = "Password must be at least 8 characters long.";
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must include at least one numerical digit.";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = "Password must include at least one special character (e.g., @, #, $).";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showValidationError(newErrors);
      return;
    }

    if (!acceptedTerms) {
      toast.error("You must agree to the Terms of Service & Privacy Policy to register.");
      return;
    }

    setErrors({});
    const processingToast = toast.loading("Creating your account...");

    const payload = {
        firstname: formData.firstname.trim(),
        middlename: formData.middlename.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirmPassword
      };

    try {
    
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(getApiErrorMessage(data.detail, 'Failed to create account.'));
      }

      const accessToken = data.access_token;
      if (!accessToken) {
        throw new Error('Account was created but login failed. Please log in manually.');
      }
      const userRole = data.role ? data.role.toLowerCase() : 'patient';
        
      const userData = {
        firstname: payload.firstname,
        surname: payload.surname,
        email: payload.email,
        isProfileComplete: false 
      };

      login(accessToken, userRole, userData);

      toast.dismiss(processingToast);
      toast.success("Account created! Let's set up your profile.");
      
    } catch (error) {
      toast.dismiss(processingToast);
      toast.error(error.message || "A network error occurred. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans animate-in fade-in duration-500 text-left">
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${caintaBg})` }} />
      <div className="absolute top-6 left-6 z-30 cursor-pointer hover:opacity-80 transition" onClick={() => navigate('/')}>
        <img src={gabayLogo} alt="GABAY Logo" className="h-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
      </div>
      <div className="absolute inset-0 z-10 bg-black opacity-50" />

      <div className="relative z-20 flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-2xl overflow-hidden md:rounded-2sm mx-4 text-left">
        <div className="hidden md:flex flex-1 bg-gabay-blue p-12 flex-col justify-center text-white text-left">
          <h1 className="font-montserrat text-4xl font-bold leading-tight mb-6">General to Specialty Appointment & Booking Assistant for You</h1>
          <h2 className="font-montserrat text-xl font-semibold mb-6">Your health, our priority.</h2>
          <p className="font-poppins">A helpful guide to reserve your appointment slots in Cainta Municipal Hospital.</p>
        </div>

        <div className="flex-1 p-8 md:p-12 bg-white">
          <h3 className="font-montserrat text-3xl font-bold text-gabay-blue text-center mb-2">Sign Up</h3>
          <p className="font-poppins text-gray-500 text-center text-sm mb-8">Accomplish the form below to create an account</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="First Name" name="firstname" placeholder="Juan" value={formData.firstname} error={errors.firstname} onChange={(e) => setFormData({...formData, firstname: e.target.value})} required isEditing={true} />
              <Input label="Middle Name" name="middlename" placeholder="Santos" value={formData.middlename} error={errors.middlename} onChange={(e) => setFormData({...formData, middlename: e.target.value})} isEditing={true} />
              <Input label="Last Name" name="surname" placeholder="Dela Cruz" value={formData.surname} error={errors.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} required isEditing={true} />
            </div>

            <Input label="Email Address" type="email" name="email" placeholder="juan@example.com" value={formData.email} error={errors.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required isEditing={true} />
            
            <div className="grid grid-cols-1 gap-4">
              <Input label="Password" type="password" placeholder="Enter password" value={formData.password} error={errors.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required isEditing={true} />
              <Input label="Confirm Password" type="password" placeholder="Confirm password" value={formData.confirmPassword} error={errors.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required isEditing={true} />
            </div>
            
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
              <Button variant="teal" type="submit" className="w-48">
                REGISTER
              </Button>
            </div>
          </form>

          <p className="font-poppins text-center text-sm mt-6 text-gray-600">
            Already have an account? 
            <button type="button" onClick={() => navigate('/login')} className="text-gabay-blue font-bold ml-1 hover:underline">Log In</button>
          </p>
        </div>
      </div>

      <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} type="privacy" />
    </div>
  );
}