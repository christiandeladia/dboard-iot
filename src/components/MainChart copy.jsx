import React, { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
import { FaSun, FaBolt, FaBatteryFull, FaChevronDown } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Config";
import DateRangePicker from "../components/DateRangePicker";
import CustomTooltip from "../components/CustomTooltip";
import { groupAndAverage, formatXAxis, } from "../utils/dataUtils";

const MainChart = ({ selectedPlant }) => {
  const [timeframe, setTimeframe] = useState("Day");
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [selectedDates, setSelectedDates] = useState(null);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedPlant) return;
      const querySnapshot = await getDocs(collection(db, "meter_monitor_day"));
      const fetchedData = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((entry) => entry.plant_id === selectedPlant); // Filter by selected plant

      setData(fetchedData);
    };

    fetchData();
  }, [selectedPlant]);


const filterAndGroupData = (data, timeframe) => {
    if (!data.length) return [];

    let groupedData;
    switch (timeframe) {
        case "Day":
          return filteredData.map(entry => ({
            timestamp_unix: entry.timestamp,
            formattedTime: new Date(entry.timestamp * 1000).toLocaleTimeString("en-PH", {
              timeZone: "Asia/Manila",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
            L1: entry.voltages_avg?.L1 ?? 0,
            L2: entry.voltages_avg?.L2 ?? 0,
            L3: entry.voltages_avg?.L3 ?? 0,
          }));
    
        case "Month":
          return groupAndAverage(filteredData, (item) => {
            const date = new Date(item.timestamp * 1000);
            return `${date.getFullYear()}-${date.getMonth() + 1}`; // Format as YYYY-MM
          }).map((entry) => ({
            ...entry,
            formattedTime: new Date(entry.timestamp_unix * 1000).toLocaleDateString("en-PH", { month: "short", year: "numeric" }),
            timestamp_unix: entry.timestamp,
          }));
    
        case "Year":
          return groupAndAverage(filteredData, (item) => {
            const date = new Date(item.timestamp * 1000);
            return `${date.getFullYear()}`;
          }).map((entry) => ({
            ...entry,
            formattedTime: new Date(entry.timestamp_unix * 1000).toLocaleDateString("en-PH", { year: "numeric" }),
            timestamp_unix: entry.timestamp,
          }));
    
        default:
          return filteredData;
    }

    return groupedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // ✅ Ensure sorted order after grouping
};
  
  
  // Helper function to determine date range
  const getDateRange = (selectedDates) => {
    let startTimestamp, endTimestamp;
  
    if (selectedDates?.length === 2) {
      const [start, end] = selectedDates.map(date => Math.floor(new Date(date * 1000).setHours(0, 0, 0, 0) / 1000));
      startTimestamp = start;
      endTimestamp = end + 86399; // Ensure full day coverage
    } else {
      const today = new Date();
      startTimestamp = Math.floor(today.setHours(0, 0, 0, 0) / 1000);
      endTimestamp = startTimestamp + 86400;
    }
  
    return { startTimestamp, endTimestamp };
  };
  const { startTimestamp, endTimestamp } = getDateRange(selectedDates);
      
  // Filter data within the selected date range
  const filteredData = data
    .filter(entry => entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp)
    .sort((a, b) => a.timestamp - b.timestamp); // ✅ Ensure sorted order
  
  // Main hook for processing filtered data
  const useFilteredChartData = (data, timeframe, selectedDates) => {
    return useMemo(() => {

  
      // Apply grouping based on timeframe
      let processedData = filterAndGroupData(filteredData, timeframe);
  
      // If processed data contains timestamps, ensure sorting
      if (processedData.length && processedData[0].timestamp_unix) {
        processedData = processedData.sort((a, b) => a.timestamp_unix - b.timestamp_unix);
      }
  
      return processedData;
    }, [data, timeframe, selectedDates]);
  };
  

// Main hook for computing min & max Y-axis values
 const useYAxisLimits = (data, timeframe) => {
    return useMemo(() => {
    if (!data.length) return { minY: 0, maxY: 0 };

    const getAllValues = (data) => data.flatMap(item => [item.L1, item.L2, item.L3]);

    let allValues = [];
    if (timeframe === "Day") {
        allValues = getAllValues(data);
    } else {
        const groupedData = filterAndGroupData(data, timeframe);
        allValues = getAllValues(groupedData);
    }

    const min = Math.min(...allValues) - 0.2;
    const max = Math.max(...allValues) + 0.2;
    return {
        minY: parseFloat(min.toFixed(1)),
        maxY: parseFloat(max.toFixed(1)),
    };
    }, [data, timeframe]);
};

const filteredChartData = useFilteredChartData(data, timeframe, selectedDates);
const { minY, maxY } = useYAxisLimits(filteredChartData, timeframe);

// power system dropdown values==============================================================
  const options = [
    { value: "Solar", label: "Solar", icon: <FaSun className="text-yellow-500 mr-2" /> },
    { value: "Grid", label: "Grid", icon: <FaBolt className="text-blue-500 mr-2" /> },
    { value: "Battery", label: "Battery", icon: <FaBatteryFull className="text-green-500 mr-2" /> },
  ];
  const [selectedOption, setSelectedOption] = useState(options[0]);

  
  return (
    <div className="w-full max-w-11/12 bg-white p-6 rounded-lg shadow-lg h-[80vh] flex flex-col">

      <div className="flex justify-between items-center mb-4">
         {/* Dropdown */}
         <div className="relative inline-block w-34">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 border-gray-300 border shadow-md rounded-md text-gray-700"
          >
            <div className="flex items-center">
              {selectedOption.icon}
              <span>{selectedOption.label}</span>
            </div>
            <FaChevronDown />
          </button>

          {isOpen && (
            <div className="absolute left-0 w-full mt-1 bg-gray-50 border-gray-300 border shadow-md rounded-md z-50">
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

        <div className="flex items-center space-x-4">
          <DateRangePicker onDateSelect={(dates) => setSelectedDates(dates)} />
        
            <div className="inline-flex border border-gray-300 rounded-md overflow-hidden">
            {["Day", "Month", "Year"].map((label) => (
                <button
                key={label}
                onClick={() => setTimeframe(label)}
                className={`px-4 py-2 text-sm font-medium border-r last:border-0 transition-all 
                    ${
                    timeframe === label
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-900 hover:bg-gray-100"
                    }`}
                >
                {label}
                </button>
            ))}
            </div>
        </div>

      </div>

      {/* <div className="text-lg font-semibold text-gray-700 text-center mb-4">
        Meter Monitoring - {selectedPlant ? `Plant: ${selectedPlant}` : "No Plant Selected"}
      </div> */}

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredChartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="black"
              strokeOpacity={0.2}
            />
            <XAxis
              dataKey="timestamp_unix"
              minTickGap={40}
              tickFormatter={(value) =>
                new Date(value * 1000).toLocaleTimeString("en-PH", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              }
              stroke="black"
            />
            <YAxis
              stroke="black"
              domain={[minY, maxY]}
              tickLine={true}
              axisLine={true}
            />
           <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="L1"
              stroke="rgb(205, 0, 0)"
              fill="rgba(205, 0, 0, 0.3)"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Area
              type="monotone"
              dataKey="L2"
              stroke="rgb(0, 78, 246)"
              fill="rgba(0, 78, 246, 0.2)"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Area
              type="monotone"
              dataKey="L3"
              stroke="rgb(0, 172, 14)"
              fill="rgba(0, 172, 14, 0.2)"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MainChart;
