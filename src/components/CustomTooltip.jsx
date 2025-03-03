import React from "react";

const CustomTooltip = ({ active, payload, timeframe }) => {
  if (!active || !payload || payload.length === 0) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) {
    console.log("❌ No valid data found in payload:", payload);
    return null;
  }

  let formattedDate;

  // ✅ Explicitly check `timeframe` to decide timestamp formatting
  if (timeframe === "Day" && dataPoint.timestamp_unix) {
    formattedDate = new Date(dataPoint.timestamp_unix * 1000).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else if (timeframe === "Month" && dataPoint.timestamp) {
    formattedDate = dataPoint.timestamp; // ✅ Use precomputed timestamp for Month
  } else if (timeframe === "Year" && dataPoint.timestamp) {
    formattedDate = dataPoint.timestamp; // ✅ Use precomputed timestamp for Year
  } else {
    formattedDate = "Unknown Date"; // 🚨 Prevents undefined values
  }

  return (
    <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
      <p className="text-gray-700 font-semibold">{formattedDate}</p>
      {payload.map((item, index) => (
        <p key={index} className="text-gray-600">
          <span className="font-semibold" style={{ color: item.color }}>
            {item.name}
          </span>
          : {item.value} V
        </p>
      ))}
    </div>
  );
};

export default CustomTooltip;
