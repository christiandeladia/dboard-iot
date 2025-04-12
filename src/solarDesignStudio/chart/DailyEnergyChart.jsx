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
const nightTimeData = [16, 17, 17, 15, 5, 5, 4, 5, 4, 13, 15, 16];
const dayTimeData   = [2, 2, 3, 3, 16, 16, 18, 16, 17, 4, 4, 3];
const twentyFourSevenData = [9, 10, 9, 9, 9, 10, 10, 10, 10, 10, 11, 9];

// Time labels.
const times = [
  '12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM',
  '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'
];

function DailyEnergyChart({ selectedUsage, draggable = false, onDataChange }) {
  // Helper function chooses default dataset based on selectedUsage.
  const chooseDataset = () => {
    if (selectedUsage === "Night time") {
      return nightTimeData;
    } else if (selectedUsage === "24 Hours") {
      return twentyFourSevenData;
    } else {
      return dayTimeData;
    }
  };

  // Local state holds our chart data.
  const [chartData, setChartData] = useState({
    labels: times,
    datasets: [
      {
        label: 'Daily Energy Pattern',
        data: chooseDataset(),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(138,208,245,0.4)',
        borderWidth: 3,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#36A2EB',
      },
    ],
  });

  // If selectedUsage changes, update the dataset.
  useEffect(() => {
    setChartData(prev => ({
      ...prev,
      datasets: [{
        ...prev.datasets[0],
        data: chooseDataset(),
      }],
    }));
  }, [selectedUsage]);

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
        min: 0,
        max: 20,
        ticks: {
          display: false,  // This hides the y-axis tick labels
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
