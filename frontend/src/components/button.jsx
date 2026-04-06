
export default function Button({ 
  children, 
  onClick, 
  variant = 'solid', 
  className = '', 
  type = 'button' 
}) {
  const baseStyles = "px-6 py-2 font-poppins text-sm font-semibold transition-all duration-200 active:scale-95";

  const variants = {
    solid: "bg-gabay-blue text-white px-5 py-2 text-sm font-medium hover:bg-gabay-navy transition-colors",
    outline: "border-2 border-gabay-blue text-gabay-blue px-5 py-2 text-sm font-medium bg-transparent hover:bg-blue-50 transition-colors",
    teal: "bg-gabay-teal rounded-full text-white text-base hover:bg-gabay-teal2 transition-colors",
    blue: "bg-gabay-blue rounded-full text-white text-base hover:bg-gabay-navy transition-colors",
    red: "bg-red-600 rounded-full text-white hover:bg-red-700 focus:ring-red-500 transition-colors",
    "teal-outline": "rounded-full border border-gabay-teal text-sm text-gabay-teal font-semibold hover:bg-teal-50 transition-colors"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}