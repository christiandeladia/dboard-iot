import React, { useState } from "react";
import Select from "react-select";
import { FaChevronDown, FaChevronRight, FaSun, FaBolt, FaBatteryFull } from "react-icons/fa";

export const groupedPhaseOptions = [
  {
    label: (
      <div className="flex items-center">
        <FaSun className="text-yellow-500 mr-2" />
        <span>Solar</span>
      </div>
    ),
    options: [],
  },
  {
    label: (
      <div className="flex items-center">
        <FaBolt className="text-blue-500 mr-2" />
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
        <FaBatteryFull className="text-green-500 mr-2" />
        <span>Battery</span>
      </div>
    ),
    options: [],
  },
];

const PowerDropdown = ({ onPhaseChange }) => {
  const defaultSelection = groupedPhaseOptions
  .flatMap((group) => group.options.flatMap((subGroup) => subGroup.options))
  .find((phase) => phase.value === "total_power");
  const [selectedPhases, setSelectedPhases] = useState([defaultSelection]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedSubGroups, setExpandedSubGroups] = useState({});

  // Toggle main group (Group1)
  const toggleGroup = (groupLabel) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  // Toggle subgroup (Voltage, Current, Power)
  const toggleSubGroup = (subGroupLabel) => {
    setExpandedSubGroups((prev) => ({
      ...prev,
      [subGroupLabel]: !prev[subGroupLabel],
    }));
  };

  // Handle phase selection
  const handlePhaseChange = (selected) => {
    setSelectedPhases(selected);
    onPhaseChange(selected);
  };

  // Format options for react-select
  const formattedOptions = groupedPhaseOptions.flatMap((group) => [
    {
      value: group.label,
      label: (
        <div
          className="flex items-center justify-between font-semibold text-gray-800  cursor-pointer"
          onClick={() => toggleGroup(group.label)}
        >
          <span>{group.label}</span>
          {expandedGroups[group.label] ? <FaChevronDown /> : <FaChevronRight />}
        </div>
      ),
      isDisabled: true, // Prevent selection of main group
    },
    ...(expandedGroups[group.label]
      ? group.options.flatMap((subGroup) => [
          {
            value: subGroup.label,
            label: (
              <div
                className="flex items-center justify-between font-medium text-gray-700 cursor-pointer pl-8"
                onClick={() => toggleSubGroup(subGroup.label)}
              >
                <span>{subGroup.label}</span>
                {expandedSubGroups[subGroup.label] ? <FaChevronDown /> : <FaChevronRight />}
              </div>
            ),
            isDisabled: true, // Prevent selection of subgroup
          },
          ...(expandedSubGroups[subGroup.label] ? subGroup.options : []), // Show options if subgroup is expanded
        ])
      : []),
  ]);

 // Custom styles: remove hover for group labels, keep for L1, L2, L3
 const customStyles = {
  option: (provided, state) => {
    const isGroupLabel = state.data.isDisabled;
    return {
      ...provided,
      backgroundColor: isGroupLabel
        ? "transparent" // No hover for group labels
        : state.isFocused
        ? "#f0f0f0" // Light gray hover for selectable items (L1, L2, L3)
        : "white",
      color: "black",
      cursor: isGroupLabel ? "default" : "pointer",
      padding: isGroupLabel ? "6px 10px" : "8px 8px 8px 60px",
    };
  },
  valueContainer: (provided) => ({
    ...provided,
    maxHeight: "60px", // Prevent excessive height
    display: "flex",
    flexWrap: "nowrap", // Ensure items stay in a row
    overflowX: "auto", // Enable horizontal scrolling
    overflowY: "hidden",
    whiteSpace: "nowrap",
    scrollbarWidth: "thin", // Firefox support
  }),
  multiValue: (provided) => ({
    ...provided,
    display: "flex",
    backgroundColor: "white",
    flexShrink: 0, // Prevent items from shrinking
    maxWidth: "100%", // Allow content to take up space
    overflow: "hidden", // Prevent content overflow
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    overflow: "hidden",
    textOverflow: "ellipsis", // Prevent text cutoff
    whiteSpace: "nowrap", // Keep text in one line
    color: "black",
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "500px", // Limit dropdown height
    overflowY: "auto", // Enable vertical scrolling
  }),
  control: (provided) => ({
    ...provided,
    border: "1px solid #ccc",
    boxShadow: "none",
    "&:hover": {
      border: "1px solid #aaa",
    },
  }),
};

  return (
    <div className="flex items-center space-x-4">
      {/* Nested MultiSelect with Expandable Groups and Subgroups */}
      <Select
        isMulti
        value={selectedPhases}
        onChange={handlePhaseChange}
        options={formattedOptions}
        styles={customStyles}
        getOptionLabel={(e) =>
          e.color ? (
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: e.color }}></span>
              {e.label}
            </div>
          ) : (
            e.label
          )
        }
        getOptionValue={(e) => e.value}
        className="w-150 bg-white border-gray-200 border shadow-md rounded-md text-gray-700"
      />
    </div>
  );
};

export default PowerDropdown;
