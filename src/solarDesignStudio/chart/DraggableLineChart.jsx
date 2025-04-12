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
} from 'chart.js';
import dragDataPlugin from 'chartjs-plugin-dragdata';

// Register Chart.js elements and the drag plugin.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  dragDataPlugin
);

const DraggableLineChart = ({ selectedUsage, onDataChange, resetSignal }) => {
  // Default datasets.
  const dayTimeData = [2, 2, 3, 3, 16, 16, 18, 16, 17, 4, 4, 3];
  const nightTimeData = [16, 17, 17, 15, 5, 5, 4, 5, 4, 13, 15, 16];
  const twentyFourSevenData = [9, 10, 9, 9, 9, 10, 10, 10, 10, 10, 11, 9];

  // Time labels for each datapoint.
  const times = [
    '12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM',
    '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'
  ];

  // Decide on the default dataset based on selectedUsage.
  let defaultDataset;
  if (selectedUsage === "Night time") {
    defaultDataset = nightTimeData;
  } else if (selectedUsage === "24 Hours") {
    defaultDataset = twentyFourSevenData;
  } else {
    defaultDataset = dayTimeData;
  }

  // Initialize chart data state.
  const [chartData, setChartData] = useState({
    labels: times,
    datasets: [
      {
        label: 'Daily Energy Pattern',
        data: defaultDataset,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: true,
      },
    ],
  });

  // Reset the chart data whenever resetSignal or selectedUsage changes.
  useEffect(() => {
    let newDataset;
    if (selectedUsage === "Night time") {
      newDataset = nightTimeData;
    } else if (selectedUsage === "24 Hours") {
      newDataset = twentyFourSevenData;
    } else {
      newDataset = dayTimeData;
    }
    setChartData({
      labels: times,
      datasets: [
        {
          label: 'Daily Energy Pattern',
          data: newDataset,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: true,
        },
      ],
    });
  }, [resetSignal, selectedUsage, times, dayTimeData, nightTimeData, twentyFourSevenData]);

  // Chart.js options with the dragdata plugin configuration.
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
      },
      // Enable point dragging.
      dragData: {
        round: 1,
        dragX: false, // Only allow vertical dragging.
        // Optional: Code to handle start, during, and end of dragging.
        onDragStart: (e, datasetIndex, index, value) => {
          // For example, log if needed.
          // console.log('Drag started on index', index, 'value', value);
        },
        onDrag: (e, datasetIndex, index, value) => {
          // Can update in real time if you want.
        },
        onDragEnd: (e, datasetIndex, index, value) => {
          // Create a new data array with the updated value.
          const newData = [...chartData.datasets[0].data];
          newData[index] = value;
          setChartData((prev) => ({
            ...prev,
            datasets: [
              {
                ...prev.datasets[0],
                data: newData,
              },
            ],
          }));
          // Notify the parent of the new data.
          if (onDataChange) onDataChange(newData);
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 20,
      },
    },
  };

  return (
    <div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default DraggableLineChart;
