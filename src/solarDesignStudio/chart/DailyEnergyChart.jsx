import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Default datasets
const nightTimeData = [16, 17, 17, 15, 5, 5, 4, 5, 4, 13, 15, 16];
const dayTimeData   = [2, 2, 3, 3, 16, 16, 18, 16, 17, 4, 4, 3];
const twentyFourSevenData = [9, 10, 9, 9, 9, 10, 10, 10, 10, 10, 11, 9];

// Time labels (from 12 AM to 10 PM, every 2 hours)
const times = [
  '12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM',
  '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'
];

function DailyEnergyChart({ selectedUsage }) {
  // Choose the dataset based on the selected usage
  let dataset;
  if (selectedUsage === "Night time") {
    dataset = nightTimeData;
  } else if (selectedUsage === "24 Hours") {
    dataset = twentyFourSevenData;
  } else {
    // Default to dayTimeData (for "Daytime" or if undefined)
    dataset = dayTimeData;
  }

  // Map times and kWh values to objects for the chart
  const chartData = times.map((time, index) => ({
    time,
    kwh: dataset[index],
  }));

  return (
    <div className="w-full h-50 flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
          />
          <YAxis tickMargin={0} width={30} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="kwh" 
            stroke="#36A2EB" 
            fill="#9AD0F5" 
            dot={{ r: 4, stroke: '#36A2EB', strokeWidth: 1, fill: '#fff' }} 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DailyEnergyChart;
