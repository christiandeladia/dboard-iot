import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import dragDataPlugin from 'chartjs-plugin-dragdata';

// Register required Chart.js components and the drag plugin.
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  dragDataPlugin
);

function MonthlyEnergyChart({ dailyConsumption, sliderMax }) {
  // Build day labels from the dailyConsumption array.
  const labels = dailyConsumption.map((_, index) => `Day ${index + 1}`);

  // Local state holds our chart data.
  const [chartData, setChartData] = useState({
    labels: labels,
    datasets: [
      {
        label: 'Daily Consumption (kWh)',
        data: dailyConsumption,
        backgroundColor: '#8884d8',
      },
    ],
  });

  // Update chart data when the dailyConsumption prop changes.
  useEffect(() => {
    setChartData(prev => ({
      ...prev,
      datasets: [{
        ...prev.datasets[0],
        data: dailyConsumption,
      }],
    }));
  }, [dailyConsumption]);

// Calculate the highest value in the data (or fall back to sliderMax if needed)
const highestValue = dailyConsumption.length ? Math.max(...dailyConsumption) : sliderMax;
// Add 5% to the highest value, then round up to the next multiple of 10:
const yAxisMax = highestValue > 0 ? Math.ceil((highestValue * 1.05) / 10) * 10 : sliderMax;


  // Options for the bar chart including dragData plugin configuration.
  // This configuration limits dragging to vertical adjustments only.
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        // You can adjust the x-axis tick and grid settings as needed.
        ticks: {
          maxRotation: 0,
          minRotation: 0,
        },
        grid: {
          borderDash: [5, 5],
        },
      },
      y: {
        min: 0,
        max: yAxisMax,  
        ticks: {
          // Optionally, you can hide or show tick values.
          display: true,
        },
        grid: {
          borderDash: [5, 5],
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      dragData: {
        round: 1,
        dragX: false, // Only allow vertical dragging.
        onDragStart: function(e, datasetIndex, index, value) {
          // Optional: add logic at drag start if needed.
        },
        onDrag: function(e, datasetIndex, index, value) {
          // Optional: update live feedback during drag.
        },
        onDragEnd: function(e, datasetIndex, index, value) {
          // When dragging ends, update the dataset.
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
      },
    },
  };

  return (
    <div className="w-full h-50 flex justify-center items-center">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default MonthlyEnergyChart;
