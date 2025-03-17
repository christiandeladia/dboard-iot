import React from "react";
import { groupedPhaseOptions } from "../components/PowerDropdown"; // adjust import path as needed

// Helper function to search for an option based on its value.
const getPhaseOption = (phaseValue) => {
  for (const group of groupedPhaseOptions) {
    if (group.options && group.options.length > 0) {
      for (const category of group.options) {
        if (category.options && category.options.length > 0) {
          for (const option of category.options) {
            if (option.value === phaseValue) {
              return option;
            }
          }
        }
      }
    }
  }
  return null;
};

// Build an ordered list of phase values based on groupedPhaseOptions.
const getOrderedPhaseValues = () => {
  const ordered = [];
  for (const group of groupedPhaseOptions) {
    if (group.options && group.options.length > 0) {
      for (const category of group.options) {
        if (category.options && category.options.length > 0) {
          for (const option of category.options) {
            ordered.push(option.value);
          }
        }
      }
    }
  }
  return ordered;
};

const orderedPhaseValues = getOrderedPhaseValues();

// This function extracts the base phase key used for lookup and sorting.
// For names with "||", we take the right-hand side.
// For names starting with "avg_", we remove the underscore and "avg" prefix.
const extractBasePhaseKey = (name) => {
  if (name.includes("||")) {
    return name.split("||")[1];
  } else if (name.startsWith("avg_")) {
    return name.slice(4); // remove "avg_"
  }
  return name;
};

const CustomDateTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const fixedTime = payload[0]?.payload.fixedTime || "";

  // Sort payload:
  // 1. Group items by the base phase key according to the order defined in orderedPhaseValues.
  // 2. Within the same phase, if one item is an average (name starts with "avg_"), place it on top.
  const sortedPayload = [...payload].sort((a, b) => {
    const baseA = extractBasePhaseKey(a.name);
    const baseB = extractBasePhaseKey(b.name);
    const orderA = orderedPhaseValues.indexOf(baseA);
    const orderB = orderedPhaseValues.indexOf(baseB);
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // For the same base phase, place the average item (with "avg_") on top.
    const aIsAvg = a.name.startsWith("avg_");
    const bIsAvg = b.name.startsWith("avg_");
    if (aIsAvg && !bIsAvg) return -1;
    if (!aIsAvg && bIsAvg) return 1;
    return 0;
  });

  return (
    <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
      <p className="text-gray-700 font-semibold">Time: {fixedTime}</p>
      {sortedPayload.map((item, index) => {
        // If the name contains "||", split into day and phase; otherwise, handle average case.
        const parts = item.name.split("||");
        const dayLabel = parts.length > 1 ? parts[0] : "";
        const isAverage = item.name.startsWith("avg_");
        // Use the base phase key for lookup.
        const baseKey = parts.length > 1 ? parts[1] : extractBasePhaseKey(item.name);
        const option = getPhaseOption(baseKey);
        // If this is an average item, prepend "avg " (and remove the underscore) to the option's label.
        const displayLabel = option
          ? isAverage
            ? `Average ${option.label}`
            : option.label
          : baseKey.replace(/_/g, " ");
          
        // Determine unit based on displayLabel.
        let unit = "V"; // default
        const lowerLabel = displayLabel.toLowerCase();
        if (lowerLabel.includes("current")) unit = "A";
        if (lowerLabel.includes("frequency")) unit = "Hz";
        if (lowerLabel.includes("power factor")) unit = "PF";
        if (lowerLabel.includes("harmonic")) unit = "%";
        if (lowerLabel.includes("power") && !lowerLabel.includes("power factor"))
          unit = "kW";

        // Use the option's color if available.
        const indicatorColor = option ? option.color : "black";

        return (
          <p key={index} className="text-gray-600 flex flex-col items-start leading-tight pt-2">
            <span className="flex items-center">
              <span
                style={{
                  backgroundColor: indicatorColor,
                  borderRadius: "20%",
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  marginRight: "5px",
                }}
              ></span>
              <span className="font-semibold text-sm">
                {dayLabel && <span>{dayLabel} - </span>}
                {displayLabel} ({unit})
              </span>
            </span>
            <span className="font-bold">{item.value.toFixed(2)}</span>
          </p>
        );
      })}
    </div>
  );
};

export default CustomDateTooltip;
