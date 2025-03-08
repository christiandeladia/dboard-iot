import React, { useState, useMemo, useEffect } from "react";
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
import PowerDropdown from "../components/PowerDropdown";
import { groupedPhaseOptions } from "../components/PowerDropdown";
import CustomTooltip from "../components/CustomTooltip";
import { groupAndAverage, formatXAxisLabel  } from "../utils/dataUtils";

const MainChart = ({ selectedPlant }) => {
  // Remove timeframe state & UI (Day/Month/Year) – now only date range from DateDropdown is used.
  const [selectedDates, setSelectedDates] = useState(null);
  
  // Find the "Total Power" option in groupedPhaseOptions and set it as default.
  const totalPowerOption = groupedPhaseOptions
    .flatMap((group) => group.options)
    .flatMap((subGroup) => subGroup.options)
    .find((option) => option.value === "total_power");
  const [selectedPhases, setSelectedPhases] = useState([totalPowerOption]);
  const [data, setData] = useState([]);

  // Fetch data from Firestore
  useEffect(() => {
    if (!selectedPlant) return;
    const q = query(collection(db, "meter_monitor_day"), where("plant_id", "==", selectedPlant));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedData = querySnapshot.docs.map((doc) => doc.data());
      setData(fetchedData);
    });
    return () => unsubscribe();
  }, [selectedPlant]);

  const filteredChartData = useMemo(() => {
    if (!data.length) return [];
  
    let startTimestamp, endTimestamp, startDate, endDate;
    if (selectedDates && selectedDates.length === 2) {
      startDate = new Date(selectedDates[0] * 1000);
      endDate = new Date(selectedDates[1] * 1000);
      startTimestamp = Math.floor(startDate.setHours(0, 0, 0, 0) / 1000);
      endTimestamp = Math.floor(endDate.setHours(23, 59, 59, 999) / 1000);
    } else {
      const today = new Date();
      startDate = new Date(today);
      endDate = new Date(today);
      startTimestamp = Math.floor(today.setHours(0, 0, 0, 0) / 1000);
      endTimestamp = Math.floor(today.setHours(23, 59, 59, 999) / 1000);
    }
  
    const filteredData = data.filter(
      (entry) => entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp
    );
  
    let groupedData = [];
    // Calculate difference in days
    const diffInMs = endDate - startDate;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
    if (diffInDays < 1) {
      // Single-day range: map each entry to its time string.
      groupedData = filteredData
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((entry) => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString("en-PH", {
            timeZone: "Asia/Manila",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          timestamp_unix: entry.timestamp,
          L1_voltage: entry.voltages_avg?.L1 || null,
          L2_voltage: entry.voltages_avg?.L2 || null,
          L3_voltage: entry.voltages_avg?.L3 || null,
          L1_current: entry.currents_avg?.L1 || null,
          L2_current: entry.currents_avg?.L2 || null,
          L3_current: entry.currents_avg?.L3 || null,
          L1_frequency: entry.frequencies_avg?.L1 || null,
          L2_frequency: entry.frequencies_avg?.L2 || null,
          L3_frequency: entry.frequencies_avg?.L3 || null,
          L1_volt_harmonic: entry.voltage_harmonics_avg?.L1 || null,
          L2_volt_harmonic: entry.voltage_harmonics_avg?.L2 || null,
          L3_volt_harmonic: entry.voltage_harmonics_avg?.L3 || null,
          L1_curr_harmonic: entry.current_harmonics_avg?.L1 || null,
          L2_curr_harmonic: entry.current_harmonics_avg?.L2 || null,
          L3_curr_harmonic: entry.current_harmonics_avg?.L3 || null,
          L1_power_factor: entry.power_factors_avg?.L1 || null,
          L2_power_factor: entry.power_factors_avg?.L2 || null,
          L3_power_factor: entry.power_factors_avg?.L3 || null,
          L1_power: entry.power?.L1 || null,
          L2_power: entry.power?.L2 || null,
          L3_power: entry.power?.L3 || null,
          total_power: entry.power?.total || null,
        }));
    } else {
      // For a multi-day custom range, choose grouping based on span:
      if (
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear()
      ) {
        // Group by day within the same month/year.
        groupedData = groupAndAverage(filteredData, (item) => {
          const d = new Date(item.timestamp * 1000);
          // Create an ISO-like day string: YYYY-MM-DD
          return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)}`;
        });
      } else {
        // Group by month for ranges spanning multiple months.
        groupedData = groupAndAverage(filteredData, (item) => {
          const d = new Date(item.timestamp * 1000);
          // Create an ISO-like month string: YYYY-MM
          return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}`;
        });
      }
      // Sort the grouped data by converting the grouping key back to a Date.
      groupedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
  
    // Remove any grouped entry where ALL selected phases are null.
    groupedData = groupedData.filter((entry) =>
      selectedPhases.some((phase) => entry[phase.value] !== null)
    );
  
    return groupedData;
  }, [data, selectedDates, selectedPhases]);
  
  

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
    const min = Math.min(...allValues) - 1;
    const max = Math.max(...allValues) + 1;
    return {
      minY: parseFloat(min.toFixed(1)),
      maxY: parseFloat(max.toFixed(1)),
    };
  }, [filteredChartData]);

  return (
    <div className="w-full max-w-11/12 bg-white p-6 rounded-lg shadow-lg h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <PowerDropdown onPhaseChange={setSelectedPhases} />
        <div className="flex items-center space-x-4">
          {/* Replace DateRangePicker with the new DateDropdown */}
          <DateRangePicker onDateSelect={(dates) => setSelectedDates(dates)} />
        </div>
      </div>

      <div className="flex-1">
        {filteredChartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-lg font-semibold">No Data Found</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="black" strokeOpacity={0.2} />
              <XAxis
                dataKey="timestamp"
                minTickGap={40}
                stroke="gray"
                tick={{ style: { pointerEvents: "none", userSelect: "none" } }}
                tickFormatter={formatXAxisLabel}
              />
              <YAxis
                stroke="gray"
                domain={[minY, maxY]}
                tickLine={true}
                axisLine={true}
                tick={{ style: { pointerEvents: "none", userSelect: "none" } }}
              />
              <Tooltip content={<CustomTooltip />} />
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

              {/* Power Factor Data */}
              {selectedPhases.some(
                (phase) => phase.value === "L1_power_factor"
              ) && (
                <Area
                  type="monotone"
                  dataKey="L1_power_factor"
                  stroke="rgb(128, 128, 128)"
                  fill="rgba(128, 128, 128, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some(
                (phase) => phase.value === "L2_power_factor"
              ) && (
                <Area
                  type="monotone"
                  dataKey="L2_power_factor"
                  stroke="rgb(169, 169, 169)"
                  fill="rgba(169, 169, 169, 0.3)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {selectedPhases.some(
                (phase) => phase.value === "L3_power_factor"
              ) && (
                <Area
                  type="monotone"
                  dataKey="L3_power_factor"
                  stroke="rgb(192, 192, 192)"
                  fill="rgba(192, 192, 192, 0.3)"
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
