import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactDOM from 'react-dom';

const NAME_REGEX = /^[A-Za-z\s]+$/;

const FormField = ({ label, name, type = "text", placeholder, value, onChange, error, children }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gabay-blue">{label} {label.includes("Name") && <span className="text-red-500">*</span>}</label>
    <div className="relative">
      {children ? children : (
        <input 
          name={name} 
          value={value} 
          onChange={onChange} 
          type={type} 
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full border-2 rounded-lg px-4 py-2 text-sm outline-none transition-all ${
            error ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-100 focus:border-gabay-teal'
          }`} 
        />
      )}
    </div>
    {error && <p className="text-[10px] text-red-500 font-semibold px-1">{error}</p>}
  </div>
);

export default function AddDepartment({ isOpen, onClose, editData = null }) {
  const modalRef = useRef();

  const initialState = {
    departmentName: '',
    departmentType: 'GENERAL',
    staffCount: 1,
    doctorCount: 1,
    slotCapacity: 1
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({ ...initialState, ...editData });
    } else {
      setFormData(initialState);
      setErrors({});
    }
  }, [editData, isOpen]);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'departmentName') {
      finalValue = value.replace(/[^A-Za-z\s]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    let newErrors = {};
 
    if (!formData.departmentName.trim()) {
      newErrors.departmentName = "This field is required";
    } else if (!NAME_REGEX.test(formData.departmentName)) {
      newErrors.departmentName = "Alphabetical characters only";
    }

    if (parseInt(formData.staffCount) < 1) {
      newErrors.staffCount = "Must be at least 1";
    } else if (parseInt(formData.staffCount) > 100) {
      newErrors.staffCount = "Cannot exceed 100 personnel";
    }

    if (parseInt(formData.doctorCount) < 1) {
      newErrors.doctorCount = "Must be at least 1";
    } else if (parseInt(formData.doctorCount) > 100) {
      newErrors.doctorCount = "Cannot exceed 100 personnel";
    }

    if (parseInt(formData.slotCapacity) < 1) {
      newErrors.slotCapacity = "Must be at least 1";
    } else if (parseInt(formData.slotCapacity) > 25) {
      newErrors.slotCapacity = "Capacity cannot exceed 25";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editData) {
        /* BACKEND DEV: PUT /api/admin/departments/${editData.id} */
        toast.success("Department updated successfully!");
      } else {
        /* BACKEND DEV: POST /api/admin/departments/create */
        toast.success("Department created successfully!");
      }
      onClose();
    } catch (err) {
      toast.error("Failed to process request.");
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-10 shadow-2xl relative font-poppins text-left overflow-x-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-gabay-teal text-center mb-8 md:mb-8">
          Department Information
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Department Name */}
          <FormField label="Department Name" name="departmentName" value={formData.departmentName} onChange={handleChange} error={errors.departmentName} placeholder="Rheumatology" />

          {/* Department Type */}
          <FormField label="Department Type" name="departmentType" error={errors.departmentType}>
            <select 
              name="departmentType" 
              value={formData.departmentType} 
              onChange={handleChange} 
              className="w-full border-2 border-gray-100 rounded-lg px-4 py-2 text-sm focus:border-gabay-teal outline-none bg-white appearance-none cursor-pointer"
            >
              <option value="SPECIALTY">SPECIALTY</option>
              <option value="GENERAL">GENERAL</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none pl-2 border-gray-200 text-gray-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </FormField>

          {/* Counts Grid */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Staff Count" name="staffCount" type="number" value={formData.staffCount} onChange={handleChange} error={errors.staffCount} />
            <FormField label="Doctor Count" name="doctorCount" type="number" value={formData.doctorCount} onChange={handleChange} error={errors.doctorCount} />
          </div>

          {/* Slot Capacity */}
          <FormField label="Slot Capacity" name="slotCapacity" type="number" value={formData.slotCapacity} onChange={handleChange} error={errors.slotCapacity} />

          <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center items-center"> 
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full sm:w-44 py-2 border-2 rounded-full border-gabay-teal text-sm text-gabay-teal font-semibold hover:bg-teal-50 transition-all"
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-64 py-2.5 rounded-full bg-gabay-teal text-white text-sm font-semibold hover:bg-teal-600 shadow-md transition-all uppercase tracking-wide"
            >
              {editData ? 'UPDATE DEPARTMENT' : 'CREATE DEPARTMENT'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}