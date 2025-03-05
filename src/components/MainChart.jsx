import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../Config";
import DateRangePicker from "../components/DateRangePicker";
import CustomTooltip from "../components/CustomTooltip";
import PowerDropdown from "../components/PowerDropdown";
import { powerOptions, phaseOptions } from "../components/PowerDropdown";
import { groupAndAverage, formatXAxis } from "../utils/dataUtils";

const MainChart = ({ selectedPlant }) => {
  const [timeframe, setTimeframe] = useState("Day");
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [selectedDates, setSelectedDates] = useState(null);
  const [selectedPower, setSelectedPower] = useState(powerOptions[0]); // Default to "Solar"
  const [selectedPhases, setSelectedPhases] = useState(
    phaseOptions.filter((phase) =>
      powerOptions[0].dataKeys.includes(phase.value)
    )
  );

  // Fetch data from Firestore
  useEffect(() => {
    if (!selectedPlant) return;
  
    const q = query(collection(db, "meter_monitor_day"), where("plant_id", "==", selectedPlant));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedData = querySnapshot.docs.map((doc) => doc.data());
      setData(fetchedData);
    });
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [selectedPlant]);

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
      (entry) =>
        entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp
    );

    // Apply grouping based on timeframe selection
    switch (timeframe) {
      case "Day":
        return filteredData
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((entry) => ({
            timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(
              "en-PH",
              {
                timeZone: "Asia/Manila",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }
            ),
            timestamp_unix: entry.timestamp,
            // Voltage Data
            L1_voltage: entry.voltages_avg?.L1 || null,
            L2_voltage: entry.voltages_avg?.L2 || null,
            L3_voltage: entry.voltages_avg?.L3 || null,
            // Current Data
            L1_current: entry.currents_avg?.L1 || null,
            L2_current: entry.currents_avg?.L2 || null,
            L3_current: entry.currents_avg?.L3 || null,
            // Frequency Data
            L1_frequency: entry.frequencies_avg?.L1 || null,
            L2_frequency: entry.frequencies_avg?.L2 || null,
            L3_frequency: entry.frequencies_avg?.L3 || null,
            // Voltage Harmonics (%)
            L1_volt_harmonic: entry.voltage_harmonics_avg?.L1 || null,
            L2_volt_harmonic: entry.voltage_harmonics_avg?.L2 || null,
            L3_volt_harmonic: entry.voltage_harmonics_avg?.L3 || null,
            // Current Harmonics (%)
            L1_curr_harmonic: entry.current_harmonics_avg?.L1 || null,
            L2_curr_harmonic: entry.current_harmonics_avg?.L2 || null,
            L3_curr_harmonic: entry.current_harmonics_avg?.L3 || null,
            // Power Factor (Unitless)
            L1_power_factor: entry.power_factors_avg?.L1 || null,
            L2_power_factor: entry.power_factors_avg?.L2 || null,
            L3_power_factor: entry.power_factors_avg?.L3 || null,
            // Power
            L1_power: entry.power?.L1 || null,
            L2_power: entry.power?.L2 || null,
            L3_power: entry.power?.L3 || null,
            total_power: entry.power?.total || null,
          }));

      case "Month":
        return groupAndAverage(filteredData, (item) => {
          const date = new Date(item.timestamp * 1000);
          return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
        }).sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

      case "Year":
        return groupAndAverage(filteredData, (item) => {
          const date = new Date(item.timestamp * 1000);
          return date.toLocaleDateString(undefined, { month: "long" });
        });

      default:
        return filteredData;
    }
  }, [data, timeframe, selectedDates]);

  // Compute min and max for Y-axis
  const { minY, maxY } = useMemo(() => {
    const getAllValues = (data, key) => {
      return data
        .flatMap((entry) => [
          entry[`${key}_L1`],
          entry[`${key}_L2`],
          entry[`${key}_L3`],
        ])
        .filter((value) => value !== null);
    };

    let allValues = [
      ...getAllValues(filteredChartData, "voltage"),
      ...getAllValues(filteredChartData, "current"),
      ...getAllValues(filteredChartData, "frequency"),
      ...getAllValues(filteredChartData, "volt_harmonic"),
      ...getAllValues(filteredChartData, "curr_harmonic"),
      ...getAllValues(filteredChartData, "power_factor"),
      ...getAllValues(filteredChartData, "power"),
    ];

    if (allValues.length === 0) return { minY: 0, maxY: 0 };

    switch (timeframe) {
      case "Day":
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        allValues = data
          .filter((entry) => {
            const entryDate = new Date(entry.timestamp * 1000);
            return entryDate.toDateString() === today.toDateString();
          })
          .flatMap((entry) => Object.values(entry.voltages_avg));
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
        }).filter((entry) => {
          const date = new Date(entry.timestamp);
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          );
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
        }).filter((entry) => {
          const date = new Date(`01 ${entry.timestamp} ${thisYear}`);
          return date.getFullYear() === thisYear;
        });

        allValues = getAllValues(monthlyData);
        break;

      default:
        allValues = data.flatMap((entry) => Object.values(entry.voltages_avg));
    }

    const min = Math.min(...allValues) - 1;
    const max = Math.max(...allValues) + 1;

    return {
      minY: parseFloat(min.toFixed(1)), // Limit to 1 decimal place
      maxY: parseFloat(max.toFixed(1)), // Limit to 1 decimal place
    };
  }, [data, timeframe]);

  return (
    <div className="w-full max-w-11/12 bg-white p-6 rounded-lg shadow-lg h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <PowerDropdown
          onPowerChange={setSelectedPower}
          onPhaseChange={setSelectedPhases}
        />

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

      {/* CHART  */}
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
              <XAxis dataKey="timestamp" minTickGap={40} stroke="black" />

              <YAxis
                stroke="black"
                domain={[minY, maxY]}
                tickLine={true}
                axisLine={true}
              />
              <Tooltip content={<CustomTooltip timeframe={timeframe} />} />
              {/* Voltage Data - Shades of Blue */}
              {selectedPhases.some((phase) => phase.value === "L1_voltage") && (
                <Area
                  type="monotone"
                  dataKey="L1_voltage"
                  stroke="rgb(0, 102, 255)"
                  fill="rgba(0, 102, 255, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some((phase) => phase.value === "L2_voltage") && (
                <Area
                  type="monotone"
                  dataKey="L2_voltage"
                  stroke="rgb(51, 153, 255)"
                  fill="rgba(51, 153, 255, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some((phase) => phase.value === "L3_voltage") && (
                <Area
                  type="monotone"
                  dataKey="L3_voltage"
                  stroke="rgb(102, 204, 255)"
                  fill="rgba(102, 204, 255, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}

              {/* Current Data - Shades of Yellow */}
              {selectedPhases.some((phase) => phase.value === "L1_current") && (
                <Area
                  type="monotone"
                  dataKey="L1_current"
                  stroke="rgb(255, 153, 0)"
                  fill="rgba(255, 153, 0, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some((phase) => phase.value === "L2_current") && (
                <Area
                  type="monotone"
                  dataKey="L2_current"
                  stroke="rgb(255, 204, 51)"
                  fill="rgba(255, 204, 51, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some((phase) => phase.value === "L3_current") && (
                <Area
                  type="monotone"
                  dataKey="L3_current"
                  stroke="rgb(255, 255, 102)"
                  fill="rgba(255, 255, 102, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}

              {/* Frequency Data - Shades of Green */}
              {selectedPhases.some(
                (phase) => phase.value === "L1_frequency"
              ) && (
                <Area
                  type="monotone"
                  dataKey="L1_frequency"
                  stroke="rgb(0, 153, 76)"
                  fill="rgba(0, 153, 76, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some(
                (phase) => phase.value === "L2_frequency"
              ) && (
                <Area
                  type="monotone"
                  dataKey="L2_frequency"
                  stroke="rgb(51, 204, 102)"
                  fill="rgba(51, 204, 102, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some(
                (phase) => phase.value === "L3_frequency"
              ) && (
                <Area
                  type="monotone"
                  dataKey="L3_frequency"
                  stroke="rgb(102, 255, 153)"
                  fill="rgba(102, 255, 153, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}

              {/* Voltage Harmonics Data */}
              {selectedPhases.some(
                (phase) => phase.value === "L1_volt_harmonic"
              ) && (
                <Area
                  type="monotone"
                  dataKey="L1_volt_harmonic"
                  stroke="rgb(255, 99, 71)"
                  fill="rgba(255, 99, 71, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some(
                (phase) => phase.value === "L2_volt_harmonic"
              ) && (
                <Area
                  type="monotone"
                  dataKey="L2_volt_harmonic"
                  stroke="rgb(255, 140, 0)"
                  fill="rgba(255, 140, 0, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some(
                (phase) => phase.value === "L3_volt_harmonic"
              ) && (
                <Area
                  type="monotone"
                  dataKey="L3_volt_harmonic"
                  stroke="rgb(255, 69, 0)"
                  fill="rgba(255, 69, 0, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}

              {/* Current Harmonics Data */}
              {selectedPhases.some(
                (phase) => phase.value === "L1_curr_harmonic"
              ) && (
                <Area
                  type="monotone"
                  dataKey="L1_curr_harmonic"
                  stroke="rgb(0, 206, 209)"
                  fill="rgba(0, 206, 209, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some(
                (phase) => phase.value === "L2_curr_harmonic"
              ) && (
                <Area
                  type="monotone"
                  dataKey="L2_curr_harmonic"
                  stroke="rgb(72, 209, 204)"
                  fill="rgba(72, 209, 204, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some(
                (phase) => phase.value === "L3_curr_harmonic"
              ) && (
                <Area
                  type="monotone"
                  dataKey="L3_curr_harmonic"
                  stroke="rgb(32, 178, 170)"
                  fill="rgba(32, 178, 170, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}

              {/* Power Data */}  
              {selectedPhases.some((phase) => phase.value === "L1_power") && (
                <Area
                  type="monotone"
                  dataKey="L1_power"
                  stroke="rgb(255, 0, 0)" // Red
                  fill="rgba(255, 0, 0, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some((phase) => phase.value === "L2_power") && (
                <Area
                  type="monotone"
                  dataKey="L2_power"
                  stroke="rgb(255, 69, 0)" // Orange-Red
                  fill="rgba(255, 69, 0, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some((phase) => phase.value === "L3_power") && (
                <Area
                  type="monotone"
                  dataKey="L3_power"
                  stroke="rgb(255, 140, 0)" // Dark Orange
                  fill="rgba(255, 140, 0, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some((phase) => phase.value === "total_power") && (
                <Area
                  type="monotone"
                  dataKey="total_power"
                  stroke="rgb(255, 165, 0)" // Lighter Orange (for total power)
                  fill="rgba(255, 165, 0, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}

            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MainChart;
