import caintaBg from '../assets/caintaBg.png';
import gabayLogo from '../assets/gabayLogo.png';
import Button from '../components/button';
import Input from '../components/input';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useContext, useRef } from 'react'; 
import { emailPattern } from '../utils/constants';
import { AuthContext } from '../authContext';
import toast from 'react-hot-toast';
import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const recaptchaRef = useRef(null); 

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('rememberMe') === 'true';
  });

  const [formData, setFormData] = useState({
    email: localStorage.getItem('rememberedEmail') || '',
    password: ''
  });

  const [recaptchaToken, setRecaptchaToken] = useState(null); 
  const [errors, setErrors] = useState({});
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Please enter a valid password.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA challenge to verify you are human.");
      return;
    }

    const loadingToast = toast.loading("Authenticating...");

    try {
      const loginpayload = {
        email: formData.email.trim(),
        password: formData.password,
        recaptcha_token: recaptchaToken 
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(loginpayload),
      });
      
      const textResponse = await response.text();
      let data;
      
      try {
        data = textResponse ? JSON.parse(textResponse) : {};
      } catch (parseError) {
        throw new Error("The server encountered an unexpected format. Please try again later.");
      }
      
      if (!response.ok) {
        toast.dismiss(loadingToast);
        const errorMessage = data.detail || 'The email or password provided is incorrect.';
        toast.error(errorMessage);
        if (recaptchaRef.current) recaptchaRef.current.reset(); 
        setRecaptchaToken(null);
        return; 
      }

      const accessToken = data.access_token;
      const decodedpayload = JSON.parse(atob(accessToken.split('.')[1]));
      const userRole = decodedpayload.role?.toLowerCase() || '';

      if (['staff', 'admin'].includes(userRole)) {
        toast.dismiss(loadingToast);
        toast.error("Access Denied. Personnel must log in through the administrative portal.");
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setRecaptchaToken(null);
        return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.setItem('rememberMe', 'false');
      }

      login(accessToken, userRole);
      
      toast.dismiss(loadingToast);
      toast.success("Authentication successful!");

      setTimeout(() => {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }, 500);

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Unable to connect to the server. Please check your connection and try again.");
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken(null);
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
          <h3 className="font-montserrat text-3xl font-bold text-gabay-blue text-center mb-2">Log In</h3>
          <p className="font-poppins text-gray-500 text-center text-sm mb-8">Accomplish the form below to access your account</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="emailaddress@gmail.com" 
              value={formData.email}
              error={errors.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required isEditing={true}
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="Enter your password" 
              value={formData.password}
              error={errors.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required isEditing={true}
            />

            <div className="flex items-center justify-between mt-1 mb-6">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 border-gray-300 rounded text-gabay-teal focus:ring-gabay-teal cursor-pointer" />
                <span className="ml-2 text-xs font-poppins text-gray-600 group-hover:text-gabay-blue transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs font-poppins font-medium text-gabay-blue hover:underline hover:text-gabay-navy transition-colors">Forgot Password?</Link>
            </div>
          
            {/* reCAPTCHA WIDGET */}
            <div className="flex justify-center mt-4">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
              />
            </div>

            <div className="flex justify-center mt-6">
              <Button variant="teal" type="submit" className="w-48">LOGIN</Button>
            </div>
          </form>

          <p className="font-poppins text-center text-sm mt-6 text-gray-600">
            Don't have an account? <button onClick={() => navigate('/signup')} className="text-gabay-blue font-bold ml-1 hover:underline">Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
}