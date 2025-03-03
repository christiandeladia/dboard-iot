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
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    return {
      timestamp: key,
      L1: parseFloat(avg(values.map((v) => v.voltages_avg.L1)).toFixed(2)),
      L2: parseFloat(avg(values.map((v) => v.voltages_avg.L2)).toFixed(2)),
      L3: parseFloat(avg(values.map((v) => v.voltages_avg.L3)).toFixed(2)),
    };
  });
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
  
  


