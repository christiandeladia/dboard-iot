import React, { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { groupAndAverage, formatXAxisLabel } from "../utils/dataUtils";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

const MainChart = ({ selectedPlant }) => {
  const [selectedDates, setSelectedDates] = useState(null);

  // Set default phase to "Total Power"
  const totalPowerOption = groupedPhaseOptions
    .flatMap((group) => group.options)
    .flatMap((subGroup) => subGroup.options)
    .find((option) => option.value === "total_power");
  const [selectedPhases, setSelectedPhases] = useState(
    totalPowerOption ? [totalPowerOption] : []
  );
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Firestore
  useEffect(() => {
    if (!selectedPlant) return;
    const q = query(
      collection(db, "meter_monitor_day"),
      where("plant_id", "==", selectedPlant)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedData = querySnapshot.docs.map((doc) => doc.data());
      setData(fetchedData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [selectedPlant]);

  // Compute day difference using selectedDates.
  const diffInDays = useMemo(() => {
    if (selectedDates && selectedDates.length === 2) {
      const start = new Date(selectedDates[0] * 1000);
      const end = new Date(selectedDates[1] * 1000);
      return (end - start) / (1000 * 60 * 60 * 24);
    }
    return 0;
  }, [selectedDates]);

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
    // Use diffInDays computed from selectedDates (or compute here if not available)
    const diffInMs = endDate - startDate;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
    if (diffInDays <= 2) {
      // For ranges less than 2 days: do not group data.
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
      // For ranges of 2 days or more, group data by day (or month if spanning multiple months)
      if (
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear()
      ) {
        groupedData = groupAndAverage(filteredData, (item) => {
          const d = new Date(item.timestamp * 1000);
          return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)}`;
        });
      } else {
        groupedData = groupAndAverage(filteredData, (item) => {
          const d = new Date(item.timestamp * 1000);
          return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}`;
        });
      }
      groupedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
  
    // Remove grouped entries where all selected phase values are null.
    groupedData = groupedData.filter((entry) =>
      selectedPhases.some((phase) => entry[phase.value] !== null)
    );
  
    return groupedData;
  }, [data, selectedDates, selectedPhases]);
  

  const { minY, maxY } = useMemo(() => {
    // Helper function to extract numeric values for a given phase key
    const getPhaseValues = (phaseKey) =>
      filteredChartData
        .map(entry => Number(entry[phaseKey]))
        .filter(value => value != null && !isNaN(value));
  
    // Use selectedPhases to get values for only those keys
    const allValues = selectedPhases.flatMap(phase => getPhaseValues(phase.value));
    
    console.log("Length of allValues for selected phases:", allValues.length);
    console.log("allValues for selected phases:", allValues);
  
    if (allValues.length === 0) {
      console.log("No valid numeric values found for selected phases:", allValues);
      return { minY: 0, maxY: 0 };
    }
    const min = Math.min(...allValues) - 1;
    const max = Math.max(...allValues) + 1;
    const computed = { minY: parseFloat(min.toFixed(1)), maxY: parseFloat(max.toFixed(1)) };
    console.log("Computed minY and maxY based on selected phases:", computed);
    return computed;
  }, [filteredChartData, selectedPhases]);
  

  return (
    <div className="w-full max-w-11/12 bg-white p-6 rounded-lg shadow-lg h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <PowerDropdown onPhaseChange={setSelectedPhases} />
        <div className="flex items-center space-x-4">
          {/* Replace DateRangePicker with your DateDropdown if needed */}
          <DateRangePicker onDateSelect={(dates) => setSelectedDates(dates)} />
        </div>
      </div>

      <div className="flex-1">
      {isLoading ? (
          <LoadingSkeleton />
        ) : filteredChartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-lg font-semibold">No Data Found</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {diffInDays >= 2 ? (
              // Render BarChart when more than 2 days are selected.
              <BarChart data={filteredChartData}>
              <defs>
                  {/* Voltage gradients */}
                  <linearGradient id="gradientL1_voltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(0, 102, 255)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(0, 102, 255)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL2_voltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(51, 153, 255)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(51, 153, 255)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL3_voltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(102, 204, 255)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(102, 204, 255)" stopOpacity={0.5} />
                  </linearGradient>

                  {/* Current gradients */}
                  <linearGradient id="gradientL1_current" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 153, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 153, 0)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL2_current" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 204, 51)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 204, 51)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL3_current" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 255, 102)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 255, 102)" stopOpacity={0.5} />
                  </linearGradient>

                  {/* Frequency gradients */}
                  <linearGradient id="gradientL1_frequency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(0, 153, 76)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(0, 153, 76)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL2_frequency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(51, 204, 102)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(51, 204, 102)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL3_frequency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(102, 255, 153)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(102, 255, 153)" stopOpacity={0.5} />
                  </linearGradient>

                  {/* Voltage Harmonics gradients */}
                  <linearGradient id="gradientL1_volt_harmonic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 99, 71)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 99, 71)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL2_volt_harmonic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 140, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 140, 0)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL3_volt_harmonic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 69, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 69, 0)" stopOpacity={0.5} />
                  </linearGradient>

                  {/* Current Harmonics gradients */}
                  <linearGradient id="gradientL1_curr_harmonic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(0, 206, 209)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(0, 206, 209)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL2_curr_harmonic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(72, 209, 204)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(72, 209, 204)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL3_curr_harmonic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(32, 178, 170)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(32, 178, 170)" stopOpacity={0.5} />
                  </linearGradient>

                  {/* Power Factor gradients */}
                  <linearGradient id="gradientL1_power_factor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(128, 128, 128)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(128, 128, 128)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL2_power_factor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(169, 169, 169)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(169, 169, 169)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL3_power_factor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(192, 192, 192)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(192, 192, 192)" stopOpacity={0.5} />
                  </linearGradient>

                  {/* Power gradients */}
                  <linearGradient id="gradientL1_power" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 0, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 0, 0)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL2_power" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 69, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 69, 0)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradientL3_power" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 140, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 140, 0)" stopOpacity={0.5} />
                  </linearGradient>

                  {/* Total Power gradient */}
                  <linearGradient id="gradient_total_power" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 165, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 165, 0)" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
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
                {/* Voltage */}
                {selectedPhases.some((phase) => phase.value === "L1_voltage") && (
                  <Bar dataKey="L1_voltage" fill="url(#gradientL1_voltage)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L2_voltage") && (
                  <Bar dataKey="L2_voltage" fill="url(#gradientL2_voltage)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L3_voltage") && (
                  <Bar dataKey="L3_voltage" fill="url(#gradientL3_voltage)" radius={[15, 15, 0, 0]}/>
                )}

                {/* Current */}
                {selectedPhases.some((phase) => phase.value === "L1_current") && (
                  <Bar dataKey="L1_current" fill="url(#gradientL1_current)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L2_current") && (
                  <Bar dataKey="L2_current" fill="url(#gradientL2_current)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L3_current") && (
                  <Bar dataKey="L3_current" fill="url(#gradientL3_current)" radius={[15, 15, 0, 0]}/>
                )}

                {/* Frequency */}
                {selectedPhases.some((phase) => phase.value === "L1_frequency") && (
                  <Bar dataKey="L1_frequency" fill="url(#gradientL1_frequency)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L2_frequency") && (
                  <Bar dataKey="L2_frequency" fill="url(#gradientL2_frequency)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L3_frequency") && (
                  <Bar dataKey="L3_frequency" fill="url(#gradientL3_frequency)" radius={[15, 15, 0, 0]}/>
                )}

                {/* Voltage Harmonics */}
                {selectedPhases.some((phase) => phase.value === "L1_volt_harmonic") && (
                  <Bar dataKey="L1_volt_harmonic" fill="url(#gradientL1_volt_harmonic)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L2_volt_harmonic") && (
                  <Bar dataKey="L2_volt_harmonic" fill="url(#gradientL2_volt_harmonic)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L3_volt_harmonic") && (
                  <Bar dataKey="L3_volt_harmonic" fill="url(#gradientL3_volt_harmonic)" radius={[15, 15, 0, 0]}/>
                )}

                {/* Current Harmonics */}
                {selectedPhases.some((phase) => phase.value === "L1_curr_harmonic") && (
                  <Bar dataKey="L1_curr_harmonic" fill="url(#gradientL1_curr_harmonic)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L2_curr_harmonic") && (
                  <Bar dataKey="L2_curr_harmonic" fill="url(#gradientL2_curr_harmonic)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L3_curr_harmonic") && (
                  <Bar dataKey="L3_curr_harmonic" fill="url(#gradientL3_curr_harmonic)" radius={[15, 15, 0, 0]}/>
                )}

                {/* Power Factor */}
                {selectedPhases.some((phase) => phase.value === "L1_power_factor") && (
                  <Bar dataKey="L1_power_factor" fill="url(#gradientL1_power_factor)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L2_power_factor") && (
                  <Bar dataKey="L2_power_factor" fill="url(#gradientL2_power_factor)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L3_power_factor") && (
                  <Bar dataKey="L3_power_factor" fill="url(#gradientL3_power_factor)" radius={[15, 15, 0, 0]}/>
                )}

                {/* Power */}
                {selectedPhases.some((phase) => phase.value === "L1_power") && (
                  <Bar dataKey="L1_power" fill="url(#gradientL1_power)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L2_power") && (
                  <Bar dataKey="L2_power" fill="url(#gradientL2_power)" radius={[15, 15, 0, 0]}/>
                )}
                {selectedPhases.some((phase) => phase.value === "L3_power") && (
                  <Bar dataKey="L3_power" fill="url(#gradientL3_power)" radius={[15, 15, 0, 0]}/>
                )}

                {/* Total Power */}
                {selectedPhases.some((phase) => phase.value === "total_power") && (
                  <Bar dataKey="total_power" fill="url(#gradient_total_power)" radius={[15, 15, 0, 0]}/>
                )}
              </BarChart>
            ) : (
              // Render AreaChart for 2 days or less.
              <AreaChart data={filteredChartData}>
              <defs>
                  {/* Voltage gradients */}
                  <linearGradient id="gradientL1_voltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(0, 102, 255)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(0, 102, 255)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL2_voltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(51, 153, 255)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(51, 153, 255)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL3_voltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(102, 204, 255)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(102, 204, 255)" stopOpacity={0.3} />
                  </linearGradient>

                  {/* Current gradients */}
                  <linearGradient id="gradientL1_current" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 153, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 153, 0)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL2_current" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 204, 51)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 204, 51)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL3_current" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 255, 102)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 255, 102)" stopOpacity={0.3} />
                  </linearGradient>

                  {/* Frequency gradients */}
                  <linearGradient id="gradientL1_frequency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(0, 153, 76)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(0, 153, 76)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL2_frequency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(51, 204, 102)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(51, 204, 102)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL3_frequency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(102, 255, 153)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(102, 255, 153)" stopOpacity={0.3} />
                  </linearGradient>

                  {/* Voltage Harmonics gradients */}
                  <linearGradient id="gradientL1_volt_harmonic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 99, 71)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 99, 71)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL2_volt_harmonic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 140, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 140, 0)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL3_volt_harmonic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 69, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 69, 0)" stopOpacity={0.3} />
                  </linearGradient>

                  {/* Current Harmonics gradients */}
                  <linearGradient id="gradientL1_curr_harmonic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(0, 206, 209)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(0, 206, 209)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL2_curr_harmonic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(72, 209, 204)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(72, 209, 204)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL3_curr_harmonic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(32, 178, 170)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(32, 178, 170)" stopOpacity={0.3} />
                  </linearGradient>

                  {/* Power Factor gradients */}
                  <linearGradient id="gradientL1_power_factor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(128, 128, 128)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(128, 128, 128)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL2_power_factor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(169, 169, 169)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(169, 169, 169)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL3_power_factor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(192, 192, 192)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(192, 192, 192)" stopOpacity={0.3} />
                  </linearGradient>

                  {/* Power gradients */}
                  <linearGradient id="gradientL1_power" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 0, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 0, 0)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL2_power" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 69, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 69, 0)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradientL3_power" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 140, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 140, 0)" stopOpacity={0.3} />
                  </linearGradient>

                  {/* Total Power gradient */}
                  <linearGradient id="gradient_total_power" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(255, 165, 0)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(255, 165, 0)" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
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
                {/* Voltage */}
      {selectedPhases.some((phase) => phase.value === "L1_voltage") && (
        <Area
          type="monotone"
          dataKey="L1_voltage"
          stroke="rgb(0, 102, 255)"
          fill="url(#gradientL1_voltage)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L2_voltage") && (
        <Area
          type="monotone"
          dataKey="L2_voltage"
          stroke="rgb(51, 153, 255)"
          fill="url(#gradientL2_voltage)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L3_voltage") && (
        <Area
          type="monotone"
          dataKey="L3_voltage"
          stroke="rgb(102, 204, 255)"
          fill="url(#gradientL3_voltage)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}

      {/* Current */}
      {selectedPhases.some((phase) => phase.value === "L1_current") && (
        <Area
          type="monotone"
          dataKey="L1_current"
          stroke="rgb(255, 153, 0)"
          fill="url(#gradientL1_current)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L2_current") && (
        <Area
          type="monotone"
          dataKey="L2_current"
          stroke="rgb(255, 204, 51)"
          fill="url(#gradientL2_current)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L3_current") && (
        <Area
          type="monotone"
          dataKey="L3_current"
          stroke="rgb(255, 255, 102)"
          fill="url(#gradientL3_current)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}

      {/* Frequency */}
      {selectedPhases.some((phase) => phase.value === "L1_frequency") && (
        <Area
          type="monotone"
          dataKey="L1_frequency"
          stroke="rgb(0, 153, 76)"
          fill="url(#gradientL1_frequency)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L2_frequency") && (
        <Area
          type="monotone"
          dataKey="L2_frequency"
          stroke="rgb(51, 204, 102)"
          fill="url(#gradientL2_frequency)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L3_frequency") && (
        <Area
          type="monotone"
          dataKey="L3_frequency"
          stroke="rgb(102, 255, 153)"
          fill="url(#gradientL3_frequency)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}

      {/* Voltage Harmonics */}
      {selectedPhases.some((phase) => phase.value === "L1_volt_harmonic") && (
        <Area
          type="monotone"
          dataKey="L1_volt_harmonic"
          stroke="rgb(255, 99, 71)"
          fill="url(#gradientL1_volt_harmonic)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L2_volt_harmonic") && (
        <Area
          type="monotone"
          dataKey="L2_volt_harmonic"
          stroke="rgb(255, 140, 0)"
          fill="url(#gradientL2_volt_harmonic)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L3_volt_harmonic") && (
        <Area
          type="monotone"
          dataKey="L3_volt_harmonic"
          stroke="rgb(255, 69, 0)"
          fill="url(#gradientL3_volt_harmonic)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}

      {/* Current Harmonics */}
      {selectedPhases.some((phase) => phase.value === "L1_curr_harmonic") && (
        <Area
          type="monotone"
          dataKey="L1_curr_harmonic"
          stroke="rgb(0, 206, 209)"
          fill="url(#gradientL1_curr_harmonic)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L2_curr_harmonic") && (
        <Area
          type="monotone"
          dataKey="L2_curr_harmonic"
          stroke="rgb(72, 209, 204)"
          fill="url(#gradientL2_curr_harmonic)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L3_curr_harmonic") && (
        <Area
          type="monotone"
          dataKey="L3_curr_harmonic"
          stroke="rgb(32, 178, 170)"
          fill="url(#gradientL3_curr_harmonic)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}

      {/* Power Factor */}
      {selectedPhases.some((phase) => phase.value === "L1_power_factor") && (
        <Area
          type="monotone"
          dataKey="L1_power_factor"
          stroke="rgb(128, 128, 128)"
          fill="url(#gradientL1_power_factor)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L2_power_factor") && (
        <Area
          type="monotone"
          dataKey="L2_power_factor"
          stroke="rgb(169, 169, 169)"
          fill="url(#gradientL2_power_factor)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L3_power_factor") && (
        <Area
          type="monotone"
          dataKey="L3_power_factor"
          stroke="rgb(192, 192, 192)"
          fill="url(#gradientL3_power_factor)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}

      {/* Power */}
      {selectedPhases.some((phase) => phase.value === "L1_power") && (
        <Area
          type="monotone"
          dataKey="L1_power"
          stroke="rgb(255, 0, 0)"
          fill="url(#gradientL1_power)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L2_power") && (
        <Area
          type="monotone"
          dataKey="L2_power"
          stroke="rgb(255, 69, 0)"
          fill="url(#gradientL2_power)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
      {selectedPhases.some((phase) => phase.value === "L3_power") && (
        <Area
          type="monotone"
          dataKey="L3_power"
          stroke="rgb(255, 140, 0)"
          fill="url(#gradientL3_power)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}

      {/* Total Power */}
      {selectedPhases.some((phase) => phase.value === "total_power") && (
        <Area
          type="monotone"
          dataKey="total_power"
          stroke="rgb(255, 165, 0)"
          fill="url(#gradient_total_power)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      )}
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MainChart;
