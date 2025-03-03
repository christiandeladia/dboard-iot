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


      // Compute min and max for Y-axis
      const { minY, maxY } = useMemo(() => {
      
        // Helper function to extract all L1, L2, and L3 values
        const getAllValues = (data) => {
          return data.flatMap(item => [item.L1, item.L2, item.L3]);
        };
      
        let allValues = [];
      
        switch (timeframe) {
          case "Day":
            const today = new Date();
            today.setHours(0, 0, 0, 0);
      
            allValues = data
              .filter(entry => {
                const entryDate = new Date(entry.timestamp * 1000);
                return entryDate.toDateString() === today.toDateString();
              })
              .flatMap(entry => Object.values(entry.voltages_avg));
            break;
      
          case "Month":
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const dailyData = groupAndAverage(data, (item) => {
              const date = new Date(item.timestamp * 1000);
              return date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
            })
            .filter(entry => {
              const date = new Date(entry.timestamp);
              return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            });
            
            allValues = getAllValues(dailyData);
            break;
      
          case "Year":
            const thisYear = new Date().getFullYear();
            const monthlyData = groupAndAverage(data, (item) => {
              const date = new Date(item.timestamp * 1000);
              return date.toLocaleDateString(undefined, {
                month: "long",
              });
            })
            .filter(entry => {
              const date = new Date(`01 ${entry.timestamp} ${thisYear}`);
              return date.getFullYear() === thisYear;
            });
            
            allValues = getAllValues(monthlyData);
            break;
      
          default:
            allValues = data.flatMap(entry => Object.values(entry.voltages_avg));
        }
      
        const min = Math.min(...allValues) - 0.2;
        const max = Math.max(...allValues) + 0.2;
      
        return {
          minY: parseFloat(min.toFixed(1)), // Limit to 1 decimal place
          maxY: parseFloat(max.toFixed(1)), // Limit to 1 decimal place
        };
      }, [data, timeframe]);
      
    
    // Filter and group data by timeframe
    const filteredChartData = useMemo(() => {
      if (!data.length) return [];
    
      let startTimestamp, endTimestamp;
    
      if (selectedDates && selectedDates.length === 2) {
        const startDate = new Date(selectedDates[0] * 1000); // Convert to JS Date
        const endDate = new Date(selectedDates[1] * 1000);
    
        // Ensure we cover the entire day
        startTimestamp = Math.floor(startDate.setHours(0, 0, 0, 0) / 1000);
        endTimestamp = Math.floor(endDate.setHours(23, 59, 59, 999) / 1000);
      } else {
        // Default to today's data if no range is selected
        const today = new Date();
        startTimestamp = Math.floor(today.setHours(0, 0, 0, 0) / 1000);
        endTimestamp = Math.floor(today.setHours(23, 59, 59, 999) / 1000);
      }
    
      // Filter data within the full date range
      const filteredData = data.filter(
        entry => entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp
      );
    
      // Apply grouping based on timeframe selection
      switch (timeframe) {
        case "Day":
          return filteredData
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(entry => ({
              timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString("en-PH", {
                timeZone: "Asia/Manila",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              timestamp_unix: entry.timestamp,
              L1: entry.voltages_avg.L1,
              L2: entry.voltages_avg.L2,
              L3: entry.voltages_avg.L3,
            }));
    
        case "Month":
          return groupAndAverage(filteredData, (item) => {
            const date = new Date(item.timestamp * 1000);
            return date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
          }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
        case "Year":
          return groupAndAverage(filteredData, (item) => {
            const date = new Date(item.timestamp * 1000);
            return date.toLocaleDateString(undefined, { month: "long" });
          });
    
        default:
          return filteredData;
      }
    }, [data, timeframe, selectedDates]);

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
      {filteredChartData.length === 0 ? (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-600 text-lg font-semibold">No Data Found</p>
    </div>
  ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredChartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="black"
              strokeOpacity={0.2}
            />
            <XAxis
            dataKey="timestamp"
            minTickGap={40}
            stroke="black"
            />

            <YAxis
              stroke="black"
              domain={[minY, maxY]}
              tickLine={true}
              axisLine={true}
            />
           <Tooltip content={<CustomTooltip timeframe={timeframe} />} />
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
          )}
      </div>

    </div>
  );
};

export default MainChart;
