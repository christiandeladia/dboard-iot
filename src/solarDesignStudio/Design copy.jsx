import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import MapComponent from "./MapComponent";
import LocationSearchInput from "./LocationSearchInput";
import SolarProposal from "./proposal";
import EnergyUsage from "./EnergyUsage";
import ElectricityTimeUsage from "./ElectricityTimeUsage";
import SolarProject from "./SolarProject";
import MultiStepForm from "./test.jsx";


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

  const handleShowMapClick = () => {
    setShowMap(true); // Display the MapComponent when the button is clicked
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

        {/* Conditional rendering based on showMap state */}
        {/* {showMap ? (
          <MapComponent center={mapCenter} />
        ) : (
          <SolarProposal onShowMapClick={handleShowMapClick} />
        )} */}

        {/* <SolarProposal onShowMapClick={handleShowMapClick} /> */}
        {/* <EnergyUsage /> */}
        {/* <ElectricityTimeUsage /> */}
        {/* <SolarProject /> */}
        <MapComponent center={mapCenter} />

        {/* <div className="p-4 w-full max-w-md">
          <h1 className="text-xl font-bold mb-4">Location Search</h1>
          <LocationSearchInput onPlaceChanged={handlePlaceChanged} />
        </div> */}
      </main>
    </div>
  );
};

export default Design;
