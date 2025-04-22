import React, { useState, useEffect } from 'react';
import { FaHouseChimney } from "react-icons/fa6";
import { BsBuildingsFill } from "react-icons/bs";
import { Container, SectionHeader, SectionMedia, SectionContent } from "./shared/Layout";

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
    <Container>
      <SectionHeader>
        <h2 className="text-[1.25rem] text-gray-400 font-medium mb-3 mt-15 md:mt-0 ">
          Solar Design Studio
        </h2>
        <h2 className="text-4xl font-medium mb-8">
          Get a personalized solar proposal instantly
        </h2>
      </SectionHeader>

      <SectionMedia>
        <div className="w-full h-70 lg:h-120 bg-gray-300 rounded-lg border-2 mb-8 md:mb-0" />
      </SectionMedia>

      <SectionContent>
        <p className="mt-4 text-2xl font-medium mb-8">
          I’m looking to get solar for:
        </p>
        <div className="flex space-x-4 justify-center">
          {options.map(opt => {
            const isSelected = selectedOption === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => handleSelection(opt.label)}
                className={`
                  border font-medium px-4 py-3 rounded-md flex-1 flex items-center justify-center cursor-pointer
                  ${isSelected ? "bg-black text-white" : "bg-white text-black"}
                `}
              >
                <opt.Icon className="mr-2" /> {opt.label}
              </button>
            );
          })}
        </div>
      </SectionContent>
    </Container>
  );
};

export default SolarProposal;
