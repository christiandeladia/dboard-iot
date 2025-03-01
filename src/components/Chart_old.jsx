import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaSun, FaBolt, FaBatteryFull, FaChevronDown  } from "react-icons/fa";

const LineChartComponent = () => {
  const [timeframe, setTimeframe] = useState("Monthly");
  const [dataType, setDataType] = useState("Solar");

  // Sample Chart Data
  const chartData = [
    { month: "Jan", sales: 3000 },
    { month: "Feb", sales: 4500 },
    { month: "Mar", sales: 3200 },
    { month: "Apr", sales: 5000 },
    { month: "May", sales: 7000 },
    { month: "Jun", sales: 6200 },
  ];

  const options = [
    { value: "Solar", label: "Solar", icon: <FaSun className="text-yellow-500 mr-2" /> },
    { value: "Grid", label: "Grid", icon: <FaBolt className="text-blue-500 mr-2" /> },
    { value: "Battery", label: "Battery", icon: <FaBatteryFull className="text-green-500 mr-2" /> },
  ];
  const [selectedOption, setSelectedOption] = useState(options[0]); // Default: Solar
  const [isOpen, setIsOpen] = useState(false);

  return (
<div className="w-full max-w-11/12 bg-white p-6 rounded-lg shadow-lg h-[80vh] flex flex-col">
    {/* Controls */}
    <div className="flex justify-between items-center mb-4">
      {/* Dropdown */}
      <div className="relative inline-block w-34">
      {/* Button to Show Selected Option */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 border rounded-md bg-white text-gray-700"
      >
        <div className="flex items-center">
          {selectedOption.icon}
          <span>{selectedOption.label}</span>
        </div>
        <FaChevronDown />
      </button>

      {/* Custom Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 w-full mt-1 bg-white border rounded-md shadow-lg z-50">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                setSelectedOption(option);
                setIsOpen(false);
              }}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {option.icon}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>


      <div className="inline-flex border border-gray-300 rounded-md overflow-hidden">
        {["Hourly", "Daily", "Monthly", "Yearly"].map((label, index) => (
          <button
            key={label}
            onClick={() => setTimeframe(label)}
            className={`px-4 py-2 text-sm font-medium border-r last:border-0 transition-all 
              ${timeframe === label ? "bg-blue-600 text-white" : "bg-white text-gray-900 hover:bg-gray-100"}`}
          >
            {label}
          </button>
        ))}
      </div>

  </div>

  {/* Chart Container */}
  <div className="flex-1">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="black" />
        <XAxis dataKey="month" stroke="black" />
        <YAxis stroke="black" />
        <Tooltip />
        <Line type="monotone" dataKey="sales" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
  
</div>

  );
};

export default LineChartComponent;
