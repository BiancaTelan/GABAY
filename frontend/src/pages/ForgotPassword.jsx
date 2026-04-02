import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [serverError, setServerError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleResendOTP = async () => {
    setServerError('');
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      setTimer(60);
      setCanResend(false);
      console.log("OTP Resent!");
    } catch (err) {
      setServerError("Failed to resend OTP.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'otp' && !/^\d*$/.test(value)) return;
    if (errors[name]) setErrors({ ...errors, [name]: null });
    setFormData({ ...formData, [name]: value });
  };

  const validateStep1 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      setErrors({ email: "Email is required." });
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setErrors({ email: "Please enter a valid email address." });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.otp.length !== 6) {
      setErrors({ otp: "Please enter the exact 6-digit code." });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    let newErrors = {};
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters.";
    } else if (!hasNumber.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one number.";
    } else if (!hasSpecialChar.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one special character (e.g., @, #, $).";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    setServerError('');
    
    // --- STEP 1: SEND EMAIL, GET OTP ---
    if (step === 1) {
      if (!validateStep1()) return;
      setIsProcessing(true);
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        if (!response.ok) throw new Error("Failed to send OTP.");
        setStep(2); // Move to OTP screen
      } catch (err) {
        setServerError(err.message);
      } finally {
        setIsProcessing(false);
      }
    } 
    
    // --- STEP 2: VERIFY OTP ---
    else if (step === 2) {
      if (!validateStep2()) return;
      setIsProcessing(true);
      try {
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, otp: formData.otp })
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.detail || "Invalid OTP.");
        setStep(3); // Move to New Password screen
      } catch (err) {
        setServerError(err.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateStep3()) return;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          newPassword: formData.newPassword 
        })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail || "Failed to reset password.");
      
      // Success! Send them to login
      navigate('/login');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const inputStyle = "w-full px-4 py-3 rounded-md border outline-none transition-all font-poppins text-gray-600 focus:border-gabay-teal pr-12";
  const labelStyle = "block text-gabay-navy font-poppins font-medium mb-2 text-base";
  const buttonStyle = "bg-gabay-teal hover:bg-gabay-teal2 text-white font-montserrat font-bold py-2 px-12 rounded-full transition-all shadow-sm mt-3 uppercase tracking-wide";
  const errorTextStyle = "text-red-500 text-xs font-poppins mt-1 mb-2 block min-h-[16px]";

  return (
    <div className="h-screen w-screen bg-gabay-bg flex items-center justify-center p-8 overflow-hidden">
      <style>{`
        input::-ms-reveal,
        input::-ms-clear { display: none; }
      `}</style>

      <div className="bg-white w-full max-w-lg rounded-xl p-12 shadow-md border border-gray-300 relative">
        <Link to="/login" className="flex items-center text-gabay-blue text-md font-poppins mb-10 hover:opacity-80 transition-opacity">
          <ChevronLeft size={20} className="mr-1" /> Back to Login
        </Link>

        {serverError && (
          <div className="mb-6 p-3 text-sm text-red-700 bg-red-100 rounded-lg text-center font-poppins font-semibold">
            {serverError}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNextStep} noValidate className="animate-in fade-in duration-500">
            <h1 className="text-3xl font-montserrat font-bold text-gabay-teal mb-4">Forgot Password?</h1>
            <p className="text-gray-400 text-base mb-10 font-poppins leading-relaxed max-w-lg">
              Enter your registered email and we'll send you a verification code.
            </p>
            <label className={labelStyle}>Email Address</label>
            <input 
              type="email" name="email" placeholder="youremail@gmail.com" 
              className={`${inputStyle} ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.email} onChange={handleChange}
            />
            <span className={errorTextStyle}>{errors.email || ""}</span>
            <div className="flex justify-center mt-4">
              <button type="submit" className={buttonStyle}>SEND OTP</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNextStep} noValidate className="animate-in fade-in duration-500 text-center">
            <h1 className="text-3xl font-montserrat font-bold text-gabay-teal mb-4 text-left">Verify OTP</h1>
            <p className="text-gray-400 text-base mb-10 font-poppins leading-relaxed text-left">
              Please enter the 6-digit code sent to your email.
            </p>
            <div className="text-left">
               <label className={labelStyle}>Verification Code</label>
               <input 
                 type="text" name="otp" inputMode="numeric" placeholder="000000" 
                 className={`${inputStyle} ${errors.otp ? 'border-red-500' : 'border-gray-300'} text-center tracking-[1em] text-2xl font-bold pr-4`}
                 maxLength="6" value={formData.otp} onChange={handleChange}
               />
               <span className={errorTextStyle}>{errors.otp || ""}</span>
            </div>
            
            <div className="mt-2 mb-6">
              {canResend ? (
                <button type="button" onClick={handleResendOTP} className="text-gabay-blue font-poppins text-sm hover:underline">
                  Resend OTP
                </button>
              ) : (
                <p className="text-gray-400 font-poppins text-sm">Resend OTP in <span className="text-gabay-teal font-bold">{timer}s</span></p>
              )}
            </div>
            
            <button type="submit" className={buttonStyle}>VERIFY</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalSubmit} noValidate className="animate-in fade-in duration-500">
            <h1 className="text-3xl font-montserrat font-bold text-gabay-teal mb-4">New Password</h1>
            <p className="text-gray-400 text-base mb-10 font-poppins leading-relaxed">
              Create a strong password for your GABAY account (at least 8 characters, 1 digit, and 1 special character).
            </p>
            <div className="relative">
              <label className={labelStyle}>New Password</label>
              <input 
                type={showPassword ? "text" : "password"} name="newPassword" placeholder="••••••••" 
                className={`${inputStyle} ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.newPassword} onChange={handleChange}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-[45px] text-gray-400 hover:text-gabay-teal transition-colors">
                {showPassword ? <EyeOff size={23} /> : <Eye size={23} />}
              </button>
              <span className={errorTextStyle}>{errors.newPassword || ""}</span>
            </div>
            <div className="relative">
              <label className={labelStyle}>Confirm Password</label>
              <input 
                type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="••••••••" 
                className={`${inputStyle} ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.confirmPassword} onChange={handleChange}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-5 top-[45px] text-gray-400 hover:text-gabay-teal transition-colors">
                {showConfirmPassword ? <EyeOff size={23} /> : <Eye size={23} />}
              </button>
              <span className={errorTextStyle}>{errors.confirmPassword || ""}</span>
            </div>
            <div className="flex justify-center mt-4">
              <button type="submit" className={buttonStyle}>RESET PASSWORD</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;