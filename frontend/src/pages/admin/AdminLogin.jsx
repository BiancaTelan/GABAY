import caintaBg from '../../assets/caintaBg.png'; 
import gabayLogo from '../../assets/gabayLogo.png'; 
import Button from '../../components/button'; 
import Input from '../../components/input';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { emailPattern } from '../../utils/constants'; 
import { AuthContext } from '../../authContext';

export default function AdminLogin() {
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
      newErrors.email = "Invalid Email Address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Invalid Password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    // --- MOCK CREDENTIALS ---
    if (formData.email === 'staff@example.com' && formData.password === 'password') {
      const fakeToken = btoa(JSON.stringify({ role: 'staff', sub: formData.email, exp: Date.now() + 86400000 }));
      login(fakeToken, 'staff');
      const intended = location.state?.from?.pathname;
      if (intended) {
        navigate(intended, { replace: true });
      } else {
        navigate('/staff/dashboard', { replace: true });
      }
      return;
    }

    if (formData.email === 'admin@example.com' && formData.password === 'password') {
      const fakeToken = btoa(JSON.stringify({ role: 'admin', sub: formData.email, exp: Date.now() + 86400000 }));
      login(fakeToken, 'admin');
      const intended = location.state?.from?.pathname;
      if (intended) {
        navigate(intended, { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
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
      
      const textResponse = await response.text();
      let data;
      
      try {
        data = textResponse ? JSON.parse(textResponse) : {};
      } catch (parseError) {
        throw new Error("The server encountered an error. Please try again later.");
      }
      
      if (!response.ok) {
        const errorMessage = data.detail || 'Incorrect email or password';
        setErrors({
          email: " ", 
          password: errorMessage 
        });
        return; 
      }

      const accessToken = data.access_token;
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const userRole = payload.role;

      // SECURITY CHECK: ADMIN ONLY
      if (userRole === 'admin' || userRole === 'staff') {
        setServerError("Access Denied: This portal is for authorized personnel only.");
        return;
      }

      login(accessToken, userRole);
      const intended = location.state?.from?.pathname;
      if (intended) {
        navigate(intended, { replace: true });
      } else {
        const redirectTo = userRole === 'staff' ? '/staff/dashboard' : '/admin';
        navigate(redirectTo, { replace: true });
      }

    } catch (error) {
      console.error('Login failed:', error);
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
      
      <div className="absolute inset-0 z-10 bg-black opacity-60" /> 

      <div className="relative z-20 flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-2xl overflow-hidden md:rounded-2sm mx-4 text-left">
        
        <div className="hidden md:flex flex-1 bg-gabay-navy p-12 flex-col justify-center text-white text-left">
          <h1 className="font-montserrat text-4xl font-bold leading-tight mb-6">
            General to Specialty Appointment & Booking Assistant for You
          </h1>
          <h2 className="font-montserrat text-xl font-semibold mb-6">Your health, our priority.</h2>
          <p className="font-poppins text-gray-300">
            GABAY's Administrative Portal. AUTHORIZED ACCESS ONLY. Please use your issued credentials to view and manage the system.
          </p>
        </div>

        <div className="flex-1 p-8 md:p-12 bg-white">
          <h3 className="font-montserrat text-3xl font-bold text-gabay-navy text-center mb-2">Admin Log In</h3>
          <p className="font-poppins text-gray-500 text-center text-sm mb-8">Login to access your authorized GABAY account.</p>
          
          {serverError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6">
              <p className="text-red-700 text-xs font-medium">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="Personnel Email" 
              type="email" 
              placeholder="admin@gabay.com" 
              value={formData.email}
              error={errors.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              isEditing={true}
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              error={errors.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              isEditing={true}
            />

            <div className="flex items-center justify-between mt-1 mb-6">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" 
                  className="w-4 h-4 border-gray-300 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <span className="ml-2 text-xs font-poppins text-gray-600 group-hover:text-slate-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link to="/forgot-password"
              className="text-xs font-poppins font-medium text-gabay-blue hover:underline hover:text-gabay-navy transition-colors">
              Forgot Password?
              </Link>
            </div>
          
            <div className="flex justify-center mt-6">
              <Button variant="blue" type="submit" className="w-48">
                LOGIN
              </Button>
            </div>
          </form>

          <p className="font-poppins text-center text-[10px] mt-8 text-gray-400 italic">
            Contact a system admin if you have trouble accessing your personnel account.
          </p>
        </div>
      </div>
    </div>
  );
}