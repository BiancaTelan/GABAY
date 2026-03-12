import caintaBg from '../assets/caintaBg.png';
import gabayLogo from '../assets/gabayLogo.png';
import Button from '../components/button';
import Input from '../components/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useContext } from 'react';
import { emailPattern } from '../utils/constants';
import { AuthContext } from '../authContext';

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    let newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    const urlEncodedData = new URLSearchParams();
    urlEncodedData.append('username', formData.email); 
    urlEncodedData.append('password', formData.password);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncodedData.toString(),
      });
      
      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      const accessToken = data.access_token;

      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const userRole = payload.role;

      login(accessToken, userRole);

      // --- React Router Logic ---
      setIsLoggedIn(true);
      
      // If the user was redirected here from a private page, send them back there.
      // Otherwise, send them to the Home page ('/').
      const origin = location.state?.from?.pathname || '/';
      navigate(origin);

    } catch (error) {
      console.error('Login failed:', error);
      setServerError(error.message || 'An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans animate-in fade-in duration-500 text-left">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${caintaBg})` }}
      />
      
      {/* GABAY Logo Link */}
      <div 
        className="absolute top-6 left-6 z-30 cursor-pointer hover:opacity-80 transition"
        onClick={() => navigate('/')}>
        <img src={gabayLogo} alt="GABAY Logo" className="h-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
      </div>
      
      <div className="absolute inset-0 z-10 bg-black opacity-50" />

      <div className="relative z-20 flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-2xl overflow-hidden md:rounded-2sm mx-4 text-left">
        <div className="hidden md:flex flex-1 bg-gabay-blue p-12 flex-col justify-center text-white text-left">
          <h1 className="font-montserrat text-4xl font-bold leading-tight mb-6">
            General to Specialty Appointment & Booking Assistant for You
          </h1>
          <h2 className="font-montserrat text-xl font-semibold mb-6">Your health, our priority.</h2>
          <p className="font-poppins">
            A helpful guide to reserve your appointment slots in Cainta Municipal Hospital.
          </p>
        </div>

        <div className="flex-1 p-8 md:p-12 bg-white">
          <h3 className="font-montserrat text-3xl font-bold text-gabay-blue text-center mb-2">Log In</h3>
          <p className="font-poppins text-gray-500 text-center text-sm mb-8">Accomplish the form below to access your account</p>
          
          {serverError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6">
              <p className="text-red-700 text-xs font-medium">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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

            <div className="flex items-center justify-between mt-1 mb-6">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" 
                  className="w-4 h-4 border-gray-300 rounded text-gabay-teal focus:ring-gabay-teal cursor-pointer"
                />
                <span className="ml-2 text-xs font-poppins text-gray-600 group-hover:text-gabay-blue transition-colors">
                  Remember me
                </span>
              </label>
              <button type="button"
                className="text-xs font-poppins font-medium text-gabay-blue hover:underline hover:text-gabay-navy transition-colors">
                Forgot Password?
              </button>
            </div>
          
            <div className="flex justify-center mt-6">
              <Button variant="teal" type="submit" className="w-48">
                LOGIN
              </Button>
            </div>
          </form>

          <p className="font-poppins text-center text-sm mt-6 text-gray-600">
            Don't have an account? 
            <button 
              onClick={() => navigate('/signup')} 
              className="text-gabay-blue font-bold ml-1 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}