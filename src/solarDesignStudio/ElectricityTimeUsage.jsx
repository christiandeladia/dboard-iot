import React, { useState, useEffect } from 'react';
import { FaArrowRight } from "react-icons/fa6";
import DailyEnergyChart from "./chart/DailyEnergyChart";
import { AiOutlineClose } from "react-icons/ai";
import DraggableAreaChart from './chart/DraggableAreaChart';

const ElectricityTimeUsage = ({ updateData, selectedUsage: propUsage }) => {
  const [selectedUsage, setSelectedUsage] = useState(propUsage || "Day time");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    updateData("usage", selectedUsage); // save default on load
  }, []);

  const handleUsageChange = (option) => {
    setSelectedUsage(option);
    updateData("usage", option);
  };

  return (
    <div className="w-full max-w-10/12">
                  <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left">
                Solar Design Studio
            </h2>
      <h2 className="text-4xl font-medium mb-8">
        What time you use electricity is very important.
      </h2>
      
      <p className="text-[0.75rem] text-center text-gray-400 tracking-tight mt-2 mb-2 w-full">
        You mainly use your electricity during working hours.
      </p>
      
      {/* Pass the selectedUsage to the chart */}
      <DailyEnergyChart selectedUsage={selectedUsage} />
      
      {/* <p className="text-[0.85rem] text-end text-blue-800 tracking-tight mt-2 mb-8 w-full">
        Adjust Daily Energy Pattern <FaArrowRight className="inline-block" />
      </p> */}
            <button
              onClick={() => setShowModal(true)}
              className="text-[0.85rem] text-end text-blue-800 tracking-tight mt-2 mb-8 w-full flex items-center justify-end"
            >
              Adjust Daily Energy Pattern <FaArrowRight className="inline-block ml-1" />
            </button>

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

            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
                <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-y-auto shadow-lg transition-transform transform translate-y-0">
                <div className="mb-6 flex justify-between  p-6 pb-0">
                  <h3 className="text-lg font-bold">Adjust Daily Energy Pattern</h3>
                  <button
                      className="text-blue-600 underline"
                      onClick={() => setShowModal(false)}
                    >
                      <AiOutlineClose className='text-black' />
                    </button>
                  </div>
                  {/* You can put a chart, sliders, or interactive options here */}
                  < DraggableAreaChart selectedUsage="Day time" />
                  {/* <div className="w-full h-40 bg-gray-300 mb-8 rounded-lg border-2 flex justify-center items-center">
                  </div> */}
      
                </div>
              </div>
            )}
    </div>
  );
};

export default ElectricityTimeUsage;
