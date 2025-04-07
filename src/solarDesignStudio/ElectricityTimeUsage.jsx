import React, { useState } from 'react';
import { FaArrowRight } from "react-icons/fa6";
import DailyEnergyChart from "./chart/DailyEnergyChart";

const ElectricityTimeUsage = ({ updateData }) => {  
  // Default selected usage is "Daytime"
  const [selectedUsage, setSelectedUsage] = useState("Day time");

  const handleUsageChange = (option) => {
    setSelectedUsage(option);
    updateData("usage", option);
  };

  return (
    <div className="w-full max-w-10/12">
      <h2 className="text-4xl font-medium mb-8">
        What time you use electricity is very important.
      </h2>
      
      <p className="text-[0.75rem] text-center text-gray-400 tracking-tight mt-2 mb-2 w-full">
        You mainly use your electricity during working hours.
      </p>
      
      {/* Pass the selectedUsage to the chart */}
      <DailyEnergyChart selectedUsage={selectedUsage} />
      
      <p className="text-[0.85rem] text-end text-blue-800 tracking-tight mt-2 mb-8 w-full">
        Adjust Daily Energy Pattern <FaArrowRight className="inline-block" />
      </p>

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
  );
};

export default ElectricityTimeUsage;
