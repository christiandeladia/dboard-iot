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
import { Container, SectionHeader, SectionMedia, SectionContent } from "./shared/Layout";


const ElectricityTimeUsage = ({ updateData, selectedUsage: propUsage, computedSliderMax }) => {
  const [selectedUsage, setSelectedUsage] = useState(propUsage || "Day time");
  const [showChartModal, setShowChartModal] = useState(false);
  const [shake, setShake] = useState(false);
  
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
    updateData("electricityData", dailyPattern);
  }, []);

  const handleUsageChange = (option) => {
    setSelectedUsage(option);
    updateData("usage", option);
    // Update dailyPattern dynamically based on the new selection.
    const newPattern = getDefaultPattern(option);
    // Update local state.
    setDailyPattern(newPattern);
    // Also update parent's state for electricityData.
    updateData("electricityData", newPattern);
  };

  // When the modal chart is changed, update the state.
  const handleChartUpdate = (newData) => {
    setDailyPattern(newData);
   updateData("electricityData", newData);
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

  // Compute the total daily consumption using the current dailyPattern.
  const totalConsumptionRaw = dailyPattern.reduce((acc, val) => acc + val, 0);
  const totalConsumption = totalConsumptionRaw.toFixed(1);

    // Function to trigger shake animation.
    const triggerShake = () => {
      console.log("onMaxDrag triggered: Maximum value reached");
      setShake(true);
      setTimeout(() => {
        setShake(false);
      }, 300); // Duration should match the CSS animation duration (0.3s here)
    };

  return (
    <Container>
      <SectionHeader>
        <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 md:mt-0 text-left">
          Solar Design Studio
        </h2>
        <h2 className="text-4xl font-medium mb-8 md:mb-0">
          What time you use electricity is very important.
        </h2>
      </SectionHeader>

      {/* Static chart (not draggable) */}
      <SectionMedia>
      <p className="text-[0.75rem] text-center text-gray-400 tracking-tight mt-2 md:mt-0 mb-2 w-full">
          You mainly use your electricity during working hours.
        </p>
        <DailyEnergyChart 
          data={dailyPattern} 
          draggable={false} 
          sliderMax={computedSliderMax} 
          usage={selectedUsage}  // Pass current usage so the chart can adjust if needed.
        />
        <div className="flex justify-end">
          <button
            onClick={() => setShowChartModal(true)}
            className="inline-flex items-center text-[0.85rem] text-blue-800 cursor-pointer"
          >
            Adjust Daily Energy Pattern
            <FaArrowRight className="ml-1" />
          </button>
        </div>

      </SectionMedia>

      {/* Usage Options */}
      <SectionContent>
        <p className="mt-4 md:mt-0 text-2xl font-medium mb-4">
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
      </SectionContent>



{showChartModal && (
  <div
    className="
      fixed inset-0 z-50
      flex justify-center items-end
      lg:items-center
    "
  >
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setShowChartModal(false)}
    />

    {/* Modal panel */}
    <div
      className="
        relative
        bg-white
        w-full
        rounded-t-2xl
        lg:rounded-2xl lg:max-w-lg
        max-h-[80vh] overflow-y-auto
        pb-6 p-6 shadow-lg
        animate-slide-up
      "
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Adjust Daily Energy Pattern</h3>
        <button onClick={() => setShowChartModal(false)}>
          <AiOutlineClose className="text-black text-2xl cursor-pointer" />
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-1 ps-6">
              Daily consumption:{" "}
              {totalConsumptionRaw === dailySliderMax ? (
                <span className={`text-green-600 font-semibold inline-block ${shake ? 'shake' : ''}`}>
                  {totalConsumption} kWh (Max)
                </span>
              ) : (
                <span className="text-red-500 font-bold">{totalConsumption}</span>
              )}
              {totalConsumptionRaw === dailySliderMax ? "" : `/${dailySliderMax} kWh`}
            </p>



            <DailyEnergyChart
              data={dailyPattern}
              draggable={true}
              onDataChange={handleChartUpdate} // updates local state and eventually parent's state
              sliderMax={computedSliderMax}
              usage={selectedUsage}
              onMaxDrag={triggerShake}
            />
    </div>
  </div>
)}

    </Container>
  );
};

export default ElectricityTimeUsage;
