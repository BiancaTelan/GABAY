import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import gabayLogo from '../assets/gabayLogo.png'; 
import Button from '../components/button';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    const verifyUserEmail = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.detail || 'Verification failed. The link may have expired.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred while communicating with the server. Please try again later.');
      }
    };

    verifyUserEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-16 w-auto drop-shadow-md cursor-pointer hover:opacity-80 transition"
          src={gabayLogo}
          alt="GABAY Logo"
          onClick={() => navigate('/')}
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gabay-blue font-montserrat">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          
          {/* LOADING STATE */}
          {status === 'loading' && (
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 border-4 border-t-gabay-teal border-gray-200 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-poppins">{message}</p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && (
            <div className="flex flex-col items-center animate-in fade-in duration-500">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-800 font-poppins font-medium mb-6">{message}</p>
              <Button variant="teal" onClick={() => navigate('/login')} className="w-full">
                Proceed to Login
              </Button>
            </div>
          )}

          {/* ERROR STATE */}
          {status === 'error' && (
            <div className="flex flex-col items-center animate-in fade-in duration-500">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-poppins font-medium mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-6 font-poppins">
                If your link expired, please try signing up again or contact support.
              </p>
              <Button variant="teal" onClick={() => navigate('/signup')} className="w-full">
                Back to Sign Up
              </Button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}