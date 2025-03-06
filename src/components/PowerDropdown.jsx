import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FaSun, FaBolt, FaBatteryFull, FaChevronDown } from "react-icons/fa";

// Power source options (Single Select)
export const powerOptions = [
  { value: "Solar", label: "Solar", icon: <FaSun className="text-yellow-500 mr-2" />, dataKeys: [] },
  { value: "Grid", label: "Grid", icon: <FaBolt className="text-blue-500 mr-2" />, dataKeys: ["L1_voltage", "L2_voltage", "L3_voltage", "L1_current", "L2_current", "L3_current", "L1_frequency", "L2_frequency", "L3_frequency", "L1_volt_harmonic", "L2_volt_harmonic", "L3_volt_harmonic", "L1_curr_harmonic", "L2_curr_harmonic", "L3_curr_harmonic", "L1_power_factor", "L2_power_factor", "L3_power_factor", "L1_power", "L2_power", "L3_power", "total_power"] },
  { value: "Battery", label: "Battery", icon: <FaBatteryFull className="text-green-500 mr-2" />, dataKeys: [] },
];

// Individual phase options (Multi-Select)
export const phaseOptions = [
    // Voltage - Shades of Blue
    { value: "L1_voltage", label: "L1 Voltage", color: "rgb(0, 102, 255)" },
    { value: "L2_voltage", label: "L2 Voltage", color: "rgb(51, 153, 255)" },
    { value: "L3_voltage", label: "L3 Voltage", color: "rgb(102, 204, 255)" },
  
    // Current - Shades of Yellow
    { value: "L1_current", label: "L1 Current", color: "rgb(255, 153, 0)" },
    { value: "L2_current", label: "L2 Current", color: "rgb(255, 204, 51)" },
    { value: "L3_current", label: "L3 Current", color: "rgb(255, 255, 102)" },
  
    // Frequency - Shades of Green
    { value: "L1_frequency", label: "L1 Frequency", color: "rgb(0, 153, 76)" },
    { value: "L2_frequency", label: "L2 Frequency", color: "rgb(51, 204, 102)" },
    { value: "L3_frequency", label: "L3 Frequency", color: "rgb(102, 255, 153)" },
  
    // Voltage Harmonics
  { value: "L1_volt_harmonic", label: "L1 Voltage Harmonics", color: "rgb(255, 99, 71)" },
  { value: "L2_volt_harmonic", label: "L2 Voltage Harmonics", color: "rgb(255, 140, 0)" },
  { value: "L3_volt_harmonic", label: "L3 Voltage Harmonics", color: "rgb(255, 69, 0)" },

  // Current Harmonics
  { value: "L1_curr_harmonic", label: "L1 Current Harmonics", color: "rgb(0, 206, 209)" },
  { value: "L2_curr_harmonic", label: "L2 Current Harmonics", color: "rgb(72, 209, 204)" },
  { value: "L3_curr_harmonic", label: "L3 Current Harmonics", color: "rgb(32, 178, 170)" },

  // Power Factor
  { value: "L1_power_factor", label: "L1 Power Factor", color: "rgb(128, 128, 128)" },
  { value: "L2_power_factor", label: "L2 Power Factor", color: "rgb(169, 169, 169)" },
  { value: "L3_power_factor", label: "L3 Power Factor", color: "rgb(192, 192, 192)" },

   // Power (Newly Added)
   { value: "L1_power", label: "L1 Power", color: "rgb(255, 0, 0)" }, // Red
   { value: "L2_power", label: "L2 Power", color: "rgb(255, 69, 0)" }, // Orange-Red
   { value: "L3_power", label: "L3 Power", color: "rgb(255, 140, 0)" }, // Dark Orange
   { value: "total_power", label: "Total Power", color: "rgb(255, 165, 0)" }, // Lighter Orange
  ];
  

  const PowerDropdown = ({ onPowerChange, onPhaseChange }) => {
    const [selectedPower, setSelectedPower] = useState(powerOptions[0]); // Default to Solar
    const [selectedPhases, setSelectedPhases] = useState(
      phaseOptions.filter(phase => powerOptions[0].dataKeys.includes(phase.value))
    );
    const [isOpen, setIsOpen] = useState(false);
  
    // Available phases based on selected power option
    const availablePhases = phaseOptions.filter(phase => selectedPower.dataKeys.includes(phase.value));
  
    // Reset selected phases when power source changes
    useEffect(() => {
      if (selectedPower.value === "Grid") {
        setSelectedPhases([phaseOptions.find(phase => phase.value === "total_power")]); // Only L1_voltage selected
      } else {
        setSelectedPhases([]);
      }
      onPhaseChange(selectedPhases); // Update parent state
    }, [selectedPower]);
  
    // Handle power selection (Single Select)
    const handlePowerChange = (option) => {
      setSelectedPower(option);
      setIsOpen(false); // Close dropdown
  
      if (option.value === "Grid") {
        // When Grid is selected, set only L1_voltage as default
        setSelectedPhases([phaseOptions.find(phase => phase.value === "total_power")]);
        onPhaseChange([phaseOptions.find(phase => phase.value === "total_power")]);
      } else {
        // Clear selected phases when other power sources are chosen
        setSelectedPhases([]);
        onPhaseChange([]);
      }
  
      onPowerChange(option);
    };
  
    // Handle manual phase selection (Multi-Select)
    const handlePhaseChange = (selected) => {
      setSelectedPhases(selected);
      onPhaseChange(selected);
    };
  
    return (
      <div className="flex items-center space-x-4">
        {/* Power Source Single Select */}
        <div className="relative inline-block w-34">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 border-gray-300 border shadow-md rounded-md text-gray-700"
          >
            <div className="flex items-center">
              {selectedPower.icon}
              <span className="ml-2">{selectedPower.label}</span>
            </div>
            <FaChevronDown />
          </button>
  
          {isOpen && (
            <div className="absolute left-0 w-full mt-1 bg-gray-50 border-gray-300 border shadow-md rounded-md z-50">
              {powerOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handlePowerChange(option)}
                  className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
  
        {/* MultiSelect for Phases */}
        <Select
  options={availablePhases}
  isMulti
  value={selectedPhases}
  onChange={handlePhaseChange}
  getOptionLabel={(e) => (
    <div className="flex items-center bg-transparent">
      <span
        className="w-3 h-3 rounded-full mr-2"
        style={{ backgroundColor: e.color, fontWeight: "bold" }}
      ></span>
      {e.label}
    </div>
  )}
  getOptionValue={(e) => e.value}
  className="w-100 bg-gray-50 border-gray-300 border shadow-md rounded-md text-gray-700"
  styles={{
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "white", // Change background to white
      "&:hover": {
        border: "red",
        color: "white",
      },
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "black", // Ensure text remains visible
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "black",
      "&:hover": {
        backgroundColor: "red",
        color: "white",
      },
    }),
  }}
/>


      </div>
    );
  };
  
  export default PowerDropdown;
  
