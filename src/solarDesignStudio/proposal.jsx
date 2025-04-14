import React, { useState, useEffect } from 'react';
import { FaHouseChimney } from "react-icons/fa6";
import { BsBuildingsFill } from "react-icons/bs";

const SolarProposal = ({ updateData, selectedType }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Sync with parent prop when component mounts or when selectedType changes
  useEffect(() => {
    if (selectedType) {
      setSelectedOption(selectedType.toLowerCase());
    }
  }, [selectedType]);

  const handleSelection = (type) => {
    setSelectedOption(type.toLowerCase());
    updateData("type", type);
  };

  return (
    <div className="w-full max-w-10/12">
      <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left">
        Solar Design Studio
      </h2>
      <h2 className="text-4xl font-medium mb-8">Get a personalized solar proposal instantly</h2>

      <div className="w-full h-70 bg-gray-300 mb-8 rounded-lg border-2 flex justify-center items-center">
        {/* Image Placeholder */}
      </div>

      <p className="mt-4 text-2xl font-medium mb-8">I'm looking to get solar for:</p>

      <div className="mt-2 flex space-x-4 justify-center">
        <button
          onClick={() => handleSelection("Residential")}
          className={`border font-medium px-4 py-3 rounded-md flex-1 flex items-center justify-center ${
            selectedOption === "residential"
              ? "bg-black text-white"
              : "bg-white text-black"
          }`}
        >
          <FaHouseChimney className="mr-2" /> Residential
        </button>

        <button
          onClick={() => handleSelection("Commercial")}
          className={`border font-medium px-4 py-3 rounded-md flex-1 flex items-center justify-center ${
            selectedOption === "commercial"
              ? "bg-black text-white"
              : "bg-white text-black"
          }`}
        >
          <BsBuildingsFill className="mr-2" /> Commercial
        </button>
      </div>
    </div>
  );
};

export default SolarProposal;
