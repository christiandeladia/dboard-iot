import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import MapComponent from "./MapComponent";
import LocationSearchInput from "./LocationSearchInput";
import SolarProposal from "./proposal";
import EnergyUsage from "./EnergyUsage";
import ElectricityTimeUsage from "./ElectricityTimeUsage";
import SolarProject from "./SolarProject";
import PersonalizedProposal from "./PersonalizedProposal";

const Design = () => {
  const navigate = useNavigate();
  // Default center can be Quezon City or any default location
  const [mapCenter, setMapCenter] = useState({
    lat: 14.6760,
    lng: 121.0437
  });
  const [showMap, setShowMap] = useState(false);

  const handlePlaceChanged = (place) => {
    console.log("Selected place:", place);
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();
    console.log("Latitude:", lat, "Longitude:", lng);

    if (lat && lng) {
      setMapCenter({ lat, lng });
    }
  };

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    bill: "",
    usage: "",
    installation: "",
    address: ""
  });
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  const updateData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    // If on step 1, automatically go to step 2 after selecting Residential/Commercial
    if (step === 1) {
      nextStep();
    }
  };
  const handleGetContacted = () => {
    console.log("User chose to get contacted:", formData);
    alert("Our team will contact you soon!");
  };

  const handleBookSiteVisit = () => {
    console.log("User chose to book a site visit:", formData);
    alert("Your site visit has been booked!");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <SolarProposal updateData={updateData} />;
      case 2:
        return <EnergyUsage updateData={updateData} />;
      case 3:
        return <ElectricityTimeUsage updateData={updateData} selectedUsage={formData.usage} />;
      case 4:
        return <SolarProject updateData={updateData} selectedInstallation={formData.installation} />;
      case 5:
        return <MapComponent center={mapCenter} updateData={updateData} />;
      case 6:
        return <PersonalizedProposal formData={formData} />;
      default:
        return null;
    }
  };



  return (
    <div
      className="min-h-screen text-black"
      style={{ fontFamily: "DM Sans, sans-serif" }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex flex-col justify-center items-center">
        <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left w-full max-w-10/12">
          Solar Design Studio
        </h2>

        {renderStep()}

        {/* Navigation Buttons */}
        <div className="mt-2 flex space-x-4 justify-center w-full max-w-10/12">
          {step > 1 && step < 6 && (
            <>
              <button onClick={prevStep} className='border border-gray-500 bg-gray-100 font-medium px-4 py-3 rounded-md flex-1'>Back</button>
              <button onClick={nextStep} className='border bg-black text-white font-medium px-4 py-3 rounded-md flex-1'>Next</button>
            </>
          )}
          
          {/* Step 6: Get Contacted & Book Site Visit */}
          {step === 6 && (
            <div className="mt-2 flex space-x-4 justify-center w-full max-w-10/12">
              <button onClick={handleGetContacted} className='border border-gray-500 bg-gray-100 font-medium px-4 py-3 rounded-md flex-1'>
                Contact Me
              </button>
              <button onClick={handleBookSiteVisit} className='border bg-black text-white font-medium px-4 py-3 rounded-md flex-1'>
                Book Site Visit
              </button>
            </div>
          )}
        </div>

        {/* <div className="p-4 w-full max-w-md">
          <h1 className="text-xl font-bold mb-4">Location Search</h1>
          <LocationSearchInput onPlaceChanged={handlePlaceChanged} />
        </div> */}
      </main>
    </div>
  );
};

export default Design;
