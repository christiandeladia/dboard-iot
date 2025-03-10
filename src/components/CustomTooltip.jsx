import React from "react";

// Map each data key to a solid base color
const phaseBaseColorMapping = {
  L1_voltage: "rgb(0, 102, 255)",
  L2_voltage: "rgb(51, 153, 255)",
  L3_voltage: "rgb(102, 204, 255)",
  L1_current: "rgb(255, 153, 0)",
  L2_current: "rgb(255, 204, 51)",
  L3_current: "rgb(255, 255, 102)",
  L1_frequency: "rgb(0, 153, 76)",
  L2_frequency: "rgb(51, 204, 102)",
  L3_frequency: "rgb(102, 255, 153)",
  L1_volt_harmonic: "rgb(255, 99, 71)",
  L2_volt_harmonic: "rgb(255, 140, 0)",
  L3_volt_harmonic: "rgb(255, 69, 0)",
  L1_curr_harmonic: "rgb(0, 206, 209)",
  L2_curr_harmonic: "rgb(72, 209, 204)",
  L3_curr_harmonic: "rgb(32, 178, 170)",
  L1_power_factor: "rgb(128, 128, 128)",
  L2_power_factor: "rgb(169, 169, 169)",
  L3_power_factor: "rgb(192, 192, 192)",
  L1_power: "rgb(255, 0, 0)",
  L2_power: "rgb(255, 69, 0)",
  L3_power: "rgb(255, 140, 0)",
  total_power: "rgb(255, 165, 0)",
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
    <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
      <p className="text-gray-700 font-semibold">{formattedDate}</p>
      {payload.map((item, index) => {
        let unit = "V"; // Default unit
        if (item.name.includes("current")) unit = "A";
        if (item.name.includes("frequency")) unit = "Hz";
        if (item.name.includes("power_factor")) unit = "PF";
        if (item.name.includes("curr_harmonic") || item.name.includes("volt_harmonic"))
          unit = "%";
        if (item.name.includes("_power")) unit = "kW";

        // Look up the base color from our mapping.
        // Ensure that item.name matches the keys in phaseBaseColorMapping.
        const indicatorColor = phaseBaseColorMapping[item.name] || "black";

        return (
          <p key={index} className="text-gray-600 flex items-start flex-col leading-tight pt-2">
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
              <span className="font-semibold text-sm">{item.name} ({unit})</span>
            </span>
            <span className="font-bold">{item.value}</span>
          </p>

        );
      })}
    </div>
  );
};

export default CustomTooltip;
