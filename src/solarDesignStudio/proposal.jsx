import React, { useState, useEffect } from 'react';
import { FaHouseChimney } from "react-icons/fa6";
import { BsBuildingsFill } from "react-icons/bs";

const options = [
  { key: "residential", label: "Residential", Icon: FaHouseChimney },
  { key: "commercial",  label: "Commercial",  Icon: BsBuildingsFill  },
];

const OptionButton = ({ option, selectedOption, onSelect }) => {
  const { key, label, Icon } = option;
  const isSelected = selectedOption === key;

  return (
    <button
      onClick={() => onSelect(label)}
      className={`
        border font-medium px-4 py-3 rounded-md flex-1 flex items-center justify-center
        ${isSelected ? "bg-black text-white" : "bg-white text-black"}
      `}
    >
      <Icon className="mr-2" /> {label}
    </button>
  );
};

const SolarProposal = ({ updateData, selectedType }) => {
  const [selectedOption, setSelectedOption] = useState(
    selectedType?.toLowerCase() || null
  );

  // Keep local state in sync if parent’s selectedType changes
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
<div className="w-full max-w-10/12
                grid grid-cols-1 gap-8
                md:grid-cols-2 md:grid-rows-2">
  {/* 1) Heading */}
  <div className="md:col-start-2 md:row-start-1">
    <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15">
      Solar Design Studio
    </h2>
    <h2 className="text-4xl font-medium mb-8">
      Get a personalized solar proposal instantly
    </h2>
  </div>

  {/* 2) Image */}
  <div className="flex justify-center items-center
                  md:col-start-1 md:row-start-1 md:row-span-2">
    <div className="w-full h-70 bg-gray-300 rounded-lg border-2 mb-8 md:mb-0 flex justify-center items-center">
      {/* Image Placeholder */}
    </div>
  </div>

  {/* 3) Question + Buttons */}
  <div className="md:col-start-2 md:row-start-2">
    <p className="mt-4 text-2xl font-medium mb-8">
      I’m looking to get solar for:
    </p>
    <div className="mt-2 flex space-x-4 justify-center">
      {options.map(opt => (
        <OptionButton
          key={opt.key}
          option={opt}
          selectedOption={selectedOption}
          onSelect={handleSelection}
        />
      ))}
    </div>
  </div>
</div>

  );
};

export default SolarProposal;
