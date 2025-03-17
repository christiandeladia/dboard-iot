import React, { useState, useMemo, useEffect, useRef  } from "react";
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
import DateDropdown from "../components/DateRangePicker";
import PowerDropdown from "../components/PowerDropdown";
import { groupedPhaseOptions } from "../components/PowerDropdown";
import CustomTooltip from "../components/CustomTooltip";
import { groupAndAverage, formatXAxisLabel } from "../utils/dataUtils";
import {LoadingSkeleton} from "../components/LoadingSkeleton";

// A color palette for overlaying days (up to 7 days)
const colorArray = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00c49f", "#0088FE", "#FFBB28"];

const MainChart = ({ selectedPlant }) => {
  const [selectedDates, setSelectedDates] = useState(null);
  // Chart type state coming from DateDropdown (either "area" or "bar")
  const [chartType, setChartType] = useState("area");

  // Set default phase to "total_power"
  const totalPowerOption = groupedPhaseOptions
    .flatMap((group) => group.options)
    .flatMap((subGroup) => subGroup.options)
    .find((option) => option.value === "total_power");
  const [selectedPhases, setSelectedPhases] = useState(
    totalPowerOption ? [totalPowerOption] : []
  );
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Firestore.
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

  // Compute the difference in days from the selected dates.
  const diffInDays = useMemo(() => {
    if (selectedDates && selectedDates.length === 2) {
      const start = new Date(selectedDates[0] * 1000);
      const end = new Date(selectedDates[1] * 1000);
      return (end - start) / (1000 * 60 * 60 * 24);
    }
    return 0;
  }, [selectedDates]);

  // rawFilteredData: all data points in the selected range (ungrouped)
  const rawFilteredData = useMemo(() => {
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
    return data
      .filter(
        (entry) =>
          entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp
      )
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((entry) => ({
        // Use full locale string for other chart modes
        timestamp: new Date(entry.timestamp * 1000).toLocaleString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "short",
          day: "numeric",
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
  }, [data, selectedDates]);

  // groupedChartData: existing grouping logic for ranges <2 days, >7 days, or custom in bar mode.
  const groupedChartData = useMemo(() => {
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
    const diffInMs = endDate - startDate;
    const diffDaysCalc = diffInMs / (1000 * 60 * 60 * 24);
    if (diffDaysCalc < 2) {
      groupedData = filteredData.map((entry) => ({
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
    groupedData = groupedData.filter((entry) =>
      selectedPhases.some((phase) => entry[phase.value] !== null)
    );
    return groupedData;
  }, [data, selectedDates, selectedPhases]);

  // For custom ranges between 2 and 7 days in "area" mode, we want to overlay the selected days on one chart with a fixed 24-hour x-axis.
  // First, group rawFilteredData by day and create a fixedTime (set to Jan 1, 1970) from each entry.
  const overlayData = useMemo(() => {
    if (
      selectedDates &&
      diffInDays >= 2 &&
      diffInDays <= 7 &&
      chartType === "area"
    ) {
      const groups = {};
      rawFilteredData.forEach((entry) => {
        // Use the original day as the grouping key.
        const dayKey = new Date(entry.timestamp_unix * 1000).toDateString();
        if (!groups[dayKey]) groups[dayKey] = [];
        const originalDate = new Date(entry.timestamp_unix * 1000);
        const fixedTime = new Date(
          1970,
          0,
          1,
          originalDate.getHours(),
          originalDate.getMinutes(),
          originalDate.getSeconds()
        );
        groups[dayKey].push({ ...entry, fixedTime });
      });
      // Convert groups to an array.
      const sortedDays = Object.keys(groups).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      return sortedDays.map((dayKey) => ({
        day: dayKey,
        data: groups[dayKey].sort((a, b) => a.fixedTime - b.fixedTime),
      }));
    }
    return null;
  }, [rawFilteredData, selectedDates, diffInDays, chartType]);

  // Combine overlayData into one dataset keyed by fixedTime (HH:MM:SS).
  // Each resulting data object will have properties for each day (if that day has a measurement at that time).
  const combinedData = useMemo(() => {
    if (overlayData) {
      const temp = {};
      overlayData.forEach((dayGroup) => {
        dayGroup.data.forEach((d) => {
          // Use fixedTime as a string key ("HH:MM:SS")
          const fixed = d.fixedTime.toTimeString().slice(0, 8);
          if (!temp[fixed]) {
            temp[fixed] = { fixedTime: fixed };
          }
          // Assume one selected phase – for example, use its value (e.g. "total_power").
          const phaseKey = selectedPhases[0]?.value;
          if (phaseKey) {
            temp[fixed][dayGroup.day] = d[phaseKey];
          }
        });
      });
      // Convert to sorted array.
      const arr = Object.values(temp);
      arr.sort((a, b) => {
        const [ha, ma, sa] = a.fixedTime.split(":").map(Number);
        const [hb, mb, sb] = b.fixedTime.split(":").map(Number);
        return ha * 3600 + ma * 60 + sa - (hb * 3600 + mb * 60 + sb);
      });
      return arr;
    }
    return null;
  }, [overlayData, selectedPhases]);

  // Determine minY and maxY for the y-axis.
  const { minY, maxY } = useMemo(() => {
    const getPhaseValues = (phaseKey) => {
      if (
        chartType === "area" &&
        selectedDates &&
        diffInDays >= 2 &&
        diffInDays <= 7 &&
        combinedData
      ) {
        // For the overlay dataset, extract values from each day's field.
        return combinedData
          .flatMap((d) => {
            // For each data point, get all day values.
            return Object.keys(d)
              .filter((key) => key !== "fixedTime")
              .map((day) => Number(d[day]));
          })
          .filter((value) => value != null && !isNaN(value));
      } else {
        return groupedChartData
          .map((entry) => Number(entry[phaseKey]))
          .filter((value) => value != null && !isNaN(value));
      }
    };
    const allValues = selectedPhases.flatMap((phase) =>
      getPhaseValues(phase.value)
    );
    if (allValues.length === 0) return { minY: 0, maxY: 0 };
    const min = Math.min(...allValues) - 1;
    const max = Math.max(...allValues) + 1;
    return { minY: parseFloat(min.toFixed(1)), maxY: parseFloat(max.toFixed(1)) };
  }, [groupedChartData, selectedPhases, chartType, diffInDays, combinedData]);

  // Close dropdown when clicking outside.
  const dropdownRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-11/12 bg-white p-6 rounded-lg shadow-lg h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <PowerDropdown onPhaseChange={setSelectedPhases} />
        <div className="flex items-center space-x-4">
          <DateDropdown
            onDateSelect={(dates) => setSelectedDates(dates)}
            onChartTypeChange={(newType) => setChartType(newType)}
          />
        </div>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <LoadingSkeleton />
        ) : diffInDays < 2 ? (
          // For ranges less than 2 days, use grouped AreaChart.
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={groupedChartData}>
              <defs>
                <linearGradient id="gradientL1_voltage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="rgb(0,102,255)" stopOpacity={1} />
                  <stop offset="90%" stopColor="rgb(0,102,255)" stopOpacity={0.3} />
                </linearGradient>
                {/* Additional gradients */}
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
              {selectedPhases.some((phase) => phase.value === "L1_voltage") && (
                <Area
                  type="monotone"
                  dataKey="L1_voltage"
                  stroke="rgb(0,102,255)"
                  fill="url(#gradientL1_voltage)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )}
              {/* Additional Area components for other phases */}
            </AreaChart>
          </ResponsiveContainer>
        ) : diffInDays > 7 ? (
          // For ranges greater than 7 days, use grouped BarChart.
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupedChartData}>
              <defs>
                <linearGradient id="gradientL1_voltage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="rgb(0,102,255)" stopOpacity={1} />
                  <stop offset="90%" stopColor="rgb(0,102,255)" stopOpacity={0.5} />
                </linearGradient>
                {/* Additional gradients */}
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
              {selectedPhases.some((phase) => phase.value === "L1_voltage") && (
                <Bar
                  dataKey="L1_voltage"
                  fill="url(#gradientL1_voltage)"
                  radius={[15, 15, 0, 0]}
                />
              )}
              {/* Additional Bar components for other phases */}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          // For custom ranges between 2 and 7 days:
          // If chartType is "bar", use grouped data with BarChart.
          // If chartType is "area", combine data by fixed time-of-day and overlay each day's series.
          chartType === "bar" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupedChartData}>
                <defs>
                  <linearGradient id="gradientL1_voltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="rgb(0,102,255)" stopOpacity={1} />
                    <stop offset="90%" stopColor="rgb(0,102,255)" stopOpacity={0.5} />
                  </linearGradient>
                  {/* Additional gradients */}
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
                {selectedPhases.some((phase) => phase.value === "L1_voltage") && (
                  <Bar dataKey="L1_voltage" fill="url(#gradientL1_voltage)" radius={[15,15,0,0]} />
                )}
                {/* Additional Bar components for other phases */}
              </BarChart>
            </ResponsiveContainer>
          ) : combinedData && (
            // For chartType "area": render one AreaChart that overlays each day's data.
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={combinedData}>
                <defs>
                  <linearGradient id="gradientFixed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                {/* XAxis now displays fixed time-of-day */}
                <XAxis dataKey="fixedTime" />
                <YAxis domain={[minY, maxY]} />
                <Tooltip content={<CustomTooltip />} />
                { // Get the day keys (each day is a series)
                  overlayData &&
                  overlayData.map((group, index) => (
                    <Area
                      key={group.day}
                      type="monotone"
                      dataKey={group.day}
                      stroke={colorArray[index % colorArray.length]}
                      fillOpacity={0.3}
                      fill={colorArray[index % colorArray.length]}
                      dot={{ r: 2 }}
                    />
                  ))
                }
              </AreaChart>
            </ResponsiveContainer>
          )
        )}
      </div>
    </div>
  );
};

export default MainChart;
