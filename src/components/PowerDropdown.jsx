import React, { useState } from "react";
import Select from "react-select";
import { FaChevronDown, FaChevronRight, FaSun, FaBolt, FaBatteryFull } from "react-icons/fa";

export const groupedPhaseOptions = [
  {
    label: (
      <div className="flex items-center">
        <span>Solar</span>
      </div>
    ),
    options: [],
  },
  {
    clickable: true,
    label: (
      <div className="flex items-center">
        <span>Grid</span>
      </div>
    ),
    options: [
      {
        label: "Voltage",
        options: [
          { value: "L1_voltage", label: "L1 Voltage", color: "rgb(0, 102, 255)" },
          { value: "L2_voltage", label: "L2 Voltage", color: "rgb(51, 153, 255)" },
          { value: "L3_voltage", label: "L3 Voltage", color: "rgb(102, 204, 255)" },
        ],
      },
      {
        label: "Current",
        options: [
          { value: "L1_current", label: "L1 Current", color: "rgb(255, 153, 0)" },
          { value: "L2_current", label: "L2 Current", color: "rgb(255, 204, 51)" },
          { value: "L3_current", label: "L3 Current", color: "rgb(255, 255, 102)" },
        ],
      },
      {
        label: "Frequency",
        options: [
          { value: "L1_frequency", label: "L1 Frequency", color: "rgb(0, 153, 76)" },
          { value: "L2_frequency", label: "L2 Frequency", color: "rgb(51, 204, 102)" },
          { value: "L3_frequency", label: "L3 Frequency", color: "rgb(102, 255, 153)" },
        ],
      },
      {
        label: "Voltage Harmonics",
        options: [
          { value: "L1_volt_harmonic", label: "L1 Voltage Harmonics", color: "rgb(255, 99, 71)" },
          { value: "L2_volt_harmonic", label: "L2 Voltage Harmonics", color: "rgb(255, 140, 0)" },
          { value: "L3_volt_harmonic", label: "L3 Voltage Harmonics", color: "rgb(255, 69, 0)" },
        ],
      },
      {
        label: "Current Harmonics",
        options: [
          { value: "L1_curr_harmonic", label: "L1 Current Harmonics", color: "rgb(0, 206, 209)" },
          { value: "L2_curr_harmonic", label: "L2 Current Harmonics", color: "rgb(72, 209, 204)" },
          { value: "L3_curr_harmonic", label: "L3 Current Harmonics", color: "rgb(32, 178, 170)" },
        ],
      },
      {
        label: "Power Factor",
        options: [
          { value: "L1_power_factor", label: "L1 Power Factor", color: "rgb(128, 128, 128)" },
          { value: "L2_power_factor", label: "L2 Power Factor", color: "rgb(169, 169, 169)" },
          { value: "L3_power_factor", label: "L3 Power Factor", color: "rgb(192, 192, 192)" },
        ],
      },
      {
        label: "Power",
        options: [
          { value: "L1_power", label: "L1 Power", color: "rgb(255, 0, 0)" },
          { value: "L2_power", label: "L2 Power", color: "rgb(255, 69, 0)" },
          { value: "L3_power", label: "L3 Power", color: "rgb(255, 140, 0)" },
          { value: "total_power", label: "Total Power", color: "rgb(255, 165, 0)" },
        ],
      },
    ],
  },
  {
    label: (
      <div className="flex items-center">
        <span>Battery</span>
      </div>
    ),
    options: [],
  },
];

const PowerDropdown = ({ onPhaseChange }) => {
  const defaultSelection =
    groupedPhaseOptions
      .flatMap((group) => group.options.flatMap((subGroup) => subGroup.options))
      .find((phase) => phase.value === "total_power") || null;
  const [selectedPhases, setSelectedPhases] = useState(
    defaultSelection ? [defaultSelection] : []
  );
  const [expandedSubGroups, setExpandedSubGroups] = useState({});

  const toggleSubGroup = (subGroupLabel) => {
    setExpandedSubGroups((prev) => ({
      ...prev,
      [subGroupLabel]: !prev[subGroupLabel],
    }));
  };

  // When a subgroup label (e.g., "Voltage") is clicked, add all its options to the selection.
  const handleSelectSubGroup = (subGroupOptions) => {
    // Add options that are not already selected.
    const newSelections = subGroupOptions.filter(
      (opt) => !selectedPhases.some((selected) => selected.value === opt.value)
    );
    const updatedSelections = [...selectedPhases, ...newSelections];
    setSelectedPhases(updatedSelections);
    if (onPhaseChange) {
      onPhaseChange(updatedSelections);
    }
  };

  const handlePhaseChange = (selected) => {
    setSelectedPhases(selected);
    onPhaseChange(selected);
  };

  // When the Grid header is clicked, reset the selection to only default (Total Power).
  const handleGridClick = () => {
    if (defaultSelection) {
      handlePhaseChange([defaultSelection]);
    }
  };

  // Custom MenuList renders a responsive layout.
  const CustomMenuList = () => {
    return (
      <div className="p-2 w-full" style={{ maxHeight: "500px", overflowY: "auto" }}>
        <div className="flex flex-wrap w-full">
          {groupedPhaseOptions.map((group, groupIdx) => (
            <div
              key={groupIdx}
              className="flex flex-col items-center w-full sm:w-1/3 p-2"
            >
              <div
                className={`text-lg font-semibold text-gray-800 flex items-left w-full px-5 ${
                  group.clickable ? "cursor-pointer hover:text-blue-600 hover:bg-gray-100 rounded" : ""
                }`}
                onClick={group.clickable ? handleGridClick : undefined}
              >
                {group.label}
              </div>
              {/* Vertical column for subgroups */}
              <div className="flex flex-col mt-1 space-y-1 w-full px-5">
                {group.options.map((subGroup) => (
                  <div key={subGroup.label} className="flex flex-col items-center w-full">
                    <div className="flex items-center text-md w-full justify-between">
                      {/* Label text: clicking this will select all subgroup options */}
                      <span
                        className="cursor-pointer hover:text-blue-600 hover:bg-gray-100 rounded w-full p-1"
                        onClick={() => handleSelectSubGroup(subGroup.options)}
                      >
                        {subGroup.label}
                      </span>
                      {/* Chevron: clicking this toggles the dropdown view */}
                      <span
                        className="cursor-pointer hover:bg-gray-100 rounded p-2"
                        onClick={() => toggleSubGroup(subGroup.label)}
                      >
                        {expandedSubGroups[subGroup.label] ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    </div>
                    {expandedSubGroups[subGroup.label] && (
                      <div className="flex flex-col mt-1 w-full">
                        {subGroup.options
                          .filter(
                            (option) =>
                              !selectedPhases.some(
                                (selected) => selected.value === option.value
                              )
                          )
                          .map((option) => (
                            <div
                              key={option.value}
                              className="cursor-pointer text-sm p-1 ps-3 hover:bg-gray-200 rounded w-full"
                              onClick={() =>
                                handlePhaseChange([...selectedPhases, option])
                              }
                            >
                              <div className="flex items-center">
                                <span
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: option.color }}
                                ></span>
                                {option.label}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #ccc",
      boxShadow: "none",
      "&:hover": { border: "1px solid #aaa" },
    }),
    valueContainer: (provided) => ({
      ...provided,
      maxHeight: "60px",
      display: "flex",
      flexWrap: "nowrap",
      overflowX: "auto",
      overflowY: "hidden",
      whiteSpace: "nowrap",
      scrollbarWidth: "thin",
    }),
    multiValue: (provided) => ({
      ...provided,
      display: "flex",
      backgroundColor: "#ededed",
      padding: "1px 2px",
      flexShrink: 0,
      maxWidth: "100%",
      overflow: "hidden",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      color: "black",
    }),
  };

  return (
    <div className="flex items-center space-x-4 w-200">
      <Select
        isMulti
        isSearchable={false}
        value={selectedPhases}
        onChange={handlePhaseChange}
        options={[]} // Options are rendered via CustomMenuList.
        styles={customStyles}
        components={{
          MenuList: CustomMenuList,
          IndicatorSeparator: () => null,
        }}
        placeholder="Select phases..."
        getOptionLabel={(e) =>
          e.color ? (
            <div className="flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: e.color }}
              ></span>
              {e.label}
            </div>
          ) : (
            e.label
          )
        }
        getOptionValue={(e) => e.value}
        className="w-full bg-white border-gray-200 border shadow-md rounded-md text-gray-700"
      />
    </div>
  );
};

export default PowerDropdown;
