import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AppointmentHistory({ onNavigate }) {
  const appointments = [
    {
      date: '03/16/2026',
      doctor: 'Dr. Ritchie Cruz',
      department: 'Internal Medicine',
    },
    {
      date: '03/02/2026',
      doctor: 'Dr. Joseph Nieto',
      department: 'Orthopedic Surgery',
    },
    {
      date: '01/17/2026',
      doctor: 'Dr. Vinhcent Sandoval',
      department: 'Cardiology',
    },
    {
      date: '12/13/2025',
      doctor: 'Dr. Vinhcent Sandoval',
      department: 'General Dentistry',
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;

  const handleViewDetails = (appointment) => {
    console.log('View details for:', appointment);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] px-4 py-12 bg-gray-50">
      <div className="w-full max-w-5xl">
        <h1 className="font-montserrat font-bold text-[40px] text-gabay-teal text-left mb-2">
          Appointment History
        </h1>
        <p className="font-poppins text-gray-600 text-left text-lg mb-12">
          See your previous appointments from GABAY here
        </p>

        <div className="bg-white shadow-lg overflow-hidden border border-gabay-blue">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gabay-blue border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-poppins text-white">Date</th>
                  <th className="px-6 py-3 font-poppins text-white">Doctor</th>
                  <th className="px-6 py-3 font-poppins text-white">Department</th>
                  <th className="px-6 py-3 font-poppins text-white"></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-poppins text-gabay-navy">{appt.date}</td>
                    <td className="px-6 py-4 font-poppins text-gabay-navy">{appt.doctor}</td>
                    <td className="px-6 py-4 font-poppins text-gabay-navy">{appt.department}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(appt)}
                        className="font-poppins text-gabay-blue hover:underline font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center py-4 bg-white border-t border-gray-300">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 text-gabay-blue hover:text-gabay-blue disabled:text-gray-300 disabled:cursor-not-allowed focus:outline-none transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="mx-4 font-poppins text-gabay-navy">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 text-gray-600 hover:text-gabay-blue disabled:text-gray-300 disabled:cursor-not-allowed focus:outline-none transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}