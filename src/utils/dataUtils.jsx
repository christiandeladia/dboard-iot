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
      L1_voltage: avg(values.map((v) => v.voltages_avg?.L1 ?? null)),
      L2_voltage: avg(values.map((v) => v.voltages_avg?.L2 ?? null)),
      L3_voltage: avg(values.map((v) => v.voltages_avg?.L3 ?? null)),

      L1_current: avg(values.map((v) => v.currents_avg?.L1 ?? null)),
      L2_current: avg(values.map((v) => v.currents_avg?.L2 ?? null)),
      L3_current: avg(values.map((v) => v.currents_avg?.L3 ?? null)),

      L1_frequency: avg(values.map((v) => v.frequencies_avg?.L1 ?? null)),
      L2_frequency: avg(values.map((v) => v.frequencies_avg?.L2 ?? null)),
      L3_frequency: avg(values.map((v) => v.frequencies_avg?.L3 ?? null)),

      L1_power_factor: avg(values.map((v) => v.power_factors_avg?.L1 ?? null)),
      L2_power_factor: avg(values.map((v) => v.power_factors_avg?.L2 ?? null)),
      L3_power_factor: avg(values.map((v) => v.power_factors_avg?.L3 ?? null)),

      L1_volt_harmonic: avg(values.map((v) => v.voltage_harmonics_avg?.L1 ?? null)),
      L2_volt_harmonic: avg(values.map((v) => v.voltage_harmonics_avg?.L2 ?? null)),
      L3_volt_harmonic: avg(values.map((v) => v.voltage_harmonics_avg?.L3 ?? null)),

      L1_curr_harmonic: avg(values.map((v) => v.current_harmonics_avg?.L1 ?? null)),
      L2_curr_harmonic: avg(values.map((v) => v.current_harmonics_avg?.L2 ?? null)),
      L3_curr_harmonic: avg(values.map((v) => v.current_harmonics_avg?.L3 ?? null)),

      // ✅ Power (Ensures null values do not replace existing valid values)
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
  
  


