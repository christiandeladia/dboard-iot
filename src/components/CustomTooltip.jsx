import React from "react";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) {
    console.log("❌ No valid data found in payload:", payload);
    return null;
  }

  let formattedDate;

  if (dataPoint.timestamp_unix) {
    // For single-day data, display full date/time (including weekday)
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
    // For grouped data:
    if (/^\d{4}-\d{2}$/.test(dataPoint.timestamp)) {
      // Group key is in "YYYY-MM" format: display as "Month Year"
      const [year, month] = dataPoint.timestamp.split("-");
      const dateObj = new Date(year, parseInt(month, 10) - 1);
      formattedDate = dateObj.toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
      });
    } else {
      // Otherwise, assume the grouping key is in "MMM dd" format (e.g. "Aug 12")
      const parsed = new Date(dataPoint.timestamp);
      if (isNaN(parsed.getTime())) {
        formattedDate = dataPoint.timestamp;
      } else {
        formattedDate = parsed.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
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

        return (
          <p key={index} className="text-gray-600">
            <span className="font-semibold" style={{ color: item.color }}>
              {item.name}
            </span>
            : {item.value} {unit}
          </p>
        );
      })}
    </div>
  );
};

export default CustomTooltip;
