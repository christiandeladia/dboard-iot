// utils/dataUtils.js

export const groupBy = (data, keyGetter) => {
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

export const groupAndAverage = (data, getKey) => {
  const grouped = groupBy(data, getKey);

  return Array.from(grouped.entries()).map(([key, values]) => {
    const avg = (arr) => {
      const filteredArr = arr.filter((num) => num !== null && num !== undefined);
      return filteredArr.length
        ? parseFloat((filteredArr.reduce((a, b) => a + b, 0) / filteredArr.length).toFixed(2))
        : null; // Returns null instead of 0 if all values are missing
    };

    const groupedEntry = {
      timestamp: key, // Grouped key (Day or Month)
      // Voltage
      L1_voltage: avg(values.map((v) => v.voltages_avg?.L1 ?? null)),
      L2_voltage: avg(values.map((v) => v.voltages_avg?.L2 ?? null)),
      L3_voltage: avg(values.map((v) => v.voltages_avg?.L3 ?? null)),
      total_voltage: avg(values.map((v) => v.voltages_avg?.total ?? null)),
    
      // Current
      L1_current: avg(values.map((v) => v.currents_avg?.L1 ?? null)),
      L2_current: avg(values.map((v) => v.currents_avg?.L2 ?? null)),
      L3_current: avg(values.map((v) => v.currents_avg?.L3 ?? null)),
      total_current: avg(values.map((v) => v.currents_avg?.total ?? null)),
    
      // Frequency
      L1_frequency: avg(values.map((v) => v.frequencies_avg?.L1 ?? null)),
      L2_frequency: avg(values.map((v) => v.frequencies_avg?.L2 ?? null)),
      L3_frequency: avg(values.map((v) => v.frequencies_avg?.L3 ?? null)),
      total_frequency: avg(values.map((v) => v.frequencies_avg?.total ?? null)),
    
      // Power Factor
      L1_power_factor: avg(values.map((v) => v.power_factors_avg?.L1 ?? null)),
      L2_power_factor: avg(values.map((v) => v.power_factors_avg?.L2 ?? null)),
      L3_power_factor: avg(values.map((v) => v.power_factors_avg?.L3 ?? null)),
      total_power_factor: avg(values.map((v) => v.power_factors_avg?.total ?? null)),
    
      // Voltage Harmonics
      L1_volt_harmonic: avg(values.map((v) => v.voltage_harmonics_avg?.L1 ?? null)),
      L2_volt_harmonic: avg(values.map((v) => v.voltage_harmonics_avg?.L2 ?? null)),
      L3_volt_harmonic: avg(values.map((v) => v.voltage_harmonics_avg?.L3 ?? null)),
      total_volt_harmonic: avg(values.map((v) => v.voltage_harmonics_avg?.total ?? null)),
    
      // Current Harmonics
      L1_curr_harmonic: avg(values.map((v) => v.current_harmonics_avg?.L1 ?? null)),
      L2_curr_harmonic: avg(values.map((v) => v.current_harmonics_avg?.L2 ?? null)),
      L3_curr_harmonic: avg(values.map((v) => v.current_harmonics_avg?.L3 ?? null)),
      total_curr_harmonic: avg(values.map((v) => v.current_harmonics_avg?.total ?? null)),
    
      // Power
      L1_power: avg(values.map((v) => v.power?.L1 ?? null)),
      L2_power: avg(values.map((v) => v.power?.L2 ?? null)),
      L3_power: avg(values.map((v) => v.power?.L3 ?? null)),
      total_power: avg(values.map((v) => v.power?.total ?? null)),
    };
    

    // ✅ Remove timestamps where all selected components are null
    const hasValidData = Object.keys(groupedEntry).some(
      (key) => key !== "timestamp" && groupedEntry[key] !== null
    );

    return hasValidData ? groupedEntry : null;
  }).filter((entry) => entry !== null); // Remove null entries
};


// Limits X-axis labels to 6 evenly spaced values
export const formatXAxis = (timestamps) => {
    if (!timestamps || timestamps.length === 0) return [];
  
    // Ensure timestamps are sorted
    timestamps.sort((a, b) => a - b);
  
    // Limit to 6 evenly spaced values
    const step = Math.max(1, Math.floor(timestamps.length / 10));
    const limitedLabels = timestamps.filter((_, index) => index % step === 0);
  
    return new Set(limitedLabels); // Use Set to prevent duplicates
  };
  
  
  export const formatXAxisLabel = (value) => {
    if (typeof value !== "string") return value;
    
    // If the value looks like a time-of-day string, e.g., "9:15 AM", just return it.
    if (value.match(/^\d{1,2}:\d{2}\s*(AM|PM)$/i)) {
      return value;
    }
    
    // If value is in "YYYY-MM-DD" format, format as "Mar 1"
    if (value.length === 10) {
      const [year, month, day] = value.split("-");
      const dateObj = new Date(year, parseInt(month, 10) - 1, day);
      return dateObj.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      });
    }
    
    // If value is in "YYYY-MM" format, format as "March 2025"
    if (value.length === 7) {
      const [year, month] = value.split("-");
      const dateObj = new Date(year, parseInt(month, 10) - 1);
      return dateObj.toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
      });
    }
    
    return value;
  };
  

