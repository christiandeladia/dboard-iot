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

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    bill: "",
    monthly: [],
    usage: "",
    installation: "",
    address: "",
    hasUserAdjusted: false,
    sliderMax: 0 
  });
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  const updateData = (key, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [key]: value };
      console.log("Updated formData:", newData);
      return newData;
    });
  
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
        return <SolarProposal updateData={updateData} selectedType={formData.type}  />;
      case 2:
        return <EnergyUsage updateData={updateData} selectedBill={formData.bill} customerType={formData.type} initialConsumption={formData.monthly}    hasUserAdjusted={formData.hasUserAdjusted}/>
      case 3:
        return <ElectricityTimeUsage updateData={updateData} selectedUsage={formData.usage} computedSliderMax={formData.sliderMax} />;
      case 4:
        return <SolarProject updateData={updateData} selectedInstallation={formData.installation} />;
      case 5:
        return <MapComponent center={mapCenter} updateData={updateData} selectedAddress={formData.address} />;
      case 6:
        return <PersonalizedProposal formData={formData} goBack={prevStep} />;
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.type !== "";
      case 2:
        return formData.bill !== "";
      case 3:
        return formData.usage !== "";
      case 4:
        return formData.installation !== "";
      case 5:
        return formData.address !== "";
      default:
        return true;
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
        {/* <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left w-full max-w-10/12">
          Solar Design Studio
        </h2> */}

        {renderStep()}

        {/* Navigation Buttons */}
        <div className="mt-2 flex space-x-4 justify-center w-full max-w-10/12">
          {step > 1 && step < 6 && (
            <>
              <button onClick={prevStep} className='border border-gray-500 bg-gray-100 font-medium px-4 py-3 rounded-md flex-1'>Back</button>
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`border px-4 py-3 rounded-md flex-1 font-medium ${
                  isStepValid()
                    ? 'bg-black text-white cursor-pointer'
                    : 'bg-black text-gray-200 opacity-45 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </>
          )}
          
          {/* Step 6: Get Contacted & Book Site Visit */}
          {step === 6 && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-4 z-40">
            <div className="flex space-x-4 justify-center max-w-4xl mx-auto">
              <button
                onClick={handleGetContacted}
                className="border border-gray-500 bg-gray-100 font-medium px-4 py-3 rounded-md flex-1"
              >
                Contact Me
              </button>
              <button
                onClick={handleBookSiteVisit}
                className="border bg-black text-white font-medium px-4 py-3 rounded-md flex-1"
              >
                Book Site Visit
              </button>
            </div>
          </div>
        )}

        </div>

      </main>
    </div>
  );
};

export default Design;
