import caintaBg from '../assets/caintaBg.png';
import gabayLogo from '../assets/gabayLogo.png';
import Button from '../components/button';
import Input from '../components/input';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../authContext'; // <-- Import your AuthContext
import { emailPattern, namePattern } from '../utils/constants';

export default function SignUp({ onCompleteSignup }) {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // <-- Grab the login function
    
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');    
    const [successMsg, setSuccessMsg] = useState('');       

    const handleSubmit = async (e) => {
      e.preventDefault();
      setServerError('');
      setSuccessMsg('');
      let newErrors = {};
      
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      } else if (!namePattern.test(formData.firstName)) {
        newErrors.firstName = "Names should only contain letters";
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      } else if (!namePattern.test(formData.lastName)) {
        newErrors.lastName = "Names should only contain letters";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!emailPattern.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (!/\d/.test(formData.password)) {
        newErrors.password = "Password must contain at least one number";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one special character (e.g., @, #, $)";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match!";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});

      const payload = {
        firstname: formData.firstName.trim(),
        surname: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirmPassword
      };

      try {
        // --- 1. SIGN UP THE USER ---
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Failed to create account. Please try again.');
        }

        setSuccessMsg("Account created successfully! Redirecting...");
        
        const urlEncodedData = new URLSearchParams();
        urlEncodedData.append('username', payload.email); 
        urlEncodedData.append('password', payload.password);

        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: urlEncodedData.toString(),
        });
        
        if (!loginResponse.ok) {
           throw new Error('Auto-login failed. Please go to the login page.');
        }

        const loginData = await loginResponse.json();
        const accessToken = loginData.access_token;
        const decodedPayload = JSON.parse(atob(accessToken.split('.')[1]));

        login(accessToken, decodedPayload.role);

        setTimeout(() => {
           onCompleteSignup({
             firstName: payload.firstname,
             lastName: payload.surname,
             email: payload.email
           });
        }, 1500);

      } catch (error) {
        console.error("Signup Error:", error);
        setServerError(error.message);
      }
    };

    return (
      <div className="relative min-h-screen flex items-center justify-center font-sans animate-in fade-in duration-500 text-left">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${caintaBg})` }}
        />
        <div 
          className="absolute top-6 left-6 z-30 cursor-pointer hover:opacity-80 transition"
          onClick={() => navigate('/')}>
          <img src={gabayLogo} alt="GABAY Logo" className="h-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
        </div>
        <div className="absolute inset-0 z-10 bg-black opacity-50" />

        <div className="relative z-20 flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-2xl overflow-hidden md:rounded-2sm mx-4">
          <div className="hidden md:flex flex-1 bg-gabay-blue p-12 flex-col justify-center text-white">
            <h1 className="font-montserrat text-4xl font-bold leading-tight mb-6 text-left">
              General to Specialty Appointment & Booking Assistant for You
            </h1>
            <h2 className="font-montserrat text-xl font-semibold mb-6 text-left">Your health, our priority.</h2>
            <p className="font-poppins text-left">
              A helpful guide to reserve your appointment slots in Cainta Municipal Hospital.
            </p>
          </div>

          <div className="flex-1 p-8 md:p-12 bg-white text-left">
            <h3 className="font-montserrat text-3xl font-bold text-gabay-blue text-center mb-2">Sign Up</h3>
            <p className="font-poppins text-gray-500 text-center text-sm mb-6">Accomplish the form below to create an account</p>
            
            {serverError && (
              <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg text-center font-poppins animate-pulse">
                {serverError}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-lg text-center font-poppins">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="First Name" 
                  placeholder="Enter your first name" 
                  value={formData.firstName}
                  error={errors.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                  isEditing={true}
                />
                <Input
                  label="Last Name" 
                  placeholder="Enter your last name" 
                  value={formData.lastName}
                  error={errors.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                  isEditing={true}
                />
              </div>
              
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="emailaddress@gmail.com" 
                value={formData.email}
                error={errors.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                isEditing={true}
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="Enter your password" 
                value={formData.password}
                error={errors.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                isEditing={true}
              />
              <Input 
                label="Confirm Password" 
                type="password" 
                placeholder="Confirm your password" 
                value={formData.confirmPassword}
                error={errors.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                isEditing={true}
              />
              
              <div className="flex justify-center mt-6">
                <Button variant="teal" type="submit" className="w-48">
                  SUBMIT
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
      </div>
    );
}