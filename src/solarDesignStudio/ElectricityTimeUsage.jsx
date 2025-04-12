import React, { useState, useEffect } from 'react';
import { FaArrowRight } from "react-icons/fa6";
import DailyEnergyChart from "./chart/DailyEnergyChart";

const ElectricityTimeUsage = ({ updateData, selectedUsage: propUsage }) => {
  const [selectedUsage, setSelectedUsage] = useState(propUsage || "Day time");
  // dragEnabled controls if the chart is draggable.
  const [dragEnabled, setDragEnabled] = useState(false);

  useEffect(() => {
    updateData("usage", selectedUsage); // save default on load
  }, []);

  const handleUsageChange = (option) => {
    setSelectedUsage(option);
    updateData("usage", option);
  };
  const toggleDrag = () => {
    const newDragState = !dragEnabled;
    setDragEnabled(newDragState);
    // Update data when the button is clicked.
    updateData("usage", selectedUsage);
  };

  
  // Determine the container classes depending on dragEnabled.
  // When dragEnabled is true, the container becomes full width.
  const containerClasses = dragEnabled
    ? "relative z-50 p-4 bg-white w-full"
    : "relative z-50 w-full max-w-10/12 relative";

  return (
    <div className='flex flex-col justify-center items-center'>
      {/* When dragging is enabled, render a full-screen overlay */}
      {dragEnabled && (
        <div className="fixed inset-0 bg-black opacity-50 z-50"></div>
      )}
      

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

        <div className={containerClasses}>
          <DailyEnergyChart selectedUsage={selectedUsage} draggable={dragEnabled} />
          <button
            onClick={toggleDrag}
            className=" text-[0.85rem] text-blue-800 flex items-center justify-end w-full"
          >
            {dragEnabled ? "Done" : "Adjust Daily Energy Pattern"}
            <FaArrowRight className="inline-block ml-1" />
          </button>
        </div>

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

      </div>

  );
};


export default ElectricityTimeUsage;
