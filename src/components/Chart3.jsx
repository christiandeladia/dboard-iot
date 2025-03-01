import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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

  { timestamp: 1740787200, voltages_avg: { "L1": 220.7, "L2": 220.4, "L3": 220.8 } },
  { timestamp: 1735689600, voltages_avg: { "L1": 220.7, "L2": 220.4, "L3": 220.8 } },
  { "timestamp": 1740614400, "voltages_avg": { "L1": 220.7, "L2": 220.4, "L3": 220.8 } },

  {"timestamp": 1738800000, "voltages_avg": {"L1": 225.6, "L2": 219.7, "L3": 222.5}},
  {"timestamp": 1738886400, "voltages_avg": {"L1": 215.0, "L2": 227.2, "L3": 216.7}},
  {"timestamp": 1738972800, "voltages_avg": {"L1": 224.5, "L2": 219.8, "L3": 215.5}},
  {"timestamp": 1739059200, "voltages_avg": {"L1": 228.0, "L2": 227.1, "L3": 217.4}},
  {"timestamp": 1739145600, "voltages_avg": {"L1": 213.8, "L2": 224.4, "L3": 225.8}},
  {"timestamp": 1739232000, "voltages_avg": {"L1": 215.1, "L2": 216.1, "L3": 213.1}},
  {"timestamp": 1739318400, "voltages_avg": {"L1": 222.3, "L2": 217.8, "L3": 211.8}},
  {"timestamp": 1739404800, "voltages_avg": {"L1": 212.4, "L2": 218.3, "L3": 229.1}},
  {"timestamp": 1739491200, "voltages_avg": {"L1": 217.5, "L2": 213.5, "L3": 224.9}},
  {"timestamp": 1739577600, "voltages_avg": {"L1": 220.7, "L2": 224.3, "L3": 224.3}},
  {"timestamp": 1739664000, "voltages_avg": {"L1": 221.6, "L2": 223.0, "L3": 217.7}},
  {"timestamp": 1739750400, "voltages_avg": {"L1": 228.7, "L2": 211.3, "L3": 214.5}},
  {"timestamp": 1739836800, "voltages_avg": {"L1": 212.6, "L2": 217.4, "L3": 212.1}}



];

const Chart3 = () => {
  const [timeframe, setTimeframe] = useState("Hourly");
  const [selectedOption, setSelectedOption] = useState("Solar");
  const [isOpen, setIsOpen] = useState(false);



  const groupAndAverage = (data, getKey) => {
    const grouped = groupBy(data, getKey);
    const averagedData = Array.from(grouped.entries()).map(([key, values]) => {
      const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
      return {
        timestamp: key,
        L1: parseFloat(avg(values.map((v) => v.voltages_avg.L1)).toFixed(2)),
        L2: parseFloat(avg(values.map((v) => v.voltages_avg.L2)).toFixed(2)),
        L3: parseFloat(avg(values.map((v) => v.voltages_avg.L3)).toFixed(2)),
      };
    });
    return averagedData;
  };

  const groupBy = (data, keyGetter) => {
    const map = new Map();
    data.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  };
  // Compute min and max for Y-axis
  const { minY, maxY } = useMemo(() => {
  
    // Helper function to extract all L1, L2, and L3 values
    const getAllValues = (data) => {
      return data.flatMap(item => [item.L1, item.L2, item.L3]);
    };
  
    let allValues = [];
  
    switch (timeframe) {
      case "Hourly":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
  
        allValues = sampleData
          .filter(entry => {
            const entryDate = new Date(entry.timestamp * 1000);
            return entryDate.toDateString() === today.toDateString();
          })
          .flatMap(entry => Object.values(entry.voltages_avg));
        break;
  
      case "Daily":
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const dailyData = groupAndAverage(sampleData, (item) => {
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
  
      case "Monthly":
        const thisYear = new Date().getFullYear();
        const monthlyData = groupAndAverage(sampleData, (item) => {
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
  
      case "Yearly":
        const yearlyData = groupAndAverage(sampleData, (item) => {
          const date = new Date(item.timestamp * 1000);
          return `${date.getFullYear()}`;
        });
        
        allValues = getAllValues(yearlyData);
        break;
  
      default:
        allValues = sampleData.flatMap(entry => Object.values(entry.voltages_avg));
    }
  
    const min = Math.min(...allValues) - 0.2;
    const max = Math.max(...allValues) + 0.2;
  
    return {
      minY: parseFloat(min.toFixed(1)), // Limit to 1 decimal place
      maxY: parseFloat(max.toFixed(1)), // Limit to 1 decimal place
    };
  }, [sampleData, timeframe]);
  

  // Filter and group data by timeframe
  const filteredChartData = useMemo(() => {

  

    
  
    switch (timeframe) {
      case "Hourly":
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
  
          case "Daily":
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            return groupAndAverage(sampleData, (item) => {
              const date = new Date(item.timestamp * 1000);
              return date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
            })
            .filter(entry => {
              // const date = new Date(entry.timestamp);
              const date = new Date(`${entry.timestamp} ${currentYear}`);

              return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          
  
      case "Monthly":
        const thisYear = new Date().getFullYear();
        return groupAndAverage(sampleData, (item) => {
          const date = new Date(item.timestamp * 1000);
          return date.toLocaleDateString(undefined, {
            month: "long",
          });
        })
        .filter(entry => {
          const date = new Date(`01 ${entry.timestamp} ${thisYear}`);
          return date.getFullYear() === thisYear;
        })
        .sort((a, b) => 
          new Date(`01 ${a.timestamp} 2025`).getTime() - 
          new Date(`01 ${b.timestamp} 2025`).getTime()
        );
  
      case "Yearly":
        return groupAndAverage(sampleData, (item) => {
          const date = new Date(item.timestamp * 1000);
          return `${date.getFullYear()}`;
        }).sort((a, b) => a.timestamp - b.timestamp);
  
      default:
        return sampleData;
    }
  }, [sampleData, timeframe]);
  
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

  return (
    <div className="w-full max-w-11/12 bg-white p-6 rounded-lg shadow-lg h-[80vh] flex flex-col">
      {/* Display today's date */}
      <div className="text-lg font-semibold text-gray-700 text-center mb-4">
        {todayDate}
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="inline-flex border border-gray-300 rounded-md overflow-hidden">
          {["Hourly", "Daily", "Monthly", "Yearly"].map((label) => (
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
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredChartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="black"
              strokeOpacity={0.2}
            />
            <XAxis dataKey="timestamp" stroke="black" />
            <YAxis
              stroke="black"
              domain={[minY, maxY]}
              tickLine={true}
              axisLine={true}
            />
            <Tooltip />
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

export default Chart3;
