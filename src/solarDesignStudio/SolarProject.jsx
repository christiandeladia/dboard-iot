import React, { useState, useEffect } from 'react';

import groundRoof from "./assets/img/stock/ground-roof.jpeg";
import canopyRoof from "./assets/img/stock/canopy-roof.png";
import metalRoof from "./assets/img/stock/metal-roof.webp";
import shinglesRoof from "./assets/img/stock/shingles-roof.webp";
import tilesRoof from "./assets/img/stock/tiles-roof.webp";
import flatRoof from "./assets/img/stock/flat-roof.webp";
import roofTypes from "./assets/img/stock/roof-types.webp";

// A simple modal component for selecting a roof type
const RoofModal = ({ isOpen, onClose, onSelectRoofType, selectedRoofType }) => {
  if (!isOpen) return null;

  const roofTypes = ["Metal", "Shingles", "Tiles", "Flatroof"];

  return (
    <div className="fixed inset-0 bg-gray-500/50  flex justify-center items-center z-50" >
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Select Roof Type</h3>
        <div className="flex flex-wrap gap-2">
          {roofTypes.map((type) => (
            <button
              key={type}
              className={`border border-gray-500 px-3 py-1 rounded-md transition-all hover:bg-blue-500 hover:text-white ${
                selectedRoofType === type ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
              onClick={() => {
                onSelectRoofType(type);
                onClose();
              }}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="mt-4 text-right">
          <button className="text-blue-500" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const SolarProject = ({ updateData, selectedInstallation }) => {
  // Local state for modal visibility and selected roof type
  const [isRoofModalOpen, setRoofModalOpen] = useState(false);
  const [selectedRoofType, setSelectedRoofType] = useState("Roof");

  // When component mounts, set selectedRoofType from formData
  useEffect(() => {
    if (
      selectedInstallation &&
      !["Ground", "Canopy"].includes(selectedInstallation)
    ) {
      setSelectedRoofType(selectedInstallation); // set to "Metal", "Tiles", etc.
    }
  }, [selectedInstallation]);

  const handleInstallationClick = (option) => {
    if (option === "Roof") {
      // Open modal for roof type selection
      setRoofModalOpen(true);
    } else {
      updateData("installation", option);
    }
  };

  const handleSelectRoofType = (roofType) => {
    setSelectedRoofType(roofType);
    updateData("installation", roofType);
  };

    // Determine image URL based on the selected installation.
  // For Roof, we display the roof type in the placeholder image text.
  let imageUrl = '';
  if (selectedInstallation === "Ground") {
    imageUrl = groundRoof;
  } else if (selectedInstallation === "Canopy") {
    imageUrl = canopyRoof;
  } else {
    // For roof types: "Metal", "Shingles", "Tiles", or "Flatroof"
    switch (selectedInstallation) {
    case "Metal":
        imageUrl = metalRoof;
        break;
    case "Shingles":
        imageUrl = shinglesRoof;
        break;
    case "Tiles":
        imageUrl = tilesRoof;
        break;
    case "Flatroof":
        imageUrl = flatRoof;
        break;
    default:
        imageUrl = roofTypes;
    }
}

  return (
    <div className="w-full max-w-10/12">
                  <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left">
                Solar Design Studio
            </h2>
      <h2 className="text-4xl font-medium mb-8">Tell us about your project.</h2>

      {/* Image container with a changeable image */}
      <div className="w-full h-70 bg-gray-300 rounded-lg flex justify-center items-center">
        <img 
          src={imageUrl} 
          alt="Solar Project" 
          className="w-full h-full object-cover rounded-lg" 
        />
      </div>

      <p className="mt-4 text-2xl font-medium mb-4">What type of solar project is this?</p>

      <div className="mt-2 flex space-x-2 justify-center">
        {["Roof", "Ground", "Canopy"].map((option) => (
          <button
            key={option}
            className={`border border-gray-500 px-1 py-2 rounded-md flex-1 cursor-pointer transition-all
              ${selectedInstallation === option ||
                (option === "Roof" &&
                  selectedInstallation &&
                  selectedInstallation !== "Ground" &&
                  selectedInstallation !== "Canopy")
                ? "bg-blue-500 text-white"
                : "bg-gray-100"}`}
            onClick={() => handleInstallationClick(option)}
          >
            {option === "Roof" ? selectedRoofType : option}
          </button>
        ))}
      </div>

      <p className="text-[0.75rem] text-gray-400 tracking-tight leading-tight mb-8 mt-4 text-left w-full max-w-10/12">
        This info gives us an understanding of how much you can save with the different types of systems available.
      </p>

      <RoofModal
        isOpen={isRoofModalOpen}
        onClose={() => setRoofModalOpen(false)}
        onSelectRoofType={handleSelectRoofType}
        selectedRoofType={selectedRoofType}
      />
    </div>
  );
};

export default SolarProject;
