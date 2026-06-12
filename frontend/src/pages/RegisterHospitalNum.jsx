import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/input';
import Button from '../components/button';
import toast from 'react-hot-toast';
import { Info } from 'lucide-react'; 

export default function RegisterHospitalNumber({ onFinalSubmit }) {
  const navigate = useNavigate(); 
  const [hospitalNum, setHospitalNum] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const handleInputChange = (e) => {
    let value = e.target.value;
    // Auto-format to XX-XXXXXX
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) {
      value = digits;
    } else {
      value = `${digits.slice(0, 2)}-${digits.slice(2, 8)}`; 
    }
    setHospitalNum(value);
    if (error) setError("");
  };

  const validate = () => {
    if (!hospitalNum.trim()) {
      setError("Hospital Number is required");
      return false;
    } else if (hospitalNum.length < 9) {
      setError("Must be a valid hospital number format (e.g., 26-123456)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    setIsSubmitting(true);

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/patients/link-hospital-number`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ hospital_num: hospitalNum })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to register hospital number.');
        }

        toast.success('Hospital number registered successfully!');
        
        if (onFinalSubmit) {
          onFinalSubmit({ hospital_num: hospitalNum });
        }
        
        navigate('/account'); 

      } catch (error) {
        console.error("Registration Error:", error);
        toast.error(error.message);
      } finally {
        setIsSubmitting(false);
      }
  };

  return (
    <div id="register-form" className="max-w-2xl mx-auto p-10 font-poppins text-left animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-gabay-teal mb-2 font-montserrat">Register Hospital Number</h1>
      <p className="text-gray-500 mb-8 text-sm">Please provide your existing hospital number to access GABAY services.</p>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3 shadow-sm">
        <Info size={20} className="text-gabay-blue shrink-0 mt-0.5" />
        <p className="text-sm text-gabay-navy">
          <strong>Note:</strong> You will be redirected to the Account page after this step. Please ensure you complete your full personal and contact information there to fully activate your account features.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Hospital Number" 
          name="hospital_num" 
          value={hospitalNum} 
          onChange={handleInputChange} 
          placeholder="e.g. 26-123456" 
          maxLength={9} 
          error={error} 
          required 
          isEditing={true} 
        />

        <div className="flex justify-end items-center pt-4">
          <Button variant="teal" type="submit" disabled={isSubmitting} className="w-full sm:w-auto py-3 px-8 text-[16px] font-semibold tracking-normal disabled:opacity-70">
            {isSubmitting ? "REGISTERING..." : "REGISTER HOSPITAL NUMBER"}
          </Button>
        </div>
      </form>
    </div>
  );
}