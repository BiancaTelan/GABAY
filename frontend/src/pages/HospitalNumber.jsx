import Button from '../components/button';
import YesIcon from '../assets/personCheck.png';
import NoIcon from '../assets/personCancel.png';

export default function HospitalNumber({ onNavigate }) 
{

  const handleGet = () => {
    console.log('Get hospital number');
    onNavigate('generatedNumber');
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

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        <div className="flex-1 bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="font-montserrat font-bold text-2xl text-gabay-teal mb-4">
            YES
          </h2>
          <h3 className="font-poppins mb-4">
            I have a hospital number
          </h3>
          <img src={YesIcon} alt="Yes icon" className="w-20 h-20 mb-4 mt-4 mx-auto object-contain" />
          <Button variant="teal" onClick={() => onNavigate('registerNumber')} className="w-65">
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
          <Button variant="teal" onClick={handleGet} className="w-65">
            GET HOSPITAL NUMBER
          </Button>
        </div>
      </div>
    </main>
  );
}