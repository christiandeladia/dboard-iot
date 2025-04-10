import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function MonthlyEnergyChart({ dailyConsumption, sliderMax }) {
  // Map daily consumption values to the chart's data format
  const data = dailyConsumption.map((value, index) => ({
    day: index + 1,
    kwh: value,
  }));

  return (
    <div className="w-full h-50 flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          {/* Set YAxis domain dynamically based on computed slider max */}
          <YAxis domain={[0, sliderMax]} tickMargin={0} width={30} />
          <Tooltip />
          <Bar dataKey="kwh" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyEnergyChart;
