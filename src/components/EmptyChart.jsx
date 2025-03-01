import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaSun, FaBolt, FaBatteryFull, FaChevronDown } from "react-icons/fa";

const sampleData = [
  { timestamp: 1740700800, voltages_avg: { L1: 220.5, L2: 220.7, L3: 221.0 } },
  { timestamp: 1740704400, voltages_avg: { L1: 220.8, L2: 220.6, L3: 220.9 } },
  { timestamp: 1740708000, voltages_avg: { L1: 221.0, L2: 220.8, L3: 221.1 } },
  { timestamp: 1740711600, voltages_avg: { L1: 220.9, L2: 220.7, L3: 221.0 } },
  { timestamp: 1740715200, voltages_avg: { L1: 220.6, L2: 220.4, L3: 220.8 } },
  { timestamp: 1740718800, voltages_avg: { L1: 220.7, L2: 220.6, L3: 220.9 } },
  { timestamp: 1740722400, voltages_avg: { L1: 220.1, L2: 220.8, L3: 221.2 } },
  { timestamp: 1740726000, voltages_avg: { L1: 220.8, L2: 220.9, L3: 220.7 } },
  { timestamp: 1740729600, voltages_avg: { L1: 220.6, L2: 220.7, L3: 220.8 } },
  { timestamp: 1740733200, voltages_avg: { L1: 220.5, L2: 220.4, L3: 220.7 } },
  { timestamp: 1740740400, voltages_avg: { L1: 220.9, L2: 220.7, L3: 221.2 } },
  { timestamp: 1740744000, voltages_avg: { L1: 221.1, L2: 220.9, L3: 221.3 } },
  { timestamp: 1740747600, voltages_avg: { L1: 221.0, L2: 220.8, L3: 221.1 } },
  { timestamp: 1740751200, voltages_avg: { L1: 220.8, L2: 220.6, L3: 220.9 } },
  { timestamp: 1740754800, voltages_avg: { L1: 220.7, L2: 220.4, L3: 220.8 } },
  
  { timestamp: 1740672000, voltages_avg: { L1: 220.6, L2: 220.5, L3: 220.7 } },
  { timestamp: 1740675600, voltages_avg: { L1: 220.9, L2: 220.7, L3: 220.8 } },
  // { timestamp: 1740679200, voltages_avg: { L1: 221.1, L2: 220.8, L3: 221.0 } },
  { timestamp: 1740682800, voltages_avg: { L1: 220.8, L2: 220.9, L3: 220.7 } },
  { timestamp: 1740686400, voltages_avg: { L1: 220.6, L2: 220.7, L3: 220.8 } }
];


const Chart3 = () => {
  const [timeframe, setTimeframe] = useState("Hourly");
  const [dataType, setDataType] = useState("Solar");

  // Process data for the chart
  // const chartData = sampleData.map((entry) => ({
  //   timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(undefined, {
  //     hour: "numeric",
  //     minute: "2-digit",
  //     hour12: true,
  //   }),
  //   L1: entry.voltages_avg.L1,
  //   L2: entry.voltages_avg.L2,
  //   L3: entry.voltages_avg.L3,
  // }));

  // Compute min and max for Y-axis
  const { minY, maxY } = useMemo(() => {
    let allValues = sampleData.flatMap(d => Object.values(d.voltages_avg));
    return {
      minY: Math.min(...allValues) - 0.2, // Slight padding for visibility
      maxY: Math.max(...allValues) + 0.2,
    };
  }, [sampleData]);

  const filteredChartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
  
    return sampleData
      .filter(entry => {
        const entryDate = new Date(entry.timestamp * 1000);
        return entryDate.toDateString() === today.toDateString();
      })
      .sort((a, b) => a.timestamp - b.timestamp) // Ensure sorting by timestamp
      .map(entry => ({
        timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        L1: entry.voltages_avg.L1,
        L2: entry.voltages_avg.L2,
        L3: entry.voltages_avg.L3,
      }));
  }, [sampleData]);
  

  const todayDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const options = [
    { value: "Solar", label: "Solar", icon: <FaSun className="text-yellow-500 mr-2" /> },
    { value: "Grid", label: "Grid", icon: <FaBolt className="text-blue-500 mr-2" /> },
    { value: "Battery", label: "Battery", icon: <FaBatteryFull className="text-green-500 mr-2" /> },
  ];
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-11/12 bg-white p-6 rounded-lg shadow-lg h-[80vh] flex flex-col">
    {/* Display today's date */}
    <div className="text-lg font-semibold text-gray-700 text-center mb-4">
      {todayDate}
    </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        {/* Dropdown */}
        <div className="relative inline-block w-34">
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
          {["Hourly", "Daily", "Monthly", "Yearly"].map((label) => (
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
          <AreaChart  data={filteredChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="black" strokeOpacity={0.2}/>
            <XAxis dataKey="timestamp" stroke="black"/>
            <YAxis stroke="black" domain={[minY, maxY]} tickLine={true} axisLine={true} />
            <Tooltip />
            <Area type="monotone" dataKey="L1" stroke="rgb(205, 0, 0)" fill="rgba(205, 0, 0, 0.3)" strokeWidth={2} dot={{ r: 2 }} />
            <Area type="monotone" dataKey="L2" stroke="rgb(0, 78, 246)" fill="rgba(0, 78, 246, 0.2)"  strokeWidth={2} dot={{ r: 2 }} />
            <Area type="monotone" dataKey="L3" stroke="rgb(0, 172, 14)" fill="rgba(0, 172, 14, 0.2)" strokeWidth={2} dot={{ r: 2 }} />
          </AreaChart >
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart3;
