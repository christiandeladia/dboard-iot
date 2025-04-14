import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import dragDataPlugin from 'chartjs-plugin-dragdata';

// Register Chart.js components.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,          // Enables fill option.
  dragDataPlugin   // Enables drag functionality.
);

// Default datasets.
// export const nightTimeData = [16, 17, 17, 15, 5, 5, 4, 5, 4, 13, 15, 16];
// export const dayTimeData   = [2, 2, 3, 3, 16, 16, 18, 16, 17, 4, 4, 3];
// export const twentyFourSevenData = [9, 10, 9, 9, 9, 10, 10, 10, 10, 10, 11, 9];

/**
 * Generates a dataset that sums exactly (or very near) to dailySliderMax 
 * using a given array of weights.
 * 
 * @param {number} dailySliderMax - The total amount to distribute.
 * @param {number[]} weights - An array of weights for each time slot.
 * @returns {number[]} - An array of values that sum to dailySliderMax.
 */
const generateDataFromWeights = (dailySliderMax, weights) => {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  // Compute each value before rounding.
  const rawValues = weights.map(w => (w / totalWeight) * dailySliderMax);
  
  // Round each value.
  const roundedValues = rawValues.map(v => Math.round(v));
  
  // Adjust if there is a rounding error by calculating the difference.
  let diff = dailySliderMax - roundedValues.reduce((sum, v) => sum + v, 0);

  
  // Distribute the difference (which is usually small) among the values.
  // We'll add 1 to the first few items until the sum equals dailySliderMax.
  let i = 0;
  let adjustedValues = [...roundedValues];
  while (diff !== 0 && i < adjustedValues.length) {
    if (diff > 0) {
      adjustedValues[i] += 1;
      i++;
      diff--;
    } else if (diff < 0 && adjustedValues[i] > 0) {
      adjustedValues[i] -= 1;
      i++;
      diff++;
    } else {
      i++;
    }
  }
  return adjustedValues;
};

// Generator function for Day Time Data with slight variation.
export const generateDayTimeData = (dailySliderMax) => {
  // For day time, assume higher usage between 6 AM and 6 PM.
  // Base weights: indices 3–8 get 0.8, others get 0.3.
  const weights = defaultLabels.map((_, index) => {
    const baseWeight = (index >= 3 && index <= 8) ? 0.8 : 0.3;
    // Multiply by a random factor between 0.95 and 1.05 for slight variation.
    const randomFactor = 0.95 + Math.random() * 0.1;
    return baseWeight * randomFactor;
  });
  return generateDataFromWeights(dailySliderMax, weights);
};


export const generateNightTimeData = (dailySliderMax) => {
  // For night time, invert the weights: higher outside 6 AM–6 PM.
  const weights = defaultLabels.map((_, index) => {
    // Base weight: lower (0.3) during what is day normally, higher (0.8) during the night.
    let baseWeight = (index >= 3 && index <= 8) ? 0.3 : 0.8;
    // Multiply by a random factor between 0.95 and 1.05 for slight variation.
    let randomFactor = 0.95 + Math.random() * 0.1;
    return baseWeight * randomFactor;
  });
  return generateDataFromWeights(dailySliderMax, weights);
};


// Generator function for 24 Hours Data with slight variation.
export const generateTwentyFourSevenData = (dailySliderMax) => {
  // Generate a slight variation for each label. Each weight is between 0.95 and 1.05.
  const weights = defaultLabels.map(() => 0.95 + Math.random() * 0.1);
  return generateDataFromWeights(dailySliderMax, weights);
};


export const defaultLabels = [
  '12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM',
  '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'
];

function DailyEnergyChart({ data = [], draggable = false, onDataChange, sliderMax, usage = "Day time" }) {
  // Convert the monthly sliderMax to a daily sliderMax (as a whole number).
  const dailySliderMax = Math.round(sliderMax / 31);
  console.log("dailySliderMax:", dailySliderMax);
  
  // If no data is provided, generate dynamic defaults based on usage:
  let dynamicData;
  if (data.length) {
    dynamicData = data;
  } else {
    if (usage === "Night time") {
      dynamicData = generateNightTimeData(dailySliderMax);
    } else if (usage === "24 Hours") {
      dynamicData = generateTwentyFourSevenData(dailySliderMax);
    } else {
      // Default to Day time
      dynamicData = generateDayTimeData(dailySliderMax);
    }
  }

  // Calculate the highest value (or fallback to dailySliderMax)
  const highestValue = dynamicData.length ? Math.max(...dynamicData) : dailySliderMax;
  const yAxisMax = highestValue > 0 ? Math.ceil((highestValue * 1.05) / 10) * 10 : dailySliderMax;
  // Calculate the lowest value (or fallback to 0)
  const lowestValue = dynamicData.length ? Math.min(...dynamicData) : 0;
  const yAxisMin = lowestValue > 0 ? Math.floor((lowestValue * 0.95) / 10) * 10 : 0;


  // Now build the chart data with dynamicData...
  const [chartData, setChartData] = useState({
    labels: defaultLabels,
    datasets: [
      {
        label: 'Daily Energy Pattern',
        data: dynamicData,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(138,208,245,0.4)',
        borderWidth: 3,
        fill: true,
        pointRadius: draggable ? 8 : 4,
        pointHoverRadius: draggable ? 7 : 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#36A2EB',
      },
    ],
  });

// Update chart data if the `data` prop changes
useEffect(() => {
  setChartData(prev => ({
    ...prev,
    datasets: [{
      ...prev.datasets[0],
      data: data,
      pointRadius: draggable ? 8 : 4,
      pointHoverRadius: draggable ? 10 : 6,
    }]
  }));
}, [data, draggable]);

  // Optional: call onDataChange whenever chartData changes.
  useEffect(() => {
    if (onDataChange) {
      onDataChange(chartData.datasets[0].data);
    }
  }, [chartData, onDataChange]);

  // Define dragData options: if draggable is true, use our configuration; otherwise, disable it.
  const dragOptions = draggable
    ? {
        round: 1,
        dragX: false, // Allow only vertical dragging.
        onDragStart: function (e, datasetIndex, index, value) {
          // Optional custom logic for drag start.
        },
        onDrag: function (e, datasetIndex, index, value) {
          // Optional live feedback.
        },
        onDragEnd: function (e, datasetIndex, index, value) {
          // Update state with the new value once dragging ends.
          setChartData(prev => {
            const newData = [...prev.datasets[0].data];
            newData[index] = value;
            return {
              ...prev,
              datasets: [{
                ...prev.datasets[0],
                data: newData,
              }],
            };
          });
        },
      }
    : false;

  // Build options – include dragData options explicitly.
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      dragData: dragOptions,
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        min: yAxisMin,
        max: yAxisMax,
        ticks: {
          display: true,  // This hides the y-axis tick labels
        },
      },
    },
  };

  return (
    <div className="w-full h-50 flex justify-center items-center">
      <Line data={chartData} options={options} />
    </div>
  );
}


export default DailyEnergyChart;
