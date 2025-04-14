import React, { useState, useEffect } from 'react';
import { FaArrowRight } from "react-icons/fa6";
import DailyEnergyChart from "./chart/DailyEnergyChart";
import { AiOutlineClose } from "react-icons/ai";
// Import the generator functions instead of the constant arrays.
import {
  generateNightTimeData,
  generateDayTimeData,
  generateTwentyFourSevenData,
} from "./chart/DailyEnergyChart";

const ElectricityTimeUsage = ({ updateData, selectedUsage: propUsage, computedSliderMax }) => {
  const [selectedUsage, setSelectedUsage] = useState(propUsage || "Day time");
  const [showChartModal, setShowChartModal] = useState(false);
  
  // Compute dailySliderMax from the monthly value (make it a whole number)
  const dailySliderMax = Math.round(computedSliderMax / 31);

  // Create a function that returns dynamic default patterns.
  const getDefaultPattern = (usage) => {
    if (usage === "Night time") return generateNightTimeData(dailySliderMax);
    if (usage === "24 Hours") return generateTwentyFourSevenData(dailySliderMax);
    return generateDayTimeData(dailySliderMax);
  };

  // Use dynamic default data if no manual pattern is provided.
  const [dailyPattern, setDailyPattern] = useState(getDefaultPattern(propUsage || "Day time"));

  // On mount, update parent's state with the usage selection.
  useEffect(() => {
    updateData("usage", selectedUsage);
  }, []);

  const handleUsageChange = (option) => {
    setSelectedUsage(option);
    updateData("usage", option);
    // Update dailyPattern dynamically based on the new selection.
    setDailyPattern(getDefaultPattern(option));
  };

  // When the modal chart is changed, update the state.
  const handleChartUpdate = (newData) => {
    setDailyPattern(newData);
  
    const pattern = analyzePattern(newData);
    if (pattern !== selectedUsage) {
      setSelectedUsage(pattern);
      updateData("usage", pattern);
    }
  };

  const analyzePattern = (data) => {
    const dayIndices = [3, 4, 5, 6, 7, 8];       // 6 AM to 6 PM
    const nightIndices = [9, 10, 11, 0, 1, 2];     // 6 PM to 6 AM
  
    const daySum = dayIndices.reduce((sum, i) => sum + (data[i] || 0), 0);
    const nightSum = nightIndices.reduce((sum, i) => sum + (data[i] || 0), 0);
  
    const total = daySum + nightSum;
  
    if (total === 0) return "Day time"; // Default fallback
  
    const dayRatio = daySum / total;
    const nightRatio = nightSum / total;
  
    if (dayRatio >= 0.6) return "Day time";
    if (nightRatio >= 0.6) return "Night time";
    return "24 Hours";
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full max-w-10/12 relative">
        <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left">
          Solar Design Studio
        </h2>
        <h2 className="text-4xl font-medium mb-8">
          What time you use electricity is very important.
        </h2>
        <p className="text-[0.75rem] text-center text-gray-400 tracking-tight mt-2 mb-2 w-full">
          You mainly use your electricity during working hours.
        </p>
      </div>

      {/* Static chart (not draggable) */}
      <div className="w-full max-w-10/12 relative mb-4">
        <DailyEnergyChart 
          data={dailyPattern} 
          draggable={false} 
          sliderMax={computedSliderMax} 
          usage={selectedUsage}  // Pass current usage so the chart can adjust if needed.
        />
        <button
          onClick={() => setShowChartModal(true)}
          className="text-[0.85rem] text-blue-800 flex items-center justify-end w-full"
        >
          Adjust Daily Energy Pattern <FaArrowRight className="inline-block ml-1" />
        </button>
      </div>

      {/* Usage Options */}
      <div className="w-full max-w-10/12 relative">
        <p className="mt-4 text-2xl font-medium mb-4">
          When do you mainly use your electricity?
        </p>
        <div className="mt-2 flex space-x-2 justify-center">
          {["Day time", "Night time", "24 Hours"].map((option) => (
            <button
              key={option}
              className={`border border-gray-500 px-1 py-2 rounded-md flex-1 cursor-pointer transition-all
                ${selectedUsage === option ? "bg-blue-500 text-white" : "bg-gray-100"}`}
              onClick={() => handleUsageChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="text-[0.75rem] text-gray-400 tracking-tight leading-tight mb-8 mt-4 text-left w-full max-w-10/12">
          This info gives us an understanding of how much you can save with the different types of systems available.
        </p>
      </div>

      {/* Modal */}
      {showChartModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowChartModal(false)}
          ></div>

          <div className="fixed bottom-0 left-0 right-0 bg-white z-50 pb-6 rounded-t-2xl max-h-[80vh] overflow-y-auto shadow-lg transition-transform transform translate-y-0">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h3 className="text-lg font-bold">Adjust Daily Energy Pattern</h3>

              <button onClick={() => setShowChartModal(false)}>
                <AiOutlineClose className="text-black text-2xl" />
              </button>
            </div>

            <DailyEnergyChart
              data={dailyPattern}
              draggable={true}
              onDataChange={handleChartUpdate} // updates local state and eventually parent's state
              sliderMax={computedSliderMax}
              usage={selectedUsage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ElectricityTimeUsage;
