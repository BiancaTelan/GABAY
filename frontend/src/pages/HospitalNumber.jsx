import { useNavigate } from 'react-router-dom';
import Button from '../components/button';
import YesIcon from '../assets/personCheck.png';
import NoIcon from '../assets/personCancel.png';
import { useContext, useState } from 'react';
import { AuthContext } from '../authContext';

export default function HospitalNumber({ onNavigate }) {
  const { token } = useContext(AuthContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [serverError, setServerError] = useState('');
  
  const navigate = useNavigate();

  const handleGet = async () => {
    setIsGenerating(true);
    setServerError('');

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userEmail = payload.sub;

      const response = await fetch('/api/patients/generate-hospital-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const rawText = await response.text();
      let data = {};
      try {
          data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
          throw new Error("Backend server is offline or returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to generate hospital number');
      }

      onNavigate('generatedNumber', { 
        hospital_num: data.hospital_num, 
        patientName: data.patientName
      });

    } catch (error) {
      console.error('Generation failed:', error);
      setServerError(error.message); // This saves the error...
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] px-4 py-12 bg-gray-50">
      <div className="w-full max-w-[50rem] mb-10">
        <h1 className="font-montserrat font-bold text-[40px] text-gabay-blue leading-tight text-center">
          Do you have a hospital number?
        </h1>
        <div className="font-poppins text-center text-lg mb-8 mt-6">
          <p>
            Please take note that a hospital number is a unique ID assigned to{' '}
            <strong className="text-gabay-teal">ONE</strong> patient only.
          </p>
          <p>
            You <strong className="text-gabay-teal">CANNOT</strong> share, or use, another patient’s hospital number.
          </p>
        </div>
      </div>

      {serverError && (
        <div className="mb-6 w-full max-w-4xl p-4 bg-red-100 text-red-700 text-center rounded-lg font-poppins font-semibold">
          {serverError}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        <div className="flex-1 bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="font-montserrat font-bold text-2xl text-gabay-teal mb-4">
            YES
          </h2>
          <h3 className="font-poppins mb-4">
            I have a hospital number
          </h3>
          <img src={YesIcon} alt="Yes icon" className="w-20 h-20 mb-4 mt-4 mx-auto object-contain" />
          <Button variant="teal" onClick={() => navigate('/register-number')} className="w-65">
            REGISTER HOSPITAL NUMBER
          </Button>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="font-montserrat font-bold text-2xl text-gabay-teal mb-4">
            NO
          </h2>
          <h3 className="font-poppins mb-4">
            I don't have a hospital number
          </h3>
          <img src={NoIcon} alt="No icon" className="w-20 h-20 mb-4 mt-4 mx-auto object-contain" />
          <Button variant="teal" onClick={handleGet} className="w-65" disabled={isGenerating}>
            {isGenerating ? "GENERATING..." : "GET HOSPITAL NUMBER"}
          </Button>
        </div>
      </div>
    </main>
  );
}