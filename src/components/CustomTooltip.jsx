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

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) {
    console.log("❌ No valid data found in payload:", payload);
    return null;
  }

  let formattedDate;
  if (dataPoint.timestamp_unix) {
    formattedDate = new Date(dataPoint.timestamp_unix * 1000).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else if (dataPoint.timestamp) {
    if (/^\d{4}-\d{2}$/.test(dataPoint.timestamp)) {
      const [year, month] = dataPoint.timestamp.split("-");
      const dateObj = new Date(year, parseInt(month, 10) - 1);
      formattedDate = dateObj.toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
      });
    } else {
      const parsed = new Date(dataPoint.timestamp);
      formattedDate = isNaN(parsed.getTime())
        ? dataPoint.timestamp
        : parsed.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
    }
  } else {
    formattedDate = "Unknown Date";
  }

  return (
    <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg pointer-events-none">
      <p className="text-gray-700 font-semibold">{formattedDate}</p>
      {payload.map((item, index) => {
        // Use item.name (which should match the option value) to look up the option.
        const option = getPhaseOption(item.name);
        const displayLabel = option ? option.label : item.name;
        const indicatorColor = option ? option.color : "black";

        // Determine unit based on displayLabel.
        let unit = " ";
        const lowerLabel = displayLabel.toString().toLowerCase();
        if (lowerLabel.includes("current")) unit = "A";
        if (lowerLabel.includes("frequency")) unit = "Hz";
        if (lowerLabel.includes("voltage")) unit = "V";
        if (lowerLabel.includes("harmonic")) unit = "Hz";
        if (lowerLabel.includes("power") && !lowerLabel.includes("power factor")) unit = "kW";

        return (
          <p
            key={index}
            className="text-gray-600 flex items-start flex-col leading-tight pt-2"
          >
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
                {displayLabel} {unit}
              </span>
            </span>
            <span className="font-bold">{item.value.toFixed(2)}</span>
          </p>
        );
      })}
    </div>
  );
};

export default CustomTooltip;
