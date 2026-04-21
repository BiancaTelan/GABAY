import React from 'react';
import toast from 'react-hot-toast';

/**
 * 1. KEYWORD HIGHLIGHTER
 * Wraps search matches in bg-gabay-blue/50.
 */
export const highlightMatch = (text, query) => {
  if (!query || !text) return text;
  const parts = text.toString().split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className="bg-gabay-blue/50 rounded-sm px-0.5">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

/**
 * 2. EDIT TRANSFORMERS
 * Bridges table data to modal-specific field names.
 */
export const transformPersonnelForEdit = (person) => {
  if (!person) return null;
  const nameParts = person.name ? person.name.split(' ') : ['', ''];
  return {
    ...person,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    contactNumber: person.phone || '',
    department: person.dept || '',
  };
};

export const transformUserForEdit = (user) => {
  if (!user) return null;
  const nameParts = user.name ? user.name.split(' ') : ['', ''];
  return {
    ...user,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    hospitalNumber: user.id,
    contactNumber: user.phone || '',
    dob: user.dob || '',
  };
};

export const transformDeptForEdit = (dept) => {
  if (!dept) return null;
  return {
    ...dept,
    departmentName: dept.name,
    departmentType: dept.type,
    staffCount: dept.staff,
    doctorCount: dept.doctors,
    slotCapacity: dept.totalSlots,
  };
};

/**
 * 3. CSV EXPORT UTILITY
 * //EDIT: Improved download logic and data cleaning.
 */
export const exportToCSV = (data, filename) => {
  try {
    if (!data || data.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // 1. Extract headers from the first object
    const headers = Object.keys(data[0]);
    
    // 2. Map rows and handle special characters/commas
    const csvRows = data.map(row => 
      headers.map(fieldName => {
        const value = row[fieldName] ?? ""; // Use empty string for null/undefined
        const escaped = String(value).replace(/"/g, '""'); // Escape double quotes
        return `"${escaped}"`; // Wrap in quotes
      }).join(",")
    );

    // 3. Create the CSV content
    const csvContent = [headers.join(","), ...csvRows].join("\n");

    // 4. Create a Blob with the correct MIME type
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // 5. Create a temporary anchor and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || "export.csv");
    
    // //INSTRUCTION FOR DEV: Append to body to ensure it works in all browsers
    document.body.appendChild(link);
    link.click();
    
    // 6. Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Download started!");
  } catch (error) {
    console.error("Export Error:", error);
    toast.error("Failed to generate CSV file.");
  }
};